/**
 * Progression étape par étape dans un module. Une section validée (lue) ou
 * passée (« Passer cette section ») reste accessible ; la section en cours
 * est la première ni validée ni passée ; les suivantes sont verrouillées.
 * Des sections cochées dans le désordre (ancienne logique) restent donc
 * validées, et la section en cours est la première non validée.
 */

export type EtatSection = "validee" | "passee" | "en-cours" | "verrouillee";

/** Ancre qui mène au bouton « J'ai compris » de la section en cours. */
export const ANCRE_TERMINER = "terminer";
/** Événement : faire défiler la page jusqu'à ce bouton et le mettre en évidence. */
export const EVENEMENT_TERMINER = "section:terminer";
export const MESSAGE_TERMINER = "Termine d’abord cette section pour passer à la suivante.";

export function etatsSections(hrefs: readonly string[], lues: readonly string[], passees: readonly string[]): EtatSection[] {
  const enCours = hrefs.find((h) => !lues.includes(h) && !passees.includes(h));
  return hrefs.map((h) => (lues.includes(h) ? "validee" : passees.includes(h) ? "passee" : h === enCours ? "en-cours" : "verrouillee"));
}

const sansBarre = (chemin: string) => chemin.replace(/\/+$/, "");

/**
 * Clic sur une section verrouillée. Sur la page de la section en cours, on
 * signale l'événement et on renvoie `true` (le lien ne navigue pas) ; sinon,
 * le lien mène à la section en cours, avec l'ancre qui déclenche le défilement.
 */
export function versSectionEnCours(enCours: string): boolean {
  if (sansBarre(window.location.pathname) !== sansBarre(enCours)) return false;
  window.dispatchEvent(new Event(EVENEMENT_TERMINER));
  return true;
}
