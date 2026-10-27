import type { Metadata } from "next";
import Link from "next/link";
import { EtEnsuite } from "@/components/layout/EtEnsuite";
import { FilAriane } from "@/components/modules/FilAriane";
import { ModuleTheme } from "@/components/modules/ModuleTheme";
import { rubriqueColors } from "@/content/modules";
import { getRubrique, simulateurs, themes } from "@/content/rubriques";
import { suitePage } from "@/content/suite";

const rubrique = getRubrique("jouer");

export const metadata: Metadata = { title: rubrique.label, description: rubrique.description };

const JEUX = [
  {
    href: "/jeux/redresser-les-comptes/",
    titre: "Redresser les comptes",
    texte:
      "Vous êtes ministre des Finances pour cinq ans. Un objectif, cinq budgets, près de cinquante mesures chiffrées et sourcées, un imprévu par an, et la confiance des Français à garder.",
  },
];

const GROUPES = [...themes.map((t) => ({ slug: t.slug, titre: t.titre })), { slug: "propositions", titre: "Dans les propositions au crible" }];

export default function PageJouer() {
  return (
    <ModuleTheme color={rubriqueColors.jeux}>
      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 sm:py-14">
        <FilAriane etapes={[{ label: rubrique.label }]} />
        <h1 className="mt-6 font-serif text-3xl font-semibold tracking-tight text-ink sm:text-4xl">Jouer et simuler</h1>
        <p className="mt-4 max-w-2xl text-lg leading-relaxed text-muted">
          Se mettre à la place de ceux qui décident : choisir, chiffrer, et voir les conséquences. Les jeux et les
          simulateurs s&apos;appuient sur les mêmes chiffres sourcés que le reste du site.
        </p>

        <section aria-labelledby="jeux" className="mt-10">
          <h2 id="jeux" className="font-serif text-2xl font-semibold text-ink">
            Les jeux
          </h2>
          <ul className="mt-5 grid gap-4 sm:grid-cols-2">
            {JEUX.map((j) => (
              <li key={j.href}>
                <Link
                  href={j.href}
                  className="flex h-full flex-col rounded-2xl border border-line border-t-4 border-t-accent bg-surface p-5 transition hover:-translate-y-0.5 hover:shadow-md"
                >
                  <span className="font-serif text-xl font-semibold text-ink">{j.titre}</span>
                  <span className="mt-2 text-sm leading-relaxed text-muted">{j.texte}</span>
                  <span className="mt-auto pt-4 text-sm font-medium text-accent">Jouer →</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>

        <section aria-labelledby="simulateurs" className="mt-14">
          <h2 id="simulateurs" className="font-serif text-2xl font-semibold text-ink">
            Tous les simulateurs
          </h2>
          <p className="mt-2 max-w-2xl text-muted">
            Chacun se trouve dans la page qui explique le mécanisme : le lien ouvre la page, le simulateur y est intégré.
          </p>
          {GROUPES.map((g) => {
            const liste = simulateurs.filter((s) => s.theme === g.slug);
            if (!liste.length) return null;
            return (
              <div key={g.slug} className="mt-6">
                <h3 className="text-sm font-semibold tracking-wide text-muted uppercase">{g.titre}</h3>
                <ul className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {liste.map((s) => (
                    <li key={s.href + s.titre}>
                      <Link href={s.href} className="flex h-full flex-col rounded-xl border border-line bg-surface p-4 transition hover:border-line-strong hover:shadow-sm">
                        <span className="font-medium text-ink">{s.titre}</span>
                        <span className="mt-1 text-sm text-muted">{s.description}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </section>

        <EtEnsuite suggestions={suitePage("/jouer/")} />
      </div>
    </ModuleTheme>
  );
}
