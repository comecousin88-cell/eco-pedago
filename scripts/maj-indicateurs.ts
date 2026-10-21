/**
 * Mise à jour automatique des indicateurs du tableau de bord.
 *
 *   npm run maj:indicateurs
 *
 * Interroge la BCE (taux directeurs, taux à 10 ans), Eurostat (inflation) et
 * l'Insee (chômage), contrôle la vraisemblance des séries, met à jour les
 * fichiers de data/ et écrit data/maj-indicateurs.json (date de la dernière
 * vérification et état de chaque source). Si une source ne répond pas ou
 * renvoie une série suspecte, ses données restent inchangées, avec leur date.
 * Aucune clé d'API n'est nécessaire.
 */
import { readFileSync, writeFileSync, appendFileSync } from "node:fs";
import {
  appliquerSerie,
  appliquerValeur,
  changementsDeTaux,
  controlerSerie,
  finDeTrimestre,
  journaliser,
  lireCsvBce,
  lireJsonStatEurostat,
  lireSdmxInsee,
  trimestreInsee,
  type DonneeJson,
  type JournalMaj,
  type Observation,
  type Point,
} from "../src/lib/maj/fonctions.ts";

const RACINE = new URL("../", import.meta.url);
const maintenant = new Date();
const aujourdhui = maintenant.toISOString().slice(0, 10);

interface Fichier {
  description: string;
  donnees: DonneeJson[];
}

const fichiers = new Map<string, Fichier>();
const modifies = new Set<string>();

function fichier(nom: string): Fichier {
  if (!fichiers.has(nom)) fichiers.set(nom, JSON.parse(readFileSync(new URL(`data/${nom}.json`, RACINE), "utf8")));
  return fichiers.get(nom)!;
}

function donnee(nom: string, id: string): DonneeJson {
  const d = fichier(nom).donnees.find((x) => x.id === id);
  if (!d) throw new Error(`${id} absent de data/${nom}.json`);
  return d;
}

function remplacer(nom: string, nouvelle: DonneeJson) {
  const f = fichier(nom);
  const i = f.donnees.findIndex((x) => x.id === nouvelle.id);
  if (JSON.stringify(f.donnees[i]) !== JSON.stringify(nouvelle)) modifies.add(nom);
  f.donnees[i] = nouvelle;
}

async function telecharger(url: string, essais = 3): Promise<string> {
  let derniere: unknown;
  for (let k = 1; k <= essais; k++) {
    try {
      const r = await fetch(url, { headers: { "User-Agent": "eco-en-clair (mise a jour des indicateurs)" }, signal: AbortSignal.timeout(60_000) });
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      return await r.text();
    } catch (e) {
      derniere = e;
      await new Promise((ok) => setTimeout(ok, 2000 * k));
    }
  }
  throw new Error(`${url} : ${derniere instanceof Error ? derniere.message : String(derniere)}`);
}

const versPoints = (obs: Observation[]): Point[] => obs.map((o) => ({ x: o.periode, y: o.valeur }));

function verifier(ancienne: Point[] | undefined, nouvelle: Point[], bornes: { min: number; max: number }, id: string) {
  const c = controlerSerie(ancienne ?? [], nouvelle, bornes);
  if (!c.ok) throw new Error(`${id} : ${c.raison}`);
}

const dateFr = (iso: string) => iso.split("-").reverse().join("/");

/* ------------------------------------------------------------------ BCE */
async function majBce() {
  const bce = "https://data-api.ecb.europa.eu/service/data";
  const pays: [string, string][] = [
    ["FR", "france"],
    ["DE", "allemagne"],
    ["IT", "italie"],
    ["ES", "espagne"],
  ];
  const taux: Record<string, Point[]> = {};
  for (const [code, nom] of pays) {
    const csv = await telecharger(`${bce}/IRS/M.${code}.L.L40.CI.0000.EUR.N.Z?format=csvdata&startPeriod=2000-01`);
    const s = versPoints(lireCsvBce(csv));
    verifier(donnee("marches", `marches.taux10-${nom}`).serie, s, { min: -2, max: 40 }, `taux à 10 ans (${code})`);
    taux[nom] = s;
  }
  const allemagne = new Map(taux.allemagne.map((p) => [p.x, p.y]));
  const spread = taux.france.filter((p) => allemagne.has(p.x)).map((p) => ({ x: p.x, y: Math.round((p.y - allemagne.get(p.x)!) * 100) }));
  verifier(donnee("marches", "marches.spread-france-allemagne").serie, spread, { min: -100, max: 1000 }, "écart France-Allemagne");

  const quotidien = async (cle: string) => lireCsvBce(await telecharger(`${bce}/FM/D.U2.EUR.4F.KR.${cle}.LEV?format=csvdata&startPeriod=2008-01-01`));
  const depot = changementsDeTaux(await quotidien("DFR"), "2008-07-01");
  verifier(donnee("banque-centrale", "bce.taux-depot").serie, depot, { min: -2, max: 10 }, "taux de dépôt");
  const refi = changementsDeTaux(await quotidien("MRR_FR"), "2008-07-01");
  if (refi.length === 0) throw new Error("taux de refinancement : série vide");

  // Tout est contrôlé : on applique.
  for (const [, nom] of pays) {
    const s = taux[nom];
    const der = s.at(-1)!;
    remplacer("marches", appliquerSerie(donnee("marches", `marches.taux10-${nom}`), s, der.x, aujourdhui));
    const idDernier = `marches.taux10-${nom}-dernier`;
    if (fichier("marches").donnees.some((x) => x.id === idDernier))
      remplacer("marches", appliquerValeur(donnee("marches", idDernier), der.y, der.x, aujourdhui));
  }
  const derSpread = spread.at(-1)!;
  remplacer("marches", appliquerSerie(donnee("marches", "marches.spread-france-allemagne"), spread, derSpread.x, aujourdhui));
  remplacer("marches", appliquerValeur(donnee("marches", "marches.spread-dernier"), derSpread.y, derSpread.x, aujourdhui));

  const derDepot = depot.at(-1)!;
  remplacer("banque-centrale", appliquerSerie(donnee("banque-centrale", "bce.taux-depot"), depot, derDepot.x, aujourdhui));
  remplacer(
    "banque-centrale",
    appliquerValeur(donnee("banque-centrale", "bce.taux-depot-actuel"), derDepot.y, derDepot.x, aujourdhui, `En vigueur depuis le ${dateFr(derDepot.x)}.`),
  );
  const derRefi = refi.at(-1)!;
  remplacer("banque-centrale", appliquerValeur(donnee("banque-centrale", "bce.taux-refi-actuel"), derRefi.y, derRefi.x, aujourdhui));
  return `taux à 10 ans jusqu'en ${derSpread.x}, taux de dépôt ${derDepot.y} % depuis le ${dateFr(derDepot.x)}`;
}

