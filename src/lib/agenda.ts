import agendaJson from "../../data/agenda.json";
import type { Agenda } from "./echeances.ts";

/**
 * Agenda des échéances (data/agenda.json) : notes des agences, budget, BCE,
 * publications de l'Insee et du COR. Utilisé par le tableau de bord ; la tâche
 * de veille (scripts/veille-agenda.ts) en compare les dates aux calendriers
 * officiels.
 */
export * from "./echeances.ts";

export const agenda = agendaJson as Agenda;
