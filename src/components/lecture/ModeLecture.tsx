"use client";

import { basculerModeLecture, useModeLecture, type ModeLecture as Mode } from "@/lib/lecture";

const OPTIONS: { valeur: Mode; libelle: string }[] = [
  { valeur: "simple", libelle: "Simple" },
  { valeur: "approfondi", libelle: "Approfondi" },
];

/**
 * Sélecteur « Simple / Approfondi », placé sous le titre des pages de module et
 * des fiches (les seules pages que le mode change). Le choix vaut pour tout le
 * site et est gardé d'une page à l'autre (localStorage). La position active est dessinée en CSS d'après
 * <html data-lecture> (globals.css, .bouton-lecture) : elle est juste dès le
 * premier affichage.
 */
export function ModeLecture({ className = "" }: { className?: string }) {
  const mode = useModeLecture();
  return (
    <div className={`flex flex-wrap items-center gap-x-4 gap-y-2 rounded-2xl border border-line bg-subtle px-4 py-3 ${className}`}>
      <div role="group" aria-label="Niveau de lecture" aria-describedby="niveau-lecture-aide" className="inline-flex rounded-full border border-line-strong bg-surface p-0.5 text-sm font-medium">
        {OPTIONS.map((o) => (
          <button
            key={o.valeur}
            type="button"
            data-valeur={o.valeur}
            aria-pressed={mode === o.valeur}
            onClick={() => basculerModeLecture(o.valeur)}
            className="bouton-lecture rounded-full px-4 py-1.5 text-muted transition-colors hover:text-ink"
          >
            {o.libelle}
          </button>
        ))}
      </div>
      <p id="niveau-lecture-aide" className="min-w-0 flex-1 basis-64 text-sm text-body">
        <strong className="font-semibold text-ink">Simple</strong> : l&apos;essentiel et les mécanismes.{" "}
        <strong className="font-semibold text-ink">Approfondi</strong> : formules, débats et chiffres précis avec leurs
        sources.
      </p>
    </div>
  );
}
