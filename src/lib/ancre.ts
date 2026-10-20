/**
 * Identifiant d'ancre à partir d'un titre : « 4. Ce que disent les économistes »
 * → « ce-que-disent-les-economistes » (numéro, accents et ponctuation retirés).
 */
export function ancre(titre: string): string {
  return titre
    .replace(/^\d+\.\s*/, "")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

/** Texte brut d'un contenu React simple (chaînes et nombres, éventuellement imbriqués). */
export function texteDe(noeud: unknown): string {
  if (typeof noeud === "string" || typeof noeud === "number") return String(noeud);
  if (Array.isArray(noeud)) return noeud.map(texteDe).join("");
  if (noeud && typeof noeud === "object" && "props" in noeud) {
    return texteDe((noeud as { props: { children?: unknown } }).props.children);
  }
  return "";
}
