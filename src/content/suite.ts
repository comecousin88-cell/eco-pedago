import { getModule, moduleHref, neighbours } from "./modules";
import { getProposition, propositionHref, propositions, propositionsLiees } from "./propositions";
import { getRubrique, themeDuModule, themeHref, themes } from "./rubriques";

/**
 * Bloc « Et ensuite ? » : deux ou trois suggestions en bas de chaque page,
 * choisies par des règles fixes (section suivante, proposition liée, page
 * pratique du thème), jamais au hasard.
 */

export interface Suggestion {
  href: string;
  titre: string;
  /** Pourquoi cette suggestion : « Section suivante », « Une proposition liée »… */
  raison: string;
}

const TABLEAU = { href: "/tableau-de-bord/", titre: "Le tableau de bord", raison: "Suivre les chiffres" };
const DIX = { href: "/la-france-en-10-chiffres/", titre: "La France en 10 chiffres", raison: "Le point de départ" };
const REDRESSER = { href: "/jeux/redresser-les-comptes/", titre: "Redresser les comptes", raison: "Passer à la pratique" };
const IDEES = { href: "/idees-recues/", titre: "Idées reçues", raison: "Vérifier ce qu'on entend" };
const CRIBLE = { href: "/propositions/", titre: "Les propositions au crible", raison: "Se faire un avis" };
const GLOSSAIRE = { href: "/glossaire/", titre: "Le glossaire", raison: "Retrouver un terme" };
const rubrique = (id: Parameters<typeof getRubrique>[0], raison: string) => {
  const r = getRubrique(id);
  return { href: r.href, titre: r.label, raison };
};

/** Page « pratique » proposée en fin de module, selon la partie. */
const PRATIQUE: Record<string, Suggestion> = {
  "les-bases": DIX,
  "la-dette": TABLEAU,
  "retraites-impots-budget": REDRESSER,
  "france-et-monde": DIX,
};

/** Suggestions pour une page de module (introduction ou section). */
export function suiteModule(moduleSlug: string, section?: string): Suggestion[] {
  const res: Suggestion[] = [];
  const { next } = neighbours(moduleSlug, section);
  if (next) res.push({ href: next.href, titre: next.title, raison: next.module.slug === moduleSlug ? "Section suivante" : "Module suivant" });
  const liee = propositionsLiees(moduleSlug, section)[0] ?? propositions.find((p) => p.module === moduleSlug && p.contenu);
  if (liee) res.push({ href: propositionHref(liee.slug), titre: liee.titre, raison: "Une proposition liée" });
  const pratique = PRATIQUE[themeDuModule(moduleSlug).slug];
  if (pratique && !res.some((s) => s.href === pratique.href) && pratique.href !== moduleHref(moduleSlug, section)) res.push(pratique);
  // Fin d'une partie : le premier module de la partie suivante, puis les propositions au crible.
  if (res.length < 2) {
    const i = themes.findIndex((t) => t.modules.includes(moduleSlug));
    const suivant = themes[(i + 1) % themes.length];
    const m = getModule(suivant.modules[0]);
    res.push({ href: moduleHref(m.slug), titre: m.title, raison: `Partie suivante : ${suivant.titre}` });
  }
  if (res.length < 2) res.push(CRIBLE);
  return res.slice(0, 3);
}

/** Suggestions pour une fiche « au crible ». */
export function suiteProposition(slug: string): Suggestion[] {
  const p = getProposition(slug);
  if (!p) return [CRIBLE, IDEES];
  const lien = p.liens[0] ?? { module: p.module };
  const m = getModule(lien.module);
  const section = lien.section ? m.sections.find((s) => s.slug === lien.section) : undefined;
  const autre = propositions.find((q) => q.slug !== slug && q.contenu && q.themes[0] === p.themes[0]);
  return [
    { href: moduleHref(lien.module, lien.section), titre: section?.title ?? m.title, raison: "Comprendre le mécanisme" },
    ...(autre ? [{ href: propositionHref(autre.slug), titre: autre.titre, raison: "Une autre proposition du même thème" }] : []),
    IDEES,
  ].slice(0, 3);
}

/** Suggestions des pages fixes, par adresse. */
const PAGES: Record<string, Suggestion[]> = {
  "/comprendre/": [DIX, { href: moduleHref("les-bases"), titre: "Les bases", raison: "Commencer par le début" }, rubrique("decrypter", "Se faire un avis")],
  "/decrypter/": [CRIBLE, IDEES, rubrique("comprendre", "Revoir les mécanismes")],
  "/actu/": [TABLEAU, { href: themeHref(themes.find((t) => t.slug === "la-dette")!), titre: "Comprendre la dette", raison: "Les mécanismes derrière les chiffres" }, CRIBLE],
  "/jouer/": [REDRESSER, { href: moduleHref("boule-de-neige"), titre: "L'effet boule de neige", raison: "Pourquoi le déficit compte" }, rubrique("comprendre", "Revoir les mécanismes")],
  "/glossaire/": [DIX, { href: moduleHref("les-bases"), titre: "Les bases", raison: "Les notions dans leur contexte" }, IDEES],
  "/la-france-en-10-chiffres/": [TABLEAU, { href: moduleHref("deficit-et-dette"), titre: "Déficit et dette", raison: "Comprendre ces chiffres" }, CRIBLE],
  "/propositions/": [IDEES, rubrique("comprendre", "Revoir les mécanismes"), REDRESSER],
  "/idees-recues/": [CRIBLE, DIX, GLOSSAIRE],
  "/tableau-de-bord/": [rubrique("actu", "Toute l'actualité"), DIX, { href: moduleHref("emprunt-etat", "spread-notation"), titre: "Spread, notation, courbe des taux", raison: "Lire les taux" }],
  "/jeux/redresser-les-comptes/": [{ href: moduleHref("boule-de-neige"), titre: "L'effet boule de neige", raison: "Pourquoi le déficit compte" }, { href: moduleHref("cadre-europeen", "regles"), titre: "Les règles budgétaires", raison: "Les contraintes européennes" }, CRIBLE],
  "/sources/": [DIX, TABLEAU, GLOSSAIRE],
};

export function suitePage(chemin: string): Suggestion[] {
  const s = PAGES[chemin];
  if (!s) throw new Error(`Pas de suggestions pour ${chemin} (à ajouter dans src/content/suite.ts)`);
  return s;
}

export const pagesAvecSuite = Object.keys(PAGES);
