/**
 * Modèle macroéconomique du jeu « Redresser les comptes » : un mandat de cinq
 * ans, un budget par an, des événements imprévus. Le modèle est volontairement simple et
 * toutes ses hypothèses sont affichées dans le jeu (data/jeu-ministre.json).
 *
 * Chaque année :
 *  - croissance nominale = tendance + choc − multiplicateurs × effort (en points de PIB) ;
 *  - solde primaire structurel = celui de l'année précédente + effort de l'année (les budgets votés se cumulent) ;
 *  - solde primaire = structurel + stabilisateurs × écart de croissance − coût des chocs de l'année (effets temporaires) ;
 *  - taux des emprunts nouveaux = taux allemand à 10 ans + écart (spread) + choc de taux − décote de maturité ;
 *  - taux apparent : se rapproche du taux de marché d'un « 1 / maturité » chaque année (la dette se renouvelle peu à peu) ;
 *  - dette : d(t+1) = d(t) × (1 + r) / (1 + g) − solde primaire ;
 *  - spread : monte si le déficit dépasse 4 % sans s'améliorer ; baisse s'il passe sous 3 % ou recule nettement
 *    (les marchés récompensent un redressement crédible).
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
  /** Écart entre le taux à 10 ans et le taux moyen des emprunts nouveaux, toutes durées confondues, en points. */
  decoteMaturites: number;
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
  /** Écart de taux qu'on observerait sans les chocs de spread tirés au sort, en points de base. */
  spreadHorsChocs: number;
  /** Solde public hors effets des chocs de l'année (croissance et dépense imprévue), en % du PIB. */
  soldeHorsChocs: number;
  /** Croissance nominale de l'année, en %. */
  croissance: number;
  /** Croissance nominale qu'aurait donnée le seul budget, sans les chocs extérieurs, en %. */
  croissanceHorsChocs: number;
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
  const croissanceHorsChocs = h.croissanceTendance - effetActivite;
  const croissance = croissanceHorsChocs + ev.croissance;
  const soldeStructurel = e.soldeStructurel + effortPib;
  const soldePrimaire = soldeStructurel + h.stabilisateurs * (croissance - h.croissanceTendance) - pt(ev.cout);
  // Les emprunts nouveaux mêlent titres courts et longs : leur taux moyen est inférieur au taux à 10 ans.
  const tauxMarche = h.tauxAllemand + e.spread / 100 + ev.taux - h.decoteMaturites;
  const tauxApparent = e.tauxApparent + (tauxMarche - e.tauxApparent) / h.maturite;
  const r = tauxApparent / 100;
  const g = croissance / 100;
  const dette = (e.dette * (1 + r)) / (1 + g) - soldePrimaire;
  const interets = (e.dette * r) / (1 + g);
  const soldePublic = soldePrimaire - interets;
  const amelioration = soldePublic - e.soldePublic;
  const reaction =
    soldePublic >= -3 || amelioration >= 0.5
      ? -(2 / 3) * h.reactionSpread
      : soldePublic < -4 && amelioration < 0.3
        ? h.reactionSpread
        : 0;
  const spread = Math.max(0, e.spread + reaction + ev.spread);
  const spreadHorsChocs = Math.max(0, e.spreadHorsChocs + reaction);
  const soldeHorsChocs = soldePublic - h.stabilisateurs * ev.croissance + pt(ev.cout);
  return {
    annee: e.annee + 1,
    dette,
    soldePrimaire,
    soldeStructurel,
    soldePublic,
    tauxApparent,
    spread,
    spreadHorsChocs,
    soldeHorsChocs,
    croissance,
    croissanceHorsChocs,
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
