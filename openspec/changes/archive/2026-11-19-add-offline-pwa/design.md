# Design

## Context

PacMac est une SPA Vite sans aucune ressource externe à l'exécution : le labyrinthe est une
constante du moteur, le rendu est dessiné sur Canvas, les sons sont synthétisés en Web Audio
(`add-sound`), et les seules données persistantes sont la préférence de son et les meilleurs scores
en `localStorage` (`add-sound`, `add-high-scores`). L'application sera déployée par copie de `dist/`
sur un serveur personnel, peut-être sous un sous-chemin (option `base` de Vite). Le change
`add-offline-pwa` de Monopwnly sert de modèle et ses choix sont repris tels quels quand rien ne
les distingue. Motivation : proposal.md ; exigences : `specs/offline-app/spec.md`.

## Goals / Non-Goals

**Goals :**

- Précache complet de la version de production, versionné par empreinte de contenu, sans liste
  de fichiers à maintenir à la main.
- Une seule source de vérité pour le manifeste et les couleurs du thème, testée par Vitest.
- La logique « une nouvelle version est prête » isolée de l'API du service worker, pour être
  testée sans navigateur.

**Non-Goals :**

- Pas de cache à l'exécution (`runtimeCaching`) : aucune requête ne sort de l'origine.
- Pas de vérification périodique des mises à jour : le navigateur vérifie le service worker à
  chaque lancement.
- Pas de service worker en développement (`devOptions` désactivé).

## Decisions

### `vite-plugin-pwa` en mode `generateSW`

Le plugin génère le service worker Workbox, la liste de précache avec les empreintes des fichiers
produits par Vite et le manifeste, et fournit le module virtuel `virtual:pwa-register` qui expose
l'événement « nouvelle version prête ».

Alternative écartée : un service worker écrit à la main, qui obligerait à lister les fichiers
hachés, versionner et nettoyer les caches et gérer l'attente de la nouvelle version.

### Mise à jour en mode `prompt`

`registerType: 'prompt'` : le nouveau service worker s'installe en arrière-plan puis attend, sans
`skipWaiting` ni `clientsClaim`. `onNeedRefresh` passe l'état « mise à jour prête » à vrai ;
« Recharger » appelle `updateSW(true)`, qui active le service worker en attente puis recharge la
page. Sans action, le navigateur active la nouvelle version au lancement suivant.

Alternative écartée : `autoUpdate`, qui rechargerait la page dès que la nouvelle version est prête
et couperait une partie en cours, ou la saisie d'un nom après un record.

### Module `src/pwa/`

```
src/
  theme.ts            THEME_BACKGROUND, THEME_COLOR
  pwa/
    manifest.ts       options du manifeste (importées par vite.config.ts)
    updateState.ts    état « mise à jour prête » et action « appliquer »
```

`updateState.ts` reprend celui de Monopwnly : il reçoit la fonction d'enregistrement en paramètre
(`registerSW` du module virtuel en production, un double en test) et renvoie un `ref` en lecture
seule `updateReady` et `applyUpdate()`. `main.ts` ne lui passe `registerSW` qu'en production
(`import.meta.env.PROD`) et si `'serviceWorker' in navigator` ; ailleurs, `updateReady` reste faux.
Une erreur d'enregistrement est ignorée : l'application fonctionne alors comme un site ordinaire.
Le type du module virtuel vient de `vite-plugin-pwa/client`, ajouté aux `types` de `tsconfig.json`.

Ni le moteur ni le son n'importent quoi que ce soit de ce module.

### Bandeau sur l'accueil

`App.vue` détient l'état de mise à jour et le passe à l'accueil par une prop `updateReady` ; le
bandeau fait partie de l'accueil et émet `reload`. L'accueil n'étant monté que sur l'écran
d'accueil, le bandeau ne peut apparaître ni en jeu, ni en pause, ni sur l'écran de fin pendant la
saisie d'un nom ; un état devenu vrai pendant une partie s'affiche au retour à l'accueil. Le
bandeau n'est pas refermable.

### Manifeste

`src/pwa/manifest.ts` : `name` et `short_name` « PacMac », `description` en français, `lang: 'fr'`,
`dir: 'ltr'`, `id`, `start_url` et `scope` à `'./'` (relatifs, pour le sous-chemin),
`display: 'standalone'`, `orientation: 'portrait'`, `background_color` et `theme_color` repris de
`src/theme.ts`.

