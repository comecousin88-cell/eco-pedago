import type { Point } from "./indicateurs";

/**
 * Alertes de seuil : un indicateur franchit un seuil marquant (taux à 10 ans
 * au-dessus de 5 %, dette au-dessus de 120 % du PIB…). Fonctions pures,
 * appliquées aux séries de data/*.json à la construction du site.
 */

export type Sens = "au-dessus" | "au-dessous";

export type Etat =
  /** Le dernier point est au-delà du seuil ; `depuis` = premier point de cette période. */
  | { etat: "franchi"; depuis: string; dernier: Point }
  /** Le dernier point est revenu en deçà du seuil, alors que le précédent était au-delà. */
  | { etat: "retour"; dernier: Point; precedent: Point }
  | { etat: "normal"; dernier: Point };

const auDela = (y: number, seuil: number, sens: Sens) => (sens === "au-dessus" ? y > seuil : y < seuil);

/** Situation d'une série (triée par date) par rapport à un seuil. */
export function evaluerSeuil(points: readonly Point[], seuil: number, sens: Sens): Etat {
  if (points.length === 0) throw new Error("série vide");
  const dernier = points[points.length - 1];
  if (auDela(dernier.y, seuil, sens)) {
    let i = points.length - 1;
    while (i > 0 && auDela(points[i - 1].y, seuil, sens)) i--;
    return { etat: "franchi", depuis: points[i].x, dernier };
  }
  const precedent = points[points.length - 2];
  if (precedent && auDela(precedent.y, seuil, sens)) return { etat: "retour", dernier, precedent };
  return { etat: "normal", dernier };
}

/** Écart point par point entre deux séries (a − b), sur les dates communes. */
export function difference(a: readonly Point[], b: readonly Point[], facteur = 1): Point[] {
  const parDate = new Map(b.map((p) => [p.x, p.y]));
  return a.filter((p) => parDate.has(p.x)).map((p) => ({ x: p.x, y: Math.round((p.y - parDate.get(p.x)!) * facteur * 1000) / 1000 }));
}

/**
 * Ajoute à une série une valeur plus récente (par exemple le taux du jour à
 * une série mensuelle), seulement si elle est postérieure au dernier point.
 */
export function avecValeurRecente(points: readonly Point[], recente?: { valeur: number; date: string }): Point[] {
  if (!recente || points.length === 0) return [...points];
  const dernier = points[points.length - 1];
  // Une date du jour (AAAA-MM-JJ) est postérieure au mois AAAA-MM si elle ne commence pas par lui.
  if (recente.date <= dernier.x || recente.date.startsWith(dernier.x)) return [...points];
  return [...points, { x: recente.date, y: recente.valeur }];
}
