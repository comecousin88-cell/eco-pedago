import type { Metadata } from "next";
import Link from "next/link";
import { FilActu } from "@/components/actu/FilActu";
import { BandeauAlertes } from "@/components/indicateurs/BandeauAlertes";
import { DerniereVerification } from "@/components/indicateurs/DerniereVerification";
import { ProchainesEcheances } from "@/components/indicateurs/ProchainesEcheances";
import { EtEnsuite } from "@/components/layout/EtEnsuite";
import { FilAriane } from "@/components/modules/FilAriane";
import { ModuleTheme } from "@/components/modules/ModuleTheme";
import { construireFil } from "@/content/actu";
import { rubriqueColors } from "@/content/modules";
import { getRubrique } from "@/content/rubriques";
import { suitePage } from "@/content/suite";

const rubrique = getRubrique("actu");

export const metadata: Metadata = { title: rubrique.label, description: rubrique.description };

export default function PageActu() {
  return (
    <ModuleTheme color={rubriqueColors.indicateurs}>
      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 sm:py-14">
        <FilAriane etapes={[{ label: rubrique.label }]} />
        <h1 className="mt-6 font-serif text-3xl font-semibold tracking-tight text-ink sm:text-4xl">L&apos;actu des finances publiques</h1>
        <p className="mt-4 max-w-2xl text-lg leading-relaxed text-muted">
          Ce qui bouge, dans l&apos;ordre : les seuils franchis, les échéances et les publications officielles sur la dette,
          le budget, les retraites, les impôts, l&apos;inflation, les taux, l&apos;emploi et la croissance (Insee, BCE,
          Banque de France, Eurostat, Cour des comptes, Haut Conseil des finances publiques, Assemblée nationale, Sénat).
          Chaque entrée renvoie vers l&apos;original et vers la page du site qui explique le sujet.
        </p>

        <div className="mt-8 max-w-3xl space-y-3">
          <BandeauAlertes lienTableau={false} />
          <DerniereVerification />
        </div>

        <Link
          href="/tableau-de-bord/"
          className="mt-6 flex max-w-3xl flex-col rounded-2xl border border-line border-t-4 border-t-accent bg-surface p-5 transition hover:-translate-y-0.5 hover:shadow-md"
        >
          <span className="font-serif text-xl font-semibold text-ink">Le tableau de bord</span>
          <span className="mt-2 text-sm leading-relaxed text-muted">
            Les sept indicateurs à suivre : taux de la BCE, taux d&apos;emprunt de l&apos;État, écart avec l&apos;Allemagne,
            inflation, chômage, dette et déficit, avec leur source, leur date et leur historique.
          </span>
          <span className="mt-3 text-sm font-medium text-accent">Voir le tableau de bord →</span>
        </Link>

        <div className="mt-12 max-w-3xl">
          <FilActu entrees={construireFil()} />
        </div>

        <div className="mt-14 max-w-4xl">
          <ProchainesEcheances nombre={6} />
        </div>

        <EtEnsuite suggestions={suitePage("/actu/")} />
      </div>
    </ModuleTheme>
  );
}
