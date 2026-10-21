/**
 * Chiffres qui peuvent rester écrits dans les textes, fichier par fichier, avec
 * leur raison : exemples, paramètres d'une proposition, règles, citations
 * d'un débat ou d'une étude datée. Ils ne décrivent pas la situation actuelle
 * et ne changent pas quand les données sont mises à jour.
 *
 * Tout autre chiffre accompagné d'une unité doit venir de data/*.json
 * (<Chiffre>, <Calcul>) : le test src/content/chiffres-en-dur.test.ts le vérifie.
 */

const EXEMPLE = "exemple chiffré";
const IMPOT_PLANCHER = "paramètre de la proposition (impôt plancher de 2 % au-delà de 100 millions d'euros)";

export const chiffresFixes: Record<string, Record<string, string>> = {
  "src/content/idees-recues.tsx": {
    "2 %": IMPOT_PLANCHER,
    "100 millions": IMPOT_PLANCHER,
    "100 %": "affirmation examinée (« au-delà de 100 % du PIB… »)",
  },
  "src/content/modules/banque-centrale/bilan-bdf.mdx": {
    "100 €": "montants fictifs du simulateur",
    "100 euros": "montants fictifs du simulateur",
    "95 euros": "montants fictifs du simulateur",
    "5 euros": "montants fictifs du simulateur",
    "20 %": "chiffre souvent cité dans le débat, discuté par le texte",
  },
  "src/content/modules/boule-de-neige/chiffrage.mdx": { "1 €": "unité de raisonnement (multiplicateur budgétaire)" },
  "src/content/modules/boule-de-neige/cout-opportunite.mdx": { "100 milliards": "projection citée d'un rapport daté du Sénat" },
  "src/content/modules/boule-de-neige/simulateur.mdx": { "1 point": "bouton du simulateur" },
  "src/content/modules/cadre-europeen/deficit-excessif.mdx": {
    "3 %": "repère des traités",
    "0,5 point": "règle européenne (ajustement structurel minimal)",
    "0,1 %": "règle européenne (amende maximale)",
  },
  "src/content/modules/deficit-et-dette/maastricht.mdx": { "10 %": EXEMPLE, "100 €": EXEMPLE, "110 €": EXEMPLE },
  "src/content/modules/deficit-et-dette/histoire.mdx": { "100 %": "fait historique (la dette avant la crise sanitaire)" },
  "src/content/modules/histoire-des-dettes/inflation.mdx": { "50 %": "fait historique (après la Seconde Guerre mondiale)" },
  "src/content/modules/dette-en-perspective/par-habitant.mdx": { "200 000 euros": EXEMPLE, "150 000 euros": EXEMPLE },
  "src/content/modules/emprunt-etat/aft-adjudications.mdx": { "10 milliards": "adjudication fictive du simulateur" },
  "src/content/modules/emprunt-etat/prix-et-taux.mdx": { "2 %": EXEMPLE, "4 %": EXEMPLE, "100 €": EXEMPLE },
  "src/content/modules/emprunt-etat/taux-apparent.mdx": { "1 point": "hypothèse de l'estimation citée (hausse durable d'un point)" },
  "src/content/modules/fiscalite/assiette-rendement.mdx": {
    "2 %": IMPOT_PLANCHER,
    "100 millions": IMPOT_PLANCHER,
    "100 %": "raisonnement (courbe de Laffer)",
  },
  "src/content/modules/fiscalite/taxer-les-riches.mdx": { "100 millions": IMPOT_PLANCHER, "2 %": EXEMPLE, "5 %": EXEMPLE, "40 %": EXEMPLE },
  "src/content/modules/histoire-des-dettes/index.mdx": { "200 %": "fait historique (après les deux guerres mondiales)" },
  "src/content/modules/les-bases/index.mdx": { "100 €": "titre de section (« pour 100 € de dépense publique »)", "3 %": EXEMPLE },
  "src/content/modules/les-bases/inflation-taux-reels.mdx": {
    "10 €": EXEMPLE,
    "3 %": EXEMPLE,
    "1 %": EXEMPLE,
    "100 €": EXEMPLE,
    "100 euros": EXEMPLE,
    "10 %": EXEMPLE,
    "8 %": EXEMPLE,
    "1,85 %": EXEMPLE,
  },
  "src/content/modules/les-bases/recettes-depenses.mdx": { "100 €": "unité de présentation (pour 100 €)", "100 euros": "unité de présentation (pour 100 €)" },
  "src/content/modules/retraites/notions.mdx": { "50 %": "règle de calcul de la pension (taux plein)" },
  "src/content/propositions/annuler-dette-banque-centrale.mdx": {
    "20 %": "chiffre souvent cité dans le débat, daté par le texte",
    "0,5 point": "hypothèse de prime de risque",
  },
  "src/content/propositions/austerite-rapide.mdx": { "5 %": "ordre de grandeur de la baisse de dépenses (3 à 5 %)" },
  "src/content/propositions/financer-les-depenses-en-taxant-les-riches.mdx": { "2 %": IMPOT_PLANCHER },
  "src/content/propositions/hausse-forte-du-smic.mdx": { "10 %": "paramètre de la proposition", "20 %": "paramètre de la proposition" },
  "src/content/propositions/passage-capitalisation.mdx": { "10 %": "paramètre du scénario étudié" },
  "src/content/propositions/taxer-les-tres-hauts-patrimoines.mdx": {
    "2 %": IMPOT_PLANCHER,
    "100 millions": IMPOT_PLANCHER,
    "20 %": "paramètre des propositions (taux minimal) et exemple de calcul",
    "0,0002 %": "périmètre de l'étude citée (Institut des politiques publiques)",
    "7 %": "fourchette de rendement citée par des travaux académiques",
    "10 %": "fourchette de rendement citée par des travaux académiques, et exemple",
    "100 %": EXEMPLE,
  },
  "src/content/propositions/tva-sociale.mdx": { "1 point": "hypothèse du modèle cité (hausse d'un point de PIB)" },
};
