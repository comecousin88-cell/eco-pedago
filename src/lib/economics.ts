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
  /** Taux d'intérêt apparent moyen sur la dette (nominal). */
  taux: number;
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
  const sp = (t: number) =>
    Array.isArray(h.soldePrimaire)
      ? (h.soldePrimaire[t - 1] ?? h.soldePrimaire[h.soldePrimaire.length - 1])
      : h.soldePrimaire;

  const points: PointTrajectoire[] = [
    { annee: 0, dette: h.detteInitiale, interets: 0, soldePublic: 0 },
  ];
  let d = h.detteInitiale;
  for (let t = 1; t <= h.annees; t++) {
    const interets = (d * h.taux) / (1 + h.croissance);
    d = (d * (1 + h.taux)) / (1 + h.croissance) - sp(t);
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
