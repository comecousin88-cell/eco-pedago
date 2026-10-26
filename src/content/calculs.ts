import { getDonnee } from "@/lib/data";
import { deficitStabilisant, effortStabilisation } from "@/lib/economics";
import { formatNombre } from "@/lib/format";

/**
 * Valeurs calculées à partir de data/*.json, pour que les textes n'écrivent
 * aucun chiffre en dur : quand une donnée est mise à jour, tous les calculs
 * qui en dépendent suivent. Dans un texte : <Calcul id="calc.dette-par-habitant" arrondi={1000} />.
 * Dans un attribut (résumé de figure) : texteCalcul("calc.dette-par-habitant", { arrondi: 1000 }).
 */

/** Lit une donnée : une valeur, un point d'une série, ou le dernier point d'une série. */
export function lire(id: string, x?: string): number {
  const d = getDonnee(id);
  if ("valeur" in d) return d.valeur;
  const p = x === undefined ? d.serie[d.serie.length - 1] : d.serie.find((q) => q.x === x);
  if (!p) throw new Error(`${id} : point « ${x} » absent`);
  return p.y;
}

export interface DefCalcul {
  label: string;
  unite: string;
  decimales: number;
  /** Données utilisées, pour la source affichée au survol. */
  donnees: string[];
  /** Le calcul en clair, affiché au survol. */
  explication: string;
  formule: () => number;
}

/** Déficit qui stabilise la dette, calculé comme dans le simulateur : dette × g / (1 + g). */
const stabilisant = () => deficitStabilisant(lire("dette.fin-annee-pib"), lire("macro.croissance-valeur") / 100);
const ecartStabilisant = () => Math.max(0, lire("deficit.ratio-pib") - stabilisant());
const ecart3 = () => lire("deficit.ratio-pib") - lire("ue.seuils", "déficit");

