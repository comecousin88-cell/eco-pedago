import { glossaire } from "./glossaire";
import { idees } from "./idees-recues";
import { indicateurs } from "./indicateurs";
import { moduleHref, modules } from "./modules";
import { propositionHref, propositions } from "./propositions";
import { rubriques, simulateurs, themeDuModule, themes, themeHref } from "./rubriques";
import type { EntreeRecherche } from "@/lib/recherche";

/**
 * Index de la recherche du site, construit à la publication
 * (src/app/recherche.json/route.ts) : pages, modules et sections, fiches,
 * idées reçues, termes du glossaire et simulateurs. Rien n'est envoyé à un
 * service extérieur : la recherche se fait dans le navigateur.
 */

const PAGES_FIXES: EntreeRecherche[] = [
  { type: "Page", titre: "La France en 10 chiffres", extrait: "La situation des finances publiques en un coup d'œil.", href: "/la-france-en-10-chiffres/" },
  { type: "Page", titre: "Tableau de bord", extrait: "Les sept indicateurs à suivre : taux, inflation, chômage, dette, déficit.", href: "/tableau-de-bord/", motsCles: "indicateurs taux bce inflation chômage" },
  { type: "Page", titre: "Glossaire", extrait: "Tous les termes techniques du site, expliqués simplement.", href: "/glossaire/" },
  { type: "Page", titre: "Idées reçues", extrait: "Les affirmations qu'on entend souvent, vérifiées.", href: "/idees-recues/" },
  { type: "Page", titre: "Les propositions au crible", extrait: "Chaque proposition du débat public analysée, avec un verdict.", href: "/propositions/" },
  { type: "Page", titre: "Redresser les comptes", extrait: "Choisir des mesures chiffrées pour réduire le déficit.", href: "/jeux/redresser-les-comptes/", motsCles: "jeu budget" },
  { type: "Page", titre: "Ministre des Finances", extrait: "Tenir le budget pendant un mandat de cinq ans.", href: "/jeux/ministre-des-finances/", motsCles: "jeu budget" },
  { type: "Page", titre: "Sources et méthode", extrait: "D'où viennent les chiffres et comment ils sont vérifiés.", href: "/sources/" },
];

export function indexRecherche(): EntreeRecherche[] {
  const entrees: EntreeRecherche[] = [
    ...rubriques.filter((r) => r.id !== "accueil").map((r) => ({ type: "Page" as const, titre: r.label, extrait: r.description, href: r.href })),
    ...themes.map((t) => ({ type: "Page" as const, titre: t.titre, extrait: t.description, href: themeHref(t), motsCles: "thème comprendre" })),
    ...PAGES_FIXES,
  ];
  for (const m of modules.filter((x) => x.status === "available")) {
    const theme = themeDuModule(m.slug).titre;
    entrees.push({ type: "Module", titre: m.title, extrait: m.question, href: moduleHref(m.slug), motsCles: `${theme} ${m.summary}` });
    for (const s of m.sections) entrees.push({ type: "Section", titre: s.title, extrait: m.title, href: moduleHref(m.slug, s.slug), motsCles: theme });
  }
  for (const p of propositions.filter((x) => x.contenu)) {
    entrees.push({ type: "Fiche", titre: p.titre, extrait: p.resume, href: propositionHref(p.slug), motsCles: p.themes.join(" ") });
  }
  for (const i of idees) entrees.push({ type: "Idée reçue", titre: i.affirmation, extrait: i.lien.libelle, href: `/idees-recues/#${i.id}` });
  for (const g of glossaire) entrees.push({ type: "Glossaire", titre: g.terme, extrait: g.court, href: `/glossaire/#${g.id}` });
  for (const i of indicateurs) entrees.push({ type: "Page", titre: i.titre, extrait: "Indicateur du tableau de bord", href: "/tableau-de-bord/", motsCles: "indicateur actu" });
  for (const s of simulateurs) entrees.push({ type: "Simulateur", titre: s.titre, extrait: s.description, href: s.href, motsCles: "simulateur jouer" });
  return entrees;
}
