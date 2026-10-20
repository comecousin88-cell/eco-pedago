"use client";

import { useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Line,
  LineChart,
  ReferenceDot,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { getSerie } from "@/lib/data";
import { formatNombre } from "@/lib/format";
import { AXE, GRILLE, Infobulle, Legende, useLargeur, VueTableau } from "./commun";

const PAYS = [
  { id: "marches.taux10-france", nom: "France", couleur: "var(--series-1)" },
  { id: "marches.taux10-allemagne", nom: "Allemagne", couleur: "var(--series-2)" },
  { id: "marches.taux10-italie", nom: "Italie", couleur: "var(--series-3)" },
  { id: "marches.taux10-espagne", nom: "Espagne", couleur: "var(--series-4)" },
] as const;

export interface Repere {
  mois: string;
  libelle: string;
}

/** Taux à 10 ans de quatre pays depuis 2000, ou l'écart France − Allemagne. */
export function Taux10Ans({ reperes = [] }: { reperes?: Repere[] }) {
  const [vue, setVue] = useState<"taux" | "ecart">("taux");
  const [ref, largeur] = useLargeur<HTMLDivElement>();
  const etroit = largeur > 0 && largeur < 520;

  // Séries appariées par mois (et non par position).
  const parMois = (id: string) => new Map(getSerie(id).serie.map((p) => [p.x, p.y]));
  const [fr, de, it, es, ecart] = [...PAYS.map((p) => parMois(p.id)), parMois("marches.spread-france-allemagne")];
  const donnees = [...fr.keys()].map((mois) => ({
    mois,
    France: fr.get(mois),
    Allemagne: de.get(mois),
    Italie: it.get(mois),
    Espagne: es.get(mois),
    ecart: ecart.get(mois),
  }));
  const annee = (m: string) => m.slice(0, 4);
  const ticks = donnees.filter((d) => d.mois.endsWith("-01") && Number(annee(d.mois)) % (etroit ? 10 : 5) === 0).map((d) => d.mois);

  return (
    <div>
      <div role="group" aria-label="Choix du graphique" className="mb-3 inline-flex rounded-full border border-line p-0.5 text-sm">
        {(
          [
            ["taux", "Taux à 10 ans"],
            ["ecart", "Écart France − Allemagne"],
          ] as const
        ).map(([v, l]) => (
          <button
            key={v}
            type="button"
            aria-pressed={vue === v}
            onClick={() => setVue(v)}
            className={`rounded-full px-3 py-1 ${vue === v ? "bg-ink text-page" : "text-muted hover:text-ink"}`}
          >
            {l}
          </button>
        ))}
      </div>
      {vue === "taux" && <Legende elements={PAYS.map((p) => ({ libelle: p.nom, couleur: p.couleur }))} />}

      <div ref={ref} className="mt-2 h-72 w-full sm:h-80">
        <ResponsiveContainer width="100%" height="100%">
          {vue === "taux" ? (
            <LineChart data={donnees} margin={{ top: 8, right: 12, bottom: 0, left: 0 }}>
              <CartesianGrid {...GRILLE} />
              <XAxis dataKey="mois" {...AXE} ticks={ticks} tickFormatter={annee} />
              <YAxis {...AXE} width={36} tickFormatter={(v) => `${v} %`} />
              <Tooltip
                content={({ active, payload, label }) =>
                  active && payload?.length ? (
                    <Infobulle
                      titre={String(label)}
                      lignes={PAYS.map((p) => ({
                        libelle: p.nom,
                        couleur: p.couleur,
                        valeur: `${formatNombre(Number(payload[0].payload[p.nom]), 2)} %`,
                      }))}
                    />
                  ) : null
                }
              />
              {PAYS.map((p) => (
                <Line key={p.nom} type="monotone" dataKey={p.nom} stroke={p.couleur} strokeWidth={p.nom === "France" ? 2.5 : 1.5} dot={false} isAnimationActive={false} />
              ))}
            </LineChart>
          ) : (
            <AreaChart data={donnees} margin={{ top: 28, right: 12, bottom: 0, left: 0 }}>
              <CartesianGrid {...GRILLE} />
              <XAxis dataKey="mois" {...AXE} ticks={ticks} tickFormatter={annee} />
              <YAxis {...AXE} width={36} />
              <Tooltip
                content={({ active, payload, label }) =>
                  active && payload?.length ? (
                    <Infobulle
                      titre={String(label)}
                      lignes={[{ libelle: "Écart", valeur: `${formatNombre(Number(payload[0].payload.ecart))} points de base` }]}
                    />
                  ) : null
                }
              />
              <Area type="monotone" dataKey="ecart" stroke="var(--accent)" strokeWidth={2} fill="var(--accent)" fillOpacity={0.12} isAnimationActive={false} />
              {reperes.map((r) => {
                const d = donnees.find((x) => x.mois === r.mois);
                return d ? (
                  <ReferenceDot
                    key={r.mois}
                    x={r.mois}
                    y={d.ecart}
                    r={4}
                    fill="var(--surface)"
                    stroke="var(--ink)"
                    strokeWidth={2}
                    label={{ value: etroit ? annee(r.mois) : r.libelle, position: "top", fill: "var(--ink)", fontSize: 11, fontWeight: 600 }}
                  />
                ) : null;
              })}
            </AreaChart>
          )}
        </ResponsiveContainer>
      </div>
      {vue === "ecart" && (
        <p className="mt-1 text-xs text-muted">
          En points de base : 100 points de base = 1 point de pourcentage.
          {etroit && reperes.map((r) => ` ${annee(r.mois)} : ${r.libelle}.`).join("")}
        </p>
      )}
      <VueTableau
        legende="Taux à 10 ans (moyennes mensuelles) et écart France − Allemagne"
        colonnes={["Mois", ...PAYS.map((p) => p.nom), "Écart FR−DE (pb)"]}
        lignes={[...donnees].reverse().filter((d) => d.mois.endsWith("-01") || d === donnees[donnees.length - 1]).map((d) => [d.mois, d.France ?? "", d.Allemagne ?? "", d.Italie ?? "", d.Espagne ?? "", d.ecart ?? ""])}
      />
    </div>
  );
}
