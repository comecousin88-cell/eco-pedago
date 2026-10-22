# EcoClair

Plateforme pédagogique pour comprendre les finances publiques françaises : déficit, dette, emprunt
de l'État, banque centrale, retraites, fiscalité. Site 100 % statique (Next.js en export statique).

Le cahier des charges est dans [docs/prompt-claude-code-plateforme-eco.md](docs/prompt-claude-code-plateforme-eco.md)
et le plan validé dans [PLAN.md](PLAN.md).

## Commandes

```bash
npm run dev      # serveur de développement sur http://localhost:3000
npm test         # tests (formules, données, contenu) + régénère A_VERIFIER.md
npm run lint
npm run build    # produit le site statique dans out/
```

## Où mettre quoi

| Dossier | Contenu |
|---|---|
| `data/*.json` | **Tous les chiffres**, chacun avec valeur, unité, date, source (nom + URL) et statut (`verifie` / `a_verifier`). Aucun chiffre en dur dans le code. Un nouveau fichier se déclare dans `src/lib/data.ts`. |
| `A_VERIFIER.md` | Généré par `npm test` : la liste des chiffres pas encore vérifiés à la source. Ne pas modifier à la main. |
| `src/lib/economics.ts` | Toutes les formules (obligations, BTF, taux réels, boule de neige…), testées dans `economics.test.ts`. |
| `src/content/modules.ts` | Le registre des modules : titres, sections, couleur, statut. |
| `src/content/glossaire.ts` | Le glossaire (infobulles et page `/glossaire`). |
| `src/components/pedago/` | Les briques utilisables dans tout fichier `.mdx` sans import : `<Niveaux>`, `<Essentiel>`, `<Mecanisme>`, `<PlusLoin>`, `<Terme>`, `<Chiffre>`, `<Figure>`, `<Exemple>`, `<Debat>`, `<Verdict>`, `<ARetenir>`, `<Quiz>`. |
| `src/app/atelier/` | Page de démonstration de toutes les briques (non référencée). |

## Règles de contenu

- Chaque notion suit trois niveaux : l'essentiel, le mécanisme (avec un exemple chiffré), pour aller plus loin.
- Chaque terme technique passe par `<Terme id="…">`.
- Chaque graphique est dans un `<Figure>` avec un résumé en texte et ses identifiants de données (la ligne « Source : … — données au … » se construit toute seule).
- Neutralité : aucun parti ni candidat nommé ; les débats présentent les deux côtés ; un verdict porte sur un mécanisme et ses chiffres.
