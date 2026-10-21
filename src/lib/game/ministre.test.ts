import { describe, expect, it } from "vitest";
import { anneeMandat, bilanMandat, tirerEvenements, type EtatMinistre, type Evenement, type HypothesesMinistre } from "./ministre";
import { evenements } from "@/content/jeu-ministre";

const h: HypothesesMinistre = {
  croissanceTendance: 2.8,
  multDepenses: 0.6,
  multImpots: 0.4,
  multInvestissement: 0.8,
  stabilisateurs: 0.5,
  reactionSpread: 15,
  tauxAllemand: 3.47,
  maturite: 8.5,
};
const depart: EtatMinistre = { annee: 0, dette: 115.7, soldePrimaire: -2.9, soldeStructurel: -2.9, soldePublic: -5.1, tauxApparent: 1.95, spread: 97, croissance: 1.9, pib: 2991.1 };
const calme: Evenement = { id: "calme", titre: "", texte: "", croissance: 0, taux: 0, spread: 0, cout: 0 };
const rien = { economies: 0, impots: 0, investissement: 0 };

describe("une année de mandat", () => {
  it("sans budget ni choc, la dette suit la formule d(1+r)/(1+g) − solde primaire", () => {
    const e = anneeMandat(depart, rien, calme, h);
    const tauxMarche = 3.47 + 0.97;
    const r = (1.95 + (tauxMarche - 1.95) / 8.5) / 100;
    expect(e.dette).toBeCloseTo((115.7 * (1 + r)) / 1.028 + 2.9, 6);
    expect(e.croissance).toBeCloseTo(2.8, 10);
    expect(e.annee).toBe(1);
  });

  it("le taux apparent se rapproche peu à peu du taux de marché", () => {
    const e = anneeMandat(depart, rien, calme, h);
    expect(e.tauxApparent).toBeGreaterThan(1.95);
    expect(e.tauxApparent).toBeLessThan(3.47 + 0.97);
  });

  it("des économies améliorent le solde mais freinent la croissance", () => {
    const sans = anneeMandat(depart, rien, calme, h);
    const avec = anneeMandat(depart, { economies: 30, impots: 0, investissement: 0 }, calme, h);
    expect(avec.croissance).toBeLessThan(sans.croissance);
    expect(avec.soldePrimaire).toBeGreaterThan(sans.soldePrimaire);
    // l'amélioration est inférieure à l'effort, à cause des stabilisateurs automatiques
    const effort = (30 / 2991.1) * 100;
    expect(avec.soldePrimaire - sans.soldePrimaire).toBeLessThan(effort);
  });

  it("le spread monte quand le déficit dépasse 4 % et baisse sous 3 %", () => {
    expect(anneeMandat(depart, rien, calme, h).spread).toBe(112);
    const vertueux = anneeMandat(depart, { economies: 60, impots: 60, investissement: 0 }, calme, h);
    expect(vertueux.soldePublic).toBeGreaterThan(-3);
    expect(vertueux.spread).toBe(87);
  });

  it("une récession dégrade la croissance et le solde", () => {
    const recession: Evenement = { ...calme, croissance: -3 };
    const e = anneeMandat(depart, rien, recession, h);
    expect(e.croissance).toBeCloseTo(-0.2, 10);
    expect(e.soldePrimaire).toBeCloseTo(-2.9 - 1.5, 10);
  });
});

describe("chocs ponctuels", () => {
  it("une dépense imprévue pèse l'année du choc, pas les suivantes", () => {
    const catastrophe: Evenement = { ...calme, cout: 30 };
    const a1 = anneeMandat(depart, rien, catastrophe, h);
    const a2 = anneeMandat(a1, rien, calme, h);
    expect(a1.soldePrimaire).toBeCloseTo(-2.9 - (30 / 2991.1) * 100, 10);
    expect(a2.soldePrimaire).toBeCloseTo(-2.9, 10);
  });

  it("les budgets votés se cumulent d'une année sur l'autre", () => {
    const a1 = anneeMandat(depart, { economies: 30, impots: 0, investissement: 0 }, calme, h);
    const a2 = anneeMandat(a1, rien, calme, h);
    expect(a2.soldeStructurel).toBeCloseTo(-2.9 + (30 / 2991.1) * 100, 10);
  });
});

describe("événements et bilan", () => {
  it("le tirage est reproductible et sans répétition sur un mandat", () => {
    const a = tirerEvenements(evenements, 5, 42).map((e) => e.id);
    const b = tirerEvenements(evenements, 5, 42).map((e) => e.id);
    expect(a).toEqual(b);
    expect(new Set(a).size).toBe(5);
  });

  it("le bilan compte des critères explicites", () => {
    let e = depart;
    const histo: EtatMinistre[] = [];
    for (let i = 0; i < 5; i++) {
      e = anneeMandat(e, rien, calme, h);
      histo.push(e);
    }
    const b = bilanMandat(depart, histo);
    expect(b.criteres).toHaveLength(4);
    expect(b.score).toBe(b.criteres.filter((c) => c.atteint).length);
    expect(b.criteres[1].atteint).toBe(false);
  });

  it("chaque événement a un titre et une explication", () => {
    expect(evenements.length).toBeGreaterThanOrEqual(8);
    for (const ev of evenements) {
      expect(ev.titre.length, ev.id).toBeGreaterThan(5);
      expect(ev.texte.length, ev.id).toBeGreaterThan(30);
    }
  });
});
