/**
 * Flux d'actualités des sources officielles (RSS) : lecture, tri par sujet et
 * page du site qui explique le sujet. Fonctions pures, sans import : utilisées
 * par scripts/maj-actu.ts (Node) et testées avec Vitest.
 */

export interface ItemRss {
  titre: string;
  lien: string;
  /** Date ISO (AAAA-MM-JJTHH:MM:SSZ). */
  date: string;
  resume: string;
}

export interface SourceFlux {
  id: "insee" | "bce" | "cour-des-comptes";
  nom: string;
  url: string;
  /** Garde-t-on cet élément avant même de regarder le sujet ? (par exemple : communiqués seulement). */
  garder?: (item: ItemRss) => boolean;
}

export const SOURCES_FLUX: SourceFlux[] = [
  { id: "insee", nom: "Insee", url: "https://www.insee.fr/fr/flux/1" },
  {
    id: "bce",
    nom: "Banque centrale européenne",
    url: "https://www.ecb.europa.eu/rss/press.html",
    // Communiqués et conférences de presse ; pas les discours ni les entretiens, trop nombreux.
    garder: (i) => /\/press\/(pr|pressconf)\//.test(i.lien),
  },
  { id: "cour-des-comptes", nom: "Cour des comptes", url: "https://www.ccomptes.fr/fr/rss/publications" },
];

export interface EntreeFlux extends ItemRss {
  id: string;
  source: SourceFlux["id"];
  /** Page du site qui explique le sujet. */
  page: string;
  sujet: string;
  important: boolean;
}

const entites: Record<string, string> = { amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: " " };

/** Texte brut d'un champ RSS : CDATA, balises HTML et entités retirées. */
export function texteBrut(s: string): string {
  return s
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .replace(/&(amp|lt|gt|quot|apos|nbsp);/g, (_, e: string) => entites[e])
    .replace(/&#(\d+);/g, (_, n: string) => String.fromCharCode(Number(n)))
    .replace(/<[^>]+>/g, " ")
    .replace(/&(amp|lt|gt|quot|apos|nbsp);/g, (_, e: string) => entites[e])
    .replace(/\s+/g, " ")
    .trim();
}

/** Éléments d'un flux RSS 2.0, dans l'ordre du flux. */
export function lireRss(xml: string): ItemRss[] {
  const items: ItemRss[] = [];
  for (const m of xml.matchAll(/<item\b[^>]*>([\s\S]*?)<\/item>/g)) {
    const champ = (nom: string) => {
      const r = new RegExp(`<${nom}\\b[^>]*>([\\s\\S]*?)</${nom}>`).exec(m[1]);
      return r ? texteBrut(r[1]) : "";
    };
    const titre = champ("title");
    const lien = champ("link").replace(/([^:])\/\/+/g, "$1/");
    const brute = champ("pubDate") || champ("dc:date");
    const t = Date.parse(brute);
    if (!titre || !lien || Number.isNaN(t)) continue;
    items.push({ titre, lien, date: new Date(t).toISOString().replace(/\.\d{3}Z$/, "Z"), resume: champ("description").slice(0, 400) });
  }
  return items;
}

const sansAccents = (s: string) =>
  s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase();

/** Sujets suivis, dans l'ordre de priorité : le premier qui correspond donne la page du site. */
export const SUJETS: { sujet: string; motif: RegExp; page: string; important?: RegExp }[] = [
  {
    sujet: "Politique monétaire",
    motif: /politique monetaire|monetary policy|taux directeurs?|key ecb interest|interest rates/,
    page: "/modules/banque-centrale/bce-eurosysteme/",
    important: /monetary policy decisions|decisions de politique monetaire/,
  },
  {
    sujet: "Dette et déficit",
    motif: /dette (publique|de maastricht|trimestrielle)|deficit public|finances publiques|administrations publiques|comptes publics/,
    page: "/modules/deficit-et-dette/",
    important: /dette (publique|de maastricht|trimestrielle)|deficit public|situation et (les )?perspectives des finances publiques|comptes nationaux des administrations publiques/,
  },
  { sujet: "Budget", motif: /loi de finances|budget de l.etat|plfss|securite sociale|execution du budget|budget de l etat/, page: "/modules/deficit-et-dette/soldes/" },
  { sujet: "Retraites", motif: /retraite|pension/, page: "/modules/retraites/" },
  { sujet: "Impôts", motif: /impot|prelevements obligatoires|recettes fiscales|tva|fiscalite/, page: "/modules/fiscalite/" },
  { sujet: "Inflation", motif: /inflation|prix a la consommation|consumer prices?|hicp|ipch/, page: "/modules/les-bases/inflation-taux-reels/" },
  { sujet: "Croissance", motif: /produit interieur brut|\bpib\b|comptes nationaux trimestriels|croissance de l.economie|\bgdp\b/, page: "/modules/les-bases/pib/" },
  { sujet: "Chômage", motif: /taux de chomage|unemployment/, page: "/tableau-de-bord/" },
  { sujet: "Europe", motif: /zone euro|pacte de stabilite|regles budgetaires europeennes|euro area/, page: "/modules/cadre-europeen/" },
];

/** Identifiant stable d'un élément (source + empreinte courte du lien). */
export function idFlux(source: string, lien: string): string {
  let h = 0x811c9dc5;
  for (const c of new TextEncoder().encode(lien)) h = Math.imul(h ^ c, 0x01000193);
  return `${source}-${(h >>> 0).toString(16).padStart(8, "0")}`;
}

/** Tableaux de données mis à jour en continu, qui ne sont pas des actualités. */
const ECARTES = /tableau de bord de l.economie francaise|taux de chomage localises|^comptes nationaux$|series longues/;

/** Garde les éléments qui parlent d'un sujet suivi, avec la page du site qui l'explique. */
export function trierFlux(source: SourceFlux, items: ItemRss[]): EntreeFlux[] {
  return items.flatMap((i) => {
    if (source.garder && !source.garder(i)) return [];
    const texte = sansAccents(`${i.titre} ${i.resume}`);
    const titre = sansAccents(i.titre);
    if (ECARTES.test(titre)) return [];
    const s = SUJETS.find((x) => x.motif.test(texte));
    if (!s) return [];
    return [{ ...i, id: idFlux(source.id, i.lien), source: source.id, page: s.page, sujet: s.sujet, important: !!s.important?.test(titre) }];
  });
}

/** Fusionne les nouveaux éléments avec ceux déjà connus : sans doublon, récents d'abord, bornés en nombre et en âge. */
export function fusionnerFlux(anciens: EntreeFlux[], nouveaux: EntreeFlux[], aujourdhui: string, { jours = 90, max = 120 } = {}): EntreeFlux[] {
  const parId = new Map<string, EntreeFlux>();
  for (const e of [...anciens, ...nouveaux]) parId.set(e.id, e);
  const limite = new Date(Date.parse(aujourdhui) - jours * 86_400_000).toISOString();
  return [...parId.values()]
    .filter((e) => e.date >= limite)
    .sort((a, b) => (a.date < b.date ? 1 : -1))
    .slice(0, max);
}
