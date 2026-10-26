import journalResumesJson from "../../data/actu-resumes-journal.json";
import resumesOfficielsJson from "../../data/actu-resumes-officiels.json";
import resumesJson from "../../data/actu-resumes.json";
import type { Sujet } from "@/lib/actu/flux";
import type { JournalResumes, ResumeOfficiel } from "@/lib/actu/recapitulatif";
import { raisonNonReprise } from "@/lib/actu/resume-officiel";
import type { EntreeActu } from "./actu";
import { titrePage } from "./actu";
import { glossaire } from "./glossaire";
import { idees } from "./idees-recues";

/**
 * Pages « L'actu » (/actu/<slug>/) : ce qui est automatique (chiffres clés
 * d'après le thème, liens « Pour aller plus loin », source) et ce qui est
 * repris ou rédigé. Le résumé officiel (chapô ou introduction rédigés par
 * l'organisme) est repris tel quel quand la licence du site le permet
 * (data/actu-resumes-officiels.json, scripts/reprendre-resumes.ts) ; quelques
 * actualités ont aussi un « En bref » rédigé par le site (data/actu-resumes.json).
 * Sans résumé, la page n'affiche aucun texte rédigé.
 */

export interface Resume {
  /** Trois points ; {{id}} et {{id@x}} affichent une donnée de data/*.json. */
  en_bref: string[];
  ce_que_ca_veut_dire: string;
  /** Cartes du tableau de bord à afficher (identifiants de src/content/indicateurs.ts). */
  indicateurs?: string[];
  /** Données à afficher en chiffres clés. */
  donnees?: string[];
  /** Résumés de data/actu-resumes.json : date de la proposition. */
  propose_le?: string;
}

/** Résumés rédigés par le site, avec leurs chiffres tirés de data/ ({{id}}). */
export const resumes = (resumesJson as { resumes: Record<string, Resume> }).resumes;

export const resumeDe = (e: Pick<EntreeActu, "id">): Resume | undefined => resumes[e.id];

/** Résumés rédigés par les organismes, repris tels quels et en entier. */
export const resumesOfficiels = (resumesOfficielsJson as { resumes: Record<string, ResumeOfficiel> }).resumes;

export const resumeOfficielDe = (e: Pick<EntreeActu, "id">): ResumeOfficiel | undefined => resumesOfficiels[e.id];

const journalResumes = (journalResumesJson as JournalResumes).entrees;

/**
 * Pourquoi une actualité n'a pas de résumé officiel, quand c'est durable :
 * licence qui ne permet pas la reprise, résumé publié en anglais, communiqué de
 * la BCE sans version française. Undefined s'il est repris ou encore à venir.
 */
export function absenceDeResume(e: Pick<EntreeActu, "id" | "source">): string | undefined {
  if (resumesOfficiels[e.id] || !e.source) return undefined;
  const raison = journalResumes.find((j) => j.id === e.id)?.raison ?? raisonNonReprise(e.source.url);
  return raison && /^licence|anglais|en français|introuvable/.test(raison) ? raison : undefined;
}

/** Chiffres clés automatiques, d'après le thème : cartes du tableau de bord (avec leur courbe) et données. */
const CHIFFRES_SUJET: Record<Sujet, { indicateurs: string[]; donnees: string[] }> = {
  Taux: { indicateurs: ["taux-depot", "oat10"], donnees: [] },
  Dette: { indicateurs: ["dette", "deficit"], donnees: [] },
  Budget: { indicateurs: ["deficit", "dette"], donnees: [] },
  Retraites: { indicateurs: [], donnees: ["retraites.depenses-pib"] },
  Impôts: { indicateurs: [], donnees: ["fp.prelevements-obligatoires-pib"] },
  Inflation: { indicateurs: ["inflation"], donnees: [] },
  Emploi: { indicateurs: ["chomage"], donnees: [] },
  Croissance: { indicateurs: [], donnees: ["macro.croissance-volume"] },
};

export function chiffresCles(e: Pick<EntreeActu, "id" | "sujet">): { indicateurs: string[]; donnees: string[] } {
  const r = resumeDe(e);
  const auto = e.sujet ? CHIFFRES_SUJET[e.sujet] : { indicateurs: [], donnees: [] };
  return { indicateurs: r?.indicateurs ?? auto.indicateurs, donnees: r?.donnees ?? auto.donnees };
}

/**
 * Pour aller plus loin, par thème : pages des modules, puis fiches du
 * glossaire (« glossaire:<id> ») et idées reçues (« idee:<id> »).
 */
