import type { QuestionQuiz } from "@/components/pedago/Quiz";

export const quiz: QuestionQuiz[] = [
  {
    question: "Quelle affirmation est exacte ?",
    choix: [
      "La moitié des Français ne paient aucun impôt",
      "Moins de la moitié des foyers paient l'impôt sur le revenu, mais tout le monde paie la TVA",
      "L'impôt sur le revenu est la première recette publique",
    ],
    bonne: 1,
    explication:
      "Environ 18 millions de foyers sur 41 millions paient l'impôt sur le revenu, mais la TVA, la CSG et les cotisations sont payées par presque tous, et rapportent bien davantage.",
  },
  {
    question: "Pourquoi un point de TVA rapporte-t-il autant ?",
    choix: ["Parce que son taux est très élevé", "Parce que son assiette, la consommation, est immense", "Parce qu'elle n'est payée que par les entreprises"],
    bonne: 1,
    explication: "Le rendement d'un impôt est à peu près son taux multiplié par son assiette : la TVA porte sur presque toute la consommation.",
  },
  {
    question: "Un impôt de 2 % sur les patrimoines de plus de 100 millions d'euros rapporterait, selon les estimations :",
    choix: ["De 2 à 25 milliards d'euros par an", "Plus de 150 milliards d'euros par an", "Moins de 100 millions d'euros par an"],
    bonne: 0,
    explication:
      "Les estimations vont de 2 à 3 milliards (impôt sur les sociétés déduit) à 15 à 25 milliards (estimation de ses promoteurs), loin du déficit public.",
  },
  {
    question: "Au niveau du Smic, l'employeur paie :",
    choix: ["Les mêmes cotisations patronales que sur un haut salaire", "Presque pas de cotisations patronales, grâce aux allègements", "Aucun salaire brut"],
    bonne: 1,
    explication: "Les allègements de cotisations, près de 80 milliards d'euros par an, sont maximaux au Smic et diminuent quand le salaire augmente.",
  },
  {
    question: "Quand l'État plafonne le prix de l'électricité en compensant les fournisseurs, qui paie la différence ?",
    choix: ["Personne : le prix a baissé", "Les fournisseurs, sans compensation", "Le budget de l'État, donc les contribuables et le déficit"],
    bonne: 2,
    explication: "Les boucliers tarifaires électricité et gaz et les amortisseurs ont coûté 26,1 milliards d'euros de 2022 à 2024, selon la CRE.",
  },
];
