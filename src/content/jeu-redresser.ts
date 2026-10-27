import type { Payeur } from "@/lib/game/mesures";

/**
 * Contenu du jeu « Redresser les comptes » : catégories affichées, règle de
 * popularité et cartes d'imprévus. Tout ce qui n'est pas une donnée observée
 * est une hypothèse, affichée dans « Comment fonctionne le jeu ? ».
 */

/** Les catégories du catalogue, dans l'ordre d'affichage : les catégories de data/mesures-budget.json y sont rangées. */
export const CATEGORIES_JEU: { id: string; titre: string; sens: "economies" | "recettes"; categories: string[] }[] = [
  { id: "retraites", titre: "Retraites", sens: "economies", categories: ["Retraites"] },
  { id: "sante", titre: "Santé", sens: "economies", categories: ["Santé"] },
  { id: "prestations", titre: "Prestations", sens: "economies", categories: ["Prestations sociales"] },
  { id: "etat", titre: "État et fonction publique", sens: "economies", categories: ["Fonction publique", "État et défense", "Éducation"] },
  { id: "collectivites", titre: "Collectivités", sens: "economies", categories: ["Collectivités"] },
  { id: "niches", titre: "Niches et aides aux entreprises", sens: "recettes", categories: ["Aides aux entreprises et niches"] },
  { id: "menages", titre: "Impôts des ménages", sens: "recettes", categories: ["Impôts sur les ménages"] },
  { id: "entreprises", titre: "Impôts des entreprises", sens: "recettes", categories: ["Impôts sur les entreprises"] },
  { id: "patrimoine", titre: "Patrimoine", sens: "recettes", categories: ["Fiscalité du patrimoine"] },
  { id: "tva", titre: "TVA et consommation", sens: "recettes", categories: ["TVA et consommation"] },
  { id: "fraude", titre: "Lutte contre la fraude", sens: "recettes", categories: ["Lutte contre la fraude"] },
];

/**
 * Règle de popularité, la même pour toutes les mesures :
 * points perdus = COEFFICIENT × montant (Md€) × (PLANCHER + part de la population touchée).
 * Le plancher dit que prendre de l'argent coûte toujours un peu, même à peu de gens.
 */
export const POPULARITE = {
  depart: 55,
  /** Sous ce seuil, le gouvernement tombe. */
  seuil: 25,
  coefficient: 0.25,
  plancher: 0.5,
  /** Points regagnés chaque année : l'opinion s'habitue aux mesures déjà prises. */
  recuperation: 4,
} as const;

/** Part de la population qui paie directement, par groupe (hypothèses). Plusieurs groupes s'additionnent, dans la limite de 100 %. */
export const PARTS_TOUCHEES: Record<Payeur, { part: number; pourquoi: string }> = {
  actifs: { part: 0.45, pourquoi: "salariés et indépendants" },
  "classes-moyennes": { part: 0.4, pourquoi: "ménages du milieu de la distribution des revenus" },
  "menages-modestes": { part: 0.3, pourquoi: "les trois premiers dixièmes de revenus" },
  collectivites: { part: 0.3, pourquoi: "les usagers des services locaux, qui sentent les économies" },
  retraites: { part: 0.25, pourquoi: "part des retraités dans la population adulte" },
  entreprises: { part: 0.2, pourquoi: "salariés, clients et actionnaires sur qui la mesure est répercutée" },
  "menages-aises": { part: 0.1, pourquoi: "le dixième le plus aisé" },
  fonctionnaires: { part: 0.08, pourquoi: "agents publics" },
};

/**
 * Sondages publics sur certaines mesures : affichés pour information, avec leur
 * commanditaire. Ils ne modifient pas la jauge : il n'en existe que pour
 * quelques mesures, et les appliquer avantagerait celles qui ont été sondées.
 */
