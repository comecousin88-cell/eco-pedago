# Chiffres à vérifier

Fichier généré par `npm test` à partir des données marquées `"statut": "a_verifier"` dans `data/*.json`. Ne pas modifier à la main : corriger la donnée dans son fichier JSON, passer son statut à `verifie`, puis relancer `npm test`.

8 chiffres en attente de vérification, et 26 mesures du jeu « Redresser les comptes ».

## data/aft.json

| Identifiant | Donnée | Valeur actuelle | Date | Source à consulter | Remarque |
|---|---|---|---|---|---|
| `aft.maturite-moyenne` | Durée de vie moyenne de la dette négociable | 8.5 ans | 2026-06-30 | [Agence France Trésor, bulletin mensuel n° 434 (juillet 2026)](https://www.aft.gouv.fr/files/medias-aft/7_Publications/7.2_BM/434_Bulletin%20mensuel%20juillet%202026.pdf) | 8 ans et 180 jours. Chiffre lu dans l'extrait publié du bulletin ; le PDF de l'AFT refuse les téléchargements automatisés (erreur 403), il reste à le confirmer en ouvrant le bulletin. |
| `aft.detenteurs` | Détenteurs de la dette négociable de l'État | série (4 points, %) | 2025-12-31 | [Agence France Trésor, bulletin mensuel n° 433 (juin 2026), données Banque de France](https://www.aft.gouv.fr/files/medias-aft/7_Publications/7.2_BM/433_Bulletin%20mensuel%20juin%202026.pdf) | « Autres résidents » calculé par différence. Les titres achetés par la Banque de France pour l'Eurosystème sont comptés parmi les résidents. Chiffre lu dans l'extrait publié du bulletin ; le PDF de l'AFT refuse les téléchargements automatisés (erreur 403), il reste à le confirmer en ouvrant le bulletin. |

## data/cadre-europeen.json

| Identifiant | Donnée | Valeur actuelle | Date | Source à consulter | Remarque |
|---|---|---|---|---|---|
| `notation.france` | Notes de la dette à long terme de la France (Fitch, S&P, Moody's) | série (3 points, rang sur l'échelle (1 = AAA)) | 2026-10 | [Agences de notation (communiqués de Fitch, S&P Global et Moody's)](https://www.aft.gouv.fr/fr/notations-souveraines) | A+ chez Fitch (confirmée le 28 août 2026) et S&P, Aa3 perspective négative chez Moody's (note et perspective maintenues le 23 octobre 2026, selon Euronews et Xinhua). À confirmer sur la page de l'Agence France Trésor. |

## data/cotisations.json

| Identifiant | Donnée | Valeur actuelle | Date | Source à consulter | Remarque |
|---|---|---|---|---|---|
| `ir.abattement-min` | Abattement de 10 % pour frais professionnels : minimum | 509 € | 2026 | [Weblex, Déduction forfaitaire de 10 % pour frais professionnels (déclaration 2026)](https://www.weblex.fr/chiffres-cles/deduction-forfaitaire-de-10-pour-frais-professionnels-declaration-2026) | Revenus 2025. Montant concordant dans plusieurs sources, à confirmer sur impots.gouv.fr. |
| `ir.abattement-max` | Abattement de 10 % pour frais professionnels : maximum | 14555 € | 2026 | [Weblex, Déduction forfaitaire de 10 % pour frais professionnels (déclaration 2026)](https://www.weblex.fr/chiffres-cles/deduction-forfaitaire-de-10-pour-frais-professionnels-declaration-2026) | Revenus 2025. Montant concordant dans plusieurs sources, à confirmer sur impots.gouv.fr. |

## data/dette.json

| Identifiant | Donnée | Valeur actuelle | Date | Source à consulter | Remarque |
|---|---|---|---|---|---|
| `deficit.structurel` | Déficit structurel | 5 % du PIB | 2025 | [Haut Conseil des finances publiques, avis n° HCFP-2026-2 du 16 avril 2026](https://www.assemblee-nationale.fr/dyn/contenu/visualisation/1109784/file/Avis%20HCFP%20PLRG%202025-Final.pdf) | L'avis indique une composante structurelle « proche de 5 points de PIB » après une baisse de 0,8 point en 2025 : valeur exacte à relever. |

## data/fiscalite.json

| Identifiant | Donnée | Valeur actuelle | Date | Source à consulter | Remarque |
|---|---|---|---|---|---|
| `is.taux-normal` | Taux normal de l'impôt sur les sociétés | 25 % | 2026 | [Service-public.fr (entreprendre), Impôt sur les sociétés : taux](https://entreprendre.service-public.gouv.fr/vosdroits/F23575) | Taux normal depuis 2022 ; taux réduit de 15 % pour une partie du bénéfice des PME. Une contribution exceptionnelle s'applique aux plus grandes entreprises : à vérifier pour 2026. |

## data/propositions.json

| Identifiant | Donnée | Valeur actuelle | Date | Source à consulter | Remarque |
|---|---|---|---|---|---|
| `prop.dix-premieres-fortunes-part` | Part des dix plus grandes fortunes dans le patrimoine du classement des 500 plus grandes fortunes | 70 % | 2024 | [Sénat, rapport n° 689 (2024-2025) sur l'impôt plancher de 2 % sur les très hauts patrimoines (4 juin 2025)](https://www.senat.fr/rap/l24-689/l24-6891.html) | Ordre de grandeur cité par le rapport du Sénat (« environ 70 % ») ; le passage exact du rapport reste à relever. |

## data/mesures-budget.json (jeu « Redresser les comptes »)

| Identifiant | Mesure | Rendement bas / central / haut | Source à consulter | Remarque |
|---|---|---|---|---|
| `ret-sous-index-hautes` | Sous-indexer seulement les pensions au-dessus de 1 260 € par mois | 3 / 4.1 / 4.5 Md€ | [Presse (MoneyVox, octobre 2026), projet de loi de financement de la sécurité sociale pour 2027 : sous-indexation et abattement](https://www.moneyvox.fr/retraite/actualites/110585/retraites-2027-sous-indexation-et-baisse-de-abattement-les-seuils-valides-par-le-gouvernement) | Chiffrage gouvernemental rapporté par la presse pour le budget 2027 ; taux et seuils non définitifs. |
| `ret-abattement` | Abaisser le plafond de l'abattement fiscal de 10 % sur les pensions | 1 / 1.4 / 1.8 Md€ | [Presse (MoneyVox, octobre 2026), projet de loi de financement de la sécurité sociale pour 2027 : sous-indexation et abattement](https://www.moneyvox.fr/retraite/actualites/110585/retraites-2027-sous-indexation-et-baisse-de-abattement-les-seuils-valides-par-le-gouvernement) | Ordre de grandeur rapporté par la presse pour le budget 2027. |
| `ret-64-reprise` | Reprendre dès 2027 le relèvement de l'âge vers 64 ans | 0.5 / 1.5 / 2 Md€ | [Ordre de grandeur à documenter (annexe « Voies et moyens » du PLF, rapports de la Cour des comptes et des revues de dépenses)](https://www.budget.gouv.fr/documentation/documents-budgetaires) | Coût de la suspension estimé à quelques centaines de millions d'euros en 2026 et à plus d'un milliard en 2027 : à vérifier dans l'étude d'impact de la LFSS 2026. |
| `sante-franchises` | Doubler les franchises médicales | 0.5 / 0.8 / 1 Md€ | [Ordre de grandeur à documenter (annexe « Voies et moyens » du PLF, rapports de la Cour des comptes et des revues de dépenses)](https://www.budget.gouv.fr/documentation/documents-budgetaires) | Mesure envisagée puis abandonnée pour 2026 ; chiffrage à vérifier. |
| `sante-arrets` | Réduire l'indemnisation des arrêts maladie de courte durée | 0.4 / 0.7 / 1 Md€ | [Ordre de grandeur à documenter (annexe « Voies et moyens » du PLF, rapports de la Cour des comptes et des revues de dépenses)](https://www.budget.gouv.fr/documentation/documents-budgetaires) |  |
| `prest-gel` | Geler pendant un an les prestations sociales (hors minima sociaux) | 1 / 2 / 3 Md€ | [Ordre de grandeur à documenter (annexe « Voies et moyens » du PLF, rapports de la Cour des comptes et des revues de dépenses)](https://www.budget.gouv.fr/documentation/documents-budgetaires) | Ordre de grandeur : 1 à 1,5 Md€ par point d'inflation selon le champ retenu. |
| `prest-chomage` | Raccourcir la durée d'indemnisation du chômage | 1 / 2 / 3 Md€ | [Ordre de grandeur à documenter (annexe « Voies et moyens » du PLF, rapports de la Cour des comptes et des revues de dépenses)](https://www.budget.gouv.fr/documentation/documents-budgetaires) | L'effet dépend de la conjoncture et des retours à l'emploi. |
| `prest-logement` | Recentrer les aides au logement | 0.5 / 1 / 1.5 Md€ | [Ordre de grandeur à documenter (annexe « Voies et moyens » du PLF, rapports de la Cour des comptes et des revues de dépenses)](https://www.budget.gouv.fr/documentation/documents-budgetaires) |  |
| `fp-point` | Ne pas revaloriser le point d'indice des fonctionnaires | 2 / 2.1 / 4 Md€ | [Acteurs publics, citant la Cour des comptes : coût d'une hausse de 1 % du point d'indice](https://acteurspublics.fr/articles/la-facture-de-la-hausse-du-point-dindice-pour-chacun-des-3-versants-de-la-fonction-publique) | 2,07 Md€ pour 1 % sur les trois fonctions publiques selon la Cour des comptes ; plus si l'inflation justifiait une hausse plus forte. |
| `fp-effectifs` | Réduire d'1 % les effectifs de la fonction publique d'État | 0.5 / 1 / 1.2 Md€ | [Ordre de grandeur à documenter (annexe « Voies et moyens » du PLF, rapports de la Cour des comptes et des revues de dépenses)](https://www.budget.gouv.fr/documentation/documents-budgetaires) |  |
| `fp-carence` | Instaurer trois jours de carence pour les agents publics | 0.2 / 0.3 / 0.5 Md€ | [Ordre de grandeur à documenter (annexe « Voies et moyens » du PLF, rapports de la Cour des comptes et des revues de dépenses)](https://www.budget.gouv.fr/documentation/documents-budgetaires) |  |
| `ent-allegements-haut` | Supprimer les allègements de cotisations au-delà de 2,5 Smic | 1.5 / 1.6 / 2 Md€ | [Ordre de grandeur à documenter (annexe « Voies et moyens » du PLF, rapports de la Cour des comptes et des revues de dépenses)](https://www.budget.gouv.fr/documentation/documents-budgetaires) | Environ 1,6 Md€ en 2022 selon le rapport Bozio-Wasmer, cité au Parlement. |
| `ent-cir` | Recentrer le crédit d'impôt recherche | 0.5 / 1 / 2 Md€ | [Ordre de grandeur à documenter (annexe « Voies et moyens » du PLF, rapports de la Cour des comptes et des revues de dépenses)](https://www.budget.gouv.fr/documentation/documents-budgetaires) |  |
| `ent-niches` | Supprimer 23 dépenses fiscales jugées peu efficaces | 3 / 5 / 5 Md€ | [Projet de loi de finances 2026 : suppression de 23 dépenses fiscales (cité par un rapport d'orientation budgétaire local)](https://www.cig929394.fr/wp-content/uploads/2026/03/Annexe-C-ROB.pdf) | Environ 5 Md€ dans le projet initial du budget 2026 ; liste et montants définitifs à vérifier. |
| `etat-gel` | Geler en valeur les crédits des ministères (hors défense et charge de la dette) | 3 / 5 / 7 Md€ | [Ordre de grandeur à documenter (annexe « Voies et moyens » du PLF, rapports de la Cour des comptes et des revues de dépenses)](https://www.budget.gouv.fr/documentation/documents-budgetaires) |  |
| `edu-demographie` | Adapter les effectifs d'enseignants à la baisse du nombre d'élèves | 0.5 / 1 / 2 Md€ | [Ordre de grandeur à documenter (annexe « Voies et moyens » du PLF, rapports de la Cour des comptes et des revues de dépenses)](https://www.budget.gouv.fr/documentation/documents-budgetaires) |  |
| `csg-retraites` | Aligner la CSG des retraités aisés sur celle des actifs | 1.5 / 2 / 2.5 Md€ | [Ordre de grandeur à documenter (annexe « Voies et moyens » du PLF, rapports de la Cour des comptes et des revues de dépenses)](https://www.budget.gouv.fr/documentation/documents-budgetaires) |  |
| `ir-gel-bareme` | Ne pas indexer le barème de l'impôt sur le revenu pendant un an | 1 / 2 / 3 Md€ | [Ordre de grandeur à documenter (annexe « Voies et moyens » du PLF, rapports de la Cour des comptes et des revues de dépenses)](https://www.budget.gouv.fr/documentation/documents-budgetaires) | Environ 1 Md€ par point d'inflation, ordre de grandeur souvent cité : à vérifier. |
| `ir-hauts-revenus` | Pérenniser la contribution différentielle sur les très hauts revenus | 1 / 1.5 / 2 Md€ | [Ordre de grandeur à documenter (annexe « Voies et moyens » du PLF, rapports de la Cour des comptes et des revues de dépenses)](https://www.budget.gouv.fr/documentation/documents-budgetaires) |  |
| `ir-tranche` | Créer une tranche d'impôt sur le revenu à 50 % | 0.3 / 0.7 / 1 Md€ | [Ordre de grandeur à documenter (annexe « Voies et moyens » du PLF, rapports de la Cour des comptes et des revues de dépenses)](https://www.budget.gouv.fr/documentation/documents-budgetaires) | Rendement sensible aux comportements d'optimisation. |
| `is-surtaxe` | Prolonger la surtaxe d'impôt sur les sociétés des grandes entreprises | 3 / 4 / 8 Md€ | [Ordre de grandeur à documenter (annexe « Voies et moyens » du PLF, rapports de la Cour des comptes et des revues de dépenses)](https://www.budget.gouv.fr/documentation/documents-budgetaires) |  |
| `is-rachats` | Taxer les rachats d'actions des grandes entreprises | 0.2 / 0.4 / 0.8 Md€ | [Ordre de grandeur à documenter (annexe « Voies et moyens » du PLF, rapports de la Cour des comptes et des revues de dépenses)](https://www.budget.gouv.fr/documentation/documents-budgetaires) |  |
| `pat-successions` | Alourdir l'imposition des grosses successions | 1 / 2.5 / 4 Md€ | [Ordre de grandeur à documenter (annexe « Voies et moyens » du PLF, rapports de la Cour des comptes et des revues de dépenses)](https://www.budget.gouv.fr/documentation/documents-budgetaires) |  |
| `pat-pfu` | Relever de 30 % à 33 % le prélèvement forfaitaire sur les revenus du capital | 1 / 1.5 / 2 Md€ | [Ordre de grandeur à documenter (annexe « Voies et moyens » du PLF, rapports de la Cour des comptes et des revues de dépenses)](https://www.budget.gouv.fr/documentation/documents-budgetaires) |  |
| `tva-reduits` | Supprimer certains taux réduits de TVA | 2 / 4 / 6 Md€ | [Ordre de grandeur à documenter (annexe « Voies et moyens » du PLF, rapports de la Cour des comptes et des revues de dépenses)](https://www.budget.gouv.fr/documentation/documents-budgetaires) |  |
| `accise-gazole` | Aligner la taxation du gazole sur celle de l'essence | 1 / 1.8 / 2.2 Md€ | [Ordre de grandeur à documenter (annexe « Voies et moyens » du PLF, rapports de la Cour des comptes et des revues de dépenses)](https://www.budget.gouv.fr/documentation/documents-budgetaires) |  |
