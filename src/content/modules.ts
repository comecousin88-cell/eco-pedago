/**
 * Registre des modules : la seule liste à tenir à jour. Le sommaire, le fil
 * d'Ariane, la navigation précédent/suivant et la progression la lisent.
 */

export type ModuleStatus = "available" | "soon";

export interface ModuleSection {
  slug: string;
  title: string;
}

export interface ModuleInfo {
  slug: string;
  /** Numéro affiché (« 0 », « 5 bis »…). */
  number: string;
  title: string;
  /** La question que se pose le lecteur. */
  question: string;
  summary: string;
  /** Couleur d'accent : une teinte lisible sur fond clair, une sur fond sombre. */
  color: { light: string; dark: string };
  sections: ModuleSection[];
  status: ModuleStatus;
}

export const modules: ModuleInfo[] = [
  {
    slug: "les-bases",
    number: "0",
    title: "Les bases",
    question: "D'où vient l'argent public, et où va-t-il ?",
    summary:
      "PIB, recettes et dépenses publiques, qui dépense quoi, inflation et taux réels : le vocabulaire de départ.",
    color: { light: "#0369a1", dark: "#7dd3fc" },
    sections: [
      { slug: "pib", title: "Le PIB" },
      { slug: "recettes-depenses", title: "Recettes et dépenses publiques" },
      { slug: "administrations", title: "Les quatre administrations publiques" },
      { slug: "inflation-taux-reels", title: "Inflation et taux réels" },
    ],
    status: "available",
  },
  {
    slug: "deficit-et-dette",
    number: "1",
    title: "Déficit et dette",
    question: "Quelle différence entre le déficit et la dette ?",
    summary:
      "Le robinet et la baignoire : comment chaque année de déficit s'ajoute à la dette, et où en est la France.",
    color: { light: "#be123c", dark: "#fda4af" },
    sections: [
      { slug: "flux-et-stock", title: "Flux et stock : la baignoire" },
      { slug: "soldes", title: "Solde public, primaire, structurel" },
      { slug: "maastricht", title: "La dette « au sens de Maastricht »" },
      { slug: "composition", title: "Qui porte la dette ?" },
      { slug: "histoire", title: "La dette depuis 1978" },
      { slug: "europe", title: "La France et ses voisins" },
    ],
    status: "available",
  },
  {
    slug: "emprunt-etat",
    number: "2",
    title: "Comment l'État emprunte",
    question: "Comment l'État trouve-t-il l'argent qui lui manque ?",
    summary:
      "OAT, BTF, adjudications, prix et taux : la mécanique de l'emprunt et pourquoi une hausse des taux met des années à coûter.",
    color: { light: "#4338ca", dark: "#a5b4fc" },
    sections: [
      { slug: "aft-adjudications", title: "L'Agence France Trésor et les adjudications" },
      { slug: "oat-btf", title: "OAT et BTF" },
      { slug: "prix-et-taux", title: "Quand les taux montent, le prix baisse" },
      { slug: "taux-apparent", title: "Taux apparent et taux de marché" },
      { slug: "detenteurs", title: "Qui détient la dette ?" },
      { slug: "spread-notation", title: "Spread, notation, courbe des taux" },
    ],
    status: "soon",
  },
  {
    slug: "boule-de-neige",
    number: "3",
    title: "L'effet boule de neige",
    question: "Pourquoi la dette peut-elle grossir toute seule ?",
    summary:
      "Taux d'intérêt contre croissance : la formule qui décide si la dette se stabilise ou s'emballe, avec un simulateur.",
    color: { light: "#c2410c", dark: "#fdba74" },
    sections: [
      { slug: "formule", title: "La formule" },
      { slug: "simulateur", title: "Le simulateur" },
      { slug: "cercles", title: "Cercle vicieux, cercle vertueux" },
      { slug: "cout-opportunite", title: "Ce que coûtent les intérêts" },
      { slug: "chiffrage", title: "Chiffrer un programme" },
    ],
    status: "soon",
  },
  {
    slug: "banque-centrale",
    number: "4",
    title: "La banque centrale et la dette",
    question: "La banque centrale peut-elle effacer la dette ?",
    summary:
      "BCE, Banque de France, rachats de dette, bilan d'une banque centrale et cadre européen, avec le cas grec.",
    color: { light: "#7e22ce", dark: "#d8b4fe" },
    sections: [
      { slug: "bce-eurosysteme", title: "La BCE et l'Eurosystème" },
      { slug: "qe", title: "Les rachats de dette" },
      { slug: "bilan-bdf", title: "Le bilan de la Banque de France" },
      { slug: "cadre-juridique", title: "Ce que dit le droit européen" },
      { slug: "signal-marches", title: "Le signal envoyé aux marchés" },
      { slug: "grece", title: "La crise grecque" },
    ],
    status: "soon",
  },
  {
    slug: "retraites",
    number: "5",
    title: "Les retraites",
    question: "Qui paie ma retraite ?",
    summary:
      "Répartition et capitalisation, démographie, les trois leviers d'équilibre et un simulateur pour les régler.",
    color: { light: "#047857", dark: "#6ee7b7" },
    sections: [
      { slug: "trois-etages", title: "Les trois étages" },
      { slug: "repartition-capitalisation", title: "Répartition ou capitalisation" },
      { slug: "demographie", title: "Combien d'actifs pour un retraité ?" },
      { slug: "leviers", title: "Les trois leviers" },
      { slug: "notions", title: "Trimestres, décote, taux de remplacement" },
      { slug: "transition", title: "Le coût d'une transition" },
    ],
    status: "soon",
  },
  {
    slug: "fiche-de-paie",
    number: "5 bis",
    title: "Ma fiche de paie",
    question: "Du coût employeur à ce qui reste en poche",
    summary:
      "Entrez un salaire brut et suivez chaque euro : cotisations, CSG, impôt, TVA, et ce qui finance les retraites.",
    color: { light: "#0f766e", dark: "#5eead4" },
    sections: [],
    status: "soon",
  },
  {
    slug: "fiscalite",
    number: "6",
    title: "Fiscalité et financement",
    question: "Qui paie les impôts, et combien rapporte chacun ?",
    summary:
      "Assiette, taux, rendement : pourquoi un taux élevé sur une petite base rapporte peu, et ce que rapporterait de taxer les plus riches.",
    color: { light: "#a16207", dark: "#fde047" },
    sections: [
      { slug: "qui-paie", title: "Qui paie quoi ?" },
      { slug: "assiette-rendement", title: "Assiette, taux, rendement" },
      { slug: "taxer-les-riches", title: "Combien rapporte de taxer les plus riches ?" },
      { slug: "smic", title: "Salaire minimum et coût du travail" },
      { slug: "blocage-prix", title: "Le blocage des prix" },
    ],
    status: "soon",
  },
  {
    slug: "cadre-europeen",
    number: "6 bis",
    title: "Le cadre européen et la notation",
    question: "Qui surveille les comptes de la France ?",
    summary:
      "Règles budgétaires, procédure de déficit excessif, agences de notation et mécanismes de solidarité de la zone euro.",
    color: { light: "#1d4ed8", dark: "#93c5fd" },
    sections: [
      { slug: "regles", title: "Les règles budgétaires" },
      { slug: "deficit-excessif", title: "La procédure de déficit excessif" },
      { slug: "notation", title: "Les agences de notation" },
      { slug: "solidarite", title: "Les filets de sécurité de la zone euro" },
    ],
    status: "soon",
  },
  {
    slug: "dette-en-perspective",
    number: "6 ter",
    title: "La dette en perspective",
    question: "3 500 milliards, c'est beaucoup ?",
    summary:
      "Par habitant, face aux budgets des ministères, face au patrimoine public : remettre la dette à l'échelle.",
    color: { light: "#a21caf", dark: "#f0abfc" },
    sections: [],
    status: "soon",
  },
  {
    slug: "comparaisons",
    number: "6 quater",
    title: "Comparaisons internationales",
    question: "La France est-elle une exception ?",
    summary:
      "Dette, dépenses, impôts, emploi : la France face à ses voisins, et pourquoi le Japon n'est pas la Grèce.",
    color: { light: "#0e7490", dark: "#67e8f9" },
    sections: [],
    status: "soon",
  },
  {
    slug: "histoire-des-dettes",
    number: "6 quinquies",
    title: "L'histoire des dettes",
    question: "Comment les pays sont-ils déjà sortis d'une dette trop lourde ?",
    summary:
      "Croissance, inflation, rigueur, défaut, annulation : les grandes sorties de crise et ce qui vaut pour la France aujourd'hui.",
    color: { light: "#92400e", dark: "#fcd34d" },
    sections: [],
    status: "soon",
  },
];

