import type { QuestionQuiz } from "@/components/pedago/Quiz";

export const quiz: QuestionQuiz[] = [
  {
    question: "Le déficit passe de 150 à 100 milliards d'euros d'une année sur l'autre. Que fait la dette cette année-là ?",
    choix: ["Elle baisse de 50 milliards", "Elle augmente d'environ 100 milliards", "Elle ne bouge pas"],
    bonne: 1,
    explication:
      "Le déficit de l'année s'ajoute à la dette. Un déficit plus faible ralentit la hausse de la dette, il ne la fait pas baisser.",
  },
  {
    question: "Qu'est-ce que le solde primaire ?",
    choix: [
      "Le solde public sans compter les intérêts de la dette",
      "Le solde de l'État, sans la Sécurité sociale",
      "Le solde corrigé des effets de la conjoncture",
    ],
    bonne: 0,
    explication:
      "Solde public = solde primaire − intérêts. Le solde corrigé de la conjoncture s'appelle le solde structurel.",
  },
  {
    question:
      "Une OAT remboursera 100 € à l'échéance, mais elle s'échange aujourd'hui à 90 € sur les marchés. Pour combien compte-t-elle dans la dette de Maastricht ?",
    choix: ["90 €", "100 €", "Elle ne compte pas tant qu'elle n'est pas remboursée"],
    bonne: 1,
    explication:
      "La dette de Maastricht est mesurée en valeur nominale : ce qui devra être remboursé, quel que soit le prix du jour sur les marchés.",
  },
  {
    question: "Qui porte la plus grande partie de la dette publique ?",
    choix: ["La Sécurité sociale", "Les collectivités locales", "L'État"],
    bonne: 2,
    explication:
      "L'État porte plus de quatre euros de dette publique sur cinq. Les collectivités n'empruntent que pour investir, et une partie de la dette sociale est remboursée par la Cades.",
  },
  {
    question: "Depuis quand les administrations publiques françaises n'ont-elles plus été en excédent ?",
    choix: ["Depuis 1974", "Depuis 2000", "Depuis 2008"],
    bonne: 0,
    explication:
      "Le dernier excédent date de 1974. Le déficit est passé sous 3 % du PIB certaines années (fin des années 1990, 2018-2019), mais il n'a jamais disparu.",
  },
];
