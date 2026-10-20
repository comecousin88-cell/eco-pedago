import type { QuestionQuiz } from "@/components/pedago/Quiz";

export const quiz: QuestionQuiz[] = [
  {
    question: "Pourquoi l'État emprunte-t-il chaque année bien plus que son déficit ?",
    choix: [
      "Pour constituer des réserves en cas de crise",
      "Parce qu'il doit aussi rembourser les emprunts qui arrivent à échéance, en empruntant de nouveau",
      "Parce que la BCE l'y oblige",
    ],
    bonne: 1,
    explication:
      "Le besoin de financement comprend le déficit de l'année et les remboursements des emprunts passés, qui sont refinancés par de nouveaux emprunts.",
  },
  {
    question: "Dans une adjudication de l'AFT, quel prix paie un investisseur servi ?",
    choix: ["Le prix moyen de toutes les offres", "Le prix qu'il a lui-même proposé", "Toujours 100 €"],
    bonne: 1,
    explication:
      "L'AFT pratique l'adjudication « à prix demandé » : les offres les plus chères sont servies en premier, et chacun paie son propre prix.",
  },
  {
    question: "Vous détenez une OAT à coupon 2 %. Les taux du marché passent à 4 %. Que devient son prix ?",
    choix: ["Il monte", "Il baisse", "Il ne change pas, le coupon est fixe"],
    bonne: 1,
    explication:
      "Le coupon ne bouge pas : c'est le prix qui s'ajuste. Pour qu'un acheteur accepte 2 % quand le marché offre 4 %, il faut lui vendre le titre moins cher.",
  },
  {
    question: "Les taux du marché montent de 1 point. Que se passe-t-il pour la charge de la dette de l'État ?",
    choix: [
      "Elle augmente aussitôt de 1 point sur toute la dette",
      "Elle augmente peu la première année, puis de plus en plus à mesure que la dette est refinancée",
      "Elle ne change pas, car la dette est à taux fixe",
    ],
    bonne: 1,
    explication:
      "Seule la dette qui arrive à échéance est refinancée au nouveau taux. Le taux moyen rejoint le taux de marché en une durée moyenne d'emprunt, environ huit ans.",
  },
  {
    question: "Que mesure le « spread » France-Allemagne ?",
    choix: [
      "L'écart entre les dettes des deux pays en % du PIB",
      "L'écart entre les taux auxquels les deux États empruntent",
      "La différence d'inflation entre les deux pays",
    ],
    bonne: 1,
    explication:
      "Le spread est l'écart de taux, souvent à 10 ans. Il mesure la prime de risque que les investisseurs demandent pour prêter à la France plutôt qu'à l'Allemagne.",
  },
];
