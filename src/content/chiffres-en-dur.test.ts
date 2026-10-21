import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { calculs, texteCalcul, valeurCalcul } from "./calculs";
import { chiffresEnDur, prose } from "./chiffres-en-dur";
import { chiffresFixes } from "./chiffres-fixes";

const racine = fileURLToPath(new URL("../../", import.meta.url));

/** Textes du site : contenus MDX, et les contenus rédigés en TSX. */
function textes(dossier: string): string[] {
  return readdirSync(dossier).flatMap((f) => {
    const p = join(dossier, f);
    if (statSync(p).isDirectory()) return f === "atelier" || f === "node_modules" ? [] : textes(p);
    return f.endsWith(".mdx") || /^(idees-recues|france-10-chiffres)\.tsx$/.test(f) ? [p] : [];
  });
}
const fichiers = textes(join(racine, "src")).map((p) => relative(racine, p).replaceAll("\\", "/"));

describe("aucun chiffre en dur dans les textes", () => {
  it("le contrôle porte sur tous les textes", () => {
    expect(fichiers.length).toBeGreaterThan(80);
  });

  it.each(fichiers)("%s", (f) => {
    const permis = chiffresFixes[f] ?? {};
    const trouves = chiffresEnDur(readFileSync(join(racine, f), "utf8"));
    const interdits = trouves.filter((c) => !(c.texte in permis)).map((c) => `« ${c.texte} » dans : ${c.phrase.slice(0, 140)}`);
    expect(interdits, "Lire ce chiffre dans data/*.json (<Chiffre>, <Calcul>), ou le déclarer dans src/content/chiffres-fixes.ts avec sa raison").toEqual([]);
    // Une exception qui ne sert plus doit disparaître de la liste.
    const inutiles = Object.keys(permis).filter((t) => !trouves.some((c) => c.texte === t));
    expect(inutiles, "exceptions inutilisées dans src/content/chiffres-fixes.ts").toEqual([]);
  });

  it("chaque exception désigne un fichier existant et donne sa raison", () => {
    for (const [f, permis] of Object.entries(chiffresFixes)) {
      expect(fichiers, f).toContain(f);
      for (const raison of Object.values(permis)) expect(raison.trim()).not.toBe("");
    }
  });
});

describe("détection", () => {
  it("repère un chiffre actuel écrit en dur, pas les exemples ni l'histoire ni les composants", () => {
    const texte = `
La dette atteint 3 500 milliards d'euros et 119 % du PIB.
<Exemple titre="x">Un prêt de 100 € à 3 %.</Exemple>
En 1945, la dette dépassait 200 % du PIB.
Le déficit doit revenir sous 3 % du PIB ; la BCE vise une inflation de 2 %.
La dette vaut <Chiffre id="dette.stock" /> soit {"12 %"}.
<Verdict tient={<p>Un coût de 26 milliards d'euros.</p>} />`;
    expect(chiffresEnDur(texte).map((c) => c.texte)).toEqual(["3 500 milliards", "119 %", "26 milliards"]);
  });

  it("retire les expressions JavaScript mais garde le texte des éléments passés en attribut", () => {
    expect(prose('a {x + "5 %"} b')).not.toContain("5 %");
    expect(prose("a tient={<p>5 %</p>} b")).toContain("5 %");
  });
});

describe("valeurs calculées", () => {
  it.each(Object.keys(calculs))("%s se calcule sur les données actuelles", (id) => {
    const v = valeurCalcul(id);
    expect(Number.isFinite(v)).toBe(true);
    expect(texteCalcul(id)).not.toMatch(/NaN|undefined/);
  });

  it("arrondit dans le sens demandé", () => {
    const v = valeurCalcul("calc.dette-par-habitant");
    expect(valeurCalcul("calc.dette-par-habitant", { arrondi: 1000 }) % 1000).toBe(0);
    expect(valeurCalcul("calc.dette-par-habitant", { arrondi: 10000, sens: "bas" })).toBeLessThanOrEqual(v);
    expect(valeurCalcul("calc.dette-par-habitant", { arrondi: 10000, sens: "haut" })).toBeGreaterThanOrEqual(v);
  });

  it("reproduit les calculs de référence", () => {
    // 488 Md€ × 0,68 % ≈ 3,3 Md€ : le gain brut cité dans les fiches sur la Banque de France.
    expect(valeurCalcul("calc.frigo-gain-brut")).toBeCloseTo((488 * 0.68) / 100, 1);
    expect(valeurCalcul("calc.capitalisation-10pct")).toBeCloseTo(42.22, 1);
  });
});
