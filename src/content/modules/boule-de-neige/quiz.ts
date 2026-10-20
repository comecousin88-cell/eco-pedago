import type { QuestionQuiz } from "@/components/pedago/Quiz";

export const quiz: QuestionQuiz[] = [
  {
    question: "Quand l'effet boule de neige joue-t-il contre la dette ?",
    choix: [
      "Quand le taux d'intérêt moyen (r) dépasse la croissance nominale (g)",
      "Quand la croissance dépasse le taux d'intérêt",
      "Quand l'inflation est élevée",
    ],
    bonne: 0,
    explication:
      "Si r > g, les intérêts font grossir la dette plus vite que l'économie : sans excédent primaire, le ratio dette/PIB augmente tout seul.",
  },
  {
    question: "Dette à 100 % du PIB, taux moyen 3 %, croissance nominale 2 %, solde primaire nul. Que fait le ratio en un an ?",
    choix: ["Il baisse d'environ 1 point", "Il est stable", "Il monte d'environ 1 point"],
    bonne: 2,
    explication: "(r − g) × dette = (3 % − 2 %) × 100 % = +1 point de PIB, faute d'excédent primaire pour compenser.",
  },
  {
    question: "Stabiliser la dette/PIB, est-ce supprimer le déficit ?",
    choix: [
      "Oui, il faut un budget à l'équilibre",
      "Non : on peut rester en déficit si la dette progresse au même rythme que l'économie",
      "Non : il faut un excédent d'au moins 3 % du PIB",
    ],
    bonne: 1,
    explication:
      "Le déficit qui stabilise le ratio vaut environ croissance nominale × dette/PIB. La dette augmente alors en euros, mais pas en proportion du PIB.",
  },
  {
    question: "Dans un cercle vicieux de la dette, qu'est-ce qui fait monter les taux ?",
    choix: [
      "La baisse de confiance des prêteurs, qui demandent une prime de risque",
      "La croissance trop forte",
      "La baisse de l'inflation",
    ],
    bonne: 0,
    explication:
      "Si les prêteurs doutent de la trajectoire, ils exigent un taux plus élevé ; la charge d'intérêts augmente, le déficit se creuse, et la boucle peut s'entretenir.",
  },
  {
    question: "Pourquoi deux chiffrages d'un même programme peuvent-ils différer de plusieurs dizaines de milliards ?",
    choix: [
      "Parce que l'un des deux fait forcément une erreur de calcul",
      "Parce qu'ils font des hypothèses différentes sur les réactions des contribuables et sur l'effet sur la croissance",
      "Parce que les données publiques sont secrètes",
    ],
    bonne: 1,
    explication:
      "Le coût brut se calcule facilement ; les réactions des agents, le rendement des recettes incertaines et l'effet sur la croissance relèvent d'hypothèses, sources des écarts.",
  },
];
