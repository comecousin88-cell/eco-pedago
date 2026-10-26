import { readdirSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import type { MDXContent } from "mdx/types";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { texteVisible } from "@/lib/lecture-modes.test";
import { glossaire } from "./glossaire";
import { formesGlossaire, motifTerme } from "./glossaire-formes";
import { PARTIES_FICHE, propositions } from "./propositions";

const racine = fileURLToPath(new URL("../../", import.meta.url));
const lire = (f: string) => readFileSync(`${racine}${f}`, "utf8");
const refondues = propositions.filter((p) => p.refondue && p.contenu);
const mdxDe = (slug: string) => lire(`src/content/propositions/${slug}.mdx`);

/** Partie d'une fiche : du titre « ## … » jusqu'au titre suivant. */
function partie(mdx: string, titre: string): string {
  const debut = mdx.indexOf(`## ${titre}\n`);
  if (debut < 0) return "";
  const suite = mdx.indexOf("\n## ", debut + 3);
  return mdx.slice(debut, suite < 0 ? undefined : suite);
}

/**
 * Texte lisible d'un MDX : sans les imports, sans les chiffres (<Chiffre>,
 * <Calcul>, <DateDonnee>, dont l'unité n'est pas un terme à expliquer), sans
 * les attributs en chaîne (identifiants, résumés de figures) ni les questions
 * de quiz, et sans les balises.
 */
function texteMdx(mdx: string): string {
  return mdx
    .replace(/^import .*$/gm, " ")
    .replace(/<(?:Chiffre|Calcul|DateDonnee)\b[^>]*\/>/g, " ")
    .replace(/questions=\{\[[\s\S]*?\]\}\s*\/>/g, " ")
    .replace(/\b[a-zA-Z]+=(?:"[^"]*"|\{`[\s\S]*?`\}|\{\[(?:"[^"]*",?\s*)*\]\})/g, " ")
    .replace(/<\/?[A-Za-z][A-Za-z0-9]*|\/?>|<\/?>|[{}]/g, " ")
    .replace(/\]\([^)]*\)/g, " ");
}

/** Sources écrites entre parenthèses dans le texte : « (Insee) », « (calcul : Banque de France) »… */
const SOURCE_ENTRE_PARENTHESES = /\((?:[^()]*?)\b(?:calcul|source|Fipeco|Insee|Eurostat|Banque de France|Cour des comptes|Sénat|IPP)\b[^()]*\)/i;

describe("fiches refondues : structure", () => {
  it.each(refondues.map((p) => ({ slug: p.slug, p })))("$slug", ({ p }) => {
    const mdx = mdxDe(p.slug);
    // « En 30 secondes » : la proposition, les trois lignes et le badge du verdict de la fiche.
    expect(partie(mdx, "En 30 secondes")).toMatch(new RegExp(`<En30Secondes\\s+verdict="${p.verdict}"[\\s\\S]*proposition=[\\s\\S]*tient=[\\s\\S]*coince=[\\s\\S]*debattu=`));
    // « Pourquoi on en parle » : deux lignes de contexte, sans composant.
    const pourquoi = partie(mdx, "Pourquoi on en parle").replace(/^## .*\n/, "").trim();
    expect(pourquoi.length).toBeGreaterThan(80);
    expect(pourquoi.length).toBeLessThan(500);
    expect(partie(mdx, "Pour bien suivre cette fiche")).toMatch(/<PourBienSuivre module="[^"]+"/);
    // La proposition et l'idée derrière, puis « Et si on le faisait ? » : mode Approfondi seulement.
    for (const t of PARTIES_FICHE.filter((x) => "approfondi" in x && x.approfondi).map((x) => x.titre)) {
      const i = mdx.indexOf(`## ${t}\n`);
      if (i < 0) continue;
      expect(mdx.lastIndexOf("<EnApprofondi>", i), t).toBeGreaterThan(mdx.lastIndexOf("</EnApprofondi>", i));
    }
    // Comment ça marcherait : le bloc « Pour bien comprendre » et un schéma du mécanisme.
    const comment = partie(mdx, "Comment ça marcherait");
    expect(comment).toContain("<PourBienComprendre");
    expect(comment).toMatch(/<Schema(?:AvantApres|Etapes)\b/);
    // Le débat en dialogue, de trois à cinq phrases de chaque côté.
    const debat = partie(mdx, "Le débat");
    const bulles = [...debat.matchAll(/(partisan|sceptique)=\{<>([\s\S]*?)<\/>\}/g)];
    expect(bulles.map((b) => b[1])).toEqual(["partisan", "sceptique"]);
    for (const [, qui, texte] of bulles) {
      const phrases = texte.replace(/<[^>]+\/>/g, "X").split(/[.!?](?:\s|$)/).filter((x) => x.trim()).length;
      expect(phrases, qui).toBeGreaterThanOrEqual(3);
      expect(phrases, qui).toBeLessThanOrEqual(5);
    }
    // Ordres de grandeur : au moins trois repères concrets, calculés à partir des données.
    const reperes = partie(mdx, "Ordres de grandeur");
    expect((reperes.match(/<Repere /g) ?? []).length).toBeGreaterThanOrEqual(3);
    expect(reperes).toMatch(/par habitant/);
    // Le verdict, court, avec les conditions éventuelles ; puis deux questions de quiz.
    const verdict = partie(mdx, "Le verdict");
    const court = /<Verdict niveau="[^"]+">([\s\S]*?)<\/Verdict>/.exec(verdict)![1];
    expect(court.split(/[.!?](?:\s|$)/).filter((x) => x.trim()).length).toBeLessThanOrEqual(3);
    expect(verdict).toContain(`<Verdict niveau="${p.verdict}">`);
    const quiz = partie(mdx, "Avez-vous compris ?");
    expect((quiz.match(/question: /g) ?? []).length).toBe(2);
    expect(quiz).toMatch(/explication: /);
  });
});

