import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { createElement, Fragment, type ComponentType } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { Chiffre } from "@/components/pedago/Chiffre";
import { ApprofondiModule } from "@/components/modules/ApprofondiModule";
import { contenus } from "@/content/modules/contenus";
import { modules } from "@/content/modules";
import { analyserMdx } from "./approfondi";
import { arrondiLecture, sourceCourte } from "./format";
import { messageChangement } from "./lecture";

/**
 * Ce que voit le lecteur dans un mode : le HTML rendu, moins les éléments que
 * le CSS du site masque dans ce mode (globals.css) — data-selon-mode de l'autre
 * mode, et les formules en bloc (.katex-display) en mode Simple.
 */
export function texteVisible(html: string, mode: "simple" | "approfondi"): string {
  const autre = mode === "simple" ? "approfondi" : "simple";
  let h = html;
  const ouverture = new RegExp(`<([a-z][a-z0-9]*)\\b[^>]*(?:data-selon-mode="${autre}"${mode === "simple" ? '|class="katex-display"' : ""})[^>]*>`, "i");
  for (let m = ouverture.exec(h); m; m = ouverture.exec(h)) {
    const balise = m[1];
    const re = new RegExp(`<${balise}\\b[^>]*>|</${balise}>`, "gi");
    re.lastIndex = m.index + m[0].length;
    let profondeur = 1;
    let fin = h.length;
    for (let t = re.exec(h); t; t = re.exec(h)) {
      profondeur += t[0].startsWith("</") ? -1 : 1;
      if (profondeur === 0) {
        fin = t.index + t[0].length;
        break;
      }
    }
    h = h.slice(0, m.index) + h.slice(fin);
  }
  return h
    .replace(/<[^>]+>/g, " ")
    .replace(/&[a-z#0-9]+;/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
}

const css = readFileSync(fileURLToPath(new URL("../app/globals.css", import.meta.url)), "utf8");

describe("ce que change le mode de lecture", () => {
  it("le CSS masque le contenu de l'autre mode", () => {
    expect(css).toMatch(/\[data-lecture="simple"\] \[data-selon-mode="approfondi"\]/);
    expect(css).toMatch(/\[data-lecture="simple"\] \.prose-eco \.katex-display/);
    expect(css).toMatch(/\[data-lecture="approfondi"\] \[data-selon-mode="simple"\]/);
  });

  it("arrondit les chiffres en mode Simple", () => {
    expect(arrondiLecture(4.44)).toEqual({ valeur: 4.4, decimales: 1 });
    expect(arrondiLecture(119.0)).toEqual({ valeur: 119, decimales: 0 });
    expect(arrondiLecture(3595.5)).toEqual({ valeur: 3600, decimales: 0 });
    expect(arrondiLecture(69.1)).toEqual({ valeur: 69, decimales: 0 });
    expect(arrondiLecture(-5.1)).toEqual({ valeur: -5.1, decimales: 1 });
    expect(arrondiLecture(2.96)).toEqual({ valeur: 3, decimales: 0 });
    expect(sourceCourte("Insee, dette trimestrielle (série 010777616)")).toBe("Insee");
  });

  it("un chiffre est arrondi en Simple, précis et sourcé en Approfondi", () => {
    const html = renderToStaticMarkup(createElement(Chiffre, { id: "dette.stock" }));
    expect(texteVisible(html, "simple")).toBe("3 600 Md€");
    expect(texteVisible(html, "approfondi")).toMatch(/^3 595,5 Md€ \(Insee\)$/);
  });

  it("annonce le nombre de sections ajoutées ou masquées", () => {
    expect(messageChangement("approfondi", 3, true)).toBe("Mode Approfondi : 3 sections ajoutées sur cette page, chiffres précis avec leur source.");
    expect(messageChangement("simple", 1, false)).toBe("Mode Simple : 1 section masquée sur cette page.");
  });

  it("repère débats, formules et « Pour aller plus loin » dans un texte", () => {
    expect(analyserMdx('<Debat question="Faut-il ?" pour={1} /> $$a$$ <PlusLoin>x</PlusLoin>')).toEqual({ plusLoin: 1, debats: ["Faut-il ?"], formules: 1 });
  });
});

// Chaque page de module (introduction et sections), rendue pour de vrai, dans les deux modes.
const pages = Object.entries(contenus).flatMap(([slug, c]) => [
  { nom: `${slug} (introduction)`, slug, charger: c.intro, intro: true },
  ...Object.entries(c.sections).map(([s, charger]) => ({ nom: `${slug}/${s}`, slug, charger, intro: false })),
]);

describe("chaque page de module diffère entre les deux modes", () => {
  it("toutes les pages de module sont contrôlées", () => {
    const attendu = modules.filter((m) => m.status === "available").reduce((n, m) => n + 1 + m.sections.length, 0);
    expect(pages).toHaveLength(attendu);
  });

  it.each(pages.map((p) => [p.nom, p] as const))("%s", async (_, p) => {
    const { default: Contenu } = (await p.charger()) as { default: ComponentType };
    const html = renderToStaticMarkup(
      createElement(Fragment, null, createElement(Contenu), p.intro ? createElement(ApprofondiModule, { module: p.slug }) : null),
    );
    const simple = texteVisible(html, "simple");
    const approfondi = texteVisible(html, "approfondi");
    expect(simple.length, "la page est vide").toBeGreaterThan(200);
    // Le mode Approfondi ajoute du texte (sections, débats, formules), pas seulement des chiffres plus précis.
    expect(approfondi.length - simple.length, "le mode Approfondi n'ajoute presque rien").toBeGreaterThan(150);
    expect(simple).not.toBe(approfondi);
  }, 20_000);
});
