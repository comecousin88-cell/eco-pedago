"use client";

import { useState } from "react";
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { AXE, GRILLE, Infobulle, Legende, nombreAxe, VueTableau } from "@/components/graphiques/commun";
import { Curseur } from "@/components/simulators/Curseur";
import { BarreScenario, useScenario } from "@/components/simulators/Scenario";
import { evenements } from "@/content/jeu-ministre";
import { getSerie, getValeur, toutesLesDonnees } from "@/lib/data";
import { formatNombre } from "@/lib/format";
import {
  anneeMandat,
  bilanMandat,
  tirerEvenements,
  type DecisionBudget,
  type EtatMinistre,
  type Evenement,
  type HypothesesMinistre,
} from "@/lib/game/ministre";

const DUREE = 5;

function etatInitial(): { etat: EtatMinistre; h: HypothesesMinistre; annee0: number } {
  const dette = getValeur("dette.fin-annee-pib");
  const solde = getValeur("deficit.ratio-pib");
  const pib = getValeur("macro.pib");
  const interets = getValeur("fp.interets");
  const croissance = getValeur("macro.croissance-valeur");
  const detteMdPrecedente = getSerie("dette.historique-md").serie.find((p) => p.x === String(Number(dette.date) - 1))!.y;
  const spread = getValeur("marches.spread-dernier");
  const v = (id: string) => getValeur(id).valeur;
  const interetsPib = (interets.valeur / pib.valeur) * 100;
  return {
    annee0: Number(dette.date),
    etat: {
      annee: 0,
      dette: dette.valeur,
      soldePublic: -solde.valeur,
      soldePrimaire: -solde.valeur + interetsPib,
      soldeStructurel: -solde.valeur + interetsPib,
      soldeHorsChocs: -solde.valeur,
      spreadHorsChocs: spread.valeur,
      croissanceHorsChocs: croissance.valeur,
      tauxApparent: (interets.valeur / detteMdPrecedente) * 100,
      spread: spread.valeur,
      croissance: croissance.valeur,
      pib: pib.valeur,
    },
    h: {
      croissanceTendance: v("ministre.croissance-tendancielle"),
      multDepenses: v("ministre.multiplicateur-depenses"),
      multImpots: v("ministre.multiplicateur-impots"),
      multInvestissement: v("ministre.multiplicateur-investissement"),
      stabilisateurs: v("ministre.stabilisateurs"),
      reactionSpread: v("ministre.reaction-spread"),
      tauxAllemand: v("marches.taux10-allemagne-dernier"),
      maturite: v("aft.maturite-moyenne"),
      decoteMaturites: v("ministre.decote-maturites"),
    },
  };
}

