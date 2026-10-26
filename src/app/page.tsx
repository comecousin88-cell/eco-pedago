import Link from "next/link";
import { CarteActu } from "@/components/actu/FilActu";
import { IndicateursCles } from "@/components/indicateurs/IndicateursCles";
import { GrilleModules } from "@/components/modules/GrilleModules";
import { dernieresActus } from "@/content/actu";

/** Ligne de liens discrets, en bas de l'accueil : le reste du site, sans doublon avec les blocs au-dessus. */
const LIENS_ACCUEIL = [
  { href: "/propositions/", label: "Propositions au crible" },
  { href: "/idees-recues/", label: "Idées reçues" },
  { href: "/la-france-en-10-chiffres/", label: "La France en 10 chiffres" },
  { href: "/jouer/", label: "Jouer" },
  { href: "/glossaire/", label: "Glossaire" },
  { href: "/tableau-de-bord/", label: "Tableau de bord" },
];

/**
 * Accueil, en quatre blocs seulement : à quoi sert le site et les quatre
 * indicateurs clés ; les 12 modules ; les trois dernières actus ; une ligne de
 * liens vers le reste. Tout le reste passe par le menu.
 */
export default function Home() {
  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6">
      <section aria-labelledby="accueil-titre" className="pt-6 pb-8 sm:pt-12 sm:pb-10">
        <h1 id="accueil-titre" className="max-w-3xl font-serif text-xl leading-snug font-semibold tracking-tight text-ink sm:text-3xl">
          Comprendre la dette, le déficit, les retraites et les impôts, avec des chiffres sourcés et sans parti pris.
        </h1>
        <div className="mt-6">
          <IndicateursCles />
        </div>
      </section>

      <section aria-labelledby="modules" className="border-t border-line py-8 sm:py-12">
        <h2 id="modules" className="mb-4 font-serif sm:mb-6 text-2xl font-semibold text-ink">
          Les 12 modules
        </h2>
        <GrilleModules niveau={3} />
      </section>

      <section aria-labelledby="actu" className="border-t border-line py-12">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 id="actu" className="font-serif text-2xl font-semibold text-ink">
            L&apos;actu
          </h2>
          <Link href="/actu/" className="text-sm font-medium text-accent underline underline-offset-4">
            Tout le fil <span aria-hidden="true">→</span>
          </Link>
        </div>
        <ul className="mt-5 grid gap-3 md:grid-cols-3">
          {dernieresActus(3).map((e) => (
            <li key={e.id}>
              <CarteActu e={e} compacte />
            </li>
          ))}
        </ul>
      </section>

      <nav aria-label="Aussi sur le site" className="border-t border-line py-10">
        <ul className="flex flex-wrap gap-x-6 gap-y-3 text-sm">
          {LIENS_ACCUEIL.map((l) => (
            <li key={l.href}>
              <Link href={l.href} className="text-muted underline decoration-line-strong underline-offset-4 hover:text-ink">
                {l.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}
