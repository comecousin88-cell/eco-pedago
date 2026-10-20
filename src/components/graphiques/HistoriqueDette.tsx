"use client";

import { useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ReferenceDot,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { getSerie } from "@/lib/data";
import { formatNombre } from "@/lib/format";
import { AXE, GRILLE, Infobulle, nombreAxe, useLargeur, VueTableau } from "./commun";

export interface Choc {
  annee: string;
  libelle: string;
}

type Vue = "pib" | "md";

/** Dette publique depuis 1978, en % du PIB ou en milliards d'euros, avec les grands chocs annotés. */
export function HistoriqueDette({ chocs = [] }: { chocs?: Choc[] }) {
  const pib = getSerie("dette.historique-pib");
  const md = getSerie("dette.historique-md");
  const [vue, setVue] = useState<Vue>("pib");
  const [ref, largeur] = useLargeur<HTMLDivElement>();
  const etroit = largeur > 0 && largeur < 520;

  const donnees = pib.serie.map((p, i) => ({ annee: p.x, pib: p.y, md: md.serie[i]?.y }));
  const cle = vue;
  const unite = vue === "pib" ? "% du PIB" : "Md€";
  const valeurDe = (annee: string) => donnees.find((d) => d.annee === annee)?.[cle];

  return (
    <div>
      <div role="group" aria-label="Unité du graphique" className="mb-3 inline-flex rounded-full border border-line p-0.5 text-sm">
        {(
          [
            ["pib", "En % du PIB"],
            ["md", "En milliards d'euros"],
          ] as const
        ).map(([v, libelle]) => (
          <button
            key={v}
            type="button"
            aria-pressed={vue === v}
            onClick={() => setVue(v)}
            className={`rounded-full px-3 py-1 ${vue === v ? "bg-ink text-page" : "text-muted hover:text-ink"}`}
          >
            {libelle}
          </button>
        ))}
      </div>

      <div ref={ref} className="h-72 w-full sm:h-80">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={donnees} margin={{ top: 28, right: 12, bottom: 0, left: 0 }}>
            <CartesianGrid {...GRILLE} />
            <XAxis dataKey="annee" {...AXE} interval={etroit ? 11 : 5} minTickGap={8} />
            <YAxis {...AXE} width={44} tickFormatter={nombreAxe} />
            {vue === "pib" && (
              <ReferenceLine
                y={60}
                stroke="var(--muted)"
                strokeDasharray="4 4"
                label={{ value: etroit ? "Maastricht : 60 %" : "Repère de Maastricht : 60 %", position: "insideBottomRight", fill: "var(--muted)", fontSize: 11 }}
              />
            )}
            <Tooltip
              cursor={{ stroke: "var(--line-strong)" }}
              content={({ active, payload, label }) =>
                active && payload?.length ? (
                  <Infobulle
                    titre={`Fin ${label}`}
                    lignes={[
                      { libelle: "Dette", valeur: `${formatNombre(Number(payload[0].payload.md), 1)} Md€` },
                      { libelle: "Soit", valeur: `${formatNombre(Number(payload[0].payload.pib), 1)} % du PIB` },
                    ]}
                  />
                ) : null
              }
            />
            <Area
              type="monotone"
              dataKey={cle}
              stroke="var(--accent)"
              strokeWidth={2}
              fill="var(--accent)"
              fillOpacity={0.12}
              isAnimationActive={false}
            />
            {chocs.map((c) => {
              const y = valeurDe(c.annee);
              return y === undefined ? null : (
                <ReferenceDot
                  key={c.annee}
                  x={c.annee}
                  y={y}
                  r={4}
                  fill="var(--surface)"
                  stroke="var(--ink)"
                  strokeWidth={2}
                  label={{
                    value: etroit ? c.annee : `${c.annee} : ${c.libelle}`,
                    position: "top",
                    fill: "var(--ink)",
                    fontSize: 11,
                    fontWeight: 600,
                  }}
                />
              );
            })}
          </AreaChart>
        </ResponsiveContainer>
      </div>
      {etroit && chocs.length > 0 && (
        <ul className="mt-2 space-y-0.5 text-xs text-muted">
          {chocs.map((c) => (
            <li key={c.annee}>
              <strong className="text-body">{c.annee}</strong> : {c.libelle}
            </li>
          ))}
        </ul>
      )}
      <VueTableau
        legende={`Dette publique au 31 décembre, en ${unite}`}
        colonnes={["Année", "Md€", "% du PIB"]}
        lignes={[...donnees].reverse().map((d) => [d.annee, d.md ?? "", d.pib])}
      />
    </div>
  );
}
