import { describe, expect, it } from "vitest";
import { existe, liensCasses, liensExternes, liensInternes, verdictLien } from "./liens";

describe("liens internes du site construit", () => {
  const fichiers = new Set(["index.html", "actu/index.html", "actu/2026-10-15-ipc/index.html", "icon.svg", "404.html"]);

  it("relève les liens internes, sans ancre, paramètres ni ressources de Next", () => {
    const html = `<a href="/actu/">x</a><a href="/glossaire/#pib">g</a><a href="https://insee.fr/">e</a>
      <img src="/icon.svg"><script src="/_next/static/a.js"></script><a href="/recherche?q=dette">r</a>`;
    expect(liensInternes(html).sort()).toEqual(["/actu/", "/glossaire/", "/icon.svg", "/recherche"].sort());
  });

  it("une page ou un fichier existe, quelle que soit la forme du lien", () => {
    expect(existe("/", fichiers)).toBe(true);
    expect(existe("/actu/", fichiers)).toBe(true);
    expect(existe("/actu", fichiers)).toBe(true);
    expect(existe("/icon.svg", fichiers)).toBe(true);
    expect(existe("/actu/2026-10-16-absente/", fichiers)).toBe(false);
  });

  it("relève les liens externes, sans le site lui-même ni les formulaires « Signaler une erreur »", () => {
    const html = `<a href="https://www.insee.fr/fr/statistiques/9080209">Insee</a><a href="https://eco-pedago.vercel.app/actu/">ici</a>
      <a href="https://github.com/comecousin88-cell/eco-pedago/issues/new?title=x">signaler</a><a href="https://ec.europa.eu/eurostat/x#tableau">E</a>`;
    expect(liensExternes(html)).toEqual(["https://www.insee.fr/fr/statistiques/9080209", "https://ec.europa.eu/eurostat/x"]);
  });

  it("un lien externe est cassé s'il mène à une page introuvable ou à la page d'accueil du site", () => {
    const lien = "https://www.insee.fr/fr/statistiques/9080209";
    expect(verdictLien(lien, 200, lien).etat).toBe("valide");
    expect(verdictLien(lien, 200, "https://www.insee.fr/fr/statistiques/9080209?sommaire=1").etat).toBe("valide");
    expect(verdictLien(lien, 404, lien)).toEqual({ etat: "casse", raison: "page introuvable (HTTP 404)" });
    expect(verdictLien(lien, 200, "https://www.insee.fr/fr/")).toMatchObject({ etat: "casse", raison: expect.stringMatching(/page d'accueil/) });
    expect(verdictLien(lien, 200, "https://www.insee.fr/")).toMatchObject({ etat: "casse" });
    // Un lien qui vise déjà l'accueil n'est pas une redirection fautive.
    expect(verdictLien("https://www.hcfp.fr/", 200, "https://www.hcfp.fr/").etat).toBe("valide");
    // Refus des robots, panne passagère, réseau : signalés, sans bloquer la mise en ligne.
    expect(verdictLien(lien, 403, lien).etat).toBe("avertissement");
    expect(verdictLien(lien, 503, lien).etat).toBe("avertissement");
    expect(verdictLien(lien, 0, lien).etat).toBe("avertissement");
  });

  it("signale chaque lien cassé avec la page qui le contient (erreur 404 évitée avant la mise en ligne)", () => {
    const pages = new Map([
      ["index.html", `<a href="/actu/2026-10-15-ipc/">ok</a><a href="/actu/2026-10-16-absente/">cassé</a>`],
      ["actu/index.html", `<a href="/">accueil</a>`],
    ]);
    expect(liensCasses(pages, fichiers)).toEqual(["index.html → /actu/2026-10-16-absente/"]);
  });
});
