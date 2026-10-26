import { describe, expect, it } from "vitest";
import { glossaire } from "./glossaire";
import { contenus } from "./modules/contenus";
import { PARTIES, PARTIES_FICHE, THEMES, propositionHref, propositions, propositionsPhares } from "./propositions";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { modules, neighbours } from "./modules";
import { execSync } from "node:child_process";
import { themes } from "./rubriques";
import { avancementModule, modulesTermines, NIVEAU_DANS_CHAQUE_MODULE, pagesDuModule, reprise } from "@/lib/avancement-modules";

describe("glossaire", () => {
  it("identifiants uniques", () => {
    const ids = glossaire.map((e) => e.id);
    expect(ids.length).toBe(new Set(ids).size);
  });

  it("chaque renvoi « voir aussi » pointe vers un terme existant", () => {
    const ids = new Set(glossaire.map((e) => e.id));
    for (const e of glossaire) {
      for (const v of e.voir ?? []) expect(ids, `${e.id} → ${v}`).toContain(v);
    }
  });
});

describe("modules", () => {
  it("slugs uniques, sections uniques dans chaque module", () => {
    expect(new Set(modules.map((m) => m.slug)).size).toBe(modules.length);
    for (const m of modules) {
      expect(new Set(m.sections.map((s) => s.slug)).size).toBe(m.sections.length);
    }
  });

  it("navigation : la dernière section d'un module mène au module suivant", () => {
    const { next } = neighbours("les-bases", "inflation-taux-reels");
    expect(next?.href).toBe("/modules/deficit-et-dette/");
    expect(neighbours("les-bases").previous).toBeUndefined();
  });
});

describe("les 12 modules", () => {
  const racine = fileURLToPath(new URL("../../", import.meta.url));
  const lire = (f: string) => readFileSync(`${racine}${f}`, "utf8");

  it("numérotés de 1 à 12 dans l'ordre conseillé, rangés en quatre parties qui suivent cet ordre", () => {
    expect(modules.map((m) => m.number)).toEqual(Array.from({ length: 12 }, (_, i) => String(i + 1)));
    expect(themes.map((t) => t.titre)).toEqual(["Les bases", "La dette", "Retraites, impôts et budget", "La France et le monde"]);
    expect(themes.flatMap((t) => t.modules)).toEqual(modules.map((m) => m.slug));
  });

  it("chaque carte : numéro, titre, description, progression, « Commencer » ou « Reprendre » et ↺", () => {
    const grille = lire("src/components/modules/GrilleModules.tsx");
    for (const motif of [/\{m\.number\}/, /\{m\.title\}/, /\{m\.question\}/, /role="progressbar"/, /"Reprendre" : "Commencer"/, /<BoutonRecommencer/])
      expect(grille).toMatch(motif);
    expect(grille).toContain('"Reprendre où j\'en étais" : "Commencer par le module 1"');
    expect(grille).toContain("{NIVEAU_DANS_CHAQUE_MODULE}");
    expect(NIVEAU_DANS_CHAQUE_MODULE).toBe("Dans chaque module, choisissez votre niveau : Simple ou Approfondi.");
  });

  it("progression par module : celle déjà enregistrée est reprise telle quelle", () => {
    const m = modules[1];
    const pages = pagesDuModule(m);
    expect(avancementModule(m, [])).toMatchObject({ faites: 0, etat: "a-faire", cible: pages[0] });
    expect(avancementModule(m, [pages[0], pages[2]])).toMatchObject({ faites: 2, etat: "en-cours", cible: pages[1] });
    expect(avancementModule(m, [pages[0]], [pages[1]]).cible).toBe(pages[2]);
    expect(avancementModule(m, pages)).toMatchObject({ etat: "termine", pourcent: 100, cible: pages[0] });
    expect(modulesTermines(pages)).toBe(1);
  });

  it("bouton principal : module 1 au départ, puis reprise là où on en était", () => {
    expect(reprise([])).toEqual({ href: "/modules/les-bases/", commence: false });
    const [m2, m3] = [modules[1], modules[2]];
    expect(reprise([pagesDuModule(m3)[0], pagesDuModule(m2)[0]])).toEqual({ href: pagesDuModule(m2)[1], commence: true });
    // Dernier module lu terminé : le premier module pas terminé.
    expect(reprise(pagesDuModule(m3))).toEqual({ href: pagesDuModule(modules[0])[0], commence: true });
  });

  it("plus aucun parcours ni durée estimée sur le site", () => {
    const fichiers = execSync("git ls-files src", { cwd: racine, encoding: "utf8" }).split("\n").filter((f) => /\.(tsx?|mdx)$/.test(f) && !f.endsWith(".test.ts"));
    for (const f of fichiers) {
      const texte = lire(f);
      expect(texte, f).not.toMatch(/[Pp]arcours (guidé|thématique)|CartesParcours|BarreParcours|dureeEstimee/);
      expect(texte, f).not.toMatch(/Comptez [^.]*(minutes|heure)|En deux minutes|≈ \d+ (h|min)\b/);
    }
  });
});

