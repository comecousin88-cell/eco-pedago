"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

const cle = (chemin: string) => `defilement:${chemin}`;
let retourEnCours = false;

/**
 * Retour sans perte : la position de chaque page est gardée (pour la durée de
 * la visite) et, quand on revient en arrière (bouton « retour » du navigateur
 * ou du téléphone), la page reprend là où on l'avait laissée, même si elle se
 * reconstruit (filtres, listes, images qui se chargent).
 */
export function RetourSansPerte() {
  const chemin = usePathname();

  // Mémoriser la position pendant qu'on fait défiler, et repérer les retours en arrière.
  useEffect(() => {
    let attente = 0;
    const memoriser = () => {
      if (attente) return;
      attente = window.requestAnimationFrame(() => {
        attente = 0;
        try {
          sessionStorage.setItem(cle(window.location.pathname), String(Math.round(window.scrollY)));
        } catch {
          // Stockage indisponible : on ne garde rien.
        }
      });
    };
    const retour = () => {
      retourEnCours = true;
    };
    window.addEventListener("scroll", memoriser, { passive: true });
    window.addEventListener("popstate", retour);
    return () => {
      window.removeEventListener("scroll", memoriser);
      window.removeEventListener("popstate", retour);
    };
  }, []);

  // Après un retour en arrière, revenir à la position gardée, en réessayant le temps que la page se remplisse.
  useEffect(() => {
    if (!retourEnCours) return;
    retourEnCours = false;
    let y = 0;
    try {
      y = Number(sessionStorage.getItem(cle(chemin)) ?? 0);
    } catch {
      return;
    }
    if (!y) return;
    const debut = performance.now();
    let id = 0;
    const essayer = () => {
      window.scrollTo(0, y);
      if (Math.abs(window.scrollY - y) > 2 && performance.now() - debut < 1500) id = window.requestAnimationFrame(essayer);
    };
    id = window.requestAnimationFrame(essayer);
    return () => window.cancelAnimationFrame(id);
  }, [chemin]);

  return null;
}
