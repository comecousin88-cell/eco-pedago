/**
 * Moteur du jeu « Redresser les comptes » : un objectif, cinq budgets de suite,
 * un imprévu par an. Fonctions pures, testées (calibrage, chute du
 * gouvernement, mesures qui restent d'une année sur l'autre).
 *
 * Chaque année :
 *  - les mesures votées restent actives ; leur rendement monte selon leur délai
 *    (immédiat : tout de suite ; 2 à 3 ans : un tiers par an ; long terme : un
 *    cinquième par an) ;
 *  - l'effort nouveau de l'année (économies, recettes) passe dans le modèle
 *    macroéconomique du jeu (lib/game/ministre.ts : multiplicateurs, intérêts,
 *    écart de taux, dette) ;
 *  - le chômage suit la croissance (loi d'Okun) ;
 *  - la popularité baisse du coût politique des mesures nouvelles, selon une
 *    règle unique (content/jeu-redresser.ts), et remonte un peu chaque année
 *    (l'opinion s'habitue). Sous le seuil, le gouvernement tombe.
 */
import { GREVE, IMPREVUS, PARTS_TOUCHEES, POPULARITE, SEUIL_GREVE, type ChoixReaction, type Imprevu } from "@/content/jeu-redresser";
import { aleatoire, anneeMandat, type EtatMinistre, type HypothesesMinistre } from "./ministre";
import { mesures as catalogue, type Mesure, type Scenario } from "./mesures";

export type Niveau = "budget" | "stabiliser" | "zero";
export const ANNEES_JEU = 5;

export interface HypothesesJeu extends HypothesesMinistre {
  /** Points de chômage en plus par point de croissance en moins. */
  okun: number;
}

export interface EtatJeu extends EtatMinistre {
  /** Taux de chômage, en %. */
  chomage: number;
  /** Popularité du gouvernement, sur 100. */
  popularite: number;
}

/** Mesures actives : identifiant → année d'adoption (0 = première année). */
export type Actives = Record<string, number>;

/** Part de la population qui paie une mesure directement (les groupes s'additionnent, dans la limite de 100 %). */
export function partTouchee(m: Pick<Mesure, "payeurs">): number {
  return Math.min(1, m.payeurs.reduce((s, p) => s + PARTS_TOUCHEES[p].part, 0));
}

/** Coût politique d'une mesure : la même règle pour toutes. */
export function coutPopularite(m: Pick<Mesure, "payeurs" | "rendement">, scenario: Scenario = "central"): number {
  return POPULARITE.coefficient * m.rendement[scenario] * (POPULARITE.plancher + partTouchee(m));
}

/** Part du rendement plein atteinte `ans` années après l'adoption (0 = l'année même). */
export function montee(m: Pick<Mesure, "delai">, ans: number): number {
  if (ans < 0) return 0;
  if (m.delai === "immediat") return 1;
  if (m.delai === "2-3-ans") return Math.min(1, (ans + 1) / 3);
  return Math.min(1, (ans + 1) / 5);
}

/** Rendement des mesures actives une année donnée, séparé entre économies et recettes. */
export function rendementAnnee(actives: Actives, annee: number, scenario: Scenario, liste: readonly Mesure[] = catalogue): { depenses: number; recettes: number } {
  let depenses = 0;
  let recettes = 0;
  for (const [id, adoptee] of Object.entries(actives)) {
    const m = liste.find((x) => x.id === id);
    if (!m) continue;
    const v = m.rendement[scenario] * montee(m, annee - adoptee);
    if (m.nature === "depense") depenses += v;
    else recettes += v;
  }
  return { depenses, recettes };
}

/** Rendement à plein régime des mesures actives (ce qu'elles rapporteront une fois montées en charge). */
export function rendementPlein(actives: Actives, scenario: Scenario, liste: readonly Mesure[] = catalogue): number {
  return Object.keys(actives).reduce((s, id) => s + (liste.find((x) => x.id === id)?.rendement[scenario] ?? 0), 0);
}

/** Tirage reproductible des imprévus de la partie (sans répétition tant que possible). */
export function tirerImprevus(graine: number, liste: readonly Imprevu[] = IMPREVUS, n = ANNEES_JEU): Imprevu[] {
  const hasard = aleatoire(graine);
  const pioche = [...liste];
  const tirage: Imprevu[] = [];
  for (let i = 0; i < n; i++) {
    if (pioche.length === 0) pioche.push(...liste);
    tirage.push(pioche.splice(Math.floor(hasard() * pioche.length), 1)[0]);
  }
  return tirage;
}

