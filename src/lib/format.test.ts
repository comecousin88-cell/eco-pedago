import { describe, expect, it } from "vitest";
import { formatAvecUnite, formatDateDonnee, formatEuros, formatPourcent, formatSource } from "./format";

// Intl insère des espaces insécables (fines) : on les normalise pour comparer.
const n = (s: string) => s.replace(/[  ]/g, " ");

describe("mise en forme", () => {
  it("nombres et unités à la française", () => {
    expect(n(formatAvecUnite(3500, "Md€"))).toBe("3 500 Md€");
    expect(n(formatAvecUnite(5.1, "% du PIB"))).toBe("5,1 % du PIB");
    expect(n(formatAvecUnite(8.25, "ans"))).toBe("8,25 ans");
  });

  it("pourcentages et euros", () => {
    expect(n(formatPourcent(0.029412, 2))).toBe("2,94 %");
    expect(n(formatEuros(91.4698))).toBe("91,47 €");
  });

  it("dates de données", () => {
    expect(formatDateDonnee("2026-03-31")).toBe("au 31/03/2026");
    expect(formatDateDonnee("2026-03")).toBe("de mars 2026");
    expect(formatDateDonnee("2025")).toBe("de 2025");
  });

  it("ligne de source", () => {
    expect(formatSource({ source: { nom: "Insee", url: "https://www.insee.fr" }, date: "2026-03-31" })).toBe(
      "Source : Insee — données au 31/03/2026",
    );
  });
});
