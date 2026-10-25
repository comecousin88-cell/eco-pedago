import { describe, expect, it } from "vitest";
import { estPageProtegee, permisParRobots, textePrincipal } from "./lecture-source";

describe("lecture légale des publications", () => {
  // Extrait du robots.txt de la Cour des comptes : les listes paginées (« ?page= ») sont interdites.
  const robots = `User-agent: *
# Search requests
Disallow: /*?
Allow: /core/*.css$
Disallow: /admin/

User-agent: GPTBot
Disallow: /`;

  it("respecte robots.txt : règle la plus précise, motifs * et $, groupe propre au robot", () => {
    expect(permisParRobots(robots, "/fr/publications/la-situation-financiere-de-la-securite-sociale")).toBe(true);
    expect(permisParRobots(robots, "/fr/publications?page=1")).toBe(false);
    expect(permisParRobots(robots, "/admin/config")).toBe(false);
    expect(permisParRobots(robots, "/core/a.css")).toBe(true);
    expect(permisParRobots(robots, "/x", "GPTBot")).toBe(false);
    expect(permisParRobots("", "/tout")).toBe(true);
  });

  it("reconnaît une page de défi anti-robot, sans chercher à la contourner", () => {
    expect(estPageProtegee("<title>Just a moment...</title><script src='/cdn-cgi/challenge-platform/x'></script>")).toBe(true);
    expect(estPageProtegee("<main><p>Les prix augmentent.</p></main>")).toBe(false);
  });

  it("garde le texte principal, sans menus ni scripts", () => {
    const html = `<header>Menu</header><nav>Accueil</nav><main><h1>Titre</h1><script>x()</script>
      <p>Les prix augmentent de 3,1&nbsp;% sur un an.</p><footer>Pied</footer></main><footer>Bas</footer>`;
    expect(textePrincipal(html)).toBe("Titre\nLes prix augmentent de 3,1\u00a0% sur un an.".replace("\u00a0", " "));
  });
});
