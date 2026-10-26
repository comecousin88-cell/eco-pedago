/**
 * Fil d'Ariane et bouton de retour, calculés ici pour être testés : le fil
 * commence toujours par l'accueil et ne contient jamais deux fois le même
 * libellé à la suite (« Les bases › Les bases » : on garde le plus précis, le
 * dernier) ; le bouton de retour dit où il ramène.
 */

import { moduleHref, type ModuleInfo } from "./modules";
import { themeDuModule, themeHref } from "./rubriques";

export interface Etape {
  label: string;
  href?: string;
}

export function etapesFil(etapes: Etape[]): Etape[] {
  const toutes: Etape[] = [{ label: "Accueil", href: "/" }, ...etapes];
  return toutes.filter((e, i) => i === toutes.length - 1 || e.label !== toutes[i + 1].label);
}

/** Libellé du bouton de retour selon la page où il ramène : celui de la liste, tel que le lecteur la connaît. */
const LIBELLES_RETOUR: Record<string, string> = {
  "/comprendre/": "Les 12 modules",
  "/propositions/": "Toutes les propositions",
  "/actu/": "L'actu",
  "/glossaire/": "Le glossaire",
  "/decrypter/": "Décrypter",
  "/jouer/": "Jouer",
};

/**
 * Où ramène le bouton de retour : l'étape précédente qui a un lien, avec un
 * libellé explicite. Pas de bouton quand la seule page au-dessus est l'accueil
 * (le menu y ramène déjà).
 */
export function etapeRetour(etapes: Etape[], retour?: Etape): Etape | undefined {
  if (retour) return retour;
  const fil = etapesFil(etapes);
  const parent = fil.slice(0, -1).reverse().find((e) => e.href);
  if (!parent?.href || parent.href === "/") return undefined;
  const base = parent.href.split("#")[0];
  return { label: LIBELLES_RETOUR[base] ?? parent.label, href: parent.href };
}

/** Fil d'Ariane d'une page de module : Comprendre › partie › module › section. */
export function filModule(module: ModuleInfo, section?: string): Etape[] {
  const theme = themeDuModule(module.slug);
  const s = section ? module.sections.find((x) => x.slug === section) : undefined;
  return [
    { label: "Comprendre", href: "/comprendre/" },
    { label: theme.titre, href: themeHref(theme) },
    s ? { label: module.title, href: moduleHref(module.slug) } : { label: module.title },
    ...(s ? [{ label: s.title }] : []),
  ];
}
