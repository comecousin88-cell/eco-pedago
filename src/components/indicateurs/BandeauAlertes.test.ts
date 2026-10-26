import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { alertesActives } from "@/content/alertes";
import { BandeauAlertes } from "./BandeauAlertes";

describe("bandeau « Actualité des indicateurs »", () => {
  const html = renderToStaticMarkup(createElement(BandeauAlertes)).replace(/&#x27;/g, "'");
  const texte = html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ");

  it("distingue la date des données et la date de vérification", () => {
    expect(texte).toMatch(/Dernières données publiées · vérifié le \d{1,2} \p{L}+ \d{4}/u);
    expect(texte).not.toMatch(/ au \d{1,2} \p{L}+ \d{4}/u);
  });

  it("chaque ligne dit la période de son chiffre", () => {
    const lignes = [...html.matchAll(/<li>([\s\S]*?)<\/li>/g)].map((m) => m[1].replace(/<[^>]+>/g, ""));
    expect(lignes.length).toBe(alertesActives().length);
    for (const l of lignes) expect(l).toMatch(/^(En moyenne sur \p{L}+ \d{4}|En \p{L}+ \d{4}|Au \d+(er|e) trimestre \d{4}|Fin (\p{L}+ )?\d{4}|Le \d+(er)? \p{L}+ \d{4}), /u);
    // Un taux de marché mensuel est dit « en moyenne ».
    for (const l of lignes.filter((x) => /emprunte à 10 ans/.test(x) && !/^Le /.test(x))) expect(l).toMatch(/^En moyenne sur /);
  });

  it("style neutre et informatif (pas l'orange d'avertissement), lien vers le taux du jour", () => {
    expect(html).not.toMatch(/warn/);
    expect(html).toMatch(/bg-accent-soft/);
    expect(html).toContain("<svg");
    if (/emprunte à 10 ans|écart de taux/.test(texte)) expect(texte).toContain("Voir le taux du jour sur le site de la Banque de France");
  });
});
