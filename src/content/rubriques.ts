import { getModule, moduleHref, type ModuleInfo } from "./modules";

/**
 * Organisation du site pour le lecteur : cinq rubriques (le menu), les douze
 * modules rangés en quatre parties, comme les chapitres d'un manuel, et l'index des simulateurs. Les adresses
 * existantes ne changent pas : chaque rubrique regroupe des pages par préfixe.
 */

export interface Rubrique {
  id: "accueil" | "comprendre" | "decrypter" | "actu" | "jouer";
  href: string;
  label: string;
  description: string;
  /** Préfixes d'adresse rattachés à la rubrique (repère dans le menu, fil d'Ariane). */
  prefixes: string[];
}

export const rubriques: Rubrique[] = [
  { id: "accueil", href: "/", label: "Accueil", description: "Les portes d'entrée du site et les dernières actualités.", prefixes: [] },
  {
    id: "comprendre",
    href: "/comprendre/",
    label: "Comprendre",
    description: "Les mécanismes des finances publiques en douze modules, avec le glossaire et la France en 10 chiffres.",
    prefixes: ["/comprendre/", "/modules/", "/glossaire/", "/la-france-en-10-chiffres/"],
  },
  {
    id: "decrypter",
    href: "/decrypter/",
    label: "Décrypter",
    description: "Les propositions du débat public passées au crible, et les idées reçues vérifiées.",
    prefixes: ["/decrypter/", "/propositions/", "/idees-recues/"],
  },
  {
    id: "actu",
    href: "/actu/",
    label: "L'actu",
    description: "Ce qui bouge : indicateurs, alertes, échéances et publications officielles.",
    prefixes: ["/actu/", "/tableau-de-bord/"],
  },
  {
    id: "jouer",
    href: "/jouer/",
    label: "Jouer",
    description: "Deux jeux pour se mettre à la place des décideurs, et tous les simulateurs du site.",
    prefixes: ["/jouer/", "/jeux/", "/jeu-budget/"],
  },
];

export function getRubrique(id: Rubrique["id"]): Rubrique {
  return rubriques.find((r) => r.id === id)!;
}

/** Rubrique d'une adresse ; l'accueil n'est rattaché qu'à « / ». */
export function rubriqueDe(chemin: string): Rubrique | undefined {
  const c = chemin.endsWith("/") ? chemin : `${chemin}/`;
  if (c === "/") return rubriques[0];
  return rubriques.find((r) => r.prefixes.some((p) => c.startsWith(p)));
}

/* ------------------------------------------------------------- Thèmes */

export interface GrandTheme {
  slug: string;
  titre: string;
  description: string;
  modules: string[];
}

export const themes: GrandTheme[] = [
  {
    slug: "les-bases",
    titre: "Les bases",
    description: "PIB, recettes, dépenses, inflation, puis la différence entre le déficit et la dette : les notions de départ.",
    modules: ["les-bases", "deficit-et-dette"],
  },
  {
    slug: "la-dette",
    titre: "La dette",
    description: "Comment l'État emprunte, ce que coûtent les intérêts, le rôle de la banque centrale, et ce que pèse vraiment la dette.",
    modules: ["emprunt-etat", "boule-de-neige", "banque-centrale", "dette-en-perspective"],
  },
  {
    slug: "retraites-impots-budget",
    titre: "Retraites, impôts et budget",
    description: "Qui paie les impôts, ce que deviennent les cotisations prélevées sur un salaire, et comment se financent les retraites.",
    modules: ["fiscalite", "fiche-de-paie", "retraites"],
  },
  {
    slug: "france-et-monde",
    titre: "La France et le monde",
    description: "Les règles européennes et les agences de notation, la France comparée aux autres pays, et les leçons de l'histoire.",
    modules: ["cadre-europeen", "comparaisons", "histoire-des-dettes"],
  },
];

export function themeDuModule(slug: string): GrandTheme {
  const t = themes.find((x) => x.modules.includes(slug));
  if (!t) throw new Error(`Module sans thème : ${slug} (à ranger dans src/content/rubriques.ts)`);
  return t;
}

export const themeHref = (t: GrandTheme) => `/comprendre/#${t.slug}`;

export const modulesDuTheme = (t: GrandTheme): ModuleInfo[] => t.modules.map(getModule);

/* -------------------------------------------------------- Simulateurs */

export interface Simulateur {
  titre: string;
  description: string;
  href: string;
  theme: GrandTheme["slug"] | "propositions";
}

/** Tous les simulateurs du site, chacun sur sa page. */
export const simulateurs: Simulateur[] = [
  { titre: "La baignoire", description: "Le déficit remplit la dette, année après année.", href: moduleHref("deficit-et-dette", "flux-et-stock"), theme: "les-bases" },
  { titre: "Jouez une adjudication", description: "Placer des OAT auprès des investisseurs, au meilleur prix.", href: moduleHref("emprunt-etat", "aft-adjudications"), theme: "la-dette" },
  { titre: "Le prix d'une obligation", description: "Quand les taux montent, le prix des anciennes obligations baisse.", href: moduleHref("emprunt-etat", "prix-et-taux"), theme: "la-dette" },
  { titre: "La dette en couches", description: "Le refinancement progressif de la dette au nouveau taux.", href: moduleHref("emprunt-etat", "taux-apparent"), theme: "la-dette" },
  { titre: "La trajectoire de la dette", description: "Taux, croissance, solde primaire : l'effet boule de neige.", href: moduleHref("boule-de-neige", "simulateur"), theme: "la-dette" },
  { titre: "Le bilan d'une banque centrale", description: "Ce que deviennent les titres rachetés, en trois scénarios.", href: moduleHref("banque-centrale", "bilan-bdf"), theme: "la-dette" },
  { titre: "Taux nominal, inflation, taux réel", description: "Ce que valent vraiment 100 € prêtés pendant un an.", href: moduleHref("les-bases", "inflation-taux-reels"), theme: "les-bases" },
  { titre: "Les taxes dans un budget mensuel", description: "TVA, taxes sur l'énergie : ce que contient un budget type.", href: moduleHref("fiscalite", "qui-paie"), theme: "retraites-impots-budget" },
  { titre: "Du coût employeur au salaire net", description: "Cotisations, allègements, CSG : de l'un à l'autre.", href: moduleHref("fiscalite", "smic"), theme: "retraites-impots-budget" },
  { titre: "Taxer les plus grandes fortunes", description: "Ce que rapporterait un impôt sur les très hauts patrimoines.", href: moduleHref("fiscalite", "taxer-les-riches"), theme: "retraites-impots-budget" },
  { titre: "Les trois leviers des retraites", description: "Âge de départ, cotisations, pensions : équilibrer le système.", href: moduleHref("retraites", "leviers"), theme: "retraites-impots-budget" },
  { titre: "Ma fiche de paie", description: "Du coût employeur à ce qui reste en poche, et les taxes du panier.", href: moduleHref("fiche-de-paie"), theme: "retraites-impots-budget" },
  { titre: "Annuler la dette de la banque centrale", description: "Ce que change l'annulation, et pour qui.", href: "/propositions/annuler-dette-banque-centrale/", theme: "propositions" },
  { titre: "Relancer pour réduire la dette", description: "Taux d'intérêt, croissance et dette sur plusieurs années.", href: "/propositions/relance-pour-reduire-la-dette/", theme: "propositions" },
  { titre: "Revenir à la retraite à 60 ans", description: "Ce qu'il faudrait changer pour financer un départ plus tôt.", href: "/propositions/retraite-a-60-ans/", theme: "propositions" },
];
