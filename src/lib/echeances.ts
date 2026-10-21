/**
 * Types et fonctions pures de l'agenda des échéances (data/agenda.json), sans
 * import : utilisables par le site comme par les scripts lancés avec Node
 * (scripts/veille-agenda.ts). Le site charge l'agenda via src/lib/agenda.ts.
 */

export const CATEGORIES = { notation: "Notation", budget: "Budget", bce: "BCE", publication: "Publication" } as const;
export type Categorie = keyof typeof CATEGORIES;

export interface Evenement {
  id: string;
  titre: string;
  categorie: Categorie;
  /** AAAA-MM-JJ, ou AAAA-MM quand seul le mois est connu. */
  date: string;
  precision: "jour" | "mois";
  statut: "confirme" | "a_confirmer";
  /** « automatique » : les chiffres concernés suivent seuls ; « validation » : demande de mise à jour à valider. */
  mise_a_jour: "automatique" | "validation";
  /** Situation avant l'échéance (par exemple la note actuelle). */
  situation?: string;
  description: string;
  /** Identifiants des données de data/*.json concernées. */
  donnees: string[];
  /** Pages du site à relire après l'échéance. */
  pages: string[];
  source: { nom: string; url: string };
  consulte_le: string;
  note?: string;
  /** Mots qui identifient la publication dans le calendrier de l'Insee (tous requis). */
  calendrier_insee?: string[];
  /** Date à laquelle l'échéance passée a été traitée (demande de mise à jour fusionnée). */
  traite?: string;
}

/** Page officielle surveillée : une modification de son texte ouvre une demande de mise à jour. */
export interface Surveillance {
  id: string;
  titre: string;
  url: string;
  donnees: string[];
  pages: string[];
  /** Empreinte du texte de la page lors de la dernière validation (null : pas encore relevée). */
  empreinte: string | null;
}

export interface Agenda {
  description: string;
  evenements: Evenement[];
  surveillance: Surveillance[];
}

/** Dernier jour où l'échéance peut tomber : la date elle-même, ou la fin du mois. */
export function finEcheance(e: Pick<Evenement, "date" | "precision">): string {
  if (e.precision === "jour") return e.date;
  const [a, m] = e.date.split("-").map(Number);
  return new Date(Date.UTC(a, m, 0)).toISOString().slice(0, 10);
}

/** Échéances à venir (ou en cours ce mois-ci), dans l'ordre chronologique. */
export function prochainesEcheances(evenements: Evenement[], aujourdhui: string, nombre = Infinity): Evenement[] {
  return evenements
    .filter((e) => finEcheance(e) >= aujourdhui)
    .sort((a, b) => (finEcheance(a) < finEcheance(b) ? -1 : finEcheance(a) > finEcheance(b) ? 1 : 0))
    .slice(0, nombre);
}

/** Échéances passées (strictement avant aujourd'hui), les plus récentes d'abord. */
export function echeancesPassees(evenements: Evenement[], aujourdhui: string): Evenement[] {
  return evenements.filter((e) => finEcheance(e) < aujourdhui).sort((a, b) => (finEcheance(a) < finEcheance(b) ? 1 : -1));
}

const MOIS = ["janvier", "février", "mars", "avril", "mai", "juin", "juillet", "août", "septembre", "octobre", "novembre", "décembre"];

/** « 23 octobre 2026 », « 1er décembre 2026 » ou « décembre 2026 ». */
export function dateEcheance(e: Pick<Evenement, "date" | "precision">): string {
  const [a, m, j] = e.date.split("-").map(Number);
  const mois = `${MOIS[m - 1]} ${a}`;
  return e.precision === "mois" ? mois : `${j === 1 ? "1er" : j} ${mois}`;
}
