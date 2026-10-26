/**
 * Résumé officiel d'une publication : le chapô, l'« En bref » ou le paragraphe
 * d'introduction rédigé par l'organisme lui-même, repris tel quel et en
 * entier, seulement si la licence du site le permet. Sinon, la page de
 * l'actualité garde le titre, les chiffres, les liens vers les modules et le
 * lien vers la source. Fonctions pures, sans import de module Node : utilisées
 * par scripts/reprendre-resumes.ts et testées.
 */
import { texteBrut } from "./flux.ts";

export interface Licence {
  nom: string;
  /** Page où la licence ou les conditions de réutilisation sont publiées. */
  url: string;
  reutilisable: boolean;
  /** Ce que la licence demande, ou pourquoi la reprise n'est pas permise. */
  conditions: string;
}

/** Conditions de réutilisation, par site, relevées le 26 octobre 2026. */
export const LICENCES: Record<string, Licence> = {
  "www.insee.fr": {
    nom: "Licence Ouverte / Open Licence 2.0 (Etalab)",
    url: "https://www.insee.fr/fr/information/2008466",
    reutilisable: true,
    conditions: "Réutilisation libre, en mentionnant la source et sans altérer le sens des informations.",
  },
  "ec.europa.eu": {
    nom: "Creative Commons Attribution 4.0 (CC BY 4.0)",
    url: "https://ec.europa.eu/eurostat/help/copyright-notice",
    reutilisable: true,
    conditions: "Réutilisation permise en citant la source et en signalant toute modification.",
  },
  "www.ecb.europa.eu": {
    nom: "Conditions de reproduction de la BCE",
    url: "https://www.ecb.europa.eu/services/disclaimer/html/index.en.html",
    reutilisable: true,
    conditions: "Reproduction permise si l'information est reproduite fidèlement et la BCE citée comme source.",
  },
  "www.ccomptes.fr": {
    nom: "Mentions légales de la Cour des comptes",
    url: "https://www.ccomptes.fr/fr/mentions-legales",
    reutilisable: true,
    conditions: "Reproduction autorisée en citant www.ccomptes.fr comme source, sans altérer le contenu.",
  },
  "www.hcfp.fr": {
    nom: "Mentions légales du Haut Conseil des finances publiques",
    url: "https://www.hcfp.fr/mentions-legales",
    reutilisable: true,
    conditions: "Reproduction autorisée en citant hcfp.fr comme source, en respectant l'intégrité des textes.",
  },
  "www.senat.fr": {
    nom: "Mentions légales du Sénat (travaux parlementaires)",
    url: "https://www.senat.fr/mentions-legales.html",
    reutilisable: true,
    conditions: "Reproduction libre et gratuite des travaux parlementaires, sans modification, en citant www.senat.fr avec un lien.",
  },
  "www.banque-france.fr": {
    nom: "Informations légales de la Banque de France",
    url: "https://www.banque-france.fr/fr/infos-legales",
    reutilisable: true,
    // Page fermée à la lecture automatique : conditions relevées par le responsable du site le 26 octobre 2026.
    conditions:
      "Réutilisation des contenus dont la source est uniquement la Banque de France, en la citant avec la date de dernière mise à jour, sans déformer le contenu. Ne couvre pas les communiqués de la BCE qu'elle relaie (repris depuis le site de la BCE) ni les indices CNO-TEC (données de marché de tiers).",
  },
  "www.assemblee-nationale.fr": {
    nom: "Informations légales de l'Assemblée nationale",
    url: "https://www.assemblee-nationale.fr/",
    reutilisable: false,
    conditions: "Reproduction réservée à un usage personnel : pas l'équivalent d'une licence ouverte.",
  },
};

/**
 * Sites dont la licence permet la reprise, mais dont on n'affiche pas le
 * résumé : Eurostat publie ses résumés en anglais ; la page garde le titre
 * traduit, les chiffres, les liens vers les modules et le lien vers la source.
 */
export const RESUME_NON_AFFICHE: Record<string, string> = {
  "ec.europa.eu": "résumé publié en anglais : seul le titre traduit est affiché",
};

/** Licence qui s'applique à une publication, d'après le site qui l'héberge. */
export function licenceDe(lien: string): Licence | undefined {
  return LICENCES[new URL(lien).hostname];
}

