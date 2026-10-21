import { describe, expect, it } from "vitest";
import { objectifsJeu, trajectoireRatioDette } from "@/lib/economics";
import { basculerMesure, bilanMesures, categories, mesures, PAYEURS, type Mesure } from "./mesures";

describe("objectifs du jeu", () => {
  const base = { deficitMd: 151.6, deficitPct: 5.1, dettePct: 115.7, pib: 2991.1, croissanceNominale: 0.019, effortMinimalPct: 0.5 };

  it("niveau 1 : l'effort minimal européen, 0,5 point de PIB, soit environ 15 Md€", () => {
    expect(objectifsJeu(base).budget).toBeCloseTo(14.96, 2);
  });

  it("niveau 2 : stabiliser la dette, environ 88 Md€ avec 1,9 % de croissance nominale", () => {
    expect(objectifsJeu(base).stabiliser).toBeCloseTo(88.0, 0);
  });

  it("niveau 2 : plus la croissance nominale est forte, plus l'effort est faible", () => {
    expect(objectifsJeu({ ...base, croissanceNominale: 0.03 }).stabiliser).toBeLessThan(objectifsJeu(base).stabiliser);
  });

  it("niveau 3 : supprimer tout le déficit", () => {
    expect(objectifsJeu(base).zero).toBe(151.6);
  });
});

describe("trajectoire simplifiée de la dette", () => {
  it("au déficit stabilisant, le ratio ne bouge pas", () => {
    const d = 115.7;
    const g = 0.019;
    const t = trajectoireRatioDette(d, (d * g) / (1 + g), g, 10);
    expect(t[10]).toBeCloseTo(d, 6);
  });

  it("sans déficit, le ratio baisse au rythme de la croissance nominale", () => {
    const t = trajectoireRatioDette(100, 0, 0.02, 1);
    expect(t[1]).toBeCloseTo(100 / 1.02, 6);
  });
});

const exemple: Mesure[] = [
  { id: "a", categorie: "X", intitule: "A", explication: "", rendement: { bas: 1, central: 2, haut: 3 }, delai: "immediat", payeurs: ["retraites"], nature: "depense", groupe: "g", source: { nom: "s", url: "https://x.fr/a" }, date: "2026", statut: "verifie" },
  { id: "b", categorie: "X", intitule: "B", explication: "", rendement: { bas: 2, central: 4, haut: 6 }, delai: "2-3-ans", payeurs: ["retraites", "actifs"], nature: "depense", groupe: "g", source: { nom: "s", url: "https://x.fr/b" }, date: "2026", statut: "verifie" },
  { id: "c", categorie: "Y", intitule: "C", explication: "", rendement: { bas: 0, central: 1, haut: 5 }, delai: "long-terme", payeurs: ["entreprises"], nature: "recette", incertain: true, source: { nom: "s", url: "https://x.fr/c" }, date: "2026", statut: "a_verifier" },
];

describe("agrégation des mesures", () => {
  it("deux variantes d'une même réforme s'excluent", () => {
    let choix = basculerMesure([], "a", exemple);
    choix = basculerMesure(choix, "c", exemple);
    choix = basculerMesure(choix, "b", exemple);
    expect(choix.sort()).toEqual(["b", "c"]);
    expect(basculerMesure(choix, "b", exemple)).toEqual(["c"]);
  });

  it("additionne selon le scénario, sépare dépenses et recettes", () => {
    const b = bilanMesures(["b", "c"], "central", exemple);
    expect(b.total).toBe(5);
    expect(b.depenses).toBe(4);
    expect(b.recettes).toBe(1);
    expect(bilanMesures(["b", "c"], "haut", exemple).total).toBe(11);
  });

  it("répartit chaque mesure à parts égales entre ses payeurs", () => {
    const b = bilanMesures(["b", "c"], "central", exemple);
    expect(b.parPayeur.retraites).toBe(2);
    expect(b.parPayeur.actifs).toBe(2);
    expect(b.parPayeur.entreprises).toBe(1);
  });

  it("calcule la part des recettes incertaines et la répartition par délai", () => {
    const b = bilanMesures(["b", "c"], "central", exemple);
    expect(b.partIncertaine).toBeCloseTo(0.2, 10);
    expect(b.parDelai["2-3-ans"]).toBe(4);
    expect(b.parDelai["long-terme"]).toBe(1);
  });
});

describe("fichier des mesures", () => {
  it("contient entre 40 et 60 mesures, aux identifiants uniques", () => {
    expect(mesures.length).toBeGreaterThanOrEqual(40);
    expect(mesures.length).toBeLessThanOrEqual(60);
    expect(new Set(mesures.map((m) => m.id)).size).toBe(mesures.length);
  });

  it("chaque mesure est complète : rendements ordonnés, payeurs connus, source, date, statut", () => {
    const payeurs = new Set(PAYEURS.map((p) => p.id));
    for (const m of mesures) {
      expect(m.intitule.trim(), m.id).not.toBe("");
      expect(m.explication.length, m.id).toBeGreaterThan(20);
      expect(m.rendement.bas, m.id).toBeLessThanOrEqual(m.rendement.central);
      expect(m.rendement.central, m.id).toBeLessThanOrEqual(m.rendement.haut);
      expect(m.payeurs.length, m.id).toBeGreaterThan(0);
      for (const p of m.payeurs) expect(payeurs.has(p), `${m.id} : ${p}`).toBe(true);
      expect(["immediat", "2-3-ans", "long-terme"]).toContain(m.delai);
      expect(["depense", "recette"]).toContain(m.nature);
      expect(m.source.url, m.id).toMatch(/^https:\/\//);
      expect(["verifie", "a_verifier"]).toContain(m.statut);
      if (m.statut === "verifie") expect(m.consulte_le, m.id).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    }
  });

  it("couvre les grandes catégories prévues", () => {
    expect(categories().length).toBeGreaterThanOrEqual(12);
  });

  it("n'emploie aucun mot qui juge une mesure", () => {
    const juge = /\b(injuste|scandaleu|excellent|mauvaise mesure|bonne mesure|indispensable|absurde)/i;
    for (const m of mesures) expect(juge.test(`${m.intitule} ${m.explication}`), m.id).toBe(false);
  });
});
