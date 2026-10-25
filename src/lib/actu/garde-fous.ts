/**
 * Garde-fous des résumés automatiques de « L'actu » : un résumé n'est publié
 * que s'il a le bon format, si chacun de ses chiffres figure tel quel dans la
 * publication source, et s'il ne cite aucun nom propre (personne, parti) ni
 * aucune formule d'opinion ou de prédiction absente de la source. Sinon il est
 * rejeté, avec ses raisons, et la page garde « Résumé à venir ». Fonctions
 * pures, sans import : utilisées par scripts/resumer-actu.ts et testées.
 */

export interface ResumeGenere {
  en_bref: string[];
  ce_que_ca_veut_dire: string;
}

const ESPACES = /[\u00a0\u202f\u2009\u2007 ]/g;

/** Texte comparable : espaces insécables normalisés, apostrophes droites, accents conservés. */
export function normaliser(texte: string): string {
  return texte.replace(ESPACES, " ").replace(/[’‘]/g, "'").replace(/\s+/g, " ");
}

/**
 * Nombres d'un texte, sous une forme comparable : séparateurs de milliers
 * retirés, virgule décimale. « 2 797 », « 3,1 % » et « 3.1% » deviennent
 * « 2797 », « 3,1 » et « 3,1 ». Un nombre à virgule anglaise de milliers
 * (« 1,234 ») reste « 1,234 » : en cas de doute, le résumé est rejeté.
 */
export function nombres(texte: string): string[] {
  const t = normaliser(texte);
  const res: string[] = [];
  for (const m of t.matchAll(/(?<![\p{L}\d])\d{1,3}(?: \d{3})+(?:[.,]\d+)?(?!\d)|(?<![\p{L}\d])\d+(?:[.,]\d+)?(?!\d)/gu)) {
    res.push(m[0].replace(/ /g, "").replace(".", ","));
  }
  return res;
}

/** Chiffres du résumé absents de la source. */
export function chiffresAbsents(resume: ResumeGenere, source: string): string[] {
  const permis = new Set(nombres(source));
  const tous = [...resume.en_bref, resume.ce_que_ca_veut_dire].flatMap(nombres);
  return [...new Set(tous.filter((n) => !permis.has(n)))];
}

/** Problèmes de format : trois points courts d'une phrase, un paragraphe, ni liste, ni balisage, ni lien. */
export function problemesDeFormat(resume: unknown): string[] {
  const r = resume as Partial<ResumeGenere> | null;
  const pb: string[] = [];
  if (!r || !Array.isArray(r.en_bref) || typeof r.ce_que_ca_veut_dire !== "string") return ["structure attendue : en_bref (3 points) et ce_que_ca_veut_dire"];
  if (r.en_bref.length !== 3) pb.push(`« En bref » doit compter 3 points (${r.en_bref.length})`);
  const textes: [string, string, number, number][] = [
    ...r.en_bref.map((p, i): [string, string, number, number] => [`point ${i + 1}`, String(p), 30, 300]),
    ["« Ce que ça veut dire »", r.ce_que_ca_veut_dire, 120, 800],
  ];
  for (const [nom, t, min, max] of textes) {
    const s = t.trim();
    if (s.length < min || s.length > max) pb.push(`${nom} : ${s.length} caractères (attendu entre ${min} et ${max})`);
    if (/\n/.test(s)) pb.push(`${nom} : retour à la ligne (un seul paragraphe attendu)`);
    if (/^\s*([-*•]|\d+[.)])\s/.test(s) || /[*_#`]{1,}/.test(s)) pb.push(`${nom} : liste ou mise en forme Markdown`);
    if (/https?:\/\/|www\./.test(s)) pb.push(`${nom} : lien dans le texte`);
    if (!/[.!?»)]$/.test(s)) pb.push(`${nom} : phrase inachevée`);
  }
  return pb;
}

/** Mots à majuscule admis même s'ils n'apparaissent pas dans la source (institutions et notions courantes). */
const MAJUSCULES_PERMISES = new Set(
  "France État Etat Europe Union européenne Insee BCE Eurostat PIB IPC IPCH TVA CSG Sécurité Banque Cour Haut Conseil Sénat Assemblée Parlement Gouvernement Trésor Agence Smic Covid Moody's Fitch S&P Commission Eurosystème Acoss Cades".split(" "),
);

/** Formules d'opinion ou de prédiction, admises seulement si la source les emploie elle-même. */
const OPINIONS = [
  "malheureusement",
  "heureusement",
  "inquiétant",
  "alarmant",
  "préoccupant",
  "excellent",
  "catastroph",
  "bonne nouvelle",
  "mauvaise nouvelle",
  "il faut",
  "il faudrait",
  "on peut espérer",
  "il est probable",
  "probablement",
  "sans doute",
  "certainement",
  "à coup sûr",
  "devrait",
  "devraient",
  "pourrait",
  "pourraient",
  "nous ",
  "je ",
];

const sansAccents = (s: string) =>
  s
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();

/**
 * Noms propres (mot à majuscule ailleurs qu'en début de phrase : personne,
 * parti, organisme) et formules d'opinion du résumé qui n'apparaissent pas
 * dans la source.
 */
export function mentionsAbsentes(resume: ResumeGenere, source: string): string[] {
  const src = sansAccents(normaliser(source));
  const absentes = new Set<string>();
  for (const texte of [...resume.en_bref, resume.ce_que_ca_veut_dire]) {
    const t = normaliser(texte);
    for (const m of t.matchAll(/(?<=[\p{L},;:)»] )(\p{Lu}[\p{L}'&-]*)/gu)) {
      const mot = m[1].replace(/'s?$/, "");
      if (MAJUSCULES_PERMISES.has(mot) || MAJUSCULES_PERMISES.has(m[1])) continue;
      if (!src.includes(sansAccents(mot))) absentes.add(`nom propre « ${mot} »`);
    }
    const bas = sansAccents(t);
    for (const o of OPINIONS) if (bas.includes(sansAccents(o)) && !src.includes(sansAccents(o))) absentes.add(`formule d'opinion ou de prédiction « ${o.trim()} »`);
  }
  return [...absentes];
}

/** Toutes les raisons de rejeter un résumé ; une liste vide signifie qu'il peut être publié. */
export function raisonsDeRejet(resume: unknown, source: string): string[] {
  const format = problemesDeFormat(resume);
  if (format.length && !Array.isArray((resume as Partial<ResumeGenere>)?.en_bref)) return format;
  const r = resume as ResumeGenere;
  return [
    ...format,
    ...chiffresAbsents(r, source).map((n) => `chiffre « ${n} » absent de la publication source`),
    ...mentionsAbsentes(r, source),
  ];
}
