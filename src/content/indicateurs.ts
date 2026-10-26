import type { Frequence } from "@/lib/indicateurs";

/**
 * Les sept indicateurs du tableau de bord (module 7). Chaque indicateur lit
 * une série de data/*.json ; le texte explique ce qu'il mesure et renvoie vers
 * la page du site qui détaille le mécanisme. Les données sont mises à jour à
 * automatiquement (scripts/maj-indicateurs.ts) ; la date est affichée sur chaque carte.
 */

export interface Indicateur {
  id: string;
  titre: string;
  /** Identifiant de la série dans data/*.json. */
  serie: string;
  frequence: Frequence;
  /** Nature du chiffre, dite avec sa période : moyenne du mois (taux de marché) ou évolution sur un an (inflation). */
  nature?: "moyenne" | "sur-un-an";
  /** Unité affichée après la valeur. */
  unite: string;
  decimales: number;
  /**
   * Valeur plus récente que la série (donnée infra-annuelle ou quotidienne),
   * affichée à la place du dernier point si elle existe dans data/*.json.
   */
  valeurRecente?: string;
  /** Série de comparaison affichée sur la courbe (même indicateur, autre pays ou zone). */
  comparaison?: { serie: string; libelle: string };
  /**
   * Comparaison sur un autre indicateur, affichée en texte seulement (jamais sur
   * la même courbe) : l'IPCH européen à côté de l'IPC de l'Insee, par exemple.
   */
  comparaisonTexte?: { titre: string; series: { serie: string; libelle: string }[] };
  /** Ce que mesure l'indicateur, en deux ou trois phrases, sans chiffre daté. */
  explication: string;
  lien: { href: string; libelle: string };
}

/** Page officielle où lire le taux à 10 ans du jour (le site affiche la moyenne mensuelle de la BCE). */
export const TAUX_DU_JOUR_BDF = "https://www.banque-france.fr/fr/statistiques/taux-et-cours";

export const indicateurs: Indicateur[] = [
  {
    id: "taux-depot",
    titre: "Taux de dépôt de la BCE",
    serie: "bce.taux-depot",
    frequence: "paliers",
    unite: "%",
    decimales: 2,
    explication:
      "Le taux auquel la BCE rémunère l'argent que les banques laissent chez elle. C'est son principal levier : en le relevant, elle rend le crédit plus cher pour freiner l'inflation ; en l'abaissant, elle soutient l'activité.",
    lien: { href: "/modules/banque-centrale/bce-eurosysteme/", libelle: "La BCE et l'Eurosystème" },
  },
  {
    id: "oat10",
    titre: "Taux d'emprunt de l'État à 10 ans",
    serie: "marches.taux10-france",
    frequence: "mensuelle",
    nature: "moyenne",
    valeurRecente: "marches.taux10-france-jour",
    unite: "%",
    decimales: 2,
    explication:
      "Le rendement des obligations de l'État français à 10 ans, en moyenne sur le mois. C'est, à peu près, le taux auquel l'État emprunte aujourd'hui pour dix ans : il se répercute peu à peu sur toute la dette, à mesure qu'elle est renouvelée.",
    lien: { href: "/modules/emprunt-etat/prix-et-taux/", libelle: "Quand les taux montent, le prix baisse" },
  },
  {
    id: "spread",
    titre: "Écart de taux avec l'Allemagne",
    serie: "marches.spread-france-allemagne",
    frequence: "mensuelle",
    nature: "moyenne",
    unite: "points de base",
    decimales: 0,
    explication:
      "La différence entre le taux à 10 ans de la France et celui de l'Allemagne, en centièmes de point. Elle mesure le supplément que les investisseurs demandent pour prêter à la France plutôt qu'à l'emprunteur jugé le plus sûr de la zone euro.",
    lien: { href: "/modules/emprunt-etat/spread-notation/", libelle: "Spread, notation, courbe des taux" },
  },
  {
    id: "inflation",
    titre: "Inflation",
    serie: "ind.inflation-ipc-fr",
    frequence: "mensuelle",
    nature: "sur-un-an",
    unite: "%",
    decimales: 1,
    comparaisonTexte: {
      titre: "Pour comparer en Europe",
      series: [
        { serie: "ind.inflation-fr", libelle: "France" },
        { serie: "ind.inflation-za", libelle: "zone euro" },
      ],
    },
    explication:
      "La hausse des prix à la consommation sur un an, mesurée par l'indice des prix à la consommation (IPC) de l'Insee, la référence en France. Pour comparer les pays européens, on utilise l'indice harmonisé (IPCH), calculé un peu différemment. La BCE vise 2 % à moyen terme pour l'ensemble de la zone euro.",
    lien: { href: "/modules/les-bases/inflation-taux-reels/", libelle: "Inflation et taux réels" },
  },
  {
    id: "chomage",
    titre: "Taux de chômage",
    serie: "ind.chomage",
    frequence: "trimestrielle",
    unite: "%",
    decimales: 1,
    explication:
      "La part des personnes actives qui cherchent un emploi sans en avoir, au sens du Bureau international du travail. Moins de chômage, c'est plus de cotisations et d'impôts, et moins d'allocations.",
    lien: { href: "/modules/comparaisons/emploi-croissance/", libelle: "Croissance et chômage" },
  },
  {
    id: "dette",
    titre: "Dette publique",
    serie: "dette.historique-pib",
    frequence: "annuelle",
    unite: "% du PIB",
    decimales: 1,
    valeurRecente: "dette.ratio-pib",
    explication:
      "La dette de l'ensemble des administrations publiques au sens de Maastricht, rapportée à la richesse produite en un an. La valeur affichée est la plus récente publiée par l'Insee, trimestrielle ; la courbe montre les fins d'année.",
    lien: { href: "/modules/deficit-et-dette/histoire/", libelle: "La dette depuis 1978" },
  },
  {
    id: "deficit",
    titre: "Solde public",
    serie: "deficit.historique-pib",
    frequence: "annuelle",
    unite: "% du PIB",
    decimales: 1,
    explication:
      "La différence entre les recettes et les dépenses de toutes les administrations publiques sur une année, rapportée au PIB. Négative, c'est un déficit, qui s'ajoute à la dette. Il n'est mesuré qu'une fois par an.",
    lien: { href: "/modules/deficit-et-dette/soldes/", libelle: "Solde public, primaire, structurel" },
  },
];
