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

export interface Proposition {
  slug: string;
  /** La proposition, en quelques mots. */
  titre: string;
  /** Le thème, pour regrouper les fiches. */
  theme: "Dette et monnaie" | "Impôts" | "Retraites" | "Salaires et prix" | "Budget";
  /** Module où le mécanisme est expliqué. */
  module: string;
  verdict?: NiveauVerdict;
  /** Texte de la fiche ; absent tant qu'elle n'est pas rédigée. */
  contenu?: () => Promise<{ default: MDXContent }>;
}

export const propositions: Proposition[] = [
  {
    slug: "annuler-dette-banque-centrale",
    titre: "Annuler la dette détenue par la banque centrale",
    theme: "Dette et monnaie",
    module: "banque-centrale",
    verdict: "ne-tient-pas",
    contenu: () => import("./propositions/annuler-dette-banque-centrale.mdx"),
  },
  { slug: "dette-au-frigo", titre: "« Mettre au frigo » la dette détenue par la banque centrale", theme: "Dette et monnaie", module: "banque-centrale" },
  { slug: "planche-a-billets", titre: "Financer le déficit par la création monétaire", theme: "Dette et monnaie", module: "banque-centrale" },
  { slug: "sortir-de-l-euro", titre: "Sortir de l'euro", theme: "Dette et monnaie", module: "banque-centrale" },
  {
    slug: "taxer-les-tres-hauts-patrimoines",
    titre: "Taxer davantage les plus hauts patrimoines",
    theme: "Impôts",
    module: "fiscalite",
    verdict: "debattu",
    contenu: () => import("./propositions/taxer-les-tres-hauts-patrimoines.mdx"),
  },
  {
    slug: "financer-les-depenses-en-taxant-les-riches",
    titre: "Combler le déficit ou financer de grandes dépenses en taxant les plus riches",
    theme: "Budget",
    module: "fiscalite",
    verdict: "ne-tient-pas",
    contenu: () => import("./propositions/financer-les-depenses-en-taxant-les-riches.mdx"),
  },
  { slug: "retraite-a-60-ans", titre: "Revenir à la retraite à 60 ans", theme: "Retraites", module: "retraites" },
  { slug: "passage-capitalisation", titre: "Passer à la retraite par capitalisation", theme: "Retraites", module: "retraites" },
  { slug: "retraite-par-points", titre: "Passer à une retraite par points", theme: "Retraites", module: "retraites" },
  { slug: "hausse-forte-du-smic", titre: "Augmenter fortement le Smic", theme: "Salaires et prix", module: "fiscalite" },
  { slug: "blocage-des-prix", titre: "Bloquer les prix", theme: "Salaires et prix", module: "fiscalite" },
  { slug: "tva-sociale", titre: "Instaurer une TVA sociale", theme: "Impôts", module: "fiscalite" },
  { slug: "austerite-rapide", titre: "Baisser massivement et rapidement les dépenses", theme: "Budget", module: "boule-de-neige" },
  { slug: "lutte-contre-la-fraude", titre: "Financer les dépenses par la lutte contre la fraude", theme: "Budget", module: "fiscalite" },
  { slug: "relance-pour-reduire-la-dette", titre: "Relancer l'économie pour réduire la dette", theme: "Budget", module: "boule-de-neige" },
  { slug: "theorie-monetaire-moderne", titre: "Appliquer la théorie monétaire moderne", theme: "Dette et monnaie", module: "banque-centrale" },
];

export function getProposition(slug: string): Proposition | undefined {
  return propositions.find((p) => p.slug === slug);
}

export function propositionHref(slug: string): string {
  return `/propositions/${slug}/`;
}
