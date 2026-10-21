export type SectionStatus = "available" | "soon";

export interface NavItem {
  href: string;
  label: string;
  description: string;
  status: SectionStatus;
}

/**
 * Entrées du menu principal, dans l'ordre. « La France en 10 chiffres » et
 * « Sources et méthode » sont accessibles depuis l'accueil et le pied de page.
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
      "Les sept indicateurs à suivre (taux, inflation, chômage, dette, déficit), avec leur source et leur date.",
    status: "available",
  },
  {
    href: "/jeux/",
    label: "Jeux",
    description:
      "Redresser les comptes de l'État en choisissant parmi des mesures chiffrées, puis tenir le budget pendant un mandat.",
    status: "available",
  },
  {
    href: "/idees-recues/",
    label: "Idées reçues",
    description: "Dix-huit affirmations qu'on entend souvent, vérifiées chiffres à l'appui.",
    status: "available",
  },
  {
    href: "/glossaire/",
    label: "Glossaire",
    description: "Tous les termes techniques du site, expliqués simplement.",
    status: "available",
  },
];
