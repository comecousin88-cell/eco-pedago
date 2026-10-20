import type { Metadata } from "next";
import { ComingSoon } from "@/components/ui/ComingSoon";

export const metadata: Metadata = {
  title: "Tableau de bord",
  description: "Les principaux indicateurs économiques, mis à jour automatiquement.",
};

export default function DashboardPage() {
  return (
    <ComingSoon
      title="Tableau de bord de l'économie"
      intro="Les vrais chiffres, au même endroit, mis à jour automatiquement depuis les sources officielles, avec une explication pour chacun."
      features={[
        "Le taux directeur de la Banque centrale européenne (source : BCE)",
        "L'inflation en France et dans la zone euro (sources : Insee, Eurostat)",
        "La croissance du PIB et le taux de chômage (source : Insee)",
        "La dette publique en pourcentage du PIB (source : Eurostat)",
        "Pour chaque indicateur : l'historique en graphique et un lien vers la page qui l'explique",
      ]}
    />
  );
}
