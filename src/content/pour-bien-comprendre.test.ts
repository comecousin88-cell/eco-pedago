import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { pagesDuSite } from "./plan-du-site";
import { modules } from "./modules";
import { propositions } from "./propositions";
import { pourBienComprendre } from "./pour-bien-comprendre";

const racine = fileURLToPath(new URL("../../", import.meta.url));

/** Tournures typiques des textes générés, à éviter dans ces blocs. */
const TOURNURES = [
  /il convient de/i,
  /en somme/i,
  /il est important de/i,
  /force est de constater/i,
  /en définitive/i,
  /notons que/i,
  /il est essentiel/i,
  /dans un contexte/i,
  /par ailleurs/i,
  /en effet/i,
];

describe("blocs « Pour bien comprendre »", () => {
  it("chaque notion listée renvoie à une page publique du site", () => {
    const pages = new Set(pagesDuSite());
    for (const n of pourBienComprendre) expect(pages, n.page).toContain(n.page);
    expect(new Set(pourBienComprendre.map((n) => n.fichier)).size).toBe(pourBienComprendre.length);
  });

  it.each(pourBienComprendre)("$notion", ({ fichier }) => {
    const mdx = readFileSync(`${racine}${fichier}`, "utf8");
    const bloc = /<PourBienComprendre titre="[^"]+">([\s\S]*?)<\/PourBienComprendre>/.exec(mdx);
    expect(bloc, "bloc absent").not.toBeNull();
    // Avant la partie technique.
    expect(mdx.indexOf("<PourBienComprendre")).toBeLessThan(mdx.indexOf("<Niveaux>"));
    const contenu = bloc![1];
    const partie = (nom: string) => new RegExp(`<${nom}>([\\s\\S]*?)</${nom}>`).exec(contenu)?.[1].trim() ?? "";
    expect(partie("Analogie").length, "analogie").toBeGreaterThan(80);
    // Le mécanisme : trois étapes au plus, avec au moins un chiffre rond.
    const etapes = partie("PasAPas").match(/^\d+\. /gm) ?? [];
    expect(etapes.length).toBeGreaterThanOrEqual(2);
    expect(etapes.length).toBeLessThanOrEqual(3);
    expect(partie("PasAPas")).toMatch(/\d+ ?(€|%)/);
    expect(partie("Retenir").length, "phrase à retenir").toBeGreaterThan(40);
    for (const t of TOURNURES) expect(contenu, String(t)).not.toMatch(t);
    // Phrases courtes : aucune phrase de plus de 40 mots.
    for (const phrase of contenu.replace(/<[^>]+>/g, " ").split(/[.!?]\s/)) expect(phrase.trim().split(/\s+/).length, phrase.slice(0, 80)).toBeLessThanOrEqual(40);
  });
});

/** Chaque section de module (ou module d'une seule page) et chaque fiche rédigée, avec son fichier. */
const pagesExpliquees = [
  ...modules.flatMap((m) =>
    m.sections.length
      ? m.sections.map((sec) => ({ page: `${m.slug}/${sec.slug}`, fichier: `src/content/modules/${m.slug}/${sec.slug}.mdx` }))
      : [{ page: m.slug, fichier: `src/content/modules/${m.slug}/index.mdx` }],
  ),
  ...propositions.filter((p) => p.contenu).map((p) => ({ page: `fiche ${p.slug}`, fichier: `src/content/propositions/${p.slug}.mdx` })),
];

describe("« Pour bien comprendre » ou « À retenir » partout", () => {
  it.each(pagesExpliquees)("$page", ({ fichier }) => {
    const mdx = readFileSync(`${racine}${fichier}`, "utf8");
    expect(/<PourBienComprendre titre=|<ARetenir>|<Retenir>/.test(mdx), "ni bloc « Pour bien comprendre » ni phrase « À retenir »").toBe(true);
  });

  it("couvre les sections des 12 modules et toutes les fiches", () => {
    expect(pagesExpliquees.length).toBe(modules.reduce((n, m) => n + Math.max(1, m.sections.length), 0) + propositions.filter((p) => p.contenu).length);
  });
});
