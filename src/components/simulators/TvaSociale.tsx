"use client";

import { getSerie, getValeur } from "@/lib/data";
import { formatNombre } from "@/lib/format";
import { Curseur } from "./Curseur";
import { BarreScenario, useScenario } from "./Scenario";

/**
 * « Et si on le faisait ? » pour la TVA sociale : on relève le taux normal de
 * TVA de quelques points et l'on baisse d'autant les cotisations. Au départ,
 * aucun changement (les chiffres actuels). Ordres de grandeur seulement : un
 * point de taux normal rapporte environ ce qu'indique Fipeco, avant effets sur
 * la consommation.
 */
export function TvaSociale() {
  const point = getValeur("prop.tva-point");
  const cotisations = getSerie("fp.recettes-2024-par-type").serie.find((p) => p.x === "Cotisations sociales")!;
  const population = getValeur("pop.france");
  const s = useScenario({ points: 0 });
  const points = s.valeurs.points;

  const recettes = points * point.valeur;
  const partCotisations = (recettes / cotisations.y) * 100;
  const parHabitant = (recettes * 1000) / population.valeur;

  return (
    <div className="space-y-5">
      <BarreScenario scenario={s} />
      <Curseur
        libelle="Hausse du taux normal de TVA"
        valeur={points}
        reference={s.reference.points}
        affichageReference="aucune hausse"
        min={0}
        max={5}
        pas={0.5}
        onChange={s.regler("points")}
        affichage={`${formatNombre(points, 1)} point${points >= 2 ? "s" : ""}`}
        aide={`Un point de taux normal rapporte environ ${formatNombre(point.valeur, 1)} Md€ par an, selon Fipeco.`}
      />
      <dl className="grid gap-3 sm:grid-cols-3" aria-live="polite">
        <div className="rounded-xl bg-subtle p-3">
          <dt className="text-sm text-muted">TVA payée en plus chaque année</dt>
          <dd className="font-serif text-2xl font-semibold text-ink">{formatNombre(recettes, 1)} Md€</dd>
          <dd className="text-sm text-muted">environ {formatNombre(parHabitant, 0)} € par habitant</dd>
        </div>
        <div className="rounded-xl bg-subtle p-3">
          <dt className="text-sm text-muted">Baisse de cotisations possible</dt>
          <dd className="font-serif text-2xl font-semibold text-ink">{formatNombre(recettes, 1)} Md€</dd>
          <dd className="text-sm text-muted">soit {formatNombre(partCotisations, 1)} % des cotisations sociales</dd>
        </div>
        <div className="rounded-xl bg-subtle p-3">
          <dt className="text-sm text-muted">Qui paie, qui gagne</dt>
          <dd className="text-sm leading-relaxed text-body">
            {points === 0
              ? "Rien ne change tant que le taux n'est pas relevé."
              : "Les produits importés paient leur part ; les produits fabriqués en France coûtent moins cher à produire. Les retraités, qui ne profitent pas de la baisse des cotisations, y perdent."}
          </dd>
        </div>
      </dl>
    </div>
  );
}
