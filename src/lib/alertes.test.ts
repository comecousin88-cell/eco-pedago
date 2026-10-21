import { describe, expect, it } from "vitest";
import { alertesActives, libelleDate, phraseAlerte, reglesAlertes, type RegleAlerte } from "@/content/alertes";
import { avecValeurRecente, difference, evaluerSeuil } from "./alertes";

const s = (...ys: number[]) => ys.map((y, i) => ({ x: `2026-0${i + 1}`, y }));

describe("évaluation d'un seuil", () => {
  it("donne la date du franchissement de la période en cours", () => {
    expect(evaluerSeuil(s(4.8, 5.1, 4.9, 5.2, 5.3), 5, "au-dessus")).toEqual({ etat: "franchi", depuis: "2026-04", dernier: { x: "2026-05", y: 5.3 } });
    expect(evaluerSeuil(s(5.1, 5.2), 5, "au-dessus")).toMatchObject({ etat: "franchi", depuis: "2026-01" });
  });

  it("le seuil lui-même ne déclenche pas l'alerte", () => {
    expect(evaluerSeuil(s(4, 5), 5, "au-dessus").etat).toBe("normal");
  });

  it("signale le retour sous le seuil au point qui suit", () => {
    expect(evaluerSeuil(s(5.2, 4.9), 5, "au-dessus")).toMatchObject({ etat: "retour", dernier: { y: 4.9 }, precedent: { y: 5.2 } });
    expect(evaluerSeuil(s(5.2, 4.9, 4.8), 5, "au-dessus").etat).toBe("normal");
  });

  it("fonctionne dans les deux sens", () => {
    expect(evaluerSeuil(s(1, -0.5), 0, "au-dessous")).toMatchObject({ etat: "franchi", depuis: "2026-02" });
  });

  it("calcule un écart entre deux séries sur les dates communes", () => {
    const fr = [{ x: "2026-08", y: 4 }, { x: "2026-09", y: 4.44 }];
    const it_ = [{ x: "2026-07", y: 3.9 }, { x: "2026-08", y: 3.986 }, { x: "2026-09", y: 4.362 }];
    expect(difference(fr, it_)).toEqual([{ x: "2026-08", y: 0.014 }, { x: "2026-09", y: 0.078 }]);
  });

  it("n'ajoute une valeur récente que si elle est postérieure", () => {
    const m = [{ x: "2026-09", y: 4.44 }];
    expect(avecValeurRecente(m, { valeur: 5.05, date: "2026-10-20" })).toEqual([...m, { x: "2026-10-20", y: 5.05 }]);
    expect(avecValeurRecente(m, { valeur: 5.05, date: "2026-09-30" })).toEqual(m);
    expect(avecValeurRecente(m, undefined)).toEqual(m);
    expect(avecValeurRecente([{ x: "2025", y: 115.7 }], { valeur: 119, date: "2026-06-30" })).toHaveLength(2);
  });
});

describe("phrases du bandeau", () => {
  const regle: RegleAlerte = {
    id: "test",
    sujet: "Le taux",
    libelleSeuil: "au-dessus de 5 %",
    seuil: 5,
    sens: "au-dessus",
    points: () => [],
    detail: (p) => `${String(p.y).replace(".", ",")} %`,
    lien: { href: "/", libelle: "" },
  };

  it("datent la donnée et le franchissement", () => {
    expect(phraseAlerte(regle, evaluerSeuil([...s(4.9, 5.1), { x: "2026-03-20", y: 5.3 }], 5, "au-dessus"))).toBe(
      "Le taux est au-dessus de 5 % depuis février 2026 : 5,3 % le 20 mars 2026.",
    );
    expect(phraseAlerte(regle, evaluerSeuil(s(5.2, 4.9), 5, "au-dessus"))).toBe(
      "Le taux n'est plus au-dessus de 5 % : 4,9 % en février 2026, après 5,2 % en janvier 2026.",
    );
    expect(phraseAlerte(regle, evaluerSeuil(s(4, 4.1), 5, "au-dessus"))).toBeUndefined();
  });

  it("écrivent toutes les formes de date", () => {
    expect(libelleDate("2025")).toBe("fin 2025");
    expect(libelleDate("2026-T2")).toBe("le 2e trimestre 2026");
    expect(libelleDate("2026-09")).toBe("en septembre 2026");
    expect(libelleDate("2026-06-30")).toBe("le 30 juin 2026");
    expect(libelleDate("2026-12-01")).toBe("le 1er décembre 2026");
  });

  it("toutes les règles se calculent sur les données actuelles", () => {
    for (const r of reglesAlertes) expect(() => evaluerSeuil(r.points(), r.seuil, r.sens), r.id).not.toThrow();
    for (const a of alertesActives()) {
      expect(a.phrase).toMatch(/\.$/);
      expect(a.phrase).not.toMatch(/undefined|NaN/);
    }
  });
});
