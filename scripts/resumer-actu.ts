/**
 * Résumés automatiques des publications officielles de « L'actu ».
 *
 *   npm run resumer:actu              (ANTHROPIC_API_KEY requise)
 *   npm run resumer:actu -- --max 5   (nombre maximal de résumés tentés)
 *   npm run resumer:actu -- --lecture (essai : lit les pages sources, sans appeler l'API ni rien écrire)
 *
 * Pour chaque publication du fil sans résumé : lit le texte de la page
 * officielle (seulement si robots.txt le permet ; une page refusée ou protégée
 * est laissée de côté, sans contournement), le fait résumer par Claude
 * (« En bref » en trois points et « Ce que ça veut dire »), puis applique les
 * garde-fous (src/lib/actu/garde-fous.ts) : format, chiffres présents tels
 * quels dans la source, aucun nom propre ni opinion absents de la source. Un
 * résumé conforme est publié directement (data/actu-resumes-auto.json) ; un
 * résumé rejeté laisse « Résumé à venir ». Chaque tentative est inscrite au
 * journal (data/actu-resumes-journal.json), d'où est tiré RECAPITULATIF.md.
 */
import { appendFileSync, readFileSync, writeFileSync } from "node:fs";
import Anthropic from "@anthropic-ai/sdk";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import { z } from "zod";
import { DEBUT_FIL, traduireEurostat, type EntreeFlux } from "../src/lib/actu/flux.ts";
import { raisonsDeRejet, type ResumeGenere } from "../src/lib/actu/garde-fous.ts";
import { estPageProtegee, permisParRobots, textePrincipal } from "../src/lib/actu/lecture-source.ts";
import { aTenter, rejeteDeuxFois, texteRecapitulatif, type EntreeJournalResume, type JournalFusions, type JournalResumes, type ResumesAuto } from "../src/lib/actu/recapitulatif.ts";

/** Modèle économique, suffisant pour des résumés courts et factuels. */
const MODELE = "claude-haiku-5-5";
const UA = "ecoclair (resumes de publications officielles)";
const RACINE = new URL("../", import.meta.url);
const lire = <T>(f: string): T => JSON.parse(readFileSync(new URL(f, RACINE), "utf8")) as T;
const ecrire = (f: string, x: unknown) => writeFileSync(new URL(f, RACINE), `${JSON.stringify(x, null, 2)}\n`, "utf8");

const i = process.argv.indexOf("--max");
const MAX = i > 0 ? Number(process.argv[i + 1]) : Number(process.env.MAX_RESUMES ?? 40);
const maintenant = new Date().toISOString();

const NOMS: Record<string, string> = {
  insee: "l'Insee",
  bce: "la Banque centrale européenne",
  "banque-de-france": "la Banque de France",
  eurostat: "Eurostat",
  "cour-des-comptes": "la Cour des comptes",
  hcfp: "le Haut Conseil des finances publiques",
  "assemblee-nationale": "l'Assemblée nationale",
  senat: "le Sénat",
};

const CONSIGNES = `Tu résumes une publication officielle française ou européenne pour un site pédagogique sur l'économie et les finances publiques, destiné au grand public.

Réponds en français avec deux champs :
- "en_bref" : exactement trois phrases, une par point, de 200 caractères au plus chacune, qui disent l'essentiel de la publication.
- "ce_que_ca_veut_dire" : un seul paragraphe de deux à quatre phrases (600 caractères au plus) qui explique simplement pourquoi ces informations comptent, par exemple pour le budget de l'État, la dette, les prix ou l'emploi.

Règles impératives :
- N'utilise que des faits présents dans la publication. N'ajoute aucune information extérieure.
- Chaque chiffre que tu écris doit figurer tel quel dans la publication (même valeur, mêmes décimales) : ne calcule, n'arrondis et ne convertis aucun chiffre. Écris les décimales avec une virgule et « % » précédé d'une espace. Si un chiffre ne figure pas dans la publication, ne l'écris pas.
- Ton factuel et pédagogique : aucune opinion, aucun jugement, aucune prédiction. Une prévision n'est permise que si la publication l'énonce, et elle doit être attribuée à son auteur (« le Gouvernement prévoit… »).
- Ne cite aucune personne ni aucun parti politique, sauf s'ils figurent dans la publication.
- Phrases courtes, mots simples, sans jargon non expliqué. Pas de liste, pas de Markdown, pas de lien.`;

