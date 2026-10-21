"use client";

import Link from "next/link";
import { useState, type ReactNode } from "react";

export interface CarteIdee {
  id: string;
  affirmation: string;
  verdict: "vrai" | "faux" | "nuance";
  explication: ReactNode;
  lien: { href: string; libelle: string };
}

const VERDICTS = {
  vrai: { libelle: "Vrai", symbole: "✓", classes: "bg-ok-soft text-ok border-ok" },
  faux: { libelle: "Faux", symbole: "✕", classes: "bg-bad-soft text-bad border-bad" },
  nuance: { libelle: "Plus compliqué", symbole: "≈", classes: "bg-warn-soft text-warn border-warn" },
} as const;

/**
 * Cartes « idée reçue » : on lit l'affirmation, on se fait son avis, puis on
 * retourne la carte pour voir le verdict et l'explication chiffrée.
 */
export function CartesIdees({ idees }: { idees: CarteIdee[] }) {
  const [retournees, setRetournees] = useState<string[]>([]);
  const toutes = retournees.length === idees.length;
  return (
    <div>
      <button
        type="button"
        onClick={() => setRetournees(toutes ? [] : idees.map((i) => i.id))}
        className="text-sm font-medium text-accent underline underline-offset-4"
      >
        {toutes ? "Tout cacher" : "Tout révéler"}
      </button>
      <ul className="mt-4 grid gap-4 md:grid-cols-2">
        {idees.map((i) => {
          const ouverte = retournees.includes(i.id);
          const v = VERDICTS[i.verdict];
          return (
            <li key={i.id} id={i.id} className="flex flex-col rounded-2xl border border-line bg-surface p-5">
              <p className="font-serif text-lg leading-snug font-semibold text-ink">« {i.affirmation} »</p>
              {ouverte ? (
                <div className="mt-3 flex-1">
                  <p className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-sm font-semibold ${v.classes}`}>
                    <span aria-hidden="true">{v.symbole}</span> {v.libelle}
                  </p>
                  <p className="mt-3 text-sm leading-relaxed text-body">{i.explication}</p>
                  <p className="mt-3 text-sm">
                    <Link href={i.lien.href} className="font-medium text-accent underline underline-offset-4">
                      Pour comprendre : {i.lien.libelle}
                    </Link>
                  </p>
                </div>
              ) : (
                <div className="mt-auto pt-4">
                  <button
                    type="button"
                    onClick={() => setRetournees((l) => [...l, i.id])}
                    className="rounded-full border border-line px-4 py-1.5 text-sm font-medium text-body hover:border-ink hover:text-ink"
                  >
                    Vrai ou faux ? Voir la réponse
                  </button>
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
