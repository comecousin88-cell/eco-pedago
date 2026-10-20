"use client";

import { useEffect, useState } from "react";

/**
 * Répartition et capitalisation côte à côte. À gauche, l'argent passe des
 * actifs aux retraités la même année. À droite, il est placé, grossit avec
 * les années, puis revient à la même personne à sa retraite.
 * Les montants sont fictifs (100 € par an, rendement d'exemple).
 */
const ETAPES = [
  { annee: "Aujourd'hui", repartition: "Les actifs cotisent 100 €…", capitalisation: "Vous placez 100 € sur votre compte retraite." },
  { annee: "Aujourd'hui", repartition: "… versés aussitôt aux retraités d'aujourd'hui.", capitalisation: "L'argent est investi (actions, obligations…)." },
  { annee: "Dans 20 ans", repartition: "Les actifs de l'époque cotisent à leur tour…", capitalisation: "Il a grossi avec les intérêts et les dividendes." },
  { annee: "Dans 40 ans", repartition: "… et paient votre pension.", capitalisation: "Vous récupérez votre épargne et ses gains pour votre retraite." },
];

const RENDEMENT = 0.02; // rendement réel d'exemple

export function RepartitionCapitalisation() {
  const [etape, setEtape] = useState(0);
  const [lecture, setLecture] = useState(true);

  useEffect(() => {
    if (!lecture || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const t = setInterval(() => setEtape((e) => (e + 1) % ETAPES.length), 2200);
    return () => clearInterval(t);
  }, [lecture]);

  const capital = [100, 100, 100 * (1 + RENDEMENT) ** 20, 100 * (1 + RENDEMENT) ** 40][etape];
  const e = ETAPES[etape];

  return (
    <div>
      <div className="flex flex-wrap items-center gap-3 text-sm">
        <span className="font-semibold text-ink">{e.annee}</span>
        <button type="button" onClick={() => setLecture((l) => !l)} className="text-muted underline underline-offset-4 hover:text-ink">
          {lecture ? "Pause" : "Lecture"}
        </button>
        <button
          type="button"
          onClick={() => {
            setLecture(false);
            setEtape((x) => (x + 1) % ETAPES.length);
          }}
          className="text-muted underline underline-offset-4 hover:text-ink"
        >
          Étape suivante
        </button>
      </div>
      <div className="mt-3 grid gap-4 sm:grid-cols-2">
        {/* Répartition */}
        <div className="rounded-xl border border-line p-3">
          <p className="font-semibold text-ink">Répartition</p>
          <svg viewBox="0 0 260 120" className="mt-2 w-full" role="img" aria-label={`Répartition : ${e.repartition}`}>
            <Bonhomme x={50} y={60} couleur="var(--series-1)" label="actifs" />
            <Bonhomme x={210} y={60} couleur="var(--series-2)" label="retraités" />
            <line x1={75} y1={55} x2={185} y2={55} stroke="var(--line-strong)" strokeWidth={2} strokeDasharray="4 4" />
            <circle
              cx={etape === 0 || etape === 2 ? 80 : 180}
              cy={55}
              r={11}
              fill="var(--series-4)"
              stroke="var(--surface)"
              strokeWidth={2}
              className="transition-all duration-700"
            />
            <text x={etape === 0 || etape === 2 ? 80 : 180} y={59} textAnchor="middle" fontSize={10} fontWeight={700} fill="var(--ink)" className="transition-all duration-700">
              €
            </text>
          </svg>
          <p className="mt-2 min-h-10 text-sm text-body">{e.repartition}</p>
        </div>
        {/* Capitalisation */}
        <div className="rounded-xl border border-line p-3">
          <p className="font-semibold text-ink">Capitalisation</p>
          <svg viewBox="0 0 260 120" className="mt-2 w-full" role="img" aria-label={`Capitalisation : ${e.capitalisation}`}>
            <Bonhomme x={50} y={60} couleur="var(--series-1)" label={etape === 3 ? "vous, retraité" : "vous, actif"} />
            <rect x={150} y={20} width={90} height={80} rx={8} fill="var(--subtle)" stroke="var(--line-strong)" />
            <text x={195} y={36} textAnchor="middle" fontSize={10} fill="var(--muted)">
              votre compte
            </text>
            <rect
              x={165}
              y={95 - Math.min(55, capital / 4)}
              width={60}
              height={Math.min(55, capital / 4)}
              rx={4}
              fill="var(--series-4)"
              className="transition-all duration-700"
            />
            <text x={195} y={90} textAnchor="middle" fontSize={12} fontWeight={700} fill="var(--ink)">
              {Math.round(capital)} €
            </text>
          </svg>
          <p className="mt-2 min-h-10 text-sm text-body">{e.capitalisation}</p>
        </div>
      </div>
      <p className="mt-2 text-xs text-muted">
        Exemple fictif : 100 € placés à un rendement réel de 2 % par an deviennent environ{" "}
        {Math.round(100 * (1 + RENDEMENT) ** 40)} € en 40 ans. Le rendement réel n&apos;est pas garanti : il peut être plus
        élevé ou plus faible, et les marchés peuvent baisser juste avant le départ en retraite.
      </p>
    </div>
  );
}

function Bonhomme({ x, y, couleur, label }: { x: number; y: number; couleur: string; label: string }) {
  return (
    <g>
      <circle cx={x} cy={y - 18} r={7} fill={couleur} />
      <path d={`M${x - 10} ${y + 10} Q ${x} ${y - 14} ${x + 10} ${y + 10} Z`} fill={couleur} />
      <text x={x} y={y + 26} textAnchor="middle" fontSize={11} fill="var(--muted)">
        {label}
      </text>
    </g>
  );
}
