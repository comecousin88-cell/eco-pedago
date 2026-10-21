"use client";

import { VueTableau } from "@/components/graphiques/commun";
import { getValeur } from "@/lib/data";
import { ficheDePaie, impotSurLeRevenu, type Destination, type OptionsPaie } from "@/lib/economics";
import { formatEuros, formatNombre } from "@/lib/format";
import { parametresImpot, parametresPaie } from "@/lib/parametres";
import { BoutonSimu, Curseur } from "./Curseur";
import { BarreScenario, MarqueModifie, useScenario } from "./Scenario";

/**
 * Du coût employeur à ce qui reste en poche : cascade, puis ventilation des
 * cotisations par destination. Salarié non cadre, célibataire sans enfant.
 */
const COULEURS: Partial<Record<Destination, string>> = {
  "Retraite de base": "var(--series-1)",
  "Retraite complémentaire": "var(--series-7)",
  Maladie: "var(--series-3)",
  "CSG et CRDS": "var(--series-4)",
  Famille: "var(--series-5)",
  Chômage: "var(--series-2)",
  "Accidents du travail": "var(--series-6)",
  Autonomie: "var(--series-8)",
  "Logement, formation et autres": "var(--line-strong)",
};

const TAILLES: { v: OptionsPaie["taille"]; l: string }[] = [
  { v: "moins-11", l: "moins de 11 salariés" },
  { v: "11-49", l: "11 à 49" },
  { v: "50-plus", l: "50 et plus" },
];

const TAUX_AT = 2; // % : hypothèse, le taux réel est notifié à chaque entreprise

