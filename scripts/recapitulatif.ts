/**
 * Réécrit RECAPITULATIF.md à partir des journaux et de la dernière
 * vérification des liens externes (data/liens-externes.json, écrit par la
 * construction du site). Lancé chaque jour après la construction.
 *
 *   npm run recapitulatif
 */
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { texteRecapitulatif, type JournalFusions, type JournalResumes, type LiensExternes } from "../src/lib/actu/recapitulatif.ts";

const RACINE = new URL("../", import.meta.url);
const lire = <T>(f: string): T => JSON.parse(readFileSync(new URL(f, RACINE), "utf8")) as T;
const liens = existsSync(new URL("data/liens-externes.json", RACINE)) ? lire<LiensExternes>("data/liens-externes.json") : undefined;
const site = process.env.SITE_URL ?? "https://eco-pedago.vercel.app";

writeFileSync(
  new URL("RECAPITULATIF.md", RACINE),
  texteRecapitulatif(lire<JournalResumes>("data/actu-resumes-journal.json"), lire<JournalFusions>("data/fusions-journal.json"), site, new Date().toISOString(), liens),
  "utf8",
);
console.log(liens ? `Récapitulatif écrit : ${liens.casses.length} lien(s) externe(s) à corriger.` : "Récapitulatif écrit (pas de vérification des liens externes disponible).");
