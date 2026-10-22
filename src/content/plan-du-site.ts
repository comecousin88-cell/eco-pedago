import { moduleHref, modules } from "./modules";
import { propositionHref, propositions } from "./propositions";

/**
 * Toutes les pages publiques du site, pour sitemap.xml. Les anciennes
 * adresses qui redirigent (/modules/, /jeux/, /jeu-budget/, /concepts/) et la
 * page de travail (/atelier/) n'y figurent pas.
 */
export const PAGES_FIXES = [
  "/",
  "/comprendre/",
  "/decrypter/",
  "/actu/",
  "/jouer/",
  "/la-france-en-10-chiffres/",
  "/glossaire/",
  "/tableau-de-bord/",
  "/propositions/",
  "/idees-recues/",
  "/jeux/redresser-les-comptes/",
  "/jeux/ministre-des-finances/",
  "/sources/",
];

export function pagesDuSite(): string[] {
  return [
    ...PAGES_FIXES,
    ...modules.filter((m) => m.status === "available").flatMap((m) => [moduleHref(m.slug), ...m.sections.map((s) => moduleHref(m.slug, s.slug))]),
    ...propositions.filter((p) => p.contenu).map((p) => propositionHref(p.slug)),
  ];
}
