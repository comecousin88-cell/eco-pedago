/**
 * Règles de lisibilité des textes MDX (fiches et modules), vérifiées par les
 * tests : sources jamais entre parenthèses, termes du glossaire en infobulle,
 * paragraphes courts dans ce que lit le mode Simple.
 */

/**
 * Texte lisible d'un MDX : sans les imports, sans les chiffres (<Chiffre>,
 * <Calcul>, <DateDonnee>, dont l'unité n'est pas un terme à expliquer), sans
 * les attributs (identifiants, résumés de figures, noms de propriétés) ni les
 * questions de quiz, et sans les balises.
 */
export function texteMdx(mdx: string): string {
  return mdx
    .replace(/^import .*$/gm, " ")
    .replace(/<(?:Chiffre|Calcul|DateDonnee)\b[^>]*\/>/g, " ")
    .replace(/questions=\{\[[\s\S]*?\]\}\s*\/>/g, " ")
    .replace(/\b[a-zA-Z]+=(?:"[^"]*"|\{`[\s\S]*?`\}|\{\[(?:"[^"]*",?\s*)*\]\})/g, " ")
    .replace(/\b[a-zA-Z]+=\{/g, " ")
    .replace(/<\/?[A-Za-z][A-Za-z0-9]*|\/?>|<\/?>|[{}]/g, " ")
    .replace(/\]\([^)]*\)/g, " ");
}

/** Une source écrite entre parenthèses : « (Insee) », « (calcul : Banque de France) », « (source : rapport du COR) »… */
export const SOURCE_ENTRE_PARENTHESES = /\((?:[^()]*?)(?<![\p{L}])(?:calcul|source|Fipeco|Insee|Eurostat|Banque de France|Cour des comptes|Sénat)(?![\p{L}])[^()]*\)/iu;

/** Au-delà, un paragraphe dépasse trois lignes environ. */
export const LONGUEUR_PARAGRAPHE_MAX = 260;

/** Texte visible d'un paragraphe MDX, un chiffre comptant pour huit caractères. */
export function longueurVisible(p: string): number {
  return p
    .replace(/<(?:Chiffre|Calcul|DateDonnee)\b[^>]*\/>/g, "XXXXXXXX")
    .replace(/<[^>]+>/g, "")
    .replace(/\*\*/g, "")
    .replace(/\s+/g, " ")
    .trim().length;
}

/** Paragraphes de texte trop longs dans ce que lit le mode Simple (« L'essentiel », « Le mécanisme »). */
export function paragraphesTropLongs(mdx: string): string[] {
  const trop: string[] = [];
  for (const [, , bloc] of mdx.matchAll(/<(Essentiel|Mecanisme)>([\s\S]*?)<\/\1>/g)) {
    for (const p of bloc.split(/\n[ \t]*\n/)) {
      const s = p.trim();
      if (!s || /^(-|\||#|>|\d+\.)/.test(s)) continue;
      if (s.startsWith("<") && !/^<(?:Chiffre|Calcul|DateDonnee|Terme|strong|em)\b/.test(s)) continue;
      if (longueurVisible(s) > LONGUEUR_PARAGRAPHE_MAX) trop.push(s.slice(0, 80));
    }
  }
  return trop;
}
