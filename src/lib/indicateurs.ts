/**
 * Calculs du tableau de bord : dernière valeur d'une série, valeur un an plus
 * tôt, libellé lisible de la période. Les séries viennent de data/*.json, avec
 * des périodes au format « AAAA » (annuel), « AAAA-MM » (mensuel),
 * « AAAA-Tn » (trimestriel) ou « AAAA-MM-JJ » (paliers : date d'entrée en
 * vigueur d'un nouveau taux).
 */

export type Frequence = "annuelle" | "trimestrielle" | "mensuelle" | "paliers";

export interface Point {
  x: string;
  y: number;
}

const MOIS = ["janvier", "février", "mars", "avril", "mai", "juin", "juillet", "août", "septembre", "octobre", "novembre", "décembre"];

/** Dernier point d'une série (les séries sont rangées dans l'ordre chronologique). */
export function dernierPoint(serie: readonly Point[]): Point {
  if (serie.length === 0) throw new Error("Série vide");
  return serie[serie.length - 1];
}

/** Période située un an avant `x`, dans le même format. */
export function unAnAvant(x: string, frequence: Frequence): string {
  if (frequence === "annuelle") return String(Number(x) - 1);
  if (frequence === "mensuelle") {
    const [a, m] = x.split("-");
    return `${Number(a) - 1}-${m}`;
  }
  if (frequence === "trimestrielle") {
    const [a, t] = x.split("-");
    return `${Number(a) - 1}-${t}`;
  }
  const [a, m, j] = x.split("-");
  return `${Number(a) - 1}-${m}-${j}`;
}

/**
 * Valeur de la série un an avant son dernier point. Pour une série en paliers,
 * c'est le palier en vigueur à cette date (le dernier changement antérieur).
 */
export function valeurUnAnAvant(serie: readonly Point[], frequence: Frequence): number | undefined {
  const cible = unAnAvant(dernierPoint(serie).x, frequence);
  if (frequence === "paliers") {
    const avant = serie.filter((p) => p.x <= cible);
    return avant.length ? avant[avant.length - 1].y : undefined;
  }
  return serie.find((p) => p.x === cible)?.y;
}

/** Libellé lisible d'une période : « septembre 2026 », « 2e trimestre 2026 », « 2025 », « 16/09/2026 ». */
export function libellePeriode(x: string, frequence: Frequence): string {
  if (frequence === "annuelle") return x;
  if (frequence === "mensuelle") {
    const [a, m] = x.split("-");
    return `${MOIS[Number(m) - 1]} ${a}`;
  }
  if (frequence === "trimestrielle") {
    const [a, t] = x.split("-");
    const n = Number(t.replace("T", ""));
    return `${n === 1 ? "1er" : `${n}e`} trimestre ${a}`;
  }
  const [a, m, j] = x.split("-");
  return `${j}/${m}/${a}`;
}

/**
 * Période d'un chiffre du tableau de bord, avec sa nature : « moyenne de
 * septembre 2026 » (taux de marché), « septembre 2026, sur un an » (inflation),
 * « 2e trimestre 2026 », « depuis le 16/09/2026 » (taux directeurs), « 2025 ».
 */
export function periodeIndicateur(x: string, frequence: Frequence, nature?: "moyenne" | "sur-un-an"): string {
  const p = libellePeriode(x, frequence);
  if (frequence === "paliers") return `depuis le ${p}`;
  if (nature === "moyenne") return `moyenne de ${p}`;
  if (nature === "sur-un-an") return `${p}, sur un an`;
  return p;
}

/** Points des `annees` dernières années (pour une courbe miniature). */
export function derniersPoints(serie: readonly Point[], frequence: Frequence, annees: number): Point[] {
  const fin = dernierPoint(serie).x;
  const anneeFin = Number(fin.slice(0, 4));
  const debut = String(anneeFin - annees);
  if (frequence === "annuelle") return serie.filter((p) => Number(p.x) >= anneeFin - annees);
  return serie.filter((p) => p.x.slice(0, 4) >= debut);
}
