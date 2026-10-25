/**
 * Publications des sources officielles (flux RSS et listes de communiqués) :
 * lecture, tri par sujet et page du site qui explique le sujet. Fonctions
 * pures, sans import : utilisées par scripts/maj-actu.ts (Node) et testées
 * avec Vitest.
 *
 * Seules des publications officielles réutilisables sont reprises : titre,
 * date et lien vers l'original. Le texte des publications n'est pas recopié.
 * L'Agence France Trésor et vie-publique.fr refusent la lecture automatique
 * (protection contre les robots) : ils ne sont pas lus, et les étapes du budget
 * viennent de l'agenda du site (data/agenda.json), sourcé par l'Assemblée.
 */

export interface ItemRss {
  titre: string;
  lien: string;
  /** Date ISO (AAAA-MM-JJTHH:MM:SSZ). */
  date: string;
  resume: string;
  /** Rubrique donnée par la source (Banque de France : « Communiqué de presse BCE »…). */
  categorie?: string;
}

export type IdSource =
  | "insee"
  | "bce"
  | "banque-de-france"
  | "eurostat"
  | "cour-des-comptes"
  | "hcfp"
  | "assemblee-nationale"
  | "senat";

export interface SourceFlux {
  id: IdSource;
  nom: string;
  /** Adresses lues chaque jour. */
  urls: string[];
  /** Adresses supplémentaires lues pour le rattrapage (pages suivantes des listes). */
  rattrapage?: string[];
  format: "rss" | "banque-de-france" | "eurostat";
  /** Langue des titres, quand ce n'est pas le français. */
  langue?: "en";
  /** Garde-t-on cet élément avant même de regarder le sujet ? (par exemple : communiqués seulement). */
  garder?: (item: ItemRss) => boolean;
}

const BDF = "https://www.banque-france.fr/fr/communiques-de-presse";
const EUROSTAT = "https://ec.europa.eu/eurostat/web/euro-indicators/publications";
const PORTLET = "com_liferay_asset_publisher_web_portlet_AssetPublisherPortlet_INSTANCE_QuTGBShrSBBB";
/** Page n (à partir de 1) de la liste des euro-indicateurs d'Eurostat, six communiqués par page. */
export const pageEurostat = (n: number) =>
  n === 1 ? EUROSTAT : `${EUROSTAT}?p_p_id=${PORTLET}&p_p_lifecycle=0&p_p_state=normal&p_p_mode=view&_${PORTLET}_cur=${n}&_${PORTLET}_delta=6`;

export const SOURCES_FLUX: SourceFlux[] = [
  { id: "insee", nom: "Insee", urls: ["https://www.insee.fr/fr/flux/1"], format: "rss" },
  {
    id: "bce",
    nom: "Banque centrale européenne",
    urls: ["https://www.ecb.europa.eu/rss/press.html"],
    format: "rss",
    langue: "en",
    // Communiqués seulement ; pas les discours ni les entretiens, trop nombreux.
    garder: (i) => /\/press\/pr\//.test(i.lien),
  },
  {
    // Communiqués de la Banque de France et, traduits en français, ceux de la BCE.
    id: "banque-de-france",
    nom: "Banque de France",
    urls: [BDF],
    rattrapage: [`${BDF}?page=1`, `${BDF}?page=2`, `${BDF}?page=3`],
    format: "banque-de-france",
  },
  {
    id: "eurostat",
    nom: "Eurostat",
    urls: [pageEurostat(1)],
    rattrapage: [2, 3, 4, 5, 6, 7].map(pageEurostat),
    format: "eurostat",
    langue: "en",
  },
  { id: "cour-des-comptes", nom: "Cour des comptes", urls: ["https://www.ccomptes.fr/fr/rss/publications"], format: "rss" },
  {
    id: "hcfp",
    nom: "Haut Conseil des finances publiques",
    urls: ["https://www.hcfp.fr/rss.xml"],
    format: "rss",
    // Les avis, pas les diaporamas ni les vidéos d'audition.
    garder: (i) => /\/liste-avis\//.test(i.lien),
  },
  { id: "assemblee-nationale", nom: "Assemblée nationale", urls: ["https://www.assemblee-nationale.fr/dyn/rss/communiques-de-presse.xml"], format: "rss" },
  {
    id: "senat",
    nom: "Sénat",
    // Thèmes « Budget », « Économie et finances, fiscalité », « Sécurité sociale ».
    urls: ["https://www.senat.fr/themes/rss/therss10.rss", "https://www.senat.fr/themes/rss/therss17.rss", "https://www.senat.fr/themes/rss/therss25.rss"],
    format: "rss",
    // Les rapports et avis des commissions, pas chaque version des textes en navette.
    garder: (i) => /senat\.fr\/(rap|notice-rapport)\//.test(i.lien),
  },
];

