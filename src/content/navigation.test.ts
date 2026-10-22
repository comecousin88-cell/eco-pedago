import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { normaliser, rechercher } from "@/lib/recherche";
import { glossaire } from "./glossaire";
import { idees } from "./idees-recues";
import { moduleHref, modules } from "./modules";
import { propositionHref, propositions } from "./propositions";
import { pagesDuSite } from "./plan-du-site";
import { indexRecherche } from "./recherche";
import { rubriqueDe, rubriques, simulateurs, themeDuModule, themes } from "./rubriques";
import { pagesAvecSuite, suiteModule, suitePage, suiteProposition } from "./suite";

const app = fileURLToPath(new URL("../app/", import.meta.url));

/** Toutes les adresses publiées : pages fixes, modules, sections, fiches. */
function adresses(): Set<string> {
  const res = new Set<string>();
  const parcourir = (dossier: string, prefixe: string) => {
    for (const f of readdirSync(dossier)) {
      const p = join(dossier, f);
      if (statSync(p).isDirectory() && !f.startsWith("[") && !f.startsWith("(")) parcourir(p, `${prefixe}${f}/`);
      else if (/^page\.(tsx|mdx)$/.test(f)) res.add(prefixe);
    }
  };
  parcourir(app, "/");
  for (const m of modules) {
    res.add(moduleHref(m.slug));
    for (const s of m.sections) res.add(moduleHref(m.slug, s.slug));
  }
  for (const p of propositions) res.add(propositionHref(p.slug));
  return res;
}
const connues = adresses();
const valide = (href: string) => connues.has(href.split("#")[0]);
const ancres = new Set([...themes.map((t) => t.slug), "commencer", ...glossaire.map((g) => g.id), ...idees.map((i) => i.id)]);

describe("rubriques et thèmes", () => {
  it("le menu a cinq entrées, chacune avec sa page", () => {
    expect(rubriques.map((r) => r.label)).toEqual(["Accueil", "Comprendre", "Décrypter", "L'actu", "Jouer"]);
    for (const r of rubriques) expect(connues, r.href).toContain(r.href);
  });

  it("chaque module est rangé dans exactement un des quatre thèmes", () => {
    expect(themes).toHaveLength(4);
    for (const m of modules) expect(themes.filter((t) => t.modules.includes(m.slug)), m.slug).toHaveLength(1);
    for (const t of themes) for (const slug of t.modules) expect(modules.map((m) => m.slug)).toContain(slug);
  });

  it("chaque page est rattachée à la bonne rubrique", () => {
    const cas: [string, string | undefined][] = [
      ["/", "accueil"],
      ["/modules/retraites/leviers/", "comprendre"],
      ["/glossaire/", "comprendre"],
      ["/la-france-en-10-chiffres/", "comprendre"],
      ["/propositions/retraite-a-60-ans/", "decrypter"],
      ["/idees-recues/", "decrypter"],
      ["/tableau-de-bord/", "actu"],
      ["/jeux/ministre-des-finances/", "jouer"],
      ["/jouer", "jouer"],
      ["/sources/", undefined],
    ];
    for (const [chemin, id] of cas) expect(rubriqueDe(chemin)?.id, chemin).toBe(id);
  });

  it("chaque simulateur renvoie vers une page existante", () => {
    for (const s of simulateurs) expect(valide(s.href), s.href).toBe(true);
  });
});

