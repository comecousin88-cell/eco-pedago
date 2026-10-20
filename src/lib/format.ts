import type { Donnee } from "./data";

const MOIS = [
  "janvier", "février", "mars", "avril", "mai", "juin",
  "juillet", "août", "septembre", "octobre", "novembre", "décembre",
];

/** Nombre à la française : espace fine pour les milliers, virgule décimale. */
export function formatNombre(valeur: number, decimales = 0): string {
  return new Intl.NumberFormat("fr-FR", {
    minimumFractionDigits: decimales,
    maximumFractionDigits: decimales,
  }).format(valeur);
}

/** Nombre de décimales significatives d'une valeur (au plus 2). */
function decimalesDe(valeur: number): number {
  if (Number.isInteger(valeur)) return 0;
  return Math.round(valeur * 10) === valeur * 10 ? 1 : 2;
}

/** « 3 500 Md€ », « 5,1 % du PIB », « 8,5 ans ». */
export function formatAvecUnite(valeur: number, unite: string, decimales?: number): string {
  const n = formatNombre(valeur, decimales ?? decimalesDe(valeur));
  return `${n} ${unite}`;
}

/** Taux décimal en pourcentage : 0.0294 → « 2,94 % ». */
export function formatPourcent(taux: number, decimales = 1): string {
  return `${formatNombre(taux * 100, decimales)} %`;
}

/** Montant en euros : 91.47 → « 91,47 € ». */
export function formatEuros(montant: number, decimales = 2): string {
  return `${formatNombre(montant, decimales)} €`;
}

/**
 * Date d'une donnée, dans la forme demandée sous les graphiques :
 * « 2026-03-31 » → « au 31/03/2026 », « 2026-03 » → « de mars 2026 »,
 * « 2025 » → « de 2025 ».
 */
export function formatDateDonnee(date: string): string {
  const [a, m, j] = date.split("-");
  if (j) return `au ${j}/${m}/${a}`;
  if (m) return `de ${MOIS[Number(m) - 1]} ${a}`;
  return `de ${a}`;
}

/** « Source : Insee — données au 31/03/2026 ». */
export function formatSource(d: Pick<Donnee, "source" | "date">): string {
  return `Source : ${d.source.nom} — données ${formatDateDonnee(d.date)}`;
}
