import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { IMPREVUS, GREVE, POPULARITE } from "@/content/jeu-redresser";
import { getSerie, getValeur } from "@/lib/data";
import {
  effortRequis,
  gouvernementTombe,
  jouerAnnee,
  mesureContestee,
  montee,
  objectifAtteint,
  rendementAnnee,
  type Actives,
  type EtatJeu,
  type HypothesesJeu,
  type Niveau,
} from "./redresser";
import { mesures, type Scenario } from "./mesures";

const racine = fileURLToPath(new URL("../../../", import.meta.url));
const v = (id: string) => getValeur(id).valeur;
const effortMinimal = v("ue.effort-structurel-minimal");
const calme = IMPREVUS.find((x) => x.id === "annee-calme")!;

/** État de départ et hypothèses, comme dans le jeu. */
export function departJeu(): { e: EtatJeu; h: HypothesesJeu } {
  const dette = getValeur("dette.fin-annee-pib");
  const solde = v("deficit.ratio-pib");
  const pib = v("macro.pib");
  const interetsPib = (v("fp.interets") / pib) * 100;
  const prec = getSerie("dette.historique-md").serie.find((p) => p.x === String(Number(dette.date) - 1))!.y;
  const spread = v("marches.spread-dernier");
  return {
    e: {
      annee: 0,
      dette: dette.valeur,
      soldePublic: -solde,
      soldePrimaire: -solde + interetsPib,
      soldeStructurel: -solde + interetsPib,
      soldeHorsChocs: -solde,
      spreadHorsChocs: spread,
      croissanceHorsChocs: v("macro.croissance-valeur"),
      tauxApparent: (v("fp.interets") / prec) * 100,
      spread,
      croissance: v("macro.croissance-valeur"),
      pib,
      chomage: getSerie("ind.chomage").serie.at(-1)!.y,
      popularite: POPULARITE.depart,
    },
    h: {
      croissanceTendance: v("ministre.croissance-tendancielle"),
      multDepenses: v("ministre.multiplicateur-depenses"),
      multImpots: v("ministre.multiplicateur-impots"),
      multInvestissement: v("ministre.multiplicateur-investissement"),
      stabilisateurs: v("ministre.stabilisateurs"),
      reactionSpread: v("ministre.reaction-spread"),
      tauxAllemand: v("marches.taux10-allemagne-dernier"),
      maturite: v("aft.maturite-moyenne"),
      decoteMaturites: v("ministre.decote-maturites"),
      okun: v("ministre.okun"),
    },
  };
}

/** Joue un plan (les mesures votées chaque année), sans imprévu. */
function jouer(plan: string[][], scenario: Scenario = "central") {
  const { e: depart, h } = departJeu();
  let e = depart;
  let actives: Actives = {};
  const historique: EtatJeu[] = [];
  let tombe = false;
  for (let a = 0; a < 5 && !tombe; a++) {
    const r = jouerAnnee(e, actives, { annee: a, nouvelles: plan[a] ?? [], imprevu: calme }, h, scenario);
    e = r.etat;
    actives = r.actives;
    historique.push(e);
    tombe = gouvernementTombe(e);
  }
  const atteint = (n: Niveau) => !tombe && objectifAtteint(n, depart, historique, effortMinimal);
  const total = Object.keys(actives).map((id) => mesures.find((m) => m.id === id)!);
  const depenses = total.filter((m) => m.nature === "depense").reduce((s, m) => s + m.rendement.central, 0);
  const recettes = total.filter((m) => m.nature === "recette").reduce((s, m) => s + m.rendement.central, 0);
  return { atteint, tombe, historique, depart, partEconomies: depenses / (depenses + recettes), popMin: Math.min(...historique.map((x) => x.popularite)) };
}

const PLAN_ECONOMIES = [
  ["ret-gel-2ans", "sante-plan-cour", "etat-operateurs", "coll-depenses", "ent-niches"],
  ["fp-point", "prest-gel", "aides-exceptionnelles", "def-report", "is-surtaxe", "pat-plancher"],
  ["coll-dotations", "fp-effectifs", "prest-chomage", "ret-65", "fraude-tva", "ir-gel-bareme"],
  ["prest-logement", "sante-franchises", "sante-arrets", "edu-demographie", "fp-carence", "ent-allegements-10"],
];
const PLAN_IMPOTS = [
  ["csg-2pts", "is-surtaxe", "pat-plancher", "ir-hauts-revenus", "ret-gel"],
  ["tva-2pts", "ent-allegements-10", "pat-successions", "pat-pfu", "etat-gel"],
  ["ir-gel-bareme", "ent-niches", "fraude-tva", "ir-tranche", "is-rachats", "coll-depenses", "aides-exceptionnelles"],
  ["accise-gazole", "def-report"],
];
const PLAN_ZERO = [
  ["sante-plan-cour", "etat-operateurs", "is-surtaxe", "pat-plancher", "ent-niches", "coll-depenses", "ret-gel-2ans", "aides-exceptionnelles"],
  ["csg-1pt", "ent-allegements-10", "pat-successions", "def-report", "fraude-tva"],
  ["tva-2pts", "fp-point", "coll-dotations", "pat-pfu", "ir-hauts-revenus"],
  ["ir-gel-bareme", "fp-effectifs", "prest-chomage", "is-rachats", "ir-tranche", "fraude-fiscale", "edu-demographie"],
  ["fp-carence", "fraude-sociale", "ent-cir"],
];