/** Pourquoi le résumé officiel d'une publication n'est pas repris, ou undefined s'il peut l'être. */
export function raisonNonReprise(lien: string): string | undefined {
  const site = new URL(lien).hostname;
  if (RESUME_NON_AFFICHE[site]) return RESUME_NON_AFFICHE[site];
  const licence = LICENCES[site];
  if (!licence) return "licence du site non vérifiée";
  return licence.reutilisable ? undefined : `licence : ${licence.conditions}`;
}

/** Paragraphes d'un fragment HTML (séparés par </p> ou <br>), en texte brut, sans les paragraphes vides. */
function paragraphes(html: string): string[] {
  return html
    .split(/<\/p>|<br\s*\/?>/i)
    .map((p) => texteBrut(p))
    .filter((p) => p.length > 0);
}

/** Paragraphes <p> d'un fragment HTML, en texte brut. */
const paragraphesP = (html: string) => [...html.matchAll(/<p\b[^>]*>([\s\S]*?)<\/p>/g)].map((m) => texteBrut(m[1])).filter(Boolean);

/** Contenu d'un élément repéré par sa balise ouvrante, jusqu'à sa balise fermante (en tenant compte de l'imbrication). */
function bloc(html: string, debut: RegExp): string | undefined {
  const m = debut.exec(html);
  if (!m) return undefined;
  const balise = /^<(\w+)/.exec(m[0])?.[1] ?? "div";
  let profondeur = 0;
  const re = new RegExp(`<(/?)${balise}\\b[^>]*>`, "gi");
  re.lastIndex = m.index;
  for (let x = re.exec(html); x; x = re.exec(html)) {
    profondeur += x[1] ? -1 : 1;
    if (profondeur === 0) return html.slice(m.index + m[0].length, x.index);
  }
  return undefined;
}

