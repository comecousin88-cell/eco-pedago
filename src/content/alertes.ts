import { chercherValeur, getSerie, getValeur, LIBELLE_ETAT } from "@/lib/data";
import { etatDuPoint } from "@/lib/versions";
import { avecValeurRecente, difference, episodes, evaluerSeuil, type Etat, type Sens } from "@/lib/alertes";
import { formatNombre } from "@/lib/format";
import { libellePeriode, type Point } from "@/lib/indicateurs";

/**
 * Seuils marquants surveillés. Quand un indicateur les franchit, un bandeau
 * d'actualité s'affiche sur l'accueil et le tableau de bord, avec la date de
 * la donnée. Les valeurs viennent de data/*.json : le bandeau suit les mises à
 * jour automatiques. Les seuils sont des repères de lecture, pas des jugements.
 */

/**
 * Nature de la période d'un indicateur, pour dire clairement de quoi parle le
 * chiffre : moyenne d'un mois (taux de marché, ou valeur d'un jour quand elle
 * existe), évolution sur un an d'un mois donné (inflation), trimestre
 * (chômage), fin de période (dette).
 */
export type Mesure = "moyenne-mensuelle" | "mois-sur-un-an" | "trimestre" | "fin-de-periode";

export interface RegleAlerte {
  id: string;
  /** Position par rapport au seuil, sans verbe : « au-dessus de 5 % ». */
  libelleSeuil: string;
  /** Retour sous le seuil : « de nouveau sous 5 % ». */
  libelleRetour: string;
  /** Rappeler le seuil après l'énoncé (inutile quand l'énoncé le dit déjà : France contre Italie). */
  rappelSeuil: boolean;
  seuil: number;
  sens: Sens;
  mesure: Mesure;
  points: () => Point[];
  /** Le constat, sans la période : « la France emprunte à 10 ans à 4,44 %, contre 4,36 % pour l'Italie ». */
  enonce: (p: Point) => string;
  lien: { href: string; libelle: string };
  /** Pourquoi ce seuil compte, en une phrase : sert de brouillon à l'encadré « Ce que ça veut dire ». */
  pourquoi: string;
}

const pct = (v: number, decimales: number) => `${formatNombre(v, decimales)} %`;
const taux10Jour = () => chercherValeur("marches.taux10-france-jour");

