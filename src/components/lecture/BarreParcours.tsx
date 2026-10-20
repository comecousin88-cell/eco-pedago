"use client";

import Link from "next/link";
import { avancement, getParcours, positionDans } from "@/content/parcours";
import { quitterParcours, useParcoursActif } from "@/lib/parcours-actif";
import { useProgression } from "@/lib/progression";

/**
 * Sur une page qui fait partie du parcours en cours : l'étape, la progression
 * et un lien vers l'étape suivante. Rien ne s'affiche hors parcours.
 */
export function BarreParcours({ href }: { href: string }) {
  const actif = useParcoursActif();
  const { lues } = useProgression();
  if (!actif) return null;

  const p = getParcours(actif);
  const position = positionDans(p, href);
  if (position === 0) return null;

  const a = avancement(p, lues);
  const suivante = p.etapes.slice(position).find((e) => e.disponible);

  return (
    <aside
      aria-label={`Parcours « ${p.titre} »`}
      className="rounded-2xl border border-line bg-surface px-4 py-3 text-sm"
    >
      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
        <p className="text-muted">
          <span className="font-semibold text-ink">{p.titre}</span> · étape {position} / {p.etapes.length}
        </p>
        <button type="button" onClick={quitterParcours} className="text-muted underline underline-offset-4 hover:text-ink">
          Quitter le parcours
        </button>
      </div>
      <div
        role="progressbar"
        aria-label="Progression du parcours"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={a.pourcent}
        className="mt-2 h-1.5 overflow-hidden rounded-full bg-subtle"
      >
        <div className="h-full rounded-full bg-accent" style={{ width: `${a.pourcent}%` }} />
      </div>
      {suivante ? (
        <p className="mt-2">
          Étape suivante :{" "}
          <Link href={suivante.href} className="font-medium text-accent underline underline-offset-4">
            {suivante.titre}
          </Link>
        </p>
      ) : (
        <p className="mt-2 text-muted">
          {position === p.etapes.length ? "Dernière étape du parcours." : "Les étapes suivantes arrivent bientôt."}
        </p>
      )}
    </aside>
  );
}
