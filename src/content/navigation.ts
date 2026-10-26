import { rubriqueDe, rubriques } from "./rubriques";

/**
 * Entrées du menu principal : les cinq rubriques, puis deux accès directs très
 * demandés (le tableau de bord et le glossaire). La rubrique en cours est
 * repérée par préfixe d'adresse (src/content/rubriques.ts) ; un accès direct
 * l'emporte sur sa propre page. « Sources et méthode » est dans le pied de page.
 * La recherche n'a plus de bouton dans la barre : raccourci « / », entrée du
 * menu mobile et barre en haut de la page Glossaire.
 */
export interface NavItem {
  id: string;
  href: string;
  label: string;
  /** Intitulé raccourci affiché dans la barre quand la place manque (nom complet au survol). */
  court?: string;
  description: string;
}

/** Accès directs, après les rubriques. */
export const raccourcis: NavItem[] = [
  {
    id: "tableau-de-bord",
    href: "/tableau-de-bord/",
    label: "Tableau de bord",
    court: "Indicateurs",
    description: "Tableau de bord : les sept indicateurs à suivre, avec leur source et leur historique.",
  },
  { id: "glossaire", href: "/glossaire/", label: "Glossaire", description: "Glossaire : les termes techniques expliqués, et la recherche dans tout le site." },
];

const [accueil, comprendre, decrypter, actu, jouer] = rubriques;

/** Ordre du menu : Accueil, Comprendre, Décrypter, L'actu, Tableau de bord, Jouer, Glossaire. */
export const navItems: NavItem[] = [accueil, comprendre, decrypter, actu, raccourcis[0], jouer, raccourcis[1]];

/** Entrée du menu à mettre en évidence pour une adresse. */
export function entreeActive(pathname: string): string | undefined {
  const c = pathname.endsWith("/") ? pathname : `${pathname}/`;
  return raccourcis.find((r) => c.startsWith(r.href))?.id ?? rubriqueDe(pathname)?.id;
}
