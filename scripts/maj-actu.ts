/**
 * Flux d'actualités des sources officielles, pour le fil « L'actu ».
 *
 *   npm run maj:actu
 *
 * Lit les flux RSS de l'Insee, de la BCE et de la Cour des comptes, garde les
 * publications qui portent sur les sujets du site (src/lib/actu/flux.ts) et
 * les inscrit dans data/actu-flux.json : titre, date, lien vers l'original et
 * page du site qui explique le sujet. Ce sont des faits (une publication a eu
 * lieu) : ils sont publiés automatiquement. Les explications « Ce que ça veut
 * dire », elles, passent par une demande de mise à jour à valider.
 * Si une source ne répond pas, ses éléments déjà connus sont conservés.
 */
import { appendFileSync, readFileSync, writeFileSync } from "node:fs";
import { fusionnerFlux, lireRss, SOURCES_FLUX, trierFlux, type EntreeFlux } from "../src/lib/actu/flux.ts";

const CHEMIN = new URL("../data/actu-flux.json", import.meta.url);
const maintenant = new Date().toISOString();

interface FichierFlux {
  description: string;
  derniere_verification: string;
  sources: Record<string, { statut: "ok" | "echec"; message?: string }>;
  entrees: EntreeFlux[];
}

const actuel: FichierFlux = JSON.parse(readFileSync(CHEMIN, "utf8"));
const nouveaux: EntreeFlux[] = [];
const lignes = [`Flux d'actualités du ${maintenant.slice(0, 10)}`];

for (const s of SOURCES_FLUX) {
  try {
    const r = await fetch(s.url, { headers: { "User-Agent": "ecoclair (fil d'actualite)" }, signal: AbortSignal.timeout(60_000) });
    if (!r.ok) throw new Error(`HTTP ${r.status}`);
    const items = lireRss(await r.text());
    if (items.length === 0) throw new Error("flux vide ou illisible");
    const gardes = trierFlux(s, items);
    nouveaux.push(...gardes);
    actuel.sources[s.id] = { statut: "ok" };
    lignes.push(`✓ ${s.nom} : ${items.length} éléments lus, ${gardes.length} sur les sujets du site`);
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    actuel.sources[s.id] = { statut: "echec", message };
    lignes.push(`✗ ${s.nom} : ${message} (éléments déjà connus conservés)`);
  }
}

const avant = new Set(actuel.entrees.map((e) => e.id));
actuel.entrees = fusionnerFlux(actuel.entrees, nouveaux, maintenant);
actuel.derniere_verification = maintenant;
writeFileSync(CHEMIN, `${JSON.stringify(actuel, null, 2)}\n`, "utf8");
lignes.push(`${actuel.entrees.filter((e) => !avant.has(e.id)).length} nouvelle(s) entrée(s) ; ${actuel.entrees.length} au total.`);

const resume = lignes.join("\n");
console.log(resume);
if (process.env.GITHUB_STEP_SUMMARY) appendFileSync(process.env.GITHUB_STEP_SUMMARY, `${resume.replaceAll("\n", "\n\n")}\n`);
