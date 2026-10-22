"use client";

import { useId, useState, type ReactNode } from "react";

/**
 * Bloc à en-tête cliquable, ouvert par défaut ; le lecteur peut le replier.
 * Les blocs propres au mode « Approfondi » ne sont pas repliés en mode
 * Simple : ils sont masqués entièrement (data-selon-mode, globals.css).
 */
export function Depliable({
  entete,
  children,
  className = "",
  classeEntete = "",
  classeContenu = "",
  balise: Titre = "h3",
}: {
  entete: ReactNode;
  children: ReactNode;
  className?: string;
  classeEntete?: string;
  classeContenu?: string;
  /** Le bouton est placé dans un titre (schéma « accordéon » accessible). */
  balise?: "h2" | "h3" | "h4";
}) {
  const [ouvert, setOuvert] = useState(true);
  const contenuId = useId();

  return (
    <div data-depliable data-ouvert={ouvert ? undefined : "false"} className={className}>
      <Titre className="m-0">
        <button
          type="button"
          aria-expanded={ouvert}
          aria-controls={contenuId}
          onClick={() => setOuvert((o) => !o)}
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
