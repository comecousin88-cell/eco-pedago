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

/** Liens vers d'autres sites (sources, originaux), sans les formulaires préremplis (« Signaler une erreur »). */
export function liensExternes(html: string, site = "eco-pedago.vercel.app"): string[] {
  const liens = new Set<string>();
  for (const m of html.matchAll(/\shref="(https?:\/\/[^"#]+)/g)) {
    const lien = m[1].replace(/&amp;/g, "&");
    const hote = new URL(lien).hostname;
    if (hote === site || /\/issues\/new\b/.test(lien)) continue;
    liens.add(lien);
  }
  return [...liens];
}

const accueil = (chemin: string) => /^\/((fr|en)\/?)?(index\.html?)?$/i.test(chemin);

/**
 * Verdict sur un lien externe, d'après la réponse reçue : cassé (page
 * introuvable, ou redirection vers la page d'accueil du site : la page visée
 * n'existe plus), avertissement (refus des robots, panne passagère) ou valide.
 */
export function verdictLien(demande: string, statut: number, urlFinale: string): { etat: "valide" | "casse" | "avertissement"; raison?: string } {
  if (statut === 404 || statut === 410) return { etat: "casse", raison: `page introuvable (HTTP ${statut})` };
  if (statut === 0) return { etat: "avertissement", raison: "site injoignable (délai dépassé ou erreur réseau)" };
  if (statut === 401 || statut === 403 || statut === 429) return { etat: "avertissement", raison: `accès refusé aux robots (HTTP ${statut}) : à vérifier dans un navigateur` };
  if (statut >= 500) return { etat: "avertissement", raison: `erreur du site (HTTP ${statut}), sans doute passagère` };
  if (statut >= 400) return { etat: "casse", raison: `erreur HTTP ${statut}` };
  const avant = new URL(demande);
  const apres = new URL(urlFinale);
  if (!accueil(avant.pathname) && accueil(apres.pathname)) return { etat: "casse", raison: `redirigé vers la page d'accueil (${apres.origin}${apres.pathname})` };
  return { etat: "valide" };
}
