"use client";

import { useEffect } from "react";

/** Renvoie immédiatement vers une autre adresse (site statique : pas de redirection côté serveur). */
export function Redirection({ vers }: { vers: string }) {
  useEffect(() => {
    window.location.replace(vers);
  }, [vers]);
  return null;
}
