import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import type { MDXContent } from "mdx/types";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { texteVisible } from "@/lib/lecture-modes.test";
import { paragraphesTropLongs, SOURCE_ENTRE_PARENTHESES, texteMdx } from "@/lib/lisibilite";
import { glossaire } from "./glossaire";
import { motifTerme } from "./glossaire-formes";
import { modules } from "./modules";

const racine = fileURLToPath(new URL("../../", import.meta.url));

/** Toutes les pages des 12 modules : introduction, puis chaque section. */
const pages = modules.flatMap((m) => ["index", ...m.sections.map((s) => s.slug)].map((p) => ({ page: `${m.slug}/${p}`, module: m.slug, fichier: p })));
const lire = (module: string, fichier: string) => readFileSync(`${racine}src/content/modules/${module}/${fichier}.mdx`, "utf8");

describe("lisibilité des modules", () => {
  it.each(pages)("chaque terme du glossaire présent ouvre son infobulle : $page", ({ module, fichier }) => {
    const mdx = lire(module, fichier);
    const texte = texteMdx(mdx);
    expect(glossaire.filter((g) => motifTerme(g.id).test(texte) && !mdx.includes(`<Terme id="${g.id}"`)).map((g) => g.id)).toEqual([]);
  });

  it.each(pages)("paragraphes de deux à trois lignes dans ce que lit le mode Simple : $page", ({ module, fichier }) => {
    expect(paragraphesTropLongs(lire(module, fichier))).toEqual([]);
  });

  it.each(pages)("aucune source entre parenthèses dans le texte : $page", async ({ module, fichier }) => {
    const { default: Page } = (await import(`./modules/${module}/${fichier}.mdx`)) as { default: MDXContent };
    // La version d'un indicateur (« IPC Insee, septembre 2026, provisoire ») reste dite à côté du chiffre : ce n'est pas une source.
    const html = renderToStaticMarkup(createElement(Page)).replace(/<span class="chiffre-source">[^<]*<\/span>/g, "");
    for (const mode of ["simple", "approfondi"] as const) expect(texteVisible(html, mode).match(SOURCE_ENTRE_PARENTHESES)?.[0], mode).toBeUndefined();
  });

  it("la page de module liste ses sources en bas", () => {
    const page = readFileSync(`${racine}src/components/modules/PageModule.tsx`, "utf8");
    expect(page).toMatch(/<SourcesPage sources=\{sources\} \/>/);
  });
});
