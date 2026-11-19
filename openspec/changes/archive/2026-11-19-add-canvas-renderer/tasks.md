# Tasks

## 1. Outillage

- [x] 1.1 Ajouter le projet Vitest `render` (environnement node, `src/render/**/*.test.ts`, `src/loop/**/*.test.ts` et `src/format.test.ts`) et la règle ESLint qui interdit `vue` dans `src/render/**/*.ts`, `src/loop/fixedStep.ts` et `src/loop/gameLoop.ts` ; vérifier que `pnpm test` exécute les projets `engine` et `render` et qu'un import de `vue` ajouté temporairement dans `src/render/palette.ts` est signalé. Aucune dépendance à installer.

## 2. Format, palette et mise à l'échelle

- [x] 2.1 Écrire les tests de `formatScore` : 0, 400, 12 450 et 1 234 567 avec U+202F.
- [x] 2.2 Implémenter `src/format.ts` ; vérifier que les tests 2.1 passent.
- [x] 2.3 Écrire les tests de la palette : couleurs de Mac et des quatre traqueurs, gris vulnérable et éclat, `wallColor` en boucle sur quatre niveaux, couleurs de murs distinctes entre elles et des personnages, une couleur pour chacune des huit natures de bonus.
- [x] 2.4 Implémenter `src/render/palette.ts` ; vérifier que les tests 2.3 passent.
- [x] 2.5 Écrire les tests de `fitMaze` : 360 × 560 en densité 2, 390 × 600 en densité 3, densité plafonnée à 3, 1 280 × 656 en densité 1, décalage de centrage.
- [x] 2.6 Implémenter `src/render/viewport.ts` ; vérifier que les tests 2.5 passent.

## 3. Contours des murs

- [x] 3.1 Écrire les tests de `wallContours.ts` : 472 arêtes et 27 contours (25 fermés, 2 ouverts) sur `MAZE`, extrémités des contours ouverts, chaque arête utilisée une fois, bloc (2..4, 2..3) à 10 arêtes simplifié en 4 coins, décalage de 0,15 case vers l'intérieur du mur, symétrie de l'ensemble des arêtes, porte et nid traités comme non-murs.
- [x] 3.2 Implémenter `src/render/wallContours.ts` (arêtes, enchaînement, simplification, décalage) ; vérifier que les tests 3.1 passent.

## 4. Apparences et interpolation

- [x] 4.1 Écrire les tests de `looks.ts` : `mouthOpening` (centre, 30 unités, mi-chemin, arrêt), décalage des yeux pour les quatre directions, oscillation dans le nid (amplitude, période de 60 ticks, déphasage, aucune hors du nid), pulsation des prismes (ticks 0, 20 et 40, immobile en `ready`), couleur des murs en `levelClear` (120, 100 et 85 ticks restants), `chaserLook` dans tous les cas de la spec.
- [x] 4.2 Implémenter `src/render/looks.ts` ; vérifier que les tests 4.1 passent.
- [x] 4.3 Écrire les tests de `interpolation.ts` : mi-chemin, traversée du tunnel, remise en place, copies à dessiner près des bords (30, 1 260 et 2 500 unités).
- [x] 4.4 Implémenter `src/render/interpolation.ts` ; vérifier que les tests 4.3 passent.

## 5. Effets

- [x] 5.1 Écrire les tests de `effects.ts` : points de capture (texte, couleur, case, montée, opacité, disparition au 60e tick), seconde ligne « +1 000 », points du bonus pendant 90 ticks, traînée limitée à 6 positions et vidée hors étincelle, `dyingVisual` (120, 90, 45 et 0 ticks restants), `dissolvePixels` (pavage à 0, transparence à 1, reproductible), « Prêt ? » affiché seulement en `ready`.
- [x] 5.2 Implémenter `src/render/effects.ts` ; vérifier que les tests 5.1 passent.

## 6. Horloge et boucle

- [x] 6.1 Écrire les tests de `advanceClock` : première image à 0 tick, 60 Hz, 120 Hz avec `alpha` de 0,5, 144 Hz sur une seconde, 30 Hz, plafond de 6 ticks puis reprise normale, remise à zéro.
- [x] 6.2 Implémenter `src/loop/fixedStep.ts` ; vérifier que les tests 6.1 passent.
- [x] 6.3 Écrire les tests de `createGameLoop` avec un faux planificateur : `step` appelé une fois par tick, événements de l'image transmis en un seul appel dans l'ordre, `render` une fois par image avec `alpha`, pause sans image ni `step`, reprise sans rattrapage, arrêt qui annule l'image demandée.
- [x] 6.4 Implémenter `src/loop/gameLoop.ts` et `src/loop/useGameLoop.ts` ; vérifier que les tests 6.3 passent.

## 7. Dessin

- [x] 7.1 Implémenter `src/render/draw/walls.ts` (calque hors écran : remplissage teinté, tube décalé à coins arrondis, halo, porte, cache par couleur et taille, version blanche pour la fin de niveau) et `src/render/MazeCanvas.vue` (canvas, `ResizeObserver`, `fitMaze`) ; vérifier visuellement les 27 contours, les ouvertures du tunnel, le nid et sa porte, et l'absence de double trait sur les murs d'une case d'épaisseur.
- [x] 7.2 Implémenter `src/render/draw/items.ts` (pastilles, prismes pulsants à halo irisé, `BONUS_ICONS`) ; vérifier visuellement les 219 objets et les huit bonus affichés tour à tour en (10, 13).
- [x] 7.3 Implémenter `src/render/draw/hero.ts` (Mac, yeux, bouche, désagrégation) et `src/render/draw/chasers.ts` (quatre formes, point de direction, oscillation au nid, aspects `dim` et `flash`, étincelles et traînées, halo par double tracé) ; vérifier visuellement chaque traqueur dans chaque état.
- [x] 7.4 Implémenter `src/render/draw/overlays.ts` (« Prêt ? », points flottants) et `src/render/mazeRenderer.ts` (ordre de dessin : fond, murs, objets, bonus, traqueurs, Mac, effets ; interpolation ; copies du tunnel avec découpage au cadre) ; vérifier visuellement un personnage qui traverse le tunnel.

## 8. Écran provisoire

- [x] 8.1 Remplacer le contenu de `src/App.vue` : `MazeCanvas` plein écran, partie créée avec la graine `Date.now()`, boucle `useGameLoop` qui appelle `tick` avec la dernière flèche pressée puis `null`, effets alimentés par les événements, Entrée pour relancer après `gameOver` ; jouer quelques parties au clavier.

## 9. Vérification d'ensemble

- [x] 9.1 Dérouler la check-list visuelle en émulation téléphone (360 × 640 en densité 2, 390 × 844 en densité 3) et sur ordinateur (1 280 × 720, 1 920 × 1 080) : labyrinthe entier et centré, redimensionnement sans déformation, lisibilité des pastilles et des traqueurs à 360 px, « Prêt ? » et points sans débordement, capture d'un traqueur avec gel et points, chaîne complète, désagrégation, fin de niveau et couleur des murs du niveau 2, fluidité à 60 et 120 Hz.
- [x] 9.2 Profiler une minute de jeu avec le processeur ralenti 4 × dans les outils du navigateur : temps de dessin moyen sous 4 ms par image, aucune image longue due au calque des murs hors des changements de taille ou de niveau.
- [x] 9.3 Lancer `pnpm lint`, `pnpm type-check`, `pnpm test` et `pnpm build` ; tout doit passer, et la règle d'isolement du moteur ne doit signaler aucun import de Vue dans `src/engine/`.
