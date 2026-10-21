"use client";

import { getSerie, getValeur } from "@/lib/data";
import { reculerAgeDepart, soldeRetraites } from "@/lib/economics";
import { formatEuros, formatNombre } from "@/lib/format";
import { BoutonSimu, Curseur } from "./Curseur";
import { BarreScenario, MarqueModifie, useScenario } from "./Scenario";

/**
 * Les trois leviers d'un régime par répartition, sur la relation d'équilibre
 * du COR : solde = assiette × (taux de prélèvement − retraités par cotisant ×
 * pension relative). Point de départ : les projections du COR (2025 ou 2070).
 */
const DUREE_RETRAITE = 30; // années : calibrage pour retrouver les équivalences du COR en 2070
const SALAIRE_EXEMPLE = 3000; // € bruts par mois

export function LeviersRetraites() {
  const point = (id: string, x: string) => getSerie(id).serie.find((p) => p.x === x)!.y;
  const pension = getValeur("retraites.pension-moyenne");
  const s = useScenario({ annee: "2070", age: 0, taux: 0, pensionDelta: 0 });
  const annee = s.valeurs.annee;
  const age = s.valeurs.age;
  const taux = s.valeurs.taux;
  const pensionDelta = s.valeurs.pensionDelta;

  const rpc = 1 / point("retraites.cotisants-par-retraite", annee);
  const pr = point("retraites.pension-relative", annee) / 100;
  const depenses = point("retraites.depenses-projection", annee);
  const ressources = point("retraites.ressources-projection", annee);
  const assiette = depenses / (rpc * pr);
  const depart = { assiettePib: assiette, tauxPrelevement: ressources / assiette, retraitesParCotisant: rpc, pensionRelative: pr };

  const avecAge = reculerAgeDepart(depart, age, DUREE_RETRAITE);
  const apres = { ...avecAge, tauxPrelevement: depart.tauxPrelevement + taux / 100, pensionRelative: pr + pensionDelta / 100 };
  const r0 = soldeRetraites(depart);
  const r = soldeRetraites(apres);
  const equilibre = Math.abs(r.solde) < 0.15;

  const netEnMoins = (SALAIRE_EXEMPLE * (taux / 2)) / 100; // hypothèse : hausse partagée à parts égales
  const pensionType = pension.valeur * (apres.pensionRelative / pr);

  return (
    <div className="space-y-5">
      <BarreScenario scenario={s} />
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm text-muted">
          Situation de départ <MarqueModifie actif={s.estModifiee("annee")} /> :
        </span>
        {(["2025", "2070"] as const).map((a) => (
          <BoutonSimu
            key={a}
            actif={annee === a}
            onClick={() => {
              s.regler("annee")(a);
              s.regler("age")(0);
              s.regler("taux")(0);
              s.regler("pensionDelta")(0);
            }}
          >
            {a === "2025" ? "Aujourd'hui (2025)" : "En 2070 (projection du COR)"}
          </BoutonSimu>
        ))}
      </div>
      <p className="text-sm text-body">
        En {annee} : {formatNombre(1 / rpc, 1)} cotisant pour un retraité, une pension moyenne égale à{" "}
        {formatNombre(pr * 100, 1)} % du revenu d&apos;activité moyen, et un solde de{" "}
        <strong className="text-ink">{formatNombre(r0.solde, 1)} point de PIB</strong>.
      </p>

      <div className="grid gap-5 sm:grid-cols-3">
        <Curseur
          libelle="Âge moyen de départ"
          valeur={age}
          reference={s.reference.age}
          affichageReference={`${s.reference.age > 0 ? "+" : ""}${formatNombre(s.reference.age, 1)} an${Math.abs(s.reference.age) > 1 ? "s" : ""}`}
          min={-2}
          max={5}
          pas={0.5}
          onChange={s.regler("age")}
          affichage={`${age > 0 ? "+" : ""}${formatNombre(age, 1)} an${Math.abs(age) > 1 ? "s" : ""}`}
        />
        <Curseur
          libelle="Taux de cotisation"
          valeur={taux}
          reference={s.reference.taux}
          affichageReference={`${s.reference.taux > 0 ? "+" : ""}${formatNombre(s.reference.taux, 1)} point${Math.abs(s.reference.taux) > 1 ? "s" : ""}`}
          min={-3}
          max={8}
          pas={0.5}
          onChange={s.regler("taux")}
          affichage={`${taux > 0 ? "+" : ""}${formatNombre(taux, 1)} point${Math.abs(taux) > 1 ? "s" : ""}`}
        />
        <Curseur
          libelle="Niveau des pensions (relatif aux salaires)"
          valeur={pensionDelta}
          reference={s.reference.pensionDelta}
          affichageReference={`${s.reference.pensionDelta > 0 ? "+" : ""}${formatNombre(s.reference.pensionDelta, 1)} point${Math.abs(s.reference.pensionDelta) > 1 ? "s" : ""}`}
          min={-12}
          max={5}
          pas={0.5}
          onChange={s.regler("pensionDelta")}
          affichage={`${pensionDelta > 0 ? "+" : ""}${formatNombre(pensionDelta, 1)} point${Math.abs(pensionDelta) > 1 ? "s" : ""}`}
        />
      </div>

      <div className="grid gap-3 sm:grid-cols-3" aria-live="polite">
        <div className={`rounded-xl p-3 ${equilibre ? "bg-ok-soft" : r.solde < 0 ? "bg-bad-soft" : "bg-subtle"}`}>
          <p className="text-sm text-muted">Solde du système</p>
          <p className={`font-serif text-2xl font-semibold ${equilibre ? "text-ok" : r.solde < 0 ? "text-bad" : "text-ink"}`}>
            {r.solde > 0 ? "+" : ""}
            {formatNombre(r.solde, 1)} % du PIB
          </p>
          <p className="text-sm text-muted">{equilibre ? "à l'équilibre" : r.solde < 0 ? "en déficit" : "en excédent"}</p>
        </div>
        <div className="rounded-xl bg-subtle p-3">
          <p className="text-sm text-muted">Salarié payé {formatEuros(SALAIRE_EXEMPLE, 0)} bruts</p>
          <p className="font-serif text-2xl font-semibold text-ink">
            {netEnMoins > 0 ? "−" : netEnMoins < 0 ? "+" : ""}
            {formatEuros(Math.abs(netEnMoins), 0)} net / mois
          </p>
          <p className="text-sm text-muted">hausse ou baisse partagée à parts égales avec l&apos;employeur</p>
        </div>
        <div className="rounded-xl bg-subtle p-3">
          <p className="text-sm text-muted">Retraité à la pension moyenne ({formatEuros(pension.valeur, 0)} bruts)</p>
          <p className="font-serif text-2xl font-semibold text-ink">{formatEuros(pensionType, 0)} / mois</p>
          <p className="text-sm text-muted">en euros d&apos;aujourd&apos;hui, à salaires inchangés</p>
        </div>
      </div>

      {annee === "2070" && (
        <p className="rounded-xl bg-accent-soft p-3 text-sm text-body">
          Repère du COR pour 2070 : l&apos;équilibre serait atteint, au choix, avec un âge moyen de départ de{" "}
          <strong>{formatNombre(getValeur("retraites.equilibre-age-2070").valeur, 1)} ans</strong> (3 ans de plus qu&apos;à
          législation inchangée), ou une pension moyenne relative plus basse de{" "}
          <strong>{formatNombre(getValeur("retraites.equilibre-pension-2070").valeur, 1)} points</strong>, ou des prélèvements
          plus élevés de <strong>{formatNombre(getValeur("retraites.equilibre-prelevements-2070").valeur, 1)} points</strong>.
          Essayez de retrouver ces chiffres avec les curseurs.
        </p>
      )}
      <p className="text-xs text-muted">
        Modèle simplifié : un recul d&apos;un an de l&apos;âge moyen transforme environ 1/{DUREE_RETRAITE} des retraités en
        cotisants (calibrage qui retrouve l&apos;ordre de grandeur du COR) ; les effets d&apos;un départ plus tardif sur le
        montant des pensions, l&apos;emploi des seniors ou le chômage ne sont pas modélisés.
      </p>
    </div>
  );
}
