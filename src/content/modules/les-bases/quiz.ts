import type { QuestionQuiz } from "@/components/pedago/Quiz";

export const quiz: QuestionQuiz[] = [
  {
    question: "Que mesure le PIB ?",
    choix: [
      "Toute la richesse accumulée par le pays (logements, entreprises, épargne…)",
      "La valeur de ce qui est produit dans le pays en un an, sans compter deux fois la même chose",
      "Les recettes de l'État pendant une année",
    ],
    bonne: 1,
    explication:
      "Le PIB est un flux annuel : la somme des valeurs ajoutées. Le patrimoine accumulé est un stock, mesuré à part.",
  },
  {
    question: "Quelle est la première ressource des administrations publiques ?",
    choix: ["La TVA", "L'impôt sur le revenu", "Les cotisations sociales"],
    bonne: 2,
    explication:
      "Les cotisations sociales, prélevées sur les salaires pour la retraite, la maladie ou le chômage, dépassent de loin la TVA, qui est la première recette de l'État.",
  },
  {
    question: "Quel est le premier poste de dépense publique ?",
    choix: ["Les retraites", "L'enseignement", "Les intérêts de la dette"],
    bonne: 0,
    explication:
      "Les retraites représentent environ un quart de la dépense publique, loin devant la santé, l'enseignement ou les intérêts de la dette.",
  },
  {
    question: "Quelle famille d'administrations publiques dépense le plus ?",
    choix: ["L'État", "La Sécurité sociale", "Les collectivités locales"],
    bonne: 1,
    explication:
      "La Sécurité sociale verse les retraites, rembourse les soins et paie les allocations : elle dépense davantage que l'État, même si c'est l'État qui porte l'essentiel de la dette.",
  },
  {
    question: "Vous placez votre argent à 4 % alors que l'inflation est de 3 %. Que gagnez-vous vraiment ?",
    choix: ["Environ 7 %", "Environ 4 %", "Environ 1 %"],
    bonne: 2,
    explication:
      "Le taux réel est à peu près le taux nominal moins l'inflation : 4 − 3 = 1 %. Le calcul exact donne 1,04 / 1,03 − 1 ≈ 0,97 %.",
  },
];
