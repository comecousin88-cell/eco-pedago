import { describe, expect, it } from "vitest";
import {
  adjudication,
  annulerTitres,
  resultatBanqueCentrale,
  surcoutInterets,
  tauxApparent,
  trajectoireTauxApparent,
  cumulDette,
  fluxObligation,
  pouvoirAchat,
  repartir100,
  prixBTF,
  prixObligation,
  rendementActuariel,
  soldePrimaireStabilisant,
  tauxBTF,
  tauxReel,
  tauxReelApproche,
  trajectoireDette,
  variationDetteApprochee,
} from "./economics";

describe("taux réels", () => {
  it("taux nominal 5 %, inflation 2 % : taux réel exact 2,94 %", () => {
    expect(tauxReel(0.05, 0.02)).toBeCloseTo(1.05 / 1.02 - 1, 10);
    expect(tauxReel(0.05, 0.02)).toBeCloseTo(0.029412, 6);
  });

  it("l'approximation i − π donne 3 %, proche du résultat exact", () => {
    expect(tauxReelApproche(0.05, 0.02)).toBeCloseTo(0.03, 10);
  });

  it("taux réel négatif quand l'inflation dépasse le taux nominal", () => {
    expect(tauxReel(0.01, 0.05)).toBeLessThan(0);
  });

  it("100 € avec 2 % d'inflation pendant 10 ans valent 82,03 € d'aujourd'hui", () => {
    expect(pouvoirAchat(100, 0.02, 10)).toBeCloseTo(82.03, 2);
  });
});

describe("obligations", () => {
  const oat10ans = { nominal: 100, coupon: 0.02, maturite: 10 };

  it("verse 2 € par an puis 102 € la dernière année", () => {
    const flux = fluxObligation(oat10ans);
    expect(flux).toHaveLength(10);
    expect(flux[0]).toEqual({ annee: 1, coupon: 2, remboursement: 0, total: 2 });
    expect(flux[9]).toEqual({ annee: 10, coupon: 2, remboursement: 100, total: 102 });
  });

  it("vaut exactement le pair (100 €) quand le taux de marché égale le coupon", () => {
    expect(prixObligation(oat10ans, 0.02)).toBeCloseTo(100, 10);
  });

  it("vaut 91,47 € quand le taux de marché monte à 3 %", () => {
    expect(prixObligation(oat10ans, 0.03)).toBeCloseTo(91.47, 2);
  });

  it("vaut plus que le pair quand le taux de marché baisse à 1 %", () => {
    expect(prixObligation(oat10ans, 0.01)).toBeCloseTo(109.47, 2);
  });

  it("le prix baisse toujours quand le taux monte", () => {
    const taux = [0, 0.01, 0.02, 0.04, 0.08];
    const prix = taux.map((y) => prixObligation(oat10ans, y));
    for (let i = 1; i < prix.length; i++) expect(prix[i]).toBeLessThan(prix[i - 1]);
  });

  it("une obligation longue perd plus qu'une courte pour la même hausse de taux", () => {
    const courte = prixObligation({ nominal: 100, coupon: 0.02, maturite: 2 }, 0.03);
    const longue = prixObligation({ nominal: 100, coupon: 0.02, maturite: 30 }, 0.03);
    expect(100 - longue).toBeGreaterThan(100 - courte);
  });

  it("zéro coupon à 1 an au taux de 5 % : 100 / 1,05 = 95,24 €", () => {
    expect(prixObligation({ nominal: 100, coupon: 0, maturite: 1 }, 0.05)).toBeCloseTo(95.238, 3);
  });

  it("le rendement actuariel retrouve le taux de marché à partir du prix", () => {
    const prix = prixObligation(oat10ans, 0.03);
    expect(rendementActuariel(oat10ans, prix)).toBeCloseTo(0.03, 8);
  });
});

