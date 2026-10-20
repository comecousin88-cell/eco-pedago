"use client";

import { Bar, BarChart, CartesianGrid, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { getSerie } from "@/lib/data";
import { formatNombre } from "@/lib/format";
import { AXE, GRILLE, Infobulle, nombreAxe, useLargeur, VueTableau } from "./commun";

/** Solde public chaque année depuis 1978, en % du PIB (barres vers le bas = déficit). */
export function HistoriqueSolde() {
  const pib = getSerie("deficit.historique-pib");
  const md = getSerie("deficit.historique-md");
  const [ref, largeur] = useLargeur<HTMLDivElement>();
  const etroit = largeur > 0 && largeur < 520;
  const donnees = pib.serie.map((p, i) => ({ annee: p.x, pib: p.y, md: md.serie[i]?.y }));

  return (
    <div>
      <div ref={ref} className="h-64 w-full sm:h-72">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={donnees} margin={{ top: 8, right: 8, bottom: 0, left: 0 }} barCategoryGap={1}>
            <CartesianGrid {...GRILLE} />
            <XAxis dataKey="annee" {...AXE} interval={etroit ? 11 : 5} />
            <YAxis {...AXE} width={36} tickFormatter={nombreAxe} />
            <ReferenceLine y={0} stroke="var(--ink)" />
            <ReferenceLine
              y={-3}
              stroke="var(--muted)"
              strokeDasharray="4 4"
              label={{ value: "Repère de Maastricht : −3 %", position: "insideBottomLeft", fill: "var(--muted)", fontSize: 11 }}
            />
            <Tooltip
              cursor={{ fill: "var(--subtle)" }}
              content={({ active, payload, label }) =>
                active && payload?.length ? (
                  <Infobulle
                    titre={String(label)}
                    lignes={[
                      { libelle: "Solde public", valeur: `${formatNombre(Number(payload[0].payload.pib), 1)} % du PIB` },
                      { libelle: "Soit", valeur: `${formatNombre(Number(payload[0].payload.md), 1)} Md€` },
                    ]}
                  />
                ) : null
              }
            />
            <Bar dataKey="pib" fill="var(--accent)" radius={[0, 0, 3, 3]} isAnimationActive={false} />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <VueTableau
        legende="Solde public (négatif = déficit)"
        colonnes={["Année", "% du PIB", "Md€"]}
        lignes={[...donnees].reverse().map((d) => [d.annee, d.pib, d.md ?? ""])}
      />
    </div>
  );
}
