"use client";

import { useEffect } from "react";
import { marquerLue } from "@/lib/progression";

/** Note la page comme lue dès son affichage (progression des modules et des parcours). */
export function MarquerLue({ href }: { href: string }) {
  useEffect(() => {
    marquerLue(href);
  }, [href]);
  return null;
}
