"use client";

import { getValeur } from "@/lib/data";
import { formatNombre } from "@/lib/format";

/**
 * Solde public = solde primaire − intérêts, avec les chiffres de la dernière
 * année connue. Le solde primaire est calculé, pas saisi.
 */
export function SoldesDecomposes() {
  const deficit = getValeur("deficit.montant");
  const interets = getValeur("fp.interets");
  const pib = getValeur("macro.pib");

  const soldePublic = -deficit.valeur;
  const soldePrimaire = soldePublic + interets.valeur;
  const pct = (v: number) => (v / pib.valeur) * 100;
  const total = Math.abs(soldePublic);

  const blocs = [
    {
      libelle: "Solde primaire",
      detail: "dépenses hors intérêts non couvertes par les recettes",
      valeur: soldePrimaire,
      couleur: "var(--series-1)",
    },
    {
      libelle: "Intérêts de la dette",
      detail: "le prix des emprunts passés",
      valeur: -interets.valeur,
      couleur: "var(--series-2)",
    },
  ];

  return (
    <div>
      <p className="text-sm text-muted">Solde public {deficit.date}</p>
      <p className="font-serif text-3xl font-semibold text-ink tabular-nums">
        {formatNombre(soldePublic, 1)} Md€{" "}
        <span className="text-lg font-normal text-muted">({formatNombre(pct(soldePublic), 1)} % du PIB)</span>
      </p>

      <div className="mt-4 flex h-10 w-full gap-0.5 overflow-hidden rounded-lg" aria-hidden="true">
        {blocs.map((b) => (
          <div key={b.libelle} style={{ width: `${(Math.abs(b.valeur) / total) * 100}%`, background: b.couleur }} />
        ))}
      </div>

      <ul className="mt-4 grid gap-3 sm:grid-cols-2">
        {blocs.map((b) => (
          <li key={b.libelle} className="flex gap-3 rounded-xl bg-subtle p-3">
            <span aria-hidden="true" className="mt-1 h-3 w-3 shrink-0 rounded-sm" style={{ background: b.couleur }} />
            <span>
              <span className="block font-semibold text-ink">{b.libelle}</span>
              <span className="block font-semibold text-ink tabular-nums">
                {formatNombre(b.valeur, 1)} Md€ ({formatNombre(pct(b.valeur), 1)} % du PIB)
              </span>
              <span className="block text-sm text-muted">{b.detail}</span>
            </span>
          </li>
        ))}
      </ul>
      <p className="mt-3 text-xs text-muted">
        Solde primaire calculé : solde public ({formatNombre(soldePublic, 1)} Md€) + intérêts versés (
        {formatNombre(interets.valeur, 1)} Md€).
      </p>
    </div>
  );
}
