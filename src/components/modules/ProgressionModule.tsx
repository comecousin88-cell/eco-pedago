"use client";

import Link from "next/link";
import { BoutonRecommencer } from "@/components/lecture/BoutonRecommencer";
import { moduleHref, type ModuleSection } from "@/content/modules";
import { effacerProgression, useProgression } from "@/lib/progression";

/**
 * Barre de progression d'un module et liste de ses sections, avec une coche
 * pour chaque section déjà lue.
 */
export function ProgressionModule({
  module,
  sections,
  courante,
}: {
  module: string;
  sections: ModuleSection[];
  /** Slug de la section affichée ; absent sur la page d'introduction. */
  courante?: string;
}) {
  const { lues, quiz } = useProgression();

  const faites = sections.filter((s) => lues.includes(moduleHref(module, s.slug))).length;
  const pourcent = sections.length ? Math.round((faites / sections.length) * 100) : 0;
  const scoreQuiz = quiz[module];

  return (
    <nav aria-label="Sections du module" className="rounded-2xl border border-line bg-surface p-4">
      <div className="flex items-center justify-between gap-2 text-sm">
        <span className="font-semibold text-ink">Progression</span>
        <span className="flex items-center gap-1 text-muted">
          {faites} / {sections.length} sections
          {(faites > 0 || scoreQuiz) && (
            <BoutonRecommencer
              message="Ta progression sur ce module sera effacée. Continuer ?"
              effacer={() => effacerProgression([moduleHref(module), ...sections.map((s) => moduleHref(module, s.slug))], [module])}
            />
          )}
        </span>
      </div>
      <div
        role="progressbar"
        aria-label="Sections lues dans ce module"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={pourcent}
        className="mt-2 h-1.5 overflow-hidden rounded-full bg-subtle"
      >
        <div className="h-full rounded-full bg-accent transition-[width] duration-500" style={{ width: `${pourcent}%` }} />
      </div>
      <ol className="mt-4 space-y-1 text-sm">
        {sections.map((s, i) => {
          const lue = lues.includes(moduleHref(module, s.slug));
          const ici = s.slug === courante;
          return (
            <li key={s.slug}>
              <Link
                href={moduleHref(module, s.slug)}
                aria-current={ici ? "page" : undefined}
                className={`flex items-start gap-2 rounded-lg px-2 py-1.5 ${
                  ici ? "bg-accent-soft font-semibold text-ink" : "text-body hover:bg-subtle"
                }`}
              >
                <span
                  aria-hidden="true"
                  className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border text-[0.6rem] ${
                    lue ? "border-accent bg-accent text-surface" : "border-line-strong text-muted"
                  }`}
                >
                  {lue ? "✓" : i + 1}
                </span>
                <span>
                  {s.title}
                  {lue && <span className="sr-only"> (lue)</span>}
                </span>
              </Link>
            </li>
          );
        })}
      </ol>
      {scoreQuiz && (
        <p className="mt-3 border-t border-line pt-3 text-sm text-muted">
          Quiz : {scoreQuiz.score} / {scoreQuiz.total}
        </p>
      )}
    </nav>
  );
}
