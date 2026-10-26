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
  window: { addEventListener() {}, removeEventListener() {}, location: { pathname: "/" }, dispatchEvent: (e: Event) => void evenements.push(e.type) },
});
const evenements: string[] = [];
const { effacerProgression, enregistrerQuiz, marquerLue, passerSection } = await import("./progression");
const { etatsSections, versSectionEnCours, EVENEMENT_TERMINER, MESSAGE_TERMINER } = await import("./etapes-module");
const etat = () => JSON.parse(memoire.get("progression") ?? '{"lues":[],"quiz":{}}');

describe("progression", () => {
  beforeEach(() => memoire.clear());

  it("une section n'est lue qu'en arrivant en fin de section ou par le bouton « J'ai compris »", () => {
    // Afficher la page ne note plus rien : la page de module n'appelle plus MarquerLue à l'ouverture.
    const page = lire("src/components/modules/PageModule.tsx");
    expect(page).not.toMatch(/<MarquerLue/);
    expect(page).toMatch(/<FinDeSection href=\{href\} suivante=\{suivante\} sections=/);
    expect(page.indexOf("<FinDeSection")).toBeGreaterThan(page.indexOf("</article>"));
    // Le repère de fin et le bouton, rendus côté serveur, ne marquent rien.
    const html = renderToStaticMarkup(createElement(FinDeSection, { href: "/modules/x/a/", suivante: { href: "/modules/x/b/", titre: "B" } }));
    expect(html).toContain("data-fin-de-section");
    expect(html.replace(/<[^>]+>/g, "")).toMatch(/J&#x27;ai compris → section suivante/);
    expect(etat().lues).toEqual([]);
    // Le repère vu ou le bouton cliqué appellent marquerLue.
    expect(lire("src/components/modules/FinDeSection.tsx")).toMatch(/isIntersecting && !defilementSignale\.current && marquerLue\(href\)/);
    marquerLue("/modules/x/a/");
    expect(etat().lues).toEqual(["/modules/x/a/"]);
  });

  it("« Recommencer à zéro » efface seulement le parcours ou le module visé", () => {
    for (const h of ["/modules/x/", "/modules/x/a/", "/modules/y/a/"]) marquerLue(h);
    enregistrerQuiz("x", 2, 3);
    enregistrerQuiz("y", 1, 3);
    effacerProgression(["/modules/x/", "/modules/x/a/"], ["x"]);
    passerSection("/modules/x/a/");
    effacerProgression(["/modules/x/", "/modules/x/a/"], ["x"]);
    expect(etat()).toEqual({ lues: ["/modules/y/a/"], passees: [], quiz: { y: { score: 1, total: 3 } } });
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

describe("progression étape par étape dans un module", () => {
  const [a, b, c, d] = ["/modules/x/a/", "/modules/x/b/", "/modules/x/c/", "/modules/x/d/"];
  const sections = [a, b, c, d];
  beforeEach(() => {
    memoire.clear();
    evenements.length = 0;
  });

  it("sections validées accessibles, section en cours, suivantes verrouillées", () => {
    expect(etatsSections(sections, [], [])).toEqual(["en-cours", "verrouillee", "verrouillee", "verrouillee"]);
    expect(etatsSections(sections, [a], [])).toEqual(["validee", "en-cours", "verrouillee", "verrouillee"]);
  });

  it("sections cochées dans le désordre : elles restent validées, la section en cours est la première non validée", () => {
    expect(etatsSections(sections, [a, c], [])).toEqual(["validee", "en-cours", "validee", "verrouillee"]);
    expect(etatsSections(sections, [b, d], [])).toEqual(["en-cours", "validee", "verrouillee", "validee"]);
  });

  it("« Passer cette section » déverrouille la suivante sans marquer la section comme lue", () => {
    passerSection(a);
    expect(etat().lues).toEqual([]);
    expect(etat().passees).toEqual([a]);
    expect(etatsSections(sections, etat().lues, etat().passees)).toEqual(["passee", "en-cours", "verrouillee", "verrouillee"]);
    // Une progression enregistrée avant cette option se lit sans liste `passees`.
    memoire.set("progression", JSON.stringify({ lues: [a], quiz: {} }));
    expect(etat().passees).toBeUndefined();
    marquerLue(b);
    expect(etat()).toEqual({ lues: [a, b], passees: [], quiz: {} });
  });

  it("le lien « Passer cette section » n'apparaît que sur la section en cours, à côté du bouton", () => {
    const rendu = (href: string, suivante: string) =>
      renderToStaticMarkup(createElement(FinDeSection, { href, suivante: { href: suivante, titre: "Suite" }, sections })).replace(/<[^>]+>/g, " ").replace(/\s+/g, " ");
    expect(rendu(a, b)).toMatch(/J&#x27;ai compris → section suivante.*Passer cette section/);
    expect(rendu(b, c)).not.toContain("Passer cette section");
    expect(lire("src/components/modules/FinDeSection.tsx")).toMatch(/onClick=\{\(\) => passerSection\(href\)\}/);
  });

  it("clic sur une section verrouillée : défilement jusqu'au bouton de la section en cours, mis en évidence avec un message", () => {
    // Sur la page de la section en cours : le lien ne navigue pas, il signale l'événement.
    (globalThis.window.location as { pathname: string }).pathname = "/modules/x/b";
    expect(versSectionEnCours(b)).toBe(true);
    expect(evenements).toEqual([EVENEMENT_TERMINER]);
    // Ailleurs : le lien mène à la section en cours, avec l'ancre « #terminer ».
    expect(versSectionEnCours(a)).toBe(false);
    expect(evenements).toHaveLength(1);
    expect(MESSAGE_TERMINER).toBe("Termine d’abord cette section pour passer à la suivante.");
    const fin = lire("src/components/modules/FinDeSection.tsx");
    expect(fin).toMatch(/addEventListener\(EVENEMENT_TERMINER, signaler\)/);
    expect(fin).toMatch(/scrollIntoView\(\{ behavior: reduit \? "auto" : "smooth", block: "center" \}\)/);
    expect(fin).toMatch(/setAlerte\(false\);\s*defilementSignale\.current = false;\s*\}, 4000\)/);
    // Ce défilement ne marque pas la section comme lue (sinon le cadenas sauterait).
    expect(fin).toMatch(/isIntersecting && !defilementSignale\.current && marquerLue\(href\)/);
    expect(fin).toMatch(/role="status"/);
    expect(lire("src/components/modules/Etapes.tsx")).toMatch(/href=\{`\$\{enCours\}#\$\{ANCRE_TERMINER\}`\}/);
  });

  it("le panneau « Progression » et la carte « Suivant » appliquent le verrouillage", () => {
    const panneau = lire("src/components/modules/ProgressionModule.tsx");
    expect(panneau).toMatch(/etats\[i\] === "verrouillee"[\s\S]*<LienVerrouille[\s\S]*<Cadenas \/>/);
    expect(panneau).toContain("en cours");
    expect(lire("src/components/modules/NavModule.tsx")).toContain("<CarteSuivant");
    expect(lire("src/components/modules/CarteSuivant.tsx")).toMatch(/etats\[i\] === "verrouillee"[\s\S]*<LienVerrouille/);
  });
});
