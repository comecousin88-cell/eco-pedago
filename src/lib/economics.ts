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
