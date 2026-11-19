## Why

PacMac se joue seul et ne dépend d'aucun serveur une fois chargé : le moteur, le labyrinthe, les
sons synthétisés et les meilleurs scores sont tous dans le navigateur. Pourtant, sans connexion,
l'application ne se lance pas, et sur téléphone elle reste un onglet avec sa barre d'adresse qui
mange une partie de l'écran. La rendre installable et jouable hors ligne permet de lancer une
partie n'importe où (métro, avion) comme une application, en plein écran.

## What Changes

- **Fonctionnement hors ligne** : un service worker met en cache, à la première visite, tous les
  fichiers de l'application ; les visites suivantes se lancent et se jouent sans réseau, sons et
  meilleurs scores compris.
- **Application installable** : manifeste web (nom « PacMac », couleurs du thème néon, fenêtre
  autonome sans barre d'adresse, orientation portrait) et icônes, pour l'installer sur l'écran
  d'accueil d'un téléphone ou comme application de bureau.
- **Icône de l'application** : une icône SVG originale, Mac sur fond sombre avec son halo néon,
  déclinée en PNG pour toutes les plateformes, dont l'icône Apple et une variante « maskable ».
- **Mise à jour maîtrisée** : une nouvelle version déployée est téléchargée en arrière-plan ; un
  bandeau « Nouvelle version disponible » proposant de recharger s'affiche sur l'accueil seulement,
  jamais en pleine partie ni pendant la saisie d'un nom en fin de partie. Sans action, la nouvelle
  version s'applique au lancement suivant.
- Le mode développement (`pnpm dev`) reste sans service worker.

## Capabilities

### New Capabilities

- `offline-app` : mise en cache de l'application, lancement et jeu hors ligne, installabilité
  (manifeste, icônes) et mise à jour vers une nouvelle version.

### Modified Capabilities

Aucune : le bandeau de mise à jour est une exigence propre à `offline-app`, l'accueil garde son
comportement.

## Hors périmètre

- Notifications push, synchronisation en arrière-plan : sans objet pour un jeu solo sans serveur.
- Bouton « Installer l'application » dans l'interface : l'installation passe par le navigateur
  (menu ou icône de la barre d'adresse, « Sur l'écran d'accueil » sur iPhone).
- Écrans de démarrage (« splash screens ») iOS par appareil.
- Verrouillage de l'orientation hors application installée : dans un onglet, le navigateur décide.
- Configuration HTTPS et en-têtes de cache du serveur : à régler au déploiement, consignes dans le
  design.

## Impact

- Nouvelles dépendances de développement : `vite-plugin-pwa` (Workbox), `workbox-window` et
  `@vite-pwa/assets-generator` ; `pnpm add -D` à lancer par l'utilisateur.
- `vite.config.ts` : plugin PWA (manifeste, précache, stratégie de mise à jour).
- `public/` : icône SVG source et icônes PNG générées, versionnées dans le dépôt.
- `index.html` : couleur du thème, icônes, métadonnées Apple.
- Nouveau module `src/pwa/` (manifeste, état de mise à jour), constantes de couleur dans
  `src/theme.ts`, bandeau de mise à jour sur l'accueil.
- Le service worker exige HTTPS (ou `localhost`) : le serveur doit servir l'application en HTTPS
  et ne pas mettre en cache longue durée `index.html`, `sw.js` ni le manifeste.
- Dernier change de la V1.
