/**
 * État d'un simulateur : les valeurs de référence (les chiffres actuels, tirés
 * de data/*.json, ou les valeurs de départ d'un exemple) et les valeurs
 * réglées par le lecteur. Logique pure, testée ; le hook useScenario
 * (components/simulators/Scenario.tsx) l'utilise dans tous les simulateurs.
 */

export type ValeurReglage = number | string | boolean;
export type Reglages = Record<string, ValeurReglage>;

export interface EtatScenario<T extends Reglages> {
  reference: T;
  valeurs: T;
}

export type ActionScenario<T extends Reglages> =
  | { type: "modifier"; cle: keyof T; valeur: T[keyof T] }
  | { type: "remplacer"; valeurs: Partial<T> }
  | { type: "reinitialiser" };

export function scenarioInitial<T extends Reglages>(reference: T): EtatScenario<T> {
  return { reference, valeurs: { ...reference } };
}

export function reduireScenario<T extends Reglages>(etat: EtatScenario<T>, action: ActionScenario<T>): EtatScenario<T> {
  switch (action.type) {
    case "modifier":
      return { ...etat, valeurs: { ...etat.valeurs, [action.cle]: action.valeur } };
    case "remplacer":
      return { ...etat, valeurs: { ...etat.valeurs, ...action.valeurs } };
    case "reinitialiser":
      return { ...etat, valeurs: { ...etat.reference } };
  }
}

/** Deux nombres sont égaux à 1e-9 près (les curseurs produisent parfois 0,1 + 0,2). */
function egal(a: ValeurReglage, b: ValeurReglage): boolean {
  if (typeof a === "number" && typeof b === "number") return Math.abs(a - b) < 1e-9;
  return a === b;
}

/** Réglages dont la valeur diffère de la référence. */
export function clesModifiees<T extends Reglages>(etat: EtatScenario<T>): (keyof T)[] {
  return (Object.keys(etat.reference) as (keyof T)[]).filter((k) => !egal(etat.valeurs[k], etat.reference[k]));
}

export function estModifie<T extends Reglages>(etat: EtatScenario<T>): boolean {
  return clesModifiees(etat).length > 0;
}
