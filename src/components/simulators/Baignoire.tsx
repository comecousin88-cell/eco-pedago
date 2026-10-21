"use client";

import { useEffect, useId, useRef, useState } from "react";
import { getValeur } from "@/lib/data";
import { cumulDette } from "@/lib/economics";
import { formatNombre } from "@/lib/format";
import { Curseur } from "./Curseur";
import { BarreScenario, useScenario } from "./Scenario";

/**
 * La baignoire : le robinet est le déficit de l'année (un flux), le niveau de
 * l'eau est la dette (un stock). Point de départ : la dette réelle au
 * 31 décembre de la dernière année connue.
 */

const MAX_DETTE = 8000; // Md€ : contenance de la baignoire dessinée
const ANNEES_MAX = 10;
const PAS_MS = 700;

// Géométrie du dessin (unités du viewBox)
const BAC = { x: 70, y: 70, l: 240, h: 170 };

export function Baignoire() {
  const depart = getValeur("dette.fin-annee");
  const deficitReel = getValeur("deficit.montant");
  const anneeDepart = Number(depart.date.slice(0, 4));

  const s = useScenario({ deficit: Math.round(deficitReel.valeur / 10) * 10 });
  const deficit = s.valeurs.deficit;
  const curseurId = useId();
  const [historique, setHistorique] = useState<number[]>([]); // dette après chaque année simulée
  const [enCours, setEnCours] = useState(false);
  const minuterie = useRef<ReturnType<typeof setInterval> | null>(null);

  const dette = historique.length ? historique[historique.length - 1] : depart.valeur;
  const annee = anneeDepart + historique.length;
  const fini = historique.length >= ANNEES_MAX;

  function avancer() {
    setHistorique((h) => {
      if (h.length >= ANNEES_MAX) return h;
      const avant = h.length ? h[h.length - 1] : depart.valeur;
      return [...h, ...cumulDette(avant, [deficit])];
    });
  }

  function lancer() {
    if (anime) return;
    const reduit = matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduit) {
      setHistorique((h) => {
        const avant = h.length ? h[h.length - 1] : depart.valeur;
        return [...h, ...cumulDette(avant, Array(ANNEES_MAX - h.length).fill(deficit))];
      });
      return;
    }
    setEnCours(true);
  }

  // L'animation s'arrête d'elle-même une fois les dix ans écoulés.
  const anime = enCours && !fini;

  useEffect(() => {
    if (!anime) return;
    minuterie.current = setInterval(avancer, PAS_MS);
    return () => {
      if (minuterie.current) clearInterval(minuterie.current);
    };
    // avancer lit `deficit` : on relance la minuterie si le curseur bouge.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [anime, deficit]);

  function recommencer() {
    setEnCours(false);
    setHistorique([]);
  }

  const niveau = Math.min(dette / MAX_DETTE, 1) * BAC.h;
  const ecoulement = Math.min(Math.abs(deficit) / 300, 1) * 14 + (deficit === 0 ? 0 : 2);
  const coule = deficit > 0;
  const vide = deficit < 0;
  const variationTotale = dette - depart.valeur;

  return (
    <div>
      <div className="grid items-center gap-6 md:grid-cols-[minmax(0,1fr)_16rem]">
        <svg viewBox="0 0 380 270" className="w-full max-w-md" role="img" aria-labelledby={`${curseurId}-desc`}>
          <desc id={`${curseurId}-desc`}>
            {`Baignoire : niveau de dette ${formatNombre(dette)} milliards d'euros en ${annee}, robinet réglé sur ${
              deficit >= 0 ? `un déficit de ${deficit}` : `un excédent de ${-deficit}`
            } milliards d'euros par an.`}
          </desc>
          {/* Robinet */}
          <path d="M20 22 h70 a8 8 0 0 1 8 8 v14 h-14 v-8 h-64 z" fill="var(--line-strong)" />
          {/* Filet d'eau (déficit) */}
          {coule && (
            <rect
              x={91 - ecoulement / 2}
              y={44}
              width={ecoulement}
              height={BAC.y + BAC.h - niveau - 44}
              fill="var(--series-1)"
              opacity={0.85}
              className="transition-all duration-500"
            />
          )}
          {/* Graduations */}
          {[2000, 4000, 6000].map((g) => {
            const y = BAC.y + BAC.h - (g / MAX_DETTE) * BAC.h;
            return (
              <g key={g}>
                <line x1={BAC.x + BAC.l} x2={BAC.x + BAC.l + 8} y1={y} y2={y} stroke="var(--line-strong)" />
                <text x={BAC.x + BAC.l + 12} y={y + 4} fontSize={11} fill="var(--muted)">
                  {formatNombre(g)} Md€
                </text>
              </g>
            );
          })}
          {/* Eau (dette) */}
          <rect
            x={BAC.x + 3}
            y={BAC.y + BAC.h - niveau}
            width={BAC.l - 6}
            height={niveau}
            fill="var(--series-1)"
            opacity={0.35}
            className="transition-all duration-500"
          />
          <line
            x1={BAC.x + 3}
            x2={BAC.x + BAC.l - 3}
            y1={BAC.y + BAC.h - niveau}
            y2={BAC.y + BAC.h - niveau}
            stroke="var(--series-1)"
            strokeWidth={2}
            className="transition-all duration-500"
          />
          {/* Bac */}
          <path
            d={`M${BAC.x} ${BAC.y} v${BAC.h - 14} a14 14 0 0 0 14 14 h${BAC.l - 28} a14 14 0 0 0 14 -14 v-${BAC.h - 14}`}
            fill="none"
            stroke="var(--ink)"
            strokeWidth={3}
            strokeLinecap="round"
          />
          {/* Bonde ouverte (excédent) */}
          {vide && (
            <rect x={BAC.x + BAC.l / 2 - 4} y={BAC.y + BAC.h} width={8} height={18} fill="var(--series-1)" opacity={0.8} />
          )}
          <text x={BAC.x + BAC.l / 2} y={BAC.y + BAC.h - niveau - 8} textAnchor="middle" fontSize={13} fontWeight={600} fill="var(--ink)">
            Dette : {formatNombre(dette)} Md€
          </text>
          <text x={20} y={14} fontSize={11} fill="var(--muted)">
            {deficit > 0 ? "Robinet = déficit de l'année" : deficit < 0 ? "Bonde = excédent de l'année" : "Robinet fermé : budget équilibré"}
          </text>
        </svg>

        <div className="space-y-4">
          <div>
            <BarreScenario scenario={s} />
            <div className="mt-3">
              <Curseur
                libelle={deficit >= 0 ? "Déficit chaque année" : "Excédent chaque année"}
                valeur={deficit}
                reference={s.reference.deficit}
                affichageReference={`déficit de ${formatNombre(s.reference.deficit)} Md€`}
                min={-100}
                max={300}
                pas={10}
                onChange={s.regler("deficit")}
                affichage={`${formatNombre(Math.abs(deficit))} Md€`}
              />
            </div>
            <div className="mt-1 flex justify-between text-xs text-muted">
              <span>excédent</span>
              <span>équilibre</span>
              <span>gros déficit</span>
            </div>
            <p className="mt-1 text-xs text-muted">
              Déficit réel {deficitReel.date} : {formatNombre(deficitReel.valeur, 1)} Md€ (arrondi à la dizaine sur le curseur)
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={avancer}
              disabled={fini || anime}
              className="rounded-full border border-accent px-4 py-1.5 text-sm font-medium text-accent hover:bg-accent-soft disabled:opacity-50"
            >
              + 1 an
            </button>
            <button
              type="button"
              onClick={lancer}
              disabled={fini || anime}
              className="rounded-full bg-accent px-4 py-1.5 text-sm font-medium text-surface hover:opacity-90 disabled:opacity-50"
            >
              {fini ? `${ANNEES_MAX} ans écoulés` : `Lancer ${ANNEES_MAX - historique.length} an${ANNEES_MAX - historique.length > 1 ? "s" : ""}`}
            </button>
            <button
              type="button"
              onClick={recommencer}
              disabled={historique.length === 0}
              className="rounded-full px-3 py-1.5 text-sm text-muted underline underline-offset-4 hover:text-ink disabled:opacity-50"
            >
              Recommencer
            </button>
          </div>

          <dl className="grid grid-cols-2 gap-3 text-sm" aria-live="polite">
            <div className="rounded-xl bg-subtle p-3">
              <dt className="text-muted">Fin d&apos;année</dt>
              <dd className="font-serif text-2xl font-semibold text-ink tabular-nums">{annee}</dd>
            </div>
            <div className="rounded-xl bg-subtle p-3">
              <dt className="text-muted">Depuis {anneeDepart}</dt>
              <dd className="font-serif text-2xl font-semibold text-ink tabular-nums">
                {variationTotale >= 0 ? "+" : "−"}
                {formatNombre(Math.abs(variationTotale))} Md€
              </dd>
            </div>
          </dl>
        </div>
      </div>
      <p className="mt-4 text-sm text-muted">
        Simplification : la baignoire ne compte que les déficits. En réalité, la dette bouge aussi pour d&apos;autres
        raisons (variations de trésorerie, prêts accordés…), voir « Pour aller plus loin ».
      </p>
    </div>
  );
}
