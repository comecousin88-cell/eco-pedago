/**
 * Ce qu'ajoute le mode de lecture « Approfondi » à un texte MDX : sections
 * « Pour aller plus loin », débats d'économistes, formules en bloc. Fonctions
 * pures, utilisées par la page d'introduction des modules et par les tests.
 */

export interface ContenuApprofondi {
  plusLoin: number;
  /** Questions des débats (<Debat question="…">). */
  debats: string[];
  /** Formules en bloc ($$ … $$). */
  formules: number;
}

export function analyserMdx(source: string): ContenuApprofondi {
  return {
    plusLoin: (source.match(/<PlusLoin\b/g) ?? []).length,
    debats: [...source.matchAll(/<Debat\b[^>]*?\bquestion="([^"]+)"/g)].map((m) => m[1]),
    formules: Math.floor((source.match(/\$\$/g) ?? []).length / 2),
  };
}

export const estVide = (c: ContenuApprofondi) => c.plusLoin + c.debats.length + c.formules === 0;
