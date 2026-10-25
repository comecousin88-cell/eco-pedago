/**
 * Veille de l'agenda (data/agenda.json), chaque jour ouvré.
 *
 *   npm run veille:agenda                 (sur un ordinateur : simple essai, rien n'est envoyé)
 *   npm run veille:agenda -- --appliquer  (applique les changements à data/agenda.json, en local)
 *
 * Repère les échéances passées à relire (notes des agences, budget…), compare
 * les dates de l'agenda aux calendriers officiels de l'Insee et de la BCE, et
 * surveille les pages officielles listées dans data/agenda.json. Pour chaque
 * changement, ouvre sur GitHub une demande de mise à jour (pull request)
 * assignée au propriétaire du dépôt, qui reçoit une notification. Rien n'est
 * publié : seule la fusion de la demande, par le propriétaire, modifie le site.
 * Une demande déjà ouverte, fusionnée ou fermée n'est jamais rouverte.
 */
import { execFileSync } from "node:child_process";
import { appendFileSync, readFileSync, writeFileSync } from "node:fs";
import type { Agenda } from "../src/lib/echeances.ts";
import {
  constatPage,
  constatsBce,
  constatsEcheancesPassees,
  constatsInsee,
  corpsDemande,
  lireCalendrierBce,
  lireCalendrierInsee,
  texteDePage,
  type Constat,
} from "../src/lib/veille.ts";

const RACINE = new URL("../", import.meta.url);
const CHEMIN = new URL("data/agenda.json", RACINE);
const enLigne = process.env.GITHUB_ACTIONS === "true" && !process.argv.includes("--essai");
const appliquer = !enLigne && process.argv.includes("--appliquer");
const base = process.env.BRANCHE_BASE ?? "main";
const proprietaire = process.env.GITHUB_REPOSITORY_OWNER ?? "proprietaire";
const aujourdhui = new Date().toISOString().slice(0, 10);

const lireAgenda = (): Agenda => JSON.parse(readFileSync(CHEMIN, "utf8"));
const lireJson = (fichier: string): unknown => JSON.parse(readFileSync(new URL(fichier, RACINE), "utf8"));
const ecrireJson = (fichier: string, x: unknown) => writeFileSync(new URL(fichier, RACINE), `${JSON.stringify(x, null, 2)}\n`, "utf8");
/** Applique à son fichier la modification proposée par un constat ; renvoie le fichier modifié. */
const appliquerConstat = (c: Constat<unknown>) => {
  const fichier = c.fichier ?? "data/agenda.json";
  ecrireJson(fichier, c.modifier(lireJson(fichier)));
  return fichier;
};
const lancer = (cmd: string, args: string[]) => execFileSync(cmd, args, { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] }).trim();

async function page(url: string): Promise<string> {
  const r = await fetch(url, { headers: { "User-Agent": "ecoclair (veille de l'agenda)" }, signal: AbortSignal.timeout(60_000) });
  if (!r.ok) throw new Error(`HTTP ${r.status}`);
  return texteDePage(await r.text());
}

const journal: string[] = [`Veille de l'agenda du ${aujourdhui}`];
const agenda = lireAgenda();
const constats = constatsEcheancesPassees(agenda, aujourdhui) as unknown as Constat<unknown>[];

try {
  constats.push(...(constatsInsee(agenda, lireCalendrierInsee(await page("https://www.insee.fr/fr/information/5235017"), aujourdhui), aujourdhui) as unknown as Constat<unknown>[]));
  journal.push("✓ calendrier de l'Insee lu");
} catch (e) {
  journal.push(`✗ calendrier de l'Insee : ${e instanceof Error ? e.message : e}`);
}
try {
  const dates = lireCalendrierBce(await page("https://www.ecb.europa.eu/press/calendars/mgcgc/html/index.fr.html"));
  if (dates.length === 0) throw new Error("aucune réunion lue (format changé ?)");
  constats.push(...(constatsBce(agenda, dates, aujourdhui) as unknown as Constat<unknown>[]));
  journal.push(`✓ calendrier de la BCE lu (${dates.length} réunions)`);
} catch (e) {
  journal.push(`✗ calendrier de la BCE : ${e instanceof Error ? e.message : e}`);
}
for (const s of agenda.surveillance) {
  try {
    const c = constatPage(agenda, s.id, await page(s.url));
    if (c) constats.push(c as unknown as Constat<unknown>);
    journal.push(`✓ page surveillée « ${s.titre} » lue`);
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    // Un site qui refuse les robots (403) n'est pas une panne : l'échéance de l'agenda prend le relais.
    journal.push(
      message === "HTTP 403"
        ? `• page surveillée « ${s.titre} » : le site refuse les robots (HTTP 403) ; suivi assuré par l'échéance de l'agenda`
        : `✗ page surveillée « ${s.titre} » : ${message}`,
    );
  }
}

// Les encadrés « Ce que ça veut dire » ne sont plus proposés ici : les résumés automatiques des
// actualités (scripts/resumer-actu.ts) les remplacent, avec leurs garde-fous.

if (enLigne) {
  try {
    lancer("gh", ["label", "create", "veille", "--color", "B45309", "--description", "Mise à jour proposée par la veille de l'agenda", "--force"]);
  } catch {
    // L'étiquette est facultative.
  }
  lancer("git", ["config", "user.name", "github-actions[bot]"]);
  lancer("git", ["config", "user.email", "41898282+github-actions[bot]@users.noreply.github.com"]);
}

for (const c of constats) {
  const branche = `veille/${c.id}`;
  if (appliquer) {
    journal.push(`✓ appliqué à ${appliquerConstat(c)} : ${c.titre}`);
    continue;
  }
  if (!enLigne) {
    journal.push(`→ (essai) demande « ${c.titre} » sur ${branche}\n\n${corpsDemande(c, proprietaire)}\n`);
    continue;
  }
  try {
    const existantes = JSON.parse(lancer("gh", ["pr", "list", "--state", "all", "--head", branche, "--json", "number"]));
    if (existantes.length > 0) {
      journal.push(`• déjà proposée : ${c.titre} (#${existantes[0].number})`);
      continue;
    }
    lancer("git", ["checkout", "-B", branche, `origin/${base}`]);
    const fichier = appliquerConstat(c);
    // Les demandes ouvertes par le robot ne déclenchent pas la tâche « Vérifications » : on contrôle ici.
    lancer("npx", ["vitest", "run", "src/lib/agenda.test.ts", "src/content/actu.test.ts"]);
    lancer("git", ["add", fichier]);
    lancer("git", ["commit", "-m", `Veille : ${c.titre}`]);
    lancer("git", ["push", "--force", "origin", branche]);
    writeFileSync("corps-demande.md", corpsDemande(c, proprietaire), "utf8");
    const args = ["pr", "create", "--base", base, "--head", branche, "--title", c.titre, "--body-file", "corps-demande.md", "--assignee", proprietaire];
    let lien: string;
    try {
      lien = lancer("gh", [...args, "--label", "veille"]);
    } catch {
      lien = lancer("gh", args);
    }
    journal.push(`✓ demande ouverte : ${c.titre} ${lien}`);
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    journal.push(`✗ ${c.titre} : ${message}`);
    process.exitCode = 1;
  } finally {
    lancer("git", ["checkout", "--force", base]);
  }
}
if (constats.length === 0) journal.push("Aucun changement à proposer.");

const resume = journal.join("\n");
console.log(resume);
if (process.env.GITHUB_STEP_SUMMARY) appendFileSync(process.env.GITHUB_STEP_SUMMARY, `${resume.replaceAll("\n", "\n\n")}\n`);
