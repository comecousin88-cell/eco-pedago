"use client";

import { useState } from "react";
import { CartesianGrid, Line, LineChart, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { AXE, GRILLE, Infobulle, Legende } from "@/components/graphiques/commun";
import { getValeur } from "@/lib/data";
import { effetsAnnulation } from "@/lib/economics";
import { formatNombre } from "@/lib/format";
import { Curseur } from "./Curseur";

/**
 * Ce que changerait l'annulation des titres détenus par la Banque de France,
 * pour l'État, pour la Banque de France et pour l'ensemble des deux, sur 10 ans.
 */
const ANNEES = 10;

export function AnnulationDette() {
  const titres = getValeur("bdf.titres-politique-monetaire");
  const tauxDepot = getValeur("bce.taux-depot-actuel");
  const emprunts = getValeur("aft.programme-emissions");
  const dette = getValeur("dette.stock");
  const ratio = getValeur("dette.ratio-pib");
  const pib = (dette.valeur / ratio.valeur) * 100;

  const [montant, setMontant] = useState(titres.valeur);
  const [coupon, setCoupon] = useState(1);
  const [prime, setPrime] = useState(0.5);

  const r = effetsAnnulation({
    montant,
    coupon: coupon / 100,
    tauxDepot: tauxDepot.valeur / 100,
    prime: prime / 100,
    empruntsAnnuels: emprunts.valeur,
    annees: ANNEES,
  });
  const donnees = r.map((x) => ({
    annee: x.annee,
    etat: Math.round(x.interetsEconomises * 10) / 10,
    bdf: -Math.round(x.perteBanqueCentrale * 10) / 10,
    marche: -Math.round(x.surcoutMarche * 10) / 10,
    net: Math.round(x.netConsolide * 10) / 10,
  }));
  const cumulNet = r.reduce((s, x) => s + x.netConsolide, 0);

  return (
    <div className="space-y-5">
      <div className="grid gap-5 sm:grid-cols-3">
        <Curseur
          libelle="Titres annulés"
          valeur={montant}
          min={0}
          max={600}
          pas={10}
          onChange={setMontant}
          affichage={`${formatNombre(montant)} Md€`}
          aide={`Détenus par la Banque de France au ${titres.date.split("-").reverse().join("/")} : ${formatNombre(titres.valeur)} Md€`}
        />
        <Curseur
          libelle="Coupon moyen de ces titres (hypothèse)"
          valeur={coupon}
          min={0}
          max={3}
          pas={0.25}
          onChange={setCoupon}
          affichage={`${formatNombre(coupon, 2)} %`}
          aide="Titres achetés surtout entre 2015 et 2021, quand les taux étaient bas."
        />
        <Curseur
          libelle="Prime de risque exigée ensuite par les marchés"
          valeur={prime}
          min={0}
          max={2}
          pas={0.1}
          onChange={setPrime}
          affichage={`${formatNombre(prime * 100)} points de base`}
          aide="0 = les marchés ne réagissent pas. Hypothèse à faire varier."
        />
      </div>

      <dl className="grid gap-3 sm:grid-cols-3" aria-live="polite">
        <div className="rounded-xl bg-ok-soft p-3">
          <dt className="text-sm text-muted">Ce que l&apos;État ne paie plus, chaque année</dt>
          <dd className="font-serif text-2xl font-semibold text-ok">+{formatNombre(montant * coupon / 100, 1)} Md€</dd>
          <dd className="text-sm text-muted">intérêts qui allaient à la Banque de France</dd>
        </div>
        <div className="rounded-xl bg-bad-soft p-3">
          <dt className="text-sm text-muted">Ce que la Banque de France perd</dt>
          <dd className="font-serif text-2xl font-semibold text-bad">−{formatNombre(montant)} Md€ de fonds propres</dd>
          <dd className="text-sm text-muted">
            puis −{formatNombre(montant * coupon / 100, 1)} Md€ par an : les réserves restent à rémunérer à{" "}
            {formatNombre(tauxDepot.valeur, 2)} %
          </dd>
        </div>
        <div className={`rounded-xl p-3 ${cumulNet < 0 ? "bg-bad-soft" : "bg-subtle"}`}>
          <dt className="text-sm text-muted">Effet net État + Banque de France, sur {ANNEES} ans</dt>
          <dd className={`font-serif text-2xl font-semibold ${cumulNet < 0 ? "text-bad" : "text-ink"}`}>
            {cumulNet > 0 ? "+" : cumulNet < 0 ? "−" : ""}
            {formatNombre(Math.abs(cumulNet))} Md€
          </dd>
          <dd className="text-sm text-muted">
            {prime === 0 ? "les gains et les pertes s'annulent exactement" : "la prime de risque l'emporte"}
          </dd>
        </div>
      </dl>

      <Legende
        elements={[
          { libelle: "Gain de l'État", couleur: "var(--series-3)" },
          { libelle: "Perte de la Banque de France", couleur: "var(--series-2)" },
          { libelle: "Surcoût sur les emprunts de marché", couleur: "var(--series-8)" },
          { libelle: "Effet net", couleur: "var(--ink)" },
        ]}
      />
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={donnees} margin={{ top: 8, right: 12, bottom: 0, left: 0 }}>
            <CartesianGrid {...GRILLE} />
            <XAxis dataKey="annee" {...AXE} tickFormatter={(v) => `an ${v}`} />
            <YAxis {...AXE} width={44} />
            <ReferenceLine y={0} stroke="var(--ink)" />
            <Tooltip
              content={({ active, payload, label }) =>
                active && payload?.length ? (
                  <Infobulle
                    titre={`Année ${label} (Md€)`}
                    lignes={[
                      { libelle: "Gain de l'État", couleur: "var(--series-3)", valeur: formatNombre(Number(payload[0].payload.etat), 1) },
                      { libelle: "Perte Banque de France", couleur: "var(--series-2)", valeur: formatNombre(Number(payload[0].payload.bdf), 1) },
                      { libelle: "Surcoût de marché", couleur: "var(--series-8)", valeur: formatNombre(Number(payload[0].payload.marche), 1) },
                      { libelle: "Effet net", couleur: "var(--ink)", valeur: formatNombre(Number(payload[0].payload.net), 1) },
                    ]}
                  />
                ) : null
              }
            />
            <Line dataKey="etat" stroke="var(--series-3)" strokeWidth={2} dot={false} isAnimationActive={false} />
            <Line dataKey="bdf" stroke="var(--series-2)" strokeWidth={2} dot={false} isAnimationActive={false} />
            <Line dataKey="marche" stroke="var(--series-8)" strokeWidth={2} dot={false} isAnimationActive={false} />
            <Line dataKey="net" stroke="var(--ink)" strokeWidth={2.5} strokeDasharray="5 3" dot={false} isAnimationActive={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <p className="rounded-xl bg-subtle p-3 text-sm text-body">
        Ce qui change vraiment : la dette publique <em>affichée</em> baisserait d&apos;environ{" "}
        <strong className="text-ink">{formatNombre((montant / pib) * 100, 1)} points de PIB</strong>. Mais l&apos;ensemble formé par
        l&apos;État et sa banque centrale ne serait pas plus riche : la dette de l&apos;État envers la Banque de France est
        remplacée par un trou dans les comptes de la Banque de France.
      </p>
      <p className="text-xs text-muted">
        Calcul simplifié : on suppose que les bénéfices de la Banque de France reviennent à l&apos;État (impôt et
        dividende) et que la prime de risque s&apos;applique aux {formatNombre(emprunts.valeur)} Md€ empruntés chaque année,
        cumulés au fil du refinancement. La légalité de l&apos;opération n&apos;est pas en cause ici : elle est traitée plus bas.
      </p>
    </div>
  );
}
