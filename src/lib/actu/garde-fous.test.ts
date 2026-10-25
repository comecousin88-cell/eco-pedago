import { describe, expect, it } from "vitest";
import { chiffresAbsents, mentionsAbsentes, nombres, problemesDeFormat, raisonsDeRejet, type ResumeGenere } from "./garde-fous";

const source = `En septembre 2026, l'indice des prix à la consommation (IPC) se replie de 0,3 % sur un mois.
Sur un an, les prix à la consommation augmentent de 3,1 % en septembre 2026, après +2,4 % en août.
La hausse de l'inflation s'explique par la nouvelle accélération des prix de l'énergie (+21,3 % après +16,7 % en août).
L'inflation sous-jacente s'établit à +1,5 % en septembre 2026. Un salarié gagne en moyenne 2\u00a0797 euros net par mois.`;

const bon: ResumeGenere = {
  en_bref: [
    "Sur un an, les prix à la consommation augmentent de 3,1 % en septembre 2026, après 2,4 % en août.",
    "La hausse vient surtout de l'énergie, dont les prix augmentent de 21,3 % sur un an.",
    "L'inflation sous-jacente, qui écarte les prix les plus volatils, est plus basse : 1,5 %.",
  ],
  ce_que_ca_veut_dire:
    "L'inflation remonte surtout à cause de l'énergie. Pour les finances publiques, la hausse des prix augmente certaines recettes, comme la TVA, mais aussi les dépenses indexées sur les prix.",
};

describe("garde-fous des résumés automatiques", () => {
  it("publie un résumé fidèle : bon format, chiffres présents dans la source, aucune mention extérieure", () => {
    expect(raisonsDeRejet(bon, source)).toEqual([]);
  });

  it("compare les chiffres tels qu'écrits, quelle que soit la typographie", () => {
    expect(nombres("2\u00a0797 euros, 3,1 %, 3.0%, +16,7 % et 2026")).toEqual(["2797", "3,1", "3,0", "16,7", "2026"]);
    expect(chiffresAbsents({ ...bon, en_bref: ["Un salarié gagne 2 797 euros.", ...bon.en_bref.slice(1)] }, source)).toEqual([]);
    expect(chiffresAbsents({ ...bon, en_bref: ["Eurostat : inflation à 3.1% sur un an.", ...bon.en_bref.slice(1)] }, source)).toEqual([]);
  });

  it("rejette un chiffre absent de la source, même légèrement arrondi ou recalculé", () => {
    const arrondi = { ...bon, en_bref: ["Les prix augmentent de 3 % sur un an en septembre 2026, après 2,4 % en août.", ...bon.en_bref.slice(1)] };
    expect(raisonsDeRejet(arrondi, source)).toContain("chiffre « 3 » absent de la publication source");
    const calcule = { ...bon, ce_que_ca_veut_dire: `${bon.ce_que_ca_veut_dire} L'écart avec août est de 0,7 point.` };
    expect(raisonsDeRejet(calcule, source)).toContain("chiffre « 0,7 » absent de la publication source");
  });

  it("rejette un résumé au mauvais format", () => {
    expect(problemesDeFormat({ en_bref: bon.en_bref.slice(0, 2), ce_que_ca_veut_dire: bon.ce_que_ca_veut_dire })).toContain("« En bref » doit compter 3 points (2)");
    expect(problemesDeFormat({ en_bref: ["- **Point** en liste.", ...bon.en_bref.slice(1)], ce_que_ca_veut_dire: bon.ce_que_ca_veut_dire })).toContain(
      "point 1 : liste ou mise en forme Markdown",
    );
    expect(problemesDeFormat({ ...bon, ce_que_ca_veut_dire: `${bon.ce_que_ca_veut_dire}\nSecond paragraphe.` })).toContain(
      "« Ce que ça veut dire » : retour à la ligne (un seul paragraphe attendu)",
    );
    expect(problemesDeFormat({ ...bon, ce_que_ca_veut_dire: "Trop court." })[0]).toMatch(/caractères/);
    expect(problemesDeFormat({ ...bon, en_bref: [...bon.en_bref.slice(0, 2), "Phrase sans fin"] })).toContain("point 3 : phrase inachevée");
    expect(raisonsDeRejet({ resume: "texte libre" }, source)).toEqual(["structure attendue : en_bref (3 points) et ce_que_ca_veut_dire"]);
    expect(raisonsDeRejet(null, source)).toHaveLength(1);
  });

  it("rejette un parti, une personne ou une opinion absents de la source", () => {
    const parti = { ...bon, ce_que_ca_veut_dire: `${bon.ce_que_ca_veut_dire} Le Rassemblement national et LFI réagissent.` };
    expect(mentionsAbsentes(parti, source)).toEqual(expect.arrayContaining(["nom propre « Rassemblement »", "nom propre « LFI »"]));
    const personne = { ...bon, en_bref: ["Selon Christine Lagarde, la hausse des prix atteint 3,1 % sur un an.", ...bon.en_bref.slice(1)] };
    expect(mentionsAbsentes(personne, source)).toEqual(expect.arrayContaining(["nom propre « Christine »", "nom propre « Lagarde »"]));
    const opinion = { ...bon, ce_que_ca_veut_dire: `Malheureusement, ${bon.ce_que_ca_veut_dire.charAt(0).toLowerCase()}${bon.ce_que_ca_veut_dire.slice(1)} Il faut agir.` };
    expect(mentionsAbsentes(opinion, source)).toEqual(expect.arrayContaining(["formule d'opinion ou de prédiction « malheureusement »", "formule d'opinion ou de prédiction « il faut »"]));
    const prediction = { ...bon, ce_que_ca_veut_dire: `${bon.ce_que_ca_veut_dire} L'inflation devrait baisser l'an prochain.` };
    expect(mentionsAbsentes(prediction, source)).toContain("formule d'opinion ou de prédiction « devrait »");
    // Une prévision citée par la source, ou une institution courante, reste permise.
    expect(mentionsAbsentes({ ...bon, ce_que_ca_veut_dire: `${bon.ce_que_ca_veut_dire} La BCE suit ces chiffres.` }, source)).toEqual([]);
    expect(mentionsAbsentes(prediction, `${source} Le Gouvernement prévoit que l'inflation devrait baisser.`)).toEqual([]);
  });
});
