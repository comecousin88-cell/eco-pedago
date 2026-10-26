import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { alertesActives, badgesSeuil, reglesAlertes } from "@/content/alertes";
import { construireFil } from "@/content/actu";
import { indicateurs } from "@/content/indicateurs";
import { BadgesSeuil } from "./BadgesSeuil";
import { CarteIndicateur } from "./CarteIndicateur";
import { IndicateursCles } from "./IndicateursCles";

const racine = fileURLToPath(new URL("../../../", import.meta.url));
const lire = (f: string) => readFileSync(`${racine}${f}`, "utf8");
const texte = (html: string) => html.replace(/<[^>]+>/g, " ").replace(/&#x27;/g, "'").replace(/\s+/g, " ");

describe("badges de seuil sur les cartes d'indicateurs", () => {
  it("chaque règle d'alerte vise un indicateur du tableau de bord, avec un badge court", () => {
    for (const r of reglesAlertes) {
      expect(indicateurs.map((i) => i.id), r.id).toContain(r.indicateur);
      expect(r.badge.split(" ").length, r.badge).toBeLessThanOrEqual(6);
    }
    expect(reglesAlertes.find((r) => r.id === "inflation-3")!.badge).toBe("au-dessus de 3 %");
    expect(reglesAlertes.find((r) => r.id === "france-italie")!.badge).toBe("plus cher que l'Italie");
  });

  it("un badge par seuil franchi en ce moment, sur la carte de son indicateur, avec une infobulle qui explique le seuil", () => {
    const franchies = alertesActives().filter((a) => a.etat === "franchi");
    for (const a of franchies) {
      const r = reglesAlertes.find((x) => x.id === a.id)!;
      const badge = badgesSeuil(r.indicateur).find((b) => b.id === a.id)!;
      expect(badge.libelle).toBe(r.badge);
      expect(badge.explication).toContain(r.seuilEnClair);
      expect(badge.explication).toMatch(/C'est le cas depuis /);
      const html = renderToStaticMarkup(createElement(CarteIndicateur, { indicateur: indicateurs.find((i) => i.id === r.indicateur)! }));
      expect(texte(html)).toContain(r.badge);
      expect(html).toMatch(new RegExp(`aria-describedby="seuil-${r.indicateur}-${a.id}"`));
      expect(html).toMatch(new RegExp(`role="tooltip" id="seuil-${r.indicateur}-${a.id}"`));
    }
    // Pas de badge pour un seuil dont on est revenu.
    for (const a of alertesActives().filter((x) => x.etat === "retour")) {
      const r = reglesAlertes.find((x) => x.id === a.id)!;
      expect(badgesSeuil(r.indicateur).map((b) => b.id)).not.toContain(a.id);
    }
  });

  it("les badges apparaissent aussi sur les quatre indicateurs de l'accueil", () => {
    const html = texte(renderToStaticMarkup(createElement(IndicateursCles)));
    for (const id of ["dette", "oat10", "inflation"]) for (const b of badgesSeuil(id)) expect(html).toContain(b.libelle);
    expect(renderToStaticMarkup(createElement(BadgesSeuil, { indicateur: "deficit" }))).toBe("");
  });

  it("plus de bandeau « Actualité des indicateurs » ; les seuils restent des actus datées du fil", () => {
    for (const f of ["src/app/page.tsx", "src/app/actu/page.tsx", "src/app/tableau-de-bord/page.tsx"]) {
      expect(lire(f), f).not.toMatch(/BandeauAlertes|Actualité des indicateurs/);
    }
    const fil = construireFil();
    for (const a of alertesActives()) expect(fil.some((e) => e.type === "alerte" && e.id.startsWith(`alerte-${a.id}-`)), a.id).toBe(true);
  });

  it("le lien vers les derniers taux de l'État est sous la carte du taux à 10 ans, dans le tableau de bord", () => {
    const page = lire("src/app/tableau-de-bord/page.tsx");
    expect(page).toMatch(/<CarteIndicateur indicateur=\{i\} \/>\s*\{i\.id === "oat10" && \(\s*<a href=\{LIEN_TAUX_ETAT\}[\s\S]*?Voir les derniers taux de l’État sur le site de l’Agence France Trésor/);
    expect(lire("src/components/indicateurs/CarteIndicateur.tsx")).not.toContain("LIEN_TAUX_ETAT");
  });
});
