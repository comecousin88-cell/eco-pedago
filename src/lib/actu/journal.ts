/**
 * Journal des mises à jour d'indicateurs (data/actu-journal.json) : chaque
 * fois qu'une source publie une nouvelle période (un nouveau mois d'inflation,
 * un nouveau trimestre de dette…), la mise à jour automatique l'inscrit avec
 * sa date de détection. Le fil « L'actu » le lit. Fonctions pures, sans import.
 */

interface DonneeMinimale {
  id: string;
  date: string;
  valeur?: number;
  serie?: { x: string; y: number }[];
}

export interface EntreeJournal {
  id: string;
  /** Jour où la nouvelle période a été détectée (AAAA-MM-JJ). */
  date: string;
  donnee: string;
  periode: string;
  valeur: number;
  avant?: { periode: string; valeur: number };
}

export interface Journal {
  description: string;
  entrees: EntreeJournal[];
}

const dernier = (d: DonneeMinimale) =>
  d.serie ? { periode: d.serie[d.serie.length - 1].x, valeur: d.serie[d.serie.length - 1].y } : { periode: d.date, valeur: d.valeur as number };

/**
 * Nouvelle période publiée ? Une simple révision d'un chiffre déjà connu n'en
 * est pas une : seule l'arrivée d'une période plus récente compte.
 */
export function nouvellePeriode(ancienne: DonneeMinimale, nouvelle: DonneeMinimale, aujourdhui: string): EntreeJournal | undefined {
  const a = dernier(ancienne);
  const n = dernier(nouvelle);
  if (n.periode <= a.periode) return undefined;
  return { id: `${nouvelle.id}-${n.periode}`, date: aujourdhui, donnee: nouvelle.id, periode: n.periode, valeur: n.valeur, avant: a };
}

/** Ajoute des entrées au journal, sans doublon, les plus récentes d'abord. */
export function ajouterAuJournal(journal: Journal, nouvelles: EntreeJournal[], max = 200): Journal {
  const ids = new Set(journal.entrees.map((e) => e.id));
  const entrees = [...nouvelles.filter((e) => !ids.has(e.id)), ...journal.entrees]
    .sort((x, y) => (x.date < y.date ? 1 : x.date > y.date ? -1 : 0))
    .slice(0, max);
  return { ...journal, entrees };
}
