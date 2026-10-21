/**
 * Modèle du jeu « Ministre des Finances » : un mandat de cinq ans, un budget
 * par an, des événements imprévus. Le modèle est volontairement simple et
 * toutes ses hypothèses sont affichées dans le jeu (data/jeu-ministre.json).
 *
 * Chaque année :
 *  - croissance nominale = tendance + choc − multiplicateurs × effort (en points de PIB) ;
 *  - solde primaire structurel = celui de l'année précédente + effort de l'année (les budgets votés se cumulent) ;
 *  - solde primaire = structurel + stabilisateurs × écart de croissance − coût des chocs de l'année (effets temporaires) ;
 *  - taux de marché = taux allemand + écart (spread) + choc de taux ;
 *  - taux apparent : se rapproche du taux de marché d'un « 1 / maturité » chaque année (la dette se renouvelle peu à peu) ;
 *  - dette : d(t+1) = d(t) × (1 + r) / (1 + g) − solde primaire ;
 *  - spread : monte si le déficit dépasse 4 %, baisse s'il passe sous 3 %.
 */

export interface HypothesesMinistre {
  /** Croissance nominale de référence, en % (2,8 = 2,8 %). */
  croissanceTendance: number;
  multDepenses: number;
  multImpots: number;
  multInvestissement: number;
  /** Points de PIB de solde gagnés par point de croissance en plus. */
  stabilisateurs: number;
  /** Variation annuelle du spread (pb) quand le déficit dépasse 4 % ; la baisse sous 3 % vaut 2/3 de ce montant. */
  reactionSpread: number;
  /** Taux à 10 ans allemand, en %. */
  tauxAllemand: number;
  /** Maturité moyenne de la dette, en années. */
  maturite: number;
}

export interface EtatMinistre {
  annee: number;
  /** Dette en % du PIB, fin d'année. */
  dette: number;
  /** Solde primaire (hors intérêts), en % du PIB. */
  soldePrimaire: number;
  /** Solde primaire hors effets de la conjoncture et des chocs ponctuels, en % du PIB. */
  soldeStructurel: number;
  /** Solde public total, en % du PIB. */
  soldePublic: number;
  /** Taux apparent de la dette, en %. */
  tauxApparent: number;
  /** Écart de taux avec l'Allemagne, en points de base. */
  spread: number;
  /** Croissance nominale de l'année, en %. */
  croissance: number;
  /** PIB de l'année, en Md€. */
  pib: number;
}

export interface DecisionBudget {
  /** Économies sur les dépenses, en Md€. */
  economies: number;
  /** Hausses d'impôts, en Md€. */
  impots: number;
  /** Investissement public supplémentaire, en Md€ (creuse le solde). */
  investissement: number;
}

export interface Evenement {
  id: string;
  titre: string;
  texte: string;
  /** Choc sur la croissance nominale, en points. */
  croissance: number;
  /** Choc sur le taux de marché, en points. */
  taux: number;
  /** Choc sur le spread, en points de base. */
  spread: number;
  /** Dépense imprévue, en Md€. */
  cout: number;
}

/** Une année de mandat : applique le budget voté et l'événement, renvoie le nouvel état. */
export function anneeMandat(e: EtatMinistre, d: DecisionBudget, ev: Evenement, h: HypothesesMinistre): EtatMinistre {
  const pt = (md: number) => (md / e.pib) * 100;
  const effortPib = pt(d.economies) + pt(d.impots) - pt(d.investissement);
  const effetActivite = h.multDepenses * pt(d.economies) + h.multImpots * pt(d.impots) - h.multInvestissement * pt(d.investissement);
  const croissance = h.croissanceTendance + ev.croissance - effetActivite;
  const soldeStructurel = e.soldeStructurel + effortPib;
  const soldePrimaire = soldeStructurel + h.stabilisateurs * (croissance - h.croissanceTendance) - pt(ev.cout);
  const tauxMarche = h.tauxAllemand + e.spread / 100 + ev.taux;
  const tauxApparent = e.tauxApparent + (tauxMarche - e.tauxApparent) / h.maturite;
  const r = tauxApparent / 100;
  const g = croissance / 100;
  const dette = (e.dette * (1 + r)) / (1 + g) - soldePrimaire;
  const interets = (e.dette * r) / (1 + g);
  const soldePublic = soldePrimaire - interets;
  const reaction = soldePublic < -4 ? h.reactionSpread : soldePublic > -3 ? -(2 / 3) * h.reactionSpread : 0;
  const spread = Math.max(0, e.spread + reaction + ev.spread);
  return {
    annee: e.annee + 1,
    dette,
    soldePrimaire,
    soldeStructurel,
    soldePublic,
    tauxApparent,
    spread,
    croissance,
    pib: e.pib * (1 + g),
  };
}

/** Générateur pseudo-aléatoire reproductible (mulberry32) : une même graine donne les mêmes événements. */
export function aleatoire(graine: number): () => number {
  let a = graine >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Tire les événements des `n` années du mandat (sans répétition tant que c'est possible). */
export function tirerEvenements(liste: readonly Evenement[], n: number, graine: number): Evenement[] {
  const hasard = aleatoire(graine);
  const pioche = [...liste];
  const tirage: Evenement[] = [];
  for (let i = 0; i < n; i++) {
    if (pioche.length === 0) pioche.push(...liste);
    tirage.push(pioche.splice(Math.floor(hasard() * pioche.length), 1)[0]);
  }
  return tirage;
}

export interface CritereBilan {
  libelle: string;
  atteint: boolean;
  detail: string;
}

/**
 * Bilan du mandat : quatre critères explicites, sans jugement sur les
 * mesures choisies. Le score est le nombre de critères atteints.
 */
export function bilanMandat(depart: EtatMinistre, historique: readonly EtatMinistre[]): { criteres: CritereBilan[]; score: number } {
  const fin = historique[historique.length - 1];
  const criteres: CritereBilan[] = [
    {
      libelle: "La dette ne monte plus en fin de mandat",
      atteint: historique.length >= 2 && fin.dette <= historique[historique.length - 2].dette + 0.05,
      detail: "dette de la dernière année inférieure ou égale à celle de l'année précédente",
    },
    {
      libelle: "Le déficit est revenu sous 3 % du PIB",
      atteint: fin.soldePublic >= -3,
      detail: "repère du traité de Maastricht",
    },
    {
      libelle: "Pas de récession pendant le mandat",
      atteint: historique.every((x) => x.croissance - 1.8 > 0),
      detail: "croissance en volume positive chaque année (croissance nominale moins 1,8 % d'inflation supposée)",
    },
    {
      libelle: "La confiance des marchés est préservée",
      atteint: fin.spread <= depart.spread,
      detail: "écart de taux avec l'Allemagne inférieur ou égal à celui du début du mandat",
    },
  ];
  return { criteres, score: criteres.filter((c) => c.atteint).length };
}
