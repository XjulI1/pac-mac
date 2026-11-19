## Why

Avec le moteur (`add-game-engine`, `add-chasers`) et le rendu (`add-canvas-renderer`), une partie
tourne et se voit, mais seulement sur un écran provisoire, aux flèches du clavier. Il manque ce qui
fait une application : un accueil, un HUD lisible, des commandes au doigt sur téléphone, une pause
qui ne fait jamais perdre une vie quand on change d'application, et une fin de partie qui propose
de rejouer. Ce change rend PacMac jouable de bout en bout, au clavier comme au doigt.

## What Changes

- **Écrans** : accueil (titre PacMac, bouton « Jouer », aide des commandes), partie, pause et fin
  de partie (score, niveau atteint, « Rejouer », « Accueil »).
- **HUD compact en haut** : score, niveau, vies en réserve, bonus récoltés, bouton pause, et des
  emplacements prévus pour le record (`add-high-scores`) et le bouton du son (`add-sound`).
- **Clavier** : flèches, ZQSD et WASD, lus par caractère pour que les lettres imprimées sur un
  clavier AZERTY comme QWERTY fonctionnent ; P ou Échap pour la pause ; Entrée ou Espace pour
  valider sur les écrans.
- **Au doigt** : des glissements n'importe où sur la zone de jeu, avec un seuil en pixels et l'axe
  dominant, plusieurs directions possibles dans un même glissement continu ; pas de croix
  directionnelle. La page ne zoome ni ne défile pendant le jeu.
- **Pause** : manuelle (touche ou bouton) et automatique quand l'application passe en arrière-plan
  ou perd le focus ; reprise après un compte à rebours de 3, 2, 1, sans rattrapage du temps passé.
- **Session de jeu** : crée la partie avec une graine tirée par l'interface, fait tourner la boucle
  de `add-canvas-renderer`, transmet la direction demandée au tick suivant, publie les événements
  du moteur à des abonnés (que `add-sound` utilisera) et passe à l'écran de fin après la fin de
  partie.
- **Mise en page** : téléphone en portrait à partir de 360 × 640 (zones sûres comprises) et
  ordinateur ; le labyrinthe occupe toute la place sous le HUD.
- Remplacement de l'écran provisoire de `add-canvas-renderer`.

## Capabilities

### New Capabilities

- `game-screens` : accueil, partie, fin de partie et navigation entre eux.
- `game-hud` : score, niveau, vies en réserve, bonus récoltés, emplacements réservés.
- `keyboard-controls` : correspondance des touches, AZERTY et QWERTY, touches ignorées.
- `touch-controls` : reconnaissance des glissements et blocage du zoom et du défilement.
- `pause` : pause manuelle et automatique, compte à rebours de reprise, abandon de la partie.
- `game-session` : création de la partie, graine, entrée au tick suivant, événements, fin de partie.

### Modified Capabilities

(aucune)

## Hors périmètre

Dans l'ordre des changes suivants :

1. `add-sound` : effets sonores et jingles, bouton du son dans le HUD et touche M.
2. `add-high-scores` : record dans le HUD, saisie du nom et tableau des meilleurs scores sur l'écran
   de fin, réglages.
3. `add-offline-pwa` : application installable et jouable hors ligne.

Après la V1 : croix directionnelle à l'écran, reprise d'une partie interrompue, vibrations.

## Impact

- Nouvelles dépendances à installer par l'utilisateur : `tailwindcss` et `@tailwindcss/vite` ; en
  dev, `@vue/test-utils` et `happy-dom` pour les tests de composants.
- Nouveaux dossiers `src/game/` (session, clavier, glissements, données du HUD) et `src/ui/`
  (écrans, HUD, pause) ; `src/style.css` pour Tailwind et le thème néon.
- `src/App.vue` devient la bascule d'écrans ; l'écran provisoire disparaît.
- `index.html` : viewport sans zoom et `viewport-fit=cover` pour les zones sûres.
- Nouveau projet Vitest `ui` en environnement happy-dom.
- Dépend de `add-game-engine`, `add-chasers` et `add-canvas-renderer`. Ni le moteur ni le rendu ne
  changent de comportement.
