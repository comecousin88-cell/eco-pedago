import { describe, expect, it } from "vitest";
import { glossaire } from "./glossaire";
import { modules, neighbours } from "./modules";

describe("glossaire", () => {
  it("identifiants uniques", () => {
    const ids = glossaire.map((e) => e.id);
    expect(ids.length).toBe(new Set(ids).size);
  });

  it("chaque renvoi « voir aussi » pointe vers un terme existant", () => {
    const ids = new Set(glossaire.map((e) => e.id));
    for (const e of glossaire) {
      for (const v of e.voir ?? []) expect(ids, `${e.id} → ${v}`).toContain(v);
    }
  });
});

describe("modules", () => {
  it("slugs uniques, sections uniques dans chaque module", () => {
    expect(new Set(modules.map((m) => m.slug)).size).toBe(modules.length);
    for (const m of modules) {
      expect(new Set(m.sections.map((s) => s.slug)).size).toBe(m.sections.length);
    }
  });

  it("navigation : la dernière section d'un module mène au module suivant", () => {
    const { next } = neighbours("les-bases", "inflation-taux-reels");
    expect(next?.href).toBe("/modules/deficit-et-dette/");
    expect(neighbours("les-bases").previous).toBeUndefined();
  });
});
