import { describe, expect, it } from "vitest";
import { SOURCES_FLUX } from "./flux";
import { extraireResume, LICENCES, licenceDe, listeBce, raisonNonReprise, trouverDansListeBce, versionFrancaiseBce } from "./resume-officiel";

describe("résumés officiels repris tels quels", () => {
  it("chaque source du fil a sa licence vérifiée, et seules les licences ouvertes ou équivalentes permettent la reprise", () => {
    for (const s of SOURCES_FLUX) for (const url of s.urls) expect(licenceDe(url), url).toBeDefined();
    expect(raisonNonReprise("https://www.insee.fr/fr/statistiques/9080209")).toBeUndefined();
    expect(raisonNonReprise("https://www.ccomptes.fr/fr/publications/x")).toBeUndefined();
    expect(raisonNonReprise("https://www.banque-france.fr/fr/communiques-de-presse/x")).toMatch(/^licence/);
    expect(raisonNonReprise("https://www.assemblee-nationale.fr/dyn/x")).toMatch(/usage personnel/);
    expect(raisonNonReprise("https://exemple.fr/x")).toBe("licence du site non vérifiée");
    for (const l of Object.values(LICENCES)) expect(l.url).toMatch(/^https:\/\//);
  });

  it("Eurostat : résumés en anglais, non affichés (titre traduit seulement)", () => {
    expect(raisonNonReprise("https://ec.europa.eu/eurostat/web/products-euro-indicators/w/2-21102026-ap")).toMatch(/anglais/);
    expect(extraireResume("https://ec.europa.eu/eurostat/x", "<h2>Overview</h2><p>In the euro area the deficit was 3.0% of GDP in 2025, unchanged.</p>")).toBeUndefined();
  });

  it("Insee : le chapô, sinon le premier paragraphe de la publication", () => {
    const chapo = `<div class="chapeau"><p class="paragraphe-chapeau ">En&nbsp;2025, un salarié du secteur privé gagne en moyenne 2&nbsp;797&nbsp;euros net par mois.</p>
      <p class="paragraphe-chapeau ">La moitié des salariés perçoit moins de 2&nbsp;238&nbsp;euros net par mois en EQTP.</p></div><div class="corps-publication"><p class="paragraphe ">Suite.</p></div>`;
    expect(extraireResume("https://www.insee.fr/fr/statistiques/1", chapo)).toEqual([
      "En 2025, un salarié du secteur privé gagne en moyenne 2 797 euros net par mois.",
      "La moitié des salariés perçoit moins de 2 238 euros net par mois en EQTP.",
    ]);
    const ir = `<div class="chapeau"></div><div class="corps-publication"><h2>Évolution</h2><div class="bloc paragraphes "><p class="paragraphe ">En septembre 2026, l'indice des prix à la consommation se replie de 0,3 % sur un mois.</p><p class="paragraphe ">Deuxième paragraphe.</p></div></div>`;
    expect(extraireResume("https://www.insee.fr/fr/statistiques/2", ir)).toEqual(["En septembre 2026, l'indice des prix à la consommation se replie de 0,3 % sur un mois."]);
  });

  it("Cour des comptes : le résumé en entier, jamais raccourci", () => {
    const long = "Phrase du résumé de la Cour, reprise mot pour mot sans aucune coupe. ".repeat(40).trim();
    const html = `<div class="teaser-text shareSelected"><p>${long}&nbsp;<br>Deuxième paragraphe du résumé, lui aussi repris en entier.<br>Troisième.</p></div>`;
    const r = extraireResume("https://www.ccomptes.fr/fr/publications/x", html)!;
    expect(r[0]).toBe(long);
    expect(r[1]).toBe("Deuxième paragraphe du résumé, lui aussi repris en entier.");
    expect(r.join(" ").length).toBeGreaterThan(2500);
    // Sans le bloc affiché : la description complète des métadonnées.
    expect(extraireResume("https://www.ccomptes.fr/fr/publications/y", `<script type="application/ld+json">{"description": "${long}"}</script>`)).toEqual([long]);
  });

  it("Haut Conseil et Sénat : le chapô ou « Le résumé », sans les renvois de navigation", () => {
    const hcfp = `<div class="clearfix text-formatted field field--name-field-chapo field--type-text-long"><p>Le Haut Conseil des finances publiques a été saisi le 18 septembre 2026 des prévisions du Gouvernement.<br><br>Retrouvez les auditions parlementaires à <a href="#">l'Assemblée</a>.</p></div>`;
    expect(extraireResume("https://www.hcfp.fr/liste-avis/x", hcfp)).toEqual(["Le Haut Conseil des finances publiques a été saisi le 18 septembre 2026 des prévisions du Gouvernement."]);
    const senat = `<section class="section"><h2>Le r&eacute;sum&eacute;</h2><p align="justify">La commission des finances a rendu un avis favorable à ce projet de décret d'avance.</p><p><a href="/rap">Consulter le rapport</a></p></section>`;
    expect(extraireResume("https://www.senat.fr/notice-rapport/2026/r26-077-notice.html", senat)).toEqual([
      "La commission des finances a rendu un avis favorable à ce projet de décret d'avance.",
    ]);
  });

  it("BCE : le paragraphe d'introduction de la version française, jamais une page restée en anglais", () => {
    expect(listeBce("Décisions de politique monétaire", "2026-09-10T00:00:00Z")).toEqual({
      liste: "https://www.ecb.europa.eu/press/govcdec/mopo/2026/html/index_include.en.html",
      prefixe: "ecb.mp260910",
    });
    expect(listeBce("Compte rendu de la réunion de politique monétaire du Conseil des gouverneurs", "2026-10-08")?.prefixe).toBe("ecb.mg261008");
    expect(listeBce("L'outil de suivi des salaires de la BCE", "2026-09-16")).toBeUndefined();
    const liste = `<a href="/press/pr/date/2026/html/ecb.mp260723~aaaa.en.html">x</a><a href="/press/pr/date/2026/html/ecb.mp260910~314e508016.en.html">y</a>`;
    expect(trouverDansListeBce(liste, "ecb.mp260910")).toBe("https://www.ecb.europa.eu/press/pr/date/2026/html/ecb.mp260910~314e508016.fr.html");
    expect(trouverDansListeBce(liste, "ecb.mp261029")).toBeUndefined();
    expect(versionFrancaiseBce("https://www.ecb.europa.eu/press/pr/date/2026/html/ecb.pr261023~a3d201c97c.en.html")).toMatch(/\.fr\.html$/);
    const page = `<div class="section">Recherche</div><main><div class="section"><p class="ecb-publicationDate">10 septembre 2026</p>
      <p>Le Conseil des gouverneurs a décidé, ce jour, d'augmenter les trois taux d'intérêt directeurs de la BCE de 25 points de base.</p><p>Suite.</p></div></main>`;
    const lien = "https://www.ecb.europa.eu/press/pr/date/2026/html/ecb.mp260910~314e508016.fr.html";
    expect(extraireResume(lien, page)).toEqual(["Le Conseil des gouverneurs a décidé, ce jour, d'augmenter les trois taux d'intérêt directeurs de la BCE de 25 points de base."]);
    expect(extraireResume(lien, page.replace("<main>", '<main><div id="language-not-available">Pas disponible en français</div>'))).toBeUndefined();
    expect(extraireResume(lien.replace(".fr.html", ".en.html"), page)).toBeUndefined();
  });

  it("sans résumé reconnaissable, rien n'est repris", () => {
    expect(extraireResume("https://www.insee.fr/fr/statistiques/3", "<main><p>Court.</p></main>")).toBeUndefined();
  });
});