/** La mesure nouvelle la plus large de l'année, si elle touche assez de monde pour déclencher une grève. */
export function mesureContestee(nouvelles: readonly string[], liste: readonly Mesure[] = catalogue): Mesure | undefined {
  return nouvelles
    .map((id) => liste.find((x) => x.id === id))
    .filter((m): m is Mesure => !!m && partTouchee(m) > SEUIL_GREVE)
    .sort((a, b) => coutPopularite(b) - coutPopularite(a))[0];
}

/**
 * L'imprévu de l'année : la grève, une fois sur deux, quand une mesure nouvelle
 * touche plus d'un quart de la population ; sinon la carte tirée en début de partie.
 */
export function imprevuDeLAnnee(tirage: readonly Imprevu[], annee: number, nouvelles: readonly string[], graine: number, liste: readonly Mesure[] = catalogue): Imprevu {
  if (mesureContestee(nouvelles, liste) && aleatoire(graine + 101 * (annee + 1))() < 0.5) return GREVE;
  return tirage[annee];
}

/** Une agence de notation maintient la note si le déficit est sous 3 % ou si le budget de l'année le réduit d'au moins 0,3 point. */
export function noteMaintenue(etat: EtatJeu, effortNouveauMd: number): boolean {
  return etat.soldePublic >= -3 || (effortNouveauMd / etat.pib) * 100 >= 0.3;
}

export interface TourJeu {
  /** 0 à 4 : 2026 à 2030. */
  annee: number;
  nouvelles: string[];
  imprevu: Imprevu;
  choix?: ChoixReaction;
}

export interface ResultatTour {
  etat: EtatJeu;
  actives: Actives;
  /** Mesure retirée après une grève. */
  retiree?: string;
  /** Pour la revue d'une agence de notation : la note a-t-elle été maintenue ? */
  noteMaintenue?: boolean;
  /** Effort nouveau de l'année, en Md€. */
  effort: number;
  /** Coût politique des mesures nouvelles. */
  coutPolitique: number;
}

/** Une année de jeu : vote du budget, imprévu, réaction éventuelle. */
export function jouerAnnee(etat: EtatJeu, actives: Actives, tour: TourJeu, h: HypothesesJeu, scenario: Scenario = "central", liste: readonly Mesure[] = catalogue): ResultatTour {
  const apres: Actives = { ...actives };
  for (const id of tour.nouvelles) if (apres[id] === undefined) apres[id] = tour.annee;
  let retiree: string | undefined;
  if (tour.choix?.retirerMesure) {
    retiree = mesureContestee(tour.nouvelles, liste)?.id;
    if (retiree) delete apres[retiree];
  }
  const avant = rendementAnnee(actives, tour.annee - 1, scenario, liste);
  const maintenant = rendementAnnee(apres, tour.annee, scenario, liste);
  const economies = maintenant.depenses - avant.depenses;
  const impots = maintenant.recettes - avant.recettes;

  const pt = (md: number) => (md / etat.pib) * 100;
  const ponctuel = tour.choix?.effortPonctuel ?? 0;
  const imp = tour.imprevu;
  const maintenue = imp.id === "notation" ? noteMaintenue(etat, economies + impots + ponctuel) : undefined;
  const suivant = anneeMandat(
    etat,
    { economies, impots, investissement: 0 },
    {
      id: imp.id,
      titre: imp.titre,
      texte: imp.texte,
      // Des économies d'urgence freinent l'activité comme les autres économies, mais ne durent qu'un an.
      croissance: imp.croissance - h.multDepenses * pt(ponctuel),
      taux: imp.taux,
      spread: imp.spread + (tour.choix?.spread ?? 0) + (maintenue === false ? 30 : 0),
      cout: imp.cout - ponctuel,
    },
    h,
  );
  const nouvellesRetenues = tour.nouvelles.filter((id) => id !== retiree && actives[id] === undefined);
  const coutPolitique = nouvellesRetenues.reduce((s, id) => {
    const m = liste.find((x) => x.id === id);
    // Le coût politique se calcule sur le montant central : l'hypothèse de rendement ne change pas qui paie.
    return s + (m ? coutPopularite(m) : 0);
  }, 0);
  // L'opinion s'habitue : on regagne quelques points par an, sans dépasser le niveau de départ.
  const apresMesures = etat.popularite - coutPolitique;
  const recuperee = Math.max(apresMesures, Math.min(POPULARITE.depart, apresMesures + POPULARITE.recuperation));
  const popularite = Math.max(0, Math.min(100, recuperee + imp.popularite + (tour.choix?.popularite ?? 0)));
  const chomage = Math.max(3, etat.chomage + h.okun * (h.croissanceTendance - suivant.croissance));
  return { etat: { ...suivant, chomage, popularite }, actives: apres, retiree, noteMaintenue: maintenue, effort: economies + impots + ponctuel, coutPolitique };
}

