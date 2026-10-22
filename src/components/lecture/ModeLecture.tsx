"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { basculerModeLecture, pageSelonMode, useModeLecture, type ModeLecture as Mode } from "@/lib/lecture";

const OPTIONS: { valeur: Mode; libelle: string }[] = [
  { valeur: "simple", libelle: "Simple" },
  { valeur: "approfondi", libelle: "Approfondi" },
];

const SANS_EFFET = "Sur cette page, les deux modes affichent la même chose. Le mode choisi s'applique aux modules et aux fiches.";

/**
 * Interrupteur global « Simple / Approfondi ». La position active est dessinée
 * en CSS d'après <html data-lecture> (globals.css, .bouton-lecture) : elle est
 * juste dès le premier affichage. Sur une page que le mode ne change pas, il
 * est grisé, avec une explication au survol.
 *
 * `detaille` ajoute une phrase qui explique ce que change chaque mode.
 */
export function ModeLecture({ detaille = false, className = "" }: { detaille?: boolean; className?: string }) {
  const mode = useModeLecture();
  const pathname = usePathname();
  const [actif, setActif] = useState(true);

  useEffect(() => {
    // Après l'affichage de la nouvelle page : y a-t-il quelque chose qui dépend du mode ?
    const t = window.setTimeout(() => setActif(pageSelonMode()), 50);
    return () => window.clearTimeout(t);
  }, [pathname]);

  return (
    <div className={className} title={actif ? undefined : SANS_EFFET}>
      <div
        role="group"
        aria-label="Niveau de lecture"
        aria-describedby={actif ? undefined : "lecture-sans-effet"}
        className={`inline-flex rounded-full border border-line-strong bg-surface p-0.5 text-sm font-medium ${actif ? "" : "opacity-45"}`}
      >
        {OPTIONS.map((o) => (
          <button
            key={o.valeur}
            type="button"
            data-valeur={o.valeur}
            aria-pressed={mode === o.valeur}
            disabled={!actif}
            onClick={() => basculerModeLecture(o.valeur)}
            className="bouton-lecture rounded-full px-3 py-1 text-muted transition-colors enabled:hover:text-ink disabled:cursor-not-allowed"
          >
            {o.libelle}
          </button>
        ))}
      </div>
      {!actif && (
        <span id="lecture-sans-effet" className="sr-only">
          {SANS_EFFET}
        </span>
      )}
      {detaille && (
        <p className="mt-2 text-sm text-muted">
          <span className="lecture-si-simple">
            Mode Simple : l&apos;essentiel et le mécanisme, chiffres arrondis. Passez en Approfondi pour ajouter les
            formules, les débats d&apos;économistes, « Pour aller plus loin », tous les réglages des simulateurs et les
            chiffres précis avec leur source.
          </span>
          <span className="lecture-si-approfondi">
            Mode Approfondi : tout est affiché, y compris les formules, les débats, « Pour aller plus loin », tous les
            réglages des simulateurs et les chiffres précis avec leur source.
          </span>
        </p>
      )}
    </div>
  );
}
