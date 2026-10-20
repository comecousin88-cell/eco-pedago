"use client";

import { getSerie } from "@/lib/data";
import { repartir100 } from "@/lib/economics";
import { VueTableau } from "./commun";

/** « Pour 100 € de dépense publique » : une pièce par euro, une ligne par fonction. */
export function Pour100Euros() {
  const d = getSerie("fp.depenses-2024-par-fonction");
  const euros = repartir100(d.serie.map((p) => p.y));
  const lignes = d.serie
    .map((p, i) => ({ libelle: p.x, euros: euros[i], md: p.y }))
    .sort((a, b) => b.euros - a.euros);

  return (
    <div>
      <ul className="space-y-3">
        {lignes.map((l) => (
          <li key={l.libelle} className="grid gap-x-4 gap-y-1 sm:grid-cols-[14rem_minmax(0,1fr)] sm:items-center">
            <span className="flex items-baseline justify-between gap-2 text-sm">
              <span className="text-body">{l.libelle}</span>
              <span className="font-serif text-lg font-semibold whitespace-nowrap text-ink tabular-nums">{l.euros} €</span>
            </span>
            <span className="flex flex-wrap gap-[3px]" aria-hidden="true">
              {Array.from({ length: l.euros }, (_, k) => (
                <span
                  key={k}
                  className="h-3 w-3 rounded-full border border-[color-mix(in_oklab,var(--accent)_70%,black)] bg-accent"
                />
              ))}
            </span>
          </li>
        ))}
      </ul>
      <p className="mt-3 text-xs text-muted">Une pièce = 1 €. Montants arrondis à l&apos;euro, total exactement 100 €.</p>
      <VueTableau
        legende={`Pour 100 € de dépense publique en ${d.date}`}
        colonnes={["Fonction", "Sur 100 €", "Md€"]}
        lignes={lignes.map((l) => [l.libelle, l.euros, l.md])}
      />
    </div>
  );
}
