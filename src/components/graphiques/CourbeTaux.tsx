"use client";

import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { getSerie } from "@/lib/data";
import { formatNombre } from "@/lib/format";
import { AXE, GRILLE, Infobulle, VueTableau } from "./commun";

/** Courbe des taux : le taux d'intérêt selon la durée de l'emprunt. */
export function CourbeTaux() {
  const c = getSerie("marches.courbe-zone-euro");
  const donnees = c.serie.map((p) => ({ duree: p.x, taux: p.y }));
  return (
    <div>
      <div className="h-60 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={donnees} margin={{ top: 16, right: 16, bottom: 0, left: 0 }}>
            <CartesianGrid {...GRILLE} />
            <XAxis dataKey="duree" {...AXE} interval={0} fontSize={11} />
            <YAxis {...AXE} width={44} domain={[2, 4.5]} tickFormatter={(v) => `${v} %`} />
            <Tooltip
              content={({ active, payload, label }) =>
                active && payload?.length ? (
                  <Infobulle titre={`Emprunt à ${label}`} lignes={[{ libelle: "Taux", valeur: `${formatNombre(Number(payload[0].value), 2)} %` }]} />
                ) : null
              }
            />
            <Line
              type="monotone"
              dataKey="taux"
              stroke="var(--accent)"
              strokeWidth={2}
              dot={{ r: 4, fill: "var(--accent)", stroke: "var(--surface)", strokeWidth: 2 }}
              label={{ position: "top", fontSize: 11, fill: "var(--muted)", formatter: (v: unknown) => formatNombre(Number(v), 2) }}
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <VueTableau legende={c.label} colonnes={["Durée", "Taux (%)"]} lignes={donnees.map((d) => [d.duree, Math.round(d.taux * 100) / 100])} />
    </div>
  );
}
