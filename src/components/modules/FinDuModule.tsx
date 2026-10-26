"use client";

import Link from "next/link";
import { Quiz, type QuestionQuiz } from "@/components/pedago/Quiz";
import { APRES_DERNIER_MODULE, finsDeModule } from "@/content/fin-de-module";
import { modules, rubriqueColors } from "@/content/modules";
import { modulesTermines } from "@/lib/avancement-modules";
import { useProgression } from "@/lib/progression";
import { ModuleTheme } from "./ModuleTheme";

/** Nombre de questions du mini-quiz de fin de module, prises dans le quiz du module. */
export const QUESTIONS_MINI_QUIZ = 3;

const CARTE = "group flex h-full flex-col rounded-2xl border border-line border-t-4 border-t-accent bg-surface p-5 transition hover:-translate-y-0.5 hover:shadow-md";

/**
 * Écran de fin de module, après la dernière section : il remplace « Suivant »
 * et « Et ensuite ? ». Module terminé, trois idées à retenir, mini-quiz de
 * trois questions corrigées, progression sur les 12 modules, carte vers le
 * module suivant (dans sa couleur) et un lien secondaire. Après le dernier
 * module : les propositions au crible et le jeu « Redresser les comptes ».
 */
export function FinDuModule({ module: slug, quiz }: { module: string; quiz?: QuestionQuiz[] }) {
  const { lues } = useProgression();
  const i = modules.findIndex((m) => m.slug === slug);
  const m = modules[i];
  const suivant = modules[i + 1];
  const fin = finsDeModule[slug];

  return (
    <section aria-labelledby="fin-du-module" className="mt-14 border-t-2 border-accent-line pt-10">
      <h2 id="fin-du-module" className="font-serif text-3xl font-semibold text-ink">
        <span aria-hidden="true" className="text-accent">
          ✓{" "}
        </span>
        Module terminé : {m.title}
      </h2>
      <p className="mt-2 text-muted">
        Tu as terminé {modulesTermines(lues)} module{modulesTermines(lues) > 1 ? "s" : ""} sur {modules.length}.
      </p>

      <div data-bloc="Ce qu'il faut retenir" className="mt-8 rounded-2xl border-2 border-accent-line bg-surface px-5 py-5 sm:px-6">
        <h3 className="font-serif text-xl font-semibold text-ink">Ce qu&apos;il faut retenir</h3>
        <ol className="mt-4 space-y-3">
          {fin.retenir.map((idee, k) => (
            <li key={idee} className="flex gap-3 leading-relaxed text-body">
              <span aria-hidden="true" className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-accent-soft text-sm font-semibold text-accent">
                {k + 1}
              </span>
              <span>{idee}</span>
            </li>
          ))}
        </ol>
      </div>

      {quiz && quiz.length > 0 && (
        <Quiz module={slug} questions={quiz.slice(0, QUESTIONS_MINI_QUIZ)} titre="Mini-quiz" niveau={3} />
      )}

      <h3 className="font-serif text-xl font-semibold text-ink">{suivant ? "Et maintenant ?" : "Et maintenant, à vous"}</h3>
      <p className="mt-2 max-w-2xl text-body">{fin.transition}</p>
      {suivant ? (
        <ModuleTheme color={suivant.color} className="mt-4 max-w-md">
          <Link href={`/modules/${suivant.slug}/`} className={CARTE}>
            <span className="text-sm font-semibold text-accent">Module {suivant.number}</span>
            <span className="mt-1 font-serif text-xl font-semibold text-ink">{suivant.title}</span>
            <span className="mt-1 text-sm text-muted">{suivant.question}</span>
            <span className="mt-4 text-sm font-medium text-accent">
              Commencer le module {suivant.number}{" "}
              <span aria-hidden="true" className="inline-block transition-transform group-hover:translate-x-1">
                →
              </span>
            </span>
          </Link>
        </ModuleTheme>
      ) : (
        <ul className="mt-4 grid gap-4 sm:grid-cols-2">
          {APRES_DERNIER_MODULE.map((c, k) => (
            <li key={c.href}>
              <ModuleTheme color={k === 0 ? rubriqueColors.propositions : rubriqueColors.jeux} className="h-full">
                <Link href={c.href} className={CARTE}>
                  <span className="font-serif text-xl font-semibold text-ink">{c.titre}</span>
                  <span className="mt-1 text-sm text-muted">{c.texte}</span>
                  <span aria-hidden="true" className="mt-4 text-sm font-medium text-accent">
                    →
                  </span>
                </Link>
              </ModuleTheme>
            </li>
          ))}
        </ul>
      )}

      <p className="mt-6 text-sm">
        <span className="text-muted">Aussi : </span>
        <Link href={fin.aussi.href} className="text-muted underline decoration-line-strong underline-offset-4 hover:text-ink">
          {fin.aussi.titre}
        </Link>
      </p>
    </section>
  );
}
