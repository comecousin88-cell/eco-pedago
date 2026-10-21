"use client";

import { getSerie, getValeur } from "@/lib/data";
import { tvaContenue } from "@/lib/economics";
import { formatEuros, formatNombre } from "@/lib/format";
import { Curseur } from "./Curseur";
import { BarreScenario, useScenario } from "./Scenario";

/**
 * Les taxes payées en consommant : un budget mensuel d'exemple, réglable,
 * avec la TVA de chaque poste et l'accise sur le carburant.
 */
export function PanierConsommation() {
  const taux = Object.fromEntries(getSerie("tva.taux").serie.map((p) => [p.x, p.y]));
  const accise = getValeur("accise.gazole");

  const s = useScenario({ alimentation: 450, restaurant: 100, biens: 400, energie: 120, litres: 60, prixLitre: 1.75, loyer: 700 });

  const alimentation = s.valeurs.alimentation;

  const restaurant = s.valeurs.restaurant;

  const biens = s.valeurs.biens;

  const energie = s.valeurs.energie;

  const litres = s.valeurs.litres;

  const prixLitre = s.valeurs.prixLitre;

  const loyer = s.valeurs.loyer;

  const carburant = litres * prixLitre;
  const postes = [
    { libelle: "Loyer", montant: loyer, taxe: 0, detail: "pas de TVA sur un loyer d'habitation" },
    { libelle: "Alimentation", montant: alimentation, taxe: tvaContenue(alimentation, taux["Réduit"]), detail: `TVA à ${formatNombre(taux["Réduit"], 1)} %` },
    { libelle: "Restaurants, transports en commun", montant: restaurant, taxe: tvaContenue(restaurant, taux["Intermédiaire"]), detail: `TVA à ${formatNombre(taux["Intermédiaire"], 0)} %` },
    { libelle: "Vêtements, équipement, loisirs, services", montant: biens, taxe: tvaContenue(biens, taux["Normal"]), detail: `TVA à ${formatNombre(taux["Normal"], 0)} %` },
    { libelle: "Électricité, gaz", montant: energie, taxe: tvaContenue(energie, taux["Normal"]), detail: `TVA à ${formatNombre(taux["Normal"], 0)} % (simplification : hors autres taxes sur l'énergie)` },
    {
      libelle: `Carburant (${litres} L de gazole)`,
      montant: carburant,
      taxe: tvaContenue(carburant, taux["Normal"]) + litres * accise.valeur,
      detail: `accise ${formatNombre(accise.valeur, 4)} € par litre + TVA à ${formatNombre(taux["Normal"], 0)} % (calculée aussi sur l'accise)`,
    },
  ];
  const total = postes.reduce((s, p) => s + p.montant, 0);
  const taxes = postes.reduce((s, p) => s + p.taxe, 0);

  return (
    <div className="space-y-5">
      <BarreScenario scenario={s} libelleReference="valeurs de départ" />
      <div className="grid gap-4 sm:grid-cols-2">
        <Curseur libelle="Loyer" valeur={loyer}
          reference={s.reference.loyer} min={0} max={1500} pas={25} onChange={s.regler("loyer")} affichage={formatEuros(loyer, 0)} />
        <Curseur libelle="Alimentation" valeur={alimentation}
          reference={s.reference.alimentation} min={0} max={1000} pas={10} onChange={s.regler("alimentation")} affichage={formatEuros(alimentation, 0)} />
        <Curseur libelle="Restaurants, transports en commun" valeur={restaurant}
          reference={s.reference.restaurant} min={0} max={500} pas={10} onChange={s.regler("restaurant")} affichage={formatEuros(restaurant, 0)} />
        <Curseur libelle="Vêtements, équipement, loisirs, services" valeur={biens}
          reference={s.reference.biens} min={0} max={1500} pas={10} onChange={s.regler("biens")} affichage={formatEuros(biens, 0)} />
        <Curseur libelle="Électricité, gaz" valeur={energie}
          reference={s.reference.energie} min={0} max={400} pas={10} onChange={s.regler("energie")} affichage={formatEuros(energie, 0)} />
        <Curseur libelle="Gazole (litres par mois)" valeur={litres}
          reference={s.reference.litres} min={0} max={200} pas={5} onChange={s.regler("litres")} affichage={`${litres} L`} />
        <Curseur
          libelle="Prix du gazole à la pompe (hypothèse)"
          valeur={prixLitre}
          reference={s.reference.prixLitre}
          affichageReference={`${formatNombre(s.reference.prixLitre, 2)} € / L`}
          min={1.2}
          max={2.5}
          pas={0.05}
          onChange={s.regler("prixLitre")}
          affichage={`${formatNombre(prixLitre, 2)} € / L`}
        />
      </div>

      <ul className="space-y-1.5 text-sm">
        {postes.map((p) => (
          <li key={p.libelle} className="grid grid-cols-[minmax(0,1fr)_auto] gap-x-3">
            <span className="text-body">
              {p.libelle} <span className="text-xs text-muted">· {p.detail}</span>
            </span>
            <span className="font-semibold text-ink tabular-nums">{formatEuros(p.taxe, 0)}</span>
          </li>
        ))}
      </ul>
      <div className="rounded-xl bg-accent-soft p-4" aria-live="polite">
        <p className="text-sm text-muted">Taxes sur la consommation, chaque mois</p>
        <p className="font-serif text-3xl font-semibold text-ink">{formatEuros(taxes, 0)}</p>
        <p className="mt-1 text-sm text-body">
          soit {formatNombre((taxes / total) * 100, 1)} % des {formatEuros(total, 0)} dépensés. Sans le loyer, la part monte à{" "}
          {formatNombre((taxes / (total - loyer)) * 100, 1)} %.
        </p>
      </div>
      <p className="text-xs text-muted">
        Budget d&apos;exemple, à régler selon votre situation. Les taux de TVA et l&apos;accise sur le gazole sont ceux de 2026 ;
        le prix du litre est une hypothèse. Ne sont pas comptées les autres taxes (sur l&apos;électricité, les assurances, le
        tabac, l&apos;alcool…).
      </p>
    </div>
  );
}
