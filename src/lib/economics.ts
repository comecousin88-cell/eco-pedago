/**
 * Toutes les formules économiques du site. Aucune ne dépend de React : chaque
 * simulateur appelle ces fonctions, et economics.test.ts les vérifie sur des
 * cas calculables à la main.
 *
 * Convention : les taux sont des décimaux (2 % s'écrit 0.02), les ratios
 * aussi (une dette à 115 % du PIB s'écrit 1.15).
 */

/* ------------------------------------------------------------------------ */
/* Inflation et taux réels                                                  */
/* ------------------------------------------------------------------------ */

/** Taux réel exact (relation de Fisher) : (1 + i) / (1 + π) − 1. */
export function tauxReel(tauxNominal: number, inflation: number): number {
  return (1 + tauxNominal) / (1 + inflation) - 1;
}

/** Approximation courante, valable pour des taux faibles : i − π. */
export function tauxReelApproche(tauxNominal: number, inflation: number): number {
  return tauxNominal - inflation;
}

/** Ce que vaut `montant` en euros d'aujourd'hui après `annees` d'inflation. */
export function pouvoirAchat(montant: number, inflation: number, annees: number): number {
  return montant / (1 + inflation) ** annees;
}

/* ------------------------------------------------------------------------ */
/* Répartitions                                                             */
/* ------------------------------------------------------------------------ */

/**
 * Répartit 100 € entiers selon des parts, par la méthode des plus forts
 * restes : la somme fait toujours exactement 100.
 */
export function repartir100(valeurs: number[]): number[] {
  const total = valeurs.reduce((s, v) => s + v, 0);
  const exactes = valeurs.map((v) => (v / total) * 100);
  const entieres = exactes.map(Math.floor);
  let reste = 100 - entieres.reduce((s, v) => s + v, 0);
  const ordre = exactes.map((v, i) => ({ i, r: v - Math.floor(v) })).sort((a, b) => b.r - a.r);
  for (const { i } of ordre) {
    if (reste <= 0) break;
    entieres[i] += 1;
    reste -= 1;
  }
  return entieres;
}

/* ------------------------------------------------------------------------ */
/* Obligations (OAT) et bons du Trésor (BTF)                                */
/* ------------------------------------------------------------------------ */

export interface Obligation {
  /** Valeur remboursée à l'échéance (souvent 100 €). */
  nominal: number;
  /** Taux du coupon annuel, fixé à l'émission. */
  coupon: number;
  /** Nombre d'années restant jusqu'au remboursement (entier). */
  maturite: number;
}

export interface FluxAnnuel {
  annee: number;
  coupon: number;
  remboursement: number;
  total: number;
}

/** Les flux versés au détenteur, année par année (coupon annuel, remboursement in fine). */
export function fluxObligation({ nominal, coupon, maturite }: Obligation): FluxAnnuel[] {
  return Array.from({ length: maturite }, (_, k) => {
    const annee = k + 1;
    const c = nominal * coupon;
    const remboursement = annee === maturite ? nominal : 0;
    return { annee, coupon: c, remboursement, total: c + remboursement };
  });
}

/**
 * Prix d'une obligation : somme des flux futurs actualisés au taux du marché.
 * P = Σ C/(1+y)^t + N/(1+y)^T
 */
export function prixObligation(obligation: Obligation, tauxMarche: number): number {
  return fluxObligation(obligation).reduce(
    (prix, f) => prix + f.total / (1 + tauxMarche) ** f.annee,
    0,
  );
}

/**
 * Rendement actuariel : le taux de marché qui rend le prix égal à `prix`.
 * Résolu par dichotomie (le prix baisse toujours quand le taux monte).
 */
export function rendementActuariel(obligation: Obligation, prix: number): number {
  let bas = -0.99;
  let haut = 1;
  for (let i = 0; i < 200; i++) {
    const milieu = (bas + haut) / 2;
    if (prixObligation(obligation, milieu) > prix) bas = milieu;
    else haut = milieu;
  }
  return (bas + haut) / 2;
}