export function FicheDePaie() {
  const smic = getValeur("paie.smic-mensuel");
  const s = useScenario({ brut: 3500, taille: "11-49" as OptionsPaie["taille"] });
  const brut = s.valeurs.brut;
  const taille = s.valeurs.taille;

  const f = ficheDePaie(brut, parametresPaie(), { taille, tauxAT: TAUX_AT });
  const ir = impotSurLeRevenu(f.netImposable * 12, parametresImpot());
  const impotMensuel = ir.impot / 12;
  const netApresImpot = f.netAvantImpot - impotMensuel;
  const partPercue = netApresImpot / f.coutEmployeur;

  const cascade = [
    { libelle: "Coût total pour l'employeur", montant: f.coutEmployeur, note: "salaire brut + cotisations patronales" },
    { libelle: "Salaire brut", montant: brut, note: `− ${formatEuros(f.cotisationsEmployeur, 0)} de cotisations patronales (allègement déduit)` },
    { libelle: "Net avant impôt", montant: f.netAvantImpot, note: `− ${formatEuros(f.cotisationsSalariales, 0)} de cotisations salariales, CSG et CRDS` },
    { libelle: "Net après impôt sur le revenu", montant: netApresImpot, note: `− ${formatEuros(impotMensuel, 0)} de prélèvement à la source (taux moyen ${formatNombre(ir.tauxMoyen * 100, 1)} %)` },
  ];

  // Ventilation par destination (hors allègement, montré à part)
  const parDestination = new Map<Destination, number>();
  for (const l of f.lignes) {
    if (l.destination === "Allègement de cotisations") continue;
    parDestination.set(l.destination, (parDestination.get(l.destination) ?? 0) + l.montant);
  }
  const allegement = -f.lignes.filter((l) => l.destination === "Allègement de cotisations").reduce((s, l) => s + l.montant, 0);
  const destinations = [...parDestination.entries()].filter(([, m]) => m > 0.005).sort((a, b) => b[1] - a[1]);
  const totalBrutCotisations = destinations.reduce((s, [, m]) => s + m, 0);
  const retraites = (parDestination.get("Retraite de base") ?? 0) + (parDestination.get("Retraite complémentaire") ?? 0);

  return (
    <div className="space-y-6">
      <BarreScenario scenario={s} libelleReference="valeurs de départ" />
      <div className="grid gap-5 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end">
        <Curseur
          libelle="Salaire brut mensuel"
          valeur={brut}
          reference={s.reference.brut}
          affichageReference={formatEuros(s.reference.brut, Number.isInteger(s.reference.brut) ? 0 : 2)}
          min={Math.ceil(smic.valeur / 50) * 50}
          max={10000}
          pas={50}
          onChange={s.regler("brut")}
          affichage={formatEuros(brut, Number.isInteger(brut) ? 0 : 2)}
          aide={
            <>
              Smic au {smic.date.split("-").reverse().join("/")} : {formatEuros(smic.valeur)} bruts pour 35 heures.{" "}
              <button type="button" onClick={() => s.regler("brut")(smic.valeur)} className="font-medium text-accent underline underline-offset-4">
                Calculer au Smic
              </button>
            </>
          }
        />
        <div>
          <p className="text-sm font-semibold text-ink">
            Taille de l&apos;entreprise <MarqueModifie actif={s.estModifiee("taille")} />
          </p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {TAILLES.map((t) => (
              <BoutonSimu key={t.v} actif={taille === t.v} onClick={() => s.regler("taille")(t.v)}>
                {t.l}
              </BoutonSimu>
            ))}
          </div>
        </div>
      </div>

      <ol className="space-y-2" aria-live="polite">
        {cascade.map((c, i) => (
          <li key={c.libelle}>
            <div className="flex items-baseline justify-between gap-3 text-sm">
              <span className="font-semibold text-ink">{c.libelle}</span>
              <span className="font-serif text-lg font-semibold text-ink tabular-nums">{formatEuros(c.montant, 0)}</span>
            </div>
            <div className="mt-1 h-4 overflow-hidden rounded-full bg-subtle" aria-hidden="true">
              <div
                className="h-full rounded-full transition-[width] duration-500"
                style={{ width: `${(c.montant / f.coutEmployeur) * 100}%`, background: i === 3 ? "var(--accent)" : "var(--line-strong)" }}
              />
            </div>
            <p className="mt-0.5 text-xs text-muted">{c.note}</p>
          </li>
        ))}
      </ol>

      <div className="rounded-xl bg-accent-soft p-4">
        <p className="text-sm text-muted">Part du coût employeur qui arrive dans votre poche</p>
        <p className="font-serif text-4xl font-semibold text-ink">{formatNombre(partPercue * 100, 0)} %</p>
        <p className="mt-1 text-sm text-body">
          Sur {formatEuros(f.coutEmployeur, 0)} payés par l&apos;employeur, {formatEuros(netApresImpot, 0)} restent au salarié
          après impôt. Les cotisations ne sont pas perdues : elles financent sa future retraite, son assurance maladie,
          le chômage s&apos;il perd son emploi… dont {formatEuros(retraites, 0)} par mois pour les retraites.
        </p>
      </div>

      <div>
        <p className="text-sm font-semibold text-ink">Où vont les {formatEuros(totalBrutCotisations, 0)} de cotisations et contributions ?</p>
        <div className="mt-2 flex h-8 w-full gap-0.5 overflow-hidden rounded-lg" aria-hidden="true">
          {destinations.map(([d, m]) => (
            <div key={d} title={`${d} : ${formatEuros(m, 0)}`} style={{ width: `${(m / totalBrutCotisations) * 100}%`, background: COULEURS[d] }} />
          ))}
        </div>
        <ul className="mt-3 grid gap-x-6 gap-y-1 text-sm sm:grid-cols-2">
          {destinations.map(([d, m]) => (
            <li key={d} className="flex items-center gap-2">
              <span className="h-3 w-3 shrink-0 rounded-sm" style={{ background: COULEURS[d] }} aria-hidden="true" />
              <span className="text-body">{d}</span>
              <span className="ml-auto font-semibold text-ink tabular-nums">{formatEuros(m, 0)}</span>
            </li>
          ))}
          {allegement > 0 && (
            <li className="flex items-center gap-2 sm:col-span-2">
              <span className="text-body">Allègement de cotisations sur les bas et moyens salaires (RGDU)</span>
              <span className="ml-auto font-semibold text-ok tabular-nums">− {formatEuros(allegement, 0)}</span>
            </li>
          )}
        </ul>
        <VueTableau
          legende="Détail des cotisations du mois"
          colonnes={["Ligne", "Payée par", "Montant (€)"]}
          lignes={f.lignes.filter((l) => Math.abs(l.montant) > 0.005).map((l) => [l.libelle, l.payeur, Math.round(l.montant * 100) / 100])}
        />
      </div>

      <p className="text-xs text-muted">
        Approximation : salarié non cadre à temps plein, célibataire sans enfant, sans mutuelle ni prévoyance d&apos;entreprise,
        sans versement mobilité ; taux accidents du travail supposé de {TAUX_AT} % (il est propre à chaque entreprise). Impôt
        calculé sur le barème annuel avec l&apos;abattement de 10 % et la décote. Les cadres paient en plus quelques
        contributions spécifiques.
      </p>
    </div>
  );
}
