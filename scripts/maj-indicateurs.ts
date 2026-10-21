/**
 * Mise à jour automatique des indicateurs du tableau de bord.
 *
 *   npm run maj:indicateurs
 *
 * Interroge la BCE (taux directeurs, taux à 10 ans), Eurostat (inflation) et
 * l'Insee (chômage, dette trimestrielle, dette négociable de l'État) et, si une
 * clé est fournie, la Banque de France (taux à 10 ans quotidien) ; contrôle la
 * vraisemblance des séries, met à jour les fichiers de data/ et écrit
 * data/maj-indicateurs.json (date de la dernière vérification et état de chaque
 * source). Si une source ne répond pas ou renvoie une série suspecte, ses
 * données restent inchangées, avec leur date. Seule la Banque de France demande
 * une clé (variable d'environnement WEBSTAT_CLIENT_ID).
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
  lireWebstat,
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

function ajouterOuRemplacer(nom: string, nouvelle: DonneeJson) {
  if (fichier(nom).donnees.some((x) => x.id === nouvelle.id)) return remplacer(nom, nouvelle);
  fichier(nom).donnees.push(nouvelle);
  modifies.add(nom);
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
const serieInsee = async (idbank: string) => lireSdmxInsee(await telecharger(`https://bdm.insee.fr/series/sdmx/data/SERIES_BDM/${idbank}`));
const derniere = (obs: Observation[], id: string) => {
  const o = obs.at(-1);
  if (!o) throw new Error(`${id} : série vide`);
  return o;
};
const sourceInsee = (nom: string, idbank: string) => ({ nom: `${nom} (série ${idbank})`, url: `https://www.insee.fr/fr/statistiques/serie/${idbank}` });

/** Une valeur trimestrielle ou mensuelle ne doit pas reculer dans le temps ni sortir d'une fourchette. */
function verifierValeur(ancienne: DonneeJson, periode: string, valeur: number, bornes: { min: number; max: number }) {
  if (!Number.isFinite(valeur) || valeur < bornes.min || valeur > bornes.max) throw new Error(`${ancienne.id} : valeur aberrante (${valeur})`);
  if (periode < ancienne.date) throw new Error(`${ancienne.id} : la nouvelle donnée (${periode}) est plus ancienne que l'actuelle (${ancienne.date})`);
}

async function majInsee() {
  // Chômage au sens du BIT, trimestriel
  const s = (await serieInsee("001688527")).map((o) => ({ x: trimestreInsee(o.periode), y: o.valeur })).filter((p) => p.x >= "2000");
  verifier(donnee("indicateurs", "ind.chomage").serie, s, { min: 0, max: 30 }, "chômage");

  // Dette trimestrielle au sens de Maastricht (base 2020)
  const NOM_DETTE = "Insee, dette trimestrielle des administrations publiques au sens de Maastricht";
  const ids = { total: "010777616", ratio: "010777608", nette: "010777611", etat: "010777610", odac: "010777613", apul: "010777626", asso: "010777625" };
  const obs: Record<string, Observation> = {};
  for (const [cle, idbank] of Object.entries(ids)) obs[cle] = derniere(await serieInsee(idbank), idbank);
  const trimestre = trimestreInsee(obs.total.periode);
  if (Object.values(obs).some((o) => o.periode !== obs.total.periode)) throw new Error("dette trimestrielle : séries à des dates différentes");
  const fin = finDeTrimestre(trimestre);
  verifierValeur(donnee("dette", "dette.stock"), fin, obs.total.valeur, { min: 1000, max: 10000 });
  verifierValeur(donnee("dette", "dette.ratio-pib"), fin, obs.ratio.valeur, { min: 30, max: 250 });

  // Dette négociable de l'État (Agence France Trésor, reprise par l'Insee), mensuelle, en millions d'euros
  const NOM_AFT = "Agence France Trésor, encours de la dette négociable de l'État, repris par l'Insee";
  const negociable = derniere(await serieInsee("001711531"), "001711531");
  const courtTerme = derniere(await serieInsee("001711532"), "001711532");
  const indexee = derniere(await serieInsee("001738854"), "001738854");
  const [annee, mois] = negociable.periode.split("-").map(Number);
  const finMois = new Date(Date.UTC(annee, mois, 0)).toISOString().slice(0, 10);
  verifierValeur(donnee("aft", "aft.dette-negociable"), finMois, negociable.valeur / 1000, { min: 1000, max: 8000 });

  // Tout est contrôlé : on applique.
  const derChomage = s.at(-1)!;
  const chomage = appliquerSerie(donnee("indicateurs", "ind.chomage"), s, finDeTrimestre(derChomage.x), aujourdhui);
  chomage.note = `Données trimestrielles corrigées des variations saisonnières ; dernier trimestre : ${derChomage.x.replace("-T", " T")}.`;
  remplacer("indicateurs", chomage);

  const noteTrimestre = `Fin du ${trimestre.slice(-1) === "1" ? "1er" : `${trimestre.slice(-1)}e`} trimestre ${trimestre.slice(0, 4)}.`;
  remplacer("dette", { ...appliquerValeur(donnee("dette", "dette.stock"), obs.total.valeur, fin, aujourdhui, noteTrimestre), source: sourceInsee(NOM_DETTE, ids.total) });
  remplacer("dette", { ...appliquerValeur(donnee("dette", "dette.ratio-pib"), obs.ratio.valeur, fin, aujourdhui, noteTrimestre), source: sourceInsee(NOM_DETTE, ids.ratio) });
  remplacer("dette", { ...appliquerValeur(donnee("dette", "dette.nette"), obs.nette.valeur, fin, aujourdhui), source: sourceInsee("Insee, dette trimestrielle nette des administrations publiques", ids.nette) });
  const sousSecteurs = [
    { x: "État", y: obs.etat.valeur },
    { x: "Organismes divers d'administration centrale", y: obs.odac.valeur },
    { x: "Administrations publiques locales", y: obs.apul.valeur },
    { x: "Sécurité sociale", y: obs.asso.valeur },
  ];
  const somme = Math.round(sousSecteurs.reduce((t, p) => t + p.y, 0) * 10) / 10;
  remplacer("dette", {
    ...appliquerSerie(donnee("dette", "dette.par-sous-secteur"), sousSecteurs, fin, aujourdhui),
    source: { nom: `${NOM_DETTE}, par sous-secteur`, url: "https://www.insee.fr/fr/statistiques/2830301" },
    note: `Contributions consolidées à la dette ; somme ${somme.toLocaleString("fr-FR")} Md€ (arrondis).`,
  });

  const sourceAft = (idbank: string) => sourceInsee(NOM_AFT, idbank);
  const noteMois = "Valeur nominale, fin de mois.";
  remplacer("aft", { ...appliquerValeur(donnee("aft", "aft.dette-negociable"), Math.round(negociable.valeur / 100) / 10, finMois, aujourdhui, noteMois), source: sourceAft("001711531") });
  remplacer("aft", { ...appliquerValeur(donnee("aft", "aft.dette-court-terme"), Math.round(courtTerme.valeur / 100) / 10, finMois, aujourdhui, noteMois), source: sourceAft("001711532") });
  remplacer("aft", { ...appliquerValeur(donnee("aft", "aft.dette-negociable-indexee"), Math.round(indexee.valeur / 100) / 10, finMois, aujourdhui, noteMois), source: sourceAft("001738854") });

  return `chômage jusqu'au ${derChomage.x.replace("-T", " T")}, dette jusqu'au ${trimestre.replace("-T", " T")}, dette négociable jusqu'en ${negociable.periode}`;
}

