import { LIBELLE_ETAT, type Donnee, type EtatDonnee } from "./data";
import { libellePeriode } from "./indicateurs";

/**
 * Indicateurs qui existent en plusieurs versions (IPC ou IPCH, provisoire ou
 * définitif) : chaque affichage dit lequel il montre.
 */

/** Statut d'un point : seul le plus récent peut être provisoire. */
export function etatDuPoint(d: Donnee, x?: string): EtatDonnee | undefined {
  if (!d.etat) return undefined;
  if (!("serie" in d) || x === undefined) return d.etat;
  return x === d.serie[d.serie.length - 1].x ? d.etat : "definitif";
}

/** Période en clair : « septembre 2026 », « 2e trimestre 2026 », « 2025 ». */
export function periodeEnClair(x: string): string {
  if (/^\d{4}-\d{2}$/.test(x)) return libellePeriode(x, "mensuelle");
  if (/^\d{4}-T\d$/.test(x)) return libellePeriode(x, "trimestrielle");
  return x;
}

/** « IPC Insee, septembre 2026, définitif » ; rien pour une donnée sans statut. */
export function qualificatif(d: Donnee, x?: string): string | undefined {
  const etat = etatDuPoint(d, x);
  if (!etat || !d.indicateur) return undefined;
  const periode = "serie" in d ? (x ?? d.serie[d.serie.length - 1].x) : d.date;
  return `${d.indicateur}, ${periodeEnClair(periode)}, ${LIBELLE_ETAT[etat]}`;
}
