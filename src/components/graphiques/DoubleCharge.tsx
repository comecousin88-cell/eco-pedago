"use client";

import { useState } from "react";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Curseur } from "@/components/simulators/Curseur";
import { formatNombre } from "@/lib/format";
import { AXE, GRILLE, Infobulle, Legende } from "./commun";

/**
 * La « double charge » d'un passage à la capitalisation (modèle illustratif) :
 * les actifs doivent continuer à payer les pensions déjà promises par la
 * répartition, tout en épargnant pour leur propre retraite.
 */
const COUT_REPARTITION = 28; // % des salaires consacrés aux retraites, valeur d'exemple
const DUREE = 60; // années pour que les droits acquis en répartition s'éteignent

export function DoubleCharge() {
  const [part, setPart] = useState(50);
  const donnees = Array.from({ length: DUREE + 1 }, (_, t) => {
    // Les pensions déjà promises diminuent progressivement : nouvelles générations en capitalisation pour la part choisie.
    const anciennes = COUT_REPARTITION * (1 - (part / 100) * Math.min(1, t / DUREE) ** 1.2);
    // L'épargne pour soi monte vite : les actifs basculés épargnent dès la première année.
    const epargne = COUT_REPARTITION * (part / 100) * Math.min(1, (t + 5) / 40);
    return { annee: t, anciennes: Math.round(anciennes * 10) / 10, epargne: Math.round(epargne * 10) / 10 };
  });
  const pic = donnees.reduce((m, d) => (d.anciennes + d.epargne > m.anciennes + m.epargne ? d : m), donnees[0]);

  return (
    <div className="space-y-4">
      <Curseur
        libelle="Part de la retraite qui passe en capitalisation"
        valeur={part}
        min={0}
        max={100}
        pas={10}
        onChange={setPart}
        affichage={`${part} %`}
      />
      <Legende
        elements={[
          { libelle: "Pensions déjà promises (répartition)", couleur: "var(--series-1)" },
          { libelle: "Épargne pour sa propre retraite", couleur: "var(--series-2)" },
        ]}
      />
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={donnees} margin={{ top: 8, right: 12, bottom: 0, left: 0 }}>
            <CartesianGrid {...GRILLE} />
            <XAxis dataKey="annee" {...AXE} interval={9} tickFormatter={(v) => `an ${v}`} />
            <YAxis {...AXE} width={44} tickFormatter={(v) => `${v} %`} />
            <Tooltip
              content={({ active, payload, label }) =>
                active && payload?.length ? (
                  <Infobulle
                    titre={`Année ${label}`}
                    lignes={[
                      { libelle: "Pensions promises", couleur: "var(--series-1)", valeur: `${formatNombre(Number(payload[0].payload.anciennes), 1)} %` },
                      { libelle: "Épargne", couleur: "var(--series-2)", valeur: `${formatNombre(Number(payload[0].payload.epargne), 1)} %` },
                    ]}
                  />
                ) : null
              }
            />
            <Area type="monotone" dataKey="anciennes" stackId="1" stroke="var(--series-1)" fill="var(--series-1)" fillOpacity={0.5} isAnimationActive={false} />
            <Area type="monotone" dataKey="epargne" stackId="1" stroke="var(--series-2)" fill="var(--series-2)" fillOpacity={0.5} isAnimationActive={false} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      <p className="text-sm text-body" aria-live="polite">
        Effort total au plus haut : environ <strong>{formatNombre(pic.anciennes + pic.epargne, 0)} % des salaires</strong>{" "}
        (année {pic.annee}), contre {COUT_REPARTITION} % sans réforme.
        {part > 0 && " Pendant des décennies, une génération paie deux fois : pour ses aînés et pour elle-même."}
      </p>
      <p className="text-xs text-muted">
        Modèle illustratif, chiffres d&apos;exemple : {COUT_REPARTITION} % des salaires consacrés aux retraites, extinction des
        droits acquis en environ {DUREE} ans. Il montre la forme du problème, pas son coût exact, qui dépend du rendement
        de l&apos;épargne, du rythme de la transition et de la façon de la financer (impôt, dette…).
      </p>
    </div>
  );
}
