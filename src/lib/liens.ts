/**
 * Liens internes cassés du site construit (dossier out/) : chaque lien
 * « /chemin/ » d'une page doit mener à une page ou à un fichier qui existe.
 * Fonctions pures, sans import : utilisées par scripts/verifier-liens.ts
 * (lancé après chaque construction) et testées avec Vitest.
 */

/** Liens internes d'une page HTML (href et src commençant par « / »), sans ancre ni paramètres. */
export function liensInternes(html: string): string[] {
  const liens = new Set<string>();
  for (const m of html.matchAll(/\s(?:href|src)="(\/[^"#?]*)/g)) {
    const lien = m[1].replace(/&amp;/g, "&");
    if (lien.startsWith("//") || lien.startsWith("/_next/")) continue;
    liens.add(decodeURIComponent(lien));
  }
  return [...liens];
}

/** Le lien mène-t-il à une page ou à un fichier présent dans la liste des fichiers construits ? */
export function existe(lien: string, fichiers: Set<string>): boolean {
  const sansSlash = lien.replace(/^\/+|\/+$/g, "");
  if (sansSlash === "") return fichiers.has("index.html");
  return fichiers.has(`${sansSlash}/index.html`) || fichiers.has(sansSlash) || fichiers.has(`${sansSlash}.html`);
}

/** Liens cassés : « page → lien ». `pages` associe le chemin de chaque fichier HTML à son contenu. */
export function liensCasses(pages: Map<string, string>, fichiers: Set<string>): string[] {
  const casses: string[] = [];
  for (const [page, html] of pages) {
    for (const lien of liensInternes(html)) if (!existe(lien, fichiers)) casses.push(`${page} → ${lien}`);
  }
  return casses.sort();
}
