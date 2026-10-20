"use client";

import { CartesianGrid, Line, LineChart, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { getSerie } from "@/lib/data";
import { formatNombre } from "@/lib/format";
import { AXE, GRILLE, Infobulle, useLargeur, VueTableau } from "./commun";

/** Taux de la facilité de dépôt de la BCE, mois par mois, à partir des dates de décision. */
export function TauxBCE() {
  const d = getSerie("bce.taux-depot");
  const [ref, largeur] = useLargeur<HTMLDivElement>();
  const etroit = largeur > 0 && largeur < 520;

  // Les décisions tombent à des dates irrégulières : on reconstitue un taux par mois.
  const decisions = d.serie.map((p) => ({ mois: p.x.slice(0, 7), taux: p.y }));
  const debut = decisions[0].mois;
  // Fin de la série : le mois de consultation de la source (et non la date du jour, pour un rendu identique partout).
  const fin = (d.consulte_le ?? d.date).slice(0, 7);
  const mois: { mois: string; taux: number }[] = [];
  let [a, m] = debut.split("-").map(Number);
  let courant = decisions[0].taux;
  while (`${a}-${String(m).padStart(2, "0")}` <= fin) {
    const cle = `${a}-${String(m).padStart(2, "0")}`;
    for (const dec of decisions) if (dec.mois === cle) courant = dec.taux;
    mois.push({ mois: cle, taux: courant });
    m += 1;
    if (m > 12) {
      m = 1;
      a += 1;
    }
  }
  const ticks = mois.filter((x) => x.mois.endsWith("-01") && Number(x.mois.slice(0, 4)) % (etroit ? 4 : 2) === 0).map((x) => x.mois);

  return (
    <div>
      <div ref={ref} className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={mois} margin={{ top: 8, right: 12, bottom: 0, left: 0 }}>
            <CartesianGrid {...GRILLE} />
            <XAxis dataKey="mois" {...AXE} ticks={ticks} tickFormatter={(v) => String(v).slice(0, 4)} />
            <YAxis {...AXE} width={40} tickFormatter={(v) => `${v} %`} />
            <ReferenceLine y={0} stroke="var(--ink)" />
            <Tooltip
              content={({ active, payload, label }) =>
                active && payload?.length ? (
                  <Infobulle titre={String(label)} lignes={[{ libelle: "Taux de dépôt", valeur: `${formatNombre(Number(payload[0].value), 2)} %` }]} />
                ) : null
              }
            />
            <Line type="stepAfter" dataKey="taux" stroke="var(--accent)" strokeWidth={2.5} dot={false} isAnimationActive={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <VueTableau
        legende="Décisions sur le taux de dépôt de la BCE"
        colonnes={["Entrée en vigueur", "Taux de dépôt (%)"]}
        lignes={[...d.serie].reverse().map((p) => [p.x, p.y])}
      />
    </div>
  );
}
