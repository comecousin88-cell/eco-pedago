import Link from "next/link";
import { LIBELLES_TYPE, type EntreeActu } from "@/content/actu";

const COULEUR: Record<EntreeActu["type"], string> = {
  alerte: "border-warn/50 text-warn",
  indicateur: "border-line text-muted",
  echeance: "border-line text-muted",
  publication: "border-line text-muted",
};

/** Une entrée du fil : date, nature, titre, lien vers l'original et vers la page qui explique. */
export function CarteActu({ e, compacte = false }: { e: EntreeActu; compacte?: boolean }) {
  return (
    <article className="rounded-2xl border border-line bg-surface p-4 sm:p-5">
      <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
        <time dateTime={e.date} className="font-semibold text-ink">
          {e.dateLibelle}
        </time>
        <span className={`rounded-full border px-2 py-0.5 ${COULEUR[e.type]}`}>{LIBELLES_TYPE[e.type]}</span>
      </p>
      <h3 className={`mt-2 font-medium text-ink ${compacte ? "text-base" : "text-lg"}`}>{e.titre}</h3>
      {e.explication && !compacte && (
        <div className="mt-3 rounded-xl border border-accent-line bg-subtle px-4 py-3 text-sm leading-relaxed text-body">
          <p className="font-semibold text-ink">Ce que ça veut dire</p>
          <p className="mt-1">{e.explication}</p>
        </div>
      )}
      <p className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-sm">
        <Link href={e.page.href} className="font-medium text-accent underline underline-offset-4">
          Comprendre : {e.page.titre}
        </Link>
        {e.source && !compacte && (
          <a href={e.source.url} target="_blank" rel="noopener" className="text-muted underline underline-offset-4 hover:text-ink">
            Source : {e.source.nom}
            <span className="sr-only"> (nouvel onglet)</span> ↗
          </a>
        )}
      </p>
    </article>
  );
}

/** Le fil chronologique, regroupé par mois. */
export function FilActu({ entrees }: { entrees: EntreeActu[] }) {
  const mois = new Map<string, EntreeActu[]>();
  for (const e of entrees) {
    const cle = e.date.slice(0, 7);
    mois.set(cle, [...(mois.get(cle) ?? []), e]);
  }
  const nomMois = (cle: string) =>
    new Intl.DateTimeFormat("fr-FR", { month: "long", year: "numeric", timeZone: "UTC" }).format(new Date(`${cle}-01T00:00:00Z`));
  if (entrees.length === 0) return <p className="text-muted">Aucune actualité pour le moment.</p>;
  return (
    <div className="space-y-10">
      {[...mois.entries()].map(([cle, liste]) => (
        <section key={cle} aria-labelledby={`mois-${cle}`}>
          <h2 id={`mois-${cle}`} className="font-serif text-xl font-semibold text-ink first-letter:uppercase">
            {nomMois(cle)}
          </h2>
          <ol className="mt-4 space-y-3">
            {liste.map((e) => (
              <li key={e.id}>
                <CarteActu e={e} />
              </li>
            ))}
          </ol>
        </section>
      ))}
    </div>
  );
}
