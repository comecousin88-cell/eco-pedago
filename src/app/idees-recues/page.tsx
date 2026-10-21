import type { Metadata } from "next";
import { FilAriane } from "@/components/modules/FilAriane";
import { MarquerLue } from "@/components/modules/MarquerLue";
import { ModuleTheme } from "@/components/modules/ModuleTheme";
import { CartesIdees } from "@/components/pedago/CartesIdees";
import { idees } from "@/content/idees-recues";
import { rubriqueColors } from "@/content/modules";

export const metadata: Metadata = {
  title: "Idées reçues",
  description:
    "« La moitié des Français ne paient pas d'impôts », « la BCE peut effacer la dette »… Dix-huit affirmations vérifiées, chiffres et sources à l'appui.",
};

export default function PageIdeesRecues() {
  return (
    <ModuleTheme color={rubriqueColors.transverse}>
      <MarquerLue href="/idees-recues/" />
      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 sm:py-14">
        <FilAriane etapes={[{ label: "Idées reçues" }]} />
        <h1 className="mt-6 font-serif text-3xl font-semibold tracking-tight text-ink sm:text-4xl">Idées reçues</h1>
        <p className="mt-4 max-w-2xl text-lg leading-relaxed text-muted">
          {idees.length} affirmations qu&apos;on entend souvent sur la dette, les impôts et les retraites. Faites-vous un avis,
          puis retournez la carte : le verdict porte sur l&apos;affirmation telle qu&apos;elle est formulée, chiffres sourcés à
          l&apos;appui, avec un lien vers la page qui explique le mécanisme.
        </p>
        <div className="mt-8">
          <CartesIdees idees={idees} />
        </div>
      </div>
    </ModuleTheme>
  );
}
