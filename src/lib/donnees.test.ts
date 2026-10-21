/**
 * Contrôle de toutes les données de data/*.json, puis régénération de
 * A_VERIFIER.md à partir des données marquées « a_verifier ».
 * Un chiffre sans source, sans date ou sans unité fait échouer `npm test`.
 */
import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { fichiers, type Donnee } from "./data";
import { mesures } from "./game/mesures";

/** Fichiers de data/ qui n'ont pas le format « donnees » (contrôlés par leurs propres tests). */
const AUTRES_FORMATS = ["mesures-budget", "maj-indicateurs", "agenda"];

const racine = fileURLToPath(new URL("../../", import.meta.url));
const DATE = /^\d{4}(-\d{2}(-\d{2})?)?$/;
const JOUR = /^\d{4}-\d{2}-\d{2}$/;

describe("données", () => {
  it("chaque fichier de data/ est déclaré dans src/lib/data.ts", () => {
    const surDisque = readdirSync(`${racine}data`)
      .filter((f) => f.endsWith(".json"))
      .map((f) => f.replace(/\.json$/, ""))
      .filter((f) => !AUTRES_FORMATS.includes(f))
      .sort();
    expect(Object.keys(fichiers).sort()).toEqual(surDisque);
  });

  const toutes: { fichier: string; d: Donnee }[] = Object.entries(fichiers).flatMap(
    ([fichier, contenu]) => contenu.donnees.map((d) => ({ fichier, d })),
  );

  it("les identifiants sont uniques", () => {
    const ids = toutes.map(({ d }) => d.id);
    expect(ids.length).toBe(new Set(ids).size);
  });

  it.each(toutes.map(({ fichier, d }) => [`${fichier} › ${d.id}`, d] as const))(
    "%s : valeur, unité, date et source présentes",
    (_, d) => {
      expect(d.label.trim()).not.toBe("");
      expect(d.unite.trim()).not.toBe("");
      expect(d.date).toMatch(DATE);
      expect(d.source.nom.trim()).not.toBe("");
      expect(["verifie", "a_verifier", "hypothese"]).toContain(d.statut);
      // Seule une hypothèse peut se passer d'adresse, et elle le dit dans sa note.
      if (d.statut === "hypothese") expect(d.note?.trim()).toBeTruthy();
      else expect(d.source.url).toMatch(/^https:\/\//);

      if ("valeur" in d) {
        expect(Number.isFinite(d.valeur)).toBe(true);
      } else {
        expect(d.serie.length).toBeGreaterThan(0);
        for (const p of d.serie) expect(Number.isFinite(p.y)).toBe(true);
      }

      // Une donnée « vérifiée » cite la page exacte et sa date de consultation.
      if (d.statut === "verifie") {
        expect(new URL(d.source.url!).pathname.length, "URL précise attendue").toBeGreaterThan(1);
        expect(d.consulte_le).toMatch(JOUR);
      }
    },
  );

  it("A_VERIFIER.md est à jour", () => {
    const a = toutes.filter(({ d }) => d.statut === "a_verifier");
    const mesuresAVerifier = mesures.filter((m) => m.statut === "a_verifier");
    const lignes = [
      "# Chiffres à vérifier",
      "",
      "Fichier généré par `npm test` à partir des données marquées `\"statut\": \"a_verifier\"` dans `data/*.json`. Ne pas modifier à la main : corriger la donnée dans son fichier JSON, passer son statut à `verifie`, puis relancer `npm test`.",
      "",
      a.length === 0
        ? "Aucun chiffre en attente de vérification."
        : `${a.length} chiffre${a.length > 1 ? "s" : ""} en attente de vérification, et ${mesuresAVerifier.length} mesure${mesuresAVerifier.length > 1 ? "s" : ""} du jeu « Redresser les comptes ».`,
    ];
    for (const fichier of Object.keys(fichiers)) {
      const duFichier = a.filter((x) => x.fichier === fichier);
      if (duFichier.length === 0) continue;
      lignes.push("", `## data/${fichier}.json`, "");
      lignes.push("| Identifiant | Donnée | Valeur actuelle | Date | Source à consulter | Remarque |");
      lignes.push("|---|---|---|---|---|---|");
      for (const { d } of duFichier) {
        const valeur =
          "valeur" in d
            ? `${d.valeur} ${d.unite}`
            : `série (${d.serie.length} points, ${d.unite})`;
        lignes.push(
          `| \`${d.id}\` | ${d.label} | ${valeur} | ${d.date} | [${d.source.nom}](${d.source.url}) | ${d.note ?? ""} |`,
        );
      }
    }
    if (mesuresAVerifier.length > 0) {
      lignes.push("", "## data/mesures-budget.json (jeu « Redresser les comptes »)", "");
      lignes.push("| Identifiant | Mesure | Rendement bas / central / haut | Source à consulter | Remarque |");
      lignes.push("|---|---|---|---|---|");
      for (const m of mesuresAVerifier) {
        const r = m.rendement;
        lignes.push(
          `| \`${m.id}\` | ${m.intitule} | ${r.bas} / ${r.central} / ${r.haut} Md€ | [${m.source.nom}](${m.source.url}) | ${m.note ?? ""} |`,
        );
      }
    }
    const contenu = `${lignes.join("\n")}\n`;
    writeFileSync(`${racine}A_VERIFIER.md`, contenu, "utf8");
    expect(readFileSync(`${racine}A_VERIFIER.md`, "utf8")).toBe(contenu);
  });
});
