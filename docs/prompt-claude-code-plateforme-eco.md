# Prompt pour Claude Code : plateforme pédagogique « Comprendre l'économie publique française »

## Ton rôle
Tu es à la fois développeur front-end senior, designer d'information (data-viz) et pédagogue en économie. Tu construis une plateforme web interactive qui explique les mécanismes des finances publiques françaises à des personnes qui n'y connaissent presque rien, sans jamais sacrifier l'exactitude ni la complétude.

Si un projet de site éco existe déjà dans ce dépôt (pages concepts, indicateurs macro, jeu « budget de l'État »), intègre ce travail dedans plutôt que de repartir de zéro. Sinon, crée-le.

## Public et ton
- Public : lycéens, étudiants non spécialistes, citoyens curieux. Aucun prérequis.
- Chaque notion suit la même progression en 3 niveaux, que l'utilisateur peut déplier :
  1. **L'essentiel** : 2-3 phrases simples + une analogie de la vie courante.
  2. **Le mécanisme** : schéma ou animation interactive + exemple chiffré concret.
  3. **Pour aller plus loin** : formules, nuances, débats d'économistes, sources.
- Toujours un exemple chiffré (ex. : « une OAT de 100 € avec un coupon de 2 %… »). Pas de théorie abstraite sans exemple.
- Écriture en français, phrases courtes, aucun jargon non expliqué. Chaque terme technique est souligné et ouvre une infobulle du glossaire.

## Neutralité (obligatoire)
La plateforme explique des **mécanismes**, elle ne fait pas campagne. Aucun parti ni candidat n'est nommé. Quand une question est débattue (capitalisation vs répartition, annulation de dette détenue par la banque centrale, taxation du patrimoine, âge de départ…), présente un encadré « Ce que disent les uns / ce que disent les autres » avec les meilleurs arguments de chaque côté, et les chiffres sur lesquels ils s'appuient.

Neutre ne veut pas dire tiède : quand une proposition se heurte à un mécanisme démontrable (comptabilité d'un bilan, arithmétique d'un rendement fiscal, droit européen), la plateforme le dit clairement, calcul et sources à l'appui. Le verdict porte sur la proposition et ses chiffres, jamais sur ceux qui la portent ou qui y croient.

## Données : exactitude avant tout
- Les chiffres évoluent. **Vérifie chaque chiffre** à sa source officielle avant de l'utiliser : Insee, Agence France Trésor (AFT), Banque de France, BCE, Conseil d'orientation des retraites (COR), Cour des comptes, DREES, Eurostat.
- Stocke toutes les données dans des fichiers `data/*.json`, chacune avec : valeur, unité, date de la donnée, source (nom + URL). Aucun chiffre en dur dans les composants.
- Affiche sous chaque graphique « Source : … — données au JJ/MM/AAAA ».
- Si tu ne peux pas vérifier un chiffre, marque-le clairement « à vérifier » dans le JSON et liste-le dans un fichier `A_VERIFIER.md`, plutôt que d'inventer.
- Ordres de grandeur de départ (à revérifier) : dette publique ≈ 3 500 Md€ soit ≈ 117 % du PIB (Insee, T1 2026) ; déficit public 5,1 % du PIB en 2025 ; charge de la dette ≈ 77 Md€ en 2026 (Cour des comptes) ; dette négociable de l'État ≈ 2 800 Md€, maturité moyenne ≈ 8,5 ans (AFT) ; ≈ 18 % de la dette détenue par l'Eurosystème ; dépenses de retraite 14,1 % du PIB en 2025, soit 422 Md€ (COR) ; rapport démographique 20-64 ans / 65 ans et + : 2,5 en 2025 → ≈ 1,6 en 2070 (COR 2026).

## Modules à construire

### Module 0 : Les bases
- PIB, ce qu'il mesure, ce qu'il ne mesure pas.
- Recettes et dépenses publiques : d'où vient l'argent (TVA, impôt sur le revenu, CSG, cotisations, IS…) et où il va (retraites, santé, éducation, intérêts de la dette…). **Visuel : diagramme de Sankey** recettes → dépenses, cliquable.
- Les 4 sous-secteurs des administrations publiques : État, Sécurité sociale, collectivités locales, organismes divers. Qui dépense quoi.
- « Pour 100 € de dépense publique, combien pour… » : visuel en pièces ou billets.
- Inflation, taux d'intérêt nominal vs réel (exemple chiffré).

### Module 1 : Déficit et dette
- Différence flux / stock : **animation d'une baignoire** (le robinet = déficit annuel, le niveau d'eau = dette). Curseur pour régler le déficit et voir la dette monter.
- Solde public, solde primaire (hors intérêts), solde structurel.
- Dette « au sens de Maastricht » : définition, ce qu'elle inclut, pourquoi elle est en valeur nominale.
- Composition de la dette par administration (État, Sécu, collectivités) : graphique empilé.
- Historique de la dette/PIB depuis 1978 avec les grands chocs annotés (1993, 2008, 2020…). Rappeler qu'aucun budget n'a été voté à l'équilibre depuis 1974.
- Comparaison européenne (Allemagne, Italie, Espagne, Grèce, zone euro).