describe("fiches refondues : lisibilité", () => {
  it.each(refondues.map((p) => ({ slug: p.slug })))("aucune source entre parenthèses dans le texte, en Simple comme en Approfondi : $slug", async ({ slug }) => {
    const { default: Fiche } = (await import(`./propositions/${slug}.mdx`)) as { default: MDXContent };
    const html = renderToStaticMarkup(createElement(Fiche));
    for (const mode of ["simple", "approfondi"] as const) {
      const texte = texteVisible(html, mode);
      expect(texte.match(SOURCE_ENTRE_PARENTHESES)?.[0], mode).toBeUndefined();
    }
    // Les sources sont dans les infobulles des chiffres.
    expect(html).toMatch(/role="tooltip"[^>]*>[^<]*Source : /);
  });

  it.each(refondues.map((p) => ({ slug: p.slug })))("chaque terme du glossaire présent ouvre son infobulle : $slug", ({ slug }) => {
    const mdx = mdxDe(slug);
    const texte = texteMdx(mdx);
    const manquants = glossaire.filter((g) => motifTerme(g.id).test(texte) && !mdx.includes(`<Terme id="${g.id}"`)).map((g) => g.id);
    expect(manquants).toEqual([]);
  });

  it("chaque terme du glossaire a ses formes à chercher dans les textes", () => {
    expect(Object.keys(formesGlossaire).sort()).toEqual(glossaire.map((g) => g.id).sort());
    expect(motifTerme("reserves-bancaires").test("les réserves restent dues")).toBe(true);
    expect(motifTerme("repartition").test("la répartition de la dette")).toBe(false);
  });

  it("chaque simulateur a son bouton « Revenir aux chiffres actuels »", async () => {
    const dossiers = ["src/components/simulators", "src/components/graphiques"];
    for (const d of dossiers) {
      for (const f of readdirSync(`${racine}${d}`).filter((x) => x.endsWith(".tsx"))) {
        const source = lire(`${d}/${f}`);
        if (!/useScenario\(/.test(source) || f === "Scenario.tsx") continue;
        expect(source, f).toMatch(/<BarreScenario\b/);
      }
    }
    expect(lire("src/components/simulators/Scenario.tsx")).toMatch(/libelleReference = "chiffres actuels"[\s\S]*Revenir aux \{libelleReference\}/);
    // Dans les fiches refondues, le simulateur part des chiffres actuels.
    for (const p of refondues) {
      const { default: Fiche } = (await import(`./propositions/${p.slug}.mdx`)) as { default: MDXContent };
      const html = renderToStaticMarkup(createElement(Fiche));
      if (mdxDe(p.slug).includes("## Et si on le faisait ?\n")) expect(html, p.slug).toContain("Revenir aux chiffres actuels");
    }
  });
});
