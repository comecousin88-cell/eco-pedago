/**
 * Détection des chiffres écrits en dur dans les textes du site. Un chiffre qui
 * décrit la situation actuelle doit être lu dans data/*.json (<Chiffre>,
 * <DateDonnee>) ou calculé à partir des données (<Calcul>, src/content/calculs.ts),
 * pour que tout le site se mette à jour en même temps.
 *
 * Restent permis, sans déclaration :
 * - les exemples chiffrés, dans un encadré <Exemple> ;
 * - les faits datés du passé : la phrase cite une année antérieure ou égale à ANNEE_HISTOIRE ;
 * - les repères des traités et le mandat de la BCE (3 % et 60 % du PIB, inflation de 2 %).
 * Tout autre chiffre doit être déclaré dans src/content/chiffres-fixes.ts, avec sa raison.
 */

/** Une phrase qui cite une année jusqu'à celle-ci raconte un fait passé, qui ne changera plus. */
export const ANNEE_HISTOIRE = 2024;

const UNITES = String.raw`(?:%|Md€|Mds?\s?€|milliards?|millions?|€|euros?|points? de base|points?|pb|fois)`;
const NOMBRE = String.raw`(?<![\w/.#-])(?:\d{1,3}(?:[   ]\d{3})+|\d+)(?:[,.]\d+)?`;
const MOTIF = new RegExp(`${NOMBRE}[ \\u202f\\u00a0]?${UNITES}(?![\\wÀ-ÿ])`, "g");

/** Texte lisible d'un fichier MDX : sans imports, exemples, expressions ni composants auto-fermants. */
export function prose(mdx: string): string {
  let t = mdx.replace(/^(import|export) .*$/gm, "");
  t = t.replace(/<Exemple[\s\S]*?<\/Exemple>/g, " ");
  t = t.replace(/<[A-Z][\w.]*(?:\s[^<>]*?)?\/>/g, " ");
  // Les expressions JavaScript calculent leurs valeurs : on les retire. Le texte des
  // éléments JSX passés en attribut (tient={<p>…</p>}) reste contrôlé.
  let precedent: string;
  do {
    precedent = t;
    t = t.replace(/\{[^{}<]*\}/g, " ");
  } while (t !== precedent);
  // Les éléments de liste et paragraphes HTML séparent des phrases.
  return t.replace(/<\/?(li|p|ul|ol|tr|td|th)\b[^>]*>/g, "\n\n");
}

/** Fin de phrase : point suivi d'un blanc, ligne vide ou cellule de tableau. */
const FIN_PHRASE = /[.!?;]\s|\n\s*\n|\|/g;

function phraseAutour(texte: string, debut: number, fin: number): string {
  let a = 0;
  let b = texte.length;
  for (const m of texte.matchAll(FIN_PHRASE)) {
    if (m.index < debut) a = m.index + 1;
    else if (m.index >= fin) {
      b = m.index;
      break;
    }
  }
  return texte.slice(a, b);
}

const REPERE_TRAITE = /^(3|60) ?%$/;
const CIBLE_BCE = /^2 ?%$/;

export interface ChiffreEnDur {
  texte: string;
  phrase: string;
}

/** Chiffres en dur d'un texte, hors exceptions générales. */
export function chiffresEnDur(mdx: string): ChiffreEnDur[] {
  const t = prose(mdx);
  const res: ChiffreEnDur[] = [];
  for (const m of t.matchAll(MOTIF)) {
    const texte = m[0].replace(/[  ]/g, " ");
    const phrase = phraseAutour(t, m.index, m.index + m[0].length).replace(/\s+/g, " ").trim();
    const annees = [...phrase.matchAll(/\b(1[6-9]\d\d|20\d\d)\b/g)].map((a) => Number(a[1]));
    if (annees.some((a) => a <= ANNEE_HISTOIRE)) continue;
    if (REPERE_TRAITE.test(texte) && /PIB|déficit|dette|repère|traité|Maastricht|procédure/i.test(phrase)) continue;
    if (CIBLE_BCE.test(texte) && /BCE|inflation|banque centrale|prix/i.test(phrase)) continue;
    res.push({ texte, phrase });
  }
  return res;
}
