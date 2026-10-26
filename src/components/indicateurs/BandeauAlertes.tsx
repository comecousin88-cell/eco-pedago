import Link from "next/link";
import { alertesActives } from "@/content/alertes";
import journal from "../../../data/maj-indicateurs.json";

const dateCourte = (iso: string) =>
  new Intl.DateTimeFormat("fr-FR", { timeZone: "Europe/Paris", day: "numeric", month: "long", year: "numeric" }).format(new Date(iso));

/** Page officielle où lire le taux à 10 ans du jour (le site n'affiche que la moyenne mensuelle de la BCE). */
export const TAUX_DU_JOUR_BDF = "https://www.banque-france.fr/fr/statistiques/taux-et-cours";

/**
 * Bandeau d'actualité : les indicateurs qui ont franchi un seuil marquant
 * (src/content/alertes.ts), chaque chiffre avec sa période. Style neutre et
 * informatif : un seuil franchi est une information, pas une alerte d'erreur.
 * Calculé à la construction du site ; absent quand aucun seuil n'est franchi.
 */
export function BandeauAlertes({ lienTableau = true }: { lienTableau?: boolean }) {
  const alertes = alertesActives();
  if (alertes.length === 0) return null;
  const tauxCites = alertes.some((a) => /emprunte à 10 ans|écart de taux/.test(a.phrase));
  return (
    <aside aria-labelledby="actualite" className="rounded-2xl border border-accent-line bg-accent-soft px-4 py-3 text-sm text-body sm:px-5">
      <h2 id="actualite" className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5 font-semibold text-ink">
        <span className="inline-flex items-center gap-1.5">
          <svg aria-hidden="true" viewBox="0 0 20 20" className="h-4 w-4 shrink-0 self-center text-accent" fill="currentColor">
            <path d="M10 1.5a8.5 8.5 0 1 0 0 17 8.5 8.5 0 0 0 0-17Zm0 3.75a1.1 1.1 0 1 1 0 2.2 1.1 1.1 0 0 1 0-2.2Zm1.25 9.5h-2.5v-1.25h.6v-3.5h-.6V8.75h1.85v4.75h.65v1.25Z" />
          </svg>
          Actualité des indicateurs
        </span>
        <span className="font-normal text-muted">Dernières données publiées · vérifié le {dateCourte(journal.derniere_verification)}</span>
      </h2>
      <ul className="mt-2 space-y-1.5">
        {alertes.map((a) => (
          <li key={a.id}>
            {a.phrase}{" "}
            <Link href={a.lien.href} className="whitespace-nowrap font-medium text-accent underline underline-offset-4">
              {a.lien.libelle}
            </Link>
          </li>
        ))}
      </ul>
      <p className="mt-2 flex flex-wrap gap-x-4 gap-y-1">
        {lienTableau && (
          <Link href="/tableau-de-bord/" className="font-medium text-accent underline underline-offset-4">
            Voir le tableau de bord
          </Link>
        )}
        {tauxCites && (
          <a href={TAUX_DU_JOUR_BDF} target="_blank" rel="noopener" className="text-muted underline underline-offset-4 hover:text-ink">
            Voir le taux du jour sur le site de la Banque de France
            <span className="sr-only"> (nouvel onglet)</span> ↗
          </a>
        )}
      </p>
    </aside>
  );
}