/**
 * Prix d'un BTF (bon du Trésor à taux fixe, sans coupon) : le nominal actualisé
 * au taux monétaire, sur une base de 360 jours comme le fait l'AFT.
 */
export function prixBTF(nominal: number, taux: number, jours: number): number {
  return nominal / (1 + (taux * jours) / 360);
}

/** Taux d'un BTF à partir de son prix (inverse de prixBTF). */
export function tauxBTF(nominal: number, prix: number, jours: number): number {
  return ((nominal / prix - 1) * 360) / jours;
}

/* ------------------------------------------------------------------------ */
/* Déficit, dette et effet boule de neige                                   */
/* ------------------------------------------------------------------------ */

/**
 * La baignoire : la dette de fin d'année est la dette de début d'année plus le
 * déficit de l'année (en euros). Renvoie le stock après chaque année.
 */
export function cumulDette(detteInitiale: number, deficits: number[]): number[] {
  const stocks: number[] = [];
  let dette = detteInitiale;
  for (const deficit of deficits) {
    dette += deficit;
    stocks.push(dette);
  }
  return stocks;
}

export interface HypothesesDette {
  /** Dette / PIB de départ (1.15 = 115 %). */
  detteInitiale: number;
  /** Taux d'intérêt apparent moyen sur la dette (nominal), constant ou année par année. */
  taux: number | number[];
  /** Croissance nominale du PIB (croissance réelle + inflation). */
  croissance: number;
  /** Solde primaire en % du PIB : positif = excédent, négatif = déficit. */
  soldePrimaire: number | number[];
  annees: number;
}

export interface PointTrajectoire {
  annee: number;
  /** Dette / PIB en fin d'année. */
  dette: number;
  /** Charge d'intérêts de l'année, en % du PIB. */
  interets: number;
  /** Solde public total (primaire − intérêts), en % du PIB. */
  soldePublic: number;
}

/**
 * Trajectoire de la dette en ratio du PIB, par la relation exacte :
 * d(t+1) = d(t) × (1 + r) / (1 + g) − sp(t+1)
 * L'année 0 est le point de départ.
 */
export function trajectoireDette(h: HypothesesDette): PointTrajectoire[] {
  // Une valeur par année ; au-delà de la liste, la dernière valeur se prolonge.
  const annuel = (v: number | number[], t: number) => (Array.isArray(v) ? (v[t - 1] ?? v[v.length - 1]) : v);
  const sp = (t: number) => annuel(h.soldePrimaire, t);
  const r = (t: number) => annuel(h.taux, t);

  const points: PointTrajectoire[] = [
    { annee: 0, dette: h.detteInitiale, interets: 0, soldePublic: 0 },
  ];
  let d = h.detteInitiale;
  for (let t = 1; t <= h.annees; t++) {
    const interets = (d * r(t)) / (1 + h.croissance);
    d = (d * (1 + r(t))) / (1 + h.croissance) - sp(t);
    points.push({ annee: t, dette: d, interets, soldePublic: sp(t) - interets });
  }
  return points;
}

/**
 * Variation approchée du ratio en un an : Δd ≈ (r − g) × d − sp.
 * C'est la formule enseignée ; trajectoireDette utilise la version exacte.
 */
export function variationDetteApprochee(
  dette: number,
  taux: number,
  croissance: number,
  soldePrimaire: number,
): number {
  return (taux - croissance) * dette - soldePrimaire;
}

/**
 * Solde primaire qui stabilise exactement la dette/PIB :
 * sp* = d × (r − g) / (1 + g)
 */
export function soldePrimaireStabilisant(dette: number, taux: number, croissance: number): number {
  return (dette * (taux - croissance)) / (1 + croissance);
}

/* ------------------------------------------------------------------------ */
/* Taux apparent et refinancement de la dette                               */
/* ------------------------------------------------------------------------ */

/** Taux apparent : intérêts de l'année rapportés à la dette moyenne de l'année. */
export function tauxApparent(interets: number, detteDebut: number, detteFin: number): number {
  return interets / ((detteDebut + detteFin) / 2);
}

