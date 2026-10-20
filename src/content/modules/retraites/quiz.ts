import type { QuestionQuiz } from "@/components/pedago/Quiz";

export const quiz: QuestionQuiz[] = [
  {
    question: "Dans un système par répartition, qui paie les pensions de cette année ?",
    choix: [
      "L'épargne que les retraités ont accumulée",
      "Les cotisations des actifs de cette année",
      "Les placements financiers de l'État",
    ],
    bonne: 1,
    explication: "En répartition, rien n'est mis de côté : les cotisations de l'année financent les pensions de l'année.",
  },
  {
    question: "Que mesure le rapport « cotisants / retraités » ?",
    choix: ["Le niveau moyen des pensions", "Le nombre de cotisants pour chaque retraité", "La durée moyenne de la retraite"],
    bonne: 1,
    explication: "Il était de 2,1 en 2002, de 1,8 en 2025 et serait d'environ 1,3 en 2070 selon le COR.",
  },
  {
    question: "Quels sont les trois leviers pour équilibrer un système par répartition ?",
    choix: [
      "L'âge de départ, le taux de cotisation, le niveau des pensions",
      "La TVA, l'impôt sur le revenu, la CSG",
      "La natalité, l'immigration, l'espérance de vie",
    ],
    bonne: 0,
    explication:
      "La démographie s'impose au système ; on peut agir sur l'âge (ou la durée), les cotisations ou les pensions, ou financer l'écart par d'autres recettes.",
  },
  {
    question: "Qu'est-ce que la décote ?",
    choix: [
      "Une pension réduite si l'on part sans avoir tous ses trimestres",
      "Une baisse des cotisations pour les bas salaires",
      "La revalorisation annuelle des pensions",
    ],
    bonne: 0,
    explication:
      "Au régime général, chaque trimestre manquant réduit la pension, dans une certaine limite ; elle disparaît à l'âge d'annulation de la décote.",
  },
  {
    question: "Pourquoi un passage à la capitalisation crée-t-il une « double charge » ?",
    choix: [
      "Parce que les fonds de pension prélèvent des frais",
      "Parce qu'il faut continuer à payer les pensions promises tout en épargnant pour soi",
      "Parce que les retraités doivent cotiser deux fois",
    ],
    bonne: 1,
    explication:
      "Les droits acquis en répartition restent dus pendant des décennies ; la génération de la transition finance ses aînés et sa propre épargne.",
  },
];
