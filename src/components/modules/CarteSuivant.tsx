"use client";

import Link from "next/link";
import { Cadenas, LienVerrouille, useEtapes } from "./Etapes";

const CARTE = "rounded-2xl border border-line bg-surface p-4 text-right hover:border-line-strong";

/** Carte « Suivant → » en bas de page : verrouillée comme dans le panneau « Progression ». */
export function CarteSuivant({ href, titre, sousTitre, sections }: { href: string; titre: string; sousTitre?: string; sections: string[] }) {
  const { etats, enCours } = useEtapes(sections);
  const i = sections.indexOf(href);
  if (i >= 0 && etats[i] === "verrouillee" && enCours) {
    return (
      <LienVerrouille enCours={enCours} label={`Suivant : ${titre} (verrouillée, termine d’abord la section en cours)`} className={`${CARTE} text-muted`}>
        <span className="inline-flex items-center gap-1.5 text-sm">
          <Cadenas /> Suivant →
        </span>
        <span className="mt-1 block font-semibold">{titre}</span>
      </LienVerrouille>
    );
  }
  return (
    <Link href={href} className={CARTE}>
      <span className="text-sm text-muted">Suivant →</span>
      <span className="mt-1 block font-semibold text-ink">{titre}</span>
      {sousTitre && <span className="mt-0.5 block text-sm text-muted">{sousTitre}</span>}
    </Link>
  );
}
