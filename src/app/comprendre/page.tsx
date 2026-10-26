import type { Metadata } from "next";
import Link from "next/link";
import { EtEnsuite } from "@/components/layout/EtEnsuite";
import { FilAriane } from "@/components/modules/FilAriane";
import { GrilleModules } from "@/components/modules/GrilleModules";
import { getRubrique } from "@/content/rubriques";
import { suitePage } from "@/content/suite";

const rubrique = getRubrique("comprendre");

export const metadata: Metadata = { title: rubrique.label, description: rubrique.description };

const AUSSI = [
  { href: "/la-france-en-10-chiffres/", titre: "La France en 10 chiffres", texte: "La situation des finances publiques en un coup d'œil, chiffres sourcés et datés." },
  { href: "/glossaire/", titre: "Le glossaire", texte: "Tous les termes techniques du site, expliqués simplement." },
];

export default function PageComprendre() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 sm:py-14">
      <FilAriane etapes={[{ label: rubrique.label }]} />
      <h1 className="mt-6 font-serif text-3xl font-semibold tracking-tight text-ink sm:text-4xl">Les 12 modules</h1>
      <p className="mt-4 mb-8 max-w-2xl text-lg leading-relaxed text-muted">
        Chaque module part d&apos;une question simple. Ils se suivent dans l&apos;ordre conseillé, en quatre parties,
        comme les chapitres d&apos;un manuel.
      </p>

      <GrilleModules niveau={2} />

      <section aria-labelledby="aussi" className="mt-14">
        <h2 id="aussi" className="font-serif text-2xl font-semibold text-ink">
          Aussi
        </h2>
        <ul className="mt-4 grid gap-3 sm:grid-cols-2">
          {AUSSI.map((c) => (
            <li key={c.href}>
              <Link href={c.href} className="flex h-full flex-col rounded-2xl border border-line bg-surface p-4 transition hover:-translate-y-0.5 hover:shadow-md">
                <span className="font-semibold text-ink">{c.titre}</span>
                <span className="mt-1 text-sm text-muted">{c.texte}</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <EtEnsuite suggestions={suitePage("/comprendre/")} />
    </div>
  );
}
