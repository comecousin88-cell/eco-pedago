import { readdirSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { clesModifiees, estModifie, reduireScenario, scenarioInitial } from "./scenario";

describe("scénario d'un simulateur", () => {
  const reference = { taux: 4.44, croissance: 1.9, mode: "pib" };

  it("part des chiffres actuels, sans modification", () => {
    const e = scenarioInitial(reference);
    expect(e.valeurs).toEqual(reference);
    expect(estModifie(e)).toBe(false);
  });

  it("repère les réglages modifiés", () => {
    let e = scenarioInitial(reference);
    e = reduireScenario(e, { type: "modifier", cle: "taux", valeur: 6 });
    e = reduireScenario(e, { type: "modifier", cle: "mode", valeur: "md" });
    expect(estModifie(e)).toBe(true);
    expect(clesModifiees(e).sort()).toEqual(["mode", "taux"]);
  });

  it("« Revenir aux chiffres actuels » remet toutes les valeurs à la référence", () => {
    let e = scenarioInitial(reference);
    e = reduireScenario(e, { type: "remplacer", valeurs: { taux: 2, croissance: 5, mode: "md" } });
    expect(clesModifiees(e)).toHaveLength(3);
    e = reduireScenario(e, { type: "reinitialiser" });
    expect(e.valeurs).toEqual(reference);
    expect(estModifie(e)).toBe(false);
  });

  it("revenir à la valeur actuelle à la main efface la mention « modifié »", () => {
    let e = scenarioInitial(reference);
    e = reduireScenario(e, { type: "modifier", cle: "croissance", valeur: 3 });
    e = reduireScenario(e, { type: "modifier", cle: "croissance", valeur: 1.9 });
    expect(estModifie(e)).toBe(false);
  });

  it("tolère les imprécisions de calcul des curseurs", () => {
    let e = scenarioInitial({ x: 0.3 });
    e = reduireScenario(e, { type: "modifier", cle: "x", valeur: 0.1 + 0.2 });
    expect(estModifie(e)).toBe(false);
  });
});

describe("tous les simulateurs utilisent le scénario commun", () => {
  const racine = fileURLToPath(new URL("../components/", import.meta.url));
  const dossiers = ["simulators", "graphiques", "jeux", "indicateurs"];
  const exclus = new Set(["Curseur.tsx", "Scenario.tsx"]);
  const fichiers = dossiers.flatMap((d) =>
    readdirSync(`${racine}${d}`)
      .filter((f) => f.endsWith(".tsx") && !exclus.has(f))
      .map((f) => ({ nom: `${d}/${f}`, texte: readFileSync(`${racine}${d}/${f}`, "utf8") })),
  );
  const avecCurseur = fichiers.filter((f) => f.texte.includes("<Curseur"));

  it("il y a bien des simulateurs à contrôler", () => {
    expect(avecCurseur.length).toBeGreaterThanOrEqual(10);
  });

  it("aucun curseur « brut » : tous les réglages passent par <Curseur>", () => {
    for (const f of fichiers) expect(f.texte.includes('type="range"'), f.nom).toBe(false);
  });

  it.each(avecCurseur.map((f) => [f.nom, f.texte] as const))("%s : useScenario et bouton « Revenir aux chiffres actuels »", (_, texte) => {
    expect(texte).toContain("useScenario(");
    expect(texte).toContain("<BarreScenario");
  });

  it.each(avecCurseur.map((f) => [f.nom, f.texte] as const))("%s : chaque curseur affiche le repère de la valeur actuelle", (_, texte) => {
    const curseurs = texte.split("<Curseur").slice(1).map((bloc) => bloc.slice(0, bloc.indexOf("/>")));
    for (const c of curseurs) expect(c).toContain("reference=");
  });
});