export const reglesAlertes: RegleAlerte[] = [
  {
    id: "oat-5",
    libelleSeuil: "au-dessus de 5 %",
    libelleRetour: "de nouveau sous 5 %",
    rappelSeuil: true,
    seuil: 5,
    sens: "au-dessus",
    mesure: "moyenne-mensuelle",
    points: () => avecValeurRecente(getSerie("marches.taux10-france").serie, taux10Jour()),
    enonce: (p) => `l'État emprunte à 10 ans à ${pct(p.y, 2)}`,
    lien: { href: "/modules/emprunt-etat/prix-et-taux/", libelle: "Pourquoi le taux compte" },
    pourquoi: "Chaque emprunt nouveau, et chaque dette renouvelée, coûte alors plus cher à l'État : l'effet sur la charge d'intérêts se diffuse sur plusieurs années.",
  },
  {
    id: "spread-100",
    libelleSeuil: "au-dessus d'un point (100 points de base)",
    libelleRetour: "de nouveau sous un point (100 points de base)",
    rappelSeuil: true,
    seuil: 100,
    sens: "au-dessus",
    mesure: "moyenne-mensuelle",
    points: () => getSerie("marches.spread-france-allemagne").serie,
    enonce: (p) => `l'écart de taux à 10 ans entre la France et l'Allemagne est de ${formatNombre(p.y, 0)} points de base`,
    lien: { href: "/modules/emprunt-etat/spread-notation/", libelle: "Spread et notation" },
    pourquoi: "Les investisseurs demandent un supplément pour prêter à la France plutôt qu'à l'Allemagne : c'est un signal de moindre confiance, qui renchérit les emprunts.",
  },
  {
    id: "france-italie",
    libelleSeuil: "au-dessus de celui de l'Italie",
    libelleRetour: "de nouveau moins que l'Italie",
    rappelSeuil: false,
    seuil: 0,
    sens: "au-dessus",
    mesure: "moyenne-mensuelle",
    points: () => difference(getSerie("marches.taux10-france").serie, getSerie("marches.taux10-italie").serie),
    enonce: (p) => {
      const fr = getSerie("marches.taux10-france").serie.find((q) => q.x === p.x)!.y;
      const it = getSerie("marches.taux10-italie").serie.find((q) => q.x === p.x)!.y;
      return `la France emprunte à 10 ans à ${pct(fr, 2)}, contre ${pct(it, 2)} pour l'Italie`;
    },
    lien: { href: "/modules/emprunt-etat/spread-notation/", libelle: "Spread et notation" },
    pourquoi: "Les marchés jugent désormais la France aussi risquée, voire plus, que l'Italie, longtemps considérée comme plus fragile : la prime de risque française augmente.",
  },
  {
    id: "dette-120",
    libelleSeuil: "au-dessus de 120 % du PIB",
    libelleRetour: "de nouveau sous 120 % du PIB",
    rappelSeuil: true,
    seuil: 120,
    sens: "au-dessus",
    mesure: "fin-de-periode",
    points: () => {
      const recente = getValeur("dette.ratio-pib");
      return avecValeurRecente(getSerie("dette.historique-pib").serie, recente);
    },
    enonce: (p) => `la dette publique atteint ${formatNombre(p.y, 1)} % du PIB`,
    lien: { href: "/modules/deficit-et-dette/histoire/", libelle: "La dette depuis 1978" },
    pourquoi: "Plus la dette pèse lourd par rapport à la richesse produite, plus une hausse des taux alourdit la charge d'intérêts et réduit les marges du budget.",
  },
  {
    id: "inflation-3",
    libelleSeuil: "au-dessus de 3 %",
    libelleRetour: "de nouveau sous 3 %",
    rappelSeuil: true,
    seuil: 3,
    sens: "au-dessus",
    mesure: "mois-sur-un-an",
    points: () => getSerie("ind.inflation-ipc-fr").serie,
    // L'Insee publie d'abord une estimation provisoire, puis le résultat définitif : le statut est toujours dit.
    enonce: (p) => {
      const etat = etatDuPoint(getSerie("ind.inflation-ipc-fr"), p.x);
      return `les prix à la consommation augmentent de ${pct(p.y, 1)} sur un an (IPC de l'Insee${etat ? `, ${LIBELLE_ETAT[etat]}` : ""})`;
    },
    lien: { href: "/modules/les-bases/inflation-taux-reels/", libelle: "Inflation et taux réels" },
    pourquoi: "Les prix montent plus vite que l'objectif de la BCE : le pouvoir d'achat s'érode, et la BCE peut maintenir des taux plus élevés.",
  },
  {
    id: "chomage-9",
    libelleSeuil: "au-dessus de 9 %",
    libelleRetour: "de nouveau sous 9 %",
    rappelSeuil: true,
    seuil: 9,
    sens: "au-dessus",
    mesure: "trimestre",
    points: () => getSerie("ind.chomage").serie,
    enonce: (p) => `le taux de chômage est de ${pct(p.y, 1)} de la population active`,
    lien: { href: "/tableau-de-bord/", libelle: "Tableau de bord" },
    pourquoi: "Un chômage plus élevé pèse sur les recettes (moins de cotisations) et sur les dépenses (plus d'indemnisation).",
  },
];

const MOIS = ["janvier", "février", "mars", "avril", "mai", "juin", "juillet", "août", "septembre", "octobre", "novembre", "décembre"];
const jourEnClair = (x: string) => {
  const [a, m, j] = x.split("-").map(Number);
  return `${j === 1 ? "1er" : j} ${MOIS[m - 1]} ${a}`;
};

/**
 * Période d'un point, en début de phrase : « En moyenne sur septembre 2026 »,
 * « Le 23 octobre 2026 » (taux du jour), « En septembre 2026 » (inflation sur
 * un an, dite dans l'énoncé), « Au 2e trimestre 2026 », « Fin juin 2026 », « Fin 2025 ».
 */
export function periodePhrase(x: string, mesure: Mesure): string {
  if (/^\d{4}$/.test(x)) return `Fin ${x}`;
  if (/^\d{4}-T\d$/.test(x)) return `Au ${libellePeriode(x, "trimestrielle")}`;
  const mois = /^\d{4}-\d{2}$/.test(x) ? libellePeriode(x, "mensuelle") : undefined;
  if (mois) return mesure === "moyenne-mensuelle" ? `En moyenne sur ${mois}` : `En ${mois}`;
  return mesure === "fin-de-periode" ? `Fin ${libellePeriode(x.slice(0, 7), "mensuelle")}` : `Le ${jourEnClair(x)}`;
}

