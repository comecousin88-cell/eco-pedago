import type { Metadata } from "next";
import { FilAriane } from "@/components/modules/FilAriane";
import { MarquerLue } from "@/components/modules/MarquerLue";
import { ModuleTheme } from "@/components/modules/ModuleTheme";
import { versCarte } from "@/components/propositions/CarteProposition";
import { ListePropositions } from "@/components/propositions/ListePropositions";
import { rubriqueColors } from "@/content/modules";
import { EtEnsuite } from "@/components/layout/EtEnsuite";
import { suitePage } from "@/content/suite";
import { THEMES, propositions } from "@/content/propositions";

export const metadata: Metadata = {
  title: "Les propositions au crible",
  description:
    "Annuler la dette, taxer les plus riches, sortir de l'euro, retraite à 60 ans… Chaque proposition analysée avec ses meilleurs arguments, ses chiffres et un verdict sur le mécanisme.",
};

export default function PropositionsPage() {
  return (
    <ModuleTheme color={rubriqueColors.propositions}>
      <MarquerLue href="/propositions/" />
      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 sm:py-14">
        <FilAriane etapes={[{ label: "Décrypter", href: "/decrypter/" }, { label: "Les propositions au crible" }]} />
        <h1 className="mt-6 font-serif text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
          Les propositions au crible
        </h1>
        <p className="mt-4 max-w-2xl text-lg leading-relaxed text-muted">
          Des idées qui reviennent dans le débat public, analysées une par une, toujours de la même façon : l&apos;idée et
          ce qu&apos;elle veut résoudre, présentée sous son meilleur jour ; comment elle marcherait ; ce qu&apos;en disent
          les économistes ; les ordres de grandeur ; et un verdict.
        </p>
        <div className="mt-6 rounded-2xl border border-line bg-surface p-5 text-sm leading-relaxed text-body">
          <p className="font-semibold text-ink">La règle du jeu</p>
          <p className="mt-1">
            Les fiches analysent des mécanismes. Quand une proposition est attribuée à un parti ou à un gouvernement, c&apos;est
            avec sa source, et les porteurs des propositions comparables ou opposées sur le même sujet sont nommés de la
            même façon. Le verdict porte sur la proposition et ses chiffres, jamais sur le parti. Il distingue ce qui est démontrable
            (comptabilité, arithmétique, droit) de ce qui reste un débat d&apos;économistes. Trois niveaux :
            « mécanisme solide », « débattu », « ne tient pas en l&apos;état ».
          </p>
        </div>
        <ListePropositions propositions={propositions.map(versCarte)} themes={THEMES} />
        <EtEnsuite suggestions={suitePage("/propositions/")} />
      </div>
    </ModuleTheme>
  );
}