/**
 * Évolution du taux apparent quand le taux de marché change : la dette est vue
 * comme des « couches » de même taille qui arrivent à échéance régulièrement
 * (une fraction 1/maturité chaque année) et sont refinancées au taux du
 * marché. Après t années, une part min(1, t / maturité) de la dette a été
 * refinancée. Renvoie le taux apparent des années 1 à `annees`.
 */
export function trajectoireTauxApparent(
  tauxInitial: number,
  tauxMarche: number,
  maturiteMoyenne: number,
  annees: number,
): number[] {
  return Array.from({ length: annees }, (_, k) => {
    const part = Math.min(1, (k + 1) / maturiteMoyenne);
    return tauxInitial + (tauxMarche - tauxInitial) * part;
  });
}

/** Intérêts supplémentaires chaque année, pour une dette donnée, par rapport au taux initial. */
export function surcoutInterets(dette: number, tauxInitial: number, trajectoire: number[]): number[] {
  return trajectoire.map((r) => dette * (r - tauxInitial));
}

/* ------------------------------------------------------------------------ */
/* Adjudication (enchère de titres d'État)                                  */
/* ------------------------------------------------------------------------ */

export interface Offre {
  id: string;
  /** Prix proposé pour 100 € de valeur nominale. */
  prix: number;
  /** Montant demandé (valeur nominale). */
  montant: number;
}

export interface ResultatAdjudication {
  servies: (Offre & { servi: number })[];
  /** Prix le plus bas accepté. */
  prixLimite: number | null;
  /** Prix moyen payé, pondéré par les montants servis. */
  prixMoyen: number | null;
  totalServi: number;
  totalDemande: number;
}

/**
 * Adjudication « à prix demandé » (dite à la hollandaise en France) : l'État
 * sert d'abord les offres les plus chères, jusqu'au montant qu'il veut
 * emprunter ; chaque acheteur servi paie le prix qu'il a lui-même proposé.
 * Au prix limite, si la demande dépasse le reste, les offres sont servies au
 * prorata.
 */
export function adjudication(offres: Offre[], montantCherche: number): ResultatAdjudication {
  const totalDemande = offres.reduce((s, o) => s + o.montant, 0);
  const prixDecroissants = [...new Set(offres.map((o) => o.prix))].sort((a, b) => b - a);
  const servi = new Map<string, number>();
  let reste = montantCherche;
  let prixLimite: number | null = null;

  for (const prix of prixDecroissants) {
    if (reste <= 0) break;
    const auPrix = offres.filter((o) => o.prix === prix);
    const demande = auPrix.reduce((s, o) => s + o.montant, 0);
    const ratio = Math.min(1, reste / demande);
    for (const o of auPrix) servi.set(o.id, o.montant * ratio);
    reste -= demande * ratio;
    prixLimite = prix;
  }

  const servies = offres.map((o) => ({ ...o, servi: servi.get(o.id) ?? 0 }));
  const totalServi = servies.reduce((s, o) => s + o.servi, 0);
  const prixMoyen = totalServi > 0 ? servies.reduce((s, o) => s + o.prix * o.servi, 0) / totalServi : null;
  return { servies, prixLimite, prixMoyen, totalServi, totalDemande };
}

/* ------------------------------------------------------------------------ */
/* Bilan simplifié d'une banque centrale                                    */
/* ------------------------------------------------------------------------ */

export interface BilanBanqueCentrale {
  /** Titres d'État détenus (actif). */
  titres: number;
  /** Taux de coupon moyen des titres, fixe. */
  coupon: number;
  /** Réserves des banques déposées à la banque centrale (passif). */
  reserves: number;
  /** Taux de rémunération des réserves (taux de dépôt), variable. */
  tauxDepot: number;
  /** Fonds propres (passif). */
  fondsPropres: number;
}

export interface ResultatBilan {
  revenus: number;
  charges: number;
  resultat: number;
  /** Fonds propres après l'opération (et le résultat de l'année). */
  fondsPropresApres: number;
}

