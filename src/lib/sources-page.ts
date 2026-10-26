import { calculs } from "@/content/calculs";
import { getDonnee, type Donnee } from "./data";

/**
 * Les sources d'une page, tirées de son texte MDX : chaque chiffre
 * (<Chiffre>, <DateDonnee>), chaque calcul (<Calcul>, avec ses données) et
 * chaque figure (donnees={[…]}) cité. Regroupées par source, dans l'ordre de
 * première apparition, pour la liste « Sources » en bas de page.
 */

export interface SourcePage {
  nom: string;
  url?: string;
  /** Les données citées qui viennent de cette source. */
  donnees: Donnee[];
}

/** Identifiants de données cités dans un texte MDX, dans l'ordre, sans doublon. */
export function donneesCitees(mdx: string): string[] {
  const ids: string[] = [];
  const motifs = [
    /<(?:Chiffre|DateDonnee|Calcul)\b[^>]*?\bid="([^"]+)"/g,
    /texte(?:Donnee|Calcul)\("([^"]+)"/g,
    /donnees=\{\[([^\]]*)\]\}/g,
  ];
  const trouves: { position: number; id: string }[] = [];
  for (const motif of motifs) {
    for (const m of mdx.matchAll(motif)) {
      const liste = m[1].includes('"') ? [...m[1].matchAll(/"([^"]+)"/g)].map((x) => x[1]) : [m[1]];
      for (const id of liste) trouves.push({ position: m.index ?? 0, id });
    }
  }
  trouves.sort((a, b) => a.position - b.position);
  for (const { id } of trouves) {
    const dependances = id.startsWith("calc.") ? (calculs[id]?.donnees ?? []) : [id];
    for (const d of dependances) if (!ids.includes(d)) ids.push(d);
  }
  return ids;
}

export function sourcesPage(mdx: string): SourcePage[] {
  const sources: SourcePage[] = [];
  for (const id of donneesCitees(mdx)) {
    const d = getDonnee(id);
    const existante = sources.find((s) => s.nom === d.source.nom && s.url === d.source.url);
    if (existante) existante.donnees.push(d);
    else sources.push({ nom: d.source.nom, url: d.source.url, donnees: [d] });
  }
  return sources;
}