const Schema = z.object({ en_bref: z.array(z.string()), ce_que_ca_veut_dire: z.string() });

const flux = lire<{ entrees: EntreeFlux[] }>("data/actu-flux.json").entrees.filter((e) => e.date >= DEBUT_FIL);
const manuels = lire<{ resumes: Record<string, unknown> }>("data/actu-resumes.json").resumes;
const auto = lire<ResumesAuto>("data/actu-resumes-auto.json");
const journal = lire<JournalResumes>("data/actu-resumes-journal.json");
const lignes = [`Résumés automatiques du ${maintenant.slice(0, 10)}`];

function empreinte(texte: string): string {
  let h = 0x811c9dc5;
  for (const c of new TextEncoder().encode(texte)) h = Math.imul(h ^ c, 0x01000193);
  return (h >>> 0).toString(16).padStart(8, "0");
}

const robotsCache = new Map<string, Promise<string>>();
async function robots(origine: string): Promise<string> {
  if (!robotsCache.has(origine))
    robotsCache.set(
      origine,
      fetch(`${origine}/robots.txt`, { headers: { "User-Agent": UA }, signal: AbortSignal.timeout(30_000) })
        .then((r) => (r.ok ? r.text() : ""))
        .catch(() => ""),
    );
  return robotsCache.get(origine)!;
}

/** Texte de la publication, ou la raison pour laquelle il ne peut pas être lu légalement. */
async function texteSource(lien: string): Promise<{ texte: string } | { raison: string }> {
  const url = new URL(lien);
  if (!permisParRobots(await robots(url.origin), url.pathname + url.search)) return { raison: "page interdite aux robots par le site (robots.txt) : non lue" };
  const r = await fetch(lien, { headers: { "User-Agent": UA }, signal: AbortSignal.timeout(60_000) });
  if (!r.ok) return { raison: `page source inaccessible (HTTP ${r.status}) : non contournée` };
  const html = await r.text();
  if (estPageProtegee(html)) return { raison: "page protégée contre les robots : non contournée" };
  const texte = textePrincipal(html);
  if (texte.length < 300) return { raison: "texte de la page source trop court pour être résumé" };
  return { texte };
}

const client = process.env.ANTHROPIC_API_KEY ? new Anthropic() : undefined;

async function resumer(titre: string, source: string, texte: string, raisonsPrecedentes: string[]) {
  const message = await client!.messages.parse({
    model: MODELE,
    max_tokens: 8000,
    system: CONSIGNES,
    output_config: { effort: "low", format: zodOutputFormat(Schema) },
    messages: [
      {
        role: "user",
        content: [
          `Publication de ${source} : « ${titre} »`,
          `<publication>\n${texte}\n</publication>`,
          raisonsPrecedentes.length ? `Un premier résumé a été refusé pour ces raisons ; corrige-les : ${raisonsPrecedentes.join(" ; ")}.` : "",
        ]
          .filter(Boolean)
          .join("\n\n"),
      },
    ],
  });
  if (message.stop_reason === "refusal") return { raisons: ["le modèle a refusé de résumer cette publication"], usage: message.usage };
  if (message.stop_reason === "max_tokens") return { raisons: ["réponse tronquée (limite de longueur atteinte)"], usage: message.usage };
  return { resume: message.parsed_output as ResumeGenere | null, usage: message.usage };
}

