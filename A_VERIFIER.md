# Chiffres à vérifier

Fichier généré par `npm test` à partir des données marquées `"statut": "a_verifier"` dans `data/*.json`. Ne pas modifier à la main : corriger la donnée dans son fichier JSON, passer son statut à `verifie`, puis relancer `npm test`.

8 chiffres en attente de vérification.

## data/aft.json

| Identifiant | Donnée | Valeur actuelle | Date | Source à consulter | Remarque |
|---|---|---|---|---|---|
| `aft.dette-negociable` | Dette négociable de l'État | 2858 Md€ | 2026-06-30 | [Agence France Trésor, bulletin mensuel n° 434 (juillet 2026)](https://www.aft.gouv.fr/files/medias-aft/7_Publications/7.2_BM/434_Bulletin%20mensuel%20juillet%202026.pdf) | Chiffre lu dans l'extrait publié du bulletin ; le PDF de l'AFT refuse les téléchargements automatisés (erreur 403), il reste à le confirmer en ouvrant le bulletin. |
| `aft.dette-negociable-indexee` | dont titres indexés sur l'inflation | 311 Md€ | 2026-06-30 | [Agence France Trésor, bulletin mensuel n° 434 (juillet 2026)](https://www.aft.gouv.fr/files/medias-aft/7_Publications/7.2_BM/434_Bulletin%20mensuel%20juillet%202026.pdf) | Chiffre lu dans l'extrait publié du bulletin ; le PDF de l'AFT refuse les téléchargements automatisés (erreur 403), il reste à le confirmer en ouvrant le bulletin. |
| `aft.dette-court-terme` | dont dette à court terme (BTF) | 221 Md€ | 2026-06-30 | [Agence France Trésor, bulletin mensuel n° 434 (juillet 2026)](https://www.aft.gouv.fr/files/medias-aft/7_Publications/7.2_BM/434_Bulletin%20mensuel%20juillet%202026.pdf) | Chiffre lu dans l'extrait publié du bulletin ; le PDF de l'AFT refuse les téléchargements automatisés (erreur 403), il reste à le confirmer en ouvrant le bulletin. |
| `aft.maturite-moyenne` | Durée de vie moyenne de la dette négociable | 8.5 ans | 2026-06-30 | [Agence France Trésor, bulletin mensuel n° 434 (juillet 2026)](https://www.aft.gouv.fr/files/medias-aft/7_Publications/7.2_BM/434_Bulletin%20mensuel%20juillet%202026.pdf) | 8 ans et 180 jours. Chiffre lu dans l'extrait publié du bulletin ; le PDF de l'AFT refuse les téléchargements automatisés (erreur 403), il reste à le confirmer en ouvrant le bulletin. |
| `aft.detenteurs` | Détenteurs de la dette négociable de l'État | série (4 points, %) | 2025-12-31 | [Agence France Trésor, bulletin mensuel n° 433 (juin 2026), données Banque de France](https://www.aft.gouv.fr/files/medias-aft/7_Publications/7.2_BM/433_Bulletin%20mensuel%20juin%202026.pdf) | « Autres résidents » calculé par différence. Les titres achetés par la Banque de France pour l'Eurosystème sont comptés parmi les résidents. Chiffre lu dans l'extrait publié du bulletin ; le PDF de l'AFT refuse les téléchargements automatisés (erreur 403), il reste à le confirmer en ouvrant le bulletin. |

## data/cotisations.json

| Identifiant | Donnée | Valeur actuelle | Date | Source à consulter | Remarque |
|---|---|---|---|---|---|
| `ir.abattement-min` | Abattement de 10 % pour frais professionnels : minimum | 509 € | 2026 | [Weblex, Déduction forfaitaire de 10 % pour frais professionnels (déclaration 2026)](https://www.weblex.fr/chiffres-cles/deduction-forfaitaire-de-10-pour-frais-professionnels-declaration-2026) | Revenus 2025. Montant concordant dans plusieurs sources, à confirmer sur impots.gouv.fr. |
| `ir.abattement-max` | Abattement de 10 % pour frais professionnels : maximum | 14555 € | 2026 | [Weblex, Déduction forfaitaire de 10 % pour frais professionnels (déclaration 2026)](https://www.weblex.fr/chiffres-cles/deduction-forfaitaire-de-10-pour-frais-professionnels-declaration-2026) | Revenus 2025. Montant concordant dans plusieurs sources, à confirmer sur impots.gouv.fr. |

## data/dette.json

| Identifiant | Donnée | Valeur actuelle | Date | Source à consulter | Remarque |
|---|---|---|---|---|---|
| `deficit.structurel` | Déficit structurel | 5 % du PIB | 2025 | [Haut Conseil des finances publiques, avis n° HCFP-2026-2 du 16 avril 2026](https://www.assemblee-nationale.fr/dyn/contenu/visualisation/1109784/file/Avis%20HCFP%20PLRG%202025-Final.pdf) | L'avis indique une composante structurelle « proche de 5 points de PIB » après une baisse de 0,8 point en 2025 : valeur exacte à relever. |
