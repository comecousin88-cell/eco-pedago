export type SectionStatus = "available" | "soon";

export interface NavItem {
  href: string;
  label: string;
  description: string;
  status: SectionStatus;
}

/** Les trois grandes parties du site, dans l'ordre du menu. */
export const navItems: NavItem[] = [
  {
    href: "/concepts",
    label: "Comprendre",
    description:
      "Une page par notion, expliquée sans jargon, avec un simulateur pour tester par vous-même.",
    status: "available",
  },
  {
    href: "/tableau-de-bord",
    label: "Tableau de bord",
    description:
      "Les vrais chiffres de l'économie (taux BCE, inflation, chômage, dette) mis à jour automatiquement.",
    status: "soon",
  },
  {
    href: "/jeu-budget",
    label: "Gère le budget",
    description:
      "Prenez les commandes de l'État : fixez dépenses, impôts et taux, puis regardez l'année défiler.",
    status: "soon",
  },
];
