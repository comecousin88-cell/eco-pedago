/**
 * Vérifie, après la construction du site, qu'aucun lien interne ne mène à
 * une page absente (erreur 404).
 *
 *   npm run build            (lancé automatiquement après next build)
 *   npm run verifier:liens
 *
 * Lit toutes les pages de out/, relève leurs liens internes et échoue si l'un
 * d'eux ne mène à rien : la construction (et donc la mise en ligne) s'arrête.
 */
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { liensCasses } from "../src/lib/liens.ts";

const out = new URL("../out/", import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1");

function fichiers(dossier: string): string[] {
  return readdirSync(dossier).flatMap((f) => {
    const p = join(dossier, f);
    return statSync(p).isDirectory() ? fichiers(p) : [relative(out, p).replaceAll("\\", "/")];
  });
}

const tous = fichiers(out);
const pages = new Map(tous.filter((f) => f.endsWith(".html")).map((f) => [f, readFileSync(join(out, f), "utf8")]));
const casses = liensCasses(pages, new Set(tous));

if (casses.length > 0) {
  console.error(`✗ ${casses.length} lien(s) interne(s) cassé(s) :\n${casses.slice(0, 50).join("\n")}`);
  process.exit(1);
}
console.log(`✓ Liens internes : ${pages.size} pages vérifiées, aucun lien cassé.`);