export const gouvernementTombe = (e: EtatJeu) => e.popularite < POPULARITE.seuil;

/** Montant à trouver pour chaque niveau, en Md€ par an : le niveau 1 compte cinq ans d'effort européen minimal. */
export function montantsObjectifs(o: { budget: number; stabiliser: number; zero: number }): Record<Niveau, number> {
  return { budget: o.budget * ANNEES_JEU, stabiliser: o.stabiliser, zero: o.zero };
}

/** L'objectif est-il atteint en fin de partie ? Jugé sur le résultat, imprévus compris. */
export function objectifAtteint(niveau: Niveau, depart: EtatJeu, historique: readonly EtatJeu[], effortMinimalPct: number): boolean {
  const fin = historique[historique.length - 1];
  const avantDerniere = historique[historique.length - 2] ?? depart;
  if (niveau === "budget") return fin.soldeStructurel - depart.soldeStructurel >= ANNEES_JEU * effortMinimalPct - 0.05;
  if (niveau === "stabiliser") return fin.dette <= avantDerniere.dette + 0.05;
  return fin.soldeHorsChocs >= -0.1;
}

export interface Note {
  note: number;
  verdict: string;
}

/** Note sur 20 : l'objectif d'abord, puis ce que le plan a coûté en emploi, en popularité et en confiance des marchés. */
export function noteFinale(p: { atteint: boolean; progression: number; depart: EtatJeu; fin: EtatJeu; chute: boolean }): Note {
  const borne = (x: number) => Math.max(0, Math.min(1, x));
  if (p.chute) return { note: Math.round(4 * borne(p.progression)), verdict: "Le gouvernement est tombé" };
  const objectif = p.atteint ? 12 : 9 * borne(p.progression);
  const popularite = 3 * borne((p.fin.popularite - POPULARITE.seuil) / (POPULARITE.depart - POPULARITE.seuil));
  const emploi = 3 * borne(1 - (p.fin.chomage - p.depart.chomage) / 1.5);
  const marches = 2 * borne(1 - (p.fin.spreadHorsChocs - p.depart.spreadHorsChocs) / 50);
  const note = Math.round(objectif + popularite + emploi + marches);
  const verdict = note >= 16 ? "Plan solide" : note >= 12 ? "Plan réussi, mais coûteux" : note >= 8 ? "Plan fragile" : "Plan insuffisant";
  return { note, verdict };
}

/** Ce que le plan aurait probablement donné dans la réalité, selon sa composition. */
export function phraseRealite(depenses: number, recettes: number, niveau: Niveau, atteint: boolean): string {
  const total = depenses + recettes;
  const partEconomies = total > 0 ? depenses / total : 0;
  const composition =
    total === 0
      ? "Sans mesure, la dette aurait continué de monter : le déficit ne se résorbe pas tout seul quand les intérêts augmentent."
      : partEconomies >= 0.65
        ? "Dans la réalité, des redressements fondés surtout sur les économies ont réussi ailleurs, comme au Canada ou en Suède dans les années 1990, mais ils pèsent d'abord sur les services publics et les prestations, et la difficulté est de les tenir plusieurs années."
        : partEconomies <= 0.35
          ? "Dans la réalité, la France a déjà l'un des taux de prélèvements obligatoires les plus élevés d'Europe : des hausses d'impôts de cette ampleur rapporteraient sans doute un peu moins que prévu, car les comportements s'adaptent."
          : "Dans la réalité, la plupart des redressements durables ont combiné économies et recettes, étalés sur plusieurs années.";
  const zero = niveau === "zero" && atteint ? " Revenir à l'équilibre n'est plus arrivé en France depuis 1974 : il faudrait tenir cet effort plusieurs années de suite." : "";
  return composition + zero;
}

