"use client";

import { useReducer } from "react";
import { clesModifiees, reduireScenario, scenarioInitial, type Reglages } from "@/lib/scenario";

/**
 * État commun à tous les simulateurs et schémas interactifs : les valeurs de
 * référence (chiffres actuels de data/*.json, ou valeurs de départ d'un
 * exemple), les valeurs réglées, et la remise à zéro.
 *
 *   const s = useScenario({ taux: tauxReel, croissance: croissanceReelle });
 *   <BarreScenario scenario={s} />
 *   <Curseur valeur={s.valeurs.taux} reference={s.reference.taux} onChange={s.regler("taux")} … />
 */
export function useScenario<T extends Reglages>(reference: T) {
  const [etat, dispatch] = useReducer(reduireScenario<T>, reference, scenarioInitial);
  const modifiees = clesModifiees(etat);
  return {
    valeurs: etat.valeurs,
    reference: etat.reference,
    /** Fonction de rappel pour un réglage : s.regler("taux")(3.5). */
    regler:
      <K extends keyof T>(cle: K) =>
      (valeur: T[K]) =>
        dispatch({ type: "modifier", cle, valeur }),
    remplacer: (valeurs: Partial<T>) => dispatch({ type: "remplacer", valeurs }),
    reinitialiser: () => dispatch({ type: "reinitialiser" }),
    modifie: modifiees.length > 0,
    estModifiee: (cle: keyof T) => modifiees.includes(cle),
  };
}

export type ScenarioSimu = ReturnType<typeof useScenario<Reglages>>;

/**
 * Bandeau commun : mention « Scénario modifié » quand un réglage diffère des
 * chiffres actuels, et bouton « Revenir aux chiffres actuels ». `libelleReference`
 * permet de dire « valeurs de départ » pour un exemple illustratif.
 */
export function BarreScenario({
  scenario,
  libelleReference = "chiffres actuels",
}: {
  scenario: { modifie: boolean; reinitialiser: () => void };
  libelleReference?: string;
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-2" data-export-ignore="true">
      <p aria-live="polite" className="text-sm">
        {scenario.modifie ? (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-warn bg-warn-soft px-2.5 py-0.5 font-medium text-warn">
            <span aria-hidden="true">●</span> Scénario modifié
          </span>
        ) : (
          <span className="text-muted">Réglé sur les {libelleReference}.</span>
        )}
      </p>
      <button
        type="button"
        onClick={scenario.reinitialiser}
        disabled={!scenario.modifie}
        className="rounded-full border border-line px-3 py-1.5 text-sm font-medium text-body hover:border-ink hover:text-ink disabled:cursor-default disabled:opacity-50 disabled:hover:border-line disabled:hover:text-body"
      >
        Revenir aux {libelleReference}
      </button>
    </div>
  );
}

/** Mention discrète « modifié » à côté d'un réglage qui n'est pas un curseur (boutons, choix). */
export function MarqueModifie({ actif }: { actif: boolean }) {
  return actif ? <span data-modifie className="text-xs font-medium text-warn">modifié</span> : null;
}
