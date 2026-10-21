"use client";

import { useState } from "react";
import { CartesianGrid, Line, LineChart, ReferenceDot, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { AXE, GRILLE, Infobulle } from "@/components/graphiques/commun";
import { fluxObligation, prixObligation } from "@/lib/economics";
import { formatEuros, formatNombre } from "@/lib/format";
import { BoutonSimu, Curseur } from "./Curseur";
import { BarreScenario, useScenario } from "./Scenario";

/**
 * Prix d'une obligation selon le taux du marché : le coupon est fixé à
 * l'émission, c'est le prix qui s'ajuste quand les taux bougent.
 */
export function PrixTaux() {
  const s = useScenario({ coupon: 2, maturite: 10, marche: 3 });
  const coupon = s.valeurs.coupon;
  const maturite = s.valeurs.maturite;
  const marche = s.valeurs.marche;
  const [voirFlux, setVoirFlux] = useState(false);

  const obligation = { nominal: 100, coupon: coupon / 100, maturite };
  const prix = prixObligation(obligation, marche / 100);
  const ecart = prix - 100;
  const courbe = Array.from({ length: 33 }, (_, k) => {
    const t = k * 0.25;
    return { taux: t, prix: Math.round(prixObligation(obligation, t / 100) * 100) / 100 };
  });
  const flux = fluxObligation(obligation);
  const maxFlux = Math.max(...flux.map((f) => f.total));

  return (
    <div className="space-y-6">
      <BarreScenario scenario={s} libelleReference="valeurs de départ" />
      <div className="grid gap-5 sm:grid-cols-3">
        <Curseur libelle="Coupon (fixé à l'émission)" valeur={coupon}
          reference={s.reference.coupon} min={0} max={6} pas={0.25} onChange={s.regler("coupon")} affichage={`${formatNombre(coupon, 2)} %`} />
        <Curseur libelle="Années restant à courir" valeur={maturite}
          reference={s.reference.maturite} min={1} max={30} pas={1} onChange={s.regler("maturite")} affichage={`${maturite} an${maturite > 1 ? "s" : ""}`} />
        <Curseur libelle="Taux du marché aujourd'hui" valeur={marche}
          reference={s.reference.marche} min={0} max={8} pas={0.25} onChange={s.regler("marche")} affichage={`${formatNombre(marche, 2)} %`} />
      </div>

      <div className="rounded-xl bg-accent-soft p-4" aria-live="polite">
        <p className="text-sm text-muted">Prix de l&apos;obligation (pour 100 € remboursés)</p>
        <p className="font-serif text-4xl font-semibold text-ink tabular-nums">{formatEuros(prix)}</p>
        <p className="mt-1 text-sm text-body">
          {Math.abs(ecart) < 0.005
            ? "Le taux du marché égale le coupon : l'obligation vaut exactement son prix de remboursement."
            : ecart < 0
              ? `Le marché offre plus que le coupon : pour que l'obligation reste intéressante, son prix baisse de ${formatEuros(-ecart)}.`
              : `Le marché offre moins que le coupon : cette obligation devient recherchée, son prix monte de ${formatEuros(ecart)}.`}
        </p>
      </div>

      <div>
        <p className="text-sm font-semibold text-ink">Prix de cette obligation selon le taux du marché</p>
        <div className="mt-2 h-60 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={courbe} margin={{ top: 10, right: 12, bottom: 18, left: 0 }}>
              <CartesianGrid {...GRILLE} />
              <XAxis
                dataKey="taux"
                type="number"
                domain={[0, 8]}
                ticks={[0, 2, 4, 6, 8]}
                {...AXE}
                tickFormatter={(v) => `${v} %`}
                label={{ value: "taux du marché", position: "insideBottom", offset: -12, fill: "var(--muted)", fontSize: 12 }}
              />
              <YAxis {...AXE} width={40} domain={["auto", "auto"]} tickFormatter={(v) => `${Math.round(v)}`} />
              <ReferenceLine y={100} stroke="var(--muted)" strokeDasharray="4 4" />
              <Tooltip
                content={({ active, payload }) =>
                  active && payload?.length ? (
                    <Infobulle
                      titre={`Taux du marché : ${formatNombre(Number(payload[0].payload.taux), 2)} %`}
                      lignes={[{ libelle: "Prix", valeur: formatEuros(Number(payload[0].payload.prix)) }]}
                    />
                  ) : null
                }
              />
              <Line type="monotone" dataKey="prix" stroke="var(--accent)" strokeWidth={2} dot={false} isAnimationActive={false} />
              <ReferenceDot x={marche} y={Math.round(prix * 100) / 100} r={6} fill="var(--accent)" stroke="var(--surface)" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <p className="text-xs text-muted">
          La courbe descend toujours : quand les taux montent, le prix baisse. Elle est d&apos;autant plus pentue que
          l&apos;obligation est longue.
        </p>
      </div>

      <div>
        <BoutonSimu onClick={() => setVoirFlux((v) => !v)} actif={voirFlux}>
          {voirFlux ? "Masquer les flux" : "Voir ce que reçoit le détenteur, année par année"}
        </BoutonSimu>
        {voirFlux && (
          <ul className="mt-3 space-y-1 text-sm">
            {flux.map((f) => (
              <li key={f.annee} className="grid grid-cols-[4.5rem_minmax(0,1fr)_5.5rem] items-center gap-2">
                <span className="text-muted">Année {f.annee}</span>
                <span className="flex h-3 overflow-hidden rounded-full bg-subtle" aria-hidden="true">
                  <span className="h-full bg-accent" style={{ width: `${(f.coupon / maxFlux) * 100}%` }} />
                  <span className="h-full bg-[var(--series-2)]" style={{ width: `${(f.remboursement / maxFlux) * 100}%` }} />
                </span>
                <span className="text-right tabular-nums">{formatEuros(f.total)}</span>
              </li>
            ))}
            <li className="pt-1 text-xs text-muted">
              En couleur du module : le coupon ; en orange : le remboursement des 100 € à l&apos;échéance (« in fine »).
            </li>
          </ul>
        )}
      </div>
    </div>
  );
}
