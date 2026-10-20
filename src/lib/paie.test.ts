import { describe, expect, it } from "vitest";
import {
  coefficientRgdu,
  ficheDePaie,
  impotBareme,
  impotSurLeRevenu,
  reculerAgeDepart,
  soldeRetraites,
  tvaContenue,
} from "./economics";
import { parametresImpot, parametresPaie } from "./parametres";

const p = parametresPaie();
const options = { taille: "11-49" as const, tauxAT: 2 };

describe("fiche de paie", () => {
  it("au Smic de janvier 2026, retrouve le net officiel (1 443,11 €)", () => {
    expect(ficheDePaie(1823.03, p, options).netAvantImpot).toBeCloseTo(1443.11, 1);
  });

  it("au Smic de juin 2026, retrouve le net officiel (1 477,93 €)", () => {
    expect(ficheDePaie(1867.02, p, options).netAvantImpot).toBeCloseTo(1477.93, 1);
  });

  it("le net imposable réintègre la CSG non déductible et la CRDS", () => {
    const f = ficheDePaie(3000, p, options);
    expect(f.netImposable - f.netAvantImpot).toBeCloseTo(3000 * 0.9825 * 0.029, 6);
  });

  it("le coût employeur = brut + cotisations patronales, allègement compris", () => {
    const f = ficheDePaie(3500, p, options);
    expect(f.coutEmployeur).toBeCloseTo(3500 + f.cotisationsEmployeur, 8);
    expect(f.coutEmployeur).toBeGreaterThan(3500);
  });

  it("la tranche 2 et la CET n'apparaissent qu'au-dessus du plafond", () => {
    const sous = ficheDePaie(3000, p, options);
    const dessus = ficheDePaie(6000, p, options);
    const t2 = (f: ReturnType<typeof ficheDePaie>) => f.lignes.filter((l) => l.libelle.includes("tranche 2")).reduce((s, l) => s + l.montant, 0);
    expect(t2(sous)).toBe(0);
    expect(t2(dessus)).toBeCloseTo((6000 - p.pmss) * (8.64 + 12.95) / 100, 6);
  });

  it("le coût du travail n'est pas proportionnel au salaire : l'allègement est maximal au Smic", () => {
    const ratio = (brut: number) => ficheDePaie(brut, p, options).coutEmployeur / brut;
    expect(ratio(1867.02)).toBeLessThan(ratio(3500));
    expect(ratio(3500)).toBeLessThan(ratio(6000));
  });
});

describe("réduction générale dégressive (RGDU)", () => {
  const r = { tmin: 0.02, tdelta: 0.3781, exposant: 1.75 };
  it("maximale au Smic : Tmin + Tdelta", () => {
    expect(coefficientRgdu(21876.4, 21876.4, r)).toBe(0.3981);
  });
  it("à 2 Smic : 0,02 + 0,3781 × 0,25^1,75", () => {
    expect(coefficientRgdu(2 * 21876.4, 21876.4, r)).toBeCloseTo(Math.round((0.02 + 0.3781 * 0.25 ** 1.75) * 10000) / 10000, 10);
  });
  it("nulle à partir de 3 Smic", () => {
    expect(coefficientRgdu(3 * 21876.4, 21876.4, r)).toBe(0);
  });
});

describe("impôt sur le revenu", () => {
  const bareme = parametresImpot().bareme;

  it("barème : 30 000 € imposables pour une part", () => {
    expect(impotBareme(30000, 1, bareme)).toBeCloseTo((29579 - 11600) * 0.11 + (30000 - 29579) * 0.3, 6);
  });

  it("rien à payer sous la première tranche", () => {
    expect(impotBareme(11000, 1, bareme)).toBe(0);
  });

  it("la décote annule un petit impôt", () => {
    const r = impotSurLeRevenu(16000, parametresImpot());
    expect(r.revenuImposable).toBeCloseTo(14400, 6);
    expect(r.impotBrut).toBeCloseTo((14400 - 11600) * 0.11, 6);
    expect(r.impot).toBe(0);
  });

  it("l'abattement de 10 % est borné", () => {
    const pi = parametresImpot();
    expect(impotSurLeRevenu(1000, pi).abattement).toBe(pi.abattementMin);
    expect(impotSurLeRevenu(1_000_000, pi).abattement).toBe(pi.abattementMax);
  });
});

describe("équilibre des retraites (abaque)", () => {
  // Calibrage 2070 du COR : dépenses 15,3 % du PIB, ressources 12,9 %, 1,3 cotisant par retraité, pension relative 45,3 %.
  const rpc = 1 / 1.3;
  const pr = 0.453;
  const assiette = 15.3 / (rpc * pr);
  const base = { assiettePib: assiette, tauxPrelevement: 12.9 / assiette, retraitesParCotisant: rpc, pensionRelative: pr };

  it("retrouve le déficit du COR en 2070 (−2,4 points de PIB)", () => {
    expect(soldeRetraites(base).solde).toBeCloseTo(-2.4, 6);
  });

  it("chacun des trois leviers du COR rétablit à peu près l'équilibre", () => {
    expect(Math.abs(soldeRetraites({ ...base, tauxPrelevement: base.tauxPrelevement + 0.056 }).solde)).toBeLessThan(0.3);
    expect(Math.abs(soldeRetraites({ ...base, pensionRelative: pr - 0.074 }).solde)).toBeLessThan(0.3);
    expect(Math.abs(soldeRetraites(reculerAgeDepart(base, 3, 30)).solde)).toBeLessThan(0.3);
  });

  it("reculer l'âge augmente les cotisants et réduit les retraités", () => {
    const apres = reculerAgeDepart(base, 2, 30);
    expect(apres.retraitesParCotisant).toBeLessThan(rpc);
    expect(apres.assiettePib).toBeGreaterThan(assiette);
  });
});

describe("TVA", () => {
  it("120 € TTC à 20 % contiennent 20 € de TVA", () => {
    expect(tvaContenue(120, 20)).toBeCloseTo(20, 10);
  });
  it("105,50 € TTC à 5,5 % contiennent 5,50 € de TVA", () => {
    expect(tvaContenue(105.5, 5.5)).toBeCloseTo(5.5, 10);
  });
});
