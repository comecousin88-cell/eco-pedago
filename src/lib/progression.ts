"use client";

import { useSyncExternalStore } from "react";

/**
 * Progression du lecteur, gardée dans son navigateur (pas de compte, rien
 * n'est envoyé). Si le stockage est indisponible, tout marche sans mémoire.
 */

const CLE = "progression";

export interface Progression {
  /** Pages lues, par chemin (« /modules/les-bases/pib/ »). */
  lues: string[];
  /** Meilleur score au quiz, par module. */
  quiz: Record<string, { score: number; total: number }>;
}

const VIDE: Progression = { lues: [], quiz: {} };
const ecouteurs = new Set<() => void>();
let cache: { brut: string | null; valeur: Progression } = { brut: null, valeur: VIDE };

function lire(): Progression {
  let brut: string | null = null;
  try {
    brut = localStorage.getItem(CLE);
  } catch {
    return VIDE;
  }
  // Même texte stocké → même objet (exigé par useSyncExternalStore).
  if (brut === cache.brut) return cache.valeur;
  let valeur = VIDE;
  try {
    const p = brut ? JSON.parse(brut) : null;
    if (p && Array.isArray(p.lues) && typeof p.quiz === "object") valeur = p;
  } catch {
    // Contenu illisible : on repart de zéro.
  }
  cache = { brut, valeur };
  return valeur;
}

function ecrire(modif: (p: Progression) => Progression) {
  try {
    localStorage.setItem(CLE, JSON.stringify(modif(lire())));
  } catch {
    return;
  }
  for (const e of ecouteurs) e();
}

function abonner(e: () => void) {
  ecouteurs.add(e);
  // Une autre fenêtre ouverte sur le site peut aussi modifier la progression.
  const autreOnglet = (ev: StorageEvent) => ev.key === CLE && e();
  window.addEventListener("storage", autreOnglet);
  return () => {
    ecouteurs.delete(e);
    window.removeEventListener("storage", autreOnglet);
  };
}

export function useProgression(): Progression {
  return useSyncExternalStore(abonner, lire, () => VIDE);
}

export function marquerLue(chemin: string) {
  ecrire((p) => (p.lues.includes(chemin) ? p : { ...p, lues: [...p.lues, chemin] }));
}

export function enregistrerQuiz(module: string, score: number, total: number) {
  ecrire((p) => {
    const avant = p.quiz[module];
    if (avant && avant.score >= score) return p;
    return { ...p, quiz: { ...p.quiz, [module]: { score, total } } };
  });
}
