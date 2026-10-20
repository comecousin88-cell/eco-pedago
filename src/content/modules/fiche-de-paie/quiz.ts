import type { QuestionQuiz } from "@/components/pedago/Quiz";

export const quiz: QuestionQuiz[] = [
  {
    question: "Quel montant est le plus élevé ?",
    choix: ["Le salaire net", "Le salaire brut", "Le coût total pour l'employeur"],
    bonne: 2,
    explication: "Coût employeur = brut + cotisations patronales ; net = brut − cotisations salariales, CSG et CRDS.",
  },
  {
    question: "Quelle est la première destination des cotisations sur un salaire moyen ?",
    choix: ["Les retraites", "Le chômage", "La formation professionnelle"],
    bonne: 0,
    explication: "Retraite de base et retraite complémentaire réunies représentent la plus grosse part des cotisations.",
  },
  {
    question: "Pourquoi le coût du travail augmente-t-il plus vite que le salaire brut au-dessus du Smic ?",
    choix: [
      "Parce que l'impôt sur le revenu est progressif",
      "Parce que l'allègement de cotisations patronales diminue quand le salaire augmente",
      "Parce que la TVA augmente",
    ],
    bonne: 1,
    explication: "La réduction générale est maximale au Smic et s'éteint à 3 Smic : une hausse du brut réduit aussi l'allègement.",
  },
  {
    question: "Sur quelle base sont calculées la CSG et la CRDS sur un salaire ?",
    choix: ["Sur le salaire net", "Sur 98,25 % du salaire brut", "Sur le coût employeur"],
    bonne: 1,
    explication: "Un abattement forfaitaire de 1,75 % pour frais professionnels s'applique, dans une certaine limite.",
  },
  {
    question: "Combien de TVA contient un achat de 120 € TTC soumis au taux normal de 20 % ?",
    choix: ["24 €", "20 €", "16 €"],
    bonne: 1,
    explication: "Le prix TTC inclut déjà la TVA : 120 € = 100 € hors taxe + 20 € de TVA. La TVA vaut donc 120 × 20 / 120 = 20 €.",
  },
];
