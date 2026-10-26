import { moduleHref, modules, type ModuleInfo } from "./modules";
import { propositionHref, propositionsPhares } from "./propositions";

/**
 * Les parcours thématiques proposés sur l'accueil et dans « Comprendre ». Le
 * niveau (Simple ou Approfondi) se choisit dans chaque module : un parcours
 * ne règle plus le mode de lecture. Une étape est une page ; celles des
 * modules pas encore écrits sont « bientôt » et ne comptent pas. La
 * progression est celle des pages lues : elle est commune à tous les parcours.
 */

export type ParcoursId = "dette" | "retraites-paie" | "propositions" | "tout";

export interface EtapeParcours {
  href: string;
  titre: string;
  /** Module ou rubrique d'appartenance, pour regrouper l'affichage. */
  groupe: string;
  /** Module de l'étape, quand c'en est une page (pour compter les modules terminés). */
  module?: string;
  disponible: boolean;
}

export interface Parcours {
  id: ParcoursId;
  titre: string;
  accroche: string;
  etapes: EtapeParcours[];
}

/** Anciens parcours (« Je découvre », « J'approfondis ») : un parcours en cours reprend dans « Tout comprendre ». */
export const ANCIENS_PARCOURS: Record<string, ParcoursId> = { decouvrir: "tout", approfondir: "tout" };

function mod(slug: string): ModuleInfo {
  const m = modules.find((x) => x.slug === slug);
  if (!m) throw new Error(`Module inconnu : ${slug}`);
  return m;
}

function etapeModule(m: ModuleInfo, section?: string): EtapeParcours {
  const s = section ? m.sections.find((x) => x.slug === section) : undefined;
  if (section && !s) throw new Error(`Section inconnue : ${m.slug}/${section}`);
  return { href: moduleHref(m.slug, section), titre: s ? s.title : m.title, groupe: m.title, module: m.slug, disponible: m.status === "available" };
}

/** Toutes les pages d'un module : introduction, puis chaque section. */
const moduleComplet = (slug: string) => {
  const m = mod(slug);
  return [etapeModule(m), ...m.sections.map((s) => etapeModule(m, s.slug))];
};

const GROUPE_PROPOSITIONS = "Les propositions au crible";
const PROPOSITIONS: EtapeParcours[] = [
  { href: "/propositions/", titre: "Les propositions au crible", groupe: GROUPE_PROPOSITIONS, disponible: true },
  ...propositionsPhares.map((p) => ({ href: propositionHref(p.slug), titre: p.titre, groupe: GROUPE_PROPOSITIONS, disponible: !!p.contenu })),
];
const IDEES_RECUES: EtapeParcours = { href: "/idees-recues/", titre: "Idées reçues", groupe: "Idées reçues", disponible: true };

export const parcours: Parcours[] = [
  {
    id: "dette",
    titre: "Comprendre la dette",
    accroche: "Pourquoi la dette monte, comment l'État emprunte, ce qu'est l'effet boule de neige et ce que peut faire la banque centrale.",
    etapes: ["deficit-et-dette", "emprunt-etat", "boule-de-neige", "banque-centrale"].flatMap(moduleComplet),
  },
  {
    id: "retraites-paie",
    titre: "Comprendre les retraites et ma fiche de paie",
    accroche: "Comment les retraites sont financées, les leviers pour les équilibrer, et ce que deviennent les cotisations prélevées sur un salaire.",
    etapes: ["retraites", "fiche-de-paie"].flatMap(moduleComplet),
  },
  {
    id: "propositions",
    titre: "Me faire un avis sur les propositions",
    accroche: "Les bases nécessaires (PIB, déficit, dette, taux), puis les propositions du débat public passées au crible, et les idées reçues vérifiées.",
    etapes: [
      ...moduleComplet("les-bases"),
      etapeModule(mod("deficit-et-dette"), "flux-et-stock"),
      etapeModule(mod("deficit-et-dette"), "soldes"),
      etapeModule(mod("emprunt-etat"), "prix-et-taux"),
      etapeModule(mod("boule-de-neige"), "formule"),
      ...PROPOSITIONS,
      IDEES_RECUES,
    ],
  },
  {
    id: "tout",
    titre: "Tout comprendre",
    accroche: "Tous les modules, dans l'ordre, puis le tableau de bord, les propositions passées au crible et les idées reçues.",
    etapes: [
      ...modules.flatMap((m) => moduleComplet(m.slug)),
      { href: "/tableau-de-bord/", titre: "Le tableau de bord", groupe: "Tableau de bord", disponible: true },
      ...PROPOSITIONS,
      IDEES_RECUES,
    ],
  },
];

/** Ligne commune aux cartes des parcours. */
export const NIVEAU_DANS_CHAQUE_MODULE = "Dans chaque module, choisissez votre niveau : Simple ou Approfondi.";

export function getParcours(id: ParcoursId): Parcours {
  return parcours.find((p) => p.id === id)!;
}

/** Durée estimée d'un parcours : environ cinq minutes par page, arrondie au quart d'heure. */
export function dureeEstimee(p: Parcours): string {
  const minutes = Math.max(15, Math.round((p.etapes.filter((e) => e.disponible).length * 5) / 15) * 15);
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `≈ ${h ? `${h} h${m ? ` ${m}` : ""}` : `${m} min`}`;
}

export interface Avancement {
  faites: number;
  /** Étapes disponibles (le dénominateur de la progression). */
  disponibles: number;
  /** Étapes pas encore écrites. */
  aVenir: number;
  pourcent: number;
  /** Première étape disponible pas encore lue. */
  prochaine?: EtapeParcours;
}

export function avancement(p: Parcours, lues: readonly string[]): Avancement {
  const dispo = p.etapes.filter((e) => e.disponible);
  const faites = dispo.filter((e) => lues.includes(e.href)).length;
  return {
    faites,
    disponibles: dispo.length,
    aVenir: p.etapes.length - dispo.length,
    pourcent: dispo.length ? Math.round((faites / dispo.length) * 100) : 0,
    prochaine: dispo.find((e) => !lues.includes(e.href)),
  };
}

/** Modules du parcours, dans l'ordre, et combien sont terminés (toutes leurs pages lues). */
export function modulesDuParcours(p: Parcours, lues: readonly string[]): { modules: string[]; termines: number } {
  const liste = [...new Set(p.etapes.flatMap((e) => (e.module ? [e.module] : [])))];
  const termines = liste.filter((m) => p.etapes.filter((e) => e.module === m && e.disponible).every((e) => lues.includes(e.href))).length;
  return { modules: liste, termines };
}

/** Le parcours d'un module, à défaut du parcours en cours : le premier parcours thématique qui le contient, sinon « Tout comprendre ». */
export function parcoursDuModule(module: string, actif?: ParcoursId | null): Parcours {
  const candidats = parcours.filter((p) => p.etapes.some((e) => e.module === module));
  return candidats.find((p) => p.id === actif) ?? candidats.find((p) => p.id !== "tout") ?? getParcours("tout");
}

/** Position d'une page dans un parcours (1 = première étape), ou 0 si absente. */
export function positionDans(p: Parcours, href: string): number {
  return p.etapes.findIndex((e) => e.href === href) + 1;
}
