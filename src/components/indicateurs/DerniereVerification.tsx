import journal from "../../../data/maj-indicateurs.json";

const NOMS: Record<string, string> = {
  bce: "Banque centrale européenne",
  eurostat: "Eurostat",
  insee: "Insee",
  "banque-de-france": "Banque de France",
};

function dateHeure(iso: string) {
  return new Intl.DateTimeFormat("fr-FR", {
    timeZone: "Europe/Paris",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
    .format(new Date(iso))
    .replace(" ", " à ");
}

/**
 * Date de la dernière vérification automatique des indicateurs, et état de
 * chaque source. Si une source n'a pas répondu, ses dernières valeurs sont
 * conservées avec leur date, et on le dit.
 */
export function DerniereVerification() {
  const sources = Object.entries(journal.sources) as [string, { statut: string; derniere_reussite: string | null; message?: string }][];
  const echecs = sources.filter(([, s]) => s.statut !== "ok");
  return (
    <div className="rounded-2xl border border-line bg-surface px-4 py-3 text-sm text-body">
      <p>
        <span className="font-semibold text-ink">Dernière vérification des sources :</span> le{" "}
        {dateHeure(journal.derniere_verification)} (heure de Paris).
      </p>
      <ul className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-muted">
        {sources.map(([nom, s]) => (
          <li key={nom}>
            <span aria-hidden="true" className={s.statut === "ok" ? "text-ok" : "text-warn"}>
              {s.statut === "ok" ? "✓" : "!"}
            </span>{" "}
            {NOMS[nom] ?? nom}
            <span className="sr-only">{s.statut === "ok" ? " : à jour" : " : indisponible"}</span>
          </li>
        ))}
      </ul>
      {echecs.map(([nom, s]) => (
        <p key={nom} className="mt-1 text-warn">
          {NOMS[nom] ?? nom} n&apos;a pas répondu lors de la dernière vérification : les valeurs affichées sont les
          dernières obtenues{s.derniere_reussite ? `, le ${dateHeure(s.derniere_reussite)}` : ""}, avec leur date.
        </p>
      ))}
    </div>
  );
}
