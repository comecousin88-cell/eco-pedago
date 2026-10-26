import { formatDateDonnee } from "@/lib/format";
import { ancre } from "@/lib/ancre";
import type { SourcePage } from "@/lib/sources-page";

/**
 * « Sources », en bas de page : toutes les sources des chiffres cités,
 * numérotées, avec les données utilisées et leur date. Dans le texte, la
 * source d'un chiffre s'affiche dans son infobulle.
 */
export function SourcesPage({ sources }: { sources: SourcePage[] }) {
  if (sources.length === 0) return null;
  return (
    <section aria-labelledby={ancre("Sources")} className="mt-14 border-t border-line pt-8">
      <h2 id={ancre("Sources")} className="scroll-mt-24 font-serif text-2xl font-semibold text-ink">
        Sources
      </h2>
      <p className="mt-2 text-sm text-muted">Survolez ou touchez un chiffre dans le texte pour voir sa source.</p>
      <ol className="mt-5 list-decimal space-y-3 pl-6 text-sm leading-relaxed text-body">
        {sources.map((s) => (
          <li key={`${s.nom}|${s.url ?? ""}`}>
            {s.url ? (
              <a href={s.url} target="_blank" rel="noopener" className="font-medium text-accent underline underline-offset-4">
                {s.nom}
                <span className="sr-only"> (nouvel onglet)</span>
              </a>
            ) : (
              <span className="font-medium text-ink">{s.nom}</span>
            )}
            <span className="text-muted">
              {" "}
              : {s.donnees.map((d) => `${d.label.charAt(0).toLowerCase()}${d.label.slice(1)}, données ${formatDateDonnee(d.date)}`).join(" ; ")}.
            </span>
          </li>
        ))}
      </ol>
    </section>
  );
}
