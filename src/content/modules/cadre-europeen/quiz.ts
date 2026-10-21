import type { QuestionQuiz } from "@/components/pedago/Quiz";

export const quiz: QuestionQuiz[] = [
  {
    question: "Quels sont les repères fixés par le traité de Maastricht ?",
    choix: ["Déficit sous 3 % du PIB, dette sous 60 % du PIB", "Déficit nul, dette sous 100 % du PIB", "Dépenses sous 50 % du PIB"],
    bonne: 0,
    explication: "Les deux repères datent de 1992. Avec une croissance nominale de 5 %, un déficit de 3 % stabilise la dette à 60 % du PIB.",
  },
  {
    question: "Sur quoi portent principalement les nouvelles règles européennes de 2024 ?",
    choix: ["Le niveau des impôts", "La croissance des dépenses publiques nettes", "Le taux d'intérêt de la dette"],
    bonne: 1,
    explication: "Chaque pays s'engage sur une trajectoire de dépenses nettes, que le gouvernement maîtrise mieux que le déficit, qui dépend de la conjoncture.",
  },
  {
    question: "Où en est la France vis-à-vis des règles européennes ?",
    choix: [
      "Elle respecte les deux repères",
      "Elle est en procédure de déficit excessif depuis 2024, avec un retour sous 3 % demandé d'ici 2029",
      "Elle a été sanctionnée par une amende",
    ],
    bonne: 1,
    explication: "La procédure a été ouverte en juillet 2024. Les sanctions financières prévues n'ont jamais été appliquées à aucun pays.",
  },
  {
    question: "Qu'est-ce qui mesure le mieux, au jour le jour, la confiance des investisseurs ?",
    choix: ["La note des agences", "L'écart de taux avec l'Allemagne", "Le montant de la dette"],
    bonne: 1,
    explication: "Les taux réagissent chaque jour, souvent avant les agences. Une dégradation pèse surtout par ses effets sur certains investisseurs.",
  },
  {
    question: "À quelle condition un pays peut-il bénéficier des outils de la BCE contre une flambée de ses taux ?",
    choix: ["Aucune : la BCE protège tous les pays", "S'il respecte ses engagements budgétaires européens", "S'il sort de l'euro"],
    bonne: 1,
    explication: "Le TPI et les OMT sont réservés aux pays qui respectent leurs engagements : ils ne protègent pas contre une perte de confiance liée à la politique budgétaire.",
  },
];
