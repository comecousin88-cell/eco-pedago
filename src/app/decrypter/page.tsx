import type { Metadata } from "next";
import Link from "next/link";
import { EtEnsuite } from "@/components/layout/EtEnsuite";
import { FilAriane } from "@/components/modules/FilAriane";
import { ModuleTheme } from "@/components/modules/ModuleTheme";
import { CarteProposition, versCarte } from "@/components/propositions/CarteProposition";
import { idees } from "@/content/idees-recues";
import { rubriqueColors } from "@/content/modules";
import { propositions, propositionsPhares } from "@/content/propositions";
import { getRubrique } from "@/content/rubriques";
import { suitePage } from "@/content/suite";

const rubrique = getRubrique("decrypter");

export const metadata: Metadata = { title: rubrique.label, description: rubrique.description };

export default function PageDecrypter() {
  const entrees = [
    {
      href: "/propositions/",
      titre: "Les propositions au crible",
      texte: `${propositions.filter((p) => p.contenu).length} propositions du débat public, présentées sous leur meilleur jour, chiffrées, puis jugées sur leur mécanisme.`,
    },
    {
      href: "/idees-recues/",
      titre: "Idées reçues",
      texte: `${idees.length} affirmations qu'on entend souvent, vérifiées chiffres à l'appui : vrai, faux ou plus nuancé.`,
    },
  ];
  return (
    <ModuleTheme color={rubriqueColors.propositions}>
      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 sm:py-14">
        <FilAriane etapes={[{ label: rubrique.label }]} />
        <h1 className="mt-6 font-serif text-3xl font-semibold tracking-tight text-ink sm:text-4xl">Décrypter le débat</h1>
        <p className="mt-4 max-w-2xl text-lg leading-relaxed text-muted">
          Pour se faire un avis : chaque idée est présentée avec ses meilleurs arguments, chiffrée, puis jugée sur ce
          qu&apos;elle produirait, jamais sur ceux qui la portent.
        </p>
        <ul className="mt-8 grid gap-4 sm:grid-cols-2">
          {entrees.map((e) => (
            <li key={e.href}>
              <Link
                href={e.href}
                className="flex h-full flex-col rounded-2xl border border-line border-t-4 border-t-accent bg-surface p-5 transition hover:-translate-y-0.5 hover:shadow-md"
              >
                <span className="font-serif text-xl font-semibold text-ink">{e.titre}</span>
                <span className="mt-2 text-sm leading-relaxed text-muted">{e.texte}</span>
                <span className="mt-auto pt-4 text-sm font-medium text-accent">Voir →</span>
              </Link>
            </li>
          ))}
        </ul>

        <section aria-labelledby="phares" className="mt-14">
          <h2 id="phares" className="font-serif text-2xl font-semibold text-ink">
            Les fiches les plus lues
          </h2>
          <ul className="mt-5 grid gap-4 sm:grid-cols-2">
            {propositionsPhares.map((p) => (
              <li key={p.slug}>
                <CarteProposition fiche={versCarte(p)} />
              </li>
            ))}
          </ul>
        </section>

        <EtEnsuite suggestions={suitePage("/decrypter/")} />
      </div>
    </ModuleTheme>
  );
}