describe("BTF", () => {
  it("BTF de 100 € à 1 an (360 jours) au taux de 3 % : 97,09 €", () => {
    expect(prixBTF(100, 0.03, 360)).toBeCloseTo(97.087, 3);
  });

  it("BTF à 6 mois (180 jours) au taux de 3 % : 100 / 1,015 = 98,52 €", () => {
    expect(prixBTF(100, 0.03, 180)).toBeCloseTo(98.522, 3);
  });

  it("toujours acheté sous le pair quand le taux est positif", () => {
    expect(prixBTF(100, 0.02, 91)).toBeLessThan(100);
  });

  it("tauxBTF est l'inverse de prixBTF", () => {
    expect(tauxBTF(100, prixBTF(100, 0.025, 273), 273)).toBeCloseTo(0.025, 10);
  });
});

describe("dette et boule de neige", () => {
  it("la baignoire : chaque déficit s'ajoute au stock", () => {
    expect(cumulDette(1000, [100, 100, 50])).toEqual([1100, 1200, 1250]);
  });

  it("dette stable si r = g et solde primaire nul", () => {
    const t = trajectoireDette({
      detteInitiale: 1.1,
      taux: 0.03,
      croissance: 0.03,
      soldePrimaire: 0,
      annees: 20,
    });
    expect(t).toHaveLength(21);
    expect(t[20].dette).toBeCloseTo(1.1, 10);
  });

  it("taux 4 %, croissance 2 %, solde primaire nul : 100 % → 101,96 % en un an", () => {
    const t = trajectoireDette({
      detteInitiale: 1,
      taux: 0.04,
      croissance: 0.02,
      soldePrimaire: 0,
      annees: 1,
    });
    expect(t[1].dette).toBeCloseTo(1.04 / 1.02, 10);
  });

  it("si r = g, un excédent primaire de 1 % fait baisser la dette d'1 point par an", () => {
    const t = trajectoireDette({
      detteInitiale: 1,
      taux: 0.03,
      croissance: 0.03,
      soldePrimaire: 0.01,
      annees: 3,
    });
    expect(t.map((p) => p.dette)).toEqual([1, 0.99, 0.98, 0.97].map((v) => expect.closeTo(v, 10)));
  });

  it("le solde public = solde primaire − intérêts", () => {
    const t = trajectoireDette({
      detteInitiale: 1,
      taux: 0.03,
      croissance: 0.03,
      soldePrimaire: -0.02,
      annees: 1,
    });
    expect(t[1].interets).toBeCloseTo(0.03 / 1.03, 10);
    expect(t[1].soldePublic).toBeCloseTo(-0.02 - 0.03 / 1.03, 10);
  });

  it("accepte un solde primaire différent chaque année (le dernier se prolonge)", () => {
    const t = trajectoireDette({
      detteInitiale: 1,
      taux: 0.02,
      croissance: 0.02,
      soldePrimaire: [0.01, 0.02],
      annees: 3,
    });
    expect(t[3].dette).toBeCloseTo(1 - 0.01 - 0.02 - 0.02, 10);
  });

  it("le solde primaire stabilisant maintient la dette exactement", () => {
    const d = 1.15;
    const sp = soldePrimaireStabilisant(d, 0.02, 0.03);
    expect(sp).toBeCloseTo((1.15 * -0.01) / 1.03, 10); // r < g : un petit déficit primaire suffit
    const t = trajectoireDette({ detteInitiale: d, taux: 0.02, croissance: 0.03, soldePrimaire: sp, annees: 30 });
    expect(t[30].dette).toBeCloseTo(d, 10);
  });

  it("quand r > g, il faut un excédent primaire pour stabiliser", () => {
    expect(soldePrimaireStabilisant(1.15, 0.04, 0.03)).toBeGreaterThan(0);
  });

  it("la formule approchée est proche de la variation exacte", () => {
    const t = trajectoireDette({
      detteInitiale: 1.15,
      taux: 0.025,
      croissance: 0.03,
      soldePrimaire: -0.02,
      annees: 1,
    });
    const exacte = t[1].dette - t[0].dette;
    expect(variationDetteApprochee(1.15, 0.025, 0.03, -0.02)).toBeCloseTo(exacte, 3);
  });
});

describe("répartition sur 100 €", () => {
  it("la somme fait toujours exactement 100", () => {
    expect(repartir100([1, 1, 1]).reduce((a, b) => a + b, 0)).toBe(100);
    expect(repartir100([432.6, 261.2, 148.6, 58.9, 7]).reduce((a, b) => a + b, 0)).toBe(100);
  });

  it("donne l'euro restant aux plus forts restes", () => {
    // 1/3 chacun = 33,33… : un des trois reçoit 34
    expect(repartir100([1, 1, 1]).sort()).toEqual([33, 33, 34]);
    // 25,6 / 74,4 → 26 / 74
    expect(repartir100([25.6, 74.4])).toEqual([26, 74]);
  });
});

