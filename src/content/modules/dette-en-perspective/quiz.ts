import type { QuestionQuiz } from "@/components/pedago/Quiz";

export const quiz: QuestionQuiz[] = [
  {
    question: "Que représente à peu près la dette publique par habitant ?",
    choix: ["Environ 5 000 euros", "Plus de 50 000 euros", "Environ 500 000 euros"],
    bonne: 1,
    explication: "Environ 3 600 milliards d'euros pour 69 millions d'habitants, soit un peu plus de 52 000 euros chacun.",
  },
  {
    question: "Comment un État rembourse-t-il en général sa dette arrivée à échéance ?",
    choix: ["En une fois, grâce aux impôts", "En empruntant de nouveau pour la refinancer", "En vendant ses bâtiments"],
    bonne: 1,
    explication: "L'État refinance sa dette : ce qui pèse chaque année, ce sont les intérêts et la trajectoire de la dette.",
  },
  {
    question: "Dans le budget de l'État, la charge de la dette pèse à peu près autant que :",
    choix: ["La justice", "La défense", "L'ensemble des dépenses de l'État"],
    bonne: 1,
    explication: "Elle dépasse nettement la recherche, la sécurité ou la justice, et approche le budget de la défense.",
  },
  {
    question: "Le patrimoine net des administrations publiques fin 2024 était :",
    choix: ["Positif : leurs actifs dépassent encore leurs dettes", "Égal à zéro", "Négatif de 3 600 milliards"],
    bonne: 0,
    explication: "Selon l'Insee, environ 690 milliards d'euros, mais il diminue à mesure que la dette augmente.",
  },
  {
    question: "Pourquoi ne peut-on pas rembourser la dette en vendant le patrimoine public ?",
    choix: [
      "Parce que c'est interdit par la Constitution",
      "Parce que l'essentiel est fait d'équipements qui servent au service public et trouveraient difficilement acheteur",
      "Parce que le patrimoine public n'a aucune valeur",
    ],
    bonne: 1,
    explication: "Écoles, hôpitaux, routes : 85 % des actifs non financiers sont des constructions et terrains bâtis utilisés pour le service public.",
  },
];
