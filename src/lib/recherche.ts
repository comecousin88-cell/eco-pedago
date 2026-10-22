/**
 * Recherche du site : types et fonctions pures, utilisables dans le navigateur
 * sans charger les contenus (l'index est construit par src/content/recherche.ts).
 */

export type TypeResultat = "Page" | "Module" | "Section" | "Fiche" | "Idée reçue" | "Glossaire" | "Simulateur";

export interface EntreeRecherche {
  type: TypeResultat;
  titre: string;
  /** Texte court affiché sous le titre. */
  extrait: string;
  href: string;
  /** Mots supplémentaires pris en compte (thème, module parent…). */
  motsCles?: string;
}

/** Minuscules, sans accents ni ponctuation : « Dette » trouve « dette », « Écart » trouve « ecart ». */
export function normaliser(texte: string): string {
  return texte
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9%]+/g, " ")
    .trim();
}

/**
 * Résultats classés : tous les mots cherchés doivent figurer ; un mot trouvé
 * dans le titre compte plus que dans l'extrait ou les mots-clés.
 */
export function rechercher(index: EntreeRecherche[], requete: string, max = 20): EntreeRecherche[] {
  const mots = normaliser(requete).split(" ").filter((m) => m.length > 1 || /\d/.test(m));
  if (!mots.length) return [];
  const notes = index.flatMap((e) => {
    const titre = normaliser(e.titre);
    const reste = normaliser(`${e.extrait} ${e.motsCles ?? ""}`);
    let note = 0;
    for (const m of mots) {
      if (titre.split(" ").some((w) => w.startsWith(m))) note += 3;
      else if (titre.includes(m)) note += 2;
      else if (reste.includes(m)) note += 1;
      else return [];
    }
    if (titre.startsWith(mots[0])) note += 1;
    return [{ e, note }];
  });
  return notes.sort((a, b) => b.note - a.note || a.e.titre.length - b.e.titre.length).slice(0, max).map((n) => n.e);
}
