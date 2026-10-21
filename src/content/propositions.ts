import type { MDXContent } from "mdx/types";
import type { NiveauVerdict } from "@/components/pedago/Encadres";

/**
 * Rubrique « Propositions passées au crible » : une fiche par proposition,
 * toujours dans le même ordre (voir PARTIES). Aucun parti ni candidat n'est
 * nommé ; le verdict porte sur le mécanisme et ses chiffres.
 */

export const PARTIES = [
  "1. La proposition",
  "2. L'idée derrière",
  "3. Comment ça marcherait concrètement",
  "4. Ce que disent les économistes",
  "5. Ordres de grandeur",
  "6. Verdict",
] as const;

export const THEMES = ["Dette", "Monnaie", "Fiscalité", "Retraites", "Salaires et prix"] as const;
export type Theme = (typeof THEMES)[number];

/** Une section de module (ou un module sans section) où le mécanisme est expliqué. */
export interface LienModule {
  module: string;
  section?: string;
}

export interface Proposition {
  slug: string;
  /** La proposition, en quelques mots. */
  titre: string;
  /** Ce que la fiche examine, en une phrase, pour les cartes. */
  resume: string;
  /** Thèmes, pour filtrer ; le premier sert d'étiquette principale. */
  themes: Theme[];
  /** Module où le mécanisme est expliqué. */
  module: string;
  /** Pages de modules qui renvoient vers la fiche (encadré « Une proposition liée »). */
  liens: LienModule[];
  /** Fiche mise en avant sur l'accueil et en fin de parcours « Je découvre ». */
  phare?: boolean;
  verdict?: NiveauVerdict;
  /** Texte de la fiche ; absent tant qu'elle n'est pas rédigée. */
  contenu?: () => Promise<{ default: MDXContent }>;
}

