"use client";

import { useId, useState, type ReactNode } from "react";
import { useModeLecture, type ModeLecture } from "@/lib/lecture";

/**
 * Bloc à en-tête cliquable. Par défaut il est ouvert, sauf s'il « suit le
 * mode » : il est alors replié en mode Simple et ouvert en mode Approfondi.
 * Le lecteur peut toujours l'ouvrir ou le fermer à la main ; ce choix vaut
 * jusqu'au prochain changement de mode.
 *
 * L'état par défaut est appliqué en CSS (voir globals.css, [data-depliable]) :
 * la page s'affiche directement dans le bon état, sans attendre React.
 */
export function Depliable({
  entete,
  children,
  suitLeMode = false,
  className = "",
  classeEntete = "",
  classeContenu = "",
  balise: Titre = "h3",
}: {
  entete: ReactNode;
  children: ReactNode;
  suitLeMode?: boolean;
  className?: string;
  classeEntete?: string;
  classeContenu?: string;
  /** Le bouton est placé dans un titre (schéma « accordéon » accessible). */
  balise?: "h2" | "h3" | "h4";
}) {
  const mode = useModeLecture();
  const [choix, setChoix] = useState<{ ouvert: boolean; mode: ModeLecture } | null>(null);
  const manuel = choix && choix.mode === mode ? choix.ouvert : null;
  const ouvert = manuel ?? (!suitLeMode || mode === "approfondi");
  const contenuId = useId();

  return (
    <div
      data-depliable={suitLeMode ? "mode" : "ouvert"}
      data-ouvert={manuel === null ? undefined : String(manuel)}
      className={className}
    >
      <Titre className="m-0">
        <button
          type="button"
          aria-expanded={ouvert}
          aria-controls={contenuId}
          onClick={() => setChoix({ ouvert: !ouvert, mode })}
          className={`flex w-full cursor-pointer items-center gap-4 text-left ${classeEntete}`}
        >
          <span className="min-w-0 flex-1">{entete}</span>
          <svg
            aria-hidden="true"
            viewBox="0 0 20 20"
            className="depliable-chevron h-5 w-5 shrink-0 text-muted transition-transform"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path d="M5 8l5 5 5-5" />
          </svg>
        </button>
      </Titre>
      <div id={contenuId} data-contenu className={classeContenu}>
        {children}
      </div>
    </div>
  );
}
