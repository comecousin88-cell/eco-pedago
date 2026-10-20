import Link from "next/link";

export interface Etape {
  label: string;
  href?: string;
}

/** Fil d'Ariane : Accueil › Modules › Déficit et dette › La baignoire. */
export function FilAriane({ etapes }: { etapes: Etape[] }) {
  const toutes: Etape[] = [{ label: "Accueil", href: "/" }, ...etapes];
  return (
    <nav aria-label="Fil d'Ariane" className="text-sm text-muted">
      <ol className="flex flex-wrap items-center gap-x-2 gap-y-1">
        {toutes.map((e, i) => {
          const derniere = i === toutes.length - 1;
          return (
            <li key={`${e.label}-${i}`} className="flex items-center gap-2">
              {e.href && !derniere ? (
                <Link href={e.href} className="hover:text-ink hover:underline">
                  {e.label}
                </Link>
              ) : (
                <span aria-current={derniere ? "page" : undefined} className={derniere ? "text-body" : ""}>
                  {e.label}
                </span>
              )}
              {!derniere && <span aria-hidden="true">›</span>}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