/** Résultat annuel : intérêts reçus sur les titres moins intérêts versés sur les réserves. */
export function resultatBanqueCentrale(b: BilanBanqueCentrale): ResultatBilan {
  const revenus = b.titres * b.coupon;
  const charges = b.reserves * b.tauxDepot;
  const resultat = revenus - charges;
  return { revenus, charges, resultat, fondsPropresApres: b.fondsPropres + resultat };
}

/**
 * Annulation des titres : l'actif disparaît, le passif (les réserves des
 * banques) reste dû. La perte s'impute sur les fonds propres.
 */
export function annulerTitres(b: BilanBanqueCentrale): ResultatBilan & { perte: number } {
  const charges = b.reserves * b.tauxDepot;
  const perte = b.titres;
  return {
    revenus: 0,
    charges,
    resultat: -perte - charges,
    fondsPropresApres: b.fondsPropres - perte - charges,
    perte,
  };
}

/* ------------------------------------------------------------------------ */
/* Retraites : l'équilibre d'un régime par répartition                      */
/* ------------------------------------------------------------------------ */

export interface ParametresRetraites {
  /** Assiette des cotisations (masse des revenus d'activité soumis), en % du PIB. */
  assiettePib: number;
  /** Taux de prélèvement moyen sur cette assiette (0,30 = 30 %). */
  tauxPrelevement: number;
  /** Retraités par cotisant (l'inverse du rapport cotisants / retraités). */
  retraitesParCotisant: number;
  /** Pension moyenne rapportée au revenu d'activité moyen (0,546 = 54,6 %). */
  pensionRelative: number;
}

/**
 * Solde d'un régime par répartition, en % du PIB :
 * ressources = assiette × taux ; dépenses = assiette × (retraités / cotisants) × pension relative.
 * C'est la relation d'équilibre utilisée par le COR (« l'abaque »).
 */
export function soldeRetraites(p: ParametresRetraites): { ressources: number; depenses: number; solde: number } {
  const ressources = p.assiettePib * p.tauxPrelevement;
  const depenses = p.assiettePib * p.retraitesParCotisant * p.pensionRelative;
  return { ressources, depenses, solde: ressources - depenses };
}

/**
 * Effet d'un recul de l'âge moyen de départ de `annees` : une fraction
 * annees / dureeRetraite des retraités reste en activité un peu plus longtemps.
 * Renvoie les nouveaux paramètres (plus de cotisants, moins de retraités).
 */
export function reculerAgeDepart(p: ParametresRetraites, annees: number, dureeRetraite: number): ParametresRetraites {
  const x = annees / dureeRetraite;
  const rpc = p.retraitesParCotisant;
  const cotisantsRelatifs = 1 + x * rpc; // C' / C
  return {
    ...p,
    assiettePib: p.assiettePib * cotisantsRelatifs,
    retraitesParCotisant: ((1 - x) * rpc) / cotisantsRelatifs,
  };
}

/* ------------------------------------------------------------------------ */
/* Fiche de paie et impôt sur le revenu                                     */
/* ------------------------------------------------------------------------ */

export type Destination =
  | "Retraite de base"
  | "Retraite complémentaire"
  | "Maladie"
  | "Famille"
  | "Chômage"
  | "Autonomie"
  | "Accidents du travail"
  | "CSG et CRDS"
  | "Logement, formation et autres"
  | "Allègement de cotisations";

export interface LignePaie {
  libelle: string;
  payeur: "salarié" | "employeur";
  destination: Destination;
  montant: number;
}

export interface ParametresPaie {
  pmss: number;
  smicAnnuelRgdu: number;
  sal: {
    vieillessePlafonnee: number;
    vieillesseDeplafonnee: number;
    agircT1: number;
    agircT2: number;
    cegT1: number;
    cegT2: number;
    cet: number;
    csgDeductible: number;
    csgNonDeductible: number;
    crds: number;
    assietteCsg: number;
  };
  emp: {
    maladie: number;
    csa: number;
    vieillessePlafonnee: number;
    vieillesseDeplafonnee: number;
    famille: number;
    dialogueSocial: number;
    chomage: number;
    ags: number;
    fnalPetite: number;
    fnalGrande: number;
    formationPetite: number;
    formationGrande: number;
    apprentissage: number;
    agircT1: number;
    agircT2: number;
    cegT1: number;
    cegT2: number;
    cet: number;
  };
  rgdu: { tmin: number; tdeltaPetite: number; tdeltaGrande: number; exposant: number };
}

