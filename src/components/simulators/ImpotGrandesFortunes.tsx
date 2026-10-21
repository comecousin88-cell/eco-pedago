"use client";

import { getSerie, getValeur } from "@/lib/data";
import { anneesDeCouverture, rendementImpotFortunes } from "@/lib/economics";
import { formatNombre } from "@/lib/format";
import { Curseur } from "./Curseur";
import { BarreScenario, useScenario } from "./Scenario";

/**
 * « Combien rapporte de taxer les plus riches ? » Un impôt plancher sur les
 * plus grandes fortunes, comparé à un besoin de financement et à d'autres
 * impôts.
 */
export function ImpotGrandesFortunes() {
  const assiette = getValeur("prop.grandes-fortunes-patrimoine");
  const dejaPayes = getValeur("prop.grandes-fortunes-impots");
  const elasticite = getValeur("prop.elasticite-zucman");
  const estimations = getSerie("prop.impot-plancher-rendements").serie;
  const tva = getValeur("prop.tva-point");
  const csg = getSerie("fp.recettes-2024-par-type").serie.find((p) => p.x === "CSG et CRDS")!;

  const s = useScenario({ taux: 2, besoin: 100 });

  const taux = s.valeurs.taux;

  const besoin = s.valeurs.besoin;

  const r = rendementImpotFortunes({
    assiette: assiette.valeur,
    taux: taux / 100,
    impotsDejaPayes: dejaPayes.valeur / 100,
    elasticite: elasticite.valeur / 100,
  });
  // Estimation prudente : le rapport entre l'estimation critique (2 à 3 Md€) et la reconstitution du Sénat (20 Md€) pour 2 %.
  const basse = (estimations.find((e) => e.x.includes("critique") && e.x.includes("haut"))!.y / estimations.find((e) => e.x.includes("rapporteur"))!.y);
  const prudent = r.theorique * basse;
  const couvert = (r.apresComportements / besoin) * 100;
  const annees = anneesDeCouverture(assiette.valeur, besoin);
  // 1 point de CSG : ordre de grandeur calculé (CSG et CRDS ÷ leur taux sur les salaires, 9,2 + 0,5 points).
  const pointCsg = csg.y / 9.7;

  const barre = (v: number, max: number) => `${Math.min(100, (v / max) * 100)}%`;
  const max = Math.max(besoin, r.theorique, pointCsg);

  return (
    <div className="space-y-5">
      <BarreScenario scenario={s} libelleReference="valeurs de départ" />
      <div className="grid gap-5 sm:grid-cols-2">
        <Curseur
          libelle="Taux de l'impôt sur les plus grandes fortunes"
          valeur={taux}
          reference={s.reference.taux}
          affichageReference={`${formatNombre(s.reference.taux, 1)} % par an`}
          min={0.5}
          max={5}
          pas={0.5}
          onChange={s.regler("taux")}
          affichage={`${formatNombre(taux, 1)} % par an`}
          aide={`Assiette : ${formatNombre(assiette.valeur)} Md€, patrimoine des 500 plus grandes fortunes (estimation de presse).`}
        />
        <Curseur
          libelle="Nouvelles dépenses à financer chaque année"
          valeur={besoin}
          reference={s.reference.besoin}
          affichageReference={`${formatNombre(s.reference.besoin)} Md€`}
          min={10}
          max={300}
          pas={10}
          onChange={s.regler("besoin")}
          affichage={`${formatNombre(besoin)} Md€`}
        />
      </div>

      <ul className="space-y-3" aria-live="polite">
        {[
          { l: "Besoin de financement", v: besoin, c: "var(--line-strong)", n: "ce qu'il faut trouver chaque année" },
          { l: "Rendement théorique (personne ne réagit)", v: r.theorique, c: "var(--series-1)", n: `${formatNombre(taux, 1)} % − ${formatNombre(dejaPayes.valeur, 1)} % d'impôts déjà payés, sur ${formatNombre(assiette.valeur)} Md€` },
          { l: "Après départs et optimisation (hypothèse centrale)", v: r.apresComportements, c: "var(--series-3)", n: `${formatNombre(elasticite.valeur)} % de redevables en moins par point de taux` },
          { l: "Hypothèse prudente", v: prudent, c: "var(--series-2)", n: "calée sur l'estimation critique publiée (impôt sur les sociétés déduit)" },
          { l: "Pour comparer : 1 point de CSG", v: pointCsg, c: "var(--series-7)", n: `ordre de grandeur calculé : CSG et CRDS (${formatNombre(csg.y)} Md€) divisées par leur taux sur les salaires (9,7 %)` },
          { l: "Pour comparer : 1 point de TVA (taux normal)", v: tva.valeur, c: "var(--series-4)", n: "selon Fipeco, d'après une étude de la direction générale du Trésor (2025)" },
        ].map((x) => (
          <li key={x.l}>
            <div className="flex items-baseline justify-between gap-3 text-sm">
              <span className="text-body">{x.l}</span>
              <span className="font-semibold text-ink tabular-nums">{formatNombre(x.v, x.v < 10 ? 1 : 0)} Md€</span>
            </div>
            <div className="mt-1 h-3 rounded-full bg-subtle" aria-hidden="true">
              <div className="h-full rounded-full transition-[width] duration-500" style={{ width: barre(x.v, max), background: x.c }} />
            </div>
            <p className="mt-0.5 text-xs text-muted">{x.n}</p>
          </li>
        ))}
      </ul>

      <dl className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-xl bg-accent-soft p-3">
          <dt className="text-sm text-muted">Part du besoin couverte (hypothèse centrale)</dt>
          <dd className="font-serif text-3xl font-semibold text-ink">{formatNombre(Math.min(couvert, 999), 0)} %</dd>
        </div>
        <div className="rounded-xl bg-subtle p-3">
          <dt className="text-sm text-muted">Si l&apos;on prenait la totalité de ces {formatNombre(assiette.valeur)} Md€</dt>
          <dd className="font-serif text-3xl font-semibold text-ink">{formatNombre(annees, 1)} ans</dd>
          <dd className="text-sm text-muted">de besoin couvert, une seule fois : le stock ne se reconstitue pas</dd>
        </div>
      </dl>
      <p className="text-xs text-muted">
        Modèle simplifié. L&apos;assiette est une estimation de presse (classement des 500 plus grandes fortunes), surtout
        composée de parts d&apos;entreprises et non de liquidités ; elle varie fortement avec la Bourse. Les effets de
        comportement réels sont incertains : les estimations publiées pour un impôt de 2 % vont de 2 à 25 Md€ par an.
      </p>
    </div>
  );
}
