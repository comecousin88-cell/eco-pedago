# Plan : « Éco en clair », comprendre l'économie publique française

Statut : **validé le 20/10/2026** (plan et 5 décisions). La mise à jour automatique des indicateurs (décision 5) est repoussée à la fin, une fois le site en ligne : d'ici là, le tableau de bord lit des JSON datés, mis à jour à la main.

Ajustements du 20/10/2026, intégrés ci-dessous (section 7) : deux niveaux de lecture « Simple / Approfondi » avec deux parcours sur l'accueil (étape 2), et le jeu « Redresser les comptes », qui remplace « Trouvez 40 milliards » et passe avant « Ministre des Finances », devenu un bonus (étape 8).


**État au 21/10/2026 :** toutes les étapes du plan sont livrées (modules 0 à 7, 16 fiches « Propositions passées au crible », jeux « Redresser les comptes » et « Ministre des Finances », glossaire de 70 termes, idées reçues, La France en 10 chiffres, Sources et méthode, deux parcours). Reste à faire : la mise à jour automatique des indicateurs une fois le site en ligne (décision 5), et la vérification des chiffres listés dans `A_VERIFIER.md`.

---

## 0. Ce qui existe déjà et comment je l'intègre

| Existant | Ce que j'en fais |
|---|---|
| Next.js 16.4 (App Router, Turbopack), React 19, Tailwind 4, Recharts 3, Vitest | **Je garde Next.js** au lieu de Vite (voir décision n° 1) |
| Nom « Éco en clair », style éditorial (Inter + Source Serif 4, tons stone) | Je garde le nom et la typo. J'ajoute une couleur par module et le mode sombre |
| `/concepts` : 4 cartes (taux, inflation, dette, retraites) | Les cartes mènent à `/concepts/[slug]`, **qui n'existe pas (404)**. Les 4 notions sont absorbées par les modules 0, 1, 2 et 5. `/concepts` devient `/modules` (avec redirection) |
| `/tableau-de-bord` (« Bientôt ») | Devient le Module 7, même URL |
| `/jeu-budget` (« Bientôt », 1 an en 12 mois) | Devient le jeu « Ministre des Finances » (Module 8, mandat de 5 ans), même URL |
| Header, Footer, MainNav (menu mobile), ComingSoon, SoonBadge | Réutilisés. Le menu passe à 5 entrées : Modules · Chiffres · Jeux · Idées reçues · Glossaire |
| Pas de `src/lib`, pas de tests, pas de données | À créer |

Rien n'est commité à part l'init du projet : je fais un premier commit de l'existant avant de commencer, pour pouvoir revenir en arrière.

---

## 1. Décisions à valider

1. **Stack : Next.js au lieu de Vite.** Le prompt demande Vite, mais il demande aussi d'intégrer ce qui existe. Next.js avec `output: "export"` produit un site 100 % statique, déployable sur Vercel ou Netlify, ce qui répond à la même contrainte. Bonus : chaque page est pré-rendue en HTML (meilleur référencement, meilleur partage sur les réseaux). Les autres briques demandées restent : Recharts, D3 (Sankey, animations), Motion (le nouveau nom de Framer Motion), Vitest. Une précaution technique : `cacheComponents` est activé dans `next.config.ts`, je vérifierai qu'il marche avec l'export statique et je le désactiverai sinon.
2. **Textes en MDX.** Chaque section est un fichier `.mdx` : de la prose où l'on insère directement `<Terme>`, `<Niveaux>`, `<Debat>` et les simulateurs. C'est plus facile à relire et à corriger que des textes noyés dans le code.
3. **Données dans `data/*.json` à la racine** (format en section 4), validées par un test qui fait échouer le build si un chiffre n'a pas de source ou de date.
4. **« Comparaison avec les choix des autres joueurs »** (jeu « Redresser les comptes », ex-« Trouvez 40 milliards ») : ça suppose un serveur pour stocker les réponses. Je ne le fais pas dans la version statique, je le propose en option à la fin (par exemple Vercel KV, quelques lignes).
5. **Indicateurs en direct** : récupérés **au moment du build** (API BCE Data Portal, Insee BDM, Banque de France Webstat). Le site reste statique, une GitHub Action le reconstruit chaque nuit, et la date affichée est celle de la dernière mise à jour. Si une API échoue, on retombe sur le JSON avec sa date.