export const calculs: Record<string, DefCalcul> = {
  "calc.dette-par-habitant": {
    label: "Dette publique par habitant",
    unite: "€",
    decimales: 0,
    donnees: ["dette.stock", "pop.france"],
    explication: "dette publique ÷ population",
    formule: () => (lire("dette.stock") * 1000) / lire("pop.france"),
  },
  "calc.interets-par-habitant": {
    label: "Intérêts de la dette par habitant et par an",
    unite: "€",
    decimales: 0,
    donnees: ["fp.interets", "pop.france"],
    explication: "intérêts versés en un an ÷ population",
    formule: () => (lire("fp.interets") * 1000) / lire("pop.france"),
  },
  "calc.dette-annees-recettes": {
    label: "Dette en années de recettes publiques",
    unite: "ans",
    decimales: 1,
    donnees: ["dette.stock", "fp.recettes"],
    explication: "dette publique ÷ recettes publiques d'une année",
    formule: () => lire("dette.stock") / lire("fp.recettes"),
  },
  "calc.dette-mois-pib": {
    label: "Dette en mois de production",
    unite: "mois",
    decimales: 0,
    donnees: ["dette.stock", "macro.pib"],
    explication: "dette publique ÷ PIB annuel × 12",
    formule: () => (lire("dette.stock") / lire("macro.pib")) * 12,
  },
  "calc.part-etat-dette": {
    label: "Part de l'État dans la dette publique",
    unite: "%",
    decimales: 0,
    donnees: ["dette.par-sous-secteur"],
    explication: "dette de l'État ÷ total des contributions par administration",
    formule: () => {
      const d = getDonnee("dette.par-sous-secteur");
      if (!("serie" in d)) throw new Error("dette.par-sous-secteur doit être une série");
      return (lire("dette.par-sous-secteur", "État") / d.serie.reduce((t, p) => t + p.y, 0)) * 100;
    },
  },
  "calc.taux-apparent": {
    label: "Taux d'intérêt apparent de la dette",
    unite: "%",
    decimales: 1,
    donnees: ["fp.interets", "dette.fin-annee"],
    explication: "intérêts versés dans l'année ÷ dette en fin d'année",
    formule: () => (lire("fp.interets") / lire("dette.fin-annee")) * 100,
  },
  "calc.solde-stabilisant-simplifie": {
    label: "Déficit qui stabilise la dette (approximation g × d)",
    unite: "% du PIB",
    decimales: 1,
    donnees: ["dette.ratio-pib", "macro.croissance-valeur"],
    explication: "dette en % du PIB × croissance nominale",
    formule: () => (lire("dette.ratio-pib") * lire("macro.croissance-valeur")) / 100,
  },
  "calc.deficit-stabilisant": {
    label: "Déficit qui stabilise la dette",
    unite: "% du PIB",
    decimales: 1,
    donnees: ["dette.fin-annee-pib", "macro.croissance-valeur"],
    explication: "dette en % du PIB × g / (1 + g), g étant la croissance nominale",
    formule: stabilisant,
  },
  "calc.effort-stabilisation-points": {
    label: "Baisse du déficit nécessaire pour stabiliser la dette",
    unite: "points de PIB",
    decimales: 1,
    donnees: ["deficit.ratio-pib", "dette.fin-annee-pib", "macro.croissance-valeur"],
    explication: "déficit actuel − déficit qui stabilise la dette",
    formule: ecartStabilisant,
  },
  "calc.effort-stabilisation-md": {
    label: "Baisse du déficit nécessaire pour stabiliser la dette, en euros",
    unite: "Md€",
    decimales: 0,
    donnees: ["deficit.ratio-pib", "dette.fin-annee-pib", "macro.croissance-valeur", "macro.pib"],
    explication: "(déficit actuel − déficit qui stabilise la dette) × PIB",
    formule: () => effortStabilisation(lire("deficit.ratio-pib"), stabilisant(), lire("macro.pib")),
  },
  "calc.effort-3pct-points": {
    label: "Baisse du déficit nécessaire pour revenir à 3 % du PIB",
    unite: "points de PIB",
    decimales: 1,
    donnees: ["deficit.ratio-pib", "ue.seuils"],
    explication: "déficit actuel − repère européen de 3 %",
    formule: ecart3,
  },
  "calc.effort-3pct-md": {
    label: "Baisse du déficit nécessaire pour revenir à 3 % du PIB, en euros",
    unite: "Md€",
    decimales: 0,
    donnees: ["deficit.ratio-pib", "ue.seuils", "macro.pib"],
    explication: "(déficit actuel − 3 %) × PIB",
    formule: () => (ecart3() * lire("macro.pib")) / 100,
  },
  "calc.bdf-part-dette": {
    label: "Part de la dette publique détenue par la Banque de France (politique monétaire)",
    unite: "%",
    decimales: 0,
    donnees: ["bdf.titres-politique-monetaire", "dette.stock"],
    explication: "titres publics détenus par la Banque de France ÷ dette publique",
    formule: () => (lire("bdf.titres-politique-monetaire") / lire("dette.stock")) * 100,
  },
  "calc.eurosysteme-titres-france": {
    label: "Titres publics français détenus par l'Eurosystème (PSPP et PEPP)",
    unite: "Md€",
    decimales: 0,
    donnees: ["bce.pspp-france", "bce.pepp-france"],
    explication: "programme PSPP + programme PEPP",
    formule: () => lire("bce.pspp-france") + lire("bce.pepp-france"),
  },
  "calc.eurosysteme-part-dette": {
    label: "Part de la dette publique détenue par l'Eurosystème",
    unite: "%",
    decimales: 0,
    donnees: ["bce.pspp-france", "bce.pepp-france", "dette.stock"],
    explication: "(PSPP + PEPP) ÷ dette publique",
    formule: () => ((lire("bce.pspp-france") + lire("bce.pepp-france")) / lire("dette.stock")) * 100,
  },
  "calc.bdf-part-pib": {
    label: "Titres publics détenus par la Banque de France, en points de PIB",
    unite: "points de PIB",
    decimales: 0,
    donnees: ["bdf.titres-politique-monetaire", "macro.pib"],
    explication: "titres détenus ÷ PIB",
    formule: () => (lire("bdf.titres-politique-monetaire") / lire("macro.pib")) * 100,
  },
  "calc.frigo-gain-brut": {
    label: "Intérêts que l'État ne paierait plus sur les titres de la Banque de France (gain brut)",
    unite: "Md€",
    decimales: 1,
    donnees: ["bdf.titres-politique-monetaire", "bdf.rendement-titres-pm"],
    explication: "titres détenus × rendement moyen de ces titres",
    formule: () => (lire("bdf.titres-politique-monetaire") * lire("bdf.rendement-titres-pm")) / 100,
  },
  "calc.pspp-part-dette-2021": {
    label: "Titres publics français achetés au titre du PSPP, rapportés à la dette, fin 2021",
    unite: "%",
    decimales: 0,
    donnees: ["bce.pspp-france", "dette.historique-md"],
    explication: "encours PSPP fin 2021 ÷ dette publique fin 2021",
    formule: () => (lire("bce.pspp-france", "2021-12") / lire("dette.historique-md", "2021")) * 100,
  },
  "calc.prime-risque-premiere-annee": {
    label: "Coût la première année d'une prime de risque d'un demi-point",
    unite: "Md€",
    decimales: 1,
    donnees: ["aft.programme-emissions"],
    explication: "programme d'émissions de l'année × 0,5 point",
    formule: () => lire("aft.programme-emissions") * 0.005,
  },
  "calc.retraite60-ecart-age": {
    label: "Écart entre l'âge légal actuel et 60 ans",
    unite: "ans",
    decimales: 1,
    donnees: ["prop.age-legal-suspendu"],
    explication: "âge légal actuel − 60 ans",
    formule: () => lire("prop.age-legal-suspendu") - 60,
  },
  "calc.retraite60-cout-age-actuel": {
    label: "Coût d'un retour à 60 ans depuis l'âge légal actuel (âge seul)",
    unite: "Md€",
    decimales: 0,
    donnees: ["prop.age-legal-suspendu", "prop.retraites-un-an-plus-tot"],
    explication: "(âge légal actuel − 60 ans) × coût d'une année d'avance selon la Cour des comptes",
    formule: () => (lire("prop.age-legal-suspendu") - 60) * lire("prop.retraites-un-an-plus-tot"),
  },
  "calc.retraite60-cout-age-64": {
    label: "Coût d'un retour à 60 ans par rapport à la cible de 64 ans (âge seul)",
    unite: "Md€",
    decimales: 0,
    donnees: ["prop.retraites-un-an-plus-tot"],
    explication: "4 années d'avance × coût d'une année selon la Cour des comptes",
    formule: () => 4 * lire("prop.retraites-un-an-plus-tot"),
  },
  "calc.duree-assurance-annees": {
    label: "Durée d'assurance requise, en années",
    unite: "ans",
    decimales: 1,
    donnees: ["prop.duree-assurance-1964"],
    explication: "trimestres requis ÷ 4",
    formule: () => lire("prop.duree-assurance-1964") / 4,
  },
  "calc.retraite60-fourchette-pib-bas": {
    label: "Bas de la fourchette de coût, en points de PIB",
    unite: "point de PIB",
    decimales: 1,
    donnees: ["prop.retraite-60-fourchette", "macro.pib"],
    explication: "bas de la fourchette ÷ PIB",
    formule: () => (lire("prop.retraite-60-fourchette", "bas") / lire("macro.pib")) * 100,
  },
  "calc.retraite60-fourchette-pib-haut": {
    label: "Haut de la fourchette de coût, en points de PIB",
    unite: "point de PIB",
    decimales: 1,
    donnees: ["prop.retraite-60-fourchette", "macro.pib"],
    explication: "haut de la fourchette ÷ PIB",
    formule: () => (lire("prop.retraite-60-fourchette", "haut") / lire("macro.pib")) * 100,
  },
  "calc.pertes-banques-centrales-2024": {
    label: "Pertes 2024 de la Bundesbank, de la BCE et de la Banque de France, avant reprise sur provisions",
    unite: "Md€",
    decimales: 0,
    donnees: ["bc.resultats-2024"],
    explication: "somme des pertes des trois banques centrales",
    formule: () => -(lire("bc.resultats-2024", "Bundesbank (Allemagne)") + lire("bc.resultats-2024", "BCE") + lire("bc.resultats-2024", "Banque de France")),
  },
  "calc.tva-deux-points": {
    label: "Rendement de deux points de taux normal de TVA",
    unite: "Md€",
    decimales: 0,
    donnees: ["prop.tva-point"],
    explication: "2 × rendement d'un point de taux normal",
    formule: () => 2 * lire("prop.tva-point"),
  },
  "calc.point-de-pib": {
    label: "Un point de PIB",
    unite: "Md€",
    decimales: 0,
    donnees: ["macro.pib"],
    explication: "PIB ÷ 100",
    formule: () => lire("macro.pib") / 100,
  },
  "calc.capitalisation-10pct": {
    label: "10 % des dépenses de retraite",
    unite: "Md€",
    decimales: 0,
    donnees: ["retraites.depenses-montant"],
    explication: "dépenses de retraite × 10 %",
    formule: () => lire("retraites.depenses-montant") / 10,
  },
  "calc.grandes-fortunes-part-pib": {
    label: "Patrimoine des plus grandes fortunes rapporté au PIB",
    unite: "%",
    decimales: 0,
    donnees: ["prop.grandes-fortunes-patrimoine", "macro.pib"],
    explication: "patrimoine des grandes fortunes ÷ PIB",
    formule: () => (lire("prop.grandes-fortunes-patrimoine") / lire("macro.pib")) * 100,
  },
  "calc.programme-annees-epuisement": {
    label: "Années avant d'épuiser le patrimoine des grandes fortunes",
    unite: "ans",
    decimales: 0,
    donnees: ["prop.grandes-fortunes-patrimoine", "prop.programme-depenses"],
    explication: "patrimoine des grandes fortunes ÷ programme annuel",
    formule: () => lire("prop.grandes-fortunes-patrimoine") / lire("prop.programme-depenses"),
  },
  "calc.patrimoine-annees-deficit": {
    label: "Années de déficit couvertes par le patrimoine des grandes fortunes",
    unite: "ans",
    decimales: 0,
    donnees: ["prop.grandes-fortunes-patrimoine", "deficit.montant"],
    explication: "patrimoine des grandes fortunes ÷ déficit public annuel",
    formule: () => lire("prop.grandes-fortunes-patrimoine") / lire("deficit.montant"),
  },
  "calc.impot-plancher-part-deficit": {
    label: "Rendement haut de l'impôt plancher rapporté au déficit",
    unite: "%",
    decimales: 0,
    donnees: ["prop.impot-plancher-rendements", "deficit.montant"],
    explication: "estimation haute des promoteurs ÷ déficit public",
    formule: () => (lire("prop.impot-plancher-rendements", "Estimation de ses promoteurs (haut)") / lire("deficit.montant")) * 100,
  },
  "calc.programme-part-patrimoine": {
    label: "Programme de dépenses rapporté au patrimoine des plus grandes fortunes",
    unite: "%",
    decimales: 0,
    donnees: ["prop.programme-depenses", "prop.grandes-fortunes-patrimoine"],
    explication: "programme annuel ÷ patrimoine des grandes fortunes",
    formule: () => (lire("prop.programme-depenses") / lire("prop.grandes-fortunes-patrimoine")) * 100,
  },
  // Repères des fiches « Propositions au crible » : chaque montant traduit en ordres de grandeur concrets.
  "calc.bdf-titres-par-habitant": {
    label: "Titres publics détenus par la Banque de France, par habitant",
    unite: "€",
    decimales: 0,
    donnees: ["bdf.titres-politique-monetaire", "pop.france"],
    explication: "titres détenus ÷ population",
    formule: () => (lire("bdf.titres-politique-monetaire") * 1000) / lire("pop.france"),
  },
  "calc.frigo-gain-par-habitant": {
    label: "Intérêts versés à la Banque de France sur ces titres, par habitant et par an",
    unite: "€",
    decimales: 0,
    donnees: ["bdf.titres-politique-monetaire", "bdf.rendement-titres-pm", "pop.france"],
    explication: "titres détenus × rendement moyen ÷ population",
    formule: () => (lire("bdf.titres-politique-monetaire") * lire("bdf.rendement-titres-pm") * 10) / lire("pop.france"),
  },
  "calc.frigo-gain-jours-interets": {
    label: "Intérêts versés à la Banque de France sur ces titres, en jours d'intérêts de toute la dette publique",
    unite: "jours",
    decimales: 0,
    donnees: ["bdf.titres-politique-monetaire", "bdf.rendement-titres-pm", "fp.interets"],
    explication: "(titres détenus × rendement moyen) ÷ intérêts versés en un an par les administrations publiques × 365",
    formule: () => ((lire("bdf.titres-politique-monetaire") * lire("bdf.rendement-titres-pm")) / 100 / lire("fp.interets")) * 365,
  },
  "calc.prime-risque-part-gain": {
    label: "Coût la première année d'une prime de risque d'un demi-point, rapporté aux intérêts versés à la Banque de France",
    unite: "%",
    decimales: 0,
    donnees: ["aft.programme-emissions", "bdf.titres-politique-monetaire", "bdf.rendement-titres-pm"],
    explication: "(programme d'émissions × 0,5 point) ÷ (titres détenus × rendement moyen)",
    formule: () => ((lire("aft.programme-emissions") * 0.005) / ((lire("bdf.titres-politique-monetaire") * lire("bdf.rendement-titres-pm")) / 100)) * 100,
  },
  "calc.impot-plancher-haut-par-habitant": {
    label: "Rendement haut de l'impôt plancher, par habitant et par an",
    unite: "€",
    decimales: 0,
    donnees: ["prop.impot-plancher-rendements", "pop.france"],
    explication: "estimation haute des promoteurs ÷ population",
    formule: () => (lire("prop.impot-plancher-rendements", "Estimation de ses promoteurs (haut)") * 1000) / lire("pop.france"),
  },
  "calc.impot-plancher-mois-interets": {
    label: "Rendement haut de l'impôt plancher, en mois d'intérêts de la dette publique",
    unite: "mois",
    decimales: 1,
    donnees: ["prop.impot-plancher-rendements", "fp.interets"],
    explication: "estimation haute des promoteurs ÷ intérêts versés en un an par les administrations publiques × 12",
    formule: () => (lire("prop.impot-plancher-rendements", "Estimation de ses promoteurs (haut)") / lire("fp.interets")) * 12,
  },
  "calc.deficit-fois-impot-plancher": {
    label: "Déficit public rapporté au rendement haut de l'impôt plancher",
    unite: "fois",
    decimales: 0,
    donnees: ["deficit.montant", "prop.impot-plancher-rendements"],
    explication: "déficit public ÷ estimation haute des promoteurs",
    formule: () => lire("deficit.montant") / lire("prop.impot-plancher-rendements", "Estimation de ses promoteurs (haut)"),
  },
  "calc.programme-fois-impot-plancher": {
    label: "Programme de dépenses rapporté au rendement haut de l'impôt plancher",
    unite: "fois",
    decimales: 0,
    donnees: ["prop.programme-depenses", "prop.impot-plancher-rendements"],
    explication: "programme annuel ÷ estimation haute des promoteurs",
    formule: () => lire("prop.programme-depenses") / lire("prop.impot-plancher-rendements", "Estimation de ses promoteurs (haut)"),
  },
  "calc.reste-a-trouver-deficit": {
    label: "Part du déficit restant à financer après l'impôt plancher (estimation haute)",
    unite: "Md€",
    decimales: 0,
    donnees: ["deficit.montant", "prop.impot-plancher-rendements"],
    explication: "déficit public − estimation haute des promoteurs",
    formule: () => lire("deficit.montant") - lire("prop.impot-plancher-rendements", "Estimation de ses promoteurs (haut)"),
  },
  "calc.deficit-par-habitant": {
    label: "Déficit public par habitant",
    unite: "€",
    decimales: 0,
    donnees: ["deficit.montant", "pop.france"],
    explication: "montant ÷ population",
    formule: () => (lire("deficit.montant") * 1000) / lire("pop.france"),
  },
  "calc.boucliers-par-habitant": {
    label: "Coût des boucliers tarifaires par habitant",
    unite: "€",
    decimales: 0,
    donnees: ["prop.boucliers-cout", "pop.france"],
    explication: "montant ÷ population",
    formule: () => (lire("prop.boucliers-cout") * 1000) / lire("pop.france"),
  },
  "calc.allegements-par-habitant": {
    label: "Coût des allègements généraux de cotisations par habitant et par an",
    unite: "€",
    decimales: 0,
    donnees: ["prop.smic-allegements-cout", "pop.france"],
    explication: "montant ÷ population",
    formule: () => (lire("prop.smic-allegements-cout") * 1000) / lire("pop.france"),
  },
  "calc.controle-encaisse-par-habitant": {
    label: "Sommes encaissées au titre du contrôle fiscal, par habitant",
    unite: "€",
    decimales: 0,
    donnees: ["prop.controle-fiscal", "pop.france"],
    explication: "montant ÷ population",
    formule: () => (lire("prop.controle-fiscal", "sommes encaissées") * 1000) / lire("pop.france"),
  },
  "calc.retraites-par-habitant": {
    label: "Dépenses de retraite par habitant et par an",
    unite: "€",
    decimales: 0,
    donnees: ["retraites.depenses-montant", "pop.france"],
    explication: "montant ÷ population",
    formule: () => (lire("retraites.depenses-montant") * 1000) / lire("pop.france"),
  },
  "calc.tva-point-par-habitant": {
    label: "Un point de taux normal de TVA, par habitant et par an",
    unite: "€",
    decimales: 0,
    donnees: ["prop.tva-point", "pop.france"],
    explication: "montant ÷ population",
    formule: () => (lire("prop.tva-point") * 1000) / lire("pop.france"),
  },
  "calc.effort-3pct-par-habitant": {
    label: "Effort pour ramener le déficit à 3 % du PIB, par habitant",
    unite: "€",
    decimales: 0,
    donnees: ["deficit.ratio-pib", "ue.seuils", "macro.pib", "pop.france"],
    explication: "effort en milliards ÷ population",
    formule: () => (calculs["calc.effort-3pct-md"].formule() * 1000) / lire("pop.france"),
  },
  "calc.effort-3pct-part-depenses": {
    label: "Effort pour ramener le déficit à 3 % du PIB, rapporté aux dépenses publiques",
    unite: "%",
    decimales: 0,
    donnees: ["deficit.ratio-pib", "ue.seuils", "macro.pib", "fp.depenses"],
    explication: "effort en milliards ÷ dépenses publiques",
    formule: () => (calculs["calc.effort-3pct-md"].formule() / lire("fp.depenses")) * 100,
  },
  "calc.allegements-part-deficit": {
    label: "Coût des allègements généraux de cotisations, rapporté au déficit public",
    unite: "%",
    decimales: 0,
    donnees: ["prop.smic-allegements-cout", "deficit.montant"],
    explication: "coût des allègements ÷ déficit public",
    formule: () => (lire("prop.smic-allegements-cout") / lire("deficit.montant")) * 100,
  },
  "calc.controle-encaisse-part-deficit": {
    label: "Sommes encaissées au titre du contrôle fiscal, rapportées au déficit public",
    unite: "%",
    decimales: 0,
    donnees: ["prop.controle-fiscal", "deficit.montant"],
    explication: "sommes encaissées ÷ déficit public",
    formule: () => (lire("prop.controle-fiscal", "sommes encaissées") / lire("deficit.montant")) * 100,
  },
  "calc.fraude-sociale-recouvree-part": {
    label: "Fraude sociale recouvrée, rapportée à la fraude sociale estimée",
    unite: "%",
    decimales: 0,
    donnees: ["prop.fraude-sociale-detectee", "prop.fraude-sociale"],
    explication: "fraude sociale recouvrée ÷ fraude sociale estimée",
    formule: () => (lire("prop.fraude-sociale-detectee", "recouvrée") / lire("prop.fraude-sociale", "évaluation 2025")) * 100,
  },
  "calc.capitalisation-10pct-par-habitant": {
    label: "Effort annuel de la transition (10 % en capitalisation), par habitant",
    unite: "€",
    decimales: 0,
    donnees: ["retraites.depenses-montant", "pop.france"],
    explication: "10 % des dépenses de retraite ÷ population",
    formule: () => (lire("retraites.depenses-montant") * 0.1 * 1000) / lire("pop.france"),
  },
  "calc.seigneuriage-jours-interets": {
    label: "Revenu de seigneuriage de la Banque de France, en jours d'intérêts de la dette publique",
    unite: "jours",
    decimales: 0,
    donnees: ["prop.seigneuriage-bdf", "fp.interets"],
    explication: "seigneuriage ÷ intérêts versés en un an par les administrations publiques × 365",
    formule: () => (lire("prop.seigneuriage-bdf") / lire("fp.interets")) * 365,
  },
  "calc.retraite60-cout-par-habitant": {
    label: "Coût annuel d'un retour à 60 ans (âge seul), par habitant",
    unite: "€",
    decimales: 0,
    donnees: ["prop.age-legal-suspendu", "prop.retraites-un-an-plus-tot", "pop.france"],
    explication: "coût d'un retour à 60 ans par rapport à l'âge légal actuel ÷ population",
    formule: () => (calculs["calc.retraite60-cout-age-actuel"].formule() * 1000) / lire("pop.france"),
  },
  "calc.ecart-taux-croissance": {
    label: "Écart entre le taux d'emprunt à 10 ans et la croissance nominale",
    unite: "points",
    decimales: 1,
    donnees: ["marches.taux10-france-dernier", "macro.croissance-valeur"],
    explication: "taux de l'OAT à 10 ans − croissance nominale",
    formule: () => lire("marches.taux10-france-dernier") - lire("macro.croissance-valeur"),
  },
  "calc.dette-japon-fois-france": {
    label: "Dette publique du Japon rapportée à celle de la France, en % du PIB",
    unite: "fois",
    decimales: 1,
    donnees: ["intl.dette-pib-japon", "dette.ratio-pib"],
    explication: "dette du Japon en % du PIB ÷ dette de la France en % du PIB",
    formule: () => lire("intl.dette-pib-japon") / lire("dette.ratio-pib"),
  },
};