export interface OptionsPaie {
  /** Taille de l'entreprise : change le Fnal, la formation et la RGDU. */
  taille: "moins-11" | "11-49" | "50-plus";
  /** Taux accidents du travail (notifié à chaque entreprise) : une hypothèse, en %. */
  tauxAT: number;
}

/** Coefficient de la réduction générale dégressive unique (RGDU), sur salaires annuels. */
export function coefficientRgdu(
  brutAnnuel: number,
  smicAnnuel: number,
  r: { tmin: number; tdelta: number; exposant: number },
): number {
  if (brutAnnuel <= 0 || brutAnnuel >= 3 * smicAnnuel) return 0;
  const base = Math.max(0, 0.5 * ((3 * smicAnnuel) / brutAnnuel - 1));
  const c = r.tmin + r.tdelta * base ** r.exposant;
  return Math.round(Math.min(c, r.tmin + r.tdelta) * 10000) / 10000;
}

export interface FichePaie {
  brut: number;
  lignes: LignePaie[];
  cotisationsSalariales: number;
  cotisationsEmployeur: number;
  coutEmployeur: number;
  netImposable: number;
  netAvantImpot: number;
}

/**
 * Fiche de paie mensuelle simplifiée d'un salarié non cadre du secteur privé.
 * Taux en % (6,9 = 6,9 %). Les tranches suivent le plafond mensuel (T1 jusqu'au
 * plafond, T2 de 1 à 8 plafonds).
 */
