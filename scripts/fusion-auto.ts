/**
 * Fusion automatique des demandes de mise à jour ouvertes par les tâches
 * automatiques (branches veille/…, auteur github-actions[bot]).
 *
 *   npm run fusion:auto        (dans GitHub Actions : GH_TOKEN requis)
 *
 * Pour chaque demande : fusionne la branche dans une copie de main, puis lance
 * les tests (dont le contrôle des données), le
 * contrôle du code et la construction du site (avec la vérification des liens).
 * Si tout passe, la demande est fusionnée dans main ; sinon elle reste ouverte
 * et la raison est inscrite au journal (data/fusions-journal.json), repris dans
 * RECAPITULATIF.md. Rien n'est jamais forcé.
 */
import { execSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import { texteRecapitulatif, type EntreeJournalFusion, type JournalFusions, type JournalResumes } from "../src/lib/actu/recapitulatif.ts";

const RACINE = new URL("../", import.meta.url);
const lire = <T>(f: string): T => JSON.parse(readFileSync(new URL(f, RACINE), "utf8")) as T;
const sh = (cmd: string) => execSync(cmd, { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"], maxBuffer: 64 * 1024 * 1024 });
const maintenant = new Date().toISOString();

interface Demande {
  number: number;
  title: string;
  headRefName: string;
  author: { login: string };
}

const demandes = (JSON.parse(sh("gh pr list --state open --limit 100 --json number,title,headRefName,author")) as Demande[]).filter(
  (d) => d.headRefName.startsWith("veille/") && /github-actions/.test(d.author.login),
);

const journal = lire<JournalFusions>("data/fusions-journal.json");
const resultats: EntreeJournalFusion[] = [];

/** Lance un contrôle ; renvoie la raison de l'échec, ou undefined s'il passe. */
function controle(nom: string, cmd: string): string | undefined {
  try {
    sh(cmd);
    return undefined;
  } catch (e) {
    const sortie = `${(e as { stdout?: string }).stdout ?? ""}${(e as { stderr?: string }).stderr ?? ""}`;
    const ligne = sortie.split("\n").find((l) => /✗|×|FAIL|Error|error/.test(l))?.trim().slice(0, 200);
    return `${nom} en échec${ligne ? ` (${ligne})` : ""}`;
  }
}

for (const d of demandes) {
  const entree = { date: maintenant, numero: d.number, titre: d.title, branche: d.headRefName };
  sh("git checkout -q -B essai-fusion origin/main");
  const conflit = controle("fusion avec main", `git merge -q --no-edit origin/${d.headRefName}`);
  if (conflit) {
    sh("git merge --abort || true");
    resultats.push({ ...entree, statut: "laissee-ouverte", raisons: ["conflit avec main : à fusionner à la main"] });
    continue;
  }
  const raisons = [controle("tests", "npm test"), controle("contrôle du code", "npm run lint"), controle("construction du site et liens", "npm run build")].filter(
    (r): r is string => r !== undefined,
  );
  if (raisons.length === 0) {
    sh(`gh pr merge ${d.number} --merge --delete-branch`);
    resultats.push({ ...entree, statut: "fusionnee" });
  } else {
    sh(`gh pr comment ${d.number} --body ${JSON.stringify(`Fusion automatique refusée : ${raisons.join(" ; ")}. La demande reste ouverte.`)}`);
    resultats.push({ ...entree, statut: "laissee-ouverte", raisons });
  }
}

// Journal et récapitulatif, publiés sur main.
sh("git checkout -q main && git pull -q --ff-only origin main");
journal.entrees = [...resultats, ...lire<JournalFusions>("data/fusions-journal.json").entrees].slice(0, 2000);
writeFileSync(new URL("data/fusions-journal.json", RACINE), `${JSON.stringify(journal, null, 2)}\n`, "utf8");
const site = process.env.SITE_URL ?? "https://eco-pedago.vercel.app";
writeFileSync(new URL("RECAPITULATIF.md", RACINE), texteRecapitulatif(lire<JournalResumes>("data/actu-resumes-journal.json"), journal, site, maintenant), "utf8");

console.log(
  demandes.length === 0
    ? "Aucune demande automatique ouverte."
    : resultats.map((r) => `${r.statut === "fusionnee" ? "✓ fusionnée" : "✗ laissée ouverte"} n° ${r.numero} : ${r.titre}${r.raisons ? ` (${r.raisons.join(" ; ")})` : ""}`).join("\n"),
);
