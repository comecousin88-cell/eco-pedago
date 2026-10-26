"use client";

import { useSyncExternalStore } from "react";
import { ANCIENS_PARCOURS, parcours, type ParcoursId } from "@/content/parcours";

/**
 * Le parcours thématique en cours, gardé dans le navigateur. Sans stockage, il
 * vaut jusqu'au rechargement de la page. Un ancien parcours (« Je découvre »,
 * « J'approfondis ») reprend dans « Tout comprendre ». Le niveau de lecture ne
 * dépend plus du parcours : il se choisit dans chaque module.
 */

const CLE = "parcours";
const ecouteurs = new Set<() => void>();
let memoire: ParcoursId | null = null;

function lire(): ParcoursId | null {
  try {
    const v = localStorage.getItem(CLE);
    if (v && ANCIENS_PARCOURS[v]) return ANCIENS_PARCOURS[v];
    return parcours.some((p) => p.id === v) ? (v as ParcoursId) : null;
  } catch {
    return memoire;
  }
}

function abonner(e: () => void) {
  ecouteurs.add(e);
  return () => ecouteurs.delete(e);
}

export function useParcoursActif(): ParcoursId | null {
  return useSyncExternalStore(abonner, lire, () => null);
}

function ecrire(id: ParcoursId | null) {
  memoire = id;
  try {
    if (id) localStorage.setItem(CLE, id);
    else localStorage.removeItem(CLE);
  } catch {
    // Stockage indisponible : on garde la valeur en mémoire.
  }
  for (const e of ecouteurs) e();
}

/** Démarre (ou reprend) un parcours. */
export function demarrerParcours(id: ParcoursId) {
  ecrire(id);
}

export function quitterParcours() {
  ecrire(null);
}
