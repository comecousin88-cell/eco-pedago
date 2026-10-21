"use client";

import { getSerie, getValeur } from "@/lib/data";
import { surcoutInterets, tauxApparent, trajectoireTauxApparent } from "@/lib/economics";
import { formatNombre, formatPourcent } from "@/lib/format";
import { Curseur } from "./Curseur";
import { BarreScenario, useScenario } from "./Scenario";

/**
 * La dette en « couches » : chaque année, une partie des emprunts arrive à
 * échéance et est remplacée au taux du jour. Le taux moyen payé (taux
 * apparent) rattrape donc le taux de marché lentement.
 */
const ANNEES = 10;

export function CouchesDette() {
  const interets = getValeur("fp.interets");
  const dettes = getSerie("dette.historique-md").serie;
  const fin = dettes[dettes.length - 1];
  const debut = dettes[dettes.length - 2];
  const r0 = tauxApparent(interets.valeur, debut.y, fin.y);
  const oat = getValeur("marches.taux10-france-dernier");
  const maturiteReelle = getValeur("aft.maturite-moyenne");

  const s = useScenario({ marche: Math.round(oat.valeur * 4) / 4, maturite: Math.round(maturiteReelle.valeur) });

  const marche = s.valeurs.marche;

  const maturite = s.valeurs.maturite;

  const trajectoire = trajectoireTauxApparent(r0, marche / 100, maturite, ANNEES);
  const surcout = surcoutInterets(fin.y, r0, trajectoire);
  const couches = Math.round(maturite);

  return (
    <div className="space-y-6">
      <BarreScenario scenario={s} />
      <div className="grid gap-5 sm:grid-cols-2">
        <Curseur
          libelle="Taux auquel l'État emprunte désormais"
          valeur={marche}
          reference={s.reference.marche}
          affichageReference={`${formatNombre(s.reference.marche, 2)} %`}
          min={0}
          max={7}
          pas={0.25}
          onChange={s.regler("marche")}
          affichage={`${formatNombre(marche, 2)} %`}
          aide={`Taux de l'OAT à 10 ans en ${oat.date.slice(5)}/${oat.date.slice(0, 4)} : ${formatNombre(oat.valeur, 2)} %`}
        />
        <Curseur
          libelle="Durée moyenne des emprunts"
          valeur={maturite}
          reference={s.reference.maturite}
          affichageReference={`${s.reference.maturite} ans`}
          min={2}
          max={15}
          pas={1}
          onChange={s.regler("maturite")}
          affichage={`${maturite} ans`}
          aide={`Durée de vie moyenne réelle de la dette de l'État : environ ${formatNombre(maturiteReelle.valeur, 1)} ans`}
        />
      </div>

      <div>
        <p className="text-sm font-semibold text-ink">
          La dette en {couches} couches : en couleur, la part déjà refinancée au nouveau taux
        </p>
        <div className="mt-3 grid grid-cols-10 gap-1" role="img" aria-label={`Après ${ANNEES} ans, ${formatNombre(Math.min(1, ANNEES / maturite) * 100)} % de la dette a été refinancée au nouveau taux.`}>
          {trajectoire.map((_, k) => (
            <div key={k} className="flex flex-col">
              <div className="flex flex-col-reverse gap-0.5">
                {Array.from({ length: couches }, (_, c) => (
                  <span
                    key={c}
                    className="h-3 rounded-sm sm:h-4"
                    style={{ background: c <= k ? "var(--accent)" : "var(--line-strong)", opacity: c <= k ? 0.9 : 0.6 }}
                  />
                ))}
              </div>
              <span className="mt-1 text-center text-[10px] text-muted">an {k + 1}</span>
            </div>
          ))}
        </div>
      </div>

      <dl className="grid gap-3 sm:grid-cols-3" aria-live="polite">
        <div className="rounded-xl bg-subtle p-3">
          <dt className="text-sm text-muted">Taux moyen payé aujourd&apos;hui</dt>
          <dd className="font-serif text-2xl font-semibold text-ink">{formatPourcent(r0, 2)}</dd>
        </div>
        <div className="rounded-xl bg-subtle p-3">
          <dt className="text-sm text-muted">Taux moyen dans {ANNEES} ans</dt>
          <dd className="font-serif text-2xl font-semibold text-ink">{formatPourcent(trajectoire[ANNEES - 1], 2)}</dd>
        </div>
        <div className="rounded-xl bg-accent-soft p-3">
          <dt className="text-sm text-muted">Intérêts en plus chaque année, au bout de {ANNEES} ans</dt>
          <dd className="font-serif text-2xl font-semibold text-ink">
            {surcout[ANNEES - 1] >= 0 ? "+" : "−"}
            {formatNombre(Math.abs(surcout[ANNEES - 1]))} Md€
          </dd>
        </div>
      </dl>
      <p className="text-xs text-muted">
        Calcul : intérêts {interets.date} ({formatNombre(interets.valeur, 1)} Md€) rapportés à la dette moyenne de
        l&apos;année ; dette supposée constante à {formatNombre(fin.y)} Md€ (fin {fin.x}) ; une fraction 1/{maturite} des
        emprunts refinancée chaque année. Le modèle ignore les nouveaux déficits, qui s&apos;empruntent eux aussi au taux du
        jour et alourdiraient encore la facture.
      </p>
    </div>
  );
}
