/**
 * Mesures du jeu « Redresser les comptes » (data/mesures-budget.json) et
 * agrégation des choix du joueur. Aucune mesure n'est qualifiée de bonne ou de
 * mauvaise : le jeu montre les montants, les délais et qui paie.
 */
import fichier from "../../../data/mesures-budget.json";
import type { Source } from "@/lib/data";

export type Scenario = "bas" | "central" | "haut";
export type Delai = "immediat" | "2-3-ans" | "long-terme";
export type Payeur =
  | "menages-modestes"
  | "classes-moyennes"
  | "menages-aises"
  | "retraites"
  | "actifs"
  | "fonctionnaires"
  | "entreprises"
  | "collectivites";

export interface Mesure {
  id: string;
  categorie: string;
  intitule: string;
  explication: string;
  /** Rendement annuel à effet plein, en Md€. */
  rendement: Record<Scenario, number>;
  delai: Delai;
  payeurs: Payeur[];
  /** « depense » : économie ; « recette » : prélèvement supplémentaire. */
  nature: "depense" | "recette";
  /** Variantes d'une même réforme : une seule mesure par groupe. */
  groupe?: string;
  /** Rendement particulièrement incertain (fraude, comportements). */
  incertain?: boolean;
  source: Source;
  date: string;
  statut: "verifie" | "a_verifier";
  consulte_le?: string;
  calcul?: string;
  note?: string;
}

export const mesures = fichier.mesures as Mesure[];

export const PAYEURS: { id: Payeur; libelle: string }[] = [
  { id: "menages-modestes", libelle: "Ménages modestes" },
  { id: "classes-moyennes", libelle: "Classes moyennes" },
  { id: "menages-aises", libelle: "Ménages aisés" },
  { id: "retraites", libelle: "Retraités" },
  { id: "actifs", libelle: "Actifs" },
  { id: "fonctionnaires", libelle: "Fonctionnaires" },
  { id: "entreprises", libelle: "Entreprises" },
  { id: "collectivites", libelle: "Collectivités" },
];

export const DELAIS: { id: Delai; libelle: string }[] = [
  { id: "immediat", libelle: "Effet immédiat" },
  { id: "2-3-ans", libelle: "Effet en 2 à 3 ans" },
  { id: "long-terme", libelle: "Effet à long terme" },
];

/** Catégories dans l'ordre d'apparition du fichier. */
export function categories(liste: readonly Mesure[] = mesures): string[] {
  return [...new Set(liste.map((m) => m.categorie))];
}

/**
 * Ajoute ou retire une mesure de la sélection. Choisir une variante d'une
 * réforme retire les autres variantes du même groupe.
 */
export function basculerMesure(choisies: readonly string[], id: string, liste: readonly Mesure[] = mesures): string[] {
  if (choisies.includes(id)) return choisies.filter((x) => x !== id);
  const m = liste.find((x) => x.id === id);
  if (!m) return [...choisies];
  const exclues = m.groupe ? new Set(liste.filter((x) => x.groupe === m.groupe).map((x) => x.id)) : new Set<string>();
  return [...choisies.filter((x) => !exclues.has(x)), id];
}

export interface Bilan {
  total: number;
  depenses: number;
  recettes: number;
  /** Montant par payeur : chaque mesure est répartie à parts égales entre ses payeurs (approximation). */
  parPayeur: Record<Payeur, number>;
  parDelai: Record<Delai, number>;
  parCategorie: Record<string, number>;
  /** Part du total venant de mesures au rendement incertain. */
  partIncertaine: number;
}

export function bilanMesures(choisies: readonly string[], scenario: Scenario, liste: readonly Mesure[] = mesures): Bilan {
  const parPayeur = Object.fromEntries(PAYEURS.map((p) => [p.id, 0])) as Record<Payeur, number>;
  const parDelai = Object.fromEntries(DELAIS.map((d) => [d.id, 0])) as Record<Delai, number>;
  const parCategorie: Record<string, number> = {};
  let depenses = 0;
  let recettes = 0;
  let incertain = 0;
  for (const id of choisies) {
    const m = liste.find((x) => x.id === id);
    if (!m) continue;
    const v = m.rendement[scenario];
    if (m.nature === "depense") depenses += v;
    else recettes += v;
    if (m.incertain) incertain += v;
    parDelai[m.delai] += v;
    parCategorie[m.categorie] = (parCategorie[m.categorie] ?? 0) + v;
    for (const p of m.payeurs) parPayeur[p] += v / m.payeurs.length;
  }
  const total = depenses + recettes;
  return { total, depenses, recettes, parPayeur, parDelai, parCategorie, partIncertaine: total > 0 ? incertain / total : 0 };
}
