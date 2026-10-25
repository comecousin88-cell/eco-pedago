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

export interface RegleAlerte {
  id: string;
  /** Sujet de la phrase : « Le taux d'emprunt de l'État à 10 ans ». */
  sujet: string;
  /** Position par rapport au seuil, sans verbe : « au-dessus de 5 % ». */
  libelleSeuil: string;
  seuil: number;
  sens: Sens;
  points: () => Point[];
  /** Valeur actuelle en clair : « 5,1 % ». */
  detail: (dernier: Point) => string;
  lien: { href: string; libelle: string };
  /** Pourquoi ce seuil compte, en une phrase : sert de brouillon à l'encadré « Ce que ça veut dire ». */
  pourquoi: string;
}

const pct = (decimales: number) => (p: Point) => `${formatNombre(p.y, decimales)} %`;
const taux10Jour = () => chercherValeur("marches.taux10-france-jour");

export const reglesAlertes: RegleAlerte[] = [
  {
    id: "oat-5",
    sujet: "Le taux d'emprunt de l'État à 10 ans",
    libelleSeuil: "au-dessus de 5 %",
    seuil: 5,
    sens: "au-dessus",
    points: () => avecValeurRecente(getSerie("marches.taux10-france").serie, taux10Jour()),
    detail: pct(2),
    lien: { href: "/modules/emprunt-etat/prix-et-taux/", libelle: "Pourquoi le taux compte" },
    pourquoi: "Chaque emprunt nouveau, et chaque dette renouvelée, coûte alors plus cher à l'État : l'effet sur la charge d'intérêts se diffuse sur plusieurs années.",
  },
  {
    id: "spread-100",
    sujet: "L'écart de taux à 10 ans entre la France et l'Allemagne",
    libelleSeuil: "au-dessus d'un point (100 points de base)",
    seuil: 100,
    sens: "au-dessus",
    points: () => getSerie("marches.spread-france-allemagne").serie,
    detail: (p) => `${formatNombre(p.y, 0)} points de base`,
    lien: { href: "/modules/emprunt-etat/spread-notation/", libelle: "Spread et notation" },
    pourquoi: "Les investisseurs demandent un supplément pour prêter à la France plutôt qu'à l'Allemagne : c'est un signal de moindre confiance, qui renchérit les emprunts.",
  },
  {
    id: "france-italie",
    sujet: "Le taux d'emprunt à 10 ans de la France",
    libelleSeuil: "au-dessus de celui de l'Italie",
    seuil: 0,
    sens: "au-dessus",
    points: () => difference(getSerie("marches.taux10-france").serie, getSerie("marches.taux10-italie").serie),
    detail: (p) => {
      const fr = getSerie("marches.taux10-france").serie.find((q) => q.x === p.x)!.y;
      const it = getSerie("marches.taux10-italie").serie.find((q) => q.x === p.x)!.y;
      return `${formatNombre(fr, 2)} % contre ${formatNombre(it, 2)} %`;
    },
    lien: { href: "/modules/emprunt-etat/spread-notation/", libelle: "Spread et notation" },
    pourquoi: "Les marchés jugent désormais la France aussi risquée, voire plus, que l'Italie, longtemps considérée comme plus fragile : la prime de risque française augmente.",
  },
  {
    id: "dette-120",
    sujet: "La dette publique",
    libelleSeuil: "au-dessus de 120 % du PIB",
    seuil: 120,
    sens: "au-dessus",
    points: () => {
      const recente = getValeur("dette.ratio-pib");
      return avecValeurRecente(getSerie("dette.historique-pib").serie, recente);
    },
    detail: (p) => `${formatNombre(p.y, 1)} % du PIB`,
    lien: { href: "/modules/deficit-et-dette/histoire/", libelle: "La dette depuis 1978" },
    pourquoi: "Plus la dette pèse lourd par rapport à la richesse produite, plus une hausse des taux alourdit la charge d'intérêts et réduit les marges du budget.",
  },
  {
    id: "inflation-3",
    sujet: "L'inflation en France (IPC de l'Insee)",
    libelleSeuil: "au-dessus de 3 % sur un an",
    seuil: 3,
    sens: "au-dessus",
    points: () => getSerie("ind.inflation-ipc-fr").serie,
    // « 3,1 % (définitif) » : l'Insee publie d'abord une estimation provisoire, puis le résultat définitif.
    detail: (p) => {
      const d = getSerie("ind.inflation-ipc-fr");
      const etat = etatDuPoint(d, p.x);
      return `${formatNombre(p.y, 1)} %${etat ? ` (${LIBELLE_ETAT[etat]})` : ""}`;
    },
    lien: { href: "/modules/les-bases/inflation-taux-reels/", libelle: "Inflation et taux réels" },
    pourquoi: "Les prix montent plus vite que l'objectif de la BCE : le pouvoir d'achat s'érode, et la BCE peut maintenir des taux plus élevés.",
  },
  {
    id: "chomage-9",
    sujet: "Le taux de chômage",
    libelleSeuil: "au-dessus de 9 %",
    seuil: 9,
    sens: "au-dessus",
    points: () => getSerie("ind.chomage").serie,
    detail: pct(1),
    lien: { href: "/tableau-de-bord/", libelle: "Tableau de bord" },
    pourquoi: "Un chômage plus élevé pèse sur les recettes (moins de cotisations) et sur les dépenses (plus d'indemnisation).",
  },
];

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

/** Phrase d'une alerte : « … est au-dessus de 5 % depuis … (5,1 % en novembre 2026). » */
export function phraseAlerte(r: RegleAlerte, e: Etat): string | undefined {
  if (e.etat === "normal") return undefined;
  const actuel = `${r.detail(e.dernier)} ${libelleDate(e.dernier.x)}`;
  if (e.etat === "franchi") {
    const depuis = e.depuis === e.dernier.x ? "" : ` depuis ${libelleDate(e.depuis).replace(/^(en|le|fin) /, "")}`;
    return `${r.sujet} est ${r.libelleSeuil}${depuis} : ${actuel}.`;
  }
  return `${r.sujet} n'est plus ${r.libelleSeuil} : ${actuel}, après ${r.detail(e.precedent)} ${libelleDate(e.precedent.x)}.`;
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