export function ficheDePaie(brut: number, p: ParametresPaie, o: OptionsPaie): FichePaie {
  const t1 = Math.min(brut, p.pmss);
  const t2 = Math.max(0, Math.min(brut, 8 * p.pmss) - p.pmss);
  const auDessusPlafond = brut > p.pmss;
  const assietteCsg = (brut * p.sal.assietteCsg) / 100;
  const pct = (base: number, taux: number) => (base * taux) / 100;
  const petite = o.taille === "moins-11";
  const grande = o.taille === "50-plus";
  const S = "salarié" as const;
  const E = "employeur" as const;

  const lignes: LignePaie[] = [
    { libelle: "Vieillesse plafonnée", payeur: S, destination: "Retraite de base", montant: pct(t1, p.sal.vieillessePlafonnee) },
    { libelle: "Vieillesse déplafonnée", payeur: S, destination: "Retraite de base", montant: pct(brut, p.sal.vieillesseDeplafonnee) },
    { libelle: "Agirc-Arrco tranche 1", payeur: S, destination: "Retraite complémentaire", montant: pct(t1, p.sal.agircT1) },
    { libelle: "Agirc-Arrco tranche 2", payeur: S, destination: "Retraite complémentaire", montant: pct(t2, p.sal.agircT2) },
    {
      libelle: "Contribution d'équilibre général",
      payeur: S,
      destination: "Retraite complémentaire",
      montant: pct(t1, p.sal.cegT1) + pct(t2, p.sal.cegT2),
    },
    {
      libelle: "Contribution d'équilibre technique",
      payeur: S,
      destination: "Retraite complémentaire",
      montant: auDessusPlafond ? pct(t1 + t2, p.sal.cet) : 0,
    },
    { libelle: "CSG déductible", payeur: S, destination: "CSG et CRDS", montant: pct(assietteCsg, p.sal.csgDeductible) },
    { libelle: "CSG non déductible", payeur: S, destination: "CSG et CRDS", montant: pct(assietteCsg, p.sal.csgNonDeductible) },
    { libelle: "CRDS", payeur: S, destination: "CSG et CRDS", montant: pct(assietteCsg, p.sal.crds) },

    { libelle: "Maladie, maternité, invalidité, décès", payeur: E, destination: "Maladie", montant: pct(brut, p.emp.maladie) },
    { libelle: "Contribution solidarité autonomie", payeur: E, destination: "Autonomie", montant: pct(brut, p.emp.csa) },
    { libelle: "Vieillesse plafonnée", payeur: E, destination: "Retraite de base", montant: pct(t1, p.emp.vieillessePlafonnee) },
    { libelle: "Vieillesse déplafonnée", payeur: E, destination: "Retraite de base", montant: pct(brut, p.emp.vieillesseDeplafonnee) },
    { libelle: "Allocations familiales", payeur: E, destination: "Famille", montant: pct(brut, p.emp.famille) },
    { libelle: "Accidents du travail (hypothèse)", payeur: E, destination: "Accidents du travail", montant: pct(brut, o.tauxAT) },
    { libelle: "Assurance chômage", payeur: E, destination: "Chômage", montant: pct(brut, p.emp.chomage) },
    { libelle: "Garantie des salaires (AGS)", payeur: E, destination: "Chômage", montant: pct(brut, p.emp.ags) },
    { libelle: "Agirc-Arrco tranche 1", payeur: E, destination: "Retraite complémentaire", montant: pct(t1, p.emp.agircT1) },
    { libelle: "Agirc-Arrco tranche 2", payeur: E, destination: "Retraite complémentaire", montant: pct(t2, p.emp.agircT2) },
    {
      libelle: "Contribution d'équilibre général",
      payeur: E,
      destination: "Retraite complémentaire",
      montant: pct(t1, p.emp.cegT1) + pct(t2, p.emp.cegT2),
    },
    {
      libelle: "Contribution d'équilibre technique",
      payeur: E,
      destination: "Retraite complémentaire",
      montant: auDessusPlafond ? pct(t1 + t2, p.emp.cet) : 0,
    },
    {
      libelle: "Aide au logement (Fnal)",
      payeur: E,
      destination: "Logement, formation et autres",
      montant: grande ? pct(brut, p.emp.fnalGrande) : pct(t1, p.emp.fnalPetite),
    },
    {
      libelle: "Formation professionnelle",
      payeur: E,
      destination: "Logement, formation et autres",
      montant: pct(brut, petite ? p.emp.formationPetite : p.emp.formationGrande),
    },
    { libelle: "Taxe d'apprentissage", payeur: E, destination: "Logement, formation et autres", montant: pct(brut, p.emp.apprentissage) },
    { libelle: "Dialogue social", payeur: E, destination: "Logement, formation et autres", montant: pct(brut, p.emp.dialogueSocial) },
  ];

  const coef = coefficientRgdu(brut * 12, p.smicAnnuelRgdu, {
    tmin: p.rgdu.tmin,
    tdelta: grande ? p.rgdu.tdeltaGrande : p.rgdu.tdeltaPetite,
    exposant: p.rgdu.exposant,
  });
  if (coef > 0) {
    lignes.push({
      libelle: "Réduction générale dégressive (RGDU)",
      payeur: E,
      destination: "Allègement de cotisations",
      montant: -coef * brut,
    });
  }

  const somme = (f: (l: LignePaie) => boolean) => lignes.filter(f).reduce((s, l) => s + l.montant, 0);
  const cotisationsSalariales = somme((l) => l.payeur === S);
  const cotisationsEmployeur = somme((l) => l.payeur === E);
  const csgNonDeductibleEtCrds = pct(assietteCsg, p.sal.csgNonDeductible + p.sal.crds);
  const netAvantImpot = brut - cotisationsSalariales;
  return {
    brut,
    lignes,
    cotisationsSalariales,
    cotisationsEmployeur,
    coutEmployeur: brut + cotisationsEmployeur,
    netImposable: netAvantImpot + csgNonDeductibleEtCrds,
    netAvantImpot,
  };
}

export interface Tranche {
  /** Seuil (par part) à partir duquel le taux s'applique. */
  seuil: number;
  /** Taux en % (11 = 11 %). */
  taux: number;
}

export interface ParametresImpot {
  bareme: Tranche[];
  decotePlafond: number;
  decoteTaux: number;
  abattementMin: number;
  abattementMax: number;
}