describe("« Et ensuite ? »", () => {
  const verifier = (liste: { href: string; titre: string }[], ou: string, actuelle: string) => {
    expect(liste.length, ou).toBeGreaterThanOrEqual(2);
    expect(liste.length, ou).toBeLessThanOrEqual(3);
    expect(new Set(liste.map((s) => s.href)).size, `${ou} : doublon`).toBe(liste.length);
    for (const s of liste) {
      expect(valide(s.href), `${ou} → ${s.href}`).toBe(true);
      expect(s.href, `${ou} se suggère elle-même`).not.toBe(actuelle);
      const ancre = s.href.split("#")[1];
      if (ancre) expect(ancres, `${ou} → ancre ${ancre}`).toContain(ancre);
    }
  };

  it("sur chaque page de module et de section", () => {
    for (const m of modules.filter((x) => x.status === "available")) {
      verifier(suiteModule(m.slug), m.slug, moduleHref(m.slug));
      for (const s of m.sections) verifier(suiteModule(m.slug, s.slug), `${m.slug}/${s.slug}`, moduleHref(m.slug, s.slug));
      expect(() => themeDuModule(m.slug)).not.toThrow();
    }
  });

  it("sur chaque fiche au crible", () => {
    for (const p of propositions.filter((x) => x.contenu)) verifier(suiteProposition(p.slug), p.slug, propositionHref(p.slug));
  });

  it("sur chaque page fixe", () => {
    for (const chemin of pagesAvecSuite) {
      expect(connues, chemin).toContain(chemin);
      verifier(suitePage(chemin), chemin, chemin);
    }
  });

  it("chaque page publiée a un fil d'Ariane et un bloc « Et ensuite ? »", () => {
    // Exceptions : l'accueil (ses portes d'entrée en tiennent lieu), les anciennes adresses qui redirigent, la page de travail.
    const exceptions = new Set(["/", "/modules/", "/jeux/", "/jeu-budget/", "/concepts/", "/atelier/"]);
    for (const chemin of connues) {
      if (exceptions.has(chemin) || chemin.startsWith("/modules/") || chemin.startsWith("/propositions/") && chemin !== "/propositions/") continue;
      const f = join(app, chemin, "page.tsx");
      if (!existsSync(f)) continue;
      const source = readFileSync(f, "utf8");
      expect(source, `${chemin} : fil d'Ariane`).toContain("<FilAriane");
      expect(source, `${chemin} : « Et ensuite ? »`).toContain("<EtEnsuite");
    }
  });
});

describe("plan du site (sitemap.xml)", () => {
  it("ne contient que des pages qui existent, et toutes les pages publiques", () => {
    const pages = pagesDuSite();
    for (const p of pages) expect(connues, p).toContain(p);
    const exclues = new Set(["/modules/", "/jeux/", "/jeu-budget/", "/concepts/", "/atelier/"]);
    for (const a of connues) if (!exclues.has(a) && !(a.startsWith("/propositions/") && a !== "/propositions/" && !propositions.find((x) => propositionHref(x.slug) === a)?.contenu)) expect(pages, a).toContain(a);
  });
});

describe("recherche", () => {
  const index = indexRecherche();

  it("couvre les pages, modules, sections, fiches, idées reçues et le glossaire", () => {
    const types = new Set(index.map((e) => e.type));
    for (const t of ["Page", "Module", "Section", "Fiche", "Idée reçue", "Glossaire", "Simulateur"]) expect(types).toContain(t);
    expect(index.filter((e) => e.type === "Glossaire")).toHaveLength(glossaire.length);
  });

  it("ne renvoie que vers des pages et des ancres qui existent", () => {
    for (const e of index) {
      expect(valide(e.href), e.href).toBe(true);
      const ancre = e.href.split("#")[1];
      if (ancre) expect(ancres, e.href).toContain(ancre);
    }
  });

  it("ignore les accents et la casse, et classe les titres d'abord", () => {
    expect(normaliser("Écart de TAUX, l'État")).toBe("ecart de taux l etat");
    const r = rechercher(index, "retraite");
    expect(r.length).toBeGreaterThan(3);
    expect(normaliser(r[0].titre)).toContain("retraite");
    expect(rechercher(index, "spread").some((e) => e.href.includes("spread-notation"))).toBe(true);
    expect(rechercher(index, "zzzz")).toEqual([]);
    expect(rechercher(index, " ")).toEqual([]);
  });
});
