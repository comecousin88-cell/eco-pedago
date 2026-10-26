import Link from "next/link";
import { indicateurs } from "@/content/indicateurs";
import { formatNombre } from "@/lib/format";
import { BadgesSeuil } from "./BadgesSeuil";
import { ecart, lectureIndicateur } from "./CarteIndicateur";

/** Les quatre indicateurs de l'accueil, dans cet ordre, avec un libellé court. */
export const INDICATEURS_CLES = [
  { id: "dette", libelle: "Dette publique" },
  // Le solde public est négatif : on affiche le déficit (son opposé), pour que la flèche dise le sens du déficit.
  { id: "deficit", libelle: "Déficit public", oppose: true },
  { id: "oat10", libelle: "Taux à 10 ans" },
  { id: "inflation", libelle: "Inflation" },
] as const;

/** « un an plus tôt » → « sur un an » ; « fin 2025 » → « depuis fin 2025 » ; « moyenne de … » → « par rapport à la moyenne de … ». */
function depuis(reference: string) {
  if (reference === "un an plus tôt") return "sur un an";
  return reference.startsWith("moyenne") ? `par rapport à la ${reference}` : `depuis ${reference}`;
}

/**
 * Bandeau des quatre indicateurs clés : valeur, période, flèche de tendance
 * (par rapport au point de comparaison de la carte du tableau de bord) et lien
 * vers le tableau de bord. La flèche dit le sens, pas un jugement : elle reste
 * de la couleur du texte.
 */
export function IndicateursCles() {
  return (
    <div>
      <ul className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {INDICATEURS_CLES.map((cle) => {
          const ind = indicateurs.find((i) => i.id === cle.id)!;
          const lecture = lectureIndicateur(ind);
          const signe = "oppose" in cle ? -1 : 1;
          const { periode, libelleReference } = lecture;
          const valeur = signe * lecture.valeur;
          const reference = lecture.reference === undefined ? undefined : signe * lecture.reference;
          const unite = ind.unite === "points de base" ? "pb" : ind.unite;
          const diff = reference === undefined ? undefined : Math.round((valeur - reference) * 10 ** ind.decimales) / 10 ** ind.decimales;
          const fleche = diff === undefined ? "" : diff > 0 ? "↗" : diff < 0 ? "↘" : "→";
          const sens = diff === undefined ? "" : diff > 0 ? "en hausse" : diff < 0 ? "en baisse" : "stable";
          return (
            <li key={cle.id} className="relative rounded-2xl border border-line bg-surface p-3 sm:p-4">
              <p className="text-sm font-medium text-muted">{cle.libelle}</p>
              <p className="mt-1 font-serif text-2xl font-semibold text-ink tabular-nums sm:text-3xl">
                {formatNombre(valeur, ind.decimales)}
                <span className="ml-1 text-sm font-normal text-muted">{unite}</span>
              </p>
              <p className="mt-0.5 text-xs text-muted">{periode}</p>
              {diff !== undefined && (
                <p className="mt-2 text-xs text-body">
                  <span aria-hidden="true" className="mr-1 text-sm">
                    {fleche}
                  </span>
                  <span className="sr-only">{sens} : </span>
                  {diff === 0 ? "stable" : ecart(diff, ind.decimales, ind.unite)} {depuis(libelleReference)}
                </p>
              )}
              <BadgesSeuil indicateur={cle.id} className="mt-2" />
            </li>
          );
        })}
      </ul>
      <p className="mt-3 text-right text-sm">
        <Link href="/tableau-de-bord/" className="font-medium text-accent underline underline-offset-4">
          Tout le tableau de bord <span aria-hidden="true">→</span>
        </Link>
      </p>
    </div>
  );
}