---

## 2. Arborescence des pages

```
/                                   Accueil : accroche, 2 parcours « Je découvre » / « J'approfondis » (avec progression), France en 10 chiffres
/parcours                           « Comprendre la dette en 10 minutes » (7 étapes, avance pas à pas)
/la-france-en-10-chiffres
/modules                            Sommaire des modules, progression de lecture
/modules/les-bases                  M0     ├ /pib · /recettes-depenses · /administrations · /inflation-taux-reels
/modules/deficit-et-dette           M1     ├ /flux-et-stock · /soldes · /maastricht · /composition · /histoire · /europe
/modules/emprunt-etat               M2     ├ /aft-adjudications · /oat-btf · /prix-et-taux · /taux-apparent · /detenteurs · /spread-notation
/modules/boule-de-neige             M3     ├ /formule · /simulateur · /cercles · /cout-opportunite · /chiffrage
/modules/banque-centrale            M4     ├ /bce-eurosysteme · /qe · /bilan-bdf · /cadre-juridique · /signal-marches · /grece
/modules/retraites                  M5     ├ /trois-etages · /repartition-capitalisation · /demographie · /leviers · /notions · /transition
/modules/fiche-de-paie              M5bis  (une page, simulateur au centre)
/modules/fiscalite                  M6     ├ /qui-paie · /assiette-rendement · /taxer-les-riches · /smic · /blocage-prix
/modules/cadre-europeen             M6bis  ├ /regles · /deficit-excessif · /notation · /solidarite
/modules/dette-en-perspective       M6ter
/modules/comparaisons               M6quater
/modules/histoire-des-dettes        M6quinquies
/propositions                       M6sexies : grille des 15 fiches, filtrables par badge
/propositions/[slug]                une fiche
/tableau-de-bord                    M7
/jeux/redresser-les-comptes         Jeu principal : 3 niveaux d'objectif, 40 à 60 mesures chiffrées
/jeux/ministre-des-finances         M8, bonus de fin (redirection depuis /jeu-budget)
/idees-recues                       15 à 20 affirmations, verdict, lien vers le module concerné
/glossaire                          ≥ 60 termes, recherche, ancre par terme (#spread)
/sources                            sources, hypothèses des simulateurs, limites, date de mise à jour
```

Chaque module : une page d'intro (objectifs, plan, durée de lecture), des sous-pages courtes, un **quiz de 5 questions** à la fin, le fil d'Ariane, l'interrupteur **Simple / Approfondi** en haut, et une barre de progression (stockée dans `localStorage`, pas de compte utilisateur).

---

## 3. Composants

