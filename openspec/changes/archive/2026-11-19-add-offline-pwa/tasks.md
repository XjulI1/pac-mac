# Tasks

## 1. Dépendances

- [x] 1.1 **À lancer par l'utilisateur** : `pnpm add -D vite-plugin-pwa @vite-pwa/assets-generator workbox-window` (`workbox-window` est la dépendance « peer » de `vite-plugin-pwa` requise par le module d'enregistrement). Si pnpm signale le script d'installation de `sharp` comme bloqué, le déclarer dans `allowBuilds` sans l'autoriser. Attendre la confirmation de l'utilisateur, puis vérifier que les trois paquets figurent dans les `devDependencies` et que `pnpm type-check` passe toujours.

## 2. Thème et icônes

- [x] 2.1 Créer `src/theme.ts` s'il n'existe pas (`THEME_BACKGROUND`, `THEME_COLOR`, valeurs des variables CSS de `style.css` posées par `add-game-ui`) ; écrire le test qui vérifie leur égalité avec `style.css` et avec la balise `theme-color` d'`index.html`, et le faire passer.
- [x] 2.2 Dessiner `public/icon.svg` : Mac (carré cyan `#3df2ff` aux coins arrondis, deux yeux, bouche en fente) avec son halo néon, pleine page sur `THEME_BACKGROUND`, motif dans la zone de sécurité centrale de 80 % ; vérifier son rendu dans un navigateur.
- [x] 2.3 Ajouter `pwa-assets.config.ts` (préréglage `minimal2023Preset`, source `public/icon.svg`, variantes « maskable » et Apple sans marge sur le fond du thème, comme Monopwnly), l'inclure dans `tsconfig.json` et ajouter le script `generate-pwa-assets` au `package.json`. **Demander à l'utilisateur de lancer `pnpm generate-pwa-assets`**, puis vérifier que `public/` contient les PNG 64, 192, 512, maskable 512, Apple 180 et `favicon.ico`, à versionner.

## 3. Manifeste et service worker

- [x] 3.1 Écrire les tests de `src/pwa/manifest.ts` : nom et nom court « PacMac », langue `fr`, `start_url`, `scope` et `id` relatifs, affichage `standalone`, orientation `portrait`, couleurs égales aux constantes de `src/theme.ts`, icônes 192 et 512 dont une `maskable`, chaque fichier existant dans `public/`.
- [x] 3.2 Implémenter `src/pwa/manifest.ts` ; ajouter `src/pwa/**/*.test.ts` aux projets Vitest (environnement node) ; vérifier que les tests 3.1 passent.
- [x] 3.3 Configurer `VitePWA` dans `vite.config.ts` : `registerType: 'prompt'`, `injectRegister: false`, manifeste de `src/pwa/manifest.ts`, `includeManifestIcons: false`, `workbox.globPatterns` `**/*.{js,css,html,svg,png,ico,woff2}`, `devOptions` désactivé ; ajouter `vite-plugin-pwa/client` aux `types` de `tsconfig.json`. Vérifier avec `pnpm build` que `dist/` contient `sw.js` et `manifest.webmanifest`, et que la liste de précache de `sw.js` contient `index.html`, chaque script et feuille de style hachés, le manifeste et chaque icône.
- [x] 3.4 Compléter `index.html` : `theme-color`, `favicon.ico`, icône SVG, `apple-touch-icon`, `apple-mobile-web-app-title` et `mobile-web-app-capable` ; vérifier avec `pnpm build` que les liens de `dist/index.html` pointent vers des fichiers présents dans `dist/`.

## 4. Mise à jour

- [x] 4.1 Écrire les tests de `src/pwa/updateState.ts` avec une fonction d'enregistrement factice : `updateReady` faux au départ, vrai après `onNeedRefresh`, inchangé après `onOfflineReady` ou `onRegisterError`, `applyUpdate()` qui appelle la fonction de mise à jour avec rechargement, état qui reste faux sans enregistrement.
- [x] 4.2 Implémenter `src/pwa/updateState.ts` (repris de Monopwnly) et le brancher dans `main.ts` et `App.vue`, seulement en production et si `'serviceWorker' in navigator` ; vérifier que les tests 4.1 passent et que `pnpm dev` n'enregistre aucun service worker (onglet Application des DevTools).
- [x] 4.3 Ajouter aux tests de l'accueil : bandeau « Nouvelle version disponible » avec bouton « Recharger » affiché quand `updateReady` est vrai, absent sinon, clic qui émet `reload` ; vérifier qu'aucun autre écran (jeu, pause, fin de partie) ne reçoit `updateReady`.
- [x] 4.4 Ajouter la prop `updateReady` et l'événement `reload` à l'accueil, relier `reload` à `applyUpdate()` dans `App.vue` ; vérifier que les tests 4.3 passent.

## 5. Vérification de bout en bout

- [x] 5.1 Avec `pnpm build` puis `pnpm preview`, dans un Chromium piloté : service worker actif et page contrôlée après la première visite, serveur arrêté puis rechargement, accueil affiché avec le tableau des scores et partie qui démarre hors ligne.
- [x] 5.2 Mise à jour, dans le même Chromium : texte modifié, nouvelle construction servie, bandeau « Nouvelle version disponible » sur l'accueil, « Recharger » qui affiche la nouvelle version.
- [x] 5.3 Installabilité : aucune erreur d'installabilité ni de manifeste remontée par Chromium (`Page.getInstallabilityErrors`, `Page.getAppManifest`).
- [x] 5.4 Lancer `pnpm lint`, `pnpm type-check`, `pnpm test` et `pnpm build` ; tout doit passer sans erreur ni avertissement.
- [ ] 5.5 Sur appareils réels : installation sur iPhone, Android et Chrome ordinateur (fenêtre autonome en portrait), partie complète hors ligne avec le son et un score enregistré, nouvelle version appliquée sans clic après fermeture de tous les onglets.

## 6. Documentation et déploiement

- [x] 6.1 Mettre à jour le README (jeu hors ligne et installation, commandes `pnpm preview` et `pnpm generate-pwa-assets`, scores séparés entre l'onglet Safari et l'application installée sur iPhone) et le `TODO.md` (étapes de déploiement du design : HTTPS, `Cache-Control: no-cache` sur `sw.js`, `index.html` et `manifest.webmanifest`, test d'installation sur iPhone et Android en portrait) ; vérifier que les commandes citées existent dans `package.json`.