describe("contenus des modules", () => {
  it("un module est disponible si et seulement si ses textes existent", () => {
    const disponibles = modules.filter((m) => m.status === "available").map((m) => m.slug).sort();
    expect(Object.keys(contenus).sort()).toEqual(disponibles);
  });

  it("chaque section d'un module disponible a son texte, et un quiz de 5 questions", () => {
    for (const [slug, c] of Object.entries(contenus)) {
      const m = modules.find((x) => x.slug === slug)!;
      expect(Object.keys(c.sections).sort(), slug).toEqual(m.sections.map((s) => s.slug).sort());
      expect(c.quiz, slug).toHaveLength(5);
      for (const q of c.quiz) expect(q.bonne).toBeLessThan(q.choix.length);
    }
  });
});

describe("propositions passées au crible", () => {
  it("16 fiches, identifiants uniques", () => {
    expect(propositions).toHaveLength(16);
    expect(new Set(propositions.map((p) => p.slug)).size).toBe(16);
  });

  it("une fiche rédigée a un verdict, et suit ses parties dans l'ordre (six parties, ou la structure des fiches refondues)", () => {
    for (const p of propositions.filter((x) => x.contenu)) {
      expect(p.verdict, p.slug).toBeDefined();
      const texte = readFileSync(fileURLToPath(new URL(`./propositions/${p.slug}.mdx`, import.meta.url)), "utf8");
      const titres = [...texte.matchAll(/^## (.+)$/gm)].map((m) => m[1].trim());
      if (!p.refondue) {
        expect(titres, p.slug).toEqual([...PARTIES]);
        continue;
      }
      // Les sources sont listées par la page ; « Et si on le faisait ? » est facultative.
      const attendus = PARTIES_FICHE.filter((x) => x.titre !== "Sources" && !("facultative" in x && x.facultative && !titres.includes(x.titre))).map((x) => x.titre);
      expect(titres, p.slug).toEqual(attendus);
    }
  });

  it("quatre fiches phares : annulation, taxer les riches pour financer, retraite à 60 ans, planche à billets", () => {
    expect(propositionsPhares.map((p) => p.slug).sort()).toEqual(
      ["annuler-dette-banque-centrale", "financer-les-depenses-en-taxant-les-riches", "planche-a-billets", "retraite-a-60-ans"].sort(),
    );
  });

  it("chaque fiche a un résumé, au moins un thème connu, et des liens vers des pages de modules qui existent", () => {
    for (const p of propositions) {
      expect(p.resume.trim(), p.slug).not.toBe("");
      expect(p.themes.length, p.slug).toBeGreaterThan(0);
      for (const t of p.themes) expect(THEMES, p.slug).toContain(t);
      expect(p.liens.length, p.slug).toBeGreaterThan(0);
      for (const l of p.liens) {
        const m = modules.find((x) => x.slug === l.module);
        expect(m, `${p.slug} → ${l.module}`).toBeDefined();
        if (l.section) expect(m!.sections.map((s) => s.slug), `${p.slug} → ${l.section}`).toContain(l.section);
        else expect(m!.sections, `${p.slug} → ${l.module} : un module à sections se lie par section`).toHaveLength(0);
      }
    }
  });

  // Règle de neutralité (PLAN.md) : un parti n'est nommé que pour lui attribuer une proposition, et alors les
  // porteurs des propositions comparables ou opposées le sont aussi ; aucun verdict ne nomme de parti.
  const PORTEURS: [string, RegExp][] = [
    ["La France insoumise", /La France insoumise|\bLFI\b/],
    ["Rassemblement national", /Rassemblement national|\bRN\b/],
    ["Parti socialiste", /Parti socialiste/],
    ["Les Républicains", /Les Républicains/],
    ["Écologistes", /groupe écologiste|Les Écologistes|\bEELV\b/i],
    ["Renaissance", /\bRenaissance\b/],
    ["Horizons", /\bHorizons\b/],
    ["MoDem", /\bMoDem\b/],
    ["Reconquête", /\bReconquête\b/],
    ["PCF", /\bPCF\b|Parti communiste/],
    ["gouvernement", /\bgouvernement\b/i],
  ];
  const PARTIS = PORTEURS.filter(([nom]) => nom !== "gouvernement");

  for (const p of propositions.filter((x) => x.contenu)) {
    const texte = readFileSync(fileURLToPath(new URL(`./propositions/${p.slug}.mdx`, import.meta.url)), "utf8");

    it(`${p.slug} : si un parti est nommé, d'autres porteurs le sont aussi`, () => {
      const partis = PARTIS.filter(([, re]) => re.test(texte)).map(([nom]) => nom);
      if (partis.length === 0) return;
      const porteurs = PORTEURS.filter(([, re]) => re.test(texte)).map(([nom]) => nom);
      expect(porteurs.length, `${p.slug} ne nomme que : ${porteurs.join(", ")}`).toBeGreaterThanOrEqual(2);
    });

    it(`${p.slug} : le verdict ne nomme aucun parti`, () => {
      const verdicts = [...texte.matchAll(/<Verdict[\s\S]*?<\/Verdict>|<GrilleVerdict[\s\S]*?\/>/g)].map((m) => m[0]).join(" ");
      for (const [nom, re] of PARTIS) expect(re.test(verdicts), `${p.slug} : ${nom} dans le verdict`).toBe(false);
    });
  }
});
