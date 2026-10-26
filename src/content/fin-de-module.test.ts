import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { FinDuModule, QUESTIONS_MINI_QUIZ } from "@/components/modules/FinDuModule";
import { APRES_DERNIER_MODULE, finsDeModule } from "./fin-de-module";
import { modules } from "./modules";
import { contenus } from "./modules/contenus";
import { pagesDuSite } from "./plan-du-site";

const racine = fileURLToPath(new URL("../../", import.meta.url));
const texte = (html: string) => html.replace(/<[^>]+>/g, " ").replace(/&#x27;/g, "'").replace(/\s+/g, " ");

describe("écran de fin de module", () => {
  it("remplace « Suivant » et « Et ensuite ? » sur la dernière page de chaque module", () => {
    const page = readFileSync(`${racine}src/components/modules/PageModule.tsx`, "utf8");
    expect(page).toMatch(/\{derniere \? \(\s*<FinDuModule module=\{module\.slug\} quiz=\{quiz\} \/>\s*\) : \(\s*<>\s*<NavModule[\s\S]*<EtEnsuite[\s\S]*<\/>\s*\)\}/);
    expect(page).not.toMatch(/<Quiz /);
  });

  it.each(modules.map((m, i) => ({ m, i, titre: m.title })))("$titre", ({ m, i }) => {
    const fin = finsDeModule[m.slug];
    expect(fin, "contenu de fin manquant").toBeDefined();
    expect(fin.retenir).toHaveLength(3);
    for (const phrase of [...fin.retenir, fin.transition]) {
      expect(phrase.split(/\s+/).length, phrase).toBeLessThanOrEqual(40);
      expect(phrase, "pas de chiffre en dur").not.toMatch(/\d\s?(%|€|milliards?)/);
    }
    expect(pagesDuSite(), fin.aussi.href).toContain(fin.aussi.href);

    const quiz = contenus[m.slug].quiz;
    expect(quiz.length).toBeGreaterThanOrEqual(QUESTIONS_MINI_QUIZ);
    const html = renderToStaticMarkup(createElement(FinDuModule, { module: m.slug, quiz }));
    const t = texte(html);
    expect(t).toContain(`✓ Module terminé : ${m.title}`);
    expect(t).toContain(`Tu as terminé 0 module sur ${modules.length}`);
    expect(t).toContain("Ce qu'il faut retenir");
    for (const idee of fin.retenir) expect(t).toContain(idee.replace(/\s+/g, " "));
    // Mini-quiz : trois questions du quiz du module, corrigées après réponse.
    expect(t).toContain("Mini-quiz");
    expect(html.match(/<fieldset/g)).toHaveLength(QUESTIONS_MINI_QUIZ);
    expect(t).toContain(quiz[0].question.replace(/\s+/g, " "));
    expect(t).toContain(fin.transition);
    expect(html).toContain(fin.aussi.href.replace(/\/$/, ""));

    const suivant = modules[i + 1];
    if (suivant) {
      // Carte du module suivant, dans sa couleur.
      expect(html).toContain(`href="/modules/${suivant.slug}`);
      expect(html).toContain(suivant.color.light);
      expect(t).toContain(`Commencer le module ${suivant.number}`);
    } else {
      // Après le module 12 : les propositions au crible et « Redresser les comptes ».
      for (const c of APRES_DERNIER_MODULE) expect(html).toContain(`href="${c.href.replace(/\/$/, "")}`);
      expect(t).toContain("Redresser les comptes");
      expect(t).toContain("Les propositions au crible");
    }
  });
});
