export type SectionStatus = "available" | "soon";

export interface NavItem {
  href: string;
  label: string;
  /** Intitulé court du menu sur ordinateur ; le nom complet reste au survol et pour les lecteurs d'écran. */
  court?: string;
  description: string;
  status: SectionStatus;
}

/**
 * Entrées du menu principal, dans l'ordre. Sur ordinateur, le menu tient sur
 * une ligne grâce aux intitulés courts ; le menu mobile affiche les noms
 * complets. « Sources et méthode » est accessible depuis le pied de page.
 */
export const navItems: NavItem[] = [
  {
    href: "/",
    label: "Accueil",
    description: "La page d'accueil : parcours, propositions phares et raccourcis.",
    status: "available",
  },
  {
    href: "/la-france-en-10-chiffres/",
    label: "La France en 10 chiffres",
    court: "10 chiffres",
    description: "La situation des finances publiques en un coup d'œil, chiffres sourcés et datés.",
    status: "available",
  },
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
    court: "Au crible",
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
