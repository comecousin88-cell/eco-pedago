"use client";

import Link from "next/link";
import { BoutonRecommencer } from "@/components/lecture/BoutonRecommencer";
import { getModule, type ModuleInfo } from "@/content/modules";
import { themes } from "@/content/rubriques";
import { avancementModule, NIVEAU_DANS_CHAQUE_MODULE, pagesDuModule, reprise } from "@/lib/avancement-modules";
import { effacerProgression, useProgression } from "@/lib/progression";
import { ModuleTheme } from "./ModuleTheme";

const BOUTON = "inline-flex items-center justify-center gap-2 rounded-full bg-ink px-5 py-2.5 font-medium text-page transition hover:opacity-85";

/**
 * « Les 12 modules » : numérotés dans l'ordre conseillé et rangés en quatre
 * parties, comme les chapitres d'un manuel. Un seul bouton principal au-dessus
 * (« Commencer par le module 1 » ou « Reprendre où j'en étais ») ; sur chaque
 * carte, la progression, « Commencer » ou « Reprendre », et ↺.
 */
export function GrilleModules({ niveau = 2 }: { /** Niveau des titres de parties (les cartes sont un cran en dessous). */ niveau?: 2 | 3 }) {
  const { lues, passees } = useProgression();
  const r = reprise(lues, passees);
  const TitrePartie = `h${niveau}` as "h2" | "h3";

  return (
    <div>
      <div className="flex flex-col items-start gap-3">
        <Link href={r.href} className={BOUTON}>
          {r.commence ? "Reprendre où j'en étais" : "Commencer par le module 1"}
          <span aria-hidden="true">→</span>
        </Link>
        <p className="text-sm text-muted">{NIVEAU_DANS_CHAQUE_MODULE}</p>
      </div>

      {themes.map((t, i) => (
        <section key={t.slug} id={t.slug} aria-labelledby={`partie-${t.slug}`} className="mt-10 scroll-mt-24">
          <TitrePartie id={`partie-${t.slug}`} className="font-serif text-xl font-semibold text-ink sm:text-2xl">
            <span className="text-muted">Partie {i + 1} · </span>
            {t.titre}
          </TitrePartie>
          <ul className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {t.modules.map(getModule).map((m) => (
              <li key={m.slug}>
                <CarteModule module={m} lues={lues} passees={passees} titre={niveau === 2 ? "h3" : "h4"} />
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}

function CarteModule({ module: m, lues, passees, titre: Titre }: { module: ModuleInfo; lues: string[]; passees: string[]; titre: "h3" | "h4" }) {
  const a = avancementModule(m, lues, passees);
  return (
    <ModuleTheme color={m.color} className="h-full">
      <div className="flex h-full flex-col rounded-2xl border border-line border-t-4 border-t-accent bg-surface p-5">
        <div className="flex items-start gap-3">
          <span
            aria-hidden="true"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent-soft text-sm font-semibold text-accent"
          >
            {m.number}
          </span>
          <Titre className="font-serif text-lg leading-snug font-semibold text-ink">
            <span className="sr-only">Module {m.number} : </span>
            {m.title}
          </Titre>
        </div>
        <p className="mt-2 flex-1 text-sm leading-relaxed text-muted">{m.question}</p>

        <div className="mt-4">
          <p className="text-xs text-muted">
            {a.etat === "termine" ? "✓ Terminé" : `${a.faites} / ${a.total} pages lues`}
          </p>
          <div
            role="progressbar"
            aria-label={`Progression du module « ${m.title} »`}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={a.pourcent}
            className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-subtle"
          >
            <div className="h-full rounded-full bg-accent transition-[width] duration-500" style={{ width: `${a.pourcent}%` }} />
          </div>
        </div>

        <div className="mt-4 flex items-center gap-2">
          <Link
            href={a.cible}
            className="inline-flex items-center gap-1.5 rounded-full border border-line-strong px-4 py-1.5 text-sm font-medium text-ink transition hover:bg-subtle"
          >
            {a.etat === "termine" ? "Revoir" : a.etat === "en-cours" ? "Reprendre" : "Commencer"}
            <span aria-hidden="true">→</span>
            <span className="sr-only"> le module {m.title}</span>
          </Link>
          {a.etat !== "a-faire" && (
            <BoutonRecommencer
              message="Ta progression sur ce module sera effacée. Continuer ?"
              effacer={() => effacerProgression(pagesDuModule(m), [m.slug])}
            />
          )}
        </div>
      </div>
    </ModuleTheme>
  );
}
