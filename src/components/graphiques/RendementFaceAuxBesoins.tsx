"use client";

import { Curseur } from "@/components/simulators/Curseur";
import { getSerie, getValeur } from "@/lib/data";
import { deficitStabilisant, effortStabilisation } from "@/lib/economics";
import { formatNombre } from "@/lib/format";
import { VueTableau } from "./commun";
import { BarreScenario, useScenario } from "@/components/simulators/Scenario";

/**
 * Le rendement estimé d'un impôt sur les très grandes fortunes (fourchette
 * basse / haute) face à trois besoins : l'effort pour stabiliser la dette,
 * le déficit public et un programme de dépenses (hypothèse d'illustration).
 * Tous les montants viennent de data/*.json ; l'effort est calculé à partir
 * d'une croissance nominale réglable (par défaut, celle de la dernière année).
 */
export function RendementFaceAuxBesoins() {
  const rendements = getSerie("prop.impot-plancher-rendements").serie;
  const bas = rendements.find((p) => p.x === "Estimation critique, impôt sur les sociétés déduit (bas)")!.y;
  const haut = rendements.find((p) => p.x === "Estimation de ses promoteurs (haut)")!.y;
  const deficit = getValeur("deficit.montant");
  const dette = getValeur("dette.fin-annee-pib");
  const croissanceObservee = getValeur("macro.croissance-valeur");
  const s = useScenario({ croissance: croissanceObservee.valeur });
  const croissance = s.valeurs.croissance;
  const stabilisant = deficitStabilisant(dette.valeur, croissance / 100);
  const effort = effortStabilisation(getValeur("deficit.ratio-pib").valeur, stabilisant, getValeur("macro.pib").valeur);
  const programme = getValeur("prop.programme-depenses");

  const besoins = [
    {
      libelle: `Effort pour stabiliser la dette (${deficit.date})`,
      valeur: effort,
      aide: `calculé avec ${formatNombre(croissance, 1)} % de croissance nominale : déficit moins ${formatNombre(stabilisant, 1)} points de PIB`,
    },
    { libelle: `Déficit public (${deficit.date})`, valeur: deficit.valeur },
    { libelle: "Programme de dépenses nouvelles", valeur: programme.valeur, aide: "hypothèse d'illustration" },
  ];
  // Échelle fixe : seule la barre de l'effort bouge avec le curseur.
  const max = Math.max(haut, deficit.valeur, programme.valeur);
  const pct = (v: number) => (v / max) * 100;

  return (
    <div>
      <BarreScenario scenario={s} />
      <div className="mb-6 rounded-xl bg-subtle p-4">
        <Curseur
          libelle="Croissance nominale retenue pour stabiliser la dette"
          valeur={croissance}
          reference={s.reference.croissance}
          affichageReference={`${formatNombre(s.reference.croissance, 1)} %`}
          min={0}
          max={5}
          pas={0.1}
          onChange={s.regler("croissance")}
          affichage={`${formatNombre(croissance, 1)} %`}
          aide={`Croissance du PIB en valeur (volume + prix) : ${formatNombre(croissanceObservee.valeur, 1)} % en ${croissanceObservee.date} selon l'Insee. Avec une dette de ${formatNombre(dette.valeur, 1)} % du PIB, le déficit qui la stabilise vaut dette × g / (1 + g).`}
        />
      </div>
      <ul className="space-y-4">
        <li>
          <div className="flex items-baseline justify-between gap-3 text-sm">
            <span className="font-semibold text-ink">Rendement estimé de l&apos;impôt, par an</span>
            <span className="shrink-0 font-semibold text-ink tabular-nums">
              {formatNombre(bas, 0)} à {formatNombre(haut, 0)} Md€
            </span>
          </div>
          <div className="relative mt-1 h-4 rounded-full bg-subtle" aria-hidden="true">
            {/* La fourchette : pleine jusqu'au bas, claire jusqu'au haut. */}
            <span
              className="absolute top-0 left-0 h-full rounded-full"
              style={{ width: `${pct(haut)}%`, background: "color-mix(in srgb, var(--accent) 40%, transparent)" }}
            />
            <span
              className="absolute top-0 left-0 h-full rounded-full"
              style={{ width: `${Math.max(pct(bas), 0.8)}%`, background: "var(--accent)" }}
            />
            <span className="absolute top-[-3px] bottom-[-3px] w-0.5 rounded bg-accent" style={{ left: `${pct(haut)}%` }} />
          </div>
          <p className="mt-1 text-xs text-muted">
            Fourchette basse : calcul de l&apos;économiste Antoine Levy, cité par le rapport du Sénat, qui déduit
            l&apos;impôt sur les sociétés déjà payé par les entreprises détenues. Fourchette haute : estimation de ses
            promoteurs, avant départs et optimisation.
          </p>
        </li>
        {besoins.map((b) => (
          <li key={b.libelle}>
            <div className="flex items-baseline justify-between gap-3 text-sm">
              <span className="text-body">
                {b.libelle}
                {b.aide && <span className="text-muted"> · {b.aide}</span>}
              </span>
              <span className="shrink-0 font-semibold text-ink tabular-nums">{formatNombre(b.valeur, 0)} Md€</span>
            </div>
            <div className="relative mt-1 h-4 rounded-full bg-subtle" aria-hidden="true">
              <span className="absolute top-0 left-0 h-full rounded-full bg-line-strong" style={{ width: `${pct(b.valeur)}%` }} />
            </div>
            <p className="mt-1 text-xs text-muted">
              La fourchette haute en couvre {formatNombre((haut / b.valeur) * 100, 0)} %, la basse{" "}
              {formatNombre((bas / b.valeur) * 100, 0)} %.
            </p>
          </li>
        ))}
      </ul>
      <VueTableau
        legende="Rendement estimé d'un impôt sur les très grandes fortunes et besoins de financement, en Md€ par an"
        colonnes={["", "Md€ par an"]}
        lignes={[
          ["Rendement estimé, fourchette basse", bas],
          ["Rendement estimé, fourchette haute", haut],
          ...besoins.map((b) => [b.libelle, Math.round(b.valeur * 10) / 10]),
        ]}
      />
    </div>
  );
}
