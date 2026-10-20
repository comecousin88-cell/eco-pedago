"use client";

import { useEffect, useState } from "react";

/**
 * Le cercle vicieux de la dette (et son inverse, le cercle vertueux) : six
 * étapes disposées en boucle ; l'étape mise en évidence avance toute seule,
 * ou pas à pas au clavier.
 */
const ETAPES = {
  vicieux: [
    { titre: "Déficit élevé", detail: "Les dépenses dépassent durablement les recettes." },
    { titre: "La dette monte", detail: "Chaque déficit s'ajoute au stock de dette." },
    { titre: "La confiance baisse", detail: "Les prêteurs doutent de la trajectoire et demandent une prime." },
    { titre: "Les taux montent", detail: "Les nouveaux emprunts coûtent plus cher." },
    { titre: "Les intérêts augmentent", detail: "La charge de la dette grossit à mesure que la dette est refinancée." },
    { titre: "Le déficit se creuse", detail: "Les intérêts en plus alourdissent le déficit… et la boucle recommence." },
  ],
  vertueux: [
    { titre: "Déficit réduit", detail: "Les dépenses et les recettes se rapprochent." },
    { titre: "La dette ralentit", detail: "Elle progresse moins vite que l'économie : le ratio baisse." },
    { titre: "La confiance revient", detail: "Les prêteurs jugent la trajectoire crédible." },
    { titre: "Les taux baissent", detail: "La prime de risque diminue." },
    { titre: "Les intérêts diminuent", detail: "Les emprunts refinancés coûtent moins cher." },
    { titre: "Le déficit baisse encore", detail: "Moins d'intérêts à payer libère des marges… et la boucle recommence." },
  ],
} as const;

const PAS_MS = 1800;

export function CercleVicieux() {
  const [mode, setMode] = useState<"vicieux" | "vertueux">("vicieux");
  const [actif, setActif] = useState(0);
  const [pause, setPause] = useState(false);
  const etapes = ETAPES[mode];

  useEffect(() => {
    if (pause || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const t = setInterval(() => setActif((a) => (a + 1) % 6), PAS_MS);
    return () => clearInterval(t);
  }, [pause]);

  const couleur = mode === "vicieux" ? "var(--bad)" : "var(--ok)";
  const R = 120;
  const pos = (i: number) => {
    const a = (i / 6) * 2 * Math.PI - Math.PI / 2;
    return { x: 160 + R * Math.cos(a), y: 150 + R * Math.sin(a) };
  };

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2">
        <div role="group" aria-label="Choix du cercle" className="inline-flex rounded-full border border-line p-0.5 text-sm">
          {(["vicieux", "vertueux"] as const).map((m) => (
            <button
              key={m}
              type="button"
              aria-pressed={mode === m}
              onClick={() => {
                setMode(m);
                setActif(0);
              }}
              className={`rounded-full px-3 py-1 ${mode === m ? "bg-ink text-page" : "text-muted hover:text-ink"}`}
            >
              Cercle {m}
            </button>
          ))}
        </div>
        <button type="button" onClick={() => setPause((p) => !p)} className="text-sm text-muted underline underline-offset-4 hover:text-ink">
          {pause ? "Reprendre l'animation" : "Mettre en pause"}
        </button>
        <button
          type="button"
          onClick={() => {
            setPause(true);
            setActif((a) => (a + 1) % 6);
          }}
          className="text-sm text-muted underline underline-offset-4 hover:text-ink"
        >
          Étape suivante
        </button>
      </div>

      <div className="mt-4 grid items-center gap-4 md:grid-cols-[20rem_minmax(0,1fr)]">
        <svg viewBox="0 0 320 300" className="mx-auto w-full max-w-xs" role="img" aria-label={`Cercle ${mode} en six étapes : ${etapes.map((e) => e.titre).join(", puis ")}, et la boucle recommence.`}>
          <defs>
            <marker id={`fleche-${mode}`} viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <path d="M0 0 L10 5 L0 10 z" fill={couleur} />
            </marker>
          </defs>
          <circle cx={160} cy={150} r={R} fill="none" stroke="var(--line)" strokeWidth={10} />
          {etapes.map((_, i) => {
            const a = pos(i);
            const b = pos((i + 1) % 6);
            const mx = (a.x + b.x) / 2;
            const my = (a.y + b.y) / 2;
            const k = 1.12;
            return (
              <path
                key={`f${i}`}
                d={`M${a.x} ${a.y} Q ${160 + (mx - 160) * k} ${150 + (my - 150) * k} ${b.x} ${b.y}`}
                fill="none"
                stroke={couleur}
                strokeWidth={i === actif ? 3 : 1.5}
                opacity={i === actif ? 1 : 0.35}
                markerEnd={`url(#fleche-${mode})`}
                className="transition-all duration-500"
              />
            );
          })}
          {etapes.map((e, i) => {
            const p = pos(i);
            const on = i === actif;
            return (
              <g key={e.titre} className="transition-all duration-500">
                <circle cx={p.x} cy={p.y} r={on ? 26 : 20} fill={on ? couleur : "var(--surface)"} stroke={couleur} strokeWidth={2} />
                <text x={p.x} y={p.y + 5} textAnchor="middle" fontSize={14} fontWeight={700} fill={on ? "var(--surface)" : couleur}>
                  {i + 1}
                </text>
              </g>
            );
          })}
          <text x={160} y={146} textAnchor="middle" fontSize={13} fontWeight={600} fill="var(--ink)">
            Cercle
          </text>
          <text x={160} y={164} textAnchor="middle" fontSize={13} fontWeight={600} fill="var(--ink)">
            {mode}
          </text>
        </svg>

        <ol className="space-y-1.5">
          {etapes.map((e, i) => (
            <li
              key={e.titre}
              aria-current={i === actif ? "step" : undefined}
              className={`rounded-lg px-3 py-2 text-sm transition-colors ${i === actif ? "bg-subtle" : ""}`}
            >
              <span className="font-semibold" style={{ color: i === actif ? couleur : undefined }}>
                {i + 1}. {e.titre}
              </span>
              <span className="block text-muted">{e.detail}</span>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}
