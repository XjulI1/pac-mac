# Tasks

## 1. Types et état initial (`nest`)

- [x] 1.1 Ajouter à `src/engine/types.ts` (ou `src/engine/chasers/types.ts`) `ChaserId`, `ChaserStatus`, `Chaser`, les champs `chasers`, `mode`, `surcharge` et `nest` de `GameState`, les phases `chaserCaught`, `dying` et `gameOver` et les nouveaux événements, selon le design ; corriger les `switch` sur les phases signalés par `pnpm type-check`.
- [x] 1.2 Écrire les tests de `roster.ts` et de l'état initial : ordre des traqueurs, positions de départ, statuts, coins de patrouille, ordre de sortie ; mode en patrouille à l'étape 0 avec 360 ticks ; `surcharge` nul ; compteurs du nid à zéro.
- [x] 1.3 Implémenter `src/engine/chasers/roster.ts` et compléter `createGame` ; vérifier que les tests 1.2 passent.

## 2. Choix de direction (`chaser-movement`)

- [x] 2.1 Écrire les tests de `steering.ts` : choix vers une cible, égalité départagée haut, droite, bas, gauche, demi-tour exclu même avec une cible derrière, porte fermée pour `active` et `spark`, hasard limité aux directions possibles et réparti sur 300 graines, générateur non consommé hors intersection.
- [x] 2.2 Implémenter `src/engine/chasers/steering.ts` ; vérifier que les tests 2.1 passent.

## 3. Cibles (`chaser-targets`)

- [x] 3.1 Écrire les tests des cibles : coins de patrouille ; Limier ; Coupeur (intersection proche, huit cases tout droit, deux coudes, limite de 8 cases, Mac arrêté) ; Gardien (Mac à portée, quart le plus riche, égalité, colonne 10 ignorée) ; Fureteur (vu dans une ligne, dans une colonne, mur entre eux, pas de vue par le tunnel).
- [x] 3.2 Implémenter `src/engine/chasers/targets.ts` en s'appuyant sur la requête des objets restants par quart ; vérifier que les tests 3.1 passent.

## 4. Vitesses et déplacement (`chaser-movement`)

- [x] 4.1 Écrire les tests de vitesse : normale (672 unités en 60 ticks au niveau 1), tunnel (360), vulnérable (408), étincelle (1 440), Fureteur lancé (739), nid et sortie à la vitesse du tunnel, Mac en surcharge (792).
- [x] 4.2 Écrire les tests des trajets scriptés : sortie du Gardien par (10, 11) puis la porte jusqu'à (10, 8) en 80 ticks au niveau 1 ; descente d'une étincelle de (10, 8) à (10, 10) en 10 ticks.
- [x] 4.3 Implémenter `src/engine/chasers/chaserMovement.ts` en réutilisant `advance`, et brancher le déplacement des traqueurs et la vitesse de Mac en surcharge dans `tick.ts` ; vérifier que les tests 4.1 et 4.2 passent.

## 5. Modes (`chaser-modes`)

- [x] 5.1 Écrire les tests du calendrier : première bascule après 360 ticks de `playing`, événement `modeChanged`, traque permanente après 80 s au niveau 1, 300 ticks au niveau 2, décompte arrêté hors `playing` et pendant une surcharge, demi-tour des traqueurs `active` non vulnérables seulement.
- [x] 5.2 Implémenter `src/engine/chasers/modes.ts` et le brancher dans `tick.ts` ; vérifier que les tests 5.1 passent.

## 6. Nid (`nest`)

- [x] 6.1 Écrire les tests des sorties : Coupeur au premier tick de `playing` du niveau 1, Gardien au 15e objet, Fureteur au 40e, un seul par tick au niveau 3, inactivité de 240 ticks au niveau 1 qui libère le suivant et repart de zéro, événement `chaserReleased`.
- [x] 6.2 Écrire les tests du retour : étincelle guidée vers (10, 8), passage en `entering`, régénération en (10, 10) non vulnérable, événement `chaserRevived`, ressortie dangereuse pendant une surcharge.
- [x] 6.3 Implémenter `src/engine/chasers/nest.ts` et le brancher dans `tick.ts` ; vérifier que les tests 6.1 et 6.2 passent.

## 7. Surcharge et captures (`surcharge`)

- [x] 7.1 Écrire les tests du début de surcharge : durée du niveau, chaîne à zéro, vulnérabilité de tous sauf `spark` et `entering`, demi-tour des `active`, événement ; nouveau prisme qui relance durée et chaîne et rend vulnérables les régénérés.
- [x] 7.2 Écrire les tests de fin : `surchargeEnding` à 120 ticks restants ou dès le début si la surcharge est courte (niveau 6), fin après 420 ticks de `playing` au niveau 1, décompte arrêté pendant `chaserCaught`.
- [x] 7.3 Implémenter `src/engine/chasers/surcharge.ts` et le brancher sur le prisme mangé (`items.ts`) et dans les décomptes de `tick.ts` ; vérifier que les tests 7.1 et 7.2 passent.

## 8. Collisions, vies et fin de partie (`surcharge`, `lives`)

- [x] 8.1 Écrire les tests de contact : seuil strict de 60 unités, tunnel pris en compte, étincelle inoffensive, contrôle avant et après le déplacement des traqueurs, aucun croisement sans contact aux vitesses des niveaux 1 à 8.
- [x] 8.2 Écrire les tests de capture : chaîne 200, 400, 600, 800 et bonus de 1 000, score augmenté de 3 000, vie supplémentaire déclenchée par des points de capture, phase `chaserCaught` de 30 ticks entièrement figée ; capture et prise dans le même tick.
- [x] 8.3 Écrire les tests de `dying` et de la reprise : jeu figé, vie perdue et événement `lifeLost`, positions, mode, compteurs du nid, surcharge et bonus remis à zéro, objets conservés, `ready` de 120 ticks ; dernière vie → `gameOver` et événement ; `tick` en `gameOver` qui ne change que `tickCount`.
- [x] 8.4 Implémenter `src/engine/chasers/collisions.ts` et `src/engine/lives.ts`, brancher les deux contrôles de collision et les phases dans `tick.ts`, et remettre les traqueurs en place au début de chaque niveau dans `level.ts` ; vérifier que les tests 8.1 à 8.3 passent.

## 9. Vérification d'ensemble

- [x] 9.1 Écrire le test des parties complètes : le pilote naïf joue les graines 1 à 10 jusqu'au `gameOver` (au plus 216 000 ticks chacune) en vérifiant à chaque tick les invariants (score croissant, vies entre 0 et 5, traqueurs sur un axe praticable, porte réservée aux trajets du nid, aucun `active` dans le nid), et rejouer une graine redonne le même état final.
- [x] 9.2 Écrire la variante prudente du pilote et un test de calibrage lancé seulement avec la variable `PACMAC_CALIBRATION=1` (script `test:calibration`) : il affiche, sur 50 graines, la durée de vie moyenne du pilote naïf, le niveau atteint par le pilote prudent et la part du temps passée par chaque traqueur dans chaque quart du labyrinthe, pour repérer une dérive après un réglage de `levels.ts`.
- [x] 9.3 Vérifier que le test de performance de `add-game-engine` passe toujours avec les traqueurs (36 000 ticks en moins de 3 s).
- [x] 9.4 Lancer `pnpm lint`, `pnpm type-check`, `pnpm test` et `pnpm build` ; tout doit passer sans erreur ni avertissement.
