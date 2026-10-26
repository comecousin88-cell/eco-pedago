import Link from "next/link";
import { etapeRetour, etapesFil, type Etape } from "@/content/fil-ariane";

export type { Etape };

/**
 * En haut de chaque page de contenu : le bouton de retour, qui dit où il
 * ramène (« ← Les 12 modules »), et le fil d'Ariane, lisible et cliquable. La
 * barre reste affichée, en version compacte sur une ligne, en haut de l'écran
 * quand on fait défiler (juste sous l'en-tête du site).
 */
export function FilAriane({ etapes, retour }: { etapes: Etape[]; retour?: Etape }) {
  const toutes = etapesFil(etapes);
  const versOu = etapeRetour(etapes, retour);
  return (
    <div data-fil-ariane="" className="sticky top-16 z-30 -mx-4 border-b border-line bg-page/95 px-4 py-2 backdrop-blur sm:-mx-6 sm:px-6">
      <div className="flex min-w-0 items-center gap-3">
        {versOu?.href && (
          <Link
            href={versOu.href}
            className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-line-strong bg-surface px-3 py-1 text-sm font-medium text-ink transition hover:bg-subtle"
          >
            <span aria-hidden="true">←</span> {versOu.label}
          </Link>
        )}
        <nav aria-label="Fil d'Ariane" className="min-w-0 flex-1 text-[0.9375rem]">
          <ol className="flex min-w-0 items-center gap-x-2 overflow-hidden whitespace-nowrap">
            {toutes.map((e, i) => {
              const derniere = i === toutes.length - 1;
              return (
                // Sur mobile, seule la page actuelle reste visible à côté du bouton de retour.
                <li key={`${e.label}-${i}`} className={`items-center gap-2 ${derniere ? "flex min-w-0" : versOu ? "hidden sm:flex" : "flex"}`}>
                  {e.href && !derniere ? (
                    <Link href={e.href} className="text-body underline decoration-line-strong underline-offset-4 hover:text-ink hover:decoration-ink">
                      {e.label}
                    </Link>
                  ) : (
                    <span aria-current={derniere ? "page" : undefined} className="truncate font-medium text-ink">
                      {e.label}
                    </span>
                  )}
                  {!derniere && (
                    <span aria-hidden="true" className="text-muted">
                      ›
                    </span>
                  )}
                </li>
              );
            })}
          </ol>
        </nav>
      </div>
    </div>
  );
}
