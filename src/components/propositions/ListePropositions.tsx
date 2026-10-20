"use client";

import Link from "next/link";
import { useState } from "react";
import { BadgeVerdict, type NiveauVerdict } from "@/components/pedago/Encadres";
import { SoonBadge } from "@/components/ui/SoonBadge";

interface Carte {
  slug: string;
  titre: string;
  theme: string;
  verdict?: NiveauVerdict;
  redigee: boolean;
}

const FILTRES: { v: NiveauVerdict | "toutes"; l: string }[] = [
  { v: "toutes", l: "Toutes" },
  { v: "solide", l: "Mécanisme solide" },
  { v: "debattu", l: "Débattu" },
  { v: "ne-tient-pas", l: "Ne tient pas en l'état" },
];

/** Grille des fiches, filtrable par verdict. Les fiches pas encore rédigées sont listées comme « bientôt ». */
export function ListePropositions({ propositions }: { propositions: Carte[] }) {
  const [filtre, setFiltre] = useState<NiveauVerdict | "toutes">("toutes");
  const visibles = propositions.filter((p) => filtre === "toutes" || p.verdict === filtre);

  return (
    <div className="mt-8">
      <div role="group" aria-label="Filtrer par verdict" className="flex flex-wrap gap-2">
        {FILTRES.map((f) => (
          <button
            key={f.v}
            type="button"
            aria-pressed={filtre === f.v}
            onClick={() => setFiltre(f.v)}
            className={`rounded-full border px-3 py-1.5 text-sm font-medium ${
              filtre === f.v ? "border-ink bg-ink text-page" : "border-line text-muted hover:text-ink"
            }`}
          >
            {f.l}
          </button>
        ))}
      </div>
      <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {visibles.map((p) => {
          const contenu = (
            <>
              <p className="text-xs font-semibold tracking-wide text-accent uppercase">{p.theme}</p>
              <h2 className="mt-2 font-serif text-lg leading-snug font-semibold text-ink">{p.titre}</h2>
              <div className="mt-auto pt-4">{p.verdict && p.redigee ? <BadgeVerdict niveau={p.verdict} /> : <SoonBadge />}</div>
            </>
          );
          const classes = "flex h-full flex-col rounded-2xl border border-line border-t-4 border-t-accent bg-surface p-5";
          return (
            <li key={p.slug}>
              {p.redigee ? (
                <Link href={`/propositions/${p.slug}/`} className={`${classes} transition hover:-translate-y-0.5 hover:shadow-md`}>
                  {contenu}
                </Link>
              ) : (
                <div className={`${classes} opacity-80`}>{contenu}</div>
              )}
            </li>
          );
        })}
      </ul>
      {visibles.length === 0 && <p className="mt-6 text-muted">Aucune fiche rédigée avec ce verdict pour l&apos;instant.</p>}
    </div>
  );
}
