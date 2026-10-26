"use client";

/**
 * Petit bouton ↺ « Recommencer à zéro », sur les cartes de la grille « Les 12 modules »
 * et dans le panneau « Progression » d'un module. Demande confirmation avant
 * d'effacer.
 */
export function BoutonRecommencer({ message, effacer }: { message: string; effacer: () => void }) {
  return (
    <button
      type="button"
      title="Recommencer à zéro"
      aria-label="Recommencer à zéro"
      onClick={() => {
        if (window.confirm(message)) effacer();
      }}
      className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-line text-base text-muted transition hover:border-line-strong hover:text-ink"
    >
      <span aria-hidden="true">↺</span>
    </button>
  );
}
