import type { QuestionQuiz } from "@/components/pedago/Quiz";

export const quiz: QuestionQuiz[] = [
  {
    question: "Comment le Royaume-Uni a-t-il réduit sa dette, qui dépassait 250 % du PIB en 1946 ?",
    choix: ["En la remboursant intégralement", "Surtout parce que son PIB a grossi beaucoup plus vite que la dette", "Par un défaut"],
    bonne: 1,
    explication: "Croissance, inflation et taux maintenus bas ont fait baisser le ratio, avec des budgets hors intérêts souvent en excédent.",
  },
  {
    question: "Qu'est-ce que la répression financière ?",
    choix: [
      "Des règles qui maintiennent les taux d'intérêt sous l'inflation et orientent l'épargne vers l'État",
      "Une hausse des impôts sur les banques",
      "L'interdiction des prêts immobiliers",
    ],
    bonne: 0,
    explication: "Après 1945, plafonds de taux et contrôle des capitaux ont permis à l'inflation de réduire les dettes, aux dépens des épargnants.",
  },
  {
    question: "Pourquoi la France ne peut-elle pas réduire sa dette par l'inflation aujourd'hui ?",
    choix: [
      "Parce que l'inflation est interdite",
      "Parce qu'elle ne contrôle pas sa monnaie et que les marchés anticipent l'inflation",
      "Parce que sa dette est indexée sur l'or",
    ],
    bonne: 1,
    explication: "La BCE vise 2 % d'inflation, les capitaux circulent librement, et des taux qui montent avec l'inflation annulent une grande partie de l'effet.",
  },
  {
    question: "Lors de la restructuration grecque de 2012, les créanciers privés ont perdu environ :",
    choix: ["5 % de la valeur de leurs titres", "Plus de la moitié de la valeur de leurs titres", "La totalité"],
    bonne: 1,
    explication: "La décote a été de 53,5 %, soit une réduction de dette d'environ 107 milliards d'euros, sans empêcher la dette de remonter en % du PIB.",
  },
  {
    question: "Que montrent les sorties de dette réussies ?",
    choix: ["Un seul levier suffit", "Elles combinent plusieurs leviers sur une longue période", "Elles passent toujours par un défaut"],
    bonne: 1,
    explication: "Croissance, excédents hors intérêts et taux bas, sur des décennies : aucune sortie réussie n'a été rapide ni mono-causale.",
  },
];
