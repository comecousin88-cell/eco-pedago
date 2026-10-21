import Link from "next/link";
import { ModuleCard } from "@/components/modules/ModuleCard";
import { CartesParcours } from "@/components/lecture/CartesParcours";
import { ModuleTheme } from "@/components/modules/ModuleTheme";
import { CarteProposition, versCarte } from "@/components/propositions/CarteProposition";
import { SoonBadge } from "@/components/ui/SoonBadge";
import { modules, rubriqueColors } from "@/content/modules";
import { propositions, propositionsPhares } from "@/content/propositions";

export default function Home() {
  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6">
      <section className="py-14 sm:py-20">
        <p className="text-sm font-semibold tracking-wide text-accent uppercase">Les finances publiques, sans le jargon</p>
        <h1 className="mt-3 max-w-3xl font-serif text-4xl leading-tight font-semibold tracking-tight text-ink sm:text-5xl">
          Dette, déficit, retraites : comprendre ce qui se joue vraiment
        </h1>
        <p className="mt-5 max-w-2xl text-lg leading-relaxed text-muted">
          D&apos;où vient l&apos;argent public, comment l&apos;État emprunte, pourquoi la hausse des
          taux coûte cher, qui paie les retraites. Des explications simples, des chiffres
          sourcés et des simulateurs pour tester par vous-même. Sans parti pris : quand un
          sujet fait débat, vous avez les arguments des deux côtés.
        </p>
        <Link
          href="#parcours"
          className="mt-8 inline-flex items-center gap-2 rounded-full bg-ink px-6 py-3 font-medium text-page transition hover:opacity-85"
        >
          Commencer
          <span aria-hidden="true">→</span>
        </Link>
      </section>

      <section aria-labelledby="parcours" className="border-t border-line py-12">
        <h2 id="parcours" className="font-serif text-2xl font-semibold text-ink">
          Choisissez votre parcours
        </h2>
        <p className="mt-2 max-w-2xl text-muted">
          Deux façons de lire le site. Vous pouvez passer de l&apos;une à l&apos;autre à tout moment avec
          l&apos;interrupteur « Simple / Approfondi ».
        </p>
        <div className="mt-6">
          <CartesParcours />
        </div>
        <div className="mt-4 flex items-start justify-between gap-3 rounded-2xl border border-line bg-surface p-5">
          <div>
            <h3 className="font-semibold text-ink">La France en 10 chiffres</h3>
            <p className="mt-1 text-sm text-muted">
              La situation des finances publiques en un coup d&apos;œil, chiffres sourcés et datés.
            </p>
          </div>
          <SoonBadge />
        </div>
      </section>

      <ModuleTheme color={rubriqueColors.propositions}>
        <section aria-labelledby="propositions" className="border-t border-line py-12">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h2 id="propositions" className="font-serif text-2xl font-semibold text-ink">
              Les propositions au crible
            </h2>
            <Link href="/propositions/" className="text-sm font-medium text-accent underline underline-offset-4">
              Voir les {propositions.length} fiches
            </Link>
          </div>
          <p className="mt-2 max-w-2xl text-muted">
            Les idées qui reviennent dans le débat, présentées sous leur meilleur jour, chiffrées, puis jugées sur leur
            mécanisme. Aucun parti n&apos;est nommé.
          </p>
          <ul className="mt-6 grid gap-4 sm:grid-cols-2">
            {propositionsPhares.map((p) => (
              <li key={p.slug}>
                <CarteProposition fiche={versCarte(p)} />
              </li>
            ))}
          </ul>
        </section>
      </ModuleTheme>

      <section aria-labelledby="premiers" className="border-t border-line py-12">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 id="premiers" className="font-serif text-2xl font-semibold text-ink">
            Les premiers modules
          </h2>
          <Link href="/modules/" className="text-sm font-medium text-accent underline underline-offset-4">
            Voir les {modules.length} modules
          </Link>
        </div>
        <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {modules.slice(0, 3).map((m) => (
            <li key={m.slug}>
              <ModuleCard module={m} />
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
