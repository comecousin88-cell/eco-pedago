import { moduleHref, modules, type ModuleInfo } from "@/content/modules";

/**
 * Progression par module, pour la grille « Les 12 modules » : pages lues,
 * page où reprendre, et page où reprendre sur tout le site. La progression
 * est celle des pages lues (gardée dans le navigateur) : rien d'autre à
 * enregistrer.
 */

export const NIVEAU_DANS_CHAQUE_MODULE = "Dans chaque module, choisissez votre niveau : Simple ou Approfondi.";

/** Toutes les pages d'un module : introduction, puis chaque section. */
export const pagesDuModule = (m: ModuleInfo) => [moduleHref(m.slug), ...m.sections.map((s) => moduleHref(m.slug, s.slug))];

export interface AvancementModule {
  faites: number;
  total: number;
  pourcent: number;
  etat: "a-faire" | "en-cours" | "termine";
  /** Page où commencer ou reprendre : la première ni lue ni passée (l'introduction si tout est lu). */
  cible: string;
}

export function avancementModule(m: ModuleInfo, lues: readonly string[], passees: readonly string[] = []): AvancementModule {
  const pages = pagesDuModule(m);
  const faites = pages.filter((h) => lues.includes(h)).length;
  const touche = faites > 0 || pages.some((h) => passees.includes(h));
  const etat = faites === pages.length ? "termine" : touche ? "en-cours" : "a-faire";
  return {
    faites,
    total: pages.length,
    pourcent: Math.round((faites / pages.length) * 100),
    etat,
    cible: pages.find((h) => !lues.includes(h) && !passees.includes(h)) ?? pages[0],
  };
}

export const moduleTermine = (m: ModuleInfo, lues: readonly string[]) => pagesDuModule(m).every((h) => lues.includes(h));

/** Nombre de modules terminés sur les douze. */
export const modulesTermines = (lues: readonly string[]) => modules.filter((m) => moduleTermine(m, lues)).length;

/**
 * Le bouton principal de la grille : « Commencer par le module 1 » tant que
 * rien n'est lu, sinon « Reprendre où j'en étais », qui mène au module de la
 * dernière page lue (ou, s'il est terminé, au premier module pas terminé).
 */
export function reprise(lues: readonly string[], passees: readonly string[] = []): { href: string; commence: boolean } {
  const derniere = [...lues].reverse().find((h) => modules.some((m) => pagesDuModule(m).includes(h)));
  if (!derniere) return { href: moduleHref(modules[0].slug), commence: false };
  const actuel = modules.find((m) => pagesDuModule(m).includes(derniere))!;
  const m = !moduleTermine(actuel, lues) ? actuel : (modules.find((x) => !moduleTermine(x, lues)) ?? actuel);
  return { href: avancementModule(m, lues, passees).cible, commence: true };
}
