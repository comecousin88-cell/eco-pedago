import { describe, expect, it } from "vitest";
import { derniersPoints, dernierPoint, libellePeriode, unAnAvant, valeurUnAnAvant } from "./indicateurs";
import { indicateurs } from "@/content/indicateurs";
import { getDonnee } from "./data";

describe("tableau de bord : calculs", () => {
  it("trouve la période un an avant, quel que soit le format", () => {
    expect(unAnAvant("2025", "annuelle")).toBe("2024");
    expect(unAnAvant("2026-09", "mensuelle")).toBe("2025-09");
    expect(unAnAvant("2026-T2", "trimestrielle")).toBe("2025-T2");
    expect(unAnAvant("2026-09-16", "paliers")).toBe("2025-09-16");
  });

  it("pour une série en paliers, retient le taux en vigueur un an plus tôt", () => {
    const paliers = [
      { x: "2024-06-12", y: 3.75 },
      { x: "2025-06-11", y: 2 },
      { x: "2026-06-17", y: 2.25 },
      { x: "2026-09-16", y: 2.5 },
    ];
    expect(valeurUnAnAvant(paliers, "paliers")).toBe(2);
  });

  it("pour une série mensuelle, prend le même mois de l'année précédente", () => {
    const s = [
      { x: "2025-08", y: 1 },
      { x: "2025-09", y: 1.2 },
      { x: "2026-09", y: 3.4 },
    ];
    expect(valeurUnAnAvant(s, "mensuelle")).toBe(1.2);
    expect(dernierPoint(s).y).toBe(3.4);
  });

  it("écrit les périodes en clair", () => {
    expect(libellePeriode("2026-09", "mensuelle")).toBe("septembre 2026");
    expect(libellePeriode("2026-T1", "trimestrielle")).toBe("1er trimestre 2026");
    expect(libellePeriode("2026-T2", "trimestrielle")).toBe("2e trimestre 2026");
    expect(libellePeriode("2026-09-16", "paliers")).toBe("16/09/2026");
  });

  it("garde les dernières années pour la courbe miniature", () => {
    const s = Array.from({ length: 30 }, (_, i) => ({ x: String(1996 + i), y: i }));
    expect(derniersPoints(s, "annuelle", 10)).toHaveLength(11);
  });
});

describe("tableau de bord : contenu", () => {
  it("sept indicateurs, chacun relié à une série existante et à une page explicative", () => {
    expect(indicateurs).toHaveLength(7);
    for (const i of indicateurs) {
      const d = getDonnee(i.serie);
      expect("serie" in d, i.id).toBe(true);
      expect(i.lien.href).toMatch(/^\/modules\//);
      expect(i.explication.length, i.id).toBeGreaterThan(40);
    }
  });

  it("chaque indicateur a une valeur un an plus tôt pour calculer sa variation", () => {
    for (const i of indicateurs) {
      const d = getDonnee(i.serie);
      if (!("serie" in d)) continue;
      expect(valeurUnAnAvant(d.serie, i.frequence), i.id).toBeDefined();
    }
  });
});
