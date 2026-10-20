import type { QuestionQuiz } from "@/components/pedago/Quiz";

export const quiz: QuestionQuiz[] = [
  {
    question: "Quelle est la mission principale de la BCE ?",
    choix: [
      "Financer les déficits des États de la zone euro",
      "Maintenir la stabilité des prix, avec une inflation de 2 % à moyen terme",
      "Fixer le taux de change de l'euro face au dollar",
    ],
    bonne: 1,
    explication:
      "Les traités lui confient la stabilité des prix ; elle vise 2 % d'inflation à moyen terme, et il lui est interdit de financer directement les États.",
  },
  {
    question: "Quand la Banque de France achète des OAT, comment les paie-t-elle ?",
    choix: [
      "Avec l'argent des impôts",
      "En créant des réserves sur le compte des banques qui les lui vendent",
      "En empruntant sur les marchés",
    ],
    bonne: 1,
    explication:
      "Elle crédite le compte des banques chez elle : elle crée des réserves, qui sont une dette de la banque centrale envers les banques, rémunérée au taux de dépôt.",
  },
  {
    question: "Pourquoi la Banque de France a-t-elle perdu de l'argent en 2024 ?",
    choix: [
      "Parce que l'État n'a pas remboursé ses OAT",
      "Parce qu'elle versait sur les réserves un taux plus élevé que ce que lui rapportaient les titres achetés à taux bas",
      "Parce qu'elle a vendu son or",
    ],
    bonne: 1,
    explication:
      "Ses titres, achetés quand les taux étaient très bas, rapportaient peu, alors qu'après la hausse des taux elle devait rémunérer les réserves à un taux bien plus élevé.",
  },
  {
    question: "Si l'on annulait les OAT détenues par la Banque de France, que deviendraient les réserves créées pour les acheter ?",
    choix: [
      "Elles disparaîtraient aussi",
      "Elles resteraient dues aux banques : les fonds propres de la banque centrale deviendraient fortement négatifs",
      "Elles seraient remboursées par la BCE",
    ],
    bonne: 1,
    explication:
      "L'annulation supprime l'actif (les titres) mais pas le passif (les réserves). La perte retombe, d'une façon ou d'une autre, sur les finances publiques ou sur la crédibilité de la monnaie.",
  },
  {
    question: "Qu'interdit l'article 123 du traité sur le fonctionnement de l'Union européenne ?",
    choix: [
      "Tout achat de dette publique par la banque centrale",
      "Les prêts de la banque centrale aux États et l'achat direct de leurs titres à l'émission",
      "Les déficits supérieurs à 3 % du PIB",
    ],
    bonne: 1,
    explication:
      "Le financement monétaire direct est interdit. Les achats sur le marché secondaire restent possibles pour la politique monétaire, sous conditions fixées par la Cour de justice de l'Union européenne.",
  },
];
