import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { etapeRetour, etapesFil, filModule, type Etape } from "./fil-ariane";
import { modules } from "./modules";

const racine = fileURLToPath(new URL("../../", import.meta.url));
const lire = (f: string) => readFileSync(`${racine}${f}`, "utf8");

function fichiers(dossier: string): string[] {
  return readdirSync(dossier).flatMap((f) => {
    const p = join(dossier, f);
    return statSync(p).isDirectory() ? fichiers(p) : [p];
  });
}

const doublons = (fil: Etape[]) => fil.filter((e, i) => i > 0 && e.label === fil[i - 1].label).map((e) => e.label);

describe("fil d'Ariane", () => {
  it("aucun fil ne contient deux fois le même libellé à la suite : toutes les pages de modules", () => {
    for (const m of modules)
      for (const s of [undefined, ...m.sections.map((x) => x.slug)]) expect(doublons(etapesFil(filModule(m, s))), `${m.slug}/${s ?? ""}`).toEqual([]);
    // « Les bases › Les bases » : la partie et le module ont le même nom, le fil n'en garde qu'un.
    expect(etapesFil(filModule(modules.find((m) => m.slug === "les-bases")!)).map((e) => e.label)).toEqual(["Accueil", "Comprendre", "Les bases"]);
  });

  it("aucun fil ne contient deux fois le même libellé à la suite : toutes les autres pages", () => {
    const usages = fichiers(`${racine}src/app`).filter((f) => f.endsWith(".tsx")).flatMap((f) => {
      const source = readFileSync(f, "utf8");
      return [...source.matchAll(/<FilAriane\s+etapes=\{\[([\s\S]*?)\]\}/g)].map((m) => ({ f, labels: [...m[1].matchAll(/label: "([^"]+)"/g)].map((x) => x[1]) }));
    });
    expect(usages.length).toBeGreaterThan(10);
    for (const u of usages) expect(doublons(etapesFil(u.labels.map((label) => ({ label })))), u.f).toEqual([]);
  });

  it("le bouton de retour dit où il ramène", () => {
    expect(etapeRetour([{ label: "Décrypter", href: "/decrypter/" }, { label: "Les propositions au crible", href: "/propositions/" }, { label: "Une fiche" }])).toEqual({ label: "Toutes les propositions", href: "/propositions/" });
    expect(etapeRetour([{ label: "L'actu", href: "/actu/" }, { label: "Une actu" }])).toEqual({ label: "L'actu", href: "/actu/" });
    expect(etapeRetour([{ label: "Comprendre", href: "/comprendre/" }, { label: "Glossaire" }])).toEqual({ label: "Les 12 modules", href: "/comprendre/" });
    // Une rubrique du menu n'a pas de bouton : l'accueil est juste au-dessus.
    expect(etapeRetour([{ label: "L'actu" }])).toBeUndefined();
    expect(lire("src/components/modules/PageModule.tsx")).toContain('retour={{ label: "Les 12 modules", href: "/comprendre/" }}');
    // Le fil reste affiché en haut de l'écran, en version compacte.
    expect(lire("src/components/modules/FilAriane.tsx")).toMatch(/sticky top-16/);
  });
});

describe("navigation", () => {
  it("le menu « Comprendre » déplie les 12 modules par partie, sur ordinateur et sur mobile", () => {
    const menu = lire("src/components/layout/MainNav.tsx");
    expect(menu).toMatch(/function ListeModules[\s\S]*themes\.map[\s\S]*t\.modules\.map\(getModule\)/);
    expect(menu).toMatch(/<MenuComprendre /);
    expect(menu).toMatch(/onMouseEnter=\{\(\) => setOuvert\(true\)\}/);
    expect(menu).toMatch(/<summary[^>]*>Les 12 modules<\/summary>[\s\S]*<ListeModules/);
  });

  it("dans les modules : sommaire visible à côté du texte sur ordinateur, barre « Précédent · Sommaire · Suivant » sur mobile, qui respecte le verrouillage", () => {
    const page = lire("src/components/modules/PageModule.tsx");
    expect(page).toMatch(/lg:sticky lg:top-32/);
    expect(page).toMatch(/<BarreModuleMobile/);
    const barre = lire("src/components/modules/BarreModuleMobile.tsx");
    expect(barre).toMatch(/lg:hidden/);
    expect(barre).toMatch(/Précédent[\s\S]*Sommaire[\s\S]*Suivant/);
    expect(barre).toMatch(/etats\[i\] === "verrouillee"[\s\S]*<LienVerrouille/);
  });

  it("retour sans perte : position gardée pour chaque page, filtres et recherche gardés", () => {
    expect(lire("src/app/layout.tsx")).toContain("<RetourSansPerte />");
    expect(lire("src/components/layout/RetourSansPerte.tsx")).toMatch(/addEventListener\("popstate"/);
    expect(lire("src/components/propositions/ListePropositions.tsx")).toMatch(/useEtatConserve\("propositions:theme"[\s\S]*useEtatConserve<NiveauVerdict \| "tous">\("propositions:verdict"/);
    expect(lire("src/app/glossaire/GlossaireRecherche.tsx")).toContain('useEtatConserve("glossaire:recherche", "")');
  });
});