export interface OptionsCalcul {
  /** Arrondi au multiple le plus proche (par exemple 1000 pour « environ 52 000 € »). */
  arrondi?: number;
  /** « bas » pour « plus de… », « haut » pour « moins de… ». */
  sens?: "proche" | "bas" | "haut";
  decimales?: number;
  unite?: boolean;
}

export function valeurCalcul(id: string, { arrondi, sens = "proche" }: OptionsCalcul = {}): number {
  const c = calculs[id];
  if (!c) throw new Error(`Calcul inconnu : ${id} (à ajouter dans src/content/calculs.ts)`);
  const v = c.formule();
  if (!Number.isFinite(v)) throw new Error(`${id} : résultat non numérique`);
  if (!arrondi) return v;
  const f = sens === "bas" ? Math.floor : sens === "haut" ? Math.ceil : Math.round;
  return f(v / arrondi) * arrondi;
}

/** Valeur calculée mise en forme : « 52 000 € », « 2,2 points de PIB ». */
export function texteCalcul(id: string, options: OptionsCalcul = {}): string {
  const c = calculs[id];
  const v = valeurCalcul(id, options);
  let decimales = options.decimales ?? (options.arrondi && options.arrondi >= 1 ? 0 : c.decimales);
  // « 1 point », pas « 1,0 point ».
  if (options.decimales === undefined && Number(v.toFixed(decimales)) === Math.round(v)) decimales = 0;
  const n = formatNombre(v, decimales);
  return options.unite === false ? n : `${n} ${c.unite}`;
}

/**
 * Une donnée de data/*.json mise en forme, pour un attribut (résumé de figure) :
 * texteDonnee("intl.dette-pib-2025", "France") → « 115,5 % du PIB ».
 */
export function texteDonnee(id: string, x?: string, { arrondi, decimales }: { arrondi?: number; decimales?: number } = {}): string {
  const d = getDonnee(id);
  const v = lire(id, x);
  const valeur = arrondi ? Math.round(v / arrondi) * arrondi : v;
  const dec = decimales ?? (arrondi ? 0 : Number.isInteger(valeur) ? 0 : Math.round(valeur * 10) === valeur * 10 ? 1 : 2);
  return `${formatNombre(valeur, dec)} ${d.unite}`;
}
