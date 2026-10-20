import { describe, expect, it } from "vitest";
import { anneesDeCouverture, effetsAnnulation, fondsPropresApresAnnulation, rendementImpotFortunes } from "./economics";

describe("annulation de la dette détenue par la banque centrale", () => {
  const base = { montant: 500, coupon: 0.01, tauxDepot: 0.025, prime: 0, empruntsAnnuels: 300, annees: 3 };

  it("le gain d'intérêts de l'État est exactement la perte de la banque centrale", () => {
    const [an1] = effetsAnnulation(base);
    expect(an1.interetsEconomises).toBeCloseTo(5, 10);
    expect(an1.perteBanqueCentrale).toBeCloseTo(5, 10);
    expect(an1.netConsolide).toBeCloseTo(0, 10);
  });

  it("une prime de risque de 1 point coûte de plus en plus à mesure que la dette se refinance", () => {
    const r = effetsAnnulation({ ...base, prime: 0.01 });
    expect(r.map((x) => x.surcoutMarche)).toEqual([3, 6, 9].map((v) => expect.closeTo(v, 10)));
    expect(r[1].netConsolide).toBeCloseTo(-6, 10);
  });

  it("les fonds propres absorbent tout le montant annulé", () => {
    expect(fondsPropresApresAnnulation(5, 100)).toBe(-95);
  });
});

describe("impôt sur les très grandes fortunes", () => {
  it("retrouve la reconstitution du Sénat : environ 20 Md€ pour 2 % sur 1 228 Md€, 0,3 % déjà payés", () => {
    const r = rendementImpotFortunes({ assiette: 1228, taux: 0.02, impotsDejaPayes: 0.003, elasticite: 0 });
    expect(r.theorique).toBeCloseTo(1228 * 0.017, 6);
    expect(r.theorique).toBeGreaterThan(20);
    expect(r.theorique).toBeLessThan(21);
  });

  it("avec 2 % de redevables en moins par point de taux, l'assiette baisse de 4 % à 2 %", () => {
    const r = rendementImpotFortunes({ assiette: 1000, taux: 0.02, impotsDejaPayes: 0, elasticite: 0.02 });
    expect(r.apresComportements).toBeCloseTo(20 * 0.96, 6);
  });

  it("l'impôt plancher ne rapporte rien si les impôts déjà payés dépassent le taux", () => {
    expect(rendementImpotFortunes({ assiette: 1000, taux: 0.002, impotsDejaPayes: 0.003, elasticite: 0 }).theorique).toBe(0);
  });

  it("1 228 Md€ couvriraient un besoin de 300 Md€ pendant un peu plus de 4 ans", () => {
    expect(anneesDeCouverture(1228, 300)).toBeCloseTo(4.093, 3);
  });
});
