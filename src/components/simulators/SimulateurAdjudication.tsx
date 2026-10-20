"use client";

import { useState } from "react";
import { adjudication, rendementActuariel, type Offre } from "@/lib/economics";
import { formatNombre, formatPourcent } from "@/lib/format";
import { BoutonSimu, Curseur } from "./Curseur";

/**
 * Mini-adjudication : l'État veut placer 10 Md€ d'OAT à 10 ans (coupon 3 %).
 * Quatre banques fictives ont déjà fait leur offre ; le lecteur joue un
 * cinquième investisseur et choisit son prix.
 */

const OBLIGATION = { nominal: 100, coupon: 0.03, maturite: 10 };
const MONTANT = 10; // Md€
const AUTRES: Offre[] = [
  { id: "Banque A", prix: 99.8, montant: 3 },
  { id: "Banque B", prix: 99.6, montant: 4 },
  { id: "Banque C", prix: 99.4, montant: 3 },
  { id: "Banque D", prix: 99.1, montant: 4 },
];

export function SimulateurAdjudication() {
  const [prix, setPrix] = useState(99.5);
  const [montant, setMontant] = useState(2);
  const [lance, setLance] = useState(false);

  const offres = [...AUTRES, { id: "Vous", prix, montant }];
  const r = adjudication(offres, MONTANT);
  const vous = r.servies.find((o) => o.id === "Vous")!;
  const triees = [...r.servies].sort((a, b) => b.prix - a.prix);
  const rdt = (p: number) => rendementActuariel(OBLIGATION, p);

  return (
    <div className="space-y-5">
      <p className="text-sm text-body">
        L&apos;État veut emprunter <strong>{MONTANT} Md€</strong> en vendant des OAT à 10 ans qui rapportent un coupon de{" "}
        <strong>3 % par an</strong>. Les offres s&apos;expriment en prix pour 100 € remboursés à l&apos;échéance. Plus vous
        proposez un prix élevé, plus vous avez de chances d&apos;être servi, mais moins votre placement rapporte.
      </p>

      <div className="grid gap-5 sm:grid-cols-2">
        <Curseur
          libelle="Votre prix pour 100 €"
          valeur={prix}
          min={98}
          max={100.5}
          pas={0.05}
          onChange={(v) => {
            setPrix(Math.round(v * 100) / 100);
            setLance(false);
          }}
          affichage={`${formatNombre(prix, 2)} €`}
          aide={`Soit un rendement de ${formatPourcent(rdt(prix), 2)} par an si vous gardez le titre 10 ans.`}
        />
        <Curseur
          libelle="Montant demandé"
          valeur={montant}
          min={1}
          max={5}
          pas={1}
          onChange={(v) => {
            setMontant(v);
            setLance(false);
          }}
          affichage={`${montant} Md€`}
        />
      </div>

      <BoutonSimu onClick={() => setLance(true)} actif={lance}>
        {lance ? "Résultat de l'adjudication" : "Envoyer mon offre"}
      </BoutonSimu>

      {lance && (
        <div aria-live="polite" className="space-y-3">
          <div className="overflow-x-auto rounded-xl border border-line">
            <table className="w-full text-xs whitespace-nowrap sm:text-sm">
              <caption className="sr-only">Offres classées du prix le plus élevé au plus bas</caption>
              <thead className="bg-subtle text-left">
                <tr>
                  <th scope="col" className="px-2 py-2 sm:px-3">Offre</th>
                  <th scope="col" className="px-2 py-2 sm:px-3 text-right">Prix</th>
                  <th scope="col" className="px-2 py-2 sm:px-3 text-right">Rendement</th>
                  <th scope="col" className="px-2 py-2 sm:px-3 text-right">Dem.</th>
                  <th scope="col" className="px-2 py-2 sm:px-3 text-right">Servi</th>
                </tr>
              </thead>
              <tbody>
                {triees.map((o) => (
                  <tr key={o.id} className={`border-t border-line ${o.id === "Vous" ? "bg-accent-soft font-semibold" : ""}`}>
                    <td className="px-2 py-1.5 sm:px-3">{o.id}</td>
                    <td className="px-2 py-1.5 sm:px-3 text-right tabular-nums">{formatNombre(o.prix, 2)} €</td>
                    <td className="px-2 py-1.5 sm:px-3 text-right tabular-nums">{formatPourcent(rdt(o.prix), 2)}</td>
                    <td className="px-2 py-1.5 sm:px-3 text-right tabular-nums">{formatNombre(o.montant, 1)}</td>
                    <td className={`px-2 py-1.5 sm:px-3 text-right tabular-nums ${o.servi > 0 ? "text-ok" : "text-muted"}`}>
                      {formatNombre(o.servi, 1)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="rounded-xl bg-subtle p-3 text-sm">
            {vous.servi === 0 ? (
              <>
                <strong className="text-ink">Vous n&apos;êtes pas servi :</strong> d&apos;autres investisseurs ont proposé des prix
                plus élevés et ont couvert les {MONTANT} Md€. Essayez un prix plus élevé, au prix d&apos;un rendement plus faible.
              </>
            ) : (
              <>
                <strong className="text-ink">
                  Vous êtes servi pour {formatNombre(vous.servi, 1)} Md€
                  {vous.servi < montant ? " (en partie)" : ""}
                </strong>{" "}
                et vous payez le prix que vous avez proposé, {formatNombre(prix, 2)} €. Votre placement rapportera{" "}
                {formatPourcent(rdt(prix), 2)} par an.
              </>
            )}{" "}
            Prix le plus bas accepté : {formatNombre(r.prixLimite ?? 0, 2)} €. Prix moyen payé :{" "}
            {formatNombre(r.prixMoyen ?? 0, 2)} €, soit un coût d&apos;emprunt de{" "}
            <strong className="text-ink">{formatPourcent(rdt(r.prixMoyen ?? 100), 2)}</strong> par an pour l&apos;État. La
            demande totale ({formatNombre(r.totalDemande)} Md€) représente {formatNombre(r.totalDemande / MONTANT, 1)} fois le
            montant cherché.
          </p>
        </div>
      )}
      <p className="text-xs text-muted">Offres et montants fictifs, simplifiés. Les vraies adjudications portent sur plusieurs milliards et des dizaines d&apos;offres.</p>
    </div>
  );
}