describe("taux apparent et refinancement", () => {
  it("taux apparent = intérêts / dette moyenne de l'année", () => {
    expect(tauxApparent(65.7, 3306.1, 3460.1)).toBeCloseTo(65.7 / 3383.1, 10);
  });

  it("le taux apparent rejoint le taux de marché en une maturité moyenne", () => {
    const t = trajectoireTauxApparent(0.02, 0.04, 8, 10);
    expect(t[0]).toBeCloseTo(0.0225, 10); // 1/8 de la dette refinancée
    expect(t[3]).toBeCloseTo(0.03, 10); // la moitié après 4 ans
    expect(t[7]).toBeCloseTo(0.04, 10); // toute la dette après 8 ans
    expect(t[9]).toBeCloseTo(0.04, 10);
  });

  it("le surcoût d'intérêts suit la hausse du taux apparent", () => {
    expect(surcoutInterets(1000, 0.02, [0.0225, 0.03])).toEqual([expect.closeTo(2.5, 10), expect.closeTo(10, 10)]);
  });

  it("la trajectoire de dette accepte un taux différent chaque année", () => {
    const t = trajectoireDette({ detteInitiale: 1, taux: [0.01, 0.02], croissance: 0, soldePrimaire: 0, annees: 3 });
    expect(t[2].dette).toBeCloseTo(1.01 * 1.02, 10);
    expect(t[3].dette).toBeCloseTo(1.01 * 1.02 * 1.02, 10); // le dernier taux se prolonge
  });
});

describe("adjudication à prix demandé", () => {
  it("sert les offres les plus chères d'abord, chacun paie son prix", () => {
    const r = adjudication(
      [
        { id: "A", prix: 99.5, montant: 4 },
        { id: "B", prix: 99.2, montant: 3 },
        { id: "C", prix: 99.0, montant: 5 },
      ],
      6,
    );
    expect(r.servies.map((o) => o.servi)).toEqual([4, 2, 0]);
    expect(r.prixLimite).toBe(99.2);
    expect(r.prixMoyen).toBeCloseTo((99.5 * 4 + 99.2 * 2) / 6, 10);
    expect(r.totalServi).toBe(6);
    expect(r.totalDemande).toBe(12);
  });

  it("au prix limite, les offres à égalité sont servies au prorata", () => {
    const r = adjudication(
      [
        { id: "A", prix: 99.5, montant: 4 },
        { id: "B1", prix: 99.2, montant: 2 },
        { id: "B2", prix: 99.2, montant: 2 },
      ],
      6,
    );
    expect(r.servies.map((o) => o.servi)).toEqual([4, 1, 1]);
  });

  it("si la demande est insuffisante, tout est servi et l'État lève moins", () => {
    const r = adjudication([{ id: "A", prix: 98, montant: 3 }], 10);
    expect(r.totalServi).toBe(3);
    expect(r.prixLimite).toBe(98);
  });
});

describe("bilan de la banque centrale", () => {
  const base = { titres: 100, coupon: 0.01, reserves: 100, tauxDepot: 0, fondsPropres: 5 };

  it("taux de dépôt nul : le coupon est un bénéfice", () => {
    expect(resultatBanqueCentrale(base)).toMatchObject({ revenus: 1, charges: 0, resultat: 1, fondsPropresApres: 6 });
  });

  it("taux de dépôt au-dessus du coupon : la banque centrale perd de l'argent", () => {
    const r = resultatBanqueCentrale({ ...base, tauxDepot: 0.03 });
    expect(r.resultat).toBeCloseTo(-2, 10);
    expect(r.fondsPropresApres).toBeCloseTo(3, 10);
  });

  it("annuler les titres efface l'actif mais pas le passif : fonds propres très négatifs", () => {
    const r = annulerTitres(base);
    expect(r.perte).toBe(100);
    expect(r.fondsPropresApres).toBe(-95);
  });
});
