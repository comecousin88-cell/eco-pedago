export type SectionStatus = "available" | "soon";

export interface NavItem {
  href: string;
  label: string;
  description: string;
  status: SectionStatus;
}

/**
 * Entrées du menu principal, dans l'ordre. Les rubriques « Idées reçues » et
 * « La France en 10 chiffres » s'ajouteront quand elles existeront.
 */
export const navItems: NavItem[] = [
  {
    href: "/modules/",
    label: "Modules",
    description:
      "Déficit, dette, emprunt, retraites, impôts : chaque notion expliquée en trois niveaux, avec des simulateurs.",
    status: "available",
  },
  {
    href: "/propositions/",
    label: "Les propositions au crible",
    description:
      "Annuler la dette, taxer les plus riches, retraite à 60 ans… Chaque proposition analysée, avec ses meilleurs arguments et un verdict.",
    status: "available",
  },
  {
    href: "/tableau-de-bord/",
    label: "Tableau de bord",
    description:
      "Les principaux indicateurs (taux, inflation, chômage, dette), avec leur source et leur date.",
    status: "soon",
  },
  {
    href: "/jeu-budget/",
    label: "Jeux",
    description:
      "Redresser les comptes de l'État en choisissant parmi des mesures chiffrées, puis tenir le budget pendant un mandat.",
    status: "soon",
  },
  {
    href: "/glossaire/",
    label: "Glossaire",
    description: "Tous les termes techniques du site, expliqués simplement.",
    status: "available",
  },
];
