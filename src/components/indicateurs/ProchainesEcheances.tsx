import Link from "next/link";
import { agenda, CATEGORIES, dateEcheance, prochainesEcheances } from "@/lib/agenda";

/**
 * Les prochaines échéances de data/agenda.json (notes des agences, budget,
 * BCE, publications). La liste est calculée à la construction du site, qui est
 * reconstruit chaque jour ouvré par la mise à jour automatique.
 */
export function ProchainesEcheances({ nombre = 6 }: { nombre?: number }) {
  const aujourdhui = new Date().toISOString().slice(0, 10);
  const liste = prochainesEcheances(agenda.evenements, aujourdhui, nombre);
  if (liste.length === 0) return null;
  return (
    <section aria-labelledby="echeances" className="rounded-2xl border border-line bg-surface p-5">
      <h2 id="echeances" className="font-serif text-xl font-semibold text-ink">
        Prochaines échéances
      </h2>
      <p className="mt-1 text-sm text-muted">
        Les rendez-vous qui peuvent faire bouger ces chiffres. Les taux, le chômage et la dette suivent automatiquement ; les
        notes des agences et le budget sont mis à jour après relecture.
      </p>
      <ol className="mt-4 divide-y divide-line">
        {liste.map((e) => (
          <li key={e.id} className="grid gap-1 py-3 sm:grid-cols-[11rem_1fr] sm:gap-4">
            <p className="text-sm font-semibold text-ink tabular-nums">
              {e.precision === "mois" ? "Courant " : ""}
              {dateEcheance(e)}
              {e.statut === "a_confirmer" && <span className="block text-xs font-normal text-muted">date à confirmer</span>}
            </p>
            <div className="text-sm text-body">
              <p>
                <span className="mr-2 inline-block rounded-full border border-line px-2 py-0.5 text-xs text-muted">
                  {CATEGORIES[e.categorie]}
                </span>
                <span className="font-medium text-ink">{e.titre}</span>
              </p>
              {e.situation && <p className="mt-1 text-muted">Situation actuelle : {e.situation}.</p>}
              <p className="mt-1 text-muted">
                {e.description}{" "}
                <Link href={e.source.url} className="underline underline-offset-4">
                  Source<span className="sr-only"> : {e.source.nom}</span>
                </Link>
              </p>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
