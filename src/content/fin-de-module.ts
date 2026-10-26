/**
 * Écran de fin de module, affiché après la dernière section : les trois idées
 * à retenir, la phrase qui relie le module au suivant, et un lien secondaire
 * (tableau de bord, fiche liée…). Pas de chiffre : ces phrases résument des
 * mécanismes, les chiffres restent dans les pages, avec leur source.
 */

export interface FinDeModule {
  /** Les trois idées à retenir, une phrase chacune, dans le style des blocs « Pour bien comprendre ». */
  retenir: [string, string, string];
  /** Pourquoi le module suivant vient ensuite : une phrase de lien logique. */
  transition: string;
  /** Lien secondaire, discret. */
  aussi: { href: string; titre: string };
}

export const finsDeModule: Record<string, FinDeModule> = {
  "les-bases": {
    retenir: [
      "Le PIB mesure la richesse produite en un an : c'est l'étalon auquel on rapporte la dette, le déficit et les dépenses.",
      "L'argent public vient surtout des impôts et des cotisations, et sert d'abord à la protection sociale : retraites, santé, famille.",
      "Un taux d'intérêt se juge face à l'inflation : c'est le taux réel qui dit ce que coûte vraiment un emprunt.",
    ],
    transition: "Quand les dépenses dépassent les recettes, l'écart doit être emprunté : c'est le déficit, et c'est lui qui fait grossir la dette.",
    aussi: { href: "/la-france-en-10-chiffres/", titre: "La France en 10 chiffres" },
  },
  "deficit-et-dette": {
    retenir: [
      "Le déficit est un flux, la dette un stock : chaque année de déficit s'ajoute à la dette.",
      "Un déficit qui baisse ralentit la hausse de la dette, il ne la fait pas reculer.",
      "Le solde primaire, hors intérêts, dit si l'État couvre ses dépenses courantes avec ses recettes.",
    ],
    transition: "Chaque année de déficit doit être financée : reste à voir comment l'État trouve cet argent, et à quel prix.",
    aussi: { href: "/tableau-de-bord/", titre: "Le tableau de bord" },
  },
  "emprunt-etat": {
    retenir: [
      "L'État emprunte en émettant des titres, à long terme (OAT) et à court terme (BTF), vendus aux enchères par l'Agence France Trésor.",
      "Le prix d'une obligation et les taux vont en sens inverse : quand les taux montent, les anciennes obligations perdent de leur valeur.",
      "Une hausse des taux ne coûte pas tout de suite : elle se diffuse au fil des années, à mesure que la dette est renouvelée.",
    ],
    transition: "Les intérêts s'ajoutent eux-mêmes à la dette : quand ils pèsent plus que la croissance, la dette peut grossir toute seule.",
    aussi: { href: "/tableau-de-bord/", titre: "Les taux, sur le tableau de bord" },
  },
  "boule-de-neige": {
    retenir: [
      "La dette rapportée au PIB baisse quand la croissance nominale dépasse le taux d'intérêt, si le déficit hors intérêts reste limité.",
      "Quand le taux dépasse la croissance, la dette augmente d'elle-même, sauf excédent hors intérêts.",
      "Chaque euro versé en intérêts est un euro qui ne finance ni école, ni hôpital, ni baisse d'impôt.",
    ],
    transition: "Les taux pèsent lourd dans la boule de neige : c'est la banque centrale qui les influence, et elle détient une partie de la dette.",
    aussi: { href: "/propositions/relance-pour-reduire-la-dette/", titre: "Relancer l'économie pour réduire la dette ?" },
  },
  "banque-centrale": {
    retenir: [
      "La BCE fixe les taux directeurs pour toute la zone euro ; la Banque de France met sa politique en œuvre en France.",
      "Pour racheter de la dette, une banque centrale crée des réserves, qu'elle doit ensuite rémunérer aux banques.",
      "Annuler la dette qu'elle détient ne fait pas disparaître le coût : il passe de l'État à la banque centrale.",
    ],
    transition: "Après les mécanismes, l'échelle : que représente vraiment la dette, par habitant, face au budget et au patrimoine public ?",
    aussi: { href: "/propositions/annuler-dette-banque-centrale/", titre: "Annuler la dette détenue par la banque centrale ?" },
  },
  "dette-en-perspective": {
    retenir: [
      "Un montant de dette ne dit pas grand-chose seul : il se lit rapporté au PIB, aux recettes ou au nombre d'habitants.",
      "Face aux budgets des ministères, la charge des intérêts compte parmi les grosses dépenses de l'État.",
      "L'État possède aussi des biens, mais une grande partie, comme les routes ou les écoles, ne se vend pas pour rembourser.",
    ],
    transition: "Pour réduire le déficit, il faut plus de recettes ou moins de dépenses : voyons d'abord qui paie les impôts, et ce que rapporte chacun.",
    aussi: { href: "/la-france-en-10-chiffres/", titre: "La France en 10 chiffres" },
  },
  fiscalite: {
    retenir: [
      "Le rendement d'un impôt dépend de son taux et de son assiette : un taux élevé sur une petite base rapporte peu.",
      "Les impôts qui rapportent le plus portent sur des assiettes larges : la consommation et les revenus du travail.",
      "Taxer davantage les plus grandes fortunes peut rapporter quelques milliards, pas de quoi combler à lui seul le déficit.",
    ],
    transition: "Une grande partie des prélèvements passe par la paie : suivons un salaire, euro par euro, du coût employeur au net.",
    aussi: { href: "/propositions/taxer-les-tres-hauts-patrimoines/", titre: "Taxer davantage les plus hauts patrimoines ?" },
  },
  "fiche-de-paie": {
    retenir: [
      "Entre ce que paie l'employeur et ce que touche le salarié, les cotisations et la CSG financent surtout la protection sociale.",
      "Près du Smic, les allègements réduisent fortement les cotisations patronales, et l'État en paie le coût.",
      "Les cotisations retraite prélevées aujourd'hui paient les pensions d'aujourd'hui.",
    ],
    transition: "Une large part des cotisations prélevées sur la paie va aux retraites : voyons comment ce système s'équilibre.",
    aussi: { href: "/propositions/hausse-forte-du-smic/", titre: "Augmenter fortement le Smic ?" },
  },
  retraites: {
    retenir: [
      "En répartition, les cotisations de l'année paient les pensions de l'année.",
      "Moins de cotisants pour chaque retraité, c'est un équilibre plus difficile à tenir.",
      "Il n'y a que trois leviers : l'âge de départ, le niveau des cotisations et celui des pensions.",
    ],
    transition: "Retraites comprises, les comptes publics sont surveillés de près : par les règles européennes et par les agences de notation.",
    aussi: { href: "/propositions/retraite-a-60-ans/", titre: "Revenir à la retraite à 60 ans ?" },
  },
  "cadre-europeen": {
    retenir: [
      "Les règles européennes encadrent le déficit et la dette, avec une procédure quand un pays s'en écarte.",
      "Les agences de notation donnent un avis sur la capacité à rembourser ; les marchés réagissent souvent avant elles.",
      "Depuis la crise de 2010, la zone euro s'est dotée de filets de sécurité, accordés sous conditions.",
    ],
    transition: "Les règles sont communes, les situations diffèrent : comparons la France à ses voisins.",
    aussi: { href: "/tableau-de-bord/", titre: "Le tableau de bord" },
  },
  comparaisons: {
    retenir: [
      "La France dépense et prélève plus que la plupart de ses voisins, surtout pour la protection sociale.",
      "Sa dette est élevée, mais d'autres pays le sont davantage : la trajectoire compte autant que le niveau.",
      "Une dette élevée n'a pas les mêmes conséquences partout : tout dépend de qui la détient, et dans quelle monnaie.",
    ],
    transition: "D'autres pays ont connu des dettes bien plus lourdes : l'histoire montre comment ils en sont sortis.",
    aussi: { href: "/idees-recues/", titre: "Idées reçues" },
  },
  "histoire-des-dettes": {
    retenir: [
      "Les grandes dettes ont surtout reculé grâce à la croissance et à l'inflation, rarement par des remboursements.",
      "Défauts et annulations existent, mais coûtent cher à ceux qui détiennent la dette, souvent les épargnants du pays.",
      "Les conditions de l'après-guerre ne se retrouvent pas aujourd'hui : aucune voie unique ne suffira à la France.",
    ],
    transition: "Vous avez les mécanismes en main : place aux propositions du débat public, et à vos propres choix budgétaires.",
    aussi: { href: "/tableau-de-bord/", titre: "Le tableau de bord" },
  },
};

/** Après le dernier module : les propositions au crible et le jeu « Redresser les comptes ». */
export const APRES_DERNIER_MODULE = [
  { href: "/propositions/", titre: "Les propositions au crible", texte: "Les idées du débat public, chiffrées et passées au crible." },
  { href: "/jeux/redresser-les-comptes/", titre: "Redresser les comptes", texte: "À vous de choisir : quelles économies, quelles recettes ?" },
];
