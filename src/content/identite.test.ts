import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { jsonLdSite, metadataSite, titreAccueil } from "./metadonnees";
import { pagesDuSite } from "./plan-du-site";
import { site } from "./site";

const racine = fileURLToPath(new URL("../../", import.meta.url));
const lire = (chemin: string) => readFileSync(join(racine, chemin), "utf8");

describe("le nom du site : EcoClair", () => {
  it("figure dans le titre, Open Graph, Twitter et les données structurées", () => {
    expect(site.name).toBe("EcoClair");
    expect(titreAccueil).toContain("EcoClair");
    expect(metadataSite.title).toEqual({ default: titreAccueil, template: "%s · EcoClair" });
    expect(metadataSite.openGraph?.siteName).toBe("EcoClair");
    expect(metadataSite.openGraph?.title).toContain("EcoClair");
    expect(metadataSite.twitter?.title).toContain("EcoClair");
    const types = Object.fromEntries(jsonLdSite["@graph"].map((x) => [x["@type"], x.name]));
    expect(types).toEqual({ WebSite: "EcoClair", Organization: "EcoClair" });
    expect(lire("src/app/layout.tsx")).toContain("application/ld+json");
  });

  it("l'image d'aperçu, l'icône et le manifeste portent le nouveau nom", () => {
    expect(lire("src/app/opengraph-image.tsx")).toContain("site.name");
    expect(lire("src/app/icon.svg")).toContain('aria-label="EcoClair"');
    expect(lire("src/app/manifest.ts")).toContain("name: site.name");
  });

  it("l'ancien nom n'apparaît plus nulle part, sauf la mention historique du plan", () => {
    const ancien = /[ÉéEe]co[ _-]?en[ _-]?clair|ecoenclair/i;
    const trouves: string[] = [];
    const parcourir = (dossier: string) => {
      for (const f of readdirSync(join(racine, dossier))) {
        const p = join(dossier, f);
        if (statSync(join(racine, p)).isDirectory()) parcourir(p);
        else if (/\.(tsx?|mdx|json|md|svg|ya?ml|css)$/.test(f) && ancien.test(lire(p))) trouves.push(relative(".", p).replaceAll("\\", "/"));
      }
    };
    for (const d of ["src", "data", "scripts", "docs", ".github"]) parcourir(d);
    // Ce test contient l'ancien nom dans son motif de recherche.
    expect(trouves.filter((f) => !f.endsWith("identite.test.ts"))).toEqual([]);
    expect(ancien.test(lire("README.md"))).toBe(false);
    const plan = lire("PLAN.md").split("\n").filter((l) => ancien.test(l));
    expect(plan).toEqual([expect.stringContaining("anciennement")]);
  });

  it("aucune adresse ne change : le plan du site reprend toutes les pages publiques", () => {
    const pages = pagesDuSite();
    expect(new Set(pages).size).toBe(pages.length);
    for (const p of ["/", "/tableau-de-bord/", "/glossaire/", "/modules/les-bases/pib/", "/propositions/retraite-a-60-ans/", "/jeux/redresser-les-comptes/"]) {
      expect(pages).toContain(p);
    }
    expect(lire("src/app/robots.ts")).toContain("sitemap.xml");
  });
});

describe("le pied de page", () => {
  it("indique « Créé par Côme Cousin », sans lien", () => {
    const pied = lire("src/components/layout/Footer.tsx");
    expect(pied).toMatch(/<p[^>]*>Créé par Côme Cousin<\/p>/);
  });
});