describe("calibrage", () => {
  it("objectifs calculés avec le modèle du jeu : du plus facile au plus difficile", () => {
    const { e, h } = departJeu();
    const [n1, n2, n3] = (["budget", "stabiliser", "zero"] as const).map((n) => effortRequis(n, e, h, effortMinimal));
    expect(n1).toBeLessThan(n2);
    expect(n2).toBeLessThan(n3);
  });

  it("sans mesure, aucun objectif n'est atteint", () => {
    const r = jouer([]);
    for (const n of ["budget", "stabiliser", "zero"] as const) expect(r.atteint(n), n).toBe(false);
  });

  it("un plan fondé surtout sur les économies peut stabiliser la dette sans faire tomber le gouvernement", () => {
    const r = jouer(PLAN_ECONOMIES);
    expect(r.partEconomies).toBeGreaterThan(0.6);
    expect(r.atteint("stabiliser")).toBe(true);
    expect(r.tombe).toBe(false);
  });

  it("un plan fondé surtout sur les impôts peut stabiliser la dette sans faire tomber le gouvernement", () => {
    const r = jouer(PLAN_IMPOTS);
    expect(r.partEconomies).toBeLessThan(0.4);
    expect(r.atteint("stabiliser")).toBe(true);
    expect(r.tombe).toBe(false);
  });

  it("le niveau 3 est atteignable, mais très difficile : presque tout le catalogue, étalé sur cinq ans, et des mesures qui rapportent autant que prévu au mieux", () => {
    const r = jouer(PLAN_ZERO, "haut");
    expect(r.atteint("zero")).toBe(true);
    expect(r.tombe).toBe(false);
    // Le même plan échoue si les mesures rapportent seulement le montant central.
    expect(jouer(PLAN_ZERO).atteint("zero")).toBe(false);
    expect(r.popMin).toBeLessThan(POPULARITE.seuil + 10);
    // Les deux plans sérieux du niveau 2 n'y suffisent pas.
    expect(jouer(PLAN_ECONOMIES).atteint("zero")).toBe(false);
    expect(jouer(PLAN_IMPOTS).atteint("zero")).toBe(false);
  });
});

describe("règles du jeu", () => {
  it("le gouvernement tombe si l'on vote trop de mesures impopulaires d'un coup", () => {
    const r = jouer([["csg-2pts", "tva-2pts", "ret-gel-2ans", "sante-plan-cour", "etat-operateurs", "ret-65", "coll-depenses", "prest-gel"]]);
    expect(r.tombe).toBe(true);
    expect(r.historique).toHaveLength(1);
  });

  it("la popularité se reconstitue chaque année, sans dépasser son niveau de départ", () => {
    const r = jouer([["csg-1pt"]]);
    expect(r.historique[0].popularite).toBeLessThan(POPULARITE.depart);
    expect(r.historique[1].popularite).toBeGreaterThan(r.historique[0].popularite);
    expect(Math.max(...jouer([]).historique.map((x) => x.popularite))).toBe(POPULARITE.depart);
  });

  it("une mesure votée reste active les années suivantes, et monte en charge selon son délai", () => {
    const { e, h } = departJeu();
    const r1 = jouerAnnee(e, {}, { annee: 0, nouvelles: ["etat-operateurs"], imprevu: calme }, h);
    const r2 = jouerAnnee(r1.etat, r1.actives, { annee: 1, nouvelles: [], imprevu: calme }, h);
    const r3 = jouerAnnee(r2.etat, r2.actives, { annee: 2, nouvelles: [], imprevu: calme }, h);
    expect(r3.actives).toEqual({ "etat-operateurs": 0 });
    expect(montee({ delai: "2-3-ans" }, 0)).toBeCloseTo(1 / 3);
    expect(montee({ delai: "2-3-ans" }, 2)).toBe(1);
    expect(montee({ delai: "immediat" }, 0)).toBe(1);
    expect(montee({ delai: "long-terme" }, 4)).toBe(1);
    expect(rendementAnnee(r3.actives, 2, "central").depenses).toBeCloseTo(10);
    // L'effort se répartit sur trois ans : un tiers chaque année.
    expect(r1.effort).toBeCloseTo(10 / 3);
    expect(r3.effort).toBeCloseTo(10 / 3);
  });

  it("une mesure qui touche plus d'un quart de la population peut provoquer une grève ; reculer la retire", () => {
    expect(mesureContestee(["csg-2pts", "pat-plancher"])?.id).toBe("csg-2pts");
    expect(mesureContestee(["pat-plancher"])).toBeUndefined();
    const { e, h } = departJeu();
    const reculer = GREVE.choix!.find((c) => c.retirerMesure)!;
    const r = jouerAnnee(e, {}, { annee: 0, nouvelles: ["csg-2pts", "pat-plancher"], imprevu: GREVE, choix: reculer }, h);
    expect(r.retiree).toBe("csg-2pts");
    expect(Object.keys(r.actives)).toEqual(["pat-plancher"]);
  });
});

describe("interface", () => {
  const source = (f: string) => readFileSync(`${racine}${f}`, "utf8");

  it("le choix de l'objectif garde le bouton « Revenir aux chiffres actuels »", () => {
    expect(source("src/components/jeux/RedresserLesComptes.tsx")).toMatch(/<BarreScenario scenario=\{[a-z]+\} \/>/);
  });

  it("« Ministre des Finances » n'existe plus : son adresse redirige vers le jeu unique", () => {
    const vercel = JSON.parse(source("vercel.json")) as { redirects?: { source: string; destination: string }[] };
    expect(vercel.redirects).toContainEqual(expect.objectContaining({ source: "/jeux/ministre-des-finances/", destination: "/jeux/redresser-les-comptes/" }));
  });
});
