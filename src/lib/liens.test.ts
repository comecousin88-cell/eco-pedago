import { describe, expect, it } from "vitest";
import { existe, liensCasses, liensInternes } from "./liens";

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

  it("signale chaque lien cassé avec la page qui le contient (erreur 404 évitée avant la mise en ligne)", () => {
    const pages = new Map([
      ["index.html", `<a href="/actu/2026-10-15-ipc/">ok</a><a href="/actu/2026-10-16-absente/">cassé</a>`],
      ["actu/index.html", `<a href="/">accueil</a>`],
    ]);
    expect(liensCasses(pages, fichiers)).toEqual(["index.html → /actu/2026-10-16-absente/"]);
  });
});
