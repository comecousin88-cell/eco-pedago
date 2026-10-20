"use client";

import { changerModeLecture, useModeLecture, type ModeLecture as Mode } from "@/lib/lecture";

const OPTIONS: { valeur: Mode; libelle: string }[] = [
  { valeur: "simple", libelle: "Simple" },
  { valeur: "approfondi", libelle: "Approfondi" },
];

/**
 * Interrupteur global « Simple / Approfondi ». La position active est dessinée
 * en CSS d'après <html data-lecture> (globals.css, .bouton-lecture) : elle est
 * juste dès le premier affichage.
 *
 * `detaille` ajoute une phrase qui explique ce que change chaque mode.
 */
export function ModeLecture({ detaille = false, className = "" }: { detaille?: boolean; className?: string }) {
  const mode = useModeLecture();
  return (
    <div className={className}>
      <div
        role="group"
        aria-label="Niveau de lecture"
        className="inline-flex rounded-full border border-line-strong bg-surface p-0.5 text-sm font-medium"
      >
        {OPTIONS.map((o) => (
          <button
            key={o.valeur}
            type="button"
            data-valeur={o.valeur}
            aria-pressed={mode === o.valeur}
            onClick={() => changerModeLecture(o.valeur)}
            className="bouton-lecture rounded-full px-3 py-1 text-muted transition-colors hover:text-ink"
          >
            {o.libelle}
          </button>
        ))}
      </div>
      {detaille && (
        <p className="mt-2 text-sm text-muted">
          <span className="lecture-si-simple">
            Mode Simple : l&apos;essentiel et les mécanismes. Les formules, nuances et débats sont repliés,
            mais restent dépliables.
          </span>
          <span className="lecture-si-approfondi">
            Mode Approfondi : tout est déplié, y compris les formules, les nuances et les débats
            d&apos;économistes.
          </span>
        </p>
      )}
    </div>
  );
}
