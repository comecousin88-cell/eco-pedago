import type { Metadata } from "next";
import { JeuMinistre } from "@/components/jeux/JeuMinistre";
import { FilAriane } from "@/components/modules/FilAriane";
import { MarquerLue } from "@/components/modules/MarquerLue";
import { ModuleTheme } from "@/components/modules/ModuleTheme";
import { EtEnsuite } from "@/components/layout/EtEnsuite";
import { suitePage } from "@/content/suite";
import { rubriqueColors } from "@/content/modules";

export const metadata: Metadata = {
  title: "Ministre des Finances",
  description:
    "Cinq budgets, cinq imprévus : à vous de tenir les comptes de l'État pendant un mandat, avec un modèle simple dont toutes les hypothèses sont affichées.",
};

export default function PageMinistre() {
  return (
    <ModuleTheme color={rubriqueColors.jeux}>
      <MarquerLue href="/jeux/ministre-des-finances/" />
      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 sm:py-14">
        <FilAriane etapes={[{ label: "Jouer", href: "/jouer/" }, { label: "Ministre des Finances" }]} />
        <h1 className="mt-6 font-serif text-3xl font-semibold tracking-tight text-ink sm:text-4xl">Ministre des Finances</h1>
        <p className="mt-4 max-w-3xl text-lg leading-relaxed text-muted">
          Vous avez cinq ans. Chaque année, vous votez un budget : économies, hausses d&apos;impôts, investissements. Puis un
          imprévu survient. À la fin du mandat, votre bilan est mesuré sur quatre critères explicites. Le modèle est simple, et
          toutes ses hypothèses sont affichées sous le jeu : ce n&apos;est pas une prévision, mais un moyen de comprendre les
          arbitrages.
        </p>
        <div className="mt-8">
          <JeuMinistre />
        </div>
        <EtEnsuite suggestions={suitePage("/jeux/ministre-des-finances/")} />
      </div>
    </ModuleTheme>
  );
}
