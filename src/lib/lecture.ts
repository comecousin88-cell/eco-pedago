"use client";

import { useSyncExternalStore } from "react";
import { LECTURE_KEY } from "./lecture-script";

/**
 * Mode de lecture global : « simple » replie les parties « Pour aller plus
 * loin » et les débats, « approfondi » les ouvre. Le choix est appliqué sur
 * <html data-lecture> (le CSS s'en sert pour éviter tout saut à l'affichage)
 * et gardé dans localStorage. Sans stockage, il vaut pour la page en cours.
 */

export type ModeLecture = "simple" | "approfondi";

const ecouteurs = new Set<() => void>();

function lire(): ModeLecture {
  return document.documentElement.getAttribute("data-lecture") === "approfondi" ? "approfondi" : "simple";
}

function abonner(e: () => void) {
  ecouteurs.add(e);
  return () => ecouteurs.delete(e);
}

export function useModeLecture(): ModeLecture {
  // Côté serveur et à la première hydratation : « simple », le mode par défaut.
  return useSyncExternalStore(abonner, lire, () => "simple");
}

export function changerModeLecture(mode: ModeLecture) {
  document.documentElement.setAttribute("data-lecture", mode);
  try {
    localStorage.setItem(LECTURE_KEY, mode);
  } catch {
    // Stockage indisponible : le mode reste appliqué à la page en cours.
  }
  for (const e of ecouteurs) e();
}
