import { badgesSeuil } from "@/content/alertes";

/**
 * Petits badges discrets sur la carte d'un indicateur quand un seuil marquant
 * est franchi (« au-dessus de 3 % », « plus cher que l'Italie »), avec une
 * infobulle qui explique le seuil : au survol, au clavier ou d'un toucher.
 * L'infobulle prend la largeur de la carte (qui doit être en `relative`) :
 * elle ne déborde jamais de l'écran. Rien n'est affiché sans seuil franchi.
 */
export function BadgesSeuil({ indicateur, className = "" }: { indicateur: string; className?: string }) {
  const badges = badgesSeuil(indicateur);
  if (badges.length === 0) return null;
  return (
    <ul className={`flex flex-wrap gap-1.5 ${className}`}>
      {badges.map((b) => {
        const id = `seuil-${indicateur}-${b.id}`;
        return (
          <li key={b.id} className="group">
            <button
              type="button"
              aria-describedby={id}
              className="inline-flex items-center gap-1 rounded-full border border-accent-line bg-accent-soft px-2 py-0.5 text-xs font-medium text-ink"
            >
              <svg aria-hidden="true" viewBox="0 0 20 20" className="h-3 w-3 shrink-0 text-accent" fill="currentColor">
                <path d="M10 1.5a8.5 8.5 0 1 0 0 17 8.5 8.5 0 0 0 0-17Zm0 3.75a1.1 1.1 0 1 1 0 2.2 1.1 1.1 0 0 1 0-2.2Zm1.25 9.5h-2.5v-1.25h.6v-3.5h-.6V8.75h1.85v4.75h.65v1.25Z" />
              </svg>
              {b.libelle}
            </button>
            <span
              role="tooltip"
              id={id}
              className="absolute inset-x-2 z-20 mt-1.5 hidden rounded-lg border border-line bg-surface p-3 text-xs leading-relaxed text-body shadow-lg group-focus-within:block group-hover:block"
            >
              {b.explication}
            </span>
          </li>
        );
      })}
    </ul>
  );
}
