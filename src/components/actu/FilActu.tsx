import Link from "next/link";
import { actuHref, LIBELLES_TYPE, type EntreeActu } from "@/content/actu";
import { resumeDe } from "@/content/actu-pages";
import { EtatEcheance } from "./EtatEcheance";
import { TexteAvecChiffres } from "./TexteAvecChiffres";

const COULEUR: Record<EntreeActu["type"], string> = {
  alerte: "border-warn/50 text-warn",
  indicateur: "border-line text-muted",
  echeance: "border-line text-muted",
  publication: "border-line text-muted",
};

/**
 * Une entrée du fil : date, nature, titre (qui ouvre la page de l'actualité),
 * aperçu du résumé, lien vers la page qui explique et vers l'original.
 */
export function CarteActu({ e, compacte = false }: { e: EntreeActu; compacte?: boolean }) {
  const resume = resumeDe(e);
  const href = e.slug ? actuHref(e.slug) : undefined;
  return (
    <article className="rounded-2xl border border-line bg-surface p-4 sm:p-5">
      <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
        <time dateTime={e.date} className="font-semibold text-ink">
          {e.dateLibelle}
        </time>
        <span className={`rounded-full border px-2 py-0.5 ${COULEUR[e.type]}`}>{LIBELLES_TYPE[e.type]}</span>
        {e.version && <span className="text-muted">{e.version}</span>}
      </p>
      <h3
        lang={e.langue}
        title={e.titreOriginal ? `Titre original : ${e.titreOriginal}` : undefined}
        className={`mt-2 font-medium text-ink ${compacte ? "text-base" : "text-lg"}`}
      >
        {href ? (
          <Link href={href} className="underline decoration-line underline-offset-4 hover:text-accent hover:decoration-accent">
            {e.titre}
          </Link>
        ) : (
          e.titre
        )}
      </h3>
      {e.echeance && (
        <p className="mt-1 text-sm">
          <EtatEcheance echeance={e.echeance} construitLe={new Date().toISOString().slice(0, 10)} />
        </p>
      )}
      {resume && href && (
        <div className="mt-2 text-sm leading-relaxed text-body">
          <p className="line-clamp-1">
            <TexteAvecChiffres texte={resume.en_bref[0]} />
          </p>
          <Link href={href} className="mt-1 inline-block font-medium text-accent underline underline-offset-4">
            Lire le résumé<span className="sr-only"> : {e.titre}</span>
          </Link>
        </div>
      )}
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
