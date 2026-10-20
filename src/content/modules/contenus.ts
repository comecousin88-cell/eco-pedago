import type { MDXContent } from "mdx/types";
import type { QuestionQuiz } from "@/components/pedago/Quiz";
import { quiz as quizBases } from "./les-bases/quiz";
import { quiz as quizDette } from "./deficit-et-dette/quiz";
import { quiz as quizEmprunt } from "./emprunt-etat/quiz";
import { quiz as quizBoule } from "./boule-de-neige/quiz";
import { quiz as quizBanque } from "./banque-centrale/quiz";

/**
 * Les textes de chaque module rédigé : introduction, une page par section,
 * quiz. Un module listé ici doit avoir le statut « available » dans
 * modules.ts, et réciproquement (vérifié par contenu.test.ts).
 */

type Chargeur = () => Promise<{ default: MDXContent }>;

export interface ContenuModule {
  intro: Chargeur;
  sections: Record<string, Chargeur>;
  quiz: QuestionQuiz[];
}

export const contenus: Record<string, ContenuModule> = {
  "les-bases": {
    intro: () => import("./les-bases/index.mdx"),
    sections: {
      pib: () => import("./les-bases/pib.mdx"),
      "recettes-depenses": () => import("./les-bases/recettes-depenses.mdx"),
      administrations: () => import("./les-bases/administrations.mdx"),
      "inflation-taux-reels": () =>
        import("./les-bases/inflation-taux-reels.mdx"),
    },
    quiz: quizBases,
  },
  "deficit-et-dette": {
    intro: () => import("./deficit-et-dette/index.mdx"),
    sections: {
      "flux-et-stock": () => import("./deficit-et-dette/flux-et-stock.mdx"),
      soldes: () => import("./deficit-et-dette/soldes.mdx"),
      maastricht: () => import("./deficit-et-dette/maastricht.mdx"),
      composition: () => import("./deficit-et-dette/composition.mdx"),
      histoire: () => import("./deficit-et-dette/histoire.mdx"),
      europe: () => import("./deficit-et-dette/europe.mdx"),
    },
    quiz: quizDette,
  },
  "emprunt-etat": {
    intro: () => import("./emprunt-etat/index.mdx"),
    sections: {
      "aft-adjudications": () => import("./emprunt-etat/aft-adjudications.mdx"),
      "oat-btf": () => import("./emprunt-etat/oat-btf.mdx"),
      "prix-et-taux": () => import("./emprunt-etat/prix-et-taux.mdx"),
      "taux-apparent": () => import("./emprunt-etat/taux-apparent.mdx"),
      detenteurs: () => import("./emprunt-etat/detenteurs.mdx"),
      "spread-notation": () => import("./emprunt-etat/spread-notation.mdx"),
    },
    quiz: quizEmprunt,
  },
  "boule-de-neige": {
    intro: () => import("./boule-de-neige/index.mdx"),
    sections: {
      formule: () => import("./boule-de-neige/formule.mdx"),
      simulateur: () => import("./boule-de-neige/simulateur.mdx"),
      cercles: () => import("./boule-de-neige/cercles.mdx"),
      "cout-opportunite": () => import("./boule-de-neige/cout-opportunite.mdx"),
      chiffrage: () => import("./boule-de-neige/chiffrage.mdx"),
    },
    quiz: quizBoule,
  },
  "banque-centrale": {
    intro: () => import("./banque-centrale/index.mdx"),
    sections: {
      "bce-eurosysteme": () => import("./banque-centrale/bce-eurosysteme.mdx"),
      qe: () => import("./banque-centrale/qe.mdx"),
      "bilan-bdf": () => import("./banque-centrale/bilan-bdf.mdx"),
      "cadre-juridique": () => import("./banque-centrale/cadre-juridique.mdx"),
      "signal-marches": () => import("./banque-centrale/signal-marches.mdx"),
      grece: () => import("./banque-centrale/grece.mdx"),
    },
    quiz: quizBanque,
  },
};
