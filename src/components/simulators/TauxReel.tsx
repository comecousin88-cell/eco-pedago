"use client";

import { useId, useState } from "react";
import { pouvoirAchat, tauxReel, tauxReelApproche } from "@/lib/economics";
import { formatEuros, formatNombre, formatPourcent } from "@/lib/format";

/**
 * Taux nominal, inflation, taux réel : on place 100 € pendant un an et l'on
 * regarde ce qu'ils permettent d'acheter à la fin.
 */
export function TauxReel() {
  const [nominal, setNominal] = useState(3);
  const [inflation, setInflation] = useState(2);
  const id = useId();

  const i = nominal / 100;
  const pi = inflation / 100;
  const reel = tauxReel(i, pi);
  const approche = tauxReelApproche(i, pi);
  const final = 100 * (1 + i);
  const enEurosDuDebut = pouvoirAchat(final, pi, 1);

  const curseurs = [
    { cle: "n", libelle: "Taux d'intérêt nominal", valeur: nominal, set: setNominal },
    { cle: "p", libelle: "Inflation sur l'année", valeur: inflation, set: setInflation },
  ];

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <div className="space-y-5">
        {curseurs.map((c) => (
          <div key={c.cle}>
            <label htmlFor={`${id}-${c.cle}`} className="flex justify-between text-sm font-semibold text-ink">
              {c.libelle}
              <span className="tabular-nums">{formatNombre(c.valeur, 1)} %</span>
            </label>
            <input
              id={`${id}-${c.cle}`}
              type="range"
              min={0}
              max={10}
              step={0.5}
              value={c.valeur}
              onChange={(e) => c.set(Number(e.target.value))}
              className="mt-2 w-full accent-[var(--accent)]"
            />
          </div>
        ))}
        <p className="text-xs text-muted">Valeurs d&apos;exemple, à régler librement.</p>
      </div>

      <div className="space-y-3" aria-live="polite">
        <p className="text-sm text-body">
          Vous prêtez <strong>100 €</strong> pendant un an. On vous rend{" "}
          <strong className="tabular-nums">{formatEuros(final)}</strong>. Mais les prix ont monté de{" "}
          {formatNombre(inflation, 1)} % : ces {formatEuros(final)} achètent autant que{" "}
          <strong className="tabular-nums">{formatEuros(enEurosDuDebut)}</strong> au début de l&apos;année.
        </p>
        <div className="rounded-xl bg-accent-soft p-4">
          <p className="text-sm text-muted">Taux réel (ce que vous gagnez vraiment)</p>
          <p className={`font-serif text-3xl font-semibold tabular-nums ${reel < 0 ? "text-bad" : "text-ink"}`}>
            {formatPourcent(reel, 2)}
          </p>
          <p className="mt-1 text-sm text-muted">
            Calcul rapide « taux − inflation » : {formatPourcent(approche, 2)}
          </p>
        </div>
        {reel < 0 && (
          <p className="text-sm text-body">
            Le taux réel est négatif : le prêteur perd du pouvoir d&apos;achat, l&apos;emprunteur y gagne.
          </p>
        )}
      </div>
    </div>
  );
}
