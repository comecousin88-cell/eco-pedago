"use client";

import { useState, type ReactNode } from "react";

export interface EtapeFrise {
  date: string;
  titre: string;
  texte: ReactNode;
}

/**
 * Frise chronologique : une liste d'étapes, l'étape choisie affiche son
 * détail. Au clavier, les flèches gauche/droite passent d'une étape à l'autre.
 */
export function Frise({ etapes }: { etapes: EtapeFrise[] }) {
  const [choisie, setChoisie] = useState(0);
  const e = etapes[choisie];

  return (
    <div>
      <ol
        className="flex gap-1 overflow-x-auto pb-2"
        role="tablist"
        aria-label="Étapes"
        onKeyDown={(ev) => {
          if (ev.key === "ArrowRight") setChoisie((c) => Math.min(etapes.length - 1, c + 1));
          if (ev.key === "ArrowLeft") setChoisie((c) => Math.max(0, c - 1));
        }}
      >
        {etapes.map((x, i) => (
          <li key={x.date + x.titre} className="min-w-[7.5rem] flex-1">
            <button
              type="button"
              role="tab"
              aria-selected={i === choisie}
              tabIndex={i === choisie ? 0 : -1}
              onClick={() => setChoisie(i)}
              className={`flex w-full flex-col items-start rounded-xl border px-3 py-2 text-left transition-colors ${
                i === choisie ? "border-accent bg-accent-soft" : "border-line hover:bg-subtle"
              }`}
            >
              <span className="flex w-full items-center gap-2">
                <span aria-hidden="true" className={`h-2.5 w-2.5 shrink-0 rounded-full ${i === choisie ? "bg-accent" : "bg-line-strong"}`} />
                <span className="text-xs font-semibold text-accent">{x.date}</span>
              </span>
              <span className="mt-1 text-sm font-semibold text-ink">{x.titre}</span>
            </button>
          </li>
        ))}
      </ol>
      <div role="tabpanel" className="mt-3 rounded-xl bg-subtle p-4 text-sm leading-relaxed text-body">
        <p className="font-semibold text-ink">
          {e.date} · {e.titre}
        </p>
        <div className="mt-1">{e.texte}</div>
        <div className="mt-3 flex justify-between text-sm">
          <button type="button" disabled={choisie === 0} onClick={() => setChoisie((c) => c - 1)} className="text-muted underline underline-offset-4 disabled:opacity-40">
            ← Étape précédente
          </button>
          <button
            type="button"
            disabled={choisie === etapes.length - 1}
            onClick={() => setChoisie((c) => c + 1)}
            className="text-muted underline underline-offset-4 disabled:opacity-40"
          >
            Étape suivante →
          </button>
        </div>
      </div>
    </div>
  );
}
