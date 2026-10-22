import explicationsJson from "../../data/actu-explications.json";
import fluxJson from "../../data/actu-flux.json";
import journalJson from "../../data/actu-journal.json";
import type { EntreeFlux } from "@/lib/actu/flux";
import type { Journal } from "@/lib/actu/journal";
import { getDonnee } from "@/lib/data";
import { formatNombre } from "@/lib/format";
import { libellePeriode } from "@/lib/indicateurs";
import { agenda, dateEcheance, finEcheance } from "@/lib/agenda";
import { alertesActives, libelleDate } from "./alertes";
import { indicateurs } from "./indicateurs";
import { modules } from "./modules";

/**
 * Fil « L'actu » : assemblé à la construction du site à partir de ce qui est
 * déjà automatique (nouvelles périodes des indicateurs, alertes de seuil,
 * échéances de l'agenda, publications officielles). Chaque entrée renvoie vers
 * la page du site qui explique le sujet. Les encadrés « Ce que ça veut dire »
 * ne s'affichent qu'une fois validés (data/actu-explications.json, modifié par
 * demande de mise à jour) ; le brouillon proposé est calculé ici.
 */

export type TypeActu = "indicateur" | "alerte" | "echeance" | "publication";

export const LIBELLES_TYPE: Record<TypeActu, string> = {
  indicateur: "Chiffre du jour",
  alerte: "Seuil franchi",
  echeance: "Échéance",
  publication: "Publication officielle",
};

export interface EntreeActu {
  id: string;
  /** Date de tri (AAAA-MM-JJ). */
  date: string;
  /** Date affichée : « 22 octobre 2026 », ou la période des données. */
  dateLibelle: string;
  type: TypeActu;
  titre: string;
  /** Source originale (lien vers la publication ou la donnée). */
  source?: { nom: string; url: string };
  /** Page du site qui explique le sujet. */
  page: { href: string; titre: string };
  important: boolean;
  /** Texte validé de l'encadré « Ce que ça veut dire ». */
  explication?: string;
  /** Proposition de texte, soumise à validation par la veille. */
  brouillon?: string;
}

interface Explications {
  description: string;
  explications: Record<string, { texte: string; propose_le: string }>;
}

const MOIS = ["janvier", "février", "mars", "avril", "mai", "juin", "juillet", "août", "septembre", "octobre", "novembre", "décembre"];
/** « 2026-10-22 » → « 22 octobre 2026 ». */
export function jourEnLettres(iso: string): string {
  const [a, m, j] = iso.slice(0, 10).split("-").map(Number);
  return `${j === 1 ? "1er" : j} ${MOIS[m - 1]} ${a}`;
}

/** Dernier jour d'une période de données (année, trimestre, mois ou jour). */
export function finDePeriode(x: string): string {
  if (/^\d{4}-\d{2}-\d{2}$/.test(x)) return x;
  if (/^\d{4}-\d{2}$/.test(x)) {
    const [a, m] = x.split("-").map(Number);
    return new Date(Date.UTC(a, m, 0)).toISOString().slice(0, 10);
  }
  const t = /^(\d{4})-T(\d)$/.exec(x);
  if (t) return new Date(Date.UTC(Number(t[1]), Number(t[2]) * 3, 0)).toISOString().slice(0, 10);
  return `${x.slice(0, 4)}-12-31`;
}

const PAGES_FIXES: Record<string, string> = {
  "/tableau-de-bord/": "Le tableau de bord",
  "/la-france-en-10-chiffres/": "La France en 10 chiffres",
};

/** Titre d'une page du site, pour le lien « Comprendre ». */
export function titrePage(href: string): string {
  if (PAGES_FIXES[href]) return PAGES_FIXES[href];
  const [, , mod, section] = href.split("/");
  const m = modules.find((x) => x.slug === mod);
  if (!m) return "La page du site";
  return (section && m.sections.find((s) => s.slug === section)?.title) || m.title;
}

/** Donnée suivie par chaque alerte, pour dater l'alerte au jour où la donnée est arrivée. */
const DONNEE_ALERTE: Record<string, string> = {
  "oat-5": "marches.taux10-france",
  "spread-100": "marches.spread-france-allemagne",
  "france-italie": "marches.taux10-france",
  "dette-120": "dette.ratio-pib",
  "inflation-3": "ind.inflation-fr",
  "chomage-9": "ind.chomage",
};

const BROUILLON_AGENDA: Record<string, (titre: string, date: string) => string> = {
  notation: (t, d) =>
    `${t} (${d}). Une note plus basse peut renchérir un peu les emprunts de l'État, mais les marchés anticipent souvent la décision. La note et sa perspective sont à lire dans le communiqué de l'agence.`,
  bce: (_t, d) =>
    `La BCE a fixé ses taux directeurs le ${d}. Ils guident le coût des crédits et, en partie, celui des emprunts de l'État. Le taux de dépôt du tableau de bord suit automatiquement sa décision.`,
  budget: (t, d) =>
    `${t} (${d}). Le vote fixe les recettes et les dépenses prévues, donc le déficit visé pour l'année. Les chiffres définitifs ne seront connus qu'à l'exécution, l'année suivante.`,
  publication: (t, d) => `${t} (${d}). Ces chiffres officiels servent de référence au débat public. Le site met à jour les pages concernées.`,
};