- `THEME_BACKGROUND` : fond de la page et du canvas, la couleur sombre de `add-game-ui`.
- `THEME_COLOR` : fond du HUD, pour que la barre d'état se fonde dans l'interface.

Si `src/theme.ts` n'existe pas encore, il est créé ici avec les valeurs des variables CSS de
`style.css`. Un test vérifie que les deux constantes restent égales à ces variables et à la balise
`theme-color` d'`index.html`.

`standalone` plutôt que `fullscreen` : iOS ne connaît que `standalone`, et `fullscreen` masquerait
la barre d'état Android sans gain réel pour un labyrinthe qui tient déjà dans la hauteur.
`portrait` : le labyrinthe est plus haut que large ; iPadOS ignore l'orientation du manifeste, et
le paysage reste jouable dans un onglet.

### Icônes

`public/icon.svg`, dessinée à la main : Mac (carré cyan `#3df2ff` aux coins arrondis, deux yeux,
bouche en fente) centré avec son halo néon sur le fond du thème, pleine page, motif dans la zone de
sécurité centrale de 80 % pour la variante « maskable ». Aucun élément repris d'un jeu existant.

Les PNG sont produits par `@vite-pwa/assets-generator` (préréglage `minimal2023Preset` : 64, 192,
512, maskable 512, Apple 180, `favicon.ico`) via le script `pnpm generate-pwa-assets`, lancé par
l'utilisateur, puis **versionnés** dans `public/`. L'icône source étant pleine page, les variantes
« maskable » et Apple sont produites sans marge ni fond blanc, sur le fond du thème (configuration
de Monopwnly).

Alternative écartée : l'option `pwaAssets` du plugin, qui génèrerait les icônes à chaque
construction et rendrait `sharp` (binaire natif) indispensable au build.

### Précache

`globPatterns: ['**/*.{js,css,html,svg,png,ico,woff2}']` (le plugin ajoute lui-même le manifeste),
`navigateFallback` sur `index.html` et nettoyage des anciens caches (valeurs par défaut du plugin).
Sans Three.js, le script principal reste loin de la limite de 2 Mo de Workbox : la limite par
défaut est conservée, et la vérification de la liste de précache fait partie des tâches.

### `index.html`

`theme-color`, `favicon.ico`, icône SVG, `apple-touch-icon`, `apple-mobile-web-app-title`
« PacMac » et `mobile-web-app-capable`, comme dans Monopwnly.

## Risks / Trade-offs

- [Un fichier ajouté plus tard (police, image) absent du précache] → motifs de précache larges et
  vérification de la liste dans `dist/sw.js` à chaque change qui ajoute une ressource.
- [Sur iPhone, une application installée est rarement fermée complètement : la mise à jour « au
  lancement suivant » peut tarder] → le bandeau sur l'accueil permet de l'appliquer à la main.
- [Stockage d'une application installée distinct de celui de Safari sur iOS] → les meilleurs scores
  ne passent pas de l'onglet à l'application installée ; comportement du système, signalé dans le
  README.
- [Le serveur met en cache `sw.js` ou `index.html` longtemps et les mises à jour ne sont jamais
  vues] → consignes de déploiement ci-dessous.
- [`sharp`, dépendance de `@vite-pwa/assets-generator`, déclare un script d'installation que pnpm
  bloque] → ses binaires précompilés suffisent ; le déclarer dans `allowBuilds` sans l'autoriser si
  pnpm le demande.

## Migration Plan

Déploiement :

1. `pnpm build`, puis copie de `dist/` sur le serveur.
2. Servir l'application en **HTTPS** (obligatoire pour le service worker, sauf sur `localhost`).
3. En-tête `Cache-Control: no-cache` sur `sw.js`, `index.html` et `manifest.webmanifest` ; les
   fichiers de `assets/` (noms hachés) peuvent être mis en cache longue durée.
4. Tester l'installation sur iPhone (« Sur l'écran d'accueil ») et sur Android : icône, nom,
   ouverture en portrait sans barre d'adresse, lancement hors ligne.

Retour arrière : déployer une version construite avec `selfDestroying: true` dans les options du
plugin, qui désinscrit le service worker et vide ses caches chez les clients.
