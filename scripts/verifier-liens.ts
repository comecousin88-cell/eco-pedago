/**
 * Vérifie, après la construction du site, que chaque lien mène bien quelque part.
 *
 *   npm run build            (lancé automatiquement après next build)
 *   npm run verifier:liens
 *   VERIFIER_LIENS_EXTERNES=non npm run verifier:liens   (liens internes seulement, hors ligne)
 *
 * 1. Liens internes : chacun doit mener à une page ou un fichier de out/.
 * 2. Liens externes (sources, originaux des publications) : chacun est ouvert ;
 *    une page introuvable (404) ou une redirection vers la page d'accueil du
 *    site fait échouer la vérification. Un refus des robots (403) ou une panne
 *    passagère est seulement signalé, à vérifier dans un navigateur.
 * En cas d'échec, la construction (et donc la mise en ligne) s'arrête.
 */
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { liensCasses, liensExternes, verdictLien } from "../src/lib/liens.ts";

const out = new URL("../out/", import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1");
const UA = "Mozilla/5.0 (compatible; ecoclair-verification-des-liens)";

function fichiers(dossier: string): string[] {
  return readdirSync(dossier).flatMap((f) => {
    const p = join(dossier, f);
    return statSync(p).isDirectory() ? fichiers(p) : [relative(out, p).replaceAll("\\", "/")];
  });
}

const tous = fichiers(out);
const pages = new Map(tous.filter((f) => f.endsWith(".html")).map((f) => [f, readFileSync(join(out, f), "utf8")]));
let echec = false;

const casses = liensCasses(pages, new Set(tous));
if (casses.length > 0) {
  console.error(`✗ ${casses.length} lien(s) interne(s) cassé(s) :\n${casses.slice(0, 50).join("\n")}`);
  echec = true;
} else {
  console.log(`✓ Liens internes : ${pages.size} pages vérifiées, aucun lien cassé.`);
}

if (process.env.VERIFIER_LIENS_EXTERNES !== "non") {
  // Chaque lien externe, avec une page où il apparaît.
  const ou = new Map<string, string>();
  for (const [page, html] of pages) for (const lien of liensExternes(html)) if (!ou.has(lien)) ou.set(lien, page);

  async function ouvrir(lien: string): Promise<{ statut: number; finale: string }> {
    try {
      const r = await fetch(lien, { headers: { "User-Agent": UA, Accept: "text/html,application/xhtml+xml,*/*" }, redirect: "follow", signal: AbortSignal.timeout(30_000) });
      await r.body?.cancel();
      return { statut: r.status, finale: r.url || lien };
    } catch {
      return { statut: 0, finale: lien };
    }
  }

  const liens = [...ou.keys()];
  const resultats: { lien: string; etat: string; raison?: string }[] = [];
  // Huit requêtes à la fois, pour ne pas solliciter les sites.
  for (let i = 0; i < liens.length; i += 8) {
    const lot = liens.slice(i, i + 8);
    const reponses = await Promise.all(lot.map(ouvrir));
    lot.forEach((lien, k) => resultats.push({ lien, ...verdictLien(lien, reponses[k].statut, reponses[k].finale) }));
  }
  const externesCasses = resultats.filter((r) => r.etat === "casse");
  const avertissements = resultats.filter((r) => r.etat === "avertissement");
  for (const a of avertissements) console.warn(`• ${a.lien} : ${a.raison} (page ${ou.get(a.lien)})`);
  if (externesCasses.length > 0) {
    console.error(`✗ ${externesCasses.length} lien(s) externe(s) cassé(s) :\n${externesCasses.map((c) => `${c.lien} : ${c.raison} (page ${ou.get(c.lien)})`).join("\n")}`);
    echec = true;
  } else {
    console.log(`✓ Liens externes : ${liens.length} vérifiés, aucun cassé${avertissements.length ? ` (${avertissements.length} à vérifier dans un navigateur)` : ""}.`);
  }
}

if (echec) process.exit(1);
