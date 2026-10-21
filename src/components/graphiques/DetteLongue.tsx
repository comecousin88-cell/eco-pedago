"use client";

import { useState } from "react";
import { CartesianGrid, Line, LineChart, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { getSerie } from "@/lib/data";
import { formatNombre } from "@/lib/format";
import { AXE, GRILLE, Infobulle, Legende, nombreAxe, useLargeur, VueTableau } from "./commun";

/** Pays disponibles, dans l'ordre fixe des couleurs de la palette (jamais réattribuées). */
const PAYS = [
  { code: "fra", nom: "France", couleur: "var(--series-1)" },
  { code: "gbr", nom: "Royaume-Uni", couleur: "var(--series-2)" },
  { code: "usa", nom: "États-Unis", couleur: "var(--series-3)" },
  { code: "deu", nom: "Allemagne", couleur: "var(--series-4)" },
  { code: "jpn", nom: "Japon", couleur: "var(--series-5)" },
  { code: "ita", nom: "Italie", couleur: "var(--series-6)" },
  { code: "grc", nom: "Grèce", couleur: "var(--series-7)" },
  { code: "arg", nom: "Argentine", couleur: "var(--series-8)" },
] as const;

type Code = (typeof PAYS)[number]["code"];

/**
 * Dette publique en % du PIB depuis 1880 pour quelques pays (FMI, séries
 * longues). On choisit les pays affichés ; les guerres et les années sans
 * donnée laissent des trous dans les courbes.
 */
export function DetteLongue({ initiaux = ["fra", "gbr", "usa"] }: { initiaux?: Code[] }) {
  const [choisis, setChoisis] = useState<Code[]>(initiaux);
  const [ref, largeur] = useLargeur<HTMLDivElement>();
  const etroit = largeur > 0 && largeur < 520;

  const series = Object.fromEntries(PAYS.map((p) => [p.code, getSerie(`histo.dette-${p.code}`).serie])) as Record<Code, { x: string; y: number }[]>;
  const annees: string[] = [];
  for (let a = 1880; a <= 2024; a++) annees.push(String(a));
  const donnees = annees.map((annee) => {
    const ligne: Record<string, string | number | null> = { annee };
    for (const p of PAYS) ligne[p.code] = series[p.code].find((x) => x.x === annee)?.y ?? null;
    return ligne;
  });
  const visibles = PAYS.filter((p) => choisis.includes(p.code));

  const basculer = (c: Code) =>
    setChoisis((l) => (l.includes(c) ? (l.length > 1 ? l.filter((x) => x !== c) : l) : [...l, c]));

  return (
    <div>
      <div role="group" aria-label="Pays affichés" className="mb-3 flex flex-wrap gap-2">
        {PAYS.map((p) => {
          const actif = choisis.includes(p.code);
          return (
            <button
              key={p.code}
              type="button"
              aria-pressed={actif}
              onClick={() => basculer(p.code)}
              className={`flex items-center gap-1.5 rounded-full border px-3 py-1 text-sm ${
                actif ? "border-ink text-ink" : "border-line text-muted hover:text-ink"
              }`}
            >
              <span aria-hidden="true" className="h-2.5 w-2.5 rounded-sm" style={{ background: actif ? p.couleur : "var(--line-strong)" }} />
              {p.nom}
            </button>
          );
        })}
      </div>

      <div ref={ref} className="h-72 w-full sm:h-80">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={donnees} margin={{ top: 8, right: 12, bottom: 0, left: 0 }}>
            <CartesianGrid {...GRILLE} />
            <XAxis dataKey="annee" {...AXE} interval={etroit ? 39 : 19} minTickGap={8} />
            <YAxis {...AXE} width={44} tickFormatter={nombreAxe} />
            <ReferenceLine y={100} stroke="var(--muted)" strokeDasharray="4 4" />
            <Tooltip
              cursor={{ stroke: "var(--line-strong)" }}
              content={({ active, payload, label }) =>
                active && payload?.length ? (
                  <Infobulle
                    titre={String(label)}
                    lignes={visibles
                      .filter((p) => payload[0].payload[p.code] !== null)
                      .map((p) => ({ libelle: p.nom, couleur: p.couleur, valeur: `${formatNombre(Number(payload[0].payload[p.code]), 0)} % du PIB` }))}
                  />
                ) : null
              }
            />
            {visibles.map((p) => (
              <Line key={p.code} dataKey={p.code} stroke={p.couleur} strokeWidth={2} dot={false} connectNulls={false} isAnimationActive={false} />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-2">
        <Legende elements={visibles.map((p) => ({ libelle: p.nom, couleur: p.couleur }))} />
      </div>
      <VueTableau
        legende="Dette publique brute en % du PIB (FMI, séries longues)"
        colonnes={["Année", ...visibles.map((p) => p.nom)]}
        lignes={[...donnees]
          .reverse()
          .filter((d) => visibles.some((p) => d[p.code] !== null))
          .map((d) => [String(d.annee), ...visibles.map((p) => (d[p.code] === null ? "" : Number(d[p.code])))])}
      />
    </div>
  );
}