/** Bilan de l'année en deux ou trois phrases simples. */
export function bilanAnnee(avant: EtatJeu, apres: EtatJeu, r: ResultatTour, imprevu: Imprevu, anneeCivile: number): string {
  const f = (x: number) => x.toLocaleString("fr-FR", { minimumFractionDigits: 1, maximumFractionDigits: 1 });
  const deficitAvant = -avant.soldePublic;
  const deficitApres = -apres.soldePublic;
  const effort =
    r.effort > 0.05
      ? `Ton budget ${anneeCivile} ajoute ${f(r.effort)} Md€ d'effort.`
      : "Tu n'as pas ajouté d'effort cette année.";
  const choc =
    imprevu.id === "annee-calme"
      ? ""
      : imprevu.id === "notation"
        ? r.noteMaintenue
          ? " L'agence de notation a maintenu la note : ta trajectoire est jugée crédible."
          : " L'agence de notation a dégradé la note : l'écart de taux avec l'Allemagne monte, et les intérêts suivront."
        : ` ${imprevu.titre} : ${imprevu.croissance < 0 || imprevu.cout > 0 || imprevu.taux > 0 ? "l'imprévu pèse sur les comptes" : "l'imprévu aide les comptes"}.`;
  const resultat =
    deficitApres < deficitAvant - 0.05
      ? ` Le déficit passe de ${f(deficitAvant)} à ${f(deficitApres)} % du PIB`
      : deficitApres > deficitAvant + 0.05
        ? ` Le déficit remonte de ${f(deficitAvant)} à ${f(deficitApres)} % du PIB`
        : ` Le déficit reste à ${f(deficitApres)} % du PIB`;
  const dette = apres.dette > avant.dette + 0.05 ? ", et la dette continue de monter." : apres.dette < avant.dette - 0.05 ? ", et la dette baisse par rapport au PIB." : ", et la dette se stabilise.";
  return effort + choc + resultat + dette;
}

/**
 * Effort à trouver d'ici la dernière année pour atteindre un objectif, calculé
 * avec le modèle du jeu, sans imprévu : un effort réparti en cinq parts égales,
 * moitié économies, moitié recettes, chacune à effet immédiat. Plus juste qu'un
 * calcul « à la date d'aujourd'hui », car sans mesure le déficit se creuse
 * (les intérêts montent).
 */
export function effortRequis(niveau: Niveau, depart: EtatJeu, h: HypothesesJeu, effortMinimalPct: number): number {
  let bas = 0;
  let haut = 400;
  for (let i = 0; i < 40; i++) {
    const milieu = (bas + haut) / 2;
    if (objectifAtteint(niveau, depart, simulerEffortUniforme(depart, h, milieu), effortMinimalPct)) haut = milieu;
    else bas = milieu;
  }
  return haut;
}

/** Trajectoire avec un effort total réparti en cinq parts égales, moitié économies, moitié recettes, sans imprévu. */
export function simulerEffortUniforme(depart: EtatJeu, h: HypothesesJeu, total: number): EtatJeu[] {
  const calme = IMPREVUS.find((x) => x.id === "annee-calme")!;
  const liste: Mesure[] = [];
  for (let a = 0; a < ANNEES_JEU; a++)
    for (const nature of ["depense", "recette"] as const)
      liste.push({
        id: `uniforme-${a}-${nature}`,
        categorie: "",
        intitule: "",
        explication: "",
        rendement: { bas: total / ANNEES_JEU / 2, central: total / ANNEES_JEU / 2, haut: total / ANNEES_JEU / 2 },
        delai: "immediat",
        payeurs: ["classes-moyennes"],
        nature,
        source: { nom: "" },
        date: "",
        statut: "verifie",
      });
  let e = depart;
  let actives: Actives = {};
  const historique: EtatJeu[] = [];
  for (let a = 0; a < ANNEES_JEU; a++) {
    const r = jouerAnnee(e, actives, { annee: a, nouvelles: [`uniforme-${a}-depense`, `uniforme-${a}-recette`], imprevu: calme }, h, "central", liste);
    e = r.etat;
    actives = r.actives;
    historique.push(e);
  }
  return historique;
}
