import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { Chiffre } from "@/components/pedago/Chiffre";
import { nouvellePeriode } from "@/lib/actu/journal";
import { getSerie, toutesLesDonnees } from "@/lib/data";
import { resultatIpc } from "@/lib/maj/fonctions";
import { etatDuPoint, qualificatif } from "@/lib/versions";
import { construireFil } from "./actu";
import { alertesActives } from "./alertes";
import { indicateurs } from "./indicateurs";

/**
 * Inflation : un seul chiffre par indicateur, mois et statut, partout sur le
 * site ; chaque affichage dit l'indicateur (IPC de l'Insee ou IPCH d'Eurostat)
 * et le statut (provisoire ou définitif).
 */

const sansBalises = (html: string) => html.replace(/<[^>]+>/g, "").replace(/&#x27;/g, "'");

describe("versions des indicateurs d'inflation", () => {
  it("lit l'indicateur, le mois et le statut dans les communiqués de l'Insee", () => {
    expect(resultatIpc("En septembre 2026, les prix à la consommation augmenteraient de 3,0 % sur un an")).toEqual({ periode: "2026-09", valeur: 3, etat: "provisoire" });
    expect(resultatIpc("En septembre 2026, les prix à la consommation augmentent de 3,1 % sur un an")).toEqual({ periode: "2026-09", valeur: 3.1, etat: "definitif" });
    expect(resultatIpc("En mars 2027, les prix à la consommation baissent de 0,2 % sur un an")).toEqual({ periode: "2027-03", valeur: -0.2, etat: "definitif" });
    expect(resultatIpc("En octobre 2026, les prix à la consommation seraient stables sur un an")).toEqual({ periode: "2026-10", valeur: 0, etat: "provisoire" });
    expect(resultatIpc("En octobre 2026, le climat des affaires s'améliore")).toBeUndefined();
  });

  it("le résultat définitif remplace l'estimation provisoire, et le journal le note", () => {
    const provisoire = { id: "ind.inflation-ipc-fr", date: "2026-10", etat: "provisoire", serie: [{ x: "2026-09", y: 3.1 }, { x: "2026-10", y: 3.0 }] };
    const definitif = { ...provisoire, etat: "definitif", serie: [{ x: "2026-09", y: 3.1 }, { x: "2026-10", y: 3.2 }] };
    expect(nouvellePeriode(provisoire, definitif, "2026-11-13")).toMatchObject({ id: "ind.inflation-ipc-fr-2026-10-definitif", valeur: 3.2, etat: "definitif" });
    expect(nouvellePeriode(definitif, definitif, "2026-11-14")).toBeUndefined();
  });

  it("toutes les données d'inflation disent leur indicateur et leur statut", () => {
    const inflation = toutesLesDonnees().filter((d) => /inflation/.test(d.id));
    expect(inflation.map((d) => d.id).sort()).toEqual(["ind.inflation-fr", "ind.inflation-ipc-fr", "ind.inflation-za", "macro.inflation"]);
    for (const d of inflation) {
      expect(d.indicateur, d.id).toMatch(/^(IPC Insee|IPCH Eurostat)/);
      expect(["provisoire", "definitif"], d.id).toContain(d.etat);
    }
  });
});

describe("chaque affichage d'inflation précise l'indicateur, le mois et le statut", () => {
  it("dans les textes (<Chiffre>)", () => {
    const ipc = getSerie("ind.inflation-ipc-fr");
    const html = sansBalises(renderToStaticMarkup(createElement(Chiffre, { id: "ind.inflation-ipc-fr" })));
    expect(html).toContain(`(${qualificatif(ipc)})`);
    expect(html).toMatch(/\(IPC Insee, \S+ \d{4}, (provisoire|définitif)\)/);
    const annuel = sansBalises(renderToStaticMarkup(createElement(Chiffre, { id: "macro.inflation", x: "2022" })));
    expect(annuel).toContain("(IPC Insee, moyenne annuelle, 2022, définitif)");
  });

  it("sur le tableau de bord : l'IPC est la référence, l'IPCH sert à comparer en Europe", () => {
    const carte = indicateurs.find((i) => i.id === "inflation")!;
    expect(carte.serie).toBe("ind.inflation-ipc-fr");
    expect(carte.comparaison).toBeUndefined();
    expect(carte.comparaisonTexte?.series.map((s) => s.serie)).toEqual(["ind.inflation-fr", "ind.inflation-za"]);
  });

  it("dans le bandeau d'alerte", () => {
    const alerte = alertesActives().find((a) => a.id === "inflation-3");
    if (alerte) expect(alerte.phrase).toMatch(/IPC de l'Insee.*\((provisoire|définitif)\)/);
  });

  it("dans le fil « L'actu »", () => {
    for (const e of construireFil("2026-10-22").filter((x) => x.source?.nom === "Insee" && resultatIpc(x.titre))) {
      expect(e.version, e.titre).toMatch(/^IPC Insee, \S+ \d{4}, (provisoire|définitif)$/);
    }
  });
});

describe("un seul chiffre par indicateur, mois et statut", () => {
  it("toutes les sources du site concordent", () => {
    const vus = new Map<string, { valeur: number; ou: string }>();
    const ajouter = (indicateur: string, mois: string, etat: string, valeur: number, ou: string) => {
      const cle = `${indicateur} | ${mois} | ${etat}`;
      const deja = vus.get(cle);
      if (deja) expect(valeur, `${cle} : ${deja.ou} dit ${deja.valeur}, ${ou} dit ${valeur}`).toBe(deja.valeur);
      else vus.set(cle, { valeur, ou });
    };
    // 1. Les séries de données (tableau de bord, bandeau, textes, simulateur).
    for (const id of ["ind.inflation-ipc-fr", "ind.inflation-fr"]) {
      const d = getSerie(id);
      for (const p of d.serie) ajouter(d.indicateur!, p.x, etatDuPoint(d, p.x)!, p.y, id);
    }
    // 2. Les communiqués de l'Insee repris dans « L'actu ».
    for (const e of construireFil("2026-10-22")) {
      const r = e.source?.nom === "Insee" ? resultatIpc(e.titre) : undefined;
      if (r) ajouter("IPC Insee", r.periode, r.etat, r.valeur, `L'actu (${e.dateLibelle})`);
    }
    // 3. Le bandeau d'alerte.
    const alerte = alertesActives().find((a) => a.id === "inflation-3");
    const m = alerte && /: (-?\d+,\d) % .*\((provisoire|définitif)\)/.exec(alerte.phrase);
    if (alerte && m) ajouter("IPC Insee", alerte.date, m[2] === "définitif" ? "definitif" : "provisoire", Number(m[1].replace(",", ".")), "bandeau d'alerte");
    expect(vus.size).toBeGreaterThan(100);
  });
});
