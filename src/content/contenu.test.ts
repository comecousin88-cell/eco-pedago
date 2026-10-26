import { describe, expect, it } from "vitest";
import { glossaire } from "./glossaire";
import { contenus } from "./modules/contenus";
import { PARTIES, THEMES, propositionHref, propositions, propositionsPhares } from "./propositions";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { modules, neighbours } from "./modules";
import { ANCIENS_PARCOURS, avancement, dureeEstimee, getParcours, modulesDuParcours, parcours, parcoursDuModule, positionDans } from "./parcours";

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

describe("parcours", () => {
  it("étapes uniques dans chaque parcours", () => {
    for (const p of parcours) {
      const hrefs = p.etapes.map((e) => e.href);
      expect(hrefs.length, p.id).toBe(new Set(hrefs).size);
    }
  });

  it("quatre parcours thématiques, chacun avec sa durée estimée", () => {
    expect(parcours.map((p) => p.titre)).toEqual([
      "Comprendre la dette",
      "Comprendre les retraites et ma fiche de paie",
      "Me faire un avis sur les propositions",
      "Tout comprendre",
    ]);
    for (const p of parcours) expect(dureeEstimee(p), p.id).toMatch(/^≈ (\d+ h( \d+)?|\d+ min)$/);
  });

  it("« Comprendre la dette » : déficit et dette, emprunt de l'État, boule de neige, banque centrale", () => {
    expect(modulesDuParcours(getParcours("dette"), []).modules).toEqual(["deficit-et-dette", "emprunt-etat", "boule-de-neige", "banque-centrale"]);
    expect(modulesDuParcours(getParcours("retraites-paie"), []).modules).toEqual(["retraites", "fiche-de-paie"]);
  });

  it("« Me faire un avis » : les bases, puis les fiches au crible et les idées reçues", () => {
    const etapes = getParcours("propositions").etapes.map((e) => e.href);
    expect(etapes[0]).toBe("/modules/les-bases/");
    expect(etapes.slice(-6)).toEqual(["/propositions/", ...propositionsPhares.map((p) => propositionHref(p.slug)), "/idees-recues/"]);
  });

  it("« Tout comprendre » couvre toutes les pages de tous les modules", () => {
    const total = modules.reduce((n, m) => n + 1 + m.sections.length, 0);
    // plus le tableau de bord, la rubrique et les fiches phares des propositions, et les idées reçues
    expect(getParcours("tout").etapes).toHaveLength(total + 1 + 1 + propositionsPhares.length + 1);
  });

  it("la progression déjà enregistrée se reporte sur les nouveaux parcours, et un ancien parcours en cours reprend dans « Tout comprendre »", () => {
    const lues = ["/modules/deficit-et-dette/", "/modules/deficit-et-dette/flux-et-stock/", "/modules/retraites/leviers/"];
    expect(avancement(getParcours("dette"), lues).faites).toBe(2);
    expect(avancement(getParcours("retraites-paie"), lues).faites).toBe(1);
    expect(avancement(getParcours("tout"), lues).faites).toBe(3);
    expect(ANCIENS_PARCOURS).toEqual({ decouvrir: "tout", approfondir: "tout" });
    const dette = getParcours("dette");
    const toutesLues = dette.etapes.filter((e) => e.module === "deficit-et-dette").map((e) => e.href);
    expect(modulesDuParcours(dette, toutesLues).termines).toBe(1);
    expect(parcoursDuModule("emprunt-etat").id).toBe("dette");
    expect(parcoursDuModule("emprunt-etat", "tout").id).toBe("tout");
    expect(parcoursDuModule("cadre-europeen").id).toBe("tout");
  });

  it("l'avancement ne compte que les étapes disponibles", () => {
    const p = {
      ...getParcours("dette"),
      etapes: [
        { href: "/a/", titre: "A", groupe: "g", disponible: true },
        { href: "/b/", titre: "B", groupe: "g", disponible: true },
        { href: "/c/", titre: "C", groupe: "g", disponible: false },
      ],
    };
    expect(avancement(p, [])).toMatchObject({ faites: 0, disponibles: 2, aVenir: 1, pourcent: 0 });
    const a = avancement(p, ["/a/", "/c/"]);
    expect(a).toMatchObject({ faites: 1, disponibles: 2, pourcent: 50 });
    expect(a.prochaine?.href).toBe("/b/");
    expect(avancement(p, ["/a/", "/b/"]).prochaine).toBeUndefined();
    expect(positionDans(p, "/b/")).toBe(2);
    expect(positionDans(p, "/z/")).toBe(0);
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

  it("une fiche rédigée a un verdict, et suit les six parties dans l'ordre", () => {
    for (const p of propositions.filter((x) => x.contenu)) {
      expect(p.verdict, p.slug).toBeDefined();
      const texte = readFileSync(fileURLToPath(new URL(`./propositions/${p.slug}.mdx`, import.meta.url)), "utf8");
      const titres = [...texte.matchAll(/^## (.+)$/gm)].map((m) => m[1].trim());
      expect(titres, p.slug).toEqual([...PARTIES]);
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
