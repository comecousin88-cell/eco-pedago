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
];