/** Description écrite par l'organisme dans les métadonnées de la page (JSON-LD, puis balise og:description). */
function description(html: string): string | undefined {
  const ld = /"description"\s*:\s*"((?:[^"\\]|\\.)*)"/.exec(html)?.[1];
  if (ld) return texteBrut(JSON.parse(`"${ld}"`) as string);
  const og = /<meta[^>]+property=['"]og:description['"][^>]+content=['"]([^'"]+)['"]/i.exec(html)?.[1];
  return og ? texteBrut(og) : undefined;
}

/**
 * Résumé rédigé par l'organisme, repris tel quel et en entier (jamais
 * raccourci : la Cour des comptes, le Haut Conseil et le Sénat interdisent
 * toute altération), ou undefined si la page n'en a pas de reconnaissable.
 */
export function extraireResume(lien: string, html: string): string[] | undefined {
  const site = new URL(lien).hostname;
  let ps: string[] = [];
  if (site === "www.insee.fr") {
    // Le chapô ; à défaut (Informations rapides), le premier paragraphe de la publication.
    ps = [...html.matchAll(/<p class="paragraphe-chapeau[^"]*">([\s\S]*?)<\/p>/g)].map((m) => texteBrut(m[1])).filter(Boolean);
    if (!ps.length) {
      const corps = bloc(html, /<div class="corps-publication">/);
      const premier = corps && /<p class="paragraphe[^"]*">([\s\S]*?)<\/p>/.exec(corps)?.[1];
      if (premier) ps = [texteBrut(premier)];
    }
  } else if (site === "www.hcfp.fr") {
    const chapo = bloc(html, /<div class="[^"]*field--name-field-chapo[^"]*">/);
    // Le renvoi vers les vidéos des auditions n'est pas un résumé.
    if (chapo) ps = paragraphes(chapo).filter((p) => !/^Retrouvez /.test(p));
  } else if (site === "www.senat.fr") {
    const apres = html.split(/<h2>\s*Le r(?:é|&eacute;)sum(?:é|&eacute;)\s*<\/h2>/i)[1];
    // Sans les liens de navigation (« Consulter le rapport »), qui ne font pas partie du résumé.
    if (apres) ps = paragraphesP(apres.split(/<h2|<\/section>/i)[0]).filter((p) => !/^(Consulter|Télécharger|Lire) /.test(p));
  } else if (site === "www.banque-france.fr") {
    // Communiqué propre à la Banque de France : le texte d'introduction sous le titre.
    const chapo = bloc(html, /<div class="[^"]*field--name-field-espaces2-description[^"]*">/);
    if (chapo) ps = paragraphes(chapo);
  } else if (site === "www.ccomptes.fr") {
    // Le résumé affiché sous le titre, en entier ; à défaut, la description complète des métadonnées.
    const resume = bloc(html, /<div class="teaser-text[^"]*">/);
    ps = resume ? paragraphes(resume) : [description(html) ?? ""];
  } else if (site === "www.ecb.europa.eu") {
    // Communiqué de la BCE en français : le paragraphe d'introduction, après la date. Une page « Pas disponible en
    // français » (texte resté en anglais) n'est pas reprise. La description des métadonnées est générique : pas utilisée.
    if (/id="language-not-available"/.test(html) || !/\.fr\.html$/.test(new URL(lien).pathname)) return undefined;
    const section = bloc(html.slice(Math.max(0, html.indexOf("<main"))), /<div class="section">/);
    const premier = section && [...section.matchAll(/<p(?![^>]*ecb-publicationDate)[^>]*>([\s\S]*?)<\/p>/g)].map((m) => texteBrut(m[1])).find(Boolean);
    if (premier) ps = [premier];
  }
  ps = ps.filter((p) => p.length >= 20);
  return ps.length && ps.join(" ").length >= 80 ? ps : undefined;
}

/** Version française d'un communiqué publié sur le site de la BCE (« ….en.html » → « ….fr.html »). */
export const versionFrancaiseBce = (lien: string) => lien.replace(/\.[a-z]{2}\.html$/, ".fr.html");

/**
 * Liste de la BCE où trouver un communiqué relayé en français par la Banque de
 * France, d'après son titre et sa date de publication : décisions de politique
 * monétaire et comptes rendus de réunion. Pour les autres, pas de liste lisible.
 */
export function listeBce(titre: string, date: string): { liste: string; prefixe: string } | undefined {
  const [a, m, j] = date.slice(0, 10).split("-");
  const jour = `${a.slice(2)}${m}${j}`;
  if (/^Décisions de politique monétaire/.test(titre)) return { liste: `https://www.ecb.europa.eu/press/govcdec/mopo/${a}/html/index_include.en.html`, prefixe: `ecb.mp${jour}` };
  if (/^Compte rendu de la réunion de politique monétaire/.test(titre)) return { liste: `https://www.ecb.europa.eu/press/accounts/${a}/html/index_include.en.html`, prefixe: `ecb.mg${jour}` };
  return undefined;
}

/** Adresse de la version française du communiqué repéré par son préfixe (« ecb.mp260910 ») dans une liste de la BCE. */
export function trouverDansListeBce(html: string, prefixe: string): string | undefined {
  const m = new RegExp(`href="(?:https://www\\.ecb\\.europa\\.eu)?(/press/[^"]*/${prefixe.replace(".", "\\.")}~[0-9a-f]+)\\.[a-z]{2}\\.html"`).exec(html);
  return m ? `https://www.ecb.europa.eu${m[1]}.fr.html` : undefined;
}

const MOIS_FR = ["janvier", "février", "mars", "avril", "mai", "juin", "juillet", "août", "septembre", "octobre", "novembre", "décembre"];

/**
 * Date de dernière mise à jour affichée par la page (Banque de France : « Mise
 * en ligne le 12 Septembre 2026 » ou « Mis à jour le … »), en toutes lettres,
 * ou undefined. La licence de la Banque de France demande de la citer.
 */
export function dateMiseAJour(html: string): string | undefined {
  const textes = [...html.matchAll(/(Mis(?:e)? (?:à jour|en ligne) le)\s+(\d{1,2})(?:er)?\s+(\p{L}+)\s+(\d{4})/giu)];
  const m = textes.find((x) => /jour/i.test(x[1])) ?? textes[0];
  if (!m) return undefined;
  const mois = MOIS_FR.find((x) => x.normalize("NFD").replace(/[\u0300-\u036f]/g, "") === m[3].toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, ""));
  return mois ? `${Number(m[2]) === 1 ? "1er" : Number(m[2])} ${mois} ${m[4]}` : undefined;
}
