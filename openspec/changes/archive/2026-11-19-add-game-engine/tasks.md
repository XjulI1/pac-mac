# Tasks

## 1. Socle du projet

- [x] 1.1 Vérifier le `.gitignore` existant (node_modules, dist, coverage, .DS_Store, tmp) avec `git status`.
- [x] 1.2 Écrire `package.json` (scripts `dev`, `build`, `preview`, `test`, `test:watch`, `lint`, `type-check`, champ `packageManager` aligné sur Monopwnly) avec les dernières versions stables de vue, vite, @vitejs/plugin-vue, typescript, vue-tsc, vitest, eslint, @eslint/js, typescript-eslint, eslint-plugin-vue, vue-eslint-parser, globals et @types/node, et un `pnpm-workspace.yaml` repris de Monopwnly. **Demander à l'utilisateur de lancer `pnpm install`** et attendre sa confirmation.
- [x] 1.3 Ajouter `vite.config.ts`, `tsconfig.json` (strict, `noUncheckedIndexedAccess`, sur le modèle de Monopwnly), `vitest.config.ts` (projet `engine` en environnement node), `index.html` (`lang="fr"`, titre « PacMac », `theme-color` sombre), `src/main.ts` et `src/App.vue` (écran d'accueil provisoire « PacMac ») ; vérifier que `pnpm build` et `pnpm type-check` passent.
- [x] 1.4 Configurer ESLint (flat config, typescript-eslint, eslint-plugin-vue) avec, sur `src/engine/**`, `no-restricted-imports` (vue), `no-restricted-globals` (window, document, localStorage, requestAnimationFrame, performance) et `no-restricted-properties` (Math.random, Date.now), en autorisant `performance` dans le test de performance ; vérifier que `pnpm lint` passe et qu'un `Math.random()` ajouté temporairement dans `src/engine/` est signalé.

## 2. Types, unités et générateur aléatoire

- [x] 2.1 Définir dans `src/engine/types.ts` les types `Direction`, `Point`, `Tile`, `Item`, `BonusKind`, `Hero`, `GameState`, `Phase`, `GameInput`, `GameEvent` et `TickResult` selon le design ; vérifier avec `pnpm type-check`.
- [x] 2.2 Écrire les tests des unités : `TILE_UNITS` vaut 120, centre d'une case, case contenant un point (y compris abscisse ramenée dans le tunnel), `secondsToTicks` (4 s → 240, 2 s → 120, 0,5 s → 30), conversion d'une vitesse en unités par seconde.
- [x] 2.3 Implémenter `src/engine/units.ts` ; vérifier que les tests 2.2 passent.
- [x] 2.4 Écrire les tests du générateur : même graine → même suite, entiers dans les bornes demandées, tirage parmi une liste qui ne sort jamais de la liste.
- [x] 2.5 Implémenter `src/engine/rng.ts` (mulberry32 avec état explicite, tirage d'entier, choix dans une liste) ; vérifier que les tests 2.4 passent.

## 3. Labyrinthe (`maze`)

- [x] 3.1 Écrire les tests de lecture de la grille : dimensions, cases de référence, erreur avec numéro de ligne pour une ligne de mauvaise longueur ou un symbole inconnu.
- [x] 3.2 Écrire les tests d'invariants : décomptes (215 pastilles, 4 prismes, 256 couloirs, 1 porte, 6 cases de nid), aucun carré 2 × 2 de couloir, aucun cul-de-sac, connexité depuis le départ de Mac, symétrie par rapport à la colonne 10.
- [x] 3.3 Écrire les tests du voisinage : tunnel (gauche de (0, 11) → (20, 11) et inversement), porte fermée par défaut et franchissable sur demande, intersections (5, 4), (2, 1) et (10, 8), points remarquables et cases du tunnel.
- [x] 3.4 Copier la grille de `docs/jeu.md` dans `src/engine/maze/layout.ts` et implémenter `src/engine/maze/maze.ts` (lecture, `MAZE`, voisine, praticabilité avec option de porte, intersections, points remarquables) ; vérifier que les tests 3.1 à 3.3 passent.

## 4. Table des niveaux (`level-progression`)

- [x] 4.1 Écrire les tests de `levelSettings` : lignes des niveaux 1 et 5, égalité des niveaux 8 et 12, nature et points du bonus de chaque niveau, vitesses toutes converties en un nombre entier d'unités par seconde.
- [x] 4.2 Saisir `src/engine/levels.ts` depuis `docs/jeu.md` ; vérifier que les tests 4.1 passent.

## 5. Création d'une partie (`game-setup`)

- [x] 5.1 Écrire les tests de création : état initial complet, objets en place, Mac au départ, même graine → états égaux, graines différentes → `rngState` différents.
- [x] 5.2 Implémenter `createGame` dans `src/engine/setup.ts` ; vérifier que les tests 5.1 passent.

## 6. Outillage de test

- [x] 6.1 Écrire `src/engine/testing/builders.ts` : `gameWith` (Mac dans une case et une direction données, niveau, phase, objets retirés ou ajoutés, score, vies) et `runTicks` (suite de ticks avec entrées optionnelles, état final et événements cumulés), avec un test de chacun.

## 7. Boucle de jeu et déplacement de Mac (`game-loop`, `hero-movement`)

- [x] 7.1 Écrire les tests de `advance` dans `actorMovement.ts` : avance sans dépasser un centre, appel du choix de direction au centre, arrêt sur `null`, report du reste d'unité (768 unités en 60 ticks à 6,4 cases/s), traversée du tunnel.
- [x] 7.2 Implémenter `src/engine/actorMovement.ts` ; vérifier que les tests 7.1 passent.
- [x] 7.3 Écrire les tests de l'API de tick : état d'entrée intact, `tickCount`, phase `ready` (figée, direction mémorisée, passage en `playing` au 240e tick, premier pas au 241e).
- [x] 7.4 Écrire les tests du déplacement de Mac : départ à l'arrêt (attente sans entrée, première commande, commande vers un mur mémorisée), vitesse au niveau 1, arrêt contre un mur, virage au premier centre possible, virage annoncé juste avant, virage oublié après 30 ticks, délai relancé par une nouvelle entrée et arrêté pendant `ready`, repartir d'un arrêt, demi-tour entre deux centres, tunnel, porte infranchissable.
- [x] 7.5 Implémenter `src/engine/hero.ts` et `src/engine/tick.ts` (copie `structuredClone`, aiguillage par phase), puis exporter `createGame` et `tick` depuis `src/engine/index.ts` ; vérifier que les tests 7.3 et 7.4 passent.

## 8. Objets, bonus et score (`pellets-and-scoring`)

- [x] 8.1 Écrire les tests des pastilles et prismes : objet mangé à mi-chemin, points, compteurs, événements, couloir vide sans effet.
- [x] 8.2 Écrire les tests du bonus : apparition aux 70e et 150e objets, pas de troisième, nature selon le niveau, bonus mangé (points, événement), disparition après 540 ticks.
- [x] 8.3 Écrire les tests des vies supplémentaires : seuil de 10 000, seuil suivant à 35 000 puis 60 000, plafond de 5 vies sans événement.
- [x] 8.4 Implémenter `src/engine/items.ts` et le brancher dans `tick.ts` ; vérifier que les tests 8.1 à 8.3 passent.

## 9. Fin de niveau (`level-progression`)

- [x] 9.1 Écrire les tests de fin de niveau : dernier objet → `levelClear` de 120 ticks, bonus retiré, événement ; jeu figé et entrées ignorées pendant la phase ; passage au niveau 2 avec objets, positions et compteurs remis à zéro, score et vies conservés, `ready` de 120 ticks, événement `levelStarted`.
- [x] 9.2 Implémenter `src/engine/level.ts` et le brancher dans `tick.ts` ; vérifier que les tests 9.1 passent.

## 10. Requêtes et API publique

- [x] 10.1 Écrire les tests des requêtes en lecture : case de Mac, objet d'une case, objets restants par quart du labyrinthe (utile au Gardien), réglages du niveau courant.
- [x] 10.2 Implémenter `src/engine/queries.ts` et exporter l'API publique depuis `src/engine/index.ts` avec une JSDoc sur chaque fonction exportée ; vérifier que les tests 10.1 passent.

## 11. Vérification d'ensemble

- [x] 11.1 Écrire `src/engine/testing/autopilot.ts` (parcours en largeur vers l'objet le plus proche) et le test de bout en bout : depuis une partie neuve, le pilote vide le niveau 1 en moins de 10 800 ticks, le niveau 2 commence, et le score vaut 2 350 plus les points des bonus mangés ; à chaque tick, Mac est sur l'axe de deux cases praticables, jamais dans le nid, et `itemsLeft` égale le nombre d'objets de `items`.
- [x] 11.2 Écrire le test de déterminisme (deux rejeux de 3 000 ticks identiques), le test d'aller-retour JSON en cours de partie et le test de performance (36 000 ticks en moins de 3 s).
- [x] 11.3 Lancer `pnpm lint`, `pnpm type-check`, `pnpm test` et `pnpm build` ; tout doit passer sans erreur ni avertissement.
