import type { QuestionQuiz } from "@/components/pedago/Quiz";

export const quiz: QuestionQuiz[] = [
  {
    question: "Dans la zone euro, la France est :",
    choix: ["Le pays le moins endetté", "L'un des pays les plus endettés, derrière la Grèce et l'Italie", "Le pays le plus endetté"],
    bonne: 1,
    explication: "Avec environ 115 % du PIB selon le FMI, la France est derrière la Grèce et l'Italie, et loin devant l'Allemagne.",
  },
  {
    question: "Pourquoi les investisseurs s'inquiètent-ils autant pour la France que pour l'Italie, pourtant plus endettée ?",
    choix: ["Parce que le déficit français est plus élevé et la dette continue de monter", "Parce que la France n'émet pas de dette", "Parce que l'Italie a quitté l'euro"],
    bonne: 0,
    explication: "En 2025, le déficit de la France atteignait environ 5 % du PIB, contre environ 3 % pour l'Italie : c'est la trajectoire qui compte.",
  },
  {
    question: "Quelle est la principale raison du niveau élevé des dépenses publiques françaises ?",
    choix: ["Les dépenses militaires", "La protection sociale, notamment des retraites majoritairement publiques", "Les intérêts de la dette"],
    bonne: 1,
    explication: "Quand retraites et santé passent par des régimes publics, elles apparaissent dans la dépense publique, contrairement aux fonds privés d'autres pays.",
  },
  {
    question: "Pourquoi le Japon peut-il avoir une dette de plus de 200 % du PIB sans crise de financement ?",
    choix: [
      "Parce que sa dette est petite en yens",
      "Parce qu'il emprunte dans sa monnaie, auprès de ses épargnants et de sa banque centrale",
      "Parce qu'il ne paie pas d'intérêts",
    ],
    bonne: 1,
    explication: "Monnaie propre, dette détenue à l'intérieur et épargne abondante : trois différences majeures avec la Grèce de 2010.",
  },
  {
    question: "Quel levier améliore à la fois les recettes et les dépenses publiques ?",
    choix: ["Un taux d'emploi plus élevé", "Un taux de change plus fort", "Une hausse des taux d'intérêt"],
    bonne: 0,
    explication: "Plus de personnes en emploi, c'est plus de cotisations et d'impôts, et moins d'allocations.",
  },
];
