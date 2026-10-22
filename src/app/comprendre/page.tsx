import type { Metadata } from "next";
import Link from "next/link";
import { CartesParcours } from "@/components/lecture/CartesParcours";
import { EtEnsuite } from "@/components/layout/EtEnsuite";
import { FilAriane } from "@/components/modules/FilAriane";
import { ModuleCard } from "@/components/modules/ModuleCard";
import { getRubrique, modulesDuTheme, themes } from "@/content/rubriques";
import { suitePage } from "@/content/suite";

const rubrique = getRubrique("comprendre");

export const metadata: Metadata = { title: rubrique.label, description: rubrique.description };

const POUR_COMMENCER = [
  { href: "/la-france-en-10-chiffres/", titre: "La France en 10 chiffres", texte: "La situation des finances publiques en un coup d'œil, chiffres sourcés et datés." },
  { href: "/glossaire/", titre: "Le glossaire", texte: "Tous les termes techniques du site, expliqués simplement." },
];

export default function PageComprendre() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 sm:py-14">
      <FilAriane etapes={[{ label: rubrique.label }]} />
      <h1 className="mt-6 font-serif text-3xl font-semibold tracking-tight text-ink sm:text-4xl">Comprendre les finances publiques</h1>
      <p className="mt-4 max-w-2xl text-lg leading-relaxed text-muted">
        Chaque module part d&apos;une question simple et se lit en trois niveaux : l&apos;essentiel en deux minutes, le
        mécanisme avec un exemple chiffré, puis les détails pour aller plus loin.
      </p>

      <section aria-labelledby="commencer" className="mt-10">
        <h2 id="commencer" className="font-serif text-2xl font-semibold text-ink">
          Pour commencer
        </h2>
        <div className="mt-5">
          <CartesParcours />
        </div>
        <ul className="mt-4 grid gap-3 sm:grid-cols-2">
          {POUR_COMMENCER.map((c) => (
            <li key={c.href}>
              <Link href={c.href} className="flex h-full flex-col rounded-2xl border border-line bg-surface p-4 transition hover:-translate-y-0.5 hover:shadow-md">
                <span className="font-semibold text-ink">{c.titre}</span>
                <span className="mt-1 text-sm text-muted">{c.texte}</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      {themes.map((t) => (
        <section key={t.slug} id={t.slug} aria-labelledby={`titre-${t.slug}`} className="mt-14 scroll-mt-24">
          <h2 id={`titre-${t.slug}`} className="font-serif text-2xl font-semibold text-ink">
            {t.titre}
          </h2>
          <p className="mt-2 max-w-2xl text-muted">{t.description}</p>
          <ul className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {modulesDuTheme(t).map((m) => (
              <li key={m.slug}>
                <ModuleCard module={m} />
              </li>
            ))}
          </ul>
        </section>
      ))}

      <EtEnsuite suggestions={suitePage("/comprendre/")} />
    </div>
  );
}
