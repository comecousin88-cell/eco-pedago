"use client";

import { CartesianGrid, Line, LineChart, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { AXE, GRILLE, Infobulle, Legende } from "@/components/graphiques/commun";
import { getSerie, getValeur } from "@/lib/data";
import { soldePrimaireStabilisant, tauxApparent, trajectoireDette, trajectoireTauxApparent } from "@/lib/economics";
import { formatNombre } from "@/lib/format";
import { BoutonSimu, Curseur } from "./Curseur";
import { BarreScenario, MarqueModifie, useScenario } from "./Scenario";

/**
 * Simulateur de l'effet boule de neige : trajectoire de la dette/PIB selon le
 * taux d'intérêt moyen (r), la croissance nominale (g) et le solde primaire.
 * Valeurs de départ tirées des données de la dernière année connue.
 */
export function BouleDeNeige() {
  const dettes = getSerie("dette.historique-md").serie;
  const ratios = getSerie("dette.historique-pib").serie;
  const fin = dettes[dettes.length - 1];
  const interets = getValeur("fp.interets");
  const pib = getValeur("macro.pib");
  const deficit = getValeur("deficit.montant");
  const croissance = getValeur("macro.croissance-valeur");
  const oat = getValeur("marches.taux10-france-dernier");
  const maturite = getValeur("aft.maturite-moyenne");

  const d0 = ratios[ratios.length - 1].y / 100;
  const r0 = tauxApparent(interets.valeur, dettes[dettes.length - 2].y, fin.y) * 100;
  const sp0 = ((-deficit.valeur + interets.valeur) / pib.valeur) * 100;
  const depart = {
    r: Math.round(r0 * 10) / 10,
    g: croissance.valeur,
    sp: Math.round(sp0 * 10) / 10,
  };

  const s = useScenario({ r: depart.r, g: depart.g, sp: depart.sp, horizon: 20, progressif: false as boolean });

  const r = s.valeurs.r;

  const g = s.valeurs.g;

  const sp = s.valeurs.sp;

  const horizon = s.valeurs.horizon;

  const progressif = s.valeurs.progressif;

  const taux = progressif ? trajectoireTauxApparent(r / 100, oat.valeur / 100, maturite.valeur, horizon) : r / 100;
  // Calculs légers (au plus 30 années) : refaits à chaque rendu.
  const points = trajectoireDette({ detteInitiale: d0, taux, croissance: g / 100, soldePrimaire: sp / 100, annees: horizon });
  const reference = trajectoireDette({
    detteInitiale: d0,
    taux: depart.r / 100,
    croissance: depart.g / 100,
    soldePrimaire: depart.sp / 100,
    annees: horizon,
  });
  const annee0 = Number(fin.x);
  const donnees = points.map((p, i) => ({
    annee: annee0 + p.annee,
    dette: Math.round(p.dette * 1000) / 10,
    reference: Math.round(reference[i].dette * 1000) / 10,
  }));
  const derniere = donnees[donnees.length - 1];
  // Avec l'option « taux de marché », c'est le taux atteint à terme qui compte.
  const rTerme = progressif ? oat.valeur : r;
  const spStable = soldePrimaireStabilisant(d0, rTerme / 100, g / 100) * 100;
  const ecartRG = rTerme - g;
  const sensRG = ecartRG > 0.05 ? "contre" : ecartRG < -0.05 ? "pour" : "neutre";

  function appliquer(nouveau: { r?: number; g?: number; sp?: number }, garderProgressif = false) {
    if (!garderProgressif) s.regler("progressif")(false);
    if (nouveau.r !== undefined) s.regler("r")(Math.round(nouveau.r * 10) / 10);
    if (nouveau.g !== undefined) s.regler("g")(Math.round(nouveau.g * 10) / 10);
    // Le solde stabilisant est gardé exact (pas d'arrondi), pour que la dette reste vraiment stable.
    if (nouveau.sp !== undefined) s.regler("sp")(nouveau.sp);
  }

  return (
    <div className="space-y-5">
      <BarreScenario scenario={s} />
      <div className="grid gap-5 sm:grid-cols-3">
        <Curseur
          libelle="Taux d'intérêt moyen (r)"
          valeur={r}
          reference={s.reference.r}
          affichageReference={`${formatNombre(s.reference.r, 1)} %`}
          min={0}
          max={7}
          pas={0.1}
          onChange={(v) => {
            s.regler("r")(v);
            s.regler("progressif")(false);
          }}
          affichage={`${formatNombre(r, 1)} %`}
          aide={`Taux apparent ${fin.x} : ${formatNombre(r0, 2)} %`}
        />
        <Curseur
          libelle="Croissance nominale (g)"
          valeur={g}
          reference={s.reference.g}
          affichageReference={`${formatNombre(s.reference.g, 1)} %`}
          min={-2}
          max={7}
          pas={0.1}
          onChange={s.regler("g")}
          affichage={`${formatNombre(g, 1)} %`}
          aide={`${croissance.date} : ${formatNombre(croissance.valeur, 1)} % (volume + prix)`}
        />
        <Curseur
          libelle="Solde primaire (% du PIB)"
          valeur={sp}
          reference={s.reference.sp}
          affichageReference={`${s.reference.sp > 0 ? "+" : ""}${formatNombre(s.reference.sp, 1)} %`}
          min={-6}
          max={4}
          pas={0.1}
          onChange={s.regler("sp")}
          affichage={`${sp > 0 ? "+" : ""}${formatNombre(sp, 1)} %`}
          aide={`${deficit.date} : ${formatNombre(sp0, 1)} % (négatif = déficit hors intérêts)`}
        />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm text-muted">Horizon :</span>
        {[10, 20, 30].map((h) => (
          <BoutonSimu key={h} onClick={() => s.regler("horizon")(h)} actif={horizon === h}>
            {h} ans
          </BoutonSimu>
        ))}
        <MarqueModifie actif={s.estModifiee("horizon")} />
      </div>

      <div className="flex flex-wrap gap-2">
        <BoutonSimu onClick={() => appliquer({ sp: spStable }, true)}>Scénario « stabiliser la dette »</BoutonSimu>
        <BoutonSimu onClick={() => appliquer({ r: depart.r + 1 })}>Les taux montent de 1 point</BoutonSimu>
        <BoutonSimu onClick={() => appliquer({ g: depart.g - 1 })}>La croissance ralentit de 1 point</BoutonSimu>
        <BoutonSimu
          onClick={() => {
            s.regler("r")(depart.r);
            s.regler("progressif")(!progressif);
          }}
          actif={progressif}
        >
          Le taux moyen rejoint peu à peu le taux de marché ({formatNombre(oat.valeur, 2)} %)
        </BoutonSimu>
        <MarqueModifie actif={s.estModifiee("progressif")} />
      </div>

      <Legende
        elements={[
          { libelle: "Votre scénario", couleur: "var(--accent)" },
          { libelle: `Si rien ne change par rapport à ${fin.x}`, couleur: "var(--line-strong)" },
        ]}
      />
      <div className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={donnees} margin={{ top: 8, right: 12, bottom: 0, left: 0 }}>
            <CartesianGrid {...GRILLE} />
            <XAxis dataKey="annee" {...AXE} interval={horizon > 10 ? 4 : 1} />
            <YAxis {...AXE} width={44} domain={["auto", "auto"]} tickFormatter={(v) => `${v} %`} />
            <ReferenceLine y={donnees[0].dette} stroke="var(--muted)" strokeDasharray="4 4" />
            <Tooltip
              content={({ active, payload, label }) =>
                active && payload?.length ? (
                  <Infobulle
                    titre={`Fin ${label}`}
                    lignes={[
                      { libelle: "Votre scénario", couleur: "var(--accent)", valeur: `${formatNombre(Number(payload[0].payload.dette), 1)} % du PIB` },
                      { libelle: "Sans changement", couleur: "var(--line-strong)", valeur: `${formatNombre(Number(payload[0].payload.reference), 1)} % du PIB` },
                    ]}
                  />
                ) : null
              }
            />
            <Line type="monotone" dataKey="reference" stroke="var(--line-strong)" strokeWidth={2} strokeDasharray="5 4" dot={false} isAnimationActive={false} />
            <Line type="monotone" dataKey="dette" stroke="var(--accent)" strokeWidth={2.5} dot={false} isAnimationActive={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <dl className="grid gap-3 sm:grid-cols-3" aria-live="polite">
        <div className="rounded-xl bg-subtle p-3">
          <dt className="text-sm text-muted">Dette/PIB en {derniere.annee}</dt>
          <dd className="font-serif text-2xl font-semibold text-ink">{formatNombre(derniere.dette, 1)} %</dd>
          <dd className="text-sm text-muted">
            départ : {formatNombre(donnees[0].dette, 1)} % fin {fin.x}
          </dd>
        </div>
        <div className="rounded-xl bg-subtle p-3">
          <dt className="text-sm text-muted">Écart r − g{progressif ? " à terme" : ""}</dt>
          <dd className={`font-serif text-2xl font-semibold ${sensRG === "contre" ? "text-bad" : sensRG === "pour" ? "text-ok" : "text-ink"}`}>
            {ecartRG > 0 ? "+" : ""}
            {formatNombre(ecartRG, 1)} point{Math.abs(ecartRG) >= 2 ? "s" : ""}
          </dd>
          <dd className="text-sm text-muted">
            {sensRG === "contre"
              ? "la boule de neige joue contre la dette"
              : sensRG === "pour"
                ? "la croissance aide à réduire le ratio"
                : "intérêts et croissance se compensent"}
          </dd>
        </div>
        <div className="rounded-xl bg-accent-soft p-3">
          <dt className="text-sm text-muted">Solde primaire qui stabiliserait la dette{progressif ? " à terme" : ""}</dt>
          <dd className="font-serif text-2xl font-semibold text-ink">
            {spStable > 0 ? "+" : ""}
            {formatNombre(spStable, 1)} % du PIB
          </dd>
          <dd className="text-sm text-muted">soit {formatNombre(Math.abs(((spStable - sp) / 100) * pib.valeur))} Md€ {spStable >= sp ? "d'effort" : "de marge"} par rapport à votre réglage</dd>
        </div>
      </dl>
      <p className="text-xs text-muted">
        Modèle simplifié : r, g et le solde primaire sont supposés constants (sauf l&apos;option « taux de marché »), et
        indépendants les uns des autres. En réalité, une baisse rapide du déficit peut ralentir la croissance, et une
        dette qui s&apos;envole peut faire monter les taux.
      </p>
    </div>
  );
}