/** Impôt brut selon le barème progressif, pour un revenu imposable et un nombre de parts. */
export function impotBareme(revenuImposable: number, parts: number, bareme: Tranche[]): number {
  const q = revenuImposable / parts;
  let impot = 0;
  for (let i = 0; i < bareme.length; i++) {
    const bas = bareme[i].seuil;
    const haut = i + 1 < bareme.length ? bareme[i + 1].seuil : Infinity;
    if (q > bas) impot += ((Math.min(q, haut) - bas) * bareme[i].taux) / 100;
  }
  return impot * parts;
}

/**
 * Impôt sur le revenu d'une personne seule (1 part) sur ses salaires annuels
 * nets imposables : abattement de 10 % (borné), barème, décote.
 */
export function impotSurLeRevenu(salairesNetsImposables: number, p: ParametresImpot) {
  const abattement = Math.min(p.abattementMax, Math.max(p.abattementMin, salairesNetsImposables * 0.1), salairesNetsImposables);
  const revenuImposable = Math.max(0, salairesNetsImposables - abattement);
  const impotBrut = impotBareme(revenuImposable, 1, p.bareme);
  const decote = Math.max(0, Math.min(impotBrut, p.decotePlafond - (impotBrut * p.decoteTaux) / 100));
  const impot = Math.max(0, impotBrut - decote);
  return {
    abattement,
    revenuImposable,
    impotBrut,
    decote,
    impot,
    tauxMoyen: salairesNetsImposables > 0 ? impot / salairesNetsImposables : 0,
  };
}

/** TVA contenue dans un prix toutes taxes comprises (taux en %). */
export function tvaContenue(prixTtc: number, taux: number): number {
  return (prixTtc * taux) / (100 + taux);
}

/* ------------------------------------------------------------------------ */
/* Propositions : annulation de dette, impôt sur les grandes fortunes       */
/* ------------------------------------------------------------------------ */

export interface HypothesesAnnulation {
  /** Titres d'État détenus par la banque centrale et annulés (Md€). */
  montant: number;
  /** Coupon moyen de ces titres (0,01 = 1 %). */
  coupon: number;
  /** Taux versé sur les réserves des banques (0,025 = 2,5 %). */
  tauxDepot: number;
  /** Prime de risque supplémentaire exigée par les marchés (0,005 = 50 points de base). */
  prime: number;
  /** Montant emprunté chaque année sur les marchés, refinancé au nouveau taux (Md€). */
  empruntsAnnuels: number;
  annees: number;
}

export interface AnneeAnnulation {
  annee: number;
  /** Intérêts que l'État ne verse plus à la banque centrale (gain pour l'État). */
  interetsEconomises: number;
  /** Ce que la banque centrale perd en plus chaque année (elle ne touche plus ces intérêts). */
  perteBanqueCentrale: number;
  /** Surcoût d'intérêts sur les emprunts de marché, dû à la prime de risque. */
  surcoutMarche: number;
  /** Effet net pour l'ensemble État + banque centrale (négatif = perte). */
  netConsolide: number;
}

/**
 * Effets d'une annulation de titres détenus par la banque centrale, année par
 * année. Pour l'État, les intérêts disparaissent ; pour la banque centrale, la
 * même recette disparaît, alors que les réserves restent à rémunérer : en
 * consolidé, les deux s'annulent. Seule reste la prime de risque, qui
 * s'applique à une part croissante de la dette à mesure qu'elle se refinance.
 */
export function effetsAnnulation(h: HypothesesAnnulation): AnneeAnnulation[] {
  return Array.from({ length: h.annees }, (_, k) => {
    const annee = k + 1;
    const interetsEconomises = h.montant * h.coupon;
    const perteBanqueCentrale = h.montant * h.coupon;
    const surcoutMarche = h.empruntsAnnuels * annee * h.prime;
    return {
      annee,
      interetsEconomises,
      perteBanqueCentrale,
      surcoutMarche,
      netConsolide: interetsEconomises - perteBanqueCentrale - surcoutMarche,
    };
  });
}

