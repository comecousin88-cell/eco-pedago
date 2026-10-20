import type { Metadata } from "next";
import { ComingSoon } from "@/components/ui/ComingSoon";

export const metadata: Metadata = {
  title: "Gère le budget de l'État",
  description: "Un jeu pour comprendre les choix budgétaires d'un État.",
};

export default function BudgetGamePage() {
  return (
    <ComingSoon
      title="Gère le budget de l'État"
      intro="À vous de jouer : vous tenez les finances du pays pendant un an. Chaque décision a des conséquences sur le déficit, la dette et l'économie."
      features={[
        "Répartissez les dépenses par grand poste : éducation, santé, défense, retraites…",
        "Fixez les impôts et choisissez une politique monétaire",
        "Lancez la simulation : les 12 mois défilent en quelques secondes",
        "Découvrez votre solde budgétaire final et ce qui l'explique",
      ]}
    />
  );
}
