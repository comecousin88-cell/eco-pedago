/**
 * Exploration ponctuelle du catalogue Webstat (Banque de France) : liste les
 * séries quotidiennes de taux à long terme encore alimentées, pour choisir la
 * série du taux à 10 ans quotidien. Lancé à la main sur GitHub (tâche
 * « Explorer Webstat »), avec la clé WEBSTAT_CLIENT_ID ; n'écrit rien dans data/.
 *
 *   WEBSTAT_CLIENT_ID=… node scripts/explorer-webstat.ts
 */
import { appendFileSync } from "node:fs";

const cle = process.env.WEBSTAT_CLIENT_ID;
if (!cle) throw new Error("WEBSTAT_CLIENT_ID manquant");
const BASE = "https://webstat.banque-france.fr/api/explore/v2.1/catalog/datasets";

async function requete(chemin: string): Promise<unknown> {
  const r = await fetch(`${BASE}/${chemin}`, { headers: { Authorization: `Apikey ${cle}` }, signal: AbortSignal.timeout(60_000) });
  const texte = await r.text();
  if (!r.ok) throw new Error(`HTTP ${r.status} : ${texte.slice(0, 200)}`);
  return JSON.parse(texte);
}

const lignes: string[] = ["# Exploration de Webstat : séries quotidiennes de taux à long terme", ""];
const motifs = ["10 ans", "10 years", "OAT", "TEC", "emprunt", "phare", "long terme", "obligataire"];
const vues = new Map<string, { titre: string; derniere: string }>();

for (const motif of motifs) {
  const where = encodeURIComponent(`freq="D" AND (title_long_fr like "%${motif}%" OR title_fr like "%${motif}%")`);
  try {
    const res = (await requete(
      `series/exports/json?select=series_key,title_fr,title_long_fr,last_time_period_date&where=${where}&order_by=last_time_period_date%20desc&limit=40`,
    )) as { series_key: string; title_fr?: string; title_long_fr?: string; last_time_period_date?: string }[];
    lignes.push(`- « ${motif} » : ${res.length} série(s)`);
    for (const s of res) vues.set(s.series_key, { titre: s.title_long_fr || s.title_fr || "", derniere: s.last_time_period_date ?? "?" });
  } catch (e) {
    lignes.push(`- « ${motif} » : échec (${e instanceof Error ? e.message : e})`);
  }
}

const triees = [...vues.entries()].sort((a, b) => (a[1].derniere < b[1].derniere ? 1 : -1));
lignes.push("", "| Dernière observation | Clé de série | Titre |", "|---|---|---|");
for (const [cleSerie, s] of triees.slice(0, 60)) lignes.push(`| ${s.derniere} | \`${cleSerie}\` | ${s.titre.replaceAll("|", "/")} |`);
if (!triees.length) lignes.push("| — | aucune série quotidienne trouvée | |");

const resume = lignes.join("\n");
console.log(resume);
if (process.env.GITHUB_STEP_SUMMARY) appendFileSync(process.env.GITHUB_STEP_SUMMARY, `${resume}\n`);
