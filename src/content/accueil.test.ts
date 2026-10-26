import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { IndicateursCles, INDICATEURS_CLES } from "@/components/indicateurs/IndicateursCles";
import { indicateurs } from "./indicateurs";

const racine = fileURLToPath(new URL("../../", import.meta.url));
const page = readFileSync(`${racine}src/app/page.tsx`, "utf8");

describe("accueil", () => {
  it("quatre blocs seulement, dans l'ordre : phrase et indicateurs, 12 modules, actu, ligne de liens", () => {
    const blocs = [...page.matchAll(/^ {6}<(section|nav)\b[^>]*aria-(?:labelledby|label)="([^"]+)"/gm)].map((m) => m[2]);
    expect(blocs).toEqual(["accueil-titre", "modules", "actu", "Aussi sur le site"]);
    expect(page.indexOf("<IndicateursCles />")).toBeLessThan(page.indexOf("<GrilleModules"));
    expect(page).toContain("dernieresActus(3)");
    expect(page).toContain('href="/actu/"');
  });

  it("plus de doublons : ni fiches au crible, ni portes d'entrée, ni cartes de raccourcis, ni bandeau d'alertes", () => {
    for (const absent of ["CarteProposition", "propositionsPhares", "PORTES", "RACCOURCIS", "BandeauAlertes", "ModuleCard", "CartesParcours"])
      expect(page).not.toContain(absent);
  });

  it("la ligne de liens discrets mène au reste du site", () => {
    const liens = [...page.matchAll(/\{ href: "([^"]+)", label: "([^"]+)" \}/g)].map((m) => m[2]);
    expect(liens).toEqual(["Propositions au crible", "Idées reçues", "La France en 10 chiffres", "Jouer", "Glossaire", "Tableau de bord"]);
  });

  it("les quatre indicateurs clés : dette, déficit, taux à 10 ans, inflation, avec période, tendance et lien vers le tableau de bord", () => {
    expect(INDICATEURS_CLES.map((i) => i.id)).toEqual(["dette", "deficit", "oat10", "inflation"]);
    for (const { id } of INDICATEURS_CLES) expect(indicateurs.some((i) => i.id === id), id).toBe(true);
    const html = renderToStaticMarkup(createElement(IndicateursCles));
    expect(html.match(/<li /g)).toHaveLength(4);
    expect(html).toContain("Tout le tableau de bord");
    expect(html).toMatch(/href="\/tableau-de-bord\/?"/);
    // Le déficit est affiché comme un déficit (positif), pour que la flèche dise son sens.
    expect(html.replace(/<[^>]+>/g, " ")).toMatch(/Déficit public\s+\d/);
    // Chaque indicateur dit sa période et le sens de son évolution.
    for (const li of html.split("<li ").slice(1)) {
      expect(li).toMatch(/\b(19|20)\d\d\b/);
      expect(li).toMatch(/en hausse|en baisse|stable/);
    }
  });
});
