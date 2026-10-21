import Link from "next/link";
import { alertesActives } from "@/content/alertes";
import journal from "../../../data/maj-indicateurs.json";

const dateCourte = (iso: string) =>
  new Intl.DateTimeFormat("fr-FR", { timeZone: "Europe/Paris", day: "numeric", month: "long", year: "numeric" }).format(new Date(iso));

/**
 * Bandeau d'actualité : les indicateurs qui ont franchi un seuil marquant
 * (src/content/alertes.ts). Calculé à la construction du site, donc à jour
 * après chaque mise à jour automatique ; absent quand aucun seuil n'est franchi.
 */
export function BandeauAlertes({ lienTableau = true }: { lienTableau?: boolean }) {
  const alertes = alertesActives();
  if (alertes.length === 0) return null;
  return (
    <aside aria-labelledby="actualite" className="rounded-2xl border border-warn/40 bg-warn-soft px-4 py-3 text-sm text-body sm:px-5">
      <h2 id="actualite" className="font-semibold text-ink">
        <span aria-hidden="true" className="mr-1.5 text-warn">
          ●
        </span>
        Actualité des indicateurs
        <span className="ml-2 font-normal text-muted">au {dateCourte(journal.derniere_verification)}</span>
      </h2>
      <ul className="mt-2 space-y-1.5">
        {alertes.map((a) => (
          <li key={a.id}>
            {a.phrase}{" "}
            <Link href={a.lien.href} className="whitespace-nowrap underline underline-offset-4">
              {a.lien.libelle}
            </Link>
          </li>
        ))}
      </ul>
      {lienTableau && (
        <p className="mt-2">
          <Link href="/tableau-de-bord/" className="font-medium underline underline-offset-4">
            Voir le tableau de bord
          </Link>
        </p>
      )}
    </aside>
  );
}
