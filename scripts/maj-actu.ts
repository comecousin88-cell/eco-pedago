/**
 * Publications des sources officielles, pour le fil « L'actu ».
 *
 *   npm run maj:actu
 *   npm run maj:actu -- --depuis 2026-09-01   (rattrapage : pages suivantes des listes)
 *
 * Lit les flux et les listes de communiqués de l'Insee, de la BCE, de la
 * Banque de France, d'Eurostat, de la Cour des comptes, du Haut Conseil des
 * finances publiques, de l'Assemblée nationale et du Sénat, garde les
 * publications qui portent sur les thèmes du site (src/lib/actu/flux.ts) et
 * les inscrit dans data/actu-flux.json : titre, date, lien vers l'original et
 * page du site qui explique le sujet. Ce sont des faits (une publication a eu
 * lieu) : ils sont publiés automatiquement. Les résumés et les explications,
 * eux, passent par une demande de mise à jour à valider.
 * Si une source ne répond pas, ses éléments déjà connus sont conservés.
 */
import { appendFileSync, readFileSync, writeFileSync } from "node:fs";
import { fusionnerFlux, lireSource, reclasser, SOURCES_FLUX, trierFlux, type EntreeFlux } from "../src/lib/actu/flux.ts";

const CHEMIN = new URL("../data/actu-flux.json", import.meta.url);
const maintenant = new Date().toISOString();
const i = process.argv.indexOf("--depuis");
const depuis = i > 0 ? process.argv[i + 1] : undefined;
if (depuis !== undefined && !/^\d{4}-\d{2}-\d{2}$/.test(depuis)) throw new Error("--depuis attend une date AAAA-MM-JJ");

interface FichierFlux {
  description: string;
  derniere_verification: string;
  sources: Record<string, { statut: "ok" | "echec"; message?: string }>;
  entrees: EntreeFlux[];
}

/**
 * Publications nationales que la lecture automatique ne peut pas rattraper
 * (la Cour des comptes interdit aux robots ses listes paginées) : ajoutées une
 * fois, au rattrapage, après lecture de la page de la publication.
 */
const AJOUTS_RATTRAPAGE = [
  {
    source: "cour-des-comptes" as const,
    titre: "La situation financière de la sécurité sociale : un redressement impératif en 2027",
    lien: "https://www.ccomptes.fr/fr/publications/la-situation-financiere-de-la-securite-sociale-un-redressement-imperatif-en-2027",
    date: "2026-10-20T00:00:00Z",
  },
];

/** Texte d'une réponse, dans l'encodage annoncé par le document (le Sénat publie en ISO-8859-15). */
async function texte(r: Response): Promise<string> {
  const octets = new Uint8Array(await r.arrayBuffer());
  const debut = new TextDecoder("latin1").decode(octets.slice(0, 200));
  return new TextDecoder(/encoding=["']([^"']+)["']/i.exec(debut)?.[1] ?? "utf-8").decode(octets);
}

const actuel: FichierFlux = JSON.parse(readFileSync(CHEMIN, "utf8"));
const nouveaux: EntreeFlux[] = [];
const lignes = [`Flux d'actualités du ${maintenant.slice(0, 10)}${depuis ? ` (rattrapage depuis le ${depuis})` : ""}`];

for (const s of SOURCES_FLUX) {
  try {
    let lus = 0;
    let gardes = 0;
    for (const url of [...s.urls, ...(depuis ? (s.rattrapage ?? []) : [])]) {
      const r = await fetch(url, { headers: { "User-Agent": "ecoclair (fil d'actualite)" }, signal: AbortSignal.timeout(60_000) });
      if (!r.ok) throw new Error(`HTTP ${r.status} (${url})`);
      const items = lireSource(s, await texte(r));
      if (items.length === 0) throw new Error(`page vide ou illisible (${url})`);
      const tries = trierFlux(s, items).filter((e) => !depuis || e.date >= depuis);
      lus += items.length;
      gardes += tries.length;
      nouveaux.push(...tries);
    }
    actuel.sources[s.id] = { statut: "ok" };
    lignes.push(`✓ ${s.nom} : ${lus} éléments lus, ${gardes} sur les thèmes du site`);
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    actuel.sources[s.id] = { statut: "echec", message };
    lignes.push(`✗ ${s.nom} : ${message} (éléments déjà connus conservés)`);
  }
}

if (depuis) {
  for (const { source, ...item } of AJOUTS_RATTRAPAGE) nouveaux.push(...trierFlux({ id: source }, [{ ...item, resume: "" }]));
}

const avant = new Set(actuel.entrees.map((e) => e.id));
// Les entrées déjà connues sont triées de nouveau : une règle plus stricte ou plus juste s'applique aussi à elles.
// Au rattrapage, le fil repart de la date demandée.
const connues = actuel.entrees.flatMap(reclasser).filter((e) => !depuis || e.date >= depuis);
actuel.entrees = fusionnerFlux(connues, nouveaux, maintenant);
actuel.derniere_verification = maintenant;
writeFileSync(CHEMIN, `${JSON.stringify(actuel, null, 2)}\n`, "utf8");
lignes.push(`${actuel.entrees.filter((e) => !avant.has(e.id)).length} nouvelle(s) entrée(s) ; ${actuel.entrees.length} au total.`);

const resume = lignes.join("\n");
console.log(resume);
if (process.env.GITHUB_STEP_SUMMARY) appendFileSync(process.env.GITHUB_STEP_SUMMARY, `${resume.replaceAll("\n", "\n\n")}\n`);
