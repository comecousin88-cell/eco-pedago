import type { Metadata } from "next";
import { FilAriane } from "@/components/modules/FilAriane";
import { glossaire } from "@/content/glossaire";
import { GlossaireRecherche } from "./GlossaireRecherche";

export const metadata: Metadata = {
  title: "Glossaire",
  description: "Les termes de l'économie publique expliqués simplement : déficit, dette, OAT, spread, CSG…",
};

export default function GlossairePage() {
  const tries = [...glossaire].sort((a, b) => a.terme.localeCompare(b.terme, "fr"));
  const noms = Object.fromEntries(glossaire.map((e) => [e.id, e.terme]));
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-14">
      <FilAriane etapes={[{ label: "Glossaire" }]} />
      <h1 className="mt-6 font-serif text-3xl font-semibold tracking-tight text-ink sm:text-4xl">Glossaire</h1>
      <p className="mt-4 text-lg leading-relaxed text-muted">
        {glossaire.length} termes, expliqués sans jargon. Dans les modules, un mot souligné en
        pointillés ouvre directement sa définition.
      </p>
      <GlossaireRecherche entrees={tries} noms={noms} />
    </div>
  );
}
