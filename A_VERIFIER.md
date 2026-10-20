# Chiffres à vérifier

Fichier généré par `npm test` à partir des données marquées `"statut": "a_verifier"` dans `data/*.json`. Ne pas modifier à la main : corriger la donnée dans son fichier JSON, passer son statut à `verifie`, puis relancer `npm test`.

8 chiffres en attente de vérification.

## data/aft.json

| Identifiant | Donnée | Valeur actuelle | Date | Source à consulter | Remarque |
|---|---|---|---|---|---|
| `aft.dette-negociable` | Dette négociable de l'État | 2800 Md€ | 2026 | [Agence France Trésor, bulletin mensuel](https://www.aft.gouv.fr) | Ordre de grandeur du cahier des charges. Relever la date exacte du bulletin. |
| `aft.maturite-moyenne` | Maturité moyenne de la dette négociable | 8.5 ans | 2026 | [Agence France Trésor, bulletin mensuel](https://www.aft.gouv.fr) | Ordre de grandeur du cahier des charges (≈ 8,5 ans). |
| `aft.part-eurosysteme` | Part de la dette détenue par l'Eurosystème | 18 % | 2026 | [Banque de France / Agence France Trésor](https://www.banque-france.fr) | Ordre de grandeur du cahier des charges (≈ 18 %). Préciser le dénominateur : dette négociable de l'État ou dette de Maastricht. |

## data/dette.json

| Identifiant | Donnée | Valeur actuelle | Date | Source à consulter | Remarque |
|---|---|---|---|---|---|
| `deficit.structurel` | Déficit structurel | 5 % du PIB | 2025 | [Haut Conseil des finances publiques, avis n° HCFP-2026-2 du 16 avril 2026](https://www.assemblee-nationale.fr/dyn/contenu/visualisation/1109784/file/Avis%20HCFP%20PLRG%202025-Final.pdf) | L'avis indique une composante structurelle « proche de 5 points de PIB » après une baisse de 0,8 point en 2025 : valeur exacte à relever. |
| `dette.charge` | Charge de la dette | 77 Md€ | 2026 | [Cour des comptes](https://www.ccomptes.fr) | Ordre de grandeur du cahier des charges (« ≈ 77 Md€ en 2026 »). Préciser le périmètre : État seul ou ensemble des administrations publiques. |

## data/retraites.json

| Identifiant | Donnée | Valeur actuelle | Date | Source à consulter | Remarque |
|---|---|---|---|---|---|
| `retraites.depenses-pib` | Dépenses de retraite | 14.1 % du PIB | 2025 | [Conseil d'orientation des retraites, rapport annuel](https://www.cor-retraites.fr) | Chiffre du cahier des charges (14,1 % du PIB en 2025). |
| `retraites.depenses-montant` | Dépenses de retraite | 422 Md€ | 2025 | [Conseil d'orientation des retraites, rapport annuel](https://www.cor-retraites.fr) | Chiffre du cahier des charges (422 Md€ en 2025). |
| `retraites.rapport-demographique` | Personnes de 20 à 64 ans pour une personne de 65 ans ou plus | série (2 points, personnes) | 2026 | [Conseil d'orientation des retraites, rapport annuel 2026](https://www.cor-retraites.fr) | Deux points du cahier des charges (2,5 en 2025, ≈ 1,6 en 2070). Série complète 1960-2070 à relever. |
