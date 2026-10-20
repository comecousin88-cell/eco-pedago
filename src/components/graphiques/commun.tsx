"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { formatNombre } from "@/lib/format";

/**
 * Outils partagés par les graphiques : largeur disponible, réglages d'axes,
 * infobulle et vue « tableau » (chaque graphique peut se lire en tableau).
 */

/** Largeur en pixels d'un conteneur, mise à jour quand il change de taille. */
export function useLargeur<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [largeur, setLargeur] = useState(0);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new ResizeObserver(([e]) => setLargeur(Math.round(e.contentRect.width)));
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return [ref, largeur] as const;
}

/** Réglages communs des axes Recharts : discrets, texte en couleur atténuée. */
export const AXE = {
  stroke: "var(--line-strong)",
  tick: { fill: "var(--muted)", fontSize: 12 },
  tickLine: false,
} as const;

export const GRILLE = { stroke: "var(--line)", strokeDasharray: "0", vertical: false } as const;

/** Nombre court à la française pour les axes : 3 500 → « 3 500 ». */
export function nombreAxe(v: number) {
  return formatNombre(v, Math.abs(v) < 10 && !Number.isInteger(v) ? 1 : 0);
}

/** Boîte d'infobulle commune (contenu fourni par chaque graphique). */
export function Infobulle({ titre, lignes }: { titre: string; lignes: { libelle: string; valeur: string; couleur?: string }[] }) {
  return (
    <div className="rounded-lg border border-line bg-surface px-3 py-2 text-sm shadow-md">
      <p className="font-semibold text-ink">{titre}</p>
      {lignes.map((l) => (
        <p key={l.libelle} className="mt-0.5 flex items-center gap-2 text-body">
          {l.couleur && <span aria-hidden="true" className="h-2.5 w-2.5 rounded-sm" style={{ background: l.couleur }} />}
          <span className="text-muted">{l.libelle}</span>
          <span className="ml-auto pl-3 font-semibold tabular-nums">{l.valeur}</span>
        </p>
      ))}
    </div>
  );
}

/**
 * Bouton « Voir les données en tableau » et le tableau correspondant. Le
 * graphique reste affiché ; le tableau s'ajoute en dessous.
 */
export function VueTableau({
  colonnes,
  lignes,
  legende,
}: {
  colonnes: string[];
  lignes: (string | number)[][];
  legende: string;
}) {
  const [ouvert, setOuvert] = useState(false);
  return (
    <div className="mt-3" data-export-ignore="true">
      <button
        type="button"
        aria-expanded={ouvert}
        onClick={() => setOuvert((o) => !o)}
        className="text-sm font-medium text-muted underline underline-offset-4 hover:text-ink"
      >
        {ouvert ? "Masquer le tableau" : "Voir les données en tableau"}
      </button>
      {ouvert && (
        <div className="mt-3 max-h-80 overflow-auto rounded-lg border border-line">
          <table className="w-full border-collapse text-sm">
            <caption className="sr-only">{legende}</caption>
            <thead className="sticky top-0 bg-subtle">
              <tr>
                {colonnes.map((c, i) => (
                  <th key={c} scope="col" className={`px-3 py-2 font-semibold text-ink ${i ? "text-right" : "text-left"}`}>
                    {c}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {lignes.map((l, i) => (
                <tr key={i} className="border-t border-line">
                  {l.map((c, j) => (
                    <td key={j} className={`px-3 py-1.5 ${j ? "text-right tabular-nums" : "text-left"}`}>
                      {typeof c === "number" ? formatNombre(c, Number.isInteger(c) ? 0 : 1) : c}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

/** Petite légende horizontale (identité jamais portée par la seule couleur). */
export function Legende({ elements }: { elements: { libelle: string; couleur: string; motif?: ReactNode }[] }) {
  return (
    <ul className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted">
      {elements.map((e) => (
        <li key={e.libelle} className="flex items-center gap-1.5">
          <span aria-hidden="true" className="h-3 w-3 rounded-sm" style={{ background: e.couleur }} />
          {e.libelle}
        </li>
      ))}
    </ul>
  );
}
