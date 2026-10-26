"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { ANCRE_TERMINER, etatsSections, versSectionEnCours } from "@/lib/etapes-module";
import { useProgression } from "@/lib/progression";

/** État de chaque section d'un module, et la section en cours. */
export function useEtapes(hrefs: readonly string[]) {
  const { lues, passees } = useProgression();
  const etats = etatsSections(hrefs, lues, passees);
  return { etats, enCours: hrefs[etats.indexOf("en-cours")] as string | undefined };
}

export function Cadenas({ className = "" }: { className?: string }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 16 16" className={`h-3.5 w-3.5 shrink-0 ${className}`} fill="none" stroke="currentColor" strokeWidth="1.6">
      <rect x="3" y="7" width="10" height="7" rx="1.5" />
      <path d="M5.5 7V5a2.5 2.5 0 0 1 5 0v2" />
    </svg>
  );
}

/** Lien vers une section verrouillée : mène au bouton « J'ai compris » de la section en cours. */
export function LienVerrouille({ enCours, label, className, children }: { enCours: string; label: string; className?: string; children: ReactNode }) {
  return (
    <Link
      href={`${enCours}#${ANCRE_TERMINER}`}
      aria-label={label}
      onClick={(e) => {
        if (versSectionEnCours(enCours)) e.preventDefault();
      }}
      className={className}
    >
      {children}
    </Link>
  );
}
