import type { Metadata } from "next";
import Link from "next/link";
import { CarteIndicateur } from "@/components/indicateurs/CarteIndicateur";
import { DerniereVerification } from "@/components/indicateurs/DerniereVerification";
import { FilAriane } from "@/components/modules/FilAriane";
import { MarquerLue } from "@/components/modules/MarquerLue";
import { ModuleTheme } from "@/components/modules/ModuleTheme";
import { indicateurs } from "@/content/indicateurs";
import { rubriqueColors } from "@/content/modules";

export const metadata: Metadata = {
  title: "Tableau de bord",
  description:
    "Les sept indicateurs à suivre pour comprendre les finances publiques : taux de la BCE, taux à 10 ans, écart avec l'Allemagne, inflation, chômage, dette et déficit. Chaque chiffre avec sa source et sa date.",
};

export default function TableauDeBordPage() {
  return (
    <ModuleTheme color={rubriqueColors.indicateurs}>
      <MarquerLue href="/tableau-de-bord/" />
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
        <FilAriane etapes={[{ label: "Tableau de bord" }]} />
        <p className="mt-6 text-sm font-semibold tracking-wide text-accent uppercase">Module 7</p>
        <h1 className="mt-2 font-serif text-3xl font-semibold tracking-tight text-ink sm:text-4xl">Tableau de bord</h1>
        <p className="mt-4 max-w-3xl text-lg leading-relaxed text-muted">
          Les sept chiffres à suivre pour comprendre où en sont les finances publiques : ce que coûte l&apos;argent (taux de
          la BCE, taux d&apos;emprunt de l&apos;État, écart avec l&apos;Allemagne), l&apos;état de l&apos;économie (inflation,
          chômage) et celui des comptes publics (dette, déficit). Chaque carte donne la dernière valeur, sa date, sa source,
          ce qu&apos;elle mesure et la page du site qui explique le mécanisme.
        </p>

        <div className="mt-6 max-w-3xl">
          <DerniereVerification />
        </div>

        <ul className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {indicateurs.map((i) => (
            <li key={i.id}>
              <CarteIndicateur indicateur={i} />
            </li>
          ))}
        </ul>

        <section aria-labelledby="methode" className="mt-12 max-w-3xl rounded-2xl border border-line bg-surface p-5 text-sm leading-relaxed text-body">
          <h2 id="methode" className="font-semibold text-ink">
            D&apos;où viennent ces chiffres
          </h2>
          <p className="mt-2">
            Les taux, l&apos;inflation et le chômage sont vérifiés automatiquement chaque matin auprès de la Banque centrale
            européenne, d&apos;Eurostat et de l&apos;Insee. Les nouvelles valeurs ne sont publiées qu&apos;après des contrôles
            de vraisemblance et l&apos;ensemble des tests du site ; si une source ne répond pas, ses dernières valeurs sont
            conservées avec leur date. La dette et le solde public, publiés par l&apos;Insee une fois par trimestre ou par
            an, sont mis à jour à la main.
          </p>
          <p className="mt-2">
            Les indicateurs n&apos;ont pas la même fréquence : les taux sont des moyennes mensuelles, le chômage est
            trimestriel, le déficit n&apos;est mesuré qu&apos;une fois par an. Pour comparer, chaque carte rapproche la
            dernière valeur de celle d&apos;un an plus tôt. Tous les chiffres et leurs sources sont détaillés sur la page{" "}
            <Link href="/sources/" className="underline underline-offset-4">
              Sources et méthode
            </Link>
            .
          </p>
        </section>
      </div>
    </ModuleTheme>
  );
}