export const propositions: Proposition[] = [
  {
    slug: "annuler-dette-banque-centrale",
    titre: "Annuler la dette détenue par la banque centrale",
    resume: "Effacer les titres publics achetés par la Banque de France : qui gagne, qui perd, et ce que disent les traités.",
    themes: ["Dette", "Monnaie"],
    module: "banque-centrale",
    liens: [
      { module: "banque-centrale", section: "bilan-bdf" },
      { module: "banque-centrale", section: "cadre-juridique" },
    ],
    phare: true,
    verdict: "ne-tient-pas",
    contenu: () => import("./propositions/annuler-dette-banque-centrale.mdx"),
  },
  {
    slug: "dette-au-frigo",
    titre: "« Mettre au frigo » la dette détenue par la banque centrale",
    resume: "Transformer ces titres en dette perpétuelle sans intérêt : une annulation qui ne dit pas son nom ?",
    themes: ["Dette", "Monnaie"],
    module: "banque-centrale",
    liens: [{ module: "banque-centrale", section: "qe" }],
    verdict: "ne-tient-pas",
    contenu: () => import("./propositions/dette-au-frigo.mdx"),
  },
  {
    slug: "planche-a-billets",
    titre: "Financer le déficit par la création monétaire",
    resume: "Faire financer directement l'État par sa banque centrale : ce que permet la monnaie, et ce qu'elle coûte.",
    themes: ["Monnaie", "Dette"],
    module: "banque-centrale",
    liens: [
      { module: "banque-centrale", section: "bce-eurosysteme" },
      { module: "les-bases", section: "inflation-taux-reels" },
    ],
    phare: true,
    verdict: "ne-tient-pas",
    contenu: () => import("./propositions/planche-a-billets.mdx"),
  },
  {
    slug: "sortir-de-l-euro",
    titre: "Sortir de l'euro",
    resume: "Retrouver sa monnaie et sa banque centrale : les marges que la France y gagnerait, et ce que coûterait la transition.",
    themes: ["Monnaie"],
    module: "banque-centrale",
    liens: [
      { module: "banque-centrale", section: "grece" },
      { module: "emprunt-etat", section: "spread-notation" },
    ],
    verdict: "debattu",
    contenu: () => import("./propositions/sortir-de-l-euro.mdx"),
  },
  {
    slug: "taxer-les-tres-hauts-patrimoines",
    titre: "Taxer davantage les plus hauts patrimoines",
    resume: "Un impôt minimal sur les fortunes de plus de 100 millions : juste ou non, et combien il rapporterait vraiment.",
    themes: ["Fiscalité"],
    module: "fiscalite",
    liens: [{ module: "les-bases", section: "recettes-depenses" }],
    verdict: "debattu",
    contenu: () => import("./propositions/taxer-les-tres-hauts-patrimoines.mdx"),
  },
  {
    slug: "financer-les-depenses-en-taxant-les-riches",
    titre: "Combler le déficit ou financer de grandes dépenses en taxant les plus riches",
    resume: "Le rendement d'un impôt sur les grandes fortunes face au déficit et aux programmes de dépenses : l'arithmétique.",
    themes: ["Fiscalité", "Dette"],
    module: "fiscalite",
    liens: [
      { module: "deficit-et-dette", section: "soldes" },
      { module: "boule-de-neige", section: "chiffrage" },
    ],
    phare: true,
    verdict: "ne-tient-pas",
    contenu: () => import("./propositions/financer-les-depenses-en-taxant-les-riches.mdx"),
  },
  {
    slug: "retraite-a-60-ans",
    titre: "Revenir à la retraite à 60 ans",
    resume: "Abaisser l'âge légal de départ : combien cela coûte, et quels leviers permettraient de le financer.",
    themes: ["Retraites"],
    module: "retraites",
    liens: [{ module: "retraites", section: "leviers" }],
    phare: true,
    verdict: "debattu",
    contenu: () => import("./propositions/retraite-a-60-ans.mdx"),
  },
  {
    slug: "passage-capitalisation",
    titre: "Passer à la retraite par capitalisation",
    resume: "Faire épargner chacun pour sa propre retraite : rendements espérés, risques, et le problème de la double charge.",
    themes: ["Retraites"],
    module: "retraites",
    liens: [
      { module: "retraites", section: "repartition-capitalisation" },
      { module: "retraites", section: "transition" },
    ],
    verdict: "ne-tient-pas",
    contenu: () => import("./propositions/passage-capitalisation.mdx"),
  },
  {
    slug: "retraite-par-points",
    titre: "Passer à une retraite par points",
    resume: "Un système où chaque euro cotisé donne les mêmes droits : plus lisible, mais qui fixe la valeur du point ?",
    themes: ["Retraites"],
    module: "retraites",
    liens: [{ module: "retraites", section: "notions" }],
    verdict: "solide",
    contenu: () => import("./propositions/retraite-par-points.mdx"),
  },
  {
    slug: "hausse-forte-du-smic",
    titre: "Augmenter fortement le Smic",
    resume: "Un Smic nettement plus haut : ce que gagnent les salariés, ce que paient les employeurs et l'État, et le risque pour l'emploi.",
    themes: ["Salaires et prix", "Fiscalité"],
    module: "fiche-de-paie",
    liens: [{ module: "fiche-de-paie" }],
    verdict: "debattu",
    contenu: () => import("./propositions/hausse-forte-du-smic.mdx"),
  },
  {
    slug: "blocage-des-prix",
    titre: "Bloquer les prix",
    resume: "Geler les prix de l'énergie ou de l'alimentation : un bouclier efficace à court terme, mais qui paie, et combien de temps ?",
    themes: ["Salaires et prix"],
    module: "les-bases",
    liens: [{ module: "les-bases", section: "inflation-taux-reels" }],
    verdict: "debattu",
    contenu: () => import("./propositions/blocage-des-prix.mdx"),
  },
  {
    slug: "tva-sociale",
    titre: "Instaurer une TVA sociale",
    resume: "Baisser les cotisations et relever la TVA : faire payer une partie de la protection sociale par les importations.",
    themes: ["Fiscalité", "Salaires et prix"],
    module: "fiche-de-paie",
    liens: [{ module: "fiche-de-paie" }],
    verdict: "debattu",
    contenu: () => import("./propositions/tva-sociale.mdx"),
  },
  {
    slug: "austerite-rapide",
    titre: "Baisser massivement et rapidement les dépenses",
    resume: "Réduire le déficit en deux ou trois ans par les seules économies : ce que cela rapporte, et ce que cela coûte en croissance.",
    themes: ["Dette"],
    module: "boule-de-neige",
    liens: [{ module: "boule-de-neige", section: "cercles" }],
    verdict: "debattu",
    contenu: () => import("./propositions/austerite-rapide.mdx"),
  },
  {
    slug: "lutte-contre-la-fraude",
    titre: "Financer les dépenses par la lutte contre la fraude",
    resume: "La fraude fiscale et sociale se chiffre en dizaines de milliards : combien peut-on vraiment en récupérer chaque année ?",
    themes: ["Fiscalité", "Dette"],
    module: "les-bases",
    liens: [{ module: "les-bases", section: "recettes-depenses" }],
    verdict: "ne-tient-pas",
    contenu: () => import("./propositions/lutte-contre-la-fraude.mdx"),
  },
  {
    slug: "relance-pour-reduire-la-dette",
    titre: "Relancer l'économie pour réduire la dette",
    resume: "Dépenser plus aujourd'hui pour que la croissance allège la dette demain : à quelles conditions ?",
    themes: ["Dette"],
    module: "boule-de-neige",
    liens: [{ module: "boule-de-neige", section: "formule" }],
    verdict: "ne-tient-pas",
    contenu: () => import("./propositions/relance-pour-reduire-la-dette.mdx"),
  },
  {
    slug: "theorie-monetaire-moderne",
    titre: "Appliquer la théorie monétaire moderne",
    resume: "Un État qui émet sa monnaie ne serait limité que par l'inflation : ce que dit la théorie, et ce qu'elle suppose.",
    themes: ["Monnaie", "Dette"],
    module: "banque-centrale",
    liens: [{ module: "banque-centrale", section: "signal-marches" }],
    verdict: "ne-tient-pas",
    contenu: () => import("./propositions/theorie-monetaire-moderne.mdx"),
  },
];

export function getProposition(slug: string): Proposition | undefined {
  return propositions.find((p) => p.slug === slug);
}

export function propositionHref(slug: string): string {
  return `/propositions/${slug}/`;
}

/** Fiches liées à une page de module : une section, ou un module sans section. */
export function propositionsLiees(module: string, section?: string): Proposition[] {
  return propositions.filter((p) => p.liens.some((l) => l.module === module && l.section === section));
}

/** Les fiches mises en avant, dans l'ordre du registre. */
export const propositionsPhares = propositions.filter((p) => p.phare);
