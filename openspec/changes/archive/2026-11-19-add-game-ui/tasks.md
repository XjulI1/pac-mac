# Tasks

## 1. Dépendances et outillage

- [x] 1.1 Ajouter à `package.json` `tailwindcss` et `@tailwindcss/vite`, et en dev `@vue/test-utils` et `happy-dom` (dernières versions stables). **Demander à l'utilisateur de lancer `pnpm install`** et attendre sa confirmation.
- [x] 1.2 Brancher Tailwind dans `vite.config.ts` et `src/style.css` (variables `@theme` reprenant `src/render/palette.ts`, police système, `tabular-nums`, `overscroll-behavior: none`, `user-select: none`, `touch-action: manipulation`, suppression du surlignage au toucher) ; ajouter le projet Vitest `ui` (happy-dom, `src/game/**/*.test.ts` et `src/ui/**/*.test.ts`) ; mettre à jour le viewport de `index.html` (`maximum-scale=1`, `user-scalable=no`, `viewport-fit=cover`) ; vérifier que `pnpm test` exécute les projets `engine`, `render` et `ui` et que `pnpm build` passe.

## 2. Modules purs

- [x] 2.1 Écrire les tests de `keyboard.ts` : flèches, lettres AZERTY et QWERTY sans tenir compte de la casse, P et Échap, Entrée et Espace, touche inconnue, modificateurs Ctrl, Cmd et Alt ignorés.
- [x] 2.2 Implémenter `src/game/keyboard.ts` ; vérifier que les tests 2.1 passent.
- [x] 2.3 Écrire les tests de `swipe.ts` : seuil de 24 px, trop court, diagonale, égalité, virage sans lever le doigt, même direction prolongée renvoyée une fois, nouveau glissement après `end`, simple toucher.
- [x] 2.4 Implémenter `src/game/swipe.ts` ; vérifier que les tests 2.3 passent.
- [x] 2.5 Écrire les tests de `hud.ts` et `seed.ts` : vies en réserve (3 → 2, pendant `dying`, après `lifeLost`, après `extraLife`, jamais négatives), 7 derniers bonus du plus ancien au plus récent, égalité de deux données de HUD identiques, graine issue d'une heure injectée.
- [x] 2.6 Implémenter `src/game/hud.ts` et `src/game/seed.ts` ; vérifier que les tests 2.5 passent.

## 3. Session de jeu

- [x] 3.1 Écrire les tests de `useGameSession` avec un faux planificateur, une heure injectée et des minuteries simulées : création avec la graine, passage en `playing`, direction envoyée au tick suivant puis `null`, dernière direction prioritaire, abonnés appelés une fois par image dans l'ordre d'inscription avec les événements et l'état, désinscription, bonus récoltés alimentés par `bonusEaten`, HUD non remplacé sans changement, `over` 1 500 ms après la phase `gameOver` avec la boucle arrêtée, `quit` qui revient à `home`.
- [x] 3.2 Écrire les tests de pause de la session : pause sans tick, pause impossible en `home` et en `over`, compte à rebours 3, 2, 1 toutes les 500 ms sans tick, reprise sans rattrapage, direction demandée pendant le compte à rebours envoyée au premier tick, pause pendant le compte à rebours qui l'annule.
- [x] 3.3 Implémenter `src/game/useGameSession.ts` en réutilisant `createGameLoop`, les effets et `createMazeRenderer` de `add-canvas-renderer` ; vérifier que les tests 3.1 et 3.2 passent.
- [x] 3.4 Écrire les tests de `useKeyboardControls` et `useSwipeControls` (happy-dom) : direction transmise à la session, touche maintenue renvoyée à chaque tick et dernière touche enfoncée prioritaire, `defaultPrevented` sur les flèches et l'Espace, touches ignorées dans un champ de saisie et avec Ctrl, répétition de P ignorée, glissement `pointerdown` / `pointermove` qui donne `up`, direction maintenue tant que le doigt reste posé et relâchée au `pointerup` ou au `pointercancel`, simple toucher sans direction, pause automatique sur `visibilitychange` et `blur` seulement en partie.
- [x] 3.5 Implémenter `src/game/useKeyboardControls.ts` et `src/game/useSwipeControls.ts` (capture du pointeur, annulation de `gesturestart`) ; vérifier que les tests 3.4 passent.

## 4. HUD

- [x] 4.1 Écrire les tests de composant de `GameHud` : score formaté, « Niveau N », nombre d'icônes de vie, icônes de bonus dans l'ordre, emplacements `actions` et `record` rendus, bouton pause qui appelle la session.
- [x] 4.2 Implémenter `GameHud.vue`, `LivesIndicator.vue`, `BonusShelf.vue` et `BonusIcon.vue` (petit canvas qui dessine `BONUS_ICONS` à la densité de l'écran) ; vérifier que les tests 4.1 passent.

## 5. Écrans

- [x] 5.1 Écrire les tests de composant de `HomeScreen` et de la bascule d'écrans dans `App.vue` : titre, bouton « Jouer », textes d'aide, Entrée qui lance la partie, écran de partie en `playing`, accueil en `home`.
- [x] 5.2 Implémenter `HomeScreen.vue`, `GameScreen.vue` (HUD aligné sur la largeur du labyrinthe, `MazeCanvas`, zone de glissement, surcouches, session fournie par `provide`) et la bascule dans `App.vue`, qui remplace l'écran provisoire ; vérifier que les tests 5.1 passent.
- [x] 5.3 Écrire les tests de composant de `PauseOverlay`, `ResumeCountdown`, `ConfirmDialog` et `GameOverScreen` : « Pause » avec « Reprendre » et « Quitter la partie », confirmation et annulation, chiffres du compte à rebours, « Partie terminée » avec score formaté et « Niveau atteint : N », « Rejouer » et Entrée, « Accueil » et Échap, emplacement `results`.
- [x] 5.4 Implémenter `PauseOverlay.vue`, `ResumeCountdown.vue`, `ConfirmDialog.vue` et `GameOverScreen.vue` ; vérifier que les tests 5.3 passent.

## 6. Vérification d'ensemble

- [x] 6.1 Jouer des parties complètes au clavier sur ordinateur (1 280 × 720 et 1 920 × 1 080), en AZERTY avec ZQSD et en QWERTY avec WASD, avec pause, reprise, changement d'onglet, fin de partie et « Rejouer ».
- [x] 6.2 Jouer en émulation téléphone (360 × 640 et 390 × 844) : HUD collé au labyrinthe, aucune page qui défile, pause et compte à rebours lisibles.
- [ ] 6.4 Jouer sur un vrai téléphone en portrait : glissements, virages enchaînés sans lever le doigt, aucun zoom ni défilement (double toucher, pincement, glissement vers le bas), zones sûres respectées, HUD lisible avec 4 vies et 7 bonus, pause automatique en quittant l'application ; noter tout réglage de seuil nécessaire.
- [x] 6.3 Lancer `pnpm lint`, `pnpm type-check`, `pnpm test` et `pnpm build` ; tout doit passer.
