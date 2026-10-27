import type { Metadata } from "next";
import { RedresserLesComptes } from "@/components/jeux/RedresserLesComptes";
import { FilAriane } from "@/components/modules/FilAriane";
import { MarquerLue } from "@/components/modules/MarquerLue";
import { ModuleTheme } from "@/components/modules/ModuleTheme";
import { EtEnsuite } from "@/components/layout/EtEnsuite";
import { suitePage } from "@/content/suite";
import { rubriqueColors } from "@/content/modules";

export const metadata: Metadata = {
  title: "Redresser les comptes",
  description:
    "Ministre des Finances pour cinq ans : choisissez un objectif, votez cinq budgets parmi près de cinquante mesures chiffrées et sourcées, affrontez les imprévus et gardez la confiance des Français.",
};

export default function PageRedresserLesComptes() {
  return (
    <ModuleTheme color={rubriqueColors.jeux}>
      <MarquerLue href="/jeux/redresser-les-comptes/" />
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
        <FilAriane etapes={[{ label: "Jouer", href: "/jouer/" }, { label: "Redresser les comptes" }]} />
        <h1 className="mt-6 font-serif text-3xl font-semibold tracking-tight text-ink sm:text-4xl">Redresser les comptes</h1>
        <p className="mt-4 max-w-3xl text-lg leading-relaxed text-muted">
          Cinq budgets pour redresser les comptes publics. Le jeu affiche ce que rapporte chaque mesure, quand, avec
          quelle certitude, et qui la paie. Il ne dit pas lesquelles sont bonnes : c&apos;est à vous de juger.
        </p>
        <div className="mt-8">
          <RedresserLesComptes />
        </div>
        <EtEnsuite suggestions={suitePage("/jeux/redresser-les-comptes/")} />
      </div>
    </ModuleTheme>
  );
}
