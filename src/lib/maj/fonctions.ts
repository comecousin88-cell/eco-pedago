/**
 * Mise à jour automatique des indicateurs : lecture des réponses des API
 * (BCE, Eurostat, Insee), contrôles de vraisemblance, et application à une
 * donnée de data/*.json. Fonctions pures, sans import : elles sont exécutées
 * telles quelles par Node (scripts/maj-indicateurs.ts) et testées par Vitest.
 */

export interface Point {
  x: string;
  y: number;
}

export interface Observation {
  periode: string;
  valeur: number;
}

/** Réponse CSV de l'API de la BCE (data-api.ecb.europa.eu, format=csvdata). */
export function lireCsvBce(texte: string): Observation[] {
  const lignes = texte.trim().split(/\r?\n/);
  if (lignes.length < 2) return [];
  const entete = lignes[0].split(",");
  const iPeriode = entete.indexOf("TIME_PERIOD");
  const iValeur = entete.indexOf("OBS_VALUE");
  if (iPeriode < 0 || iValeur < 0) throw new Error("CSV de la BCE : colonnes TIME_PERIOD ou OBS_VALUE absentes");
  return lignes
    .slice(1)
    .map((l) => l.split(","))
    .filter((c) => c[iValeur] !== "" && c[iValeur] !== undefined && !Number.isNaN(Number(c[iValeur])))
    .map((c) => ({ periode: c[iPeriode], valeur: Number(c[iValeur]) }));
}

/** Réponse JSON-stat d'Eurostat, pour un pays (les autres dimensions sont filtrées à une valeur). */
export function lireJsonStatEurostat(json: {
  id: string[];
  size: number[];
  dimension: Record<string, { category: { index: Record<string, number> } }>;
  value: Record<string, number>;
}, geo: string): Observation[] {
  const index = (dim: string) => json.dimension[dim].category.index;
  const gi = index("geo")[geo];
  if (gi === undefined) throw new Error(`Eurostat : pays ${geo} absent de la réponse`);
  const temps = Object.entries(index("time")).sort((a, b) => a[1] - b[1]);
  const res: Observation[] = [];
  for (const [periode, ti] of temps) {
    let pos = 0;
    json.id.forEach((dim, k) => {
      const i = dim === "geo" ? gi : dim === "time" ? ti : 0;
      pos = pos * json.size[k] + i;
    });
    const v = json.value[String(pos)];
    if (v !== undefined && v !== null) res.push({ periode, valeur: v });
  }
  return res;
}

/** Réponse SDMX-ML de la BDM de l'Insee : les éléments <Obs TIME_PERIOD="…" OBS_VALUE="…"/>. */
export function lireSdmxInsee(xml: string): Observation[] {
  const res: Observation[] = [];
  for (const m of xml.matchAll(/<Obs\b([^>]*)\/?>/g)) {
    const periode = /TIME_PERIOD="([^"]+)"/.exec(m[1])?.[1];
    const valeur = /OBS_VALUE="([^"]+)"/.exec(m[1])?.[1];
    if (periode && valeur && !Number.isNaN(Number(valeur))) res.push({ periode, valeur: Number(valeur) });
  }
  return res.sort((a, b) => (a.periode < b.periode ? -1 : 1));
}

/** Série quotidienne d'un taux → dates de changement (format des paliers de data/). */
export function changementsDeTaux(quotidien: Observation[], depuis: string): Point[] {
  const tries = [...quotidien].sort((a, b) => (a.periode < b.periode ? -1 : 1));
  const points: Point[] = [];
  let precedent: number | undefined;
  for (const o of tries) {
    if (o.valeur !== precedent) {
      if (o.periode >= depuis) points.push({ x: o.periode, y: o.valeur });
      precedent = o.valeur;
    }
  }
  return points;
}

/** « 2026-Q2 » (Insee) → « 2026-T2 » (format du site). */
export function trimestreInsee(periode: string): string {
  return periode.replace(/-Q(\d)$/, "-T$1");
}

/** Dernier jour d'un trimestre « 2026-T2 » → « 2026-06-30 ». */
export function finDeTrimestre(x: string): string {
  const [a, t] = x.split("-T");
  return { "1": `${a}-03-31`, "2": `${a}-06-30`, "3": `${a}-09-30`, "4": `${a}-12-31` }[t] ?? x;
}

export interface Controle {
  ok: boolean;
  raison?: string;
}

/**
 * Contrôles avant d'accepter une nouvelle série : non vide, valeurs dans une
 * fourchette plausible, pas de recul de la dernière période, pas de perte
 * importante d'historique. En cas d'échec, on garde la série existante.
 */
export function controlerSerie(
  ancienne: Point[],
  nouvelle: Point[],
  bornes: { min: number; max: number },
): Controle {
  if (nouvelle.length === 0) return { ok: false, raison: "série vide" };
  const hors = nouvelle.find((p) => !Number.isFinite(p.y) || p.y < bornes.min || p.y > bornes.max);
  if (hors) return { ok: false, raison: `valeur hors de la fourchette plausible (${hors.x} : ${hors.y})` };
  const derniereAncienne = ancienne.at(-1)?.x;
  const derniereNouvelle = nouvelle.at(-1)!.x;
  if (derniereAncienne && derniereNouvelle < derniereAncienne)
    return { ok: false, raison: `la nouvelle série s'arrête avant l'ancienne (${derniereNouvelle} < ${derniereAncienne})` };
  if (nouvelle.length < ancienne.length * 0.9)
    return { ok: false, raison: `historique tronqué (${nouvelle.length} points au lieu de ${ancienne.length})` };
  return { ok: true };
}

export interface DonneeJson {
  id: string;
  valeur?: number;
  serie?: Point[];
  date: string;
  consulte_le?: string;
  statut: string;
  note?: string;
  [cle: string]: unknown;
}

/** Remplace la série d'une donnée et met à jour sa date et sa date de consultation. */
export function appliquerSerie(d: DonneeJson, serie: Point[], date: string, aujourdhui: string): DonneeJson {
  return { ...d, serie, date, consulte_le: aujourdhui, statut: "verifie" };
}

/** Remplace la valeur d'une donnée et met à jour sa date et sa date de consultation. */
export function appliquerValeur(d: DonneeJson, valeur: number, date: string, aujourdhui: string, note?: string): DonneeJson {
  return { ...d, valeur, date, consulte_le: aujourdhui, statut: "verifie", ...(note ? { note } : {}) };
}

export interface EtatSource {
  statut: "ok" | "echec";
  /** Date et heure de la dernière mise à jour réussie (ISO). */
  derniere_reussite: string | null;
  message?: string;
}

export interface JournalMaj {
  derniere_verification: string;
  sources: Record<string, EtatSource>;
}

/** Met à jour le journal : date de vérification, et état de chaque source. */
export function journaliser(
  precedent: JournalMaj | undefined,
  maintenant: string,
  resultats: Record<string, { ok: boolean; message?: string }>,
): JournalMaj {
  const sources: Record<string, EtatSource> = { ...(precedent?.sources ?? {}) };
  for (const [nom, r] of Object.entries(resultats)) {
    sources[nom] = r.ok
      ? { statut: "ok", derniere_reussite: maintenant }
      : { statut: "echec", derniere_reussite: precedent?.sources[nom]?.derniere_reussite ?? null, message: r.message };
  }
  return { derniere_verification: maintenant, sources };
}
