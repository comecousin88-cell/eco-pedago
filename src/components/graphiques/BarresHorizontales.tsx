"use client";

import { getSerie } from "@/lib/data";
import { formatNombre } from "@/lib/format";
import { VueTableau } from "./commun";

/**
 * Barres horizontales étiquetées, pour comparer quelques éléments (pays,
 * sous-secteurs…). Valeurs écrites en clair à côté de chaque barre. Gère les
 * valeurs négatives (barres à gauche d'un axe zéro). Un élément peut être
 * mis en avant (couleur du module), les autres restent neutres.
 */
export function BarresHorizontales({
  serie: idSerie,
  enAvant = [],
  trier = true,
  decimales = 1,
  suffixe,
  part = false,
}: {
  serie: string;
  /** Libellés à mettre en avant. */
  enAvant?: string[];
  trier?: boolean;
  decimales?: number;
  /** Unité affichée après chaque valeur (par défaut : celle de la donnée). */
  suffixe?: string;
  /** Affiche aussi la part de chaque élément dans le total. */
  part?: boolean;
}) {
  const d = getSerie(idSerie);
  const points = trier ? [...d.serie].sort((a, b) => b.y - a.y) : d.serie;
  const min = Math.min(0, ...points.map((p) => p.y));
  const max = Math.max(0, ...points.map((p) => p.y));
  const etendue = max - min || 1;
  const zero = (-min / etendue) * 100;
  const total = points.reduce((s, p) => s + p.y, 0);
  const unite = suffixe ?? d.unite;

  return (
    <div>
      <ul className="space-y-2.5">
        {points.map((p) => {
          const avant = enAvant.includes(p.x);
          const largeur = (Math.abs(p.y) / etendue) * 100;
          const gauche = p.y >= 0 ? zero : zero - largeur;
          return (
            <li key={p.x}>
              <div className="flex items-baseline justify-between gap-3 text-sm">
                <span className={avant ? "font-semibold text-ink" : "text-body"}>{p.x}</span>
                <span className="shrink-0 font-semibold text-ink tabular-nums">
                  {p.y > 0 && min < 0 ? "+" : ""}
                  {formatNombre(p.y, decimales)} {unite}
                  {part && (
                    <span className="ml-1.5 font-normal text-muted">({formatNombre((p.y / total) * 100, 0)} %)</span>
                  )}
                </span>
              </div>
              <div className="relative mt-1 h-3 rounded-full bg-subtle" aria-hidden="true">
                {min < 0 && <span className="absolute top-[-3px] bottom-[-3px] w-px bg-line-strong" style={{ left: `${zero}%` }} />}
                <span
                  className="absolute top-0 h-full rounded-full"
                  style={{
                    left: `${gauche}%`,
                    width: `${Math.max(largeur, 0.5)}%`,
                    background: avant ? "var(--accent)" : "var(--line-strong)",
                  }}
                />
              </div>
            </li>
          );
        })}
      </ul>
      <VueTableau
        legende={d.label}
        colonnes={["", d.unite, ...(part ? ["Part (%)"] : [])]}
        lignes={points.map((p) => [p.x, p.y, ...(part ? [Math.round((p.y / total) * 1000) / 10] : [])])}
      />
    </div>
  );
}
