import { describe, expect, it } from "vitest";
import {
  appliquerSerie,
  changementsDeTaux,
  controlerSerie,
  finDeTrimestre,
  journaliser,
  lireCsvBce,
  lireJsonStatEurostat,
  lireSdmxInsee,
  lireWebstat,
  trimestreInsee,
} from "./fonctions";

describe("lecture des API", () => {
  it("lit l'export JSON de Webstat (Banque de France), dans les deux formes", () => {
    const lignes = [
      { series_key: "FM.D.FR", time_period: "2026-10-20", obs_value: 3.41 },
      { series_key: "FM.D.FR", time_period_start: "2026-10-19T00:00:00+00:00", obs_value: "3.38" },
      { series_key: "FM.D.FR", time_period: "2026-10-21", obs_value: null },
    ];
    const attendu = [
      { periode: "2026-10-19", valeur: 3.38 },
      { periode: "2026-10-20", valeur: 3.41 },
    ];
    expect(lireWebstat(lignes)).toEqual(attendu);
    expect(lireWebstat({ results: lignes })).toEqual(attendu);
    expect(lireWebstat({ error: "dataset observations does not exist" })).toEqual([]);
  });

  it("lit le CSV de la BCE", () => {
    const csv = "KEY,FREQ,TIME_PERIOD,OBS_VALUE,OBS_STATUS\nIRS.M.FR,M,2026-08,4,A\nIRS.M.FR,M,2026-09,4.44,A\nIRS.M.FR,M,2026-10,,A\n";
    expect(lireCsvBce(csv)).toEqual([
      { periode: "2026-08", valeur: 4 },
      { periode: "2026-09", valeur: 4.44 },
    ]);
  });

  it("lit le JSON-stat d'Eurostat pour un pays", () => {
    const json = {
      id: ["freq", "unit", "geo", "time"],
      size: [1, 1, 2, 2],
      dimension: {
        freq: { category: { index: { M: 0 } } },
        unit: { category: { index: { RCH_A: 0 } } },
        geo: { category: { index: { EA: 0, FR: 1 } } },
        time: { category: { index: { "2026-08": 0, "2026-09": 1 } } },
      },
      value: { "0": 3.2, "1": 3.8, "2": 2.6, "3": 3.4 },
    };
    expect(lireJsonStatEurostat(json, "FR")).toEqual([
      { periode: "2026-08", valeur: 2.6 },
      { periode: "2026-09", valeur: 3.4 },
    ]);
  });

  it("lit le SDMX de l'Insee", () => {
    const xml = '<Series><Obs TIME_PERIOD="2026-Q2" OBS_VALUE="8.3" OBS_STATUS="A"/><Obs TIME_PERIOD="2026-Q1" OBS_VALUE="8.1"/></Series>';
    expect(lireSdmxInsee(xml)).toEqual([
      { periode: "2026-Q1", valeur: 8.1 },
      { periode: "2026-Q2", valeur: 8.3 },
    ]);
    expect(trimestreInsee("2026-Q2")).toBe("2026-T2");
    expect(finDeTrimestre("2026-T2")).toBe("2026-06-30");
  });

  it("transforme un taux quotidien en dates de changement", () => {
    const q = [
      { periode: "2026-06-16", valeur: 2 },
      { periode: "2026-06-17", valeur: 2.25 },
      { periode: "2026-06-18", valeur: 2.25 },
      { periode: "2026-09-16", valeur: 2.5 },
    ];
    expect(changementsDeTaux(q, "2026-01-01")).toEqual([
      { x: "2026-06-16", y: 2 },
      { x: "2026-06-17", y: 2.25 },
      { x: "2026-09-16", y: 2.5 },
    ]);
  });
});

describe("contrôles et conservation des dernières valeurs", () => {
  const ancienne = [
    { x: "2026-08", y: 4 },
    { x: "2026-09", y: 4.44 },
  ];

  it("accepte une série prolongée et plausible", () => {
    expect(controlerSerie(ancienne, [...ancienne, { x: "2026-10", y: 4.5 }], { min: -2, max: 20 }).ok).toBe(true);
  });

  it("refuse une série vide, aberrante, en recul ou tronquée", () => {
    expect(controlerSerie(ancienne, [], { min: -2, max: 20 }).ok).toBe(false);
    expect(controlerSerie(ancienne, [...ancienne, { x: "2026-10", y: 450 }], { min: -2, max: 20 }).ok).toBe(false);
    expect(controlerSerie(ancienne, [{ x: "2026-08", y: 4 }], { min: -2, max: 20 }).ok).toBe(false);
    const longue = Array.from({ length: 100 }, (_, i) => ({ x: `${2000 + i}`, y: 1 }));
    expect(controlerSerie(longue, longue.slice(50), { min: -2, max: 20 }).ok).toBe(false);
  });

  it("met à jour la date de la donnée et sa date de consultation", () => {
    const d = { id: "x", serie: ancienne, date: "2026-09", consulte_le: "2026-10-21", statut: "verifie" };
    const n = appliquerSerie(d, [...ancienne, { x: "2026-10", y: 4.5 }], "2026-10", "2026-11-03");
    expect(n.date).toBe("2026-10");
    expect(n.consulte_le).toBe("2026-11-03");
    expect(n.serie).toHaveLength(3);
  });

  it("en cas d'échec d'une source, garde la date de sa dernière réussite", () => {
    const j1 = journaliser(undefined, "2026-10-22T06:00:00Z", { bce: { ok: true }, insee: { ok: true } });
    const j2 = journaliser(j1, "2026-10-23T06:00:00Z", { bce: { ok: true }, insee: { ok: false, message: "délai dépassé" } });
    expect(j2.derniere_verification).toBe("2026-10-23T06:00:00Z");
    expect(j2.sources.bce).toEqual({ statut: "ok", derniere_reussite: "2026-10-23T06:00:00Z" });
    expect(j2.sources.insee).toEqual({ statut: "echec", derniere_reussite: "2026-10-22T06:00:00Z", message: "délai dépassé" });
  });
});
