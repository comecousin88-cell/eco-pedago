import { moduleHref, modules, type ModuleInfo } from "./modules";
import type { ModeLecture } from "@/lib/lecture";

/**
 * Les deux parcours proposés sur l'accueil. Une étape est une page ; celles
 * des modules pas encore écrits sont « bientôt » et ne comptent pas dans la
 * progression.
 */

export type ParcoursId = "decouvrir" | "approfondir";

export interface EtapeParcours {
  href: string;
  titre: string;
  /** Module ou rubrique d'appartenance, pour regrouper l'affichage. */
  groupe: string;
  disponible: boolean;
}

export interface Parcours {
  id: ParcoursId;
  titre: string;
  accroche: string;
  duree: string;
  /** Mode de lecture réglé au démarrage du parcours. */
  mode: ModeLecture;
  etapes: EtapeParcours[];
}

function etapeModule(m: ModuleInfo, section?: string): EtapeParcours {
  const s = section ? m.sections.find((x) => x.slug === section) : undefined;
  if (section && !s) throw new Error(`Section inconnue : ${m.slug}/${section}`);
  return {
    href: moduleHref(m.slug, section),
    titre: s ? s.title : m.title,
    groupe: `Module ${m.number} · ${m.title}`,
    disponible: m.status === "available",
  };
}

function mod(slug: string): ModuleInfo {
  const m = modules.find((x) => x.slug === slug);
  if (!m) throw new Error(`Module inconnu : ${slug}`);
  return m;
}

/** Sélection des sections essentielles, dans l'ordre du fil conducteur. */
const DECOUVRIR: [string, string?][] = [
  ["les-bases", "recettes-depenses"],
  ["les-bases", "administrations"],
  ["deficit-et-dette", "flux-et-stock"],
  ["deficit-et-dette", "soldes"],
  ["deficit-et-dette", "histoire"],
  ["emprunt-etat", "oat-btf"],
  ["emprunt-etat", "prix-et-taux"],
  ["emprunt-etat", "taux-apparent"],
  ["retraites", "repartition-capitalisation"],
  ["retraites", "demographie"],
  ["retraites", "leviers"],
  ["fiche-de-paie"],
];

export const parcours: Parcours[] = [
  {
    id: "decouvrir",
    titre: "Je découvre",
    accroche:
      "L'essentiel en une demi-heure : d'où vient l'argent public, pourquoi la dette monte, comment l'État emprunte, qui paie les retraites, ce qui reste sur la fiche de paie, et ce que valent les solutions qu'on entend.",
    duree: "≈ 30 min",
    mode: "simple",
    etapes: [
      ...DECOUVRIR.map(([m, s]) => etapeModule(mod(m), s)),
      {
        href: "/propositions/",
        titre: "Propositions passées au crible",
        groupe: "Propositions passées au crible",
        disponible: false,
      },
    ],
  },
  {
    id: "approfondir",
    titre: "J'approfondis",
    accroche:
      "Tous les modules et toutes les sections, avec les formules, les nuances et les débats d'économistes dépliés.",
    duree: "plusieurs heures, à votre rythme",
    mode: "approfondi",
    etapes: modules.flatMap((m) => [etapeModule(m), ...m.sections.map((s) => etapeModule(m, s.slug))]),
  },
];

export function getParcours(id: ParcoursId): Parcours {
  return parcours.find((p) => p.id === id)!;
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

/** Position d'une page dans un parcours (1 = première étape), ou 0 si absente. */
export function positionDans(p: Parcours, href: string): number {
  return p.etapes.findIndex((e) => e.href === href) + 1;
}