### Briques pédagogiques (communes à tous les modules)
| Composant | Rôle |
|---|---|
| `<Niveaux>` + `<Essentiel>`, `<Mecanisme>`, `<PlusLoin>` | Les 3 niveaux dépliables (« L'essentiel » ouvert par défaut) |
| `<Terme id="spread">` | Mot souligné qui ouvre l'infobulle du glossaire (clavier, mobile, lien vers la fiche) |
| `<Debat>` | Encadré « Ce que disent les uns / ce que disent les autres », avec les chiffres de chaque côté |
| `<Verdict niveau="solide | debattu | ne-tient-pas">` | Badge et justification (fiches propositions, idées reçues) |
| `<ExempleChiffre>` | Encadré « Exemple » au style homogène |
| `<Formule>` | Formule affichée en clair (KaTeX en niveau 3) |
| `<Figure source=… date=…>` | Cadre de tout graphique : titre, **résumé textuel accessible**, « Source : … — données au JJ/MM/AAAA », bouton **Partager (PNG avec la source incrustée)** |
| `<Chiffre id="dette.stock">` | Affiche une valeur tirée de `data/`, mise en forme en français (« 3 482 Md€ »). Aucun chiffre écrit en dur |
| `<Quiz>` | 5 questions, explication après chaque réponse, score |
| `useScenario` + `<BarreScenario>` + `<Curseur reference>` | **Obligatoire dans tout simulateur ou schéma interactif** : valeurs de départ = chiffres actuels de `data/*.json` (ou valeurs de départ d'un exemple), repère de la valeur actuelle sur chaque curseur, mention « Scénario modifié », réglages modifiés mis en évidence, bouton « Revenir aux chiffres actuels ». Un test refuse tout simulateur qui ne les utilise pas |
| `<FilAriane>`, `<ProgressionModule>`, `<NavModule>` (précédent / suivant) | Navigation |
| `<ThemeToggle>` | Clair / sombre / système |
| `<ModeLecture>` | Interrupteur « Simple / Approfondi » (en haut de chaque module et dans le menu) |
| `<BarreParcours>` | Sur une page qui fait partie du parcours en cours : « Je découvre · étape 4 / 14 », progression, étape suivante |

### Visuels et simulateurs (par module)
| Module | Composants interactifs |
|---|---|
| M0 | `SankeyFinancesPubliques` (D3, cliquable), `Pour100Euros` (pièces), `RepartitionAPU` (4 sous-secteurs), `TauxReelCalculateur` |
| M1 | `Baignoire` (robinet = déficit, niveau = dette, curseur), `SoldesDecomposes`, `DetteParAPU` (aires empilées), `HistoriqueDettePIB` (1978→, chocs annotés), `ComparaisonEurope` |
| M2 | `SimulateurAdjudication` (l'utilisateur fait une offre de prix), `FluxOAT` (frise des coupons), `ExempleBTF`, `PrixTauxObligation`, `CouchesDeDette` (refinancement par tranches), `DetenteursDette` (camembert), `CourbeDesTaux`, `SpreadOATBund` |
| M3 | `SimulateurBouleDeNeige` (r, g, solde primaire sur 10 à 30 ans, bouton « stabiliser »), `ScenariosGuides`, `CercleVicieux` (boucle animée, bascule vers le cercle vertueux), `CoutOpportunite`, `ChiffrageProgramme` |
| M4 | `BilanBanqueDeFrance` (3 scénarios animés avec 100 € fictifs), `TauxDirecteurs`, `ChronologieQE`, `FriseGrece` |
| M5 | `RepartitionVsCapitalisation` (animation côte à côte), `PersonnagesDemographie` (actifs par retraité, 1960→2070), `SimulateurLeviersRetraite` (3 curseurs → solde en % du PIB, salaire net, pension), `DoubleCharge`, `ComparaisonRetraitesEurope` |
| M5bis | `SimulateurFicheDePaie` (cascade coût employeur → brut → net → net après impôt), `VentilationCotisations` (barres empilées), `PanierTVA` |
| M6 | `DecilesPrelevements`, `AssietteTauxRendement`, `SimulateurTaxerLesRiches` (taux, besoin, épuisement du stock, effets de comportement, comparaison avec 1 point de TVA ou de CSG) |
| M6bis | `TrajectoireRegles`, `FriseNotations`, `EchelleNotes` |
| M6ter | `DetteParHabitant`, `ChargeVsMinisteres`, `BilanAPU` (dette brute / nette), `DetteImplicite` |
| M6quater | `ComparateurPays` (indicateur × pays), `DepenseParFonction`, `JaponVsGrece` |
| M6quinquies | `FriseSortiesDeCrise` |
| M7 | `CarteIndicateur` × 7 (valeur, variation, sparkline, date, lien vers l'explication) |
| Jeu principal | `RedresserLesComptes` : choix du niveau, encadré « stabiliser ou supprimer le déficit » avec 3 mini-trajectoires, liste de mesures par catégorie, jauge (Md€ et points de PIB), graphique « qui paie », compteur de réalisme, bascule prudente / centrale / optimiste, écran de fin (trajectoire 10 ans, synthèse, limites, partage PNG) |
| M8 (bonus) | `JeuMinistre` (tableau de bord du mandat, événements aléatoires, score, hypothèses visibles) |
| Transverse | `IdeesRecues` (cartes à retourner), `GlossaireRecherche`, `CartesParcours` (accueil) |

---

## 4. Données

### Format d'une donnée (`data/*.json`)
```json
{
  "id": "dette.stock",
  "label": "Dette publique au sens de Maastricht",
  "valeur": 3482.2,
  "unite": "Md€",
  "date": "2026-03-31",
  "source": { "nom": "Insee, Informations rapides n° …", "url": "https://www.insee.fr/…" },
  "statut": "verifie",
  "consulte_le": "2026-10-20",
  "note": "Fin du T1 2026"
}
```
Séries (historiques, projections) : même en-tête, avec `"serie": [{ "x": "1978", "y": 21.2 }, …]` au lieu de `valeur`.
`statut` vaut `verifie` ou `a_verifier`. Un script génère `A_VERIFIER.md` à partir de tous les `a_verifier` : la liste ne peut donc jamais être en retard sur les données.

### Fichiers
| Fichier | Contenu | Sources principales |
|---|---|---|
| `macro.json` | PIB, croissance, inflation, chômage, emploi | Insee, Eurostat |
| `finances-publiques.json` | Recettes et dépenses par nature et par fonction (Sankey), part de chaque APU | Insee (comptes nationaux), PLF |
| `dette.json` | Stock, ratio, composition par APU, solde public, primaire, structurel, série 1978→ | Insee, Cour des comptes |
| `aft.json` | Dette négociable, maturité moyenne, programme d'émission, détenteurs, courbe des taux | AFT, Banque de France |
| `banque-centrale.json` | Taux directeurs, encours PSPP et PEPP, part détenue par l'Eurosystème, résultat de la BdF | BCE, Banque de France |
| `retraites.json` | Dépenses, rapport démographique 1960→2070, projections du COR, taux de remplacement | COR, DREES |
| `cotisations.json` | Taux et plafonds de l'année, barème de l'IR, allègements | URSSAF, service-public.fr, impots.gouv.fr |
| `fiscalite.json` | Rendement par impôt, prélèvements obligatoires, déciles, patrimoine des plus grandes fortunes | Insee, DGFiP, IPP, Conseil des prélèvements obligatoires |
| `europe.json` | Comparaisons entre pays (dette, déficit, dépense par fonction, retraites, emploi) | Eurostat, OCDE, FMI |
| `notations.json` | Historique des notes S&P, Moody's, Fitch | Communiqués des agences, AFT |
| `budgets.json` | Crédits des ministères, charge de la dette | Loi de finances, Cour des comptes |
| `histoire.json`, `propositions.json`, `idees-recues.json` | Données des frises et des fiches (chaque chiffre sourcé) | Selon le cas |
| `mesures-budget.json` | 40 à 60 mesures du jeu « Redresser les comptes » : rendement bas / central / haut, délai, payeurs, incompatibilités, rendement incertain, source, date, statut (schéma propre, validé par son propre test) | Cour des comptes, CAE, rapports parlementaires, IPP, OFCE, Institut Montaigne, Fipeco… |
| `glossaire.json` | ≥ 60 termes : définition courte, définition longue, termes liés | — |

### Calculs : `src/lib/economics.ts` (+ `economics.test.ts`)
`prixObligation`, `rendementActuariel`, `prixBTF`, `tauxReel` (exact et approché), `trajectoireDette` (boule de neige), `soldePrimaireStabilisant`, `tauxApparentParCouches`, `soldeRetraites` (3 leviers), `ficheDePaie`, `impotSurLeRevenu`, `rendementTaxePatrimoine` (avec élasticité), `bilanBanqueCentrale`, `deficitStabilisant` et `objectifsRedresser` (les 3 niveaux du jeu), `agregerMesures` (total selon l'hypothèse, répartition par payeur, réalisme), `modeleJeuMinistre`.
Chaque fonction est testée sur des cas calculables à la main. Exemple : une OAT de 100 € à 10 ans avec un coupon de 2 % vaut 100 € si le taux de marché est de 2 % et 91,47 € s'il est de 3 %.

---

## 5. Étapes livrables (un aperçu à la fin de chacune)

| # | Étape | Contenu |
|---|---|---|
| 1 | **Socle** | Commit de l'existant, export statique, dépendances (MDX, D3, Motion, KaTeX, html-to-image), mode sombre, couleurs des modules, briques pédagogiques, `economics.ts` et ses premiers tests, schéma des données et script `A_VERIFIER.md`, glossaire de départ |
| 2 | **Lecture + M0 + M1 complets** | D'abord les deux niveaux de lecture (interrupteur Simple / Approfondi, mémorisé) et les deux parcours de l'accueil avec leur progression. Puis M0 et M1 : textes, Sankey, baignoire, historique, quiz, chiffres vérifiés. **Pause : tu valides le format avant que je l'applique partout** |
| 3 | M2, M3, M4 | Emprunt, boule de neige, banque centrale |
| 4 | M5, M5bis | Retraites, fiche de paie |
| 5 | M6sexies | Les 15 fiches propositions |
| 6 | M6 à M6quinquies | Fiscalité, cadre européen, perspective, comparaisons, histoire |
| 7 | M7 | Tableau de bord, récupération au build, GitHub Action |
| 8 | Transverse | Glossaire complet, idées reçues, France en 10 chiffres, parcours 10 min, page Sources, **jeu « Redresser les comptes »**, puis **« Ministre des Finances » en bonus** |

À la fin de chaque étape : `npm test`, `npm run build`, vérification du rendu sur mobile (375 px) et en sombre dans le navigateur, mise à jour de `A_VERIFIER.md`, capture d'écran pour toi.

---

## 6. Points de vigilance

- **Vérification des chiffres** : je consulte chaque source officielle en ligne au fil des modules. Les ordres de grandeur du prompt sont des points de départ, pas des valeurs acquises. Ce que je ne peux pas confirmer reste `a_verifier`.
- **Fiche de paie** : les taux changent chaque année et dépendent du statut (cadre ou non) et de la taille de l'entreprise. Le simulateur le signale clairement.
- **Neutralité** (règle mise à jour le 21/10/2026) :
  - Par défaut, les analyses portent sur des mécanismes, sans nommer de parti ni de responsable politique.
  - **Exception** : on peut nommer un parti ou un gouvernement quand on lui attribue factuellement une proposition ou un chiffrage, **avec la source** (texte déposé au Parlement, loi, programme, déclaration rapportée par un média ou une institution).
  - **Égalité de traitement obligatoire** : quand une fiche nomme les porteurs d'une proposition, elle nomme aussi, avec le même niveau de détail et de source, ceux des propositions comparables ou opposées sur le même sujet (par exemple, pour les retraites : La France insoumise pour 60 ans et 40 annuités, le Rassemblement national pour 60 ans et 40 annuités pour les carrières commencées avant 20 ans, la réforme de 2023 du gouvernement pour 64 ans).
  - **Les verdicts portent sur la proposition, jamais sur le parti** : aucun nom de parti dans un encadré de verdict.
  - Un test vérifie que toute fiche qui nomme un parti en nomme au moins un autre (ou un gouvernement), et qu'aucun verdict ne nomme de parti.
- **Volume** : c'est un gros projet (une vingtaine de simulateurs, des centaines de chiffres sourcés). Chaque étape aboutit à un site fonctionnel. Rien n'est laissé à moitié branché.

---

## 7. Ajustements du 20/10/2026

### 7.1 Deux niveaux de lecture sur tout le site (étape 2, avant M0 et M1)

- **Interrupteur « Simple / Approfondi »** en haut de chaque module, rappelé dans le menu. Le choix est mémorisé pour toute la visite (`localStorage`). Si le stockage est indisponible, l'interrupteur marche quand même, sans mémoire.
- Comme le thème, le mode est appliqué par un petit script avant le premier affichage (attribut `data-lecture` sur `<html>`) : pas de saut de mise en page au chargement.
- **Ce que change le mode :**
  - « L'essentiel » et « Le mécanisme » sont ouverts dans les deux modes : l'exemple chiffré reste visible en mode Simple.
  - « Pour aller plus loin » (formules, nuances, débats d'économistes) est **replié en mode Simple** et ouvert en mode Approfondi.
  - Les encadrés « Débat » suivent la même règle.
  - Dans les deux modes, chaque bloc reste dépliable ou repliable individuellement.
- **Deux parcours sur l'accueil**, chacun avec sa barre de progression :
  - **« Je découvre »** (≈ 30 min, mode Simple par défaut) : une sélection de sections essentielles, dans cet ordre : bases → déficit et dette → emprunt de l'État → retraites → fiche de paie → propositions passées au crible.
  - **« J'approfondis »** (mode Approfondi par défaut) : tous les modules et toutes leurs sections.
  - Démarrer un parcours règle le mode, sans empêcher de le changer ensuite.
  - Sur une page du parcours en cours, une barre rappelle l'étape et mène à la suivante.
  - Les étapes des modules pas encore écrits apparaissent comme « bientôt » et ne comptent pas dans la progression.
- Le parcours « Comprendre la dette en 10 minutes » du cahier des charges reste prévu à l'étape 8, comme entrée express. Il pourra être fusionné avec « Je découvre » si tu le préfères.

### 7.2 Le jeu « Redresser les comptes » (étape 8, avant « Ministre des Finances »)

- **Principe** : trouver un effort budgétaire annuel en choisissant parmi des mesures réelles et chiffrées, avec l'effet en direct sur le déficit, la dette, et la répartition de l'effort.
- **Trois niveaux d'objectif, tous calculés à partir de `data/*.json`, jamais en dur :**
  1. « Le budget de l'année » : l'ordre de grandeur de l'effort annuel des derniers budgets (≈ 40 Md€, montant et source à vérifier).
  2. « Stabiliser la dette » : effort = déficit actuel − déficit stabilisant, avec un déficit stabilisant ≈ croissance nominale × dette/PIB. Le calcul est affiché avec ses chiffres, et le joueur peut changer l'hypothèse de croissance nominale.
  3. « Zéro déficit » : effort = déficit actuel en Md€.
- **Avant de jouer** : un encadré explique la différence entre stabiliser la dette (on reste en déficit, mais la dette/PIB cesse de monter) et supprimer le déficit (la dette/PIB baisse). Il est accompagné d'une mini-trajectoire sur 10 ans pour chacun des trois niveaux.
- **Les mesures** (`data/mesures-budget.json`, 40 à 60) :
  - Catégories : retraites, santé, prestations sociales, fonction publique, collectivités, aides aux entreprises et niches fiscales, défense, éducation, impôts sur les ménages, impôts sur les entreprises, fiscalité du patrimoine, TVA et consommation, lutte contre la fraude.
  - Pour chaque mesure : intitulé, explication courte, rendement bas / central / haut, délai (immédiat, 2-3 ans, long terme), payeurs (ménages modestes, classes moyennes, ménages aisés, retraités, actifs, fonctionnaires, entreprises, collectivités), source, date, statut.
  - Les variantes d'une même réforme sont incompatibles entre elles. Les mesures à rendement incertain (fraude…) sont signalées, avec un rendement central prudent.
- **Pendant le jeu** :
  - jauge vers l'objectif (Md€ et points de PIB) ;
  - graphique « qui paie » ;
  - compteur de réalisme (part des mesures à effet immédiat ou à long terme, part des recettes incertaines) ;
  - bascule prudente / centrale / optimiste.
- **Écran de fin** :
  - écart à l'objectif ;
  - trajectoire de la dette/PIB sur 10 ans, comparée au scénario sans mesure ;
  - synthèse « Votre budget » (répartition dépenses / recettes, catégories les plus sollicitées) ;
  - limites affichées (estimations « toutes choses égales par ailleurs », sans effets sur la croissance ni les comportements sauf mention), avec un lien vers la page Sources et méthodologie ;
  - partage en PNG avec les sources.
- **Neutralité** : aucune mesure n'est qualifiée de bonne ou de mauvaise. Le jeu montre les montants et qui paie, le joueur juge.
- **Tests** : cas chiffrés sur les objectifs des trois niveaux et sur l'agrégation des mesures (`economics.ts`). Les mesures non vérifiées vont dans `A_VERIFIER.md`, et le générateur s'étend à `mesures-budget.json`.
