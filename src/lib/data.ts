/**
 * Accès aux chiffres du site. Tous les chiffres vivent dans data/*.json, chacun
 * avec sa valeur, son unité, sa date et sa source. Les composants passent par
 * getDonnee() : aucun chiffre n'est écrit en dur dans le code.
 */

export type Statut = "verifie" | "a_verifier";

export interface Source {
  nom: string;
  url: string;
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
import dette from "../../data/dette.json";
import retraites from "../../data/retraites.json";

export const fichiers: Record<string, FichierDonnees> = {
  aft: aft as FichierDonnees,
  dette: dette as FichierDonnees,
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