function Indicateurs({ e, h, titre }: { e: EtatMinistre; h: HypothesesMinistre; titre: string }) {
  const tuiles = [
    { l: "Dette", v: `${formatNombre(e.dette, 1)} % du PIB` },
    { l: "Solde public", v: `${formatNombre(e.soldePublic, 1)} % du PIB` },
    { l: "Croissance nominale", v: `${formatNombre(e.croissance, 1)} %` },
    { l: "Taux à 10 ans", v: `${formatNombre(h.tauxAllemand + e.spread / 100, 2)} %` },
    { l: "Écart avec l'Allemagne", v: `${formatNombre(e.spread, 0)} pb` },
    { l: "Taux apparent de la dette", v: `${formatNombre(e.tauxApparent, 2)} %` },
  ];
  return (
    <section aria-label={titre}>
      <p className="text-sm font-semibold text-ink">{titre}</p>
      <dl className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3">
        {tuiles.map((t) => (
          <div key={t.l} className="rounded-xl bg-subtle p-3">
            <dt className="text-xs text-muted">{t.l}</dt>
            <dd className="font-serif text-xl font-semibold text-ink tabular-nums">{t.v}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

function Courbes({ points, annee0 }: { points: EtatMinistre[]; annee0: number }) {
  const donnees = points.map((p) => ({ annee: String(annee0 + p.annee), dette: p.dette, solde: p.soldePublic }));
  return (
    <div>
      <div className="grid gap-4 sm:grid-cols-2">
        {(
          [
            ["dette", "Dette (% du PIB)", "var(--series-1)"],
            ["solde", "Solde public (% du PIB)", "var(--series-2)"],
          ] as const
        ).map(([cle, titre, couleur]) => (
          <div key={cle}>
            <p className="text-sm font-semibold text-ink">{titre}</p>
            <div className="mt-1 h-44 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={donnees} margin={{ top: 8, right: 16, bottom: 0, left: 0 }}>
                  <CartesianGrid {...GRILLE} />
                  <XAxis dataKey="annee" {...AXE} />
                  <YAxis {...AXE} width={40} tickFormatter={nombreAxe} domain={["auto", "auto"]} />
                  <Tooltip
                    content={({ active, payload, label }) =>
                      active && payload?.length ? (
                        <Infobulle titre={`Fin ${label}`} lignes={[{ libelle: titre, couleur, valeur: `${formatNombre(Number(payload[0].value), 1)} %` }]} />
                      ) : null
                    }
                  />
                  <Line dataKey={cle} stroke={couleur} strokeWidth={2} dot={{ r: 3 }} isAnimationActive={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        ))}
      </div>
      <Legende
        elements={[
          { libelle: "Dette", couleur: "var(--series-1)" },
          { libelle: "Solde public", couleur: "var(--series-2)" },
        ]}
      />
      <VueTableau
        legende="Votre mandat, année par année"
        colonnes={["Année", "Dette (% du PIB)", "Solde public (% du PIB)", "Croissance nominale (%)", "Écart avec l'Allemagne (pb)"]}
        lignes={points.map((p) => [
          String(annee0 + p.annee),
          Math.round(p.dette * 10) / 10,
          Math.round(p.soldePublic * 10) / 10,
          Math.round(p.croissance * 10) / 10,
          Math.round(p.spread),
        ])}
      />
    </div>
  );
}

function Hypotheses({ h }: { h: HypothesesMinistre }) {
  const ids = [
    "ministre.croissance-tendancielle",
    "ministre.multiplicateur-depenses",
    "ministre.multiplicateur-impots",
    "ministre.multiplicateur-investissement",
    "ministre.stabilisateurs",
    "ministre.reaction-spread",
    "ministre.decote-maturites",
  ];
  const toutes = toutesLesDonnees();
  return (
    <section className="rounded-2xl border border-line bg-surface p-5 text-sm leading-relaxed text-body">
      <h2 className="font-semibold text-ink">Les hypothèses du modèle</h2>
      <p className="mt-1">
        Le jeu repose sur un modèle simple, dont voici toutes les hypothèses. Elles ne sont pas des prévisions : de vrais
        modèles macroéconomiques comptent des centaines d&apos;équations, et les économistes ne s&apos;accordent pas sur
        plusieurs de ces valeurs.
      </p>
      <ul className="mt-3 space-y-2">
        {ids.map((id) => {
          const d = toutes.find((x) => x.id === id)!;
          return (
            <li key={id}>
              <strong className="text-ink">
                {d.label} : {"valeur" in d ? formatNombre(d.valeur, 1) : ""} {d.unite}.
              </strong>{" "}
              <span className="text-muted">{d.note}</span>
            </li>
          );
        })}
        <li>
          <strong className="text-ink">Renouvellement de la dette : {formatNombre(h.maturite, 1)} ans de maturité moyenne.</strong>{" "}
          <span className="text-muted">
            Chaque année, le taux moyen de la dette se rapproche du taux de marché d&apos;environ 1/{formatNombre(h.maturite, 1)} de
            l&apos;écart (Agence France Trésor, chiffre à vérifier).
          </span>
        </li>
        <li>
          <strong className="text-ink">Taux allemand à 10 ans : {formatNombre(h.tauxAllemand, 2)} %, supposé constant.</strong>{" "}
          <span className="text-muted">Le taux français est égal au taux allemand plus l&apos;écart (spread), plus les chocs de taux.</span>
        </li>
        <li>
          <strong className="text-ink">Point de départ : les données de 2025.</strong>{" "}
          <span className="text-muted">
            Dette, déficit, intérêts et PIB de l&apos;Insee ; écart de taux de la BCE. Les effets d&apos;un budget sont
            supposés durables : une économie votée une année se reconduit les années suivantes. Les imprévus, eux, pèsent l&apos;année où ils surviennent.
          </span>
        </li>
      </ul>
    </section>
  );
}

/**
 * Jeu « Ministre des Finances » : cinq budgets annuels, un événement imprévu
 * par an, et un bilan sur quatre critères explicites. Toutes les hypothèses
 * sont affichées sous le jeu.
 */
export function JeuMinistre() {
  const { etat: depart, h, annee0 } = etatInitial();
  const [graine, setGraine] = useState(2026);
  const [historique, setHistorique] = useState<EtatMinistre[]>([]);
  const [derniersEvenements, setDerniersEvenements] = useState<Evenement[]>([]);
  const s = useScenario({ economies: 10, impots: 5, investissement: 0 });
  const decision: DecisionBudget = s.valeurs;

  const tirage = tirerEvenements(evenements, DUREE, graine);
  const courant = historique.length ? historique[historique.length - 1] : depart;
  const anneeCourante = historique.length + 1;
  const fini = historique.length >= DUREE;
  const effortNet = decision.economies + decision.impots - decision.investissement;

  const voter = () => {
    const ev = tirage[historique.length];
    setHistorique((hst) => [...hst, anneeMandat(courant, decision, ev, h)]);
    setDerniersEvenements((l) => [...l, ev]);
  };
  const recommencer = (nouvelleGraine: number) => {
    setGraine(nouvelleGraine);
    setHistorique([]);
    setDerniersEvenements([]);
  };

  const dernierEvenement = derniersEvenements[derniersEvenements.length - 1];

  return (
    <div className="space-y-6">
      {!fini && (
        <section className="rounded-2xl border border-line bg-surface p-5">
          <p className="text-xs font-semibold tracking-wide text-accent uppercase">
            Année {anneeCourante} sur {DUREE} · budget {annee0 + anneeCourante}
          </p>
          <div className="mt-3">
            <Indicateurs e={courant} h={h} titre={historique.length ? `Situation fin ${annee0 + historique.length}` : `Situation de départ, fin ${annee0}`} />
          </div>

          <div className="mt-5">
            <BarreScenario scenario={s} libelleReference="réglages de départ" />
          </div>
          <div className="mt-3 grid gap-5 md:grid-cols-3">
            <Curseur
              libelle="Économies sur les dépenses"
              valeur={decision.economies}
              min={0}
              max={40}
              pas={1}
              onChange={s.regler("economies")}
              reference={s.reference.economies}
              affichageReference={`${s.reference.economies} Md€`}
              affichage={`${decision.economies} Md€`}
              aide="Moins de dépenses publiques : améliore le solde, freine un peu la croissance."
            />
            <Curseur
              libelle="Hausses d'impôts"
              valeur={decision.impots}
              min={0}
              max={40}
              pas={1}
              onChange={s.regler("impots")}
              reference={s.reference.impots}
              affichageReference={`${s.reference.impots} Md€`}
              affichage={`${decision.impots} Md€`}
              aide="Plus de recettes : améliore le solde, freine un peu la croissance."
            />
            <Curseur
              libelle="Investissement public supplémentaire"
              valeur={decision.investissement}
              min={0}
              max={30}
              pas={1}
              onChange={s.regler("investissement")}
              reference={s.reference.investissement}
              affichageReference={`${s.reference.investissement} Md€`}
              affichage={`${decision.investissement} Md€`}
              aide="Soutient l'activité à court terme, mais creuse le déficit."
            />
          </div>
          <p className="mt-3 text-sm text-muted">
            Effort net de l&apos;année : {effortNet >= 0 ? "" : "−"}
            {formatNombre(Math.abs(effortNet), 0)} Md€, soit {formatNombre((effortNet / courant.pib) * 100, 2)} point de PIB. Il
            s&apos;ajoute aux efforts des années précédentes.
          </p>
          <button type="button" onClick={voter} className="mt-4 rounded-full bg-ink px-5 py-2.5 text-sm font-medium text-page hover:opacity-85">
            Voter le budget {annee0 + anneeCourante}
          </button>
        </section>
      )}

      {dernierEvenement && (
        <section aria-live="polite" className="rounded-2xl border border-l-4 border-line border-l-accent bg-surface p-5">
          <p className="text-xs font-semibold tracking-wide text-muted uppercase">
            Imprévu de l&apos;année {annee0 + derniersEvenements.length}
          </p>
          <h2 className="mt-1 font-serif text-xl font-semibold text-ink">{dernierEvenement.titre}</h2>
          <p className="mt-1 text-body">{dernierEvenement.texte}</p>
          <p className="mt-2 text-sm text-muted">
            Effets supposés : croissance {dernierEvenement.croissance >= 0 ? "+" : ""}
            {formatNombre(dernierEvenement.croissance, 1)} point, taux {dernierEvenement.taux >= 0 ? "+" : ""}
            {formatNombre(dernierEvenement.taux, 1)} point, écart avec l&apos;Allemagne {dernierEvenement.spread >= 0 ? "+" : ""}
            {dernierEvenement.spread} pb{dernierEvenement.cout ? `, dépense imprévue de ${dernierEvenement.cout} Md€` : ""}.
          </p>
        </section>
      )}

      {historique.length > 0 && (
        <section className="rounded-2xl border border-line bg-surface p-5">
          <h2 className="font-semibold text-ink">Votre mandat</h2>
          <div className="mt-3">
            <Courbes points={[depart, ...historique]} annee0={annee0} />
          </div>
        </section>
      )}

      {fini && (
        <section className="rounded-2xl border border-line bg-surface p-5">
          <h2 className="font-serif text-2xl font-semibold text-ink">Le bilan de votre mandat</h2>
          <div className="mt-3">
            <Indicateurs e={courant} h={h} titre={`Situation fin ${annee0 + DUREE}`} />
          </div>
          {(() => {
            const b = bilanMandat(depart, historique);
            return (
              <>
                <p className="mt-4 font-serif text-xl font-semibold text-ink">
                  {b.score} critère{b.score > 1 ? "s" : ""} atteint{b.score > 1 ? "s" : ""} sur {b.criteres.length}
                </p>
                <ul className="mt-2 space-y-1.5 text-sm">
                  {b.criteres.map((c) => (
                    <li key={c.libelle} className="flex gap-2">
                      <span aria-hidden="true" className={c.atteint ? "text-ok" : "text-muted"}>
                        {c.atteint ? "✓" : "○"}
                      </span>
                      <span>
                        <span className="text-ink">{c.libelle}</span>
                        <span className="sr-only">{c.atteint ? " : atteint" : " : non atteint"}</span>
                        <span className="text-muted"> ({c.detail})</span>
                      </span>
                    </li>
                  ))}
                </ul>
                <p className="mt-3 text-sm text-muted">
                  Les critères jugent vos choix, pas la chance : le déficit, la croissance et l&apos;écart de taux y sont
                  mesurés hors effets des imprévus tirés au sort. À titre de repère, un effort régulier d&apos;environ
                  25 Md€ par an (0,8 point de PIB) atteint au moins trois critères dans la grande majorité des tirages ;
                  l&apos;effort minimal demandé par les règles européennes (0,5 point) n&apos;y suffit presque jamais.
                </p>
                <p className="mt-2 text-sm text-muted">
                  Ces critères ne disent pas quelle politique est la meilleure : un mandat peut viser d&apos;autres objectifs
                  (services publics, transition énergétique, pouvoir d&apos;achat) que ce jeu ne mesure pas.
                </p>
              </>
            );
          })()}
          <div className="mt-4 flex flex-wrap gap-2">
            <button type="button" onClick={() => recommencer(graine)} className="rounded-full bg-ink px-4 py-2 text-sm font-medium text-page hover:opacity-85">
              Rejouer avec les mêmes imprévus
            </button>
            <button type="button" onClick={() => recommencer(graine + 1)} className="rounded-full border border-line px-4 py-2 text-sm text-body hover:text-ink">
              Rejouer avec d&apos;autres imprévus
            </button>
          </div>
        </section>
      )}

      <Hypotheses h={h} />
    </div>
  );
}
