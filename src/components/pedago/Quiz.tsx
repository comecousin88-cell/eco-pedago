"use client";

import { useState } from "react";
import { enregistrerQuiz } from "@/lib/progression";

export interface QuestionQuiz {
  question: string;
  choix: string[];
  /** Index de la bonne réponse dans `choix`. */
  bonne: number;
  /** Pourquoi c'est la bonne réponse (affiché après la réponse, juste ou fausse). */
  explication: string;
}

export function Quiz({ module, questions }: { module: string; questions: QuestionQuiz[] }) {
  const [reponses, setReponses] = useState<(number | null)[]>(() => questions.map(() => null));
  const total = questions.length;
  const repondu = reponses.filter((r) => r !== null).length;
  const score = reponses.filter((r, i) => r === questions[i].bonne).length;
  const fini = repondu === total;

  function repondre(i: number, choix: number) {
    if (reponses[i] !== null) return;
    const suivantes = reponses.map((r, k) => (k === i ? choix : r));
    setReponses(suivantes);
    if (suivantes.every((r) => r !== null)) {
      enregistrerQuiz(
        module,
        suivantes.filter((r, k) => r === questions[k].bonne).length,
        total,
      );
    }
  }

  return (
    <section aria-labelledby={`quiz-${module}`} className="my-10 rounded-2xl border border-accent-line bg-surface p-5 sm:p-6">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 id={`quiz-${module}`} className="font-serif text-2xl font-semibold text-ink">
          Testez-vous
        </h2>
        <p className="text-sm text-muted" aria-live="polite">
          {repondu} / {total} question{total > 1 ? "s" : ""}
        </p>
      </div>

      <ol className="mt-6 space-y-8">
        {questions.map((q, i) => {
          const r = reponses[i];
          const juste = r === q.bonne;
          return (
            <li key={q.question}>
              <fieldset>
                <legend className="font-semibold text-ink">
                  <span className="mr-2 text-accent">{i + 1}.</span>
                  {q.question}
                </legend>
                <div className="mt-3 grid gap-2">
                  {q.choix.map((c, k) => {
                    const choisi = r === k;
                    const montrerBonne = r !== null && k === q.bonne;
                    return (
                      <button
                        key={c}
                        type="button"
                        onClick={() => repondre(i, k)}
                        disabled={r !== null}
                        aria-pressed={choisi}
                        className={`flex items-center gap-3 rounded-xl border px-4 py-3 text-left transition-colors ${
                          montrerBonne
                            ? "border-ok bg-ok-soft text-ink"
                            : choisi
                              ? "border-bad bg-bad-soft text-ink"
                              : r === null
                                ? "border-line hover:border-accent hover:bg-accent-soft"
                                : "border-line opacity-60"
                        }`}
                      >
                        <span aria-hidden="true" className="w-4 shrink-0 font-semibold">
                          {montrerBonne ? <span className="text-ok">✓</span> : choisi ? <span className="text-bad">✕</span> : ""}
                        </span>
                        <span>{c}</span>
                        {montrerBonne && <span className="sr-only">(bonne réponse)</span>}
                        {choisi && !juste && <span className="sr-only">(votre réponse, incorrecte)</span>}
                      </button>
                    );
                  })}
                </div>
                {r !== null && (
                  <p className="mt-3 rounded-xl bg-subtle px-4 py-3 text-sm leading-relaxed" role="status">
                    <strong className={juste ? "text-ok" : "text-bad"}>{juste ? "Exact. " : "Pas tout à fait. "}</strong>
                    {q.explication}
                  </p>
                )}
              </fieldset>
            </li>
          );
        })}
      </ol>

      {fini && (
        <div className="mt-8 flex flex-wrap items-center justify-between gap-4 rounded-xl bg-accent-soft px-5 py-4">
          <p className="font-semibold text-ink">
            Score : {score} / {total}
            <span className="ml-2 font-normal text-muted">
              {score === total ? "Parfait !" : score >= total - 1 ? "Très bien." : "Relisez les passages concernés et réessayez."}
            </span>
          </p>
          <button
            type="button"
            onClick={() => setReponses(questions.map(() => null))}
            className="rounded-full border border-accent px-4 py-1.5 text-sm font-medium text-accent hover:bg-surface"
          >
            Recommencer
          </button>
        </div>
      )}
    </section>
  );
}
