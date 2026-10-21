"use client";

import { getSerie, getValeur } from "@/lib/data";
import { pouvoirAchat, tauxReel, tauxReelApproche } from "@/lib/economics";
import { formatEuros, formatNombre, formatPourcent } from "@/lib/format";
import { libellePeriode } from "@/lib/indicateurs";
import { Curseur } from "./Curseur";
import { BarreScenario, useScenario } from "./Scenario";

/**
 * Taux nominal, inflation, taux réel : on place 100 € pendant un an et l'on
 * regarde ce qu'ils permettent d'acheter à la fin. Les valeurs de départ sont
 * les chiffres actuels : taux de l'État à 10 ans et inflation sur un an.
 */
export function TauxReel() {
  const oat = getValeur("marches.taux10-france-dernier");
  const inflationSerie = getSerie("ind.inflation-fr").serie;
  const inflationActuelle = inflationSerie[inflationSerie.length - 1];
  const s = useScenario({ nominal: oat.valeur, inflation: inflationActuelle.y });
  const nominal = s.valeurs.nominal;
  const inflation = s.valeurs.inflation;

  const i = nominal / 100;
  const pi = inflation / 100;
  const reel = tauxReel(i, pi);
  const approche = tauxReelApproche(i, pi);
  const final = 100 * (1 + i);
  const enEurosDuDebut = pouvoirAchat(final, pi, 1);

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <div className="space-y-5">
        <BarreScenario scenario={s} />
        <Curseur
          libelle="Taux d'intérêt nominal"
          valeur={nominal}
          reference={s.reference.nominal}
          affichageReference={`${formatNombre(s.reference.nominal, 2)} %`}
          min={0}
          max={10}
          pas={0.01}
          onChange={s.regler("nominal")}
          affichage={`${formatNombre(nominal, 2)} %`}
          aide={`Valeur actuelle : taux de l'État à 10 ans, ${libellePeriode(oat.date, "mensuelle")}.`}
        />
        <Curseur
          libelle="Inflation sur l'année"
          valeur={inflation}
          reference={s.reference.inflation}
          affichageReference={`${formatNombre(s.reference.inflation, 1)} %`}
          min={0}
          max={10}
          pas={0.1}
          onChange={s.regler("inflation")}
          affichage={`${formatNombre(inflation, 1)} %`}
          aide={`Valeur actuelle : inflation sur un an en ${libellePeriode(inflationActuelle.x, "mensuelle")} (indice harmonisé).`}
        />
      </div>

      <div className="space-y-3" aria-live="polite">
        <p className="text-sm text-body">
          Vous prêtez <strong>100 €</strong> pendant un an. On vous rend{" "}
          <strong className="tabular-nums">{formatEuros(final)}</strong>. Mais les prix ont monté de{" "}
          {formatNombre(inflation, 1)} % : ces {formatEuros(final)} achètent autant que{" "}
          <strong className="tabular-nums">{formatEuros(enEurosDuDebut)}</strong> au début de l&apos;année.
        </p>
        <div className="rounded-xl bg-accent-soft p-4">
          <p className="text-sm text-muted">Taux réel (ce que vous gagnez vraiment)</p>
          <p className={`font-serif text-3xl font-semibold tabular-nums ${reel < 0 ? "text-bad" : "text-ink"}`}>
            {formatPourcent(reel, 2)}
          </p>
          <p className="mt-1 text-sm text-muted">
            Calcul rapide « taux − inflation » : {formatPourcent(approche, 2)}
          </p>
        </div>
        {reel < 0 && (
          <p className="text-sm text-body">
            Le taux réel est négatif : le prêteur perd du pouvoir d&apos;achat, l&apos;emprunteur y gagne.
          </p>
        )}
      </div>
    </div>
  );
}