/* ------------------------------------------------------------- Eurostat */
async function majEurostat() {
  const url =
    "https://ec.europa.eu/eurostat/api/dissemination/statistics/1.0/data/prc_hicp_minr?geo=FR&geo=EA&unit=RCH_A&coicop18=TOTAL&sinceTimePeriod=2015-01&lang=fr";
  const json = JSON.parse(await telecharger(url));
  const fr = versPoints(lireJsonStatEurostat(json, "FR"));
  const za = versPoints(lireJsonStatEurostat(json, "EA"));
  verifier(donnee("indicateurs", "ind.inflation-fr").serie, fr, { min: -5, max: 30 }, "inflation France");
  verifier(donnee("indicateurs", "ind.inflation-za").serie, za, { min: -5, max: 30 }, "inflation zone euro");
  remplacer("indicateurs", appliquerSerie(donnee("indicateurs", "ind.inflation-fr"), fr, fr.at(-1)!.x, aujourdhui));
  remplacer("indicateurs", appliquerSerie(donnee("indicateurs", "ind.inflation-za"), za, za.at(-1)!.x, aujourdhui));
  return `inflation jusqu'en ${fr.at(-1)!.x}`;
}

/* ---------------------------------------------------------------- Insee */
async function majInsee() {
  const xml = await telecharger("https://bdm.insee.fr/series/sdmx/data/SERIES_BDM/001688527");
  const s = lireSdmxInsee(xml)
    .map((o) => ({ x: trimestreInsee(o.periode), y: o.valeur }))
    .filter((p) => p.x >= "2000");
  verifier(donnee("indicateurs", "ind.chomage").serie, s, { min: 0, max: 30 }, "chômage");
  const der = s.at(-1)!;
  const d = appliquerSerie(donnee("indicateurs", "ind.chomage"), s, finDeTrimestre(der.x), aujourdhui);
  d.note = `Données trimestrielles corrigées des variations saisonnières ; dernier trimestre : ${der.x.replace("-T", " T")}.`;
  remplacer("indicateurs", d);
  return `chômage jusqu'au ${der.x.replace("-T", " T")}`;
}

/* ------------------------------------------------------------- Exécution */
const sources: [string, () => Promise<string>][] = [
  ["bce", majBce],
  ["eurostat", majEurostat],
  ["insee", majInsee],
];
const resultats: Record<string, { ok: boolean; message?: string }> = {};
const lignes: string[] = [];
for (const [nom, maj] of sources) {
  try {
    const bilan = await maj();
    resultats[nom] = { ok: true };
    lignes.push(`✓ ${nom} : ${bilan}`);
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    resultats[nom] = { ok: false, message };
    lignes.push(`✗ ${nom} : ${message} (dernières valeurs conservées)`);
  }
}

for (const nom of modifies) {
  writeFileSync(new URL(`data/${nom}.json`, RACINE), `${JSON.stringify(fichier(nom), null, 2)}\n`, "utf8");
}
const cheminJournal = new URL("data/maj-indicateurs.json", RACINE);
let precedent: JournalMaj | undefined;
try {
  precedent = JSON.parse(readFileSync(cheminJournal, "utf8"));
} catch {
  precedent = undefined;
}
const journal = journaliser(precedent, maintenant.toISOString(), resultats);
writeFileSync(cheminJournal, `${JSON.stringify(journal, null, 2)}\n`, "utf8");

const resume = [`Mise à jour des indicateurs du ${aujourdhui}`, ...lignes, `Fichiers modifiés : ${[...modifies].join(", ") || "aucun"}`].join("\n");
console.log(resume);
if (process.env.GITHUB_STEP_SUMMARY) appendFileSync(process.env.GITHUB_STEP_SUMMARY, `${resume.replaceAll("\n", "\n\n")}\n`);
// L'échec d'une source n'arrête pas la mise à jour : les autres sources sont publiées.