/** Même période, en fin de phrase : « août 2026 », « le 1er trimestre 2026 », « fin mars 2026 », « le 20 octobre 2026 ». */
export function periodeCourte(x: string, mesure: Mesure): string {
  const p = periodePhrase(x, mesure).replace(/^En moyenne sur /, "").replace(/^En /, "");
  return p.charAt(0).toLowerCase() + p.slice(1);
}

/** Date d'un point, quel que soit son format : année, trimestre, mois ou jour. */
export function libelleDate(x: string): string {
  if (/^\d{4}$/.test(x)) return `fin ${x}`;
  if (/^\d{4}-T\d$/.test(x)) return `le ${libellePeriode(x, "trimestrielle")}`;
  if (/^\d{4}-\d{2}$/.test(x)) return `en ${libellePeriode(x, "mensuelle")}`;
  const [a, m, j] = x.split("-");
  return `le ${Number(j) === 1 ? "1er" : Number(j)} ${libellePeriode(`${a}-${m}`, "mensuelle")}`;
}

export interface Alerte {
  id: string;
  etat: Exclude<Etat["etat"], "normal">;
  phrase: string;
  /** Date de la donnée la plus récente. */
  date: string;
  lien: RegleAlerte["lien"];
  pourquoi: string;
}

/**
 * Phrase d'une alerte, qui dit toujours la période du chiffre : « En moyenne
 * sur septembre 2026, la France emprunte à 10 ans à 4,44 %, contre 4,36 % pour
 * l'Italie. C'est le cas depuis août 2026. »
 */
export function phraseAlerte(r: RegleAlerte, e: Etat): string | undefined {
  if (e.etat === "normal") return undefined;
  const debut = `${periodePhrase(e.dernier.x, r.mesure)}, ${r.enonce(e.dernier)}`;
  if (e.etat === "franchi") {
    const depuis = e.depuis === e.dernier.x ? "" : ` C'est le cas depuis ${periodeCourte(e.depuis, r.mesure)}.`;
    return `${debut}${r.rappelSeuil ? `, ${r.libelleSeuil}` : ""}.${depuis}`;
  }
  return `${debut}, ${r.libelleRetour}.`;
}

/** Alertes en cours, calculées sur les données actuelles. */
export function alertesActives(regles: RegleAlerte[] = reglesAlertes): Alerte[] {
  return regles.flatMap((r) => {
    const e = evaluerSeuil(r.points(), r.seuil, r.sens);
    const phrase = phraseAlerte(r, e);
    return phrase && e.etat !== "normal" ? [{ id: r.id, etat: e.etat, phrase, date: e.dernier.x, lien: r.lien, pourquoi: r.pourquoi }] : [];
  });
}

/** Seuil franchi, en cours ou terminé : chacun a sa page dans « L'actu », qui reste en ligne après la fin de l'alerte. */
export interface EpisodeAlerte extends Alerte {
  /** Premier point au-delà du seuil : donne l'adresse stable de la page. */
  debut: string;
  enCours: boolean;
}

/** Dernier jour d'une période : « 2026-09 » → « 2026-09-30 », « 2026-T2 » → « 2026-06-30 », « 2025 » → « 2025-12-31 ». */
function finPeriode(x: string): string {
  if (/^\d{4}-\d{2}-\d{2}$/.test(x)) return x;
  const t = /^(\d{4})-T(\d)$/.exec(x);
  const [a, m] = t ? [Number(t[1]), Number(t[2]) * 3] : /^\d{4}-\d{2}$/.test(x) ? x.split("-").map(Number) : [Number(x.slice(0, 4)), 12];
  return new Date(Date.UTC(a, m, 0)).toISOString().slice(0, 10);
}

/** Épisodes des règles d'alerte qui durent encore ou se sont terminés après `depuis` (AAAA-MM-JJ). */
export function episodesAlertes(depuis: string, regles: RegleAlerte[] = reglesAlertes): EpisodeAlerte[] {
  return regles.flatMap((r) =>
    episodes(r.points(), r.seuil, r.sens).flatMap((ep): EpisodeAlerte[] => {
      const e: Etat = ep.retour ? { etat: "retour", dernier: ep.retour, precedent: ep.fin } : { etat: "franchi", depuis: ep.debut.x, dernier: ep.fin };
      // La période la plus récente de l'épisode (ou de son retour) doit finir après le début du fil.
      const date = e.dernier.x;
      if (finPeriode(date) < depuis) return [];
      const phrase = phraseAlerte(r, e);
      if (!phrase) return [];
      return [{ id: r.id, etat: e.etat, phrase, date, lien: r.lien, pourquoi: r.pourquoi, debut: ep.debut.x, enCours: !ep.retour }];
    }),
  );
}