### Module 2 : Comment l'État emprunte (OAT, BTF, AFT)
- Rôle de l'Agence France Trésor, programme d'émission annuel, adjudications (expliquer une enchère simplement, avec une **mini-simulation d'adjudication** : l'utilisateur joue un investisseur qui propose un prix).
- **OAT** (obligations assimilables du Trésor, 2 à 50 ans) : coupon fixe, remboursement in fine, schéma des flux année par année.
- **BTF** (bons du Trésor à taux fixe, moins d'un an) : achetés sous le pair, sans coupon, servent à la gestion de trésorerie. Exemple chiffré.
- Variantes : OAT indexées sur l'inflation (OATi / OAT€i), OAT vertes.
- **Concept clé : prix et taux évoluent en sens inverse.** Simulateur : l'utilisateur choisit le coupon, la maturité et le taux du marché, et voit le prix de l'obligation se recalculer (formule d'actualisation affichée au niveau 3).
- Taux apparent de la dette vs taux de marché : pourquoi une hausse des taux met des années à se répercuter (effet de la maturité moyenne). **Visuel : stock de dette en « couches »** qui arrivent à échéance et sont refinancées au nouveau taux.
- Qui détient la dette : non-résidents, assureurs, banques, Eurosystème… (camembert + explication de chacun).
- Spread OAT-Bund, notation des agences, et ce que ça change concrètement.
- Courbe des taux (2, 5, 10, 30 ans).

### Module 3 : L'effet boule de neige
- Formule : Δ(dette/PIB) ≈ (r − g) × dette/PIB − solde primaire.
- **Simulateur sur 10-30 ans** : curseurs pour taux d'intérêt moyen, croissance nominale, solde primaire. Graphique de trajectoire de la dette/PIB. Bouton « scénario stabilisation » qui calcule le solde primaire nécessaire pour stabiliser la dette.
- Exemples guidés : « Que se passe-t-il si les taux montent de 1 point ? », « …si la croissance ralentit ? ».
- **Le cercle vicieux** : schéma en boucle animé (dépenses ↑ → dette ↑ → confiance ↓ → taux ↑ → charge de la dette ↑ → déficit ↑…), et à l'inverse le cercle vertueux.
- **Coût d'opportunité** : « Avec la charge de la dette, on pourrait financer… » — comparer les intérêts annuels aux budgets de l'Éducation nationale, de la Défense, de la Justice (chiffres sourcés).
- Le coût d'un programme de dépenses : comment les instituts chiffrent un programme (dépenses brutes, recettes attendues, recettes jugées incertaines), et pourquoi les chiffrages divergent. Exemple générique, sans nommer de parti.

### Module 4 : La banque centrale et la dette
- Rôle de la BCE et de la Banque de France dans l'Eurosystème, taux directeurs, taux de la facilité de dépôt.
- Les rachats de dette (QE, programmes PSPP et PEPP) : pourquoi, quand, combien.
- **Bilan simplifié de la Banque de France animé** : actif (OAT achetées, taux fixe) / passif (réserves des banques, rémunérées au taux de dépôt variable). Montrer avec 100 € fictifs :
  - situation normale (intérêts reversés à l'État en dividendes, opération quasi neutre) ;
  - hausse des taux (le passif coûte plus cher que l'actif ne rapporte : pertes) ;
  - scénario « annulation des titres » (l'actif disparaît, le passif reste : fonds propres négatifs, question de la recapitalisation).
- Cadre juridique : article 123 du TFUE (interdiction du financement monétaire), indépendance de la banque centrale.
- Dimension européenne : la Banque de France agit pour le compte de l'Eurosystème. Expliquer ce que signifierait qu'un pays agisse seul (précédent pour les autres États, confiance entre partenaires, risque de fragmentation de la zone euro), sans exagérer : préciser que le droit européen ne prévoit pas d'exclusion de l'UE ou de l'euro pour ce motif.
- Le « signal » envoyé aux investisseurs privés : prime de risque, spread, et pourquoi la crédibilité se paie en points de taux.
- Encadré débat : arguments des partisans et des opposants d'une annulation ou d'une « mise au frigo » de la dette détenue par la banque centrale.
- Cas d'étude : la crise grecque (2010-2018), perte d'accès aux marchés, plans d'aide sous conditions de la troïka, conséquences économiques. Frise chronologique interactive.

### Module 5 : Les retraites
- Les 3 étages : régimes de base, complémentaires (Agirc-Arrco…), épargne retraite (PER).
- **Répartition vs capitalisation** : animation côte à côte (dans l'une l'argent passe des actifs aux retraités la même année, dans l'autre il est placé puis récupéré des décennies plus tard). Avantages et risques de chacun.
- Rapport cotisants/retraités depuis 1960 et projections du COR : **visuel en personnages** (combien d'actifs portent un retraité).
- Les 3 leviers d'équilibre : âge de départ / durée de cotisation, taux de cotisation, niveau des pensions. **Simulateur** : l'utilisateur règle les 3 curseurs et voit le solde du système (en % du PIB) et l'effet sur le salaire net d'un actif et la pension d'un retraité type.
- Taux de remplacement, décote/surcote, trimestres, carrières longues : expliqués simplement.
- Coût de transition d'un passage partiel à la capitalisation (le problème de la « double charge »).
- Comparaison européenne des dépenses de retraite en % du PIB.

### Module 5 bis : Ma fiche de paie, du coût employeur à ce qui reste en poche
- **Simulateur interactif** : l'utilisateur entre un salaire brut mensuel (ex. 3 500 €). Le site affiche en cascade animée : coût total pour l'employeur (brut + cotisations patronales) → brut → net avant impôt (cotisations salariales, CSG/CRDS) → net après impôt sur le revenu (prélèvement à la source, célibataire sans enfant par défaut) → pourcentage du coût employeur réellement perçu.
- Ventiler chaque cotisation par destination (retraite de base, complémentaire, maladie, famille, chômage, accidents du travail…), avec un graphique en barres empilées. Montrer explicitement la part qui finance les retraites.
- Relier au Module 5 : quand le rapport cotisants/retraités baisse, il faut plus de cotisations par actif, donc l'écart brut/net se creuse.
- Expliquer les allègements de cotisations sur les bas salaires et pourquoi le coût du travail ne progresse pas de façon linéaire avec le salaire.
- Ajouter ensuite les impôts indirects (TVA sur la consommation, taxes sur le carburant) avec un panier de dépenses type, pour estimer ce qui reste réellement « dans la poche ».
- Taux et barèmes à vérifier sur les sources officielles (URSSAF, service-public.fr, impots.gouv.fr) pour l'année en cours, stockés dans `data/cotisations.json`. Préciser que le simulateur est une approximation (cadre / non-cadre, taille d'entreprise, mutuelle…).

### Module 6 : Fiscalité et financement
- Qui paie quels impôts (déciles de revenus), taux de prélèvements obligatoires.
- Assiette, taux, rendement : pourquoi un taux élevé sur une petite assiette rapporte peu. Différence entre taxer un **stock** (patrimoine) et un **flux** (revenu, consommation).
- Ordres de grandeur : combien rapportent TVA, IR, CSG, IS, impôts sur le patrimoine. **Visuel comparatif** pour mettre en perspective « combien rapporte 1 point de TVA vs une taxe sur les très hauts patrimoines ».
- Mobilité fiscale et effets de comportement (encadré débat avec estimations hautes et basses).
- **Simulateur « Combien rapporte de taxer les plus riches ? »** : l'utilisateur choisit un taux sur le patrimoine des plus grandes fortunes et un besoin de financement annuel (ex. 300 Md€). Le site montre la part couverte, combien d'années avant d'épuiser le stock, et la différence entre rendement théorique et rendement estimé après effets de comportement. Comparer avec ce que rapporteraient 1 point de TVA ou de CSG.
- Salaire minimum et coût du travail : effets d'une hausse du SMIC sur le pouvoir d'achat et sur l'emploi peu qualifié (encadré débat avec les études dans les deux sens).
- Blocage des prix : mécanisme, précédents historiques, effets attendus (pouvoir d'achat à court terme, risques de pénurie ou de marché parallèle).

### Module 6 bis : Le cadre européen et la notation
- Les règles budgétaires européennes : 3 % de déficit, 60 % de dette, origine (traité de Maastricht, Pacte de stabilité), réforme des règles entrée en vigueur en 2024 (trajectoires de dépenses nettes pluriannuelles). Expliquer simplement.
- La procédure de déficit excessif : ce qu'elle implique concrètement pour la France, calendrier, sanctions possibles (et le fait qu'elles n'ont jamais été appliquées à un grand pays).
- Les agences de notation (S&P, Moody's, Fitch) : ce qu'est une note, l'échelle (AAA → D), l'historique des notes de la France (frise), les effets concrets d'une dégradation (taux, investisseurs contraints par des seuils de notation).
- Les mécanismes de solidarité de la zone euro : MES, instrument de protection de la transmission (TPI) de la BCE, conditions d'activation.

### Module 6 ter : La dette en perspective
- **Dette par habitant et par actif**, charge de la dette par habitant.
- **Charge de la dette vs budgets des ministères** : barres comparatives (Éducation nationale, Défense, Justice, Recherche…).
- **Ce qu'il y a en face de la dette** : patrimoine des administrations publiques (actifs financiers, participations dans les entreprises, immobilier, infrastructures), dette nette vs dette brute. Expliquer pourquoi on ne peut pas simplement « vendre les actifs » pour rembourser.
- **La dette implicite** : engagements futurs non comptés dans la dette (retraites des fonctionnaires, vieillissement, dépendance) et ordres de grandeur estimés, avec précautions méthodologiques.
- Dette publique vs dette privée (ménages, entreprises) et endettement total du pays ; solde extérieur.

### Module 6 quater : Comparaisons internationales
- Dette/PIB, déficit, dépense publique, prélèvements obligatoires et charge d'intérêts : France vs Allemagne, Italie, Espagne, Grèce, Royaume-Uni, États-Unis, Japon, pays nordiques. Graphiques interactifs.
- Dépense publique par fonction (protection sociale, santé, éducation, défense…) en % du PIB : où la France dépense plus que ses voisins.
- **Pourquoi le Japon tient avec plus de 200 % de dette et pas la Grèce** : dette détenue en interne, monnaie propre, épargne domestique, banque centrale nationale. Montrer ce qui s'applique ou non à la France (membre de la zone euro, détenteurs étrangers importants).
- **Le levier croissance et productivité** : pourquoi la croissance est le moyen le moins douloureux de réduire la dette/PIB, évolution du taux d'emploi (notamment des seniors et des jeunes) et de la productivité en France vs voisins.

### Module 6 quinquies : L'histoire des dettes
Frise interactive des grandes sorties de crise de la dette, avec pour chacune le mécanisme dominant et ses coûts :
- croissance forte (Trente Glorieuses) ;
- inflation et « répression financière » (après 1945) ;
- consolidation budgétaire (Canada, Suède dans les années 1990) ;
- défaut ou restructuration (banqueroute des deux tiers de 1797, Argentine, Grèce 2012) ;
- annulations de dettes en contexte exceptionnel (Allemagne 1953).
Pour chaque cas : ce qui est transposable à la France aujourd'hui, et ce qui ne l'est pas.

### Module 6 sexies : Propositions passées au crible
Rubrique d'analyse au format fiche, une proposition par fiche, sans nommer de parti. Chaque fiche suit la même structure :
1. **La proposition** en une phrase.
2. **L'idée derrière** : le problème qu'elle veut résoudre, présentée sous son meilleur jour.
3. **Comment ça marcherait concrètement** : schéma ou simulateur.
4. **Ce que disent les économistes** : arguments pour / contre, avec sources.
5. **Ordres de grandeur** : coût ou rendement estimé, fourchettes hautes et basses.
6. **Verdict** : ce qui tient, ce qui ne tient pas, ce qui reste débattu (badge : « mécanisme solide », « débattu », « ne tient pas en l'état »), avec la justification.

Fiches à créer : annuler la dette détenue par la banque centrale ; la « mettre au frigo » (dette perpétuelle à taux nul) ; financer le déficit par création monétaire (« planche à billets ») ; sortir de l'euro ; taxer les très hauts patrimoines pour financer de nouvelles dépenses ; retour de la retraite à 60 ans ; passage à la capitalisation ; retraite par points ; hausse forte du SMIC ; blocage des prix ; TVA sociale ; baisse massive des dépenses (austérité rapide) ; lutte contre la fraude comme source de financement ; « relance pour réduire la dette » (effet multiplicateur) ; théorie monétaire moderne (MMT).

### Module 7 : Indicateurs en direct
Tableau de bord : taux OAT 10 ans, spread avec le Bund, inflation, taux de dépôt BCE, chômage, dette/PIB, déficit. Si une API publique est accessible (BCE Data Portal, Insee, Banque de France Webstat), l'utiliser ; sinon, données JSON mises à jour manuellement avec date affichée.

### Module 8 : Le jeu « Ministre des Finances »
L'utilisateur gère le budget de l'État sur un mandat accéléré : il choisit dépenses, impôts, âge de la retraite. Le modèle simplifié (réutiliser les formules des modules 3 et 5) fait évoluer déficit, dette, taux d'intérêt (qui montent si la crédibilité baisse), croissance et chômage. Événements aléatoires (récession, choc énergétique, hausse des taux BCE). Score final + explication de ce qui s'est passé. Rendre explicites les hypothèses du modèle (« ceci est une simplification, voici ce qui manque »).

### Transverse
- **Glossaire** complet (au moins 60 termes), cherchable, relié aux infobulles.
- **Quiz** de 5 questions à la fin de chaque module, avec explication de chaque réponse.
- **Parcours guidé** « Comprendre la dette en 10 minutes » pour les grands débutants.
- Fil d'Ariane et barre de progression par module.
- **Mini-jeu « Trouvez 40 milliards »** : liste d'économies et de recettes chiffrées (sources à l'appui), l'utilisateur coche ses choix jusqu'à atteindre l'objectif et voit l'impact sur le déficit, la dette, et qui supporte l'effort (ménages, entreprises, retraités, fonctionnaires…). Comparaison avec les choix moyens des autres joueurs si possible.
- **Page « Idées reçues »** : 15 à 20 affirmations courantes (« la France n'a jamais remboursé sa dette », « on pourrait tout financer avec la fraude fiscale », « la dette, ce sont nos enfants qui la paieront », « la BCE peut créer de l'argent à l'infini »…) avec verdict « vrai / faux / plus compliqué », explication courte et lien vers le module concerné.
- **Page « La France en 10 chiffres »** : synthèse visuelle de la situation économique et financière actuelle, avec la date de mise à jour, pour une première visite.
- **Page Sources et méthodologie** : liste des sources, hypothèses des simulateurs, limites des modèles, date de dernière mise à jour des données.
- Bouton « Partager ce graphique » (export PNG avec la source incrustée) pour faciliter la diffusion sur les réseaux.

## Stack et contraintes techniques
- Vite + React + TypeScript + Tailwind CSS. Visualisations avec Recharts pour les graphiques simples, D3 pour le Sankey et les animations sur mesure, Framer Motion pour les transitions.
- Site statique (aucun back-end obligatoire), déployable sur Vercel ou Netlify.
- Responsive mobile en priorité : chaque visuel doit être lisible sur un écran de téléphone.
- Accessibilité : contrastes suffisants, textes alternatifs, navigation clavier, graphiques accompagnés d'un résumé textuel.
- Mode clair / sombre.
- Toutes les formules de calcul dans `src/lib/economics.ts`, avec tests unitaires (Vitest) sur des cas chiffrés connus (prix d'une obligation, trajectoire boule de neige, solde des retraites).

## Design
Style éditorial sobre et moderne (inspiration : sites de data-journalism type « Les Décodeurs », « The Pudding », « Our World in Data »). Une couleur par module, typographie lisible, beaucoup d'espace. Les visuels sont au cœur de l'explication, pas de la décoration.

## Méthode de travail
1. Commence par me proposer un **plan** : arborescence des pages, liste des composants interactifs, schéma des fichiers de données. Attends ma validation.
2. Construis le Module 0 et le Module 1 en entier (textes, visuels, quiz) pour valider le format avant d'industrialiser.
3. Enchaîne dans cet ordre de priorité : dette et emprunt (modules 2, 3, 4), retraites et fiche de paie (5, 5 bis), « Propositions passées au crible » (6 sexies), puis fiscalité, cadre européen, perspective, comparaisons, histoire (6 à 6 quinquies), indicateurs (7). À la fin de chaque module : lance les tests, vérifie le rendu mobile, et liste les chiffres restant à vérifier.
4. Termine par le glossaire, les idées reçues, « La France en 10 chiffres », le parcours guidé et les deux jeux.
5. Le projet est gros : découpe-le en étapes livrables, et à chaque étape montre-moi un aperçu avant de passer à la suivante.

## Critères de réussite
- Une personne sans formation éco peut expliquer, après le parcours, la différence entre déficit et dette, ce qu'est une OAT, pourquoi la hausse des taux coûte cher à l'État, et comment fonctionne la retraite par répartition.
- Un étudiant en finance n'y trouve aucune erreur et apprend quelque chose dans les sections « Pour aller plus loin ».
- Chaque chiffre a une source et une date.
- Aucun parti pris politique : les débats sont présentés des deux côtés.
- Après la rubrique « Propositions passées au crible », le lecteur comprend pourquoi certaines solutions qui paraissent simples (annuler la dette de la banque centrale, tout financer en taxant les plus riches) ne tiennent pas, et ce qui reste réellement en débat.
