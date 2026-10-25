/** Adresse lisible d'une page de « L'actu ». Fonction pure, sans import (utilisée aussi par les scripts). */

/** « Revue de la note de la France par Moody's » → « revue-de-la-note-de-la-france-par-moody-s ». */
export function slugifier(texte: string, max = 80): string {
  const s = texte
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/œ/g, "oe")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  if (s.length <= max) return s;
  const coupe = s.slice(0, max);
  return coupe.slice(0, coupe.lastIndexOf("-") > 20 ? coupe.lastIndexOf("-") : max);
}
