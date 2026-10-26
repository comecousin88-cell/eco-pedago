import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { texteRecapitulatif } from "./recapitulatif";

const racine = fileURLToPath(new URL("../../../", import.meta.url));
const lire = (f: string) => readFileSync(`${racine}${f}`, "utf8");

describe("liens externes cassés : un avertissement, pas un blocage", () => {
  it("seul un lien interne cassé arrête la construction ; un lien externe cassé est écrit pour le récapitulatif", () => {
    const script = lire("scripts/verifier-liens.ts");
    // Une seule cause d'échec : les liens internes.
    expect(script.match(/echec = true/g)).toHaveLength(1);
    expect(script.indexOf("echec = true")).toBeLessThan(script.indexOf("process.env.VERIFIER_LIENS_EXTERNES"));
    expect(script).toContain('new URL("../data/liens-externes.json", import.meta.url)');
    // Le récapitulatif quotidien est réécrit après la construction.
    const workflow = lire(".github/workflows/maj-indicateurs.yml");
    expect(workflow.indexOf("npm run recapitulatif")).toBeGreaterThan(workflow.indexOf("npm run build"));
  });

  it("le récapitulatif liste les liens externes à corriger, avec leur page", () => {
    const texte = texteRecapitulatif({ entrees: [] } as never, { entrees: [] } as never, "https://exemple.fr", "2026-10-27T08:00:00Z", {
      verifie_le: "2026-10-27T07:00:00Z",
      verifies: 120,
      casses: [{ lien: "https://www.exemple.org/page", raison: "page introuvable (HTTP 404)", page: "tableau-de-bord/index.html" }],
      a_verifier: [{ lien: "https://www.aft.gouv.fr/", raison: "accès refusé aux robots (HTTP 403)", page: "sources/index.html" }],
    });
    expect(texte).toContain("## Liens externes à corriger");
    expect(texte).toContain("- ❌ https://www.exemple.org/page : page introuvable (HTTP 404), sur la page [tableau-de-bord/](https://exemple.fr/tableau-de-bord/)");
    expect(texte).toContain("1 lien(s) refusent les robots");
  });
});
