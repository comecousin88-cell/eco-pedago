import explicationsJson from "../../data/actu-explications.json";
import fluxJson from "../../data/actu-flux.json";
import journalJson from "../../data/actu-journal.json";
import { traduireEurostat, type EntreeFlux, type IdSource, type Sujet } from "@/lib/actu/flux";
import type { Journal } from "@/lib/actu/journal";
import { getDonnee, LIBELLE_ETAT } from "@/lib/data";
import { resultatIpc } from "@/lib/maj/fonctions";
import { periodeEnClair, qualificatif } from "@/lib/versions";
import { formatNombre } from "@/lib/format";
import { libellePeriode } from "@/lib/indicateurs";
import { agenda, dateEcheance, finEcheance, type Categorie } from "@/lib/agenda";
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
  /** Indicateur, période et statut du chiffre annoncé : « IPC Insee, septembre 2026, définitif ». */
  version?: string;
  /** Texte validé de l'encadré « Ce que ça veut dire ». */
  explication?: string;
  /** Proposition de texte, soumise à validation par la veille. */
  brouillon?: string;
  /** Thème du fil (Dette, Budget, Retraites, Impôts, Inflation, Emploi, Croissance, Taux). */
  sujet?: Sujet;
  /** Langue du titre, quand ce n'est pas le français (Eurostat, BCE). */
  langue?: "en";
  /** Titre original, quand le titre affiché en est la traduction (Eurostat). */
  titreOriginal?: string;
}

/** Le fil commence le 1er septembre 2026 (rattrapage initial). */
export const DEBUT_FIL = "2026-09-01";

/** Nom affiché de chaque source officielle. */
export const NOMS_SOURCES: Record<IdSource, string> = {
  insee: "Insee",
  bce: "Banque centrale européenne",
  "banque-de-france": "Banque de France",
  eurostat: "Eurostat",
  "cour-des-comptes": "Cour des comptes",
  hcfp: "Haut Conseil des finances publiques",
  "assemblee-nationale": "Assemblée nationale",
  senat: "Sénat",
};

/** Thème suivi par chaque donnée du journal : une nouvelle période déjà annoncée par la publication officielle n'est pas répétée. */
const SUJET_DONNEE: Record<string, Sujet> = {
  "ind.inflation-ipc-fr": "Inflation",
  "ind.inflation-fr": "Inflation",
  "ind.inflation-za": "Inflation",
  "ind.chomage": "Emploi",
  "dette.ratio-pib": "Dette",
  "deficit.ratio-pib": "Dette",
  "bce.taux-depot": "Taux",
  "bce.taux-depot-actuel": "Taux",
  "marches.taux10-france": "Taux",
  "marches.spread-france-allemagne": "Taux",
};

/**
 * Inflation de la zone euro publiée par Eurostat : estimation rapide (« Euro
 * area annual inflation… », fin du mois ou tout début du suivant) puis
 * résultat définitif (« Annual inflation… in the euro area », mi-mois suivant).
 */
