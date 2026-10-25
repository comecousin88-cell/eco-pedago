/**
 * Lecture légale du texte d'une publication officielle, pour les résumés
 * automatiques : respect du fichier robots.txt du site, aucun contournement
 * (une page refusée ou protégée par un défi anti-robot est laissée de côté),
 * et extraction du seul texte principal de la page. Fonctions pures, sans
 * import : utilisées par scripts/resumer-actu.ts et testées.
 */

interface Regle {
  autorise: boolean;
  motif: string;
}

/** Règles robots.txt qui s'appliquent à notre robot (groupe « ecoclair » s'il existe, sinon « * »). */
export function reglesRobots(robots: string, robot = "ecoclair"): Regle[] {
  const groupes: { agents: string[]; regles: Regle[] }[] = [];
  let courant: { agents: string[]; regles: Regle[] } | undefined;
  let dernierEtaitAgent = false;
  for (const ligne of robots.split(/\r?\n/)) {
    const l = ligne.replace(/#.*/, "").trim();
    const m = /^([A-Za-z-]+)\s*:\s*(.*)$/.exec(l);
    if (!m) continue;
    const [cle, valeur] = [m[1].toLowerCase(), m[2].trim()];
    if (cle === "user-agent") {
      if (!courant || !dernierEtaitAgent) groupes.push((courant = { agents: [], regles: [] }));
      courant.agents.push(valeur.toLowerCase());
      dernierEtaitAgent = true;
      continue;
    }
    dernierEtaitAgent = false;
    if (!courant) continue;
    if (cle === "disallow" && valeur) courant.regles.push({ autorise: false, motif: valeur });
    if (cle === "allow" && valeur) courant.regles.push({ autorise: true, motif: valeur });
  }
  const propre = groupes.filter((g) => g.agents.some((a) => a !== "*" && robot.toLowerCase().includes(a)));
  return (propre.length ? propre : groupes.filter((g) => g.agents.includes("*"))).flatMap((g) => g.regles);
}

const versRegex = (motif: string) =>
  new RegExp(`^${motif.replace(/[.+?^${}()|[\]\\]/g, "\\$&").replace(/\*/g, ".*").replace(/\\\$$/, "$")}`);

/** Le chemin (avec ses paramètres) est-il permis ? La règle la plus longue l'emporte ; à égalité, Allow. */
export function permisParRobots(robots: string, chemin: string, robot = "ecoclair"): boolean {
  let meilleure: Regle | undefined;
  for (const r of reglesRobots(robots, robot)) {
    if (!versRegex(r.motif).test(chemin)) continue;
    if (!meilleure || r.motif.length > meilleure.motif.length || (r.motif.length === meilleure.motif.length && r.autorise)) meilleure = r;
  }
  return meilleure?.autorise ?? true;
}

/** Page de défi anti-robot ou d'accès refusé : on n'insiste pas. */
export function estPageProtegee(html: string): boolean {
  return /captcha|challenge-platform|cf-chl|just a moment|access denied|accès refusé|enable javascript and cookies/i.test(html.slice(0, 20000));
}

const entites: Record<string, string> = { amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: "\u00a0", rsquo: "’", lsquo: "‘", laquo: "«", raquo: "»", eacute: "é", egrave: "è", agrave: "à", ccedil: "ç" };

/** Texte principal d'une page HTML : contenu de <main> (ou <article>), sans menus, scripts ni formulaires. */
export function textePrincipal(html: string, max = 40000): string {
  const zone = /<main\b[\s\S]*?<\/main>/i.exec(html)?.[0] ?? /<article\b[\s\S]*?<\/article>/i.exec(html)?.[0] ?? html;
  return zone
    .replace(/<(script|style|noscript|nav|header|footer|aside|form|svg|button)\b[\s\S]*?<\/\1>/gi, " ")
    .replace(/<!--[\s\S]*?-->/g, " ")
    .replace(/<(br|\/p|\/li|\/h\d|\/tr|\/div|\/td|\/th)[^>]*>/gi, "\n")
    .replace(/<[^>]+>/g, " ")
    .replace(/&#x([0-9a-f]+);/gi, (_, n: string) => String.fromCodePoint(parseInt(n, 16)))
    .replace(/&#(\d+);/g, (_, n: string) => String.fromCodePoint(Number(n)))
    .replace(/&([a-z]+);/gi, (t, e: string) => entites[e.toLowerCase()] ?? t)
    .replace(/[ \t\u00a0]+/g, " ")
    .replace(/\s*\n\s*/g, "\n")
    .replace(/\n{2,}/g, "\n")
    .trim()
    .slice(0, max);
}
