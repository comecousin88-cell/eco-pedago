import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { modules } from "@/content/modules";
import { agenda, CATEGORIES, dateEcheance, echeancesPassees, finEcheance, prochainesEcheances, type Evenement } from "./agenda";
import { toutesLesDonnees } from "./data";

const racine = fileURLToPath(new URL("../../", import.meta.url));
const ids = new Set(toutesLesDonnees().map((d) => d.id));

/** Une page du site : route de src/app ou module / section déclarés. */
function pageExiste(chemin: string): boolean {
  const morceaux = chemin.split("/").filter(Boolean);
  if (morceaux[0] === "modules") {
    const m = modules.find((x) => x.slug === morceaux[1]);
    if (!m) return false;
    return morceaux.length === 2 || m.sections.some((s) => s.slug === morceaux[2]);
  }
  return existsSync(`${racine}src/app/${morceaux.join("/")}/page.tsx`);
}

describe("data/agenda.json", () => {
  it("les identifiants sont uniques", () => {
    const tous = agenda.evenements.map((e) => e.id);
    expect(tous.length).toBe(new Set(tous).size);
  });

  it("les échéances sont rangées dans l'ordre chronologique", () => {
    const dates = agenda.evenements.map(finEcheance);
    expect(dates).toEqual([...dates].sort());
  });

  it.each(agenda.evenements.map((e) => [e.id, e] as const))("%s : date, catégorie, source, données et pages valides", (_, e) => {
    expect(e.titre.trim()).not.toBe("");
    expect(e.description.trim()).not.toBe("");
    expect(Object.keys(CATEGORIES)).toContain(e.categorie);
    expect(["confirme", "a_confirmer"]).toContain(e.statut);
    expect(["automatique", "validation"]).toContain(e.mise_a_jour);
    expect(e.date).toMatch(e.precision === "jour" ? /^\d{4}-\d{2}-\d{2}$/ : /^\d{4}-\d{2}$/);
    expect(Number.isNaN(Date.parse(finEcheance(e)))).toBe(false);
    expect(e.source.url).toMatch(/^https:\/\/[^/]+\/./);
    expect(e.consulte_le).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    // Une date non confirmée le dit et explique pourquoi.
    if (e.statut === "a_confirmer") expect(e.note?.trim() || e.precision === "mois").toBeTruthy();
    for (const id of e.donnees) expect(ids, `donnée inconnue : ${id}`).toContain(id);
    // Une mise à jour automatique doit porter sur des chiffres.
    if (e.mise_a_jour === "automatique") expect(e.donnees.length).toBeGreaterThan(0);
    expect(e.pages.length).toBeGreaterThan(0);
    for (const p of e.pages) expect(pageExiste(p), `page inconnue : ${p}`).toBe(true);
  });

  it("la revue de Moody's du 23 octobre 2026 est inscrite", () => {
    const moodys = agenda.evenements.find((e) => e.id === "moodys-2026-10");
    expect(moodys).toMatchObject({ date: "2026-10-23", categorie: "notation", mise_a_jour: "validation" });
    expect(moodys?.donnees).toContain("notation.france");
  });
});

describe("calcul des échéances", () => {
  const ev = (id: string, date: string, precision: "jour" | "mois" = "jour") => ({ id, date, precision }) as Evenement;
  const liste = [ev("b", "2026-11-10"), ev("a", "2026-10-23"), ev("m", "2026-12", "mois"), ev("p", "2026-09-30")];

  it("une échéance au mois court jusqu'à la fin du mois", () => {
    expect(finEcheance(ev("m", "2026-12", "mois"))).toBe("2026-12-31");
    expect(finEcheance(ev("f", "2027-02", "mois"))).toBe("2027-02-28");
  });

  it("sépare les échéances à venir (dont celle du jour) et passées", () => {
    expect(prochainesEcheances(liste, "2026-10-23").map((e) => e.id)).toEqual(["a", "b", "m"]);
    expect(prochainesEcheances(liste, "2026-10-24", 1).map((e) => e.id)).toEqual(["b"]);
    expect(prochainesEcheances(liste, "2026-12-15").map((e) => e.id)).toEqual(["m"]);
    expect(echeancesPassees(liste, "2026-10-24").map((e) => e.id)).toEqual(["a", "p"]);
  });

  it("écrit les dates en toutes lettres", () => {
    expect(dateEcheance(ev("a", "2026-10-23"))).toBe("23 octobre 2026");
    expect(dateEcheance(ev("a", "2026-12-01"))).toBe("1er décembre 2026");
    expect(dateEcheance(ev("m", "2027-06", "mois"))).toBe("juin 2027");
  });
});