export function versionEurostat(titre: string, date: string): string | undefined {
  const rapide = /^euro area annual inflation/i.test(titre);
  if (!rapide && !/^annual inflation .* in the euro area/i.test(titre)) return undefined;
  const [a, m, j] = date.slice(0, 10).split("-").map(Number);
  // Mois de référence : celui de la publication pour une estimation rapide de fin de mois, sinon le mois précédent.
  const ref = rapide && j >= 25 ? new Date(Date.UTC(a, m - 1, 1)) : new Date(Date.UTC(a, m - 2, 1));
  return `IPCH Eurostat, zone euro, ${periodeEnClair(ref.toISOString().slice(0, 7))}, ${rapide ? "estimation rapide" : LIBELLE_ETAT.definitif}`;
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
  "inflation-3": "ind.inflation-ipc-fr",
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

const BROUILLON_SUJET: Partial<Record<Sujet, string>> = {
  Taux: "Les décisions de la BCE se répercutent sur le coût des crédits et, en partie, sur les taux auxquels l'État emprunte.",
  Dette: "La dette et le déficit mesurent l'écart entre les dépenses et les recettes publiques, et ce qu'il reste à financer.",
  Budget: "Le budget fixe les recettes et les dépenses prévues, donc le déficit visé pour l'année.",
};

const SUJET_CATEGORIE: Partial<Record<Categorie, Sujet>> = { budget: "Budget", bce: "Taux", notation: "Dette" };

export function construireFil(aujourdhui = new Date().toISOString().slice(0, 10)): EntreeActu[] {
  const journal = journalJson as Journal;
  const explications = (explicationsJson as Explications).explications;
  const entrees: EntreeActu[] = [];
  const flux = (fluxJson as { entrees: EntreeFlux[] }).entrees;
  const ecart = (a: string, b: string) => Math.abs(Date.parse(a.slice(0, 10)) - Date.parse(b.slice(0, 10))) / 86_400_000;

  // 1. Nouvelles périodes des indicateurs du tableau de bord.
  for (const j of journal.entrees) {
    const ind = indicateurs.find((i) => i.serie === j.donnee || i.valeurRecente === j.donnee);
    if (!ind) continue;
    const sujet = SUJET_DONNEE[j.donnee];
    // Déjà annoncé par la publication officielle (communiqué de l'Insee, d'Eurostat, de la BCE) : pas de doublon.
    if (sujet && flux.some((f) => f.sujet === sujet && ecart(f.date, j.date) <= 3)) continue;
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
      sujet,
      version: d.indicateur ? [d.indicateur, periodeEnClair(j.periode), j.etat ? LIBELLE_ETAT[j.etat] : ""].filter(Boolean).join(", ") : undefined,
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
      sujet: SUJET_DONNEE[DONNEE_ALERTE[a.id]],
      version: qualificatif(getDonnee(DONNEE_ALERTE[a.id]), a.date),
      brouillon: `${a.phrase} ${a.pourquoi} Le tableau de bord suit cet indicateur chaque jour ouvré.`,
    });
  }

  // 3. Échéances de l'agenda : celles du jour, et celles passées depuis moins de deux mois.
  const limite = new Date(Date.parse(aujourdhui) - 60 * 86_400_000).toISOString().slice(0, 10);
  for (const e of agenda.evenements) {
    const fin = finEcheance(e);
    if (fin > aujourdhui || fin < limite || (fin === aujourdhui && e.precision !== "jour")) continue;
    const etat = e.traite ? "la mise à jour a été validée" : fin === aujourdhui ? "c'est aujourd'hui" : "échéance passée";
    const quand = dateEcheance(e);
    const page = e.pages[0];
    entrees.push({
      id: `echeance-${e.id}`,
      date: fin,
      dateLibelle: e.precision === "jour" ? jourEnLettres(e.date) : quand,
      type: "echeance",
      titre: `${e.titre} : ${etat}`,
      source: e.source,
      page: { href: page, titre: titrePage(page) },
      important: e.categorie !== "publication" || e.mise_a_jour === "validation",
      sujet: SUJET_CATEGORIE[e.categorie],
      brouillon: BROUILLON_AGENDA[e.categorie](e.titre, quand),
    });
  }

  // 4. Publications des sources officielles.
  for (const f of flux) {
    const quand = jourEnLettres(f.date);
    const nom = NOMS_SOURCES[f.source] ?? f.source;
    // Communiqués sur l'inflation : indicateur, mois et statut, lus dans le titre (Insee) ou déduits de la date (Eurostat).
    const ipc = f.source === "insee" ? resultatIpc(f.titre) : undefined;
    // Titres d'Eurostat traduits en français ; l'original reste lisible au survol.
    const traduit = f.source === "eurostat" ? traduireEurostat(f.titre) : undefined;
    entrees.push({
      id: f.id,
      date: f.date.slice(0, 10),
      dateLibelle: quand,
      type: "publication",
      titre: traduit ?? f.titre,
      ...(traduit ? { titreOriginal: f.titre } : {}),
      // Communiqué de la BCE lu sur le site de la Banque de France : sa version française.
      source: { nom: f.source === "bce" && f.lien.includes("banque-france.fr") ? `${nom} (version française, Banque de France)` : nom, url: f.lien },
      page: { href: f.page, titre: titrePage(f.page) },
      important: f.important,
      sujet: f.sujet,
      ...(f.langue && !traduit ? { langue: f.langue } : {}),
      version: ipc ? `IPC Insee, ${periodeEnClair(ipc.periode)}, ${LIBELLE_ETAT[ipc.etat]}` : f.source === "eurostat" ? versionEurostat(f.titre, f.date) : undefined,
      brouillon: f.important
        ? `${nom} : « ${traduit ?? f.titre} » (${quand}). ${BROUILLON_SUJET[f.sujet] ?? ""} Le détail est expliqué sur la page « ${titrePage(f.page)} ».`.replace("  ", " ")
        : undefined,
    });
  }

  for (const e of entrees) {
    const x = explications[e.id];
    if (x) e.explication = x.texte;
  }
  return entrees.filter((e) => e.date >= DEBUT_FIL).sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : a.id < b.id ? -1 : 1));
}

/** Les n dernières actualités, pour l'accueil. */
export const dernieresActus = (n = 3) => construireFil().slice(0, n);
