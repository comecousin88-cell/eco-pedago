"use client";

import { useSyncExternalStore } from "react";
import { getParcours, type ParcoursId } from "@/content/parcours";
import { changerModeLecture } from "./lecture";

/**
 * Le parcours en cours (« Je découvre » ou « J'approfondis »), gardé dans le
 * navigateur. Sans stockage, il vaut jusqu'au rechargement de la page.
 */

const CLE = "parcours";
const ecouteurs = new Set<() => void>();
let memoire: ParcoursId | null = null;

function lire(): ParcoursId | null {
  try {
    const v = localStorage.getItem(CLE);
    return v === "decouvrir" || v === "approfondir" ? v : null;
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

/** Démarre (ou reprend) un parcours et règle le mode de lecture qui va avec. */
export function demarrerParcours(id: ParcoursId) {
  ecrire(id);
  changerModeLecture(getParcours(id).mode);
}

export function quitterParcours() {
  ecrire(null);
}