if (process.argv.includes("--lecture")) {
  // Essai : lit les pages sources, sans appeler l'API ni rien écrire.
  for (const e of flux) {
    const lu = await texteSource(e.lien);
    console.log(`${e.source.padEnd(18)} ${"texte" in lu ? `${String(lu.texte.length).padStart(6)} caractères` : lu.raison} · ${e.titre.slice(0, 70)}`);
  }
  process.exit(0);
}

if (!client) {
  lignes.push("• Clé ANTHROPIC_API_KEY absente : aucun résumé tenté (les pages gardent « Résumé à venir »).");
} else {
  const aFaire = flux.filter((e) => !manuels[e.id] && !auto.resumes[e.id] && aTenter(journal.entrees, e.id, maintenant)).slice(0, MAX);
  let publies = 0;
  let rejetes = 0;
  for (const e of aFaire) {
    const titre = (e.source === "eurostat" ? traduireEurostat(e.titre) : undefined) ?? e.titre;
    const base: Omit<EntreeJournalResume, "statut"> = { date: maintenant, id: e.id, titre, date_publication: e.date.slice(0, 10), lien: e.lien, modele: MODELE };
    try {
      const lu = await texteSource(e.lien);
      if ("raison" in lu) {
        journal.entrees.unshift({ ...base, statut: "rejete", raisons: [lu.raison] });
        rejetes++;
        continue;
      }
      const emp = empreinte(lu.texte);
      // Déjà rejeté deux fois pour ce même texte : on n'insiste pas (et on ne paie pas de nouveau).
      if (rejeteDeuxFois(journal.entrees, e.id, emp)) continue;
      // Deux essais au plus : le second reçoit les raisons du premier refus.
      let raisons: string[] = [];
      let resume: ResumeGenere | null | undefined;
      const jetons = { entree: 0, sortie: 0 };
      for (let essai = 1; essai <= 2; essai++) {
        const r = await resumer(titre, NOMS[e.source] ?? e.source, lu.texte, raisons);
        jetons.entree += r.usage.input_tokens;
        jetons.sortie += r.usage.output_tokens;
        resume = r.resume;
        raisons = r.raisons ?? raisonsDeRejet(resume, `${titre}\n${lu.texte}`);
        if (raisons.length === 0) break;
      }
      if (raisons.length === 0 && resume) {
        auto.resumes[e.id] = {
          en_bref: resume.en_bref.map((p) => p.trim()),
          ce_que_ca_veut_dire: resume.ce_que_ca_veut_dire.trim(),
          source_url: e.lien,
          genere_le: maintenant.slice(0, 10),
          modele: MODELE,
        };
        journal.entrees.unshift({ ...base, statut: "publie", empreinte: emp, jetons });
        publies++;
      } else {
        journal.entrees.unshift({ ...base, statut: "rejete", raisons, empreinte: emp, jetons });
        rejetes++;
      }
    } catch (err) {
      journal.entrees.unshift({ ...base, statut: "rejete", raisons: [`erreur : ${err instanceof Error ? err.message : String(err)}`] });
      rejetes++;
    }
  }
  lignes.push(`${aFaire.length} publication(s) sans résumé examinée(s) : ${publies} résumé(s) publié(s), ${rejetes} rejeté(s).`);
}

journal.entrees = journal.entrees.slice(0, 3000);
ecrire("data/actu-resumes-auto.json", auto);
ecrire("data/actu-resumes-journal.json", journal);
const site = process.env.SITE_URL ?? "https://eco-pedago.vercel.app";
writeFileSync(new URL("RECAPITULATIF.md", RACINE), texteRecapitulatif(journal, lire<JournalFusions>("data/fusions-journal.json"), site, maintenant), "utf8");

const resume = lignes.join("\n");
console.log(resume);
if (process.env.GITHUB_STEP_SUMMARY) appendFileSync(process.env.GITHUB_STEP_SUMMARY, `${resume.replaceAll("\n", "\n\n")}\n`);
