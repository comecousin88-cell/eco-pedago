/**
 * Glossaire. Chaque terme a une définition courte (affichée dans l'infobulle
 * de <Terme>) et une définition longue (page /glossaire). Les définitions ne
 * contiennent pas de chiffres datés : ceux-ci vivent dans data/*.json.
 */

export interface EntreeGlossaire {
  id: string;
  terme: string;
  /** Une ou deux phrases, sans autre jargon. */
  court: string;
  /** Pour la page glossaire : précisions, nuances, exemple. */
  long: string;
  /** Identifiants d'autres termes à lire ensuite. */
  voir?: string[];
}

export const glossaire: EntreeGlossaire[] = [
  {
    id: "pib",
    terme: "PIB (produit intérieur brut)",
    court: "La valeur de tout ce qui est produit dans le pays en un an, une fois retirés les achats intermédiaires.",
    long: "Le PIB additionne la « valeur ajoutée » de toutes les entreprises et administrations : ce qu'elles vendent, moins ce qu'elles ont acheté pour produire. On l'utilise comme étalon pour comparer la dette, le déficit ou les dépenses d'un pays à sa taille. Il ne mesure ni le bien-être, ni les inégalités, ni le travail domestique, ni l'épuisement des ressources naturelles.",
    voir: ["croissance-nominale", "dette-publique"],
  },
  {
    id: "croissance-nominale",
    terme: "Croissance nominale",
    court: "La hausse du PIB en euros courants : croissance « réelle » (en volume) plus inflation.",
    long: "Si l'économie produit 1 % de plus en volume et que les prix montent de 2 %, le PIB en euros augmente d'environ 3 % : c'est la croissance nominale. C'est elle qui compte pour le ratio dette/PIB, car la dette est elle aussi exprimée en euros courants.",
    voir: ["pib", "inflation", "effet-boule-de-neige"],
  },
  {
    id: "administrations-publiques",
    terme: "Administrations publiques (APU)",
    court: "L'ensemble formé par l'État, la Sécurité sociale, les collectivités locales et divers organismes publics.",
    long: "Les statisticiens rangent les administrations publiques en quatre sous-secteurs : l'État et ses organismes (les « administrations publiques centrales »), les administrations de sécurité sociale (retraites de base, assurance maladie, chômage…), les administrations publiques locales (communes, départements, régions) et des organismes divers. Le déficit et la dette « publics » portent sur cet ensemble, pas seulement sur l'État.",
    voir: ["deficit-public", "dette-publique"],
  },
  {
    id: "prelevements-obligatoires",
    terme: "Prélèvements obligatoires",
    court: "Les impôts et cotisations sociales que l'on est obligé de payer, sans contrepartie directe.",
    long: "On les rapporte souvent au PIB (le « taux de prélèvements obligatoires »). Ils incluent les impôts (TVA, impôt sur le revenu, impôt sur les sociétés…) et les cotisations sociales. Ils ne couvrent pas toutes les recettes publiques : les revenus de la propriété ou les ventes de services publics n'en font pas partie.",
    voir: ["tva", "csg", "cotisations-sociales"],
  },
  {
    id: "deficit-public",
    terme: "Déficit public",
    court: "Ce qui manque, sur une année, quand les dépenses publiques dépassent les recettes.",
    long: "C'est un flux : il se mesure sur une période (un an). On l'exprime en euros ou en % du PIB. Le déficit d'une année doit être emprunté : il s'ajoute donc à la dette. L'inverse d'un déficit s'appelle un excédent.",
    voir: ["dette-publique", "solde-primaire", "solde-structurel"],
  },
  {
    id: "dette-publique",
    terme: "Dette publique",
    court: "Le total de ce que les administrations publiques doivent à leurs prêteurs, à une date donnée.",
    long: "C'est un stock : la somme des emprunts passés qui n'ont pas encore été remboursés. Chaque déficit l'augmente, chaque excédent la réduit. En pratique, l'État ne rembourse pas sa dette d'un coup : il rembourse les emprunts qui arrivent à échéance en en émettant de nouveaux.",
    voir: ["deficit-public", "dette-maastricht", "oat"],
  },
  {
    id: "dette-maastricht",
    terme: "Dette au sens de Maastricht",
    court: "La définition officielle de la dette publique, commune à tous les pays de l'Union européenne.",
    long: "Elle compte la dette brute de l'ensemble des administrations publiques, consolidée (on retire ce qu'une administration doit à une autre) et en valeur nominale, c'est-à-dire le montant à rembourser à l'échéance, et non sa valeur de marché du jour. Ce choix évite que la dette « baisse » sur le papier quand les taux montent et que les prix des obligations chutent.",
    voir: ["dette-publique", "valeur-nominale"],
  },
  {
    id: "valeur-nominale",
    terme: "Valeur nominale",
    court: "Le montant qui sera remboursé à l'échéance d'un emprunt, inscrit dès le départ.",
    long: "Une OAT de valeur nominale 100 € rembourse 100 € à son échéance, quel que soit le prix auquel elle s'échange entre-temps sur les marchés. On dit aussi « le pair ».",
    voir: ["oat", "dette-maastricht"],
  },
  {
    id: "solde-primaire",
    terme: "Solde primaire",
    court: "Le solde public sans compter les intérêts de la dette.",
    long: "Il montre si l'État dépense plus qu'il ne gagne pour ses politiques courantes, indépendamment du poids de la dette passée. Solde public = solde primaire − intérêts. Un pays peut avoir un excédent primaire et quand même un déficit, si ses intérêts sont élevés.",
    voir: ["deficit-public", "charge-de-la-dette", "effet-boule-de-neige"],
  },
  {
    id: "solde-structurel",
    terme: "Solde structurel",
    court: "Le solde public corrigé des effets de la conjoncture et des mesures exceptionnelles.",
    long: "En récession, les recettes baissent et certaines dépenses (chômage) montent mécaniquement : le déficit se creuse sans qu'aucune décision n'ait été prise. Le solde structurel tente de retirer cet effet pour mesurer l'effort « voulu ». Il repose sur une estimation de la croissance « potentielle », qui est discutée et souvent révisée.",
    voir: ["deficit-public", "solde-primaire"],
  },
  {
    id: "charge-de-la-dette",
    terme: "Charge de la dette",
    court: "Les intérêts payés chaque année sur la dette. Le remboursement du capital n'en fait pas partie.",
    long: "C'est une dépense publique comme une autre : chaque euro d'intérêts est un euro qui ne finance ni école ni hôpital. Elle dépend du montant de la dette et des taux auxquels elle a été empruntée. Pour l'État, on y ajoute parfois le surcoût lié à l'indexation sur l'inflation des OAT indexées.",
    voir: ["taux-apparent", "dette-publique"],
  },
  {
    id: "inflation",
    terme: "Inflation",
    court: "La hausse générale et durable des prix : avec le même euro, on achète un peu moins.",
    long: "En France, l'Insee la mesure par l'indice des prix à la consommation. La Banque centrale européenne vise une inflation de 2 % par an à moyen terme dans la zone euro. L'inflation érode la valeur réelle des dettes : elle aide les emprunteurs à taux fixe et pénalise les prêteurs.",
    voir: ["taux-reel", "bce"],
  },
  {
    id: "taux-nominal",
    terme: "Taux d'intérêt nominal",
    court: "Le taux affiché d'un prêt, sans tenir compte de l'inflation.",
    long: "Si vous prêtez 100 € à 3 %, on vous rend 103 € dans un an : 3 % est le taux nominal. Il ne dit pas si vous vous êtes enrichi, car les prix ont pu monter entre-temps.",
    voir: ["taux-reel", "inflation"],
  },
  {
    id: "taux-reel",
    terme: "Taux d'intérêt réel",
    court: "Le taux d'intérêt une fois retirée l'inflation : ce que le prêteur gagne vraiment en pouvoir d'achat.",
    long: "En première approximation : taux réel ≈ taux nominal − inflation. Avec un taux de 3 % et une inflation de 2 %, le prêteur ne gagne qu'environ 1 % en pouvoir d'achat. Le taux réel peut être négatif quand l'inflation dépasse le taux nominal.",
    voir: ["taux-nominal", "inflation"],
  },
  {
    id: "aft",
    terme: "Agence France Trésor (AFT)",
    court: "Le service de l'État chargé d'emprunter sur les marchés et de gérer la dette de l'État.",
    long: "Rattachée au ministère de l'Économie, elle publie chaque année un programme d'émission, organise les adjudications et gère la trésorerie de l'État. Elle ne gère que la dette de l'État, pas celle de la Sécurité sociale ni des collectivités.",
    voir: ["adjudication", "oat", "btf"],
  },
  {
    id: "adjudication",
    terme: "Adjudication",
    court: "La vente aux enchères par laquelle l'État place ses nouveaux titres de dette auprès des investisseurs.",
    long: "Des banques spécialisées (les « spécialistes en valeurs du Trésor ») proposent un prix pour une quantité de titres. L'AFT sert les meilleures offres jusqu'à couvrir le montant qu'elle veut emprunter. Plus les investisseurs sont prêts à payer cher, plus le taux d'emprunt de l'État est bas.",
    voir: ["aft", "oat"],
  },
  {
    id: "oat",
    terme: "OAT (obligation assimilable du Trésor)",
    court: "Le titre de dette à moyen et long terme de l'État français : un prêt de 2 à 50 ans, avec un intérêt fixe chaque année.",
    long: "Le prêteur reçoit chaque année un intérêt fixe, le coupon, puis récupère la valeur nominale à l'échéance (remboursement « in fine »). « Assimilable » signifie que l'État peut émettre plusieurs fois la même ligne, aux mêmes conditions, pour la rendre plus facile à échanger. Il existe des OAT indexées sur l'inflation et des OAT vertes.",
    voir: ["coupon", "maturite", "btf"],
  },
  {
    id: "btf",
    terme: "BTF (bon du Trésor à taux fixe)",
    court: "Un emprunt de l'État de moins d'un an, sans coupon : on l'achète un peu moins cher que ce qui sera remboursé.",
    long: "Un BTF de 100 € remboursé dans un an peut s'acheter, par exemple, 97 € : la différence de 3 € est l'intérêt. Les BTF servent surtout à gérer la trésorerie de l'État au jour le jour.",
    voir: ["oat", "aft"],
  },
  {
    id: "coupon",
    terme: "Coupon",
    court: "L'intérêt versé chaque année au détenteur d'une obligation, fixé dès l'émission.",
    long: "Une OAT de 100 € avec un coupon de 2 % rapporte 2 € par an jusqu'à son échéance. Le coupon ne change pas, même si les taux du marché bougent ensuite : c'est le prix de l'obligation qui s'ajuste.",
    voir: ["oat", "rendement"],
  },
  {
    id: "maturite",
    terme: "Maturité",
    court: "La durée restant avant qu'un emprunt soit remboursé.",
    long: "On parle aussi d'échéance. La « maturité moyenne » de la dette indique combien de temps, en moyenne, l'État a devant lui avant de devoir refinancer ses emprunts. Plus elle est longue, plus une hausse des taux met de temps à se répercuter sur la charge de la dette.",
    voir: ["oat", "taux-apparent"],
  },
  {
    id: "rendement",
    terme: "Rendement (ou taux de marché)",
    court: "Le taux d'intérêt effectivement obtenu par celui qui achète une obligation au prix du jour.",
    long: "Si une OAT à coupon de 2 % se vend sous les 100 €, celui qui l'achète obtient plus de 2 % par an. Le rendement monte quand le prix baisse, et inversement. C'est ce taux que l'on cite quand on dit « le taux à 10 ans de la France ».",
    voir: ["coupon", "spread"],
  },
  {
    id: "taux-apparent",
    terme: "Taux apparent de la dette",
    court: "Le taux moyen payé sur l'ensemble de la dette : les intérêts de l'année divisés par la dette.",
    long: "Il mélange des emprunts anciens, souscrits à des taux très différents. Il bouge donc lentement : quand les taux du marché montent, seuls les nouveaux emprunts sont plus chers, et le taux apparent ne rattrape le taux de marché qu'au fil des années.",
    voir: ["charge-de-la-dette", "maturite"],
  },
  {
    id: "spread",
    terme: "Spread",
    court: "L'écart entre le taux auquel emprunte un pays et celui d'un pays de référence, souvent l'Allemagne.",
    long: "Il mesure la prime que les investisseurs demandent en plus pour prêter à ce pays plutôt qu'au pays de référence. Il s'exprime souvent en points de base : 100 points de base = 1 point de pourcentage.",
    voir: ["bund", "rendement", "notation"],
  },
  {
    id: "bund",
    terme: "Bund",
    court: "L'obligation de l'État allemand, qui sert de référence pour les taux de la zone euro.",
    long: "L'Allemagne étant considérée comme l'emprunteur le plus sûr de la zone euro, on compare souvent les taux des autres pays au sien : c'est le spread avec le Bund.",
    voir: ["spread"],
  },
  {
    id: "effet-boule-de-neige",
    terme: "Effet boule de neige",
    court: "Quand les intérêts de la dette font grossir la dette plus vite que l'économie, même sans nouveau déficit.",
    long: "Il se produit quand le taux d'intérêt moyen sur la dette (r) dépasse la croissance nominale (g). La dette rapportée au PIB augmente alors d'elle-même, sauf si l'État dégage un excédent primaire suffisant. Quand r est inférieur à g, l'effet joue à l'inverse et aide à réduire le ratio.",
    voir: ["solde-primaire", "croissance-nominale", "taux-apparent"],
  },
  {
    id: "bce",
    terme: "BCE (Banque centrale européenne)",
    court: "La banque centrale de la zone euro : elle fixe les taux directeurs pour maintenir les prix stables.",
    long: "Basée à Francfort, elle conduit la politique monétaire des pays qui ont adopté l'euro. Son objectif principal est une inflation de 2 % à moyen terme. Elle est indépendante des gouvernements, et les traités lui interdisent de financer directement les États.",
    voir: ["eurosysteme", "inflation"],
  },
  {
    id: "eurosysteme",
    terme: "Eurosystème",
    court: "La BCE et les banques centrales nationales de la zone euro, dont la Banque de France.",
    long: "Les décisions sont prises en commun à Francfort, et les banques centrales nationales les appliquent. Quand la Banque de France achète des OAT dans le cadre d'un programme de rachats, elle agit pour le compte de l'Eurosystème.",
    voir: ["bce"],
  },
  {
    id: "repartition",
    terme: "Retraite par répartition",
    court: "Les cotisations des actifs d'aujourd'hui paient les pensions des retraités d'aujourd'hui.",
    long: "L'argent n'est pas mis de côté : il est redistribué l'année même. Le système dépend donc du nombre d'actifs qui cotisent pour chaque retraité. C'est le principe des régimes de base et complémentaires en France.",
    voir: ["capitalisation", "cotisations-sociales"],
  },
  {
    id: "capitalisation",
    terme: "Retraite par capitalisation",
    court: "Chacun épargne pendant sa vie active ; l'épargne est placée, puis reversée à la retraite.",
    long: "La pension dépend des sommes versées et du rendement des placements. Le système dépend moins de la démographie, mais davantage des marchés financiers et de l'inflation. En France, elle existe à titre complémentaire, par exemple avec le plan d'épargne retraite (PER).",
    voir: ["repartition"],
  },
  {
    id: "cotisations-sociales",
    terme: "Cotisations sociales",
    court: "Les prélèvements sur les salaires qui financent la protection sociale : retraite, maladie, chômage, famille.",
    long: "Une partie est payée par l'employeur (cotisations « patronales »), une partie est retenue sur le salaire brut (cotisations « salariales »). Elles ouvrent souvent des droits : cotiser pour la retraite donne droit à une pension.",
    voir: ["csg", "repartition"],
  },
  {
    id: "csg",
    terme: "CSG (contribution sociale généralisée)",
    court: "Un impôt prélevé sur presque tous les revenus (salaires, pensions, revenus du capital) pour financer la Sécurité sociale.",
    long: "Contrairement aux cotisations, elle ne porte pas que sur les salaires et n'ouvre pas de droits individuels. Elle est devenue l'une des recettes les plus importantes de la protection sociale.",
    voir: ["cotisations-sociales", "prelevements-obligatoires"],
  },
  {
    id: "tva",
    terme: "TVA (taxe sur la valeur ajoutée)",
    court: "L'impôt inclus dans le prix de la plupart des achats. C'est la première recette de l'État.",
    long: "Chaque entreprise reverse la TVA sur ce qu'elle vend, moins celle qu'elle a payée sur ses achats : au bout de la chaîne, c'est le consommateur final qui la supporte. Il existe un taux normal et des taux réduits pour certains produits.",
    voir: ["prelevements-obligatoires"],
  },
  {
    id: "valeur-ajoutee",
    terme: "Valeur ajoutée",
    court: "Ce qu'une entreprise ou une administration crée : la valeur de ce qu'elle produit, moins ce qu'elle a acheté pour produire.",
    long: "Un boulanger qui achète 40 € de farine et vend 100 € de pain crée 60 € de valeur ajoutée. Additionner les valeurs ajoutées de tous les producteurs évite de compter deux fois la farine : c'est ainsi que l'on obtient le PIB.",
    voir: ["pib"],
  },
  {
    id: "prestations-sociales",
    terme: "Prestations sociales",
    court: "L'argent ou les services versés aux ménages pour les protéger face à certains risques : vieillesse, maladie, chômage, famille, pauvreté.",
    long: "Elles prennent la forme de versements (pensions de retraite, allocations familiales, indemnités chômage) ou de remboursements et de soins (assurance maladie). Elles représentent la plus grande part des dépenses publiques en France. Une grande partie de la « dépense publique » est donc de l'argent redistribué aux ménages, pas consommé par l'administration.",
    voir: ["cotisations-sociales", "repartition"],
  },
  {
    id: "consolidation",
    terme: "Consolidation",
    court: "Le fait de retirer ce que des administrations se versent ou se doivent entre elles, pour ne pas compter deux fois le même euro.",
    long: "Quand l'État verse une dotation à une commune, c'est une dépense pour l'État et une recette pour la commune. Pour l'ensemble des administrations publiques, ce flux s'annule. De même, la dette « consolidée » ne compte pas une obligation de l'État détenue par la Sécurité sociale, car c'est une dette d'une administration envers une autre.",
    voir: ["administrations-publiques", "dette-maastricht"],
  },
  {
    id: "dette-nette",
    terme: "Dette nette",
    court: "La dette brute moins la trésorerie et certains placements financiers que les administrations détiennent.",
    long: "Un ménage qui doit 10 000 € mais a 2 000 € sur son compte a une dette nette de 8 000 €. Pour les administrations, on retire de la dette brute leurs dépôts et certains titres facilement mobilisables. Les règles européennes portent sur la dette brute ; la dette nette donne un éclairage complémentaire.",
    voir: ["dette-maastricht", "dette-publique"],
  },
  {
    id: "recession",
    terme: "Récession",
    court: "Une période où la production du pays (le PIB en volume) recule.",
    long: "On parle souvent de récession après deux trimestres consécutifs de baisse du PIB. En récession, les recettes publiques baissent (moins d'activité, donc moins d'impôts) et certaines dépenses augmentent (chômage) : le déficit se creuse mécaniquement.",
    voir: ["pib", "solde-structurel"],
  },
  {
    id: "notation",
    terme: "Notation (agences de)",
    court: "Une note donnée par une agence privée (S&P, Moody's, Fitch) sur la capacité d'un emprunteur à rembourser.",
    long: "L'échelle va de AAA (meilleure qualité) à D (défaut). Une dégradation peut renchérir l'emprunt, surtout si elle fait passer un pays sous un seuil que certains investisseurs ne peuvent pas franchir.",
    voir: ["spread"],
  },
];

const parId = new Map(glossaire.map((e) => [e.id, e]));

export function getTerme(id: string): EntreeGlossaire {
  const e = parId.get(id);
  if (!e) throw new Error(`Terme absent du glossaire : ${id}`);
  return e;
}
