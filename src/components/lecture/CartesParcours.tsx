"use client";

import Link from "next/link";
import { avancement, parcours } from "@/content/parcours";
import { demarrerParcours, useParcoursActif } from "@/lib/parcours-actif";
import { useProgression } from "@/lib/progression";

/** Les deux parcours de l'accueil, avec leur progression et un bouton pour (re)commencer. */
export function CartesParcours() {
  const { lues } = useProgression();
  const actif = useParcoursActif();

  return (
    <ul className="grid gap-4 md:grid-cols-2">
      {parcours.map((p) => {
        const a = avancement(p, lues);
        const commence = a.faites > 0;
        const fini = a.disponibles > 0 && !a.prochaine;
        const cible = a.prochaine?.href ?? p.etapes.find((e) => e.disponible)?.href;
        return (
          <li key={p.id} className="flex flex-col rounded-2xl border border-line bg-surface p-6">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h3 className="font-serif text-2xl font-semibold text-ink">{p.titre}</h3>
              <span className="text-sm text-muted">{p.duree}</span>
            </div>
            <p className="mt-2 flex-1 leading-relaxed text-muted">{p.accroche}</p>
            <p className="mt-3 text-sm text-muted">
              Mode de lecture : <strong className="text-body">{p.mode === "simple" ? "Simple" : "Approfondi"}</strong>{" "}
              (modifiable à tout moment)
            </p>

            <div className="mt-5">
              <div className="flex items-baseline justify-between text-sm">
                <span className="text-muted">
                  {a.faites} / {a.disponibles} étape{a.disponibles > 1 ? "s" : ""}
                  {actif === p.id && <span className="ml-2 font-medium text-accent">· en cours</span>}
                </span>
                {a.aVenir > 0 && (
                  <span className="text-muted">
                    + {a.aVenir} à venir
                  </span>
                )}
              </div>
              <div
                role="progressbar"
                aria-label={`Progression du parcours « ${p.titre} »`}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={a.pourcent}
                className="mt-2 h-2 overflow-hidden rounded-full bg-subtle"
              >
                <div className="h-full rounded-full bg-accent transition-[width] duration-500" style={{ width: `${a.pourcent}%` }} />
              </div>
            </div>

            {cible ? (
              <Link
                href={cible}
                onClick={() => demarrerParcours(p.id)}
                className="mt-5 inline-flex items-center justify-center gap-2 self-start rounded-full bg-ink px-5 py-2.5 font-medium text-page transition hover:opacity-85"
              >
                {fini ? "Revoir le parcours" : commence ? "Reprendre" : "Commencer"}
                <span aria-hidden="true">→</span>
              </Link>
            ) : (
              <p className="mt-5 text-sm font-medium text-muted">Les premières étapes arrivent bientôt.</p>
            )}
          </li>
        );
      })}
    </ul>
  );
}
