"use client";

import { useState } from "react";
import { CartesianGrid, Line, LineChart, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { AXE, GRILLE, Infobulle, Legende, nombreAxe, useLargeur, VueTableau } from "@/components/graphiques/commun";
import { formatNombre } from "@/lib/format";

export interface SerieCourbe {
  libelle: string;
  couleur: string;
  points: { x: string; y: number }[];
}

/**
 * Historique complet d'un indicateur, affiché à la demande sous sa carte.
 * Une ou deux séries (l'indicateur et, le cas échéant, sa comparaison),
 * en paliers pour les taux directeurs.
 */
export function CourbeIndicateur({
  titre,
  series,
  unite,
  decimales,
  paliers = false,
  libelles,
}: {
  titre: string;
  series: SerieCourbe[];
  unite: string;
  decimales: number;
  paliers?: boolean;
  /** Libellés lisibles des périodes, par abscisse. */
  libelles: Record<string, string>;
}) {
  const [ouvert, setOuvert] = useState(false);
  const [ref, largeur] = useLargeur<HTMLDivElement>();
  const etroit = largeur > 0 && largeur < 420;

  const abscisses = [...new Set(series.flatMap((s) => s.points.map((p) => p.x)))].sort();
  const donnees = abscisses.map((x) => {
    const ligne: Record<string, string | number | null> = { x };
    series.forEach((s, i) => (ligne[`s${i}`] = s.points.find((p) => p.x === x)?.y ?? null));
    return ligne;
  });
  const negatif = series.some((s) => s.points.some((p) => p.y < 0));
  const pas = Math.max(1, Math.round(abscisses.length / (etroit ? 4 : 7)));

  return (
    <div className="mt-3" data-export-ignore="true">
      <button
        type="button"
        aria-expanded={ouvert}
        onClick={() => setOuvert((o) => !o)}
        className="text-sm font-medium text-accent underline underline-offset-4"
      >
        {ouvert ? "Masquer l'historique" : "Voir l'historique"}
      </button>
      {ouvert && (
        <div className="mt-3">
          <div ref={ref} className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={donnees} margin={{ top: 8, right: 20, bottom: 0, left: 0 }}>
                <CartesianGrid {...GRILLE} />
                <XAxis dataKey="x" {...AXE} interval={pas - 1} tickFormatter={(x: string) => x.slice(0, 4)} minTickGap={8} />
                <YAxis {...AXE} width={40} tickFormatter={nombreAxe} />
                {negatif && <ReferenceLine y={0} stroke="var(--ink)" />}
                <Tooltip
                  cursor={{ stroke: "var(--line-strong)" }}
                  content={({ active, payload, label }) =>
                    active && payload?.length ? (
                      <Infobulle
                        titre={libelles[String(label)] ?? String(label)}
                        lignes={series
                          .map((s, i) => ({ s, v: payload[0].payload[`s${i}`] }))
                          .filter(({ v }) => v !== null)
                          .map(({ s, v }) => ({ libelle: s.libelle, couleur: s.couleur, valeur: `${formatNombre(Number(v), decimales)} ${unite}` }))}
                      />
                    ) : null
                  }
                />
                {series.map((s, i) => (
                  <Line
                    key={s.libelle}
                    dataKey={`s${i}`}
                    type={paliers ? "stepAfter" : "linear"}
                    stroke={s.couleur}
                    strokeWidth={2}
                    dot={false}
                    connectNulls
                    isAnimationActive={false}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
          {series.length > 1 && (
            <div className="mt-2">
              <Legende elements={series.map((s) => ({ libelle: s.libelle, couleur: s.couleur }))} />
            </div>
          )}
          <VueTableau
            legende={titre}
            colonnes={["Période", ...series.map((s) => `${s.libelle} (${unite})`)]}
            lignes={[...donnees].reverse().map((d) => [libelles[String(d.x)] ?? String(d.x), ...series.map((_, i) => (d[`s${i}`] === null ? "" : Number(d[`s${i}`])))])}
          />
        </div>
      )}
    </div>
  );
}
