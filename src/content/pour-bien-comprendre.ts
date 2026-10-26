/**
 * Notions techniques qui ont leur bloc « Pour bien comprendre » (analogie,
 * mécanisme pas à pas avec des chiffres ronds, phrase à retenir), placé avant
 * la partie technique de la page. Pilote : trois notions, en attendant la
 * validation du ton avant de généraliser.
 */
export const pourBienComprendre: { notion: string; fichier: string; page: string }[] = [
  {
    notion: "Annuler la dette détenue par la Banque de France",
    fichier: "src/content/modules/banque-centrale/bilan-bdf.mdx",
    page: "/modules/banque-centrale/bilan-bdf/",
  },
  {
    notion: "Le lien inverse entre le prix d'une obligation et les taux",
    fichier: "src/content/modules/emprunt-etat/prix-et-taux.mdx",
    page: "/modules/emprunt-etat/prix-et-taux/",
  },
  {
    notion: "L'effet boule de neige (taux d'intérêt contre croissance)",
    fichier: "src/content/modules/boule-de-neige/formule.mdx",
    page: "/modules/boule-de-neige/formule/",
  },
  {
    notion: "Les rachats de dette par la BCE (assouplissement quantitatif)",
    fichier: "src/content/modules/banque-centrale/qe.mdx",
    page: "/modules/banque-centrale/qe/",
  },
  {
    notion: "La théorie monétaire moderne",
    fichier: "src/content/propositions/theorie-monetaire-moderne.mdx",
    page: "/propositions/theorie-monetaire-moderne/",
  },
  {
    notion: "Taux apparent et taux de marché",
    fichier: "src/content/modules/emprunt-etat/taux-apparent.mdx",
    page: "/modules/emprunt-etat/taux-apparent/",
  },
  {
    notion: "Solde primaire et solde structurel",
    fichier: "src/content/modules/deficit-et-dette/soldes.mdx",
    page: "/modules/deficit-et-dette/soldes/",
  },
  {
    notion: "Le multiplicateur budgétaire",
    fichier: "src/content/modules/boule-de-neige/chiffrage.mdx",
    page: "/modules/boule-de-neige/chiffrage/",
  },
  {
    notion: "Spread, prime de risque et notation",
    fichier: "src/content/modules/emprunt-etat/spread-notation.mdx",
    page: "/modules/emprunt-etat/spread-notation/",
  },
  {
    notion: "L'interdiction du financement monétaire (article 123)",
    fichier: "src/content/modules/banque-centrale/cadre-juridique.mdx",
    page: "/modules/banque-centrale/cadre-juridique/",
  },
  {
    notion: "La double charge du passage à la capitalisation",
    fichier: "src/content/modules/retraites/transition.mdx",
    page: "/modules/retraites/transition/",
  },
  {
    notion: "La dette au sens de Maastricht",
    fichier: "src/content/modules/deficit-et-dette/maastricht.mdx",
    page: "/modules/deficit-et-dette/maastricht/",
  },
  {
    notion: "Taux nominal et taux réel",
    fichier: "src/content/modules/les-bases/inflation-taux-reels.mdx",
    page: "/modules/les-bases/inflation-taux-reels/",
  },
  {
    notion: "La répression financière",
    fichier: "src/content/modules/histoire-des-dettes/inflation.mdx",
    page: "/modules/histoire-des-dettes/inflation/",
  },
  {
    notion: "La TVA sociale",
    fichier: "src/content/propositions/tva-sociale.mdx",
    page: "/propositions/tva-sociale/",
  },
  {
    notion: "La planche à billets et le seigneuriage",
    fichier: "src/content/propositions/planche-a-billets.mdx",
    page: "/propositions/planche-a-billets/",
  },
  {
    notion: "Le signal envoyé aux marchés",
    fichier: "src/content/modules/banque-centrale/signal-marches.mdx",
    page: "/modules/banque-centrale/signal-marches/",
  },
  {
    notion: "Pourquoi le Japon n'est pas la Grèce",
    fichier: "src/content/modules/comparaisons/japon-grece.mdx",
    page: "/modules/comparaisons/japon-grece/",
  },
  {
    notion: "Défauts et restructurations de dette",
    fichier: "src/content/modules/histoire-des-dettes/defauts.mdx",
    page: "/modules/histoire-des-dettes/defauts/",
  },
  {
    notion: "Les règles budgétaires européennes",
    fichier: "src/content/modules/cadre-europeen/regles.mdx",
    page: "/modules/cadre-europeen/regles/",
  },
  {
    notion: "La procédure de déficit excessif",
    fichier: "src/content/modules/cadre-europeen/deficit-excessif.mdx",
    page: "/modules/cadre-europeen/deficit-excessif/",
  },
  {
    notion: "Les filets de sécurité de la zone euro",
    fichier: "src/content/modules/cadre-europeen/solidarite.mdx",
    page: "/modules/cadre-europeen/solidarite/",
  },
  {
    notion: "Les adjudications de l'Agence France Trésor",
    fichier: "src/content/modules/emprunt-etat/aft-adjudications.mdx",
    page: "/modules/emprunt-etat/aft-adjudications/",
  },
  {
    notion: "OAT et BTF : coupon, maturité, OAT indexée",
    fichier: "src/content/modules/emprunt-etat/oat-btf.mdx",
    page: "/modules/emprunt-etat/oat-btf/",
  },
  {
    notion: "Cercle vicieux, cercle vertueux",
    fichier: "src/content/modules/boule-de-neige/cercles.mdx",
    page: "/modules/boule-de-neige/cercles/",
  },
  {
    notion: "Le coût d'opportunité des intérêts",
    fichier: "src/content/modules/boule-de-neige/cout-opportunite.mdx",
    page: "/modules/boule-de-neige/cout-opportunite/",
  },
  {
    notion: "Assiette, taux et rendement d'un impôt",
    fichier: "src/content/modules/fiscalite/assiette-rendement.mdx",
    page: "/modules/fiscalite/assiette-rendement/",
  },
  {
    notion: "Répartition et capitalisation",
    fichier: "src/content/modules/retraites/repartition-capitalisation.mdx",
    page: "/modules/retraites/repartition-capitalisation/",
  },
  {
    notion: "Le nombre d'actifs par retraité",
    fichier: "src/content/modules/retraites/demographie.mdx",
    page: "/modules/retraites/demographie/",
  },
  {
    notion: "Les trois leviers des retraites",
    fichier: "src/content/modules/retraites/leviers.mdx",
    page: "/modules/retraites/leviers/",
  },
  {
    notion: "Trimestres, décote et taux de remplacement",
    fichier: "src/content/modules/retraites/notions.mdx",
    page: "/modules/retraites/notions/",
  },
];