export interface EntreeFlux extends ItemRss {
  id: string;
  source: IdSource;
  /** Page du site qui explique le sujet. */
  page: string;
  sujet: Sujet;
  important: boolean;
  langue?: "en";
}

const entites: Record<string, string> = { amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: " " };

/** Texte brut d'un champ RSS ou HTML : CDATA, balises et entités retirées. */
export function texteBrut(s: string): string {
  const decoder = (x: string) =>
    x
      .replace(/&(amp|lt|gt|quot|apos|nbsp);/g, (_, e: string) => entites[e])
      .replace(/&#(\d+);/g, (_, n: string) => String.fromCharCode(Number(n)))
      .replace(/&#x([0-9a-f]+);/gi, (_, n: string) => String.fromCharCode(parseInt(n, 16)));
  return decoder(decoder(s.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")).replace(/<[^>]+>/g, " "))
    .replace(/\s+/g, " ")
    .trim();
}

/** Lien absolu, en https (l'Assemblée et le Sénat publient encore des liens en http). */
export function lienPropre(lien: string, base = ""): string {
  const absolu = lien.startsWith("/") ? `${base}${lien}` : lien;
  return absolu.replace(/^http:\/\//, "https://").replace(/([^:])\/\/+/g, "$1/");
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
    const lien = lienPropre(champ("link"));
    const brute = champ("pubDate") || champ("dc:date");
    const t = Date.parse(brute);
    if (!titre || !lien || Number.isNaN(t)) continue;
    items.push({ titre, lien, date: new Date(t).toISOString().replace(/\.\d{3}Z$/, "Z"), resume: champ("description").slice(0, 400) });
  }
  return items;
}

const MOIS: Record<string, number> = {
  janvier: 1, fevrier: 2, mars: 3, avril: 4, mai: 5, juin: 6, juillet: 7, aout: 8, septembre: 9, octobre: 10, novembre: 11, decembre: 12,
  january: 1, february: 2, march: 3, april: 4, may: 5, june: 6, july: 7, august: 8, september: 9, october: 10, november: 11, december: 12,
};

/** « 8 Octobre 2026 », « 21 October 2026 » → « 2026-10-08T00:00:00Z » (ou undefined). */
export function dateEnLettres(texte: string): string | undefined {
  const m = /(\d{1,2})(?:er)?\s+(\p{L}+)\s+(\d{4})/u.exec(texte.replace(/&nbsp;| /g, " "));
  const mois = m && MOIS[sansAccents(m[2])];
  if (!m || !mois) return undefined;
  return `${m[3]}-${String(mois).padStart(2, "0")}-${m[1].padStart(2, "0")}T00:00:00Z`;
}

/**
 * Liste des communiqués de presse de la Banque de France : une carte par
 * communiqué (lien, titre, rubrique et date de publication).
 */
export function lireListeBanqueDeFrance(html: string): ItemRss[] {
  const items: ItemRss[] = [];
  for (const m of html.matchAll(/<a class="card[^"]*"\s+href\s*="(\/fr\/communiques-de-presse\/[^"]+)"\s+title\s*="([^"]*)"[^>]*>([\s\S]*?)<\/a>/g)) {
    const dates = [...m[3].matchAll(/<small>\s*([^<]*\d{4})\s*<\/small>/g)];
    const date = dates.length ? dateEnLettres(dates[dates.length - 1][1]) : undefined;
    const categorie = /category-btn-grid[^>]*>([^<]+)</.exec(m[3])?.[1];
    if (!date) continue;
    items.push({ titre: texteBrut(m[2]), lien: lienPropre(m[1], "https://www.banque-france.fr"), date, resume: "", ...(categorie ? { categorie: texteBrut(categorie) } : {}) });
  }
  return items;
}

/** Liste des euro-indicateurs d'Eurostat : lien, titre et date de chaque communiqué. */
export function lireListeEurostat(html: string): ItemRss[] {
  const items: ItemRss[] = [];
  const vus = new Set<string>();
  for (const m of html.matchAll(/href="([^"]*\/products-euro-indicators\/w\/[0-9a-z-]+)"/g)) {
    if (vus.has(m[1])) continue;
    vus.add(m[1]);
    const suite = html.slice(m.index! + m[0].length, m.index! + m[0].length + 4000);
    const titre = /estat-title"?>([\s\S]*?)<\/span>/.exec(suite)?.[1];
    const date = dateEnLettres(/meta-label">([\s\S]*?)<\/span>/.exec(suite)?.[1] ?? "");
    if (!titre || !date) continue;
    items.push({ titre: texteBrut(titre), lien: lienPropre(m[1], "https://ec.europa.eu"), date, resume: "" });
  }
  return items;
}

/** Lit une page selon le format de la source. */
export function lireSource(source: Pick<SourceFlux, "format">, texte: string): ItemRss[] {
  if (source.format === "banque-de-france") return lireListeBanqueDeFrance(texte);
  if (source.format === "eurostat") return lireListeEurostat(texte);
  return lireRss(texte);
}

function sansAccents(s: string): string {
  return s
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[’‘]/g, "'")
    .toLowerCase();
}

/** Les huit thèmes suivis par le fil. */
export type Sujet = "Taux" | "Dette" | "Budget" | "Retraites" | "Impôts" | "Inflation" | "Emploi" | "Croissance";

/**
 * Règles de tri, dans l'ordre de priorité : la première dont le motif
 * correspond au titre donne le thème et la page du site la plus pertinente.
 * On ne lit que le titre : le résumé cite souvent d'autres sujets (un article
 * sur les salaires mentionne l'inflation, sans en parler).
 */
export const SUJETS: { sujet: Sujet; motif: RegExp; page: string; important?: RegExp }[] = [
  // Taux : décisions de la BCE, comptes rendus, taux des banques.
  {
    sujet: "Taux",
    motif: /decisions de politique monetaire|monetary policy decisions|compte rendu de la reunion de politique monetaire|taux directeurs?|taux d.interet des banques/,
    page: "/modules/banque-centrale/bce-eurosysteme/",
    important: /decisions de politique monetaire|monetary policy decisions/,
  },
  { sujet: "Dette", motif: /detention de la dette publique|detenteurs de la dette/, page: "/modules/emprunt-etat/detenteurs/" },
  { sujet: "Dette", motif: /government (debt|deficit)/, page: "/modules/comparaisons/dette-et-deficit/" },
  {
    sujet: "Dette",
    motif: /dette publique|deficit public|comptes nationaux des administrations publiques|comptes publics/,
    page: "/modules/deficit-et-dette/",
    important: /dette publique|deficit public|comptes nationaux des administrations publiques/,
  },
  {
    sujet: "Budget",
    motif: /lois? de finances|loi de financement de la securite sociale|decret d.avance|budget de l.etat|situation financiere de la securite sociale|finances publiques/,
    page: "/modules/deficit-et-dette/soldes/",
    important: /^avis n|lois? de finances|situation financiere de la securite sociale/,
  },
  { sujet: "Retraites", motif: /retraite|pension|fin de carriere/, page: "/modules/retraites/" },
  { sujet: "Impôts", motif: /impots?\b|prelevements obligatoires|recettes fiscales|\btva\b|fiscal/, page: "/modules/fiscalite/" },
  {
    sujet: "Inflation",
    motif: /prix a la consommation|annual inflation|inflation annuelle/,
    page: "/modules/les-bases/inflation-taux-reels/",
    important: /prix a la consommation/,
  },
  { sujet: "Emploi", motif: /cout (horaire )?du travail|labour costs/, page: "/modules/fiscalite/smic/" },
  { sujet: "Emploi", motif: /unemployment/, page: "/modules/comparaisons/emploi-croissance/" },
  { sujet: "Emploi", motif: /taux de chomage/, page: "/tableau-de-bord/" },
  { sujet: "Emploi", motif: /salaires|emploi salarie/, page: "/modules/fiche-de-paie/" },
  { sujet: "Croissance", motif: /^gdp\b/, page: "/modules/comparaisons/emploi-croissance/" },
  {
    sujet: "Croissance",
    motif: /croissance|produit interieur brut|\bpib\b|climat des affaires (?!dans)|confiance des menages|consommation des menages/,
    page: "/modules/les-bases/pib/",
    important: /croissance|produit interieur brut|\bpib\b/,
  },
];

/**
 * Ce qui n'est pas une actualité : tableaux de données mis à jour en continu,
 * résultats régionaux ou sectoriels, communiqués en double d'un même événement.
 */
const ECARTES = new RegExp(
  [
    "tableau de bord de l.economie francaise",
    "localises",
    "^comptes nationaux$",
    "series longues",
    "estimations trimestrielles",
    "dans l.union europeenne",
    "selon le secteur",
    "par activite",
    "par secteur$",
    "regions",
    "^salaire minimum",
    "au sens de maastricht$",
    "^impots$",
    "rapportes au produit interieur brut",
    "et de ses composantes",
    "selon le sexe",
    // La déclaration et la conférence de presse doublent le communiqué des décisions.
    "declaration de politique monetaire",
    "autres que les decisions",
    "seasonally adjusted",
  ].join("|"),
);

/** Identifiant stable d'un élément (source + empreinte courte du lien). */
export function idFlux(source: string, lien: string): string {
  let h = 0x811c9dc5;
  for (const c of new TextEncoder().encode(lien)) h = Math.imul(h ^ c, 0x01000193);
  return `${source}-${(h >>> 0).toString(16).padStart(8, "0")}`;
}

/** Sujet et page du site d'un titre, ou undefined s'il ne relève pas des thèmes suivis. */
export function sujetDe(titre: string): (typeof SUJETS)[number] | undefined {
  const t = sansAccents(titre);
  if (ECARTES.test(t)) return undefined;
  return SUJETS.find((x) => x.motif.test(t));
}

/** Garde les éléments qui parlent d'un thème suivi, avec la page du site qui l'explique. */
export function trierFlux(source: Pick<SourceFlux, "id" | "garder" | "langue">, items: ItemRss[]): EntreeFlux[] {
  return items.flatMap((i) => {
    if (source.garder && !source.garder(i)) return [];
    const s = sujetDe(i.titre);
    if (!s) return [];
    // Un communiqué de la BCE relayé en français par la Banque de France reste un communiqué de la BCE.
    const id = source.id === "banque-de-france" && /\bBCE\b/.test(i.categorie ?? "") ? "bce" : source.id;
    return [
      {
        ...i,
        id: idFlux(id, i.lien),
        source: id,
        page: s.page,
        sujet: s.sujet,
        important: !!s.important?.test(sansAccents(i.titre)),
        ...(source.langue ? { langue: source.langue } : {}),
      },
    ];
  });
}

/** « 3.8% » → « 3,8 % ». */
const pourcent = (n: string) => `${n.replace(".", ",")} %`;
const N = String.raw`(-?\d+(?:\.\d+)?)%`;
const SENS: Record<string, string> = { up: "en hausse", down: "en baisse" };

/** Membres de phrase des titres d'Eurostat, traduits mot à mot, sans rien ajouter. */
const MEMBRES: [RegExp, (m: RegExpExecArray) => string][] = [
  [new RegExp(`^annual inflation (up|down) to ${N}$`, "i"), (m) => `inflation annuelle ${SENS[m[1].toLowerCase()]} à ${pourcent(m[2])}`],
  [new RegExp(`^annual inflation stable at ${N}$`, "i"), (m) => `inflation annuelle stable à ${pourcent(m[1])}`],
  [new RegExp(`^unemployment at ${N}$`, "i"), (m) => `chômage à ${pourcent(m[1])}`],
  [new RegExp(`^(gdp|employment) (up|down) by ${N}$`, "i"), (m) => `${m[1].toLowerCase() === "gdp" ? "PIB" : "emploi"} ${SENS[m[2].toLowerCase()]} de ${pourcent(m[3])}`],
  [/^(gdp|employment) stable$/i, (m) => `${m[1].toLowerCase() === "gdp" ? "PIB" : "emploi"} stable`],
  [new RegExp(`^annual increase in labour costs at ${N}$`, "i"), (m) => `hausse annuelle du coût de la main-d'œuvre à ${pourcent(m[1])}`],
  [new RegExp(`^government (debt|deficit) at ${N}( of GDP)?$`, "i"), (m) => `${m[1].toLowerCase() === "debt" ? "dette publique" : "déficit public"} à ${pourcent(m[2])}${m[3] ? " du PIB" : ""}`],
];

/**
 * Traduction fidèle d'un titre d'euro-indicateur d'Eurostat (« Euro area
 * unemployment at 6.4% » → « Chômage à 6,4 % dans la zone euro »), ou
 * undefined si sa forme n'est pas connue : le titre reste alors en anglais.
 */
export function traduireEurostat(titre: string): string | undefined {
  const zone = /^euro area /i.test(titre) || / in (the )?euro area$/i.test(titre);
  if (!zone) return undefined;
  const corps = titre.replace(/^euro area /i, "").replace(/ in (the )?euro area$/i, "");
  const membres = corps.split(" and ").map((x) => {
    for (const [motif, traduire] of MEMBRES) {
      const m = motif.exec(x.trim());
      if (m) return traduire(m);
    }
    return undefined;
  });
  if (membres.some((x) => x === undefined)) return undefined;
  const phrase = `${membres.join(" et ")} dans la zone euro`;
  return phrase.charAt(0).toUpperCase() + phrase.slice(1);
}

/**
 * Applique les règles actuelles à une entrée déjà connue (thème, page,
 * importance). Une entrée publiée n'est jamais retirée : sa page resterait
 * sans contenu (erreur 404) pour qui en a gardé l'adresse.
 */
export function reclasser(e: EntreeFlux): EntreeFlux {
  const s = sujetDe(e.titre);
  return s ? { ...e, sujet: s.sujet, page: s.page, important: !!s.important?.test(sansAccents(e.titre)) } : e;
}

/**
 * Un même événement publié deux fois (communiqué de la BCE en anglais sur son
 * site et en français sur celui de la Banque de France) : on garde le français.
 */
export function sansDoublon(entrees: EntreeFlux[]): EntreeFlux[] {
  const francais = new Set(entrees.filter((e) => e.source === "bce" && !e.langue).map((e) => `${e.date.slice(0, 10)}|${e.sujet}`));
  return entrees.filter((e) => !(e.source === "bce" && e.langue === "en" && francais.has(`${e.date.slice(0, 10)}|${e.sujet}`)));
}

/** Le fil commence le 1er septembre 2026 (rattrapage initial). */
export const DEBUT_FIL = "2026-09-01";

/**
 * Fusionne les nouveaux éléments avec ceux déjà connus : sans doublon, récents
 * d'abord. Rien n'est retiré depuis le début du fil : chaque actualité garde sa
 * page (/actu/<slug>/), dont l'adresse a pu être partagée.
 */
export function fusionnerFlux(anciens: EntreeFlux[], nouveaux: EntreeFlux[], { depuis = DEBUT_FIL, max = 5000 } = {}): EntreeFlux[] {
  const parId = new Map<string, EntreeFlux>();
  for (const e of [...anciens, ...nouveaux]) parId.set(e.id, e);
  return sansDoublon([...parId.values()])
    .filter((e) => e.date >= depuis)
    .sort((a, b) => (a.date < b.date ? 1 : -1))
    .slice(0, max);
}
