import type { Metadata } from "next";
import { FilAriane } from "@/components/modules/FilAriane";
import { ModuleCard } from "@/components/modules/ModuleCard";
import { modules } from "@/content/modules";

export const metadata: Metadata = {
  title: "Les modules",
  description:
    "Déficit, dette, emprunt de l'État, banque centrale, retraites, fiche de paie, impôts : les finances publiques expliquées pas à pas.",
};

const PARTIES = [
  { titre: "Les finances publiques et la dette", slugs: ["les-bases", "deficit-et-dette", "emprunt-etat", "boule-de-neige", "banque-centrale"] },
  { titre: "Les retraites et le travail", slugs: ["retraites", "fiche-de-paie"] },
  {
    titre: "Impôts, Europe et mise en perspective",
    slugs: ["fiscalite", "cadre-europeen", "dette-en-perspective", "comparaisons", "histoire-des-dettes"],
  },
];

export default function ModulesPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 sm:py-14">
      <FilAriane etapes={[{ label: "Modules" }]} />
      <h1 className="mt-6 font-serif text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
        Comprendre les finances publiques, pas à pas
      </h1>
      <p className="mt-4 max-w-2xl text-lg leading-relaxed text-muted">
        Chaque module part d&apos;une question simple. Chaque notion se lit en trois niveaux :
        l&apos;essentiel en deux minutes, le mécanisme avec un exemple chiffré, puis les détails
        pour aller plus loin. Un quiz clôt chaque module.
      </p>

      {PARTIES.map((partie) => (
        <section key={partie.titre} aria-labelledby={partie.titre} className="mt-12">
          <h2 id={partie.titre} className="font-serif text-2xl font-semibold text-ink">
            {partie.titre}
          </h2>
          <ul className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {partie.slugs.map((slug) => {
              const m = modules.find((x) => x.slug === slug)!;
              return (
                <li key={slug}>
                  <ModuleCard module={m} />
                </li>
              );
            })}
          </ul>
        </section>
      ))}
    </div>
  );
}
