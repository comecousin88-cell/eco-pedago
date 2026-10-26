"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Un réglage de liste (filtre, recherche) gardé pour la durée de la visite :
 * en revenant sur la liste, on le retrouve. Rendu d'abord avec la valeur par
 * défaut (comme sur le serveur), puis remplacé par la valeur gardée.
 */
export function useEtatConserve<T>(cle: string, initial: T): [T, (v: T) => void] {
  const [valeur, setValeur] = useState<T>(initial);
  const lu = useRef(false);

  useEffect(() => {
    // Après le premier affichage, pour que le rendu du serveur et celui du navigateur concordent.
    const id = window.setTimeout(() => {
      try {
        const brut = sessionStorage.getItem(`etat:${cle}`);
        if (brut !== null) setValeur(JSON.parse(brut) as T);
      } catch {
        // Stockage indisponible ou valeur illisible : on garde la valeur par défaut.
      }
      lu.current = true;
    }, 0);
    return () => window.clearTimeout(id);
  }, [cle]);

  useEffect(() => {
    if (!lu.current) return;
    try {
      sessionStorage.setItem(`etat:${cle}`, JSON.stringify(valeur));
    } catch {
      // Stockage indisponible : rien n'est gardé.
    }
  }, [cle, valeur]);

  return [valeur, setValeur];
}