export const SONDAGES: Record<string, { texte: string; source: { nom: string; url: string } }> = {
  "pat-plancher": {
    texte: "86 % des personnes interrogées se disaient favorables à un impôt minimal sur les très grandes fortunes.",
    source: { nom: "Ifop pour le Parti socialiste, 10 et 11 septembre 2025, 1 000 personnes", url: "https://www.ifop.com/en/article/french-support-for-various-left-wing-measures" },
  },
  "ret-64-reprise": {
    texte: "66 % des personnes interrogées étaient favorables à la suspension de la réforme des retraites à 64 ans.",
    source: { nom: "Ifop pour le Parti socialiste, 10 et 11 septembre 2025, 1 000 personnes", url: "https://www.ifop.com/en/article/french-support-for-various-left-wing-measures" },
  },
};

/** Un choix de réaction à un imprévu. */
export interface ChoixReaction {
  id: string;
  libelle: string;
  explication: string;
  /** Effort ponctuel supplémentaire cette année, en Md€ (économies d'urgence). */
  effortPonctuel?: number;
  popularite?: number;
  /** Écart de taux avec l'Allemagne, en points de base. */
  spread?: number;
  /** Retire la mesure qui a provoqué l'événement. */
  retirerMesure?: boolean;
}

export interface Imprevu {
  id: string;
  titre: string;
  texte: string;
  /** Choc sur la croissance nominale, en points. */
  croissance: number;
  /** Choc sur le taux de marché, en points. */
  taux: number;
  /** Choc sur l'écart avec l'Allemagne, en points de base. */
  spread: number;
  /** Dépense imprévue, en Md€. */
  cout: number;
  popularite: number;
  /** Page du site qui explique ce qui se passe. */
  lien: { href: string; titre: string };
  choix?: ChoixReaction[];
}

/**
 * Les imprévus tirés au sort, un par an. Des chocs imaginaires, d'une ampleur
 * inspirée de crises réelles. Deux cartes sont particulières : la grève, qui
 * suit une mesure touchant beaucoup de monde, et la revue d'une agence de
 * notation, dont l'issue dépend des budgets votés.
 */
