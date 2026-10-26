import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, it } from "vitest";
import { FinDeSection } from "@/components/modules/FinDeSection";

const racine = fileURLToPath(new URL("../../", import.meta.url));
const lire = (f: string) => readFileSync(`${racine}${f}`, "utf8");

// Stockage du navigateur simulé.
const memoire = new Map<string, string>();
Object.assign(globalThis, {
  localStorage: { getItem: (k: string) => memoire.get(k) ?? null, setItem: (k: string, v: string) => void memoire.set(k, v) },
  window: { addEventListener() {}, removeEventListener() {} },
});
const { effacerProgression, enregistrerQuiz, marquerLue } = await import("./progression");
const etat = () => JSON.parse(memoire.get("progression") ?? '{"lues":[],"quiz":{}}');

describe("progression", () => {
  beforeEach(() => memoire.clear());

  it("une section n'est lue qu'en arrivant en fin de section ou par le bouton « J'ai compris »", () => {
    // Afficher la page ne note plus rien : la page de module n'appelle plus MarquerLue à l'ouverture.
    const page = lire("src/components/modules/PageModule.tsx");
    expect(page).not.toMatch(/<MarquerLue/);
    expect(page).toMatch(/<FinDeSection href=\{href\} suivante=\{suivante\} \/>/);
    expect(page.indexOf("<FinDeSection")).toBeGreaterThan(page.indexOf("</article>"));
    // Le repère de fin et le bouton, rendus côté serveur, ne marquent rien.
    const html = renderToStaticMarkup(createElement(FinDeSection, { href: "/modules/x/a/", suivante: { href: "/modules/x/b/", titre: "B" } }));
    expect(html).toContain("data-fin-de-section");
    expect(html.replace(/<[^>]+>/g, "")).toMatch(/J&#x27;ai compris → section suivante/);
    expect(etat().lues).toEqual([]);
    // Le repère vu ou le bouton cliqué appellent marquerLue.
    expect(lire("src/components/modules/FinDeSection.tsx")).toMatch(/isIntersecting && marquerLue\(href\)/);
    marquerLue("/modules/x/a/");
    expect(etat().lues).toEqual(["/modules/x/a/"]);
  });

  it("« Recommencer à zéro » efface seulement le parcours ou le module visé", () => {
    for (const h of ["/modules/x/", "/modules/x/a/", "/modules/y/a/"]) marquerLue(h);
    enregistrerQuiz("x", 2, 3);
    enregistrerQuiz("y", 1, 3);
    effacerProgression(["/modules/x/", "/modules/x/a/"], ["x"]);
    expect(etat()).toEqual({ lues: ["/modules/y/a/"], quiz: { y: { score: 1, total: 3 } } });
    // Avec confirmation, sur les cartes des parcours et dans le panneau de chaque module.
    expect(lire("src/components/lecture/BoutonRecommencer.tsx")).toMatch(/window\.confirm\(message\)/);
    expect(lire("src/components/lecture/BoutonRecommencer.tsx")).toContain('title="Recommencer à zéro"');
    expect(lire("src/components/lecture/CartesParcours.tsx")).toContain("Ta progression sur ce parcours sera effacée. Continuer ?");
    expect(lire("src/components/modules/ProgressionModule.tsx")).toContain("<BoutonRecommencer");
  });

  it("à zéro, le bouton affiche « Commencer »", () => {
    expect(lire("src/components/lecture/CartesParcours.tsx")).toMatch(/commence \? "Reprendre" : "Commencer"/);
  });
});
