export type ConceptSlug =
  | "taux-interet"
  | "inflation"
  | "dette-publique"
  | "retraites";

/**
 * Couleurs d'un concept. Les classes Tailwind sont écrites en entier (pas de
 * concaténation) pour que Tailwind les détecte à la compilation.
 */
export interface ConceptAccent {
  text: string;
  softBg: string;
  border: string;
  /** Couleurs hexadécimales pour Recharts (qui n'utilise pas les classes CSS). */
  chart: { primary: string; secondary: string };
}

export interface Concept {
  slug: ConceptSlug;
  title: string;
  /** La question que se pose le lecteur, utilisée comme accroche. */
  question: string;
  summary: string;
  accent: ConceptAccent;
  related: ConceptSlug[];
}

export const concepts: Concept[] = [
  {
    slug: "taux-interet",
    title: "Les taux d'intérêt",
    question: "Pourquoi emprunter coûte plus ou moins cher ?",
    summary:
      "Le prix de l'argent : qui le fixe, et ce qu'il change pour votre crédit, votre épargne et les finances de l'État.",
    accent: {
      text: "text-sky-700",
      softBg: "bg-sky-50",
      border: "border-sky-200",
      chart: { primary: "#0369a1", secondary: "#7dd3fc" },
    },
    related: ["inflation", "dette-publique"],
  },
  {
    slug: "inflation",
    title: "L'inflation",
    question: "Pourquoi les prix augmentent-ils ?",
    summary:
      "Quand les prix montent, chaque euro achète un peu moins. Comment ça se mesure, et pourquoi la BCE vise 2 %.",
    accent: {
      text: "text-amber-700",
      softBg: "bg-amber-50",
      border: "border-amber-200",
      chart: { primary: "#b45309", secondary: "#fcd34d" },
    },
    related: ["taux-interet", "retraites"],
  },
  {
    slug: "dette-publique",
    title: "La dette publique",
    question: "L'État peut-il s'endetter sans fin ?",
    summary:
      "Déficit, dette, ratio dette/PIB, effet boule de neige : ce qui fait monter ou baisser la dette d'un pays.",
    accent: {
      text: "text-rose-700",
      softBg: "bg-rose-50",
      border: "border-rose-200",
      chart: { primary: "#be123c", secondary: "#fda4af" },
    },
    related: ["taux-interet", "retraites"],
  },
  {
    slug: "retraites",
    title: "Les retraites",
    question: "Qui paie ma retraite ?",
    summary:
      "Dans un système par répartition, les actifs financent les pensions d'aujourd'hui. Que se passe-t-il quand la population vieillit ?",
    accent: {
      text: "text-emerald-700",
      softBg: "bg-emerald-50",
      border: "border-emerald-200",
      chart: { primary: "#047857", secondary: "#6ee7b7" },
    },
    related: ["dette-publique", "inflation"],
  },
];

export function getConcept(slug: ConceptSlug): Concept {
  const concept = concepts.find((c) => c.slug === slug);
  if (!concept) throw new Error(`Concept inconnu : ${slug}`);
  return concept;
}

export function conceptHref(slug: ConceptSlug): string {
  return `/concepts/${slug}`;
}
