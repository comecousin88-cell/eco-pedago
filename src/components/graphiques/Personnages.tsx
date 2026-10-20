"use client";

import { useState } from "react";
import { getSerie } from "@/lib/data";
import { formatNombre } from "@/lib/format";

/**
 * Combien d'actifs pour un retraité : des personnages, entiers ou partiels,
 * à côté d'un retraité. Deux mesures du COR au choix.
 */
const MESURES = [
  { id: "retraites.cotisants-par-retraite", libelle: "Cotisants pour un retraité", actif: "cotisant" },
  { id: "retraites.rapport-demographique", libelle: "Personnes de 20 à 64 ans pour une de 65 ans ou plus", actif: "personne de 20 à 64 ans" },
] as const;

function Silhouette({ fraction = 1, couleur }: { fraction?: number; couleur: string }) {
  const id = `clip-${Math.round(fraction * 100)}-${couleur.replace(/\W/g, "")}`;
  return (
    <svg viewBox="0 0 24 48" className="h-14 w-7 sm:h-16 sm:w-8" aria-hidden="true">
      <defs>
        <clipPath id={id}>
          <rect x={0} y={0} width={24 * fraction} height={48} />
        </clipPath>
      </defs>
      <g fill="var(--line)">
        <circle cx={12} cy={8} r={6} />
        <path d="M3 46 V22 a9 9 0 0 1 18 0 V46 Z" />
      </g>
      <g fill={couleur} clipPath={`url(#${id})`}>
        <circle cx={12} cy={8} r={6} />
        <path d="M3 46 V22 a9 9 0 0 1 18 0 V46 Z" />
      </g>
    </svg>
  );
}

export function Personnages() {
  const [m, setM] = useState(0);
  const mesure = MESURES[m];
  const serie = getSerie(mesure.id).serie;

  return (
    <div>
      <div role="group" aria-label="Mesure" className="inline-flex flex-wrap rounded-2xl border border-line p-0.5 text-sm">
        {MESURES.map((x, i) => (
          <button
            key={x.id}
            type="button"
            aria-pressed={m === i}
            onClick={() => setM(i)}
            className={`rounded-xl px-3 py-1 text-left ${m === i ? "bg-ink text-page" : "text-muted hover:text-ink"}`}
          >
            {x.libelle}
          </button>
        ))}
      </div>

      <ul className="mt-5 space-y-4">
        {serie.map((p) => {
          const entiers = Math.floor(p.y);
          const reste = p.y - entiers;
          return (
            <li key={p.x} className="grid items-center gap-3 sm:grid-cols-[4rem_minmax(0,1fr)]">
              <span className="font-serif text-xl font-semibold text-ink">{p.x}</span>
              <div className="flex flex-wrap items-end gap-3">
                <span className="flex items-end" role="img" aria-label={`${formatNombre(p.y, 2)} ${mesure.actif}s pour un retraité`}>
                  {Array.from({ length: entiers }, (_, k) => (
                    <Silhouette key={k} couleur="var(--series-1)" />
                  ))}
                  {reste > 0.01 && <Silhouette fraction={reste} couleur="var(--series-1)" />}
                </span>
                <span className="text-sm text-muted">pour</span>
                <span className="flex items-end">
                  <Silhouette couleur="var(--series-2)" />
                </span>
                <span className="ml-1 text-sm">
                  <strong className="text-ink tabular-nums">{formatNombre(p.y, Number.isInteger(p.y) ? 0 : Number.isInteger(p.y * 10) ? 1 : 2)}</strong>{" "}
                  <span className="text-muted">pour 1</span>
                </span>
              </div>
            </li>
          );
        })}
      </ul>
      <p className="mt-3 flex flex-wrap gap-4 text-xs text-muted">
        <span className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded-sm bg-[var(--series-1)]" aria-hidden="true" /> {mesure.actif}
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded-sm bg-[var(--series-2)]" aria-hidden="true" /> retraité (ou personne de 65 ans et plus)
        </span>
      </p>
    </div>
  );
}
