"use client";

import { useEffect } from "react";
import { marquerLue } from "@/lib/progression";

/**
 * Note une page sans sections (fiche, jeu, tableau de bord…) comme lue quand
 * le lecteur arrive en bas de son contenu principal, pas dès son affichage.
 * Les sections de module utilisent FinDeSection (repère et bouton « J'ai compris »).
 */
export function MarquerLue({ href }: { href: string }) {
  useEffect(() => {
    const verifier = () => {
      const main = document.querySelector("main");
      if (main && main.getBoundingClientRect().bottom <= window.innerHeight + 120) {
        marquerLue(href);
        window.removeEventListener("scroll", verifier);
      }
    };
    verifier();
    window.addEventListener("scroll", verifier, { passive: true });
    return () => window.removeEventListener("scroll", verifier);
  }, [href]);
  return null;
}
