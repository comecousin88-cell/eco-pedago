# Mettre « Éco en clair » en ligne, avec mise à jour automatique

Solution retenue, entièrement gratuite et sans clé d'API :

```
GitHub (le code et les données)
  └─ GitHub Actions, chaque matin à 6 h 15 (7 h 15 en été) :
       1. interroge la BCE, Eurostat et l'Insee (npm run maj:indicateurs)
       2. contrôle la vraisemblance des séries
       3. lance les tests, le contrôle du code et la construction du site
       4. si tout passe : enregistre les nouvelles données sur GitHub
Vercel (l'hébergement)
  └─ republie le site automatiquement à chaque enregistrement sur GitHub
```

Si une source ne répond pas, ses dernières valeurs sont conservées avec leur date, et le tableau de bord l'indique. Si un
test échoue, rien n'est publié : le site garde sa version précédente et GitHub vous envoie un courriel.

Ce qui est déjà prêt dans le projet : le script `scripts/maj-indicateurs.ts`, les deux tâches
`.github/workflows/maj-indicateurs.yml` (mise à jour quotidienne) et `.github/workflows/verifications.yml` (tests à chaque
envoi), et l'affichage de la date de dernière vérification sur le tableau de bord.

Il vous reste quatre étapes, qui demandent vos comptes. Comptez une vingtaine de minutes.

---

## Étape 1 : créer un compte GitHub (si vous n'en avez pas)

1. Allez sur <https://github.com/signup> et créez un compte gratuit.
2. Activez la double authentification quand GitHub vous la propose (Paramètres → Password and authentication).

## Étape 2 : créer le dépôt et y envoyer le projet

1. Sur GitHub, cliquez sur **+** (en haut à droite) → **New repository**.
   - Nom : `eco-pedago` (ou un autre).
   - Visibilité : **Public** ou **Private**. Les deux fonctionnent. Un dépôt public a des minutes d'Actions illimitées ;
     un dépôt privé en a 2 000 par mois, largement assez (la tâche quotidienne prend environ 5 minutes).
   - Ne cochez **rien** d'autre (pas de README, pas de .gitignore, pas de licence) : le projet en a déjà.
   - Cliquez sur **Create repository**.
2. GitHub affiche l'adresse du dépôt, par exemple `https://github.com/VOTRE-NOM/eco-pedago.git`. Dans un terminal, depuis le
   dossier `C:\Users\comec\projets\eco-pedago`, lancez (en remplaçant l'adresse) :

   ```bash
   git remote add origin https://github.com/VOTRE-NOM/eco-pedago.git
   ```

   puis :

   ```bash
   git push -u origin main
   ```

   Une fenêtre de connexion GitHub s'ouvre la première fois : connectez-vous dans le navigateur.
3. Sur la page du dépôt, onglet **Actions** : la tâche « Vérifications » doit démarrer et passer au vert en quelques
   minutes.
4. Vérifiez que les tâches automatiques ont le droit d'enregistrer des données : **Settings** → **Actions** → **General** →
   section **Workflow permissions** → cochez **Read and write permissions** → **Save**.

## Étape 3 : publier le site sur Vercel

1. Allez sur <https://vercel.com/signup> et choisissez **Continue with GitHub** (offre gratuite « Hobby »).
2. Autorisez Vercel à accéder à votre dépôt `eco-pedago` (vous pouvez limiter l'accès à ce seul dépôt).
3. Sur le tableau de bord Vercel : **Add New…** → **Project** → choisissez `eco-pedago` → **Import**.
4. Vercel reconnaît Next.js tout seul. Ne changez rien, sauf :
   - **Settings** → **Build and Deployment** → **Node.js Version** : choisissez **24.x** (le projet en a besoin).
5. Cliquez sur **Deploy**. Au bout de deux ou trois minutes, Vercel affiche l'adresse du site, du type
   `https://eco-pedago.vercel.app`.
6. Facultatif : **Settings** → **Domains** pour brancher un nom de domaine à vous.

À partir de là, chaque enregistrement sur GitHub (le vôtre ou celui de la tâche quotidienne) republie le site.

## Étape 4 : tester la mise à jour automatique

1. Sur GitHub, onglet **Actions** → **Mise à jour des indicateurs** → bouton **Run workflow** → **Run workflow**.
2. Au bout de cinq minutes environ, la tâche passe au vert. Son résumé indique, source par source, ce qui a été mis à jour.
3. Un enregistrement « Indicateurs : mise à jour automatique du … » apparaît sur le dépôt (au moins la date de
   vérification change chaque jour), et Vercel republie le site.
4. Sur le site, le tableau de bord affiche « Dernière vérification des sources : le … ».

Ensuite, la tâche tourne seule chaque matin. Vous n'avez rien à faire, sauf si GitHub vous envoie un courriel d'échec.

---

## Questions pratiques

**Faut-il des clés d'API ?** Non. La BCE, Eurostat et l'Insee publient ces séries en accès libre. La Banque de France
(Webstat) demande une clé gratuite, mais aucun indicateur du tableau de bord n'en a besoin aujourd'hui. Si vous voulez
un jour en ajouter un : créez un compte sur <https://webstat.banque-france.fr>, demandez une clé d'API, puis enregistrez-la
sur GitHub dans **Settings** → **Secrets and variables** → **Actions** → **New repository secret** (nom :
`WEBSTAT_CLIENT_ID`). Ne la collez jamais dans le code.

**Que se passe-t-il si une source change son format ?** Les contrôles de vraisemblance (série vide, valeur aberrante,
historique tronqué, date qui recule) rejettent la série : les anciennes valeurs restent, le tableau de bord signale la
source indisponible, et le résumé de la tâche sur GitHub donne la raison.

**Lancer la mise à jour sur mon ordinateur ?** Dans le dossier du projet :

```bash
npm run maj:indicateurs
```

puis `npm test` avant d'enregistrer.

**Ce qui reste à la main.** La dette et le déficit (publications trimestrielles et annuelles de l'Insee), les chiffres des
modules et des fiches, et les chiffres listés dans `A_VERIFIER.md`.

**Une tâche planifiée peut-elle s'arrêter ?** GitHub suspend les tâches planifiées d'un dépôt public sans activité
pendant 60 jours. Ici, la tâche enregistre chaque jour au moins la date de vérification : le dépôt reste actif. Si
GitHub suspend malgré tout la tâche, il envoie un avertissement, et un clic sur **Enable workflow** suffit.