const PLUS_LOIN: Record<Sujet, string[]> = {
  Taux: ["/modules/banque-centrale/bce-eurosysteme/", "/modules/emprunt-etat/prix-et-taux/", "glossaire:taux-directeur", "glossaire:spread", "idee:taux-immediat"],
  Dette: ["/modules/deficit-et-dette/", "/modules/boule-de-neige/", "glossaire:dette-maastricht", "glossaire:effet-boule-de-neige", "idee:faillite-100"],
  Budget: ["/modules/deficit-et-dette/soldes/", "/modules/cadre-europeen/regles/", "glossaire:solde-structurel", "glossaire:deficit-public", "idee:dernier-excedent"],
  Retraites: ["/modules/retraites/", "/modules/retraites/leviers/", "glossaire:repartition", "glossaire:taux-de-remplacement", "idee:retraites-faillite"],
  Impôts: ["/modules/fiscalite/", "/modules/fiscalite/qui-paie/", "glossaire:prelevements-obligatoires", "glossaire:progressivite", "idee:impots-moitie"],
  Inflation: ["/modules/les-bases/inflation-taux-reels/", "/modules/histoire-des-dettes/inflation/", "glossaire:inflation", "glossaire:ipch", "idee:inflation-dette"],
  Emploi: ["/modules/fiche-de-paie/", "/modules/fiscalite/smic/", "glossaire:salaire-brut-net", "glossaire:chomage-bit", "idee:smic-cotisations"],
  Croissance: ["/modules/les-bases/pib/", "/modules/comparaisons/emploi-croissance/", "glossaire:pib", "glossaire:croissance-potentielle"],
};

export interface Lien {
  href: string;
  titre: string;
  type: "Module" | "Glossaire" | "Idée reçue";
}

/** Liens « Pour aller plus loin » : la page qui explique le sujet d'abord, puis celles du thème. */
export function liensPlusLoin(e: Pick<EntreeActu, "page" | "sujet">): Lien[] {
  const cles = [e.page.href, ...(e.sujet ? PLUS_LOIN[e.sujet] : [])];
  const liens = cles.map((c): Lien => {
    if (c.startsWith("glossaire:")) {
      const g = glossaire.find((x) => x.id === c.slice(10));
      if (!g) throw new Error(`Glossaire : terme inconnu ${c}`);
      return { href: `/glossaire/#${g.id}`, titre: g.terme, type: "Glossaire" };
    }
    if (c.startsWith("idee:")) {
      const i = idees.find((x) => x.id === c.slice(5));
      if (!i) throw new Error(`Idée reçue inconnue ${c}`);
      return { href: `/idees-recues/#${i.id}`, titre: i.affirmation, type: "Idée reçue" };
    }
    return { href: c, titre: titrePage(c), type: "Module" };
  });
  return liens.filter((l, i) => liens.findIndex((x) => x.href === l.href) === i);
}

export type Morceau = { texte: string } | { id: string; x?: string };

/** « Les prix augmentent de {{ind.inflation-ipc-fr@2026-09}}. » → texte et chiffres à afficher. */
export function morceaux(texte: string): Morceau[] {
  const res: Morceau[] = [];
  let i = 0;
  for (const m of texte.matchAll(/\{\{([a-z0-9.-]+)(?:@([^}]+))?\}\}/g)) {
    if (m.index! > i) res.push({ texte: texte.slice(i, m.index) });
    res.push(m[2] ? { id: m[1], x: m[2] } : { id: m[1] });
    i = m.index! + m[0].length;
  }
  if (i < texte.length) res.push({ texte: texte.slice(i) });
  return res;
}

/** « de l'Insee », « d'Eurostat », « de la Cour des comptes », « du Sénat » : complément du nom d'une source. */
export function deLaSource(nom: string): string {
  const articles: [RegExp, string][] = [
    [/^(Insee|Agence France Trésor|Assemblée nationale)/, "de l'"],
    [/^Eurostat/, "d'"],
    [/^(Banque centrale européenne|Banque de France|Cour des comptes)/, "de la "],
    [/^(Haut Conseil|Sénat)/, "du "],
  ];
  const article = articles.find(([motif]) => motif.test(nom))?.[1] ?? "de ";
  return `${article}${nom}`;
}

/** Titre du résumé repris : « Résumé de l'Insee ». */
export const titreResumeOfficiel = (nomSource: string) => `Résumé ${deLaSource(nomSource)}`;

/** Mention des résumés rédigés par le site (« En bref »). */
export const mentionResumeRedige = (nomSource: string) =>
  `Résumé rédigé par EcoClair avec l'aide de l'IA, à partir de la publication ${deLaSource(nomSource)}. En cas d'écart, la source fait foi.`;

/** Lien « Signaler une erreur » : ouvre un ticket prérempli sur le dépôt du site. */
export function signalerErreurHref(e: Pick<EntreeActu, "titre" | "slug">, site: string): string {
  const page = `${site}/actu/${e.slug}/`;
  const titre = `Erreur dans L'actu : ${e.titre}`.slice(0, 200);
  const corps = `Page : ${page}\n\nCe qui est faux (et ce que dit la source) :\n\n`;
  return `https://github.com/comecousin88-cell/eco-pedago/issues/new?title=${encodeURIComponent(titre)}&body=${encodeURIComponent(corps)}`;
}