const BROUILLON_SUJET: Record<string, string> = {
  "Politique monétaire": "Les décisions de la BCE se répercutent sur le coût des crédits et, en partie, sur les taux auxquels l'État emprunte.",
  "Dette et déficit": "La dette et le déficit mesurent l'écart entre les dépenses et les recettes publiques, et ce qu'il reste à financer.",
};

export function construireFil(aujourdhui = new Date().toISOString().slice(0, 10)): EntreeActu[] {
  const journal = journalJson as Journal;
  const explications = (explicationsJson as Explications).explications;
  const entrees: EntreeActu[] = [];

  // 1. Nouvelles périodes des indicateurs du tableau de bord.
  for (const j of journal.entrees) {
    const ind = indicateurs.find((i) => i.serie === j.donnee || i.valeurRecente === j.donnee);
    if (!ind) continue;
    const d = getDonnee(j.donnee);
    const valeur = (v: number) => `${formatNombre(v, ind.decimales)} ${ind.unite}`;
    const periode = libellePeriode(j.periode, /^\d{4}-\d{2}-\d{2}$/.test(j.periode) ? "paliers" : ind.frequence);
    entrees.push({
      id: `indicateur-${j.id}`,
      date: j.date,
      dateLibelle: jourEnLettres(j.date),
      type: "indicateur",
      titre: `${ind.titre} : ${valeur(j.valeur)} (${periode})${j.avant ? `, contre ${valeur(j.avant.valeur)} auparavant` : ""}`,
      source: d.source.url ? { nom: d.source.nom, url: d.source.url } : undefined,
      page: { href: ind.lien.href, titre: ind.lien.libelle },
      important: false,
    });
  }

  // 2. Alertes de seuil en cours, datées au jour où la donnée qui les déclenche est arrivée.
  for (const a of alertesActives()) {
    const arrivee = journal.entrees.find((j) => j.donnee === DONNEE_ALERTE[a.id] && j.periode === a.date);
    const date = arrivee?.date ?? finDePeriode(a.date);
    entrees.push({
      id: `alerte-${a.id}-${a.etat}-${a.date}`,
      date,
      dateLibelle: arrivee ? jourEnLettres(arrivee.date) : `Données ${libelleDate(a.date).replace(/^(en|le|fin) /, "de ")}`,
      type: "alerte",
      titre: a.phrase,
      page: { href: a.lien.href, titre: a.lien.libelle },
      important: true,
      brouillon: `${a.phrase} ${a.pourquoi} Le tableau de bord suit cet indicateur chaque jour ouvré.`,
    });
  }

  // 3. Échéances de l'agenda passées depuis moins de deux mois.
  const limite = new Date(Date.parse(aujourdhui) - 60 * 86_400_000).toISOString().slice(0, 10);
  for (const e of agenda.evenements) {
    const fin = finEcheance(e);
    if (fin >= aujourdhui || fin < limite) continue;
    const quand = dateEcheance(e);
    const page = e.pages[0];
    entrees.push({
      id: `echeance-${e.id}`,
      date: fin,
      dateLibelle: e.precision === "jour" ? jourEnLettres(e.date) : quand,
      type: "echeance",
      titre: e.traite ? `${e.titre} : la mise à jour a été validée` : `${e.titre} : échéance passée`,
      source: e.source,
      page: { href: page, titre: titrePage(page) },
      important: e.categorie !== "publication" || e.mise_a_jour === "validation",
      brouillon: BROUILLON_AGENDA[e.categorie](e.titre, quand),
    });
  }

  // 4. Publications des sources officielles.
  const noms: Record<string, string> = { insee: "Insee", bce: "Banque centrale européenne", "cour-des-comptes": "Cour des comptes" };
  for (const f of (fluxJson as { entrees: EntreeFlux[] }).entrees) {
    const quand = jourEnLettres(f.date);
    entrees.push({
      id: f.id,
      date: f.date.slice(0, 10),
      dateLibelle: quand,
      type: "publication",
      titre: f.titre,
      source: { nom: noms[f.source] ?? f.source, url: f.lien },
      page: { href: f.page, titre: titrePage(f.page) },
      important: f.important,
      brouillon: f.important
        ? `${noms[f.source]} : « ${f.titre} » (${quand}). ${BROUILLON_SUJET[f.sujet] ?? ""} Le détail est expliqué sur la page « ${titrePage(f.page)} ».`.replace("  ", " ")
        : undefined,
    });
  }

  for (const e of entrees) {
    const x = explications[e.id];
    if (x) e.explication = x.texte;
  }
  return entrees.sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : a.id < b.id ? -1 : 1));
}

/** Les n dernières actualités, pour l'accueil. */
export const dernieresActus = (n = 3) => construireFil().slice(0, n);
