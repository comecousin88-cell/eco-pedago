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

/**
 * Arrondi du mode de lecture « Simple » : une décimale sous 10, aucun entre 10
 * et 1 000, la centaine entre 1 000 et 10 000, le millier au-delà.
 * 4,44 → 4,4 ; 119,0 → 119 ; 3 595,5 → 3 600 ; 69,1 → 69.
 */
export function arrondiLecture(valeur: number): { valeur: number; decimales: number } {
  const a = Math.abs(valeur);
  if (a < 10) return { valeur: Math.round(valeur * 10) / 10, decimales: Number.isInteger(Math.round(valeur * 10) / 10) ? 0 : 1 };
  if (a < 1000) return { valeur: Math.round(valeur), decimales: 0 };
  if (a < 10000) return { valeur: Math.round(valeur / 100) * 100, decimales: 0 };
  return { valeur: Math.round(valeur / 1000) * 1000, decimales: 0 };
}

/** Nom court d'une source, pour l'afficher à côté d'un chiffre : « Insee, dette… » → « Insee ». */
export function sourceCourte(nom: string): string {
  const court = nom.split(/[,:(]/)[0].trim();
  return court.length > 40 ? `${court.slice(0, 37)}…` : court;
}
