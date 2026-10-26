/**
 * Résumés officiels des publications de « L'actu », repris tels quels.
 *
 *   npm run resumes:officiels
 *
 * Pour chaque publication du fil sans résumé : si la licence du site le permet
 * (src/lib/actu/resume-officiel.ts), lit la page (seulement si robots.txt
 * l'autorise ; une page refusée ou protégée est laissée de côté, sans
 * contournement) et reprend le chapô ou le paragraphe d'introduction rédigé
 * par l'organisme, tel quel et en entier, dans data/actu-resumes-officiels.json.
 * Pour un communiqué de la BCE relayé par la Banque de France, le résumé vient
 * de la version française publiée sur le site de la BCE, qui en autorise la
 * reproduction ; sans version française, il n'est pas repris.
 * Chaque tentative est inscrite au journal (data/actu-resumes-journal.json),
 * d'où est tiré RECAPITULATIF.md. Aucun service payant n'est appelé.
 */
import { appendFileSync, readFileSync, writeFileSync } from "node:fs";
import { DEBUT_FIL, traduireEurostat, type EntreeFlux } from "../src/lib/actu/flux.ts";
import { estPageProtegee, permisParRobots } from "../src/lib/actu/lecture-source.ts";
import { aChercher, texteRecapitulatif, type EntreeJournalResume, type JournalFusions, type JournalResumes, type ResumesOfficiels } from "../src/lib/actu/recapitulatif.ts";
import { dateMiseAJour, extraireResume, licenceDe, listeBce, raisonNonReprise, trouverDansListeBce, versionFrancaiseBce } from "../src/lib/actu/resume-officiel.ts";

const UA = "ecoclair (resumes officiels des publications)";
const RACINE = new URL("../", import.meta.url);
const lire = <T>(f: string): T => JSON.parse(readFileSync(new URL(f, RACINE), "utf8")) as T;
const ecrire = (f: string, x: unknown) => writeFileSync(new URL(f, RACINE), `${JSON.stringify(x, null, 2)}\n`, "utf8");
const maintenant = new Date().toISOString();

const flux = lire<{ entrees: EntreeFlux[] }>("data/actu-flux.json").entrees.filter((e) => e.date >= DEBUT_FIL);
const officiels = lire<ResumesOfficiels>("data/actu-resumes-officiels.json");
const journal = lire<JournalResumes>("data/actu-resumes-journal.json");

const url = (lien: string) => new URL(lien);

const robotsCache = new Map<string, Promise<string>>();
function robots(origine: string): Promise<string> {
  if (!robotsCache.has(origine))
    robotsCache.set(
      origine,
      fetch(`${origine}/robots.txt`, { headers: { "User-Agent": UA }, signal: AbortSignal.timeout(30_000) })
        .then((r) => (r.ok ? r.text() : ""))
        .catch(() => ""),
    );
  return robotsCache.get(origine)!;
}

/** Page lue en respectant robots.txt, ou la raison pour laquelle elle ne l'est pas. */
async function lirePage(lien: string): Promise<{ html: string } | { raison: string }> {
  const url = new URL(lien);
  if (!permisParRobots(await robots(url.origin), url.pathname + url.search)) return { raison: "page interdite aux robots par le site (robots.txt) : non lue" };
  const r = await fetch(lien, { headers: { "User-Agent": UA }, signal: AbortSignal.timeout(60_000) });
  if (!r.ok) return { raison: `page inaccessible (HTTP ${r.status}) : non contournée` };
  const html = await r.text();
  return estPageProtegee(html) ? { raison: "page protégée contre les robots : non contournée" } : { html };
}

/** Version française, sur le site de la BCE, d'un communiqué de la BCE (relayé ou non par la Banque de France). */
async function lienFrancaisBce(e: EntreeFlux): Promise<string | undefined> {
  if (new URL(e.lien).hostname === "www.ecb.europa.eu") return versionFrancaiseBce(e.lien);
  const cible = listeBce(e.titre, e.date);
  if (!cible) return undefined;
  const liste = await lirePage(cible.liste);
  return "html" in liste ? trouverDansListeBce(liste.html, cible.prefixe) : undefined;
}

/** Résumé officiel d'une publication, ou la raison pour laquelle il n'est pas repris. */
async function resumeOfficiel(lien: string): Promise<{ paragraphes: string[]; misAJour?: string } | { raison: string }> {
  const raison = raisonNonReprise(lien);
  if (raison) return { raison };
  const page = await lirePage(lien);
  if ("raison" in page) return page;
  const paragraphes = extraireResume(lien, page.html);
  // La Banque de France demande de citer la date de dernière mise à jour de ses contenus.
  if (paragraphes) return { paragraphes, ...(url(lien).hostname === "www.banque-france.fr" ? { misAJour: dateMiseAJour(page.html) } : {}) };
  if (/id="language-not-available"/.test(page.html)) return { raison: "communiqué de la BCE non publié en français : non repris" };
  return { raison: "pas de résumé reconnaissable sur la page" };
}

let repris = 0;
let nonRepris = 0;
for (const e of flux) {
  if (officiels.resumes[e.id] || !aChercher(journal.entrees, e.id, maintenant)) continue;
  const titre = (e.source === "eurostat" ? traduireEurostat(e.titre) : undefined) ?? e.titre;
  const base: Omit<EntreeJournalResume, "statut"> = { date: maintenant, id: e.id, titre, date_publication: e.date.slice(0, 10), lien: e.lien };
  try {
    // Communiqué de la BCE : depuis sa version française, sur le site de la BCE.
    const lienFr = e.source === "bce" ? await lienFrancaisBce(e) : undefined;
    const lien = lienFr ?? e.lien;
    const r =
      e.source === "bce" && !lienFr
        ? { raison: "version française du communiqué introuvable sur le site de la BCE : non repris" }
        : await resumeOfficiel(lien);
    if ("raison" in r) {
      journal.entrees.unshift({ ...base, statut: "non-repris", raison: r.raison });
      nonRepris++;
    } else {
      officiels.resumes[e.id] = {
        paragraphes: r.paragraphes,
        lien,
        ...(e.source === "bce" ? { organisme: "Banque centrale européenne" } : {}),
        licence: licenceDe(lien)!.nom,
        ...(r.misAJour ? { mis_a_jour: r.misAJour } : {}),
        recupere_le: maintenant.slice(0, 10),
      };
      journal.entrees.unshift({ ...base, statut: "repris" });
      repris++;
    }
  } catch (err) {
    journal.entrees.unshift({ ...base, statut: "non-repris", raison: `erreur de lecture : ${err instanceof Error ? err.message : String(err)}` });
    nonRepris++;
  }
}

journal.entrees = journal.entrees.slice(0, 3000);
ecrire("data/actu-resumes-officiels.json", officiels);
ecrire("data/actu-resumes-journal.json", journal);
const site = process.env.SITE_URL ?? "https://eco-pedago.vercel.app";
writeFileSync(new URL("RECAPITULATIF.md", RACINE), texteRecapitulatif(journal, lire<JournalFusions>("data/fusions-journal.json"), site, maintenant), "utf8");

const resume = `Résumés officiels du ${maintenant.slice(0, 10)} : ${repris} repris, ${nonRepris} non repris (raisons dans RECAPITULATIF.md).`;
console.log(resume);
if (process.env.GITHUB_STEP_SUMMARY) appendFileSync(process.env.GITHUB_STEP_SUMMARY, `${resume}\n`);