/** Rubriques hors modules numérotés, qui partagent le même système de couleur. */
export const rubriqueColors = {
  propositions: { light: "#b91c1c", dark: "#fca5a5" },
  indicateurs: { light: "#4d7c0f", dark: "#bef264" },
  jeux: { light: "#be185d", dark: "#f9a8d4" },
  transverse: { light: "#0369a1", dark: "#7dd3fc" },
} as const;

export function getModule(slug: string): ModuleInfo {
  const found = modules.find((m) => m.slug === slug);
  if (!found) throw new Error(`Module inconnu : ${slug}`);
  return found;
}

export function moduleHref(slug: string, section?: string): string {
  return section ? `/modules/${slug}/${section}/` : `/modules/${slug}/`;
}

/** Section précédente et suivante, en passant d'un module au suivant. */
export function neighbours(moduleSlug: string, sectionSlug?: string) {
  const pages: { href: string; title: string; module: ModuleInfo }[] = [];
  for (const m of modules) {
    pages.push({ href: moduleHref(m.slug), title: m.title, module: m });
    for (const s of m.sections) {
      pages.push({ href: moduleHref(m.slug, s.slug), title: s.title, module: m });
    }
  }
  const current = moduleHref(moduleSlug, sectionSlug);
  const i = pages.findIndex((p) => p.href === current);
  return {
    previous: i > 0 ? pages[i - 1] : undefined,
    next: i >= 0 && i < pages.length - 1 ? pages[i + 1] : undefined,
  };
}
