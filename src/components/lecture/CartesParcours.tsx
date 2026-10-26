"use client";

import Link from "next/link";
import { avancement, dureeEstimee, NIVEAU_DANS_CHAQUE_MODULE, parcours } from "@/content/parcours";
import { demarrerParcours, useParcoursActif } from "@/lib/parcours-actif";
import { effacerProgression, useProgression } from "@/lib/progression";
import { BoutonRecommencer } from "./BoutonRecommencer";

/**
 * Les quatre parcours thématiques, avec leur durée estimée, leur progression,
 * un bouton « Commencer » ou « Reprendre » et le bouton ↺ pour recommencer.
 * Le niveau de lecture se choisit dans chaque module.
 */
export function CartesParcours() {
  const { lues } = useProgression();
  const actif = useParcoursActif();

  return (
    <div>
    <p className="mb-4 text-sm text-muted">{NIVEAU_DANS_CHAQUE_MODULE}</p>
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
              <span className="text-sm text-muted">{dureeEstimee(p)}</span>
            </div>
            <p className="mt-2 flex-1 leading-relaxed text-muted">{p.accroche}</p>

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
              <div className="mt-5 flex items-center gap-2">
                <Link
                  href={cible}
                  onClick={() => demarrerParcours(p.id)}
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-ink px-5 py-2.5 font-medium text-page transition hover:opacity-85"
                >
                  {fini ? "Revoir le parcours" : commence ? "Reprendre" : "Commencer"}
                  <span aria-hidden="true">→</span>
                </Link>
                {commence && (
                  <BoutonRecommencer
                    message="Ta progression sur ce parcours sera effacée. Continuer ?"
                    effacer={() => effacerProgression(p.etapes.map((e) => e.href))}
                  />
                )}
              </div>
            ) : (
              <p className="mt-5 text-sm font-medium text-muted">Les premières étapes arrivent bientôt.</p>
            )}
          </li>
        );
      })}
    </ul>
    </div>
  );
}