/* ----------------------------------------------------- Banque de France */
/**
 * Taux de l'OAT à 10 ans au jour le jour (taux de l'échéance constante 10 ans,
 * Banque de France, Webstat). Facultatif : il faut une clé d'API gratuite,
 * enregistrée comme secret GitHub WEBSTAT_CLIENT_ID. Sans clé, cette source est
 * ignorée et le site s'en tient à la moyenne mensuelle publiée par la BCE.
 */
async function majBanqueDeFrance(cle: string) {
  // « Emprunt phare à 10 ans », quotidien (catalogue Webstat : ecofi-inr-fr-figb_pa-_z-d). Requête conforme au
  // guide de l'API Webstat (table observations, filtre sur series_key, clé dans l'en-tête Authorization: Apikey).
  // Si elle échoue, on essaie la variante « records » ; le message d'erreur liste chaque tentative.
  const SERIE = "ECOFI.INR.FR.FIGB_PA._Z.D";
  const base_ = "https://webstat.banque-france.fr/api/explore/v2.1/catalog/datasets";
  const filtre = `refine=series_key:%22${encodeURIComponent(SERIE)}%22&order_by=time_period_start%20desc&limit=30`;
  const essais = [`${base_}/observations/exports/json?${filtre}`, `${base_}/observations/records?${filtre}`];
  const echecs: string[] = [];
  let obs: Observation[] = [];
  for (const url of essais) {
    const r = await fetch(url, { headers: { Authorization: `Apikey ${cle}` }, signal: AbortSignal.timeout(60_000) });
    const texte = await r.text();
    if (r.ok) obs = lireWebstat(JSON.parse(texte));
    if (obs.length) break;
    echecs.push(`${url.replace(base_, "")} → HTTP ${r.status} ${texte.slice(0, 120)}`);
  }
  if (!obs.length) throw new Error(`Webstat : aucune observation. ${echecs.join(" | ")}`);
  const der = derniere(obs, SERIE);
  const ancienne = fichier("marches").donnees.find((x) => x.id === "marches.taux10-france-jour");
  const base: DonneeJson = ancienne ?? {
    id: "marches.taux10-france-jour",
    label: "Taux de l'OAT à 10 ans, dernier jour connu",
    valeur: der.valeur,
    unite: "%",
    date: der.periode,
    source: { nom: "Banque de France, Webstat : emprunt phare à 10 ans (série ECOFI.INR.FR.FIGB_PA._Z.D)", url: "https://webstat.banque-france.fr/fr/catalogue/ecofi/ECOFI.INR.FR.FIGB_PA._Z.D" },
    statut: "verifie",
  };
  verifierValeur(base, der.periode, der.valeur, { min: -2, max: 40 });
  ajouterOuRemplacer("marches", appliquerValeur(base, der.valeur, der.periode, aujourdhui, "Taux de fin de journée."));
  return `taux à 10 ans du ${dateFr(der.periode)} : ${der.valeur} %`;
}

/* ------------------------------------------------------------- Exécution */
const sources: [string, () => Promise<string>][] = [
  ["bce", majBce],
  ["eurostat", majEurostat],
  ["insee", majInsee],
];
const cleWebstat = process.env.WEBSTAT_CLIENT_ID;
if (cleWebstat) sources.push(["banque-de-france", () => majBanqueDeFrance(cleWebstat)]);
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
