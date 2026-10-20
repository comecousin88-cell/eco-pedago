"use client";

import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { getSerie } from "@/lib/data";
import { formatNombre } from "@/lib/format";
import { AXE, GRILLE, Infobulle, Legende, VueTableau } from "./commun";

/** Trois petits graphiques sur la crise grecque : taux à 10 ans, PIB, chômage. */
export function GreceChiffres() {
  const gr = new Map(getSerie("grece.taux10").serie.map((p) => [p.x, p.y]));
  const fr = new Map(getSerie("marches.taux10-france").serie.map((p) => [p.x, p.y]));
  const taux = [...gr.keys()].map((m) => ({ x: m, grece: gr.get(m), france: fr.get(m) }));
  const pib = getSerie("grece.pib-indice").serie.map((p) => ({ x: p.x, v: p.y }));
  const chomage = getSerie("grece.chomage").serie.map((p) => ({ x: p.x, v: p.y }));
  const ticksMois = taux.filter((d) => d.x.endsWith("-01") && Number(d.x.slice(0, 4)) % 4 === 0).map((d) => d.x);

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-semibold text-ink">Taux d&apos;emprunt à 10 ans</p>
        <Legende
          elements={[
            { libelle: "Grèce", couleur: "var(--series-1)" },
            { libelle: "France", couleur: "var(--series-2)" },
          ]}
        />
        <div className="mt-2 h-56 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={taux} margin={{ top: 8, right: 12, bottom: 0, left: 0 }}>
              <CartesianGrid {...GRILLE} />
              <XAxis dataKey="x" {...AXE} ticks={ticksMois} tickFormatter={(v) => String(v).slice(0, 4)} />
              <YAxis {...AXE} width={40} tickFormatter={(v) => `${v} %`} />
              <Tooltip
                content={({ active, payload, label }) =>
                  active && payload?.length ? (
                    <Infobulle
                      titre={String(label)}
                      lignes={[
                        { libelle: "Grèce", couleur: "var(--series-1)", valeur: `${formatNombre(Number(payload[0].payload.grece), 2)} %` },
                        { libelle: "France", couleur: "var(--series-2)", valeur: `${formatNombre(Number(payload[0].payload.france), 2)} %` },
                      ]}
                    />
                  ) : null
                }
              />
              <Line type="monotone" dataKey="grece" stroke="var(--series-1)" strokeWidth={2} dot={false} isAnimationActive={false} />
              <Line type="monotone" dataKey="france" stroke="var(--series-2)" strokeWidth={2} dot={false} isAnimationActive={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        {[
          { titre: "PIB en volume (100 = 2008)", data: pib, suffixe: "", couleur: "var(--series-1)" },
          { titre: "Taux de chômage", data: chomage, suffixe: " %", couleur: "var(--series-1)" },
        ].map((g) => (
          <div key={g.titre}>
            <p className="text-sm font-semibold text-ink">{g.titre}</p>
            <div className="mt-2 h-44 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={g.data} margin={{ top: 8, right: 12, bottom: 0, left: 0 }}>
                  <CartesianGrid {...GRILLE} />
                  <XAxis dataKey="x" {...AXE} interval={5} />
                  <YAxis {...AXE} width={36} domain={["auto", "auto"]} />
                  <Tooltip
                    content={({ active, payload, label }) =>
                      active && payload?.length ? (
                        <Infobulle titre={String(label)} lignes={[{ libelle: g.titre, valeur: `${formatNombre(Number(payload[0].value), 1)}${g.suffixe}` }]} />
                      ) : null
                    }
                  />
                  <Line type="monotone" dataKey="v" stroke={g.couleur} strokeWidth={2} dot={false} isAnimationActive={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        ))}
      </div>
      <VueTableau
        legende="Grèce : PIB (indice 100 = 2008) et taux de chômage"
        colonnes={["Année", "PIB (100 = 2008)", "Chômage (%)"]}
        lignes={pib.map((p) => [p.x, p.v, chomage.find((c) => c.x === p.x)?.v ?? ""])}
      />
    </div>
  );
}
