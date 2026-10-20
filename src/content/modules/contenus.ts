import type { MDXContent } from "mdx/types";
import type { QuestionQuiz } from "@/components/pedago/Quiz";
import { quiz as quizBases } from "./les-bases/quiz";
import { quiz as quizDette } from "./deficit-et-dette/quiz";

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
      "inflation-taux-reels": () => import("./les-bases/inflation-taux-reels.mdx"),
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
};
