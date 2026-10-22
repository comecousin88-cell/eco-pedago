"use client";

import { useSyncExternalStore } from "react";
import { LECTURE_KEY } from "./lecture-script";

/**
 * Mode de lecture global. « Simple » : l'essentiel et le mécanisme, chiffres
 * arrondis, curseurs principaux des simulateurs. « Approfondi » : en plus, les
 * formules, les débats, « Pour aller plus loin », tous les réglages et les
 * chiffres précis avec leur source. Le choix est posé sur <html data-lecture>
 * (le CSS masque ce qui ne concerne pas le mode, voir globals.css) et gardé
 * dans localStorage. Sans stockage, il vaut pour la page en cours.
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

/** Blocs propres au mode Approfondi présents dans la page (sections, débats, formules, réglages). */
export function blocsApprofondis(racine: ParentNode = document): HTMLElement[] {
  const tous = [...racine.querySelectorAll<HTMLElement>('main [data-selon-mode="approfondi"][data-bloc], main .prose-eco .katex-display')];
  // Un bloc inclus dans un autre ne compte qu'une fois.
  return tous.filter((b) => !tous.some((autre) => autre !== b && autre.contains(b)));
}

/** La page change-t-elle selon le mode (blocs, chiffres arrondis ou précis) ? */
export function pageSelonMode(): boolean {
  return document.querySelector("main [data-selon-mode]") !== null || blocsApprofondis().length > 0;
}

/** Message bref à afficher après un changement de mode. */
export function messageChangement(mode: ModeLecture, n: number, chiffres: boolean): string {
  const sections = `${n} section${n > 1 ? "s" : ""}`;
  if (mode === "approfondi") {
    if (n === 0) return chiffres ? "Mode Approfondi : chiffres précis, avec leur source." : "Mode Approfondi.";
    return `Mode Approfondi : ${sections} ajoutée${n > 1 ? "s" : ""} sur cette page${chiffres ? ", chiffres précis avec leur source" : ""}.`;
  }
  if (n === 0) return chiffres ? "Mode Simple : chiffres arrondis." : "Mode Simple.";
  return `Mode Simple : ${sections} masquée${n > 1 ? "s" : ""} sur cette page${chiffres ? ", chiffres arrondis" : ""}.`;
}

export const EVENEMENT_ANNONCE = "lecture:annonce";

/**
 * Changement de mode demandé par le lecteur : applique le mode, surligne les
 * blocs qui apparaissent (ou, en passant en Simple, les montre un instant avant
 * de les masquer) et annonce le résultat.
 */
export function basculerModeLecture(mode: ModeLecture) {
  if (mode === lire()) return;
  const html = document.documentElement;
  const blocs = blocsApprofondis();
  const chiffres = document.querySelector('main [data-selon-mode="simple"]') !== null;
  if (mode === "approfondi") {
    changerModeLecture(mode);
    for (const b of blocs) {
      b.classList.remove("lecture-apparait");
      void b.offsetWidth; // relance l'animation
      b.classList.add("lecture-apparait");
      window.setTimeout(() => b.classList.remove("lecture-apparait"), 2700);
    }
  } else {
    // Les blocs restent visibles, surlignés, le temps de les voir partir.
    html.setAttribute("data-lecture-sortie", "");
    changerModeLecture(mode);
    window.setTimeout(() => html.removeAttribute("data-lecture-sortie"), 900);
  }
  window.dispatchEvent(new CustomEvent(EVENEMENT_ANNONCE, { detail: messageChangement(mode, blocs.length, chiffres) }));
}