/** Fonds propres de la banque centrale après l'annulation (Md€). */
export function fondsPropresApresAnnulation(fondsPropres: number, montant: number): number {
  return fondsPropres - montant;
}

export interface HypothesesImpotFortunes {
  /** Patrimoine taxable (Md€). */
  assiette: number;
  /** Taux de l'impôt (0,02 = 2 %). */
  taux: number;
  /** Impôts déjà payés, déduits dans un impôt « plancher » (en part du patrimoine, 0,003 = 0,3 %). */
  impotsDejaPayes: number;
  /** Baisse de l'assiette pour 1 point de taux (0,02 = 2 % par point), effets de comportement. */
  elasticite: number;
}

/**
 * Rendement annuel d'un impôt « plancher » sur le patrimoine : taux moins
 * impôts déjà payés, appliqué à l'assiette ; avec effets de comportement,
 * l'assiette se réduit de (élasticité × taux en points).
 */
export function rendementImpotFortunes(h: HypothesesImpotFortunes): { theorique: number; apresComportements: number } {
  const tauxNet = Math.max(0, h.taux - h.impotsDejaPayes);
  const theorique = h.assiette * tauxNet;
  const reduction = Math.min(1, h.elasticite * h.taux * 100);
  return { theorique, apresComportements: theorique * (1 - reduction) };
}

/** Années pendant lesquelles un stock couvrirait un besoin annuel, s'il était entièrement prélevé. */
export function anneesDeCouverture(stock: number, besoinAnnuel: number): number {
  return besoinAnnuel > 0 ? stock / besoinAnnuel : Infinity;
}

/**
 * Effort annuel, en milliards, pour ramener le déficit au niveau qui
 * stabilise la dette : (déficit − déficit stabilisant), en points de PIB,
 * appliqué au PIB.
 */
export function effortStabilisation(deficitPctPib: number, deficitStabilisantPctPib: number, pib: number): number {
  return Math.max(0, deficitPctPib - deficitStabilisantPctPib) * pib / 100;
}

/**
 * Déficit (en points de PIB) qui stabilise le ratio de dette, pour une
 * croissance nominale g : d × g / (1 + g).
 */
export function deficitStabilisant(dettePctPib: number, croissanceNominale: number): number {
  return (dettePctPib * croissanceNominale) / (1 + croissanceNominale);
}

/* ------------------------------------------------------------------------ */
/* Jeu « Redresser les comptes »                                            */
/* ------------------------------------------------------------------------ */

export interface DonneesObjectifs {
  /** Déficit public de la dernière année, en Md€. */
  deficitMd: number;
  /** Même déficit, en points de PIB. */
  deficitPct: number;
  /** Dette publique fin d'année, en points de PIB. */
  dettePct: number;
  /** PIB de la dernière année, en Md€. */
  pib: number;
  /** Croissance nominale retenue (0,019 = 1,9 %). */
  croissanceNominale: number;
  /** Effort structurel annuel minimal demandé par les règles européennes, en points de PIB. */
  effortMinimalPct: number;
}

/** Les trois objectifs du jeu, en Md€ par an. */
export function objectifsJeu(d: DonneesObjectifs): { budget: number; stabiliser: number; zero: number } {
  return {
    budget: (d.effortMinimalPct * d.pib) / 100,
    stabiliser: effortStabilisation(d.deficitPct, deficitStabilisant(d.dettePct, d.croissanceNominale), d.pib),
    zero: d.deficitMd,
  };
}

/**
 * Dette en points de PIB sur `annees` ans, avec un déficit constant en points
 * de PIB : d(t+1) = d(t) / (1 + g) + déficit. Modèle volontairement simple :
 * il ignore l'effet en retour des mesures sur la croissance et les taux.
 */
export function trajectoireRatioDette(detteInitiale: number, deficitPct: number, croissanceNominale: number, annees: number): number[] {
  const points = [detteInitiale];
  let d = detteInitiale;
  for (let t = 1; t <= annees; t++) {
    d = d / (1 + croissanceNominale) + deficitPct;
    points.push(d);
  }
  return points;
}
