/**
 * Accès aux chiffres du site. Tous les chiffres vivent dans data/*.json, chacun
 * avec sa valeur, son unité, sa date et sa source. Les composants passent par
 * getDonnee() : aucun chiffre n'est écrit en dur dans le code.
 */

/**
 * « hypothese » : un montant de comparaison choisi pour illustrer un calcul,
 * pas une donnée observée. Il est toujours présenté comme tel.
 */
export type Statut = "verifie" | "a_verifier" | "hypothese";

export interface Source {
  nom: string;
  /** Absente seulement pour une hypothèse. */
  url?: string;
}

interface DonneeBase {
  id: string;
  label: string;
  unite: string;
  /** Date à laquelle se rapporte la donnée (AAAA, AAAA-MM ou AAAA-MM-JJ). */
  date: string;
  source: Source;
  statut: Statut;
  /** Date de consultation de la source (AAAA-MM-JJ). */
  consulte_le?: string;
  note?: string;
}

export interface DonneeValeur extends DonneeBase {
  valeur: number;
}

export interface PointSerie {
  x: string;
  y: number;
}

export interface DonneeSerie extends DonneeBase {
  serie: PointSerie[];
}

export type Donnee = DonneeValeur | DonneeSerie;

export interface FichierDonnees {
  /** Présentation du fichier, pour qui le maintient. */
  description: string;
  donnees: Donnee[];
}

// Chaque nouveau fichier de données s'ajoute ici.
import aft from "../../data/aft.json";
import banqueCentrale from "../../data/banque-centrale.json";
import budgets from "../../data/budgets.json";
import cadreEuropeen from "../../data/cadre-europeen.json";
import cotisations from "../../data/cotisations.json";
import dette from "../../data/dette.json";
import europe from "../../data/europe.json";
import financesPubliques from "../../data/finances-publiques.json";
import fiscalite from "../../data/fiscalite.json";
import grece from "../../data/grece.json";
import indicateurs from "../../data/indicateurs.json";
import jeuMinistre from "../../data/jeu-ministre.json";
import international from "../../data/international.json";
import macro from "../../data/macro.json";
import marches from "../../data/marches.json";
import perspective from "../../data/perspective.json";
import propositions from "../../data/propositions.json";
import retraites from "../../data/retraites.json";

export const fichiers: Record<string, FichierDonnees> = {
  aft: aft as FichierDonnees,
  "banque-centrale": banqueCentrale as FichierDonnees,
  budgets: budgets as FichierDonnees,
  "cadre-europeen": cadreEuropeen as FichierDonnees,
  cotisations: cotisations as FichierDonnees,
  dette: dette as FichierDonnees,
  europe: europe as FichierDonnees,
  "finances-publiques": financesPubliques as FichierDonnees,
  fiscalite: fiscalite as FichierDonnees,
  grece: grece as FichierDonnees,
  indicateurs: indicateurs as FichierDonnees,
  "jeu-ministre": jeuMinistre as FichierDonnees,
  international: international as FichierDonnees,
  macro: macro as FichierDonnees,
  marches: marches as FichierDonnees,
  perspective: perspective as FichierDonnees,
  propositions: propositions as FichierDonnees,
  retraites: retraites as FichierDonnees,
};

const index = new Map<string, Donnee>();
for (const fichier of Object.values(fichiers)) {
  for (const d of fichier.donnees) index.set(d.id, d);
}

export function getDonnee(id: string): Donnee {
  const d = index.get(id);
  if (!d) throw new Error(`Donnée inconnue : ${id} (à ajouter dans data/*.json)`);
  return d;
}

export function getValeur(id: string): DonneeValeur {
  const d = getDonnee(id);
  if (!("valeur" in d)) throw new Error(`${id} est une série, pas une valeur`);
  return d;
}

export function getSerie(id: string): DonneeSerie {
  const d = getDonnee(id);
  if (!("serie" in d)) throw new Error(`${id} est une valeur, pas une série`);
  return d;
}

export function toutesLesDonnees(): Donnee[] {
  return [...index.values()];
}