export const IMPREVUS: Imprevu[] = [
  {
    id: "annee-calme",
    titre: "Une année sans surprise",
    texte: "L'économie suit sa tendance. Rien ne vient perturber le budget voté.",
    croissance: 0, taux: 0, spread: 0, cout: 0, popularite: 0,
    lien: { href: "/modules/deficit-et-dette/flux-et-stock/", titre: "Flux et stock : la baignoire" },
  },
  {
    id: "recession",
    titre: "Récession en Europe",
    texte: "La demande des pays voisins s'effondre : la croissance perd 1,5 point. Les recettes baissent et le chômage monte.",
    croissance: -1.5, taux: -0.2, spread: 5, cout: 0, popularite: -2,
    lien: { href: "/modules/boule-de-neige/formule/", titre: "L'effet boule de neige" },
    choix: [
      { id: "laisser", libelle: "Laisser filer le déficit cette année", explication: "Le déficit se creuse le temps de la crise ; la popularité ne bouge pas." },
      { id: "compenser", libelle: "Compenser par 5 Md€ d'économies d'urgence", explication: "Le déficit tient mieux, mais l'activité ralentit encore et le chômage monte.", effortPonctuel: 5, popularite: -4 },
    ],
  },
  {
    id: "reprise",
    titre: "Reprise plus forte que prévu",
    texte: "Les exportations et l'investissement repartent : la croissance dépasse les prévisions d'un point.",
    croissance: 1, taux: 0.1, spread: 0, cout: 0, popularite: 2,
    lien: { href: "/modules/les-bases/pib/", titre: "Le PIB" },
  },
  {
    id: "energie",
    titre: "Choc sur les prix de l'énergie",
    texte: "Le prix du gaz et du pétrole flambe. L'activité ralentit et l'État aide les ménages à payer leurs factures.",
    croissance: -0.8, taux: 0.2, spread: 5, cout: 8, popularite: -2,
    lien: { href: "/modules/fiscalite/blocage-prix/", titre: "Le blocage des prix" },
    choix: [
      { id: "aider", libelle: "Aider les ménages (8 Md€ cette année)", explication: "Les factures restent supportables ; le déficit se creuse d'autant cette année." },
      { id: "cibler", libelle: "Cibler l'aide sur les ménages modestes (3 Md€)", explication: "Le déficit se creuse moins, mais beaucoup de ménages paient plein tarif.", effortPonctuel: 5, popularite: -3 },
    ],
  },
  {
    id: "bce",
    titre: "La BCE relève ses taux",
    texte: "Pour freiner l'inflation en zone euro, la Banque centrale européenne relève ses taux : les nouveaux emprunts de l'État coûtent plus cher.",
    croissance: -0.3, taux: 0.8, spread: 0, cout: 0, popularite: 0,
    lien: { href: "/modules/emprunt-etat/taux-apparent/", titre: "Taux apparent et taux de marché" },
  },
  {
    id: "notation",
    titre: "Une agence revoit la note de la France",
    texte: "Une agence de notation examine les comptes de la France.",
    croissance: 0, taux: 0, spread: 0, cout: 0, popularite: 0,
    lien: { href: "/modules/emprunt-etat/spread-notation/", titre: "Spread, notation, courbe des taux" },
  },
  {
    id: "catastrophe",
    titre: "Catastrophe naturelle",
    texte: "Des inondations frappent plusieurs régions. L'État paie les secours et la reconstruction.",
    croissance: -0.2, taux: 0, spread: 0, cout: 6, popularite: 0,
    lien: { href: "/modules/deficit-et-dette/soldes/", titre: "Solde public, primaire, structurel" },
  },
  {
    id: "crise-politique",
    titre: "Crise politique",
    texte: "Le Parlement se déchire sur le budget. Les investisseurs doutent de la capacité du pays à tenir ses engagements.",
    croissance: -0.2, taux: 0, spread: 25, cout: 0, popularite: -3,
    lien: { href: "/modules/emprunt-etat/spread-notation/", titre: "Spread, notation, courbe des taux" },
  },
  {
    id: "detente",
    titre: "Détente sur les taux",
    texte: "L'inflation recule en Europe : la BCE baisse ses taux et les emprunts de l'État coûtent moins cher.",
    croissance: 0.2, taux: -0.5, spread: -5, cout: 0, popularite: 1,
    lien: { href: "/modules/banque-centrale/bce-eurosysteme/", titre: "La BCE et l'Eurosystème" },
  },
  {
    id: "defense",
    titre: "Effort de défense imprévu",
    texte: "La situation internationale se tend. Le Parlement vote une hausse rapide des dépenses militaires.",
    croissance: 0.1, taux: 0, spread: 0, cout: 5, popularite: 0,
    lien: { href: "/modules/dette-en-perspective/face-aux-budgets/", titre: "Face aux budgets de l'État" },
  },
];

/** La grève : tirée l'année où une mesure nouvelle touche plus d'un quart de la population. */
export const GREVE: Imprevu = {
  id: "greve",
  titre: "Grève contre une mesure",
  texte: "Une mesure de ton budget touche beaucoup de monde. Des manifestations et des grèves bloquent le pays.",
  croissance: -0.2, taux: 0, spread: 0, cout: 0, popularite: 0,
  lien: { href: "/modules/retraites/leviers/", titre: "Les trois leviers des retraites" },
  choix: [
    { id: "tenir", libelle: "Tenir bon", explication: "La mesure rapporte en entier, mais la popularité baisse.", popularite: -6 },
    { id: "reculer", libelle: "Reculer et retirer la mesure", explication: "Le calme revient, mais les marchés doutent de ta détermination.", popularite: 3, spread: 10, retirerMesure: true },
  ],
};

/** Part de la population touchée au-delà de laquelle une mesure peut déclencher une grève. */
export const SEUIL_GREVE = 0.25;
