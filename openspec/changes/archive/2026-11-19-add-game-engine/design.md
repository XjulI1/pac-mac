# Design

## Context

Dépôt vierge (voir proposal.md, section Why). Ce change pose le socle technique et le moteur de jeu
sur lequel les changes suivants (traqueurs, rendu Canvas, interface, son, meilleurs scores)
viendront se brancher. Les exigences fonctionnelles sont dans `specs/` ; ce document ne décrit que
la manière de les implémenter. Le contenu du jeu (labyrinthe, valeurs, table des niveaux) est la
référence de `docs/jeu.md`.

Contraintes structurantes :

- le moteur ne dépend ni de Vue ni du DOM, pour être testé seul en environnement node ;
- il tourne en temps réel à 60 ticks par seconde sur téléphone : un tick doit rester très en
  dessous de la milliseconde ;
- il doit être déterministe pour que les tests rejouent une partie entière à l'identique, et que
  les comportements aléatoires des traqueurs (`add-chasers`) restent reproductibles ;
- son état doit être du JSON pur, pour les tests d'aller-retour et une éventuelle reprise de partie
  après la V1.

## Goals / Non-Goals

**Goals :**

- Une API unique et étroite : créer une partie, avancer d'un tick avec une entrée, interroger
  l'état.
- Des positions et des vitesses en entiers, sans dérive de virgule flottante.
- Des événements assez riches pour piloter les animations et les sons.
- Des points d'extension prévus pour les traqueurs, sans les implémenter.

**Non-Goals :**

- Aucune boucle `requestAnimationFrame`, aucune réactivité Vue : la boucle temps réel viendra avec
  `add-canvas-renderer` et `add-game-ui`.
- Aucun dessin ni coordonnée d'écran : le moteur ne connaît que des cases et des unités internes.
- Pas de traqueurs, de surcharge, de perte de vie ni de fin de partie (`add-chasers`).
- Pas de pause dans le moteur : mettre en pause, c'est cesser d'appeler `tick`.

## Decisions

### Arborescence

```
src/
  engine/
    index.ts            API publique (createGame, tick, requêtes, MAZE, levelSettings)
    types.ts            GameState, Phase, GameInput, GameEvent, Direction, Item, Point, Tile
    units.ts            TILE_UNITS, TICKS_PER_SECOND, secondsToTicks, speedToUnitsPerSecond
    rng.ts              générateur à graine
    maze/
      layout.ts         les 27 lignes de la grille, copiées de docs/jeu.md
      maze.ts           lecture de la grille → Maze, voisinage, tunnel, intersections
    levels.ts           table des niveaux
    setup.ts            création d'une partie
    actorMovement.ts    avance d'un acteur sur la grille (centres de case, tunnel, reste d'unité)
    hero.ts             direction voulue, demi-tour, arrêt contre un mur
    items.ts            pastilles, prismes, bonus, score, vies supplémentaires
    level.ts            fin de niveau, niveau suivant, remise en place
    tick.ts             orchestration d'un tick selon la phase
    queries.ts          requêtes en lecture pour le rendu et l'interface
    testing/
      builders.ts       états sur mesure pour les tests
      autopilot.ts      pilote automatique pour les tests de bout en bout
    *.test.ts           tests colocalisés
  App.vue
  main.ts
```

### Unités entières

- Une case fait `TILE_UNITS = 120` unités ; le centre de la case (`c`, `r`) est en
  (`c × 120 + 60`, `r × 120 + 60`). 120 est divisible par 2, 3, 4, 5, 6 et 8, et toutes les vitesses
  de la table (une décimale) donnent un nombre entier d'unités par seconde (`v × 120`).
- Une vitesse se convertit en unités par seconde ; à chaque tick l'acteur ajoute cette valeur à un
  reste `carry` exprimé en 1/60 d'unité, avance de `floor(carry / 60)` unités et garde le reste.
  Sur 60 ticks, l'acteur parcourt exactement sa vitesse en unités.
- Les durées sont saisies en secondes dans `levels.ts` et converties en ticks (`× 60`) par
  `secondsToTicks` ; l'état ne contient que des ticks.

Alternative écartée : **positions en virgule flottante** (fraction de case). Le passage exact par le
centre d'une case, indispensable aux virages, demanderait des tolérances, et deux plateformes
pourraient diverger sur une longue partie.

### Avance d'un acteur

`actorMovement.ts` fournit une fonction générique, réutilisée par les traqueurs dans `add-chasers` :

```ts
advance(maze, actor, distance, chooseDirection): Actor
```

L'acteur est toujours sur l'axe qui joint les centres de deux cases praticables voisines. Tant
qu'il reste de la distance : s'il est exactement au centre d'une case, il appelle
`chooseDirection(case, directionActuelle)` qui renvoie la direction à prendre ou `null` pour
s'arrêter ; puis il avance vers le centre suivant dans sa direction, sans le dépasser, et
recommence. Comme aucune vitesse n'atteint une case par tick (la plus rapide, l'étincelle à
12 cases/s, fait 24 unités par tick), un tick ne traverse jamais plus d'un centre, mais la boucle ne
le suppose pas.

Le tunnel est géré ici : l'abscisse est ramenée modulo `21 × 120` et la case voisine d'un bord, sur
la ligne 11, est la case du bord opposé.

La case d'un acteur est celle qui contient son centre (`floor(x / 120)`, `floor(y / 120)`) : Mac
mange un objet dès que son centre entre dans la case, à mi-chemin entre deux centres.

### Mac

```ts
type Hero = {
  position: Point
  direction: Direction
  wantedDirection: Direction | null
  wantedTicksLeft: number
  moving: boolean
  carry: number
}
```

- Une entrée non nulle remplace `wantedDirection`, y compris en phase `ready`.
- Si la direction voulue est l'opposée de la direction actuelle, Mac fait demi-tour sur-le-champ,
  même entre deux centres.
- Au centre d'une case, `chooseDirection` prend la direction voulue si la case voisine est
  praticable, sinon garde la direction actuelle si elle l'est, sinon renvoie `null` : Mac s'arrête
  (`moving: false`) en gardant sa direction, pour que ses yeux restent tournés vers le mur.
- Une direction voulue que Mac n'a pas pu prendre s'efface après 30 ticks de `playing`
  (`wantedTicksLeft`) ; une nouvelle entrée, même identique, relance le délai, qui ne court pas
  pendant `ready`. Un virage annoncé un peu trop tôt passe donc, mais pas un virage oublié depuis
  longtemps. Au clavier, une touche maintenue est renvoyée à chaque tick (`add-game-ui`) et garde
  donc sa direction vivante.
- Au début de chaque niveau et après chaque vie perdue, Mac est à l'arrêt (`moving: false`) sans
  direction voulue : il attend la première direction praticable du joueur. À l'arrêt, `chooseDirection`
  ne regarde que la direction voulue ; il ne repart jamais seul dans sa direction actuelle.
- Pour Mac, la porte et le nid sont des murs.

### Forme de l'état

```ts
type GameState = {
  rngState: number
  tickCount: number
  level: number
  score: number
  lives: number
  nextExtraLifeAt: number
  items: Item[]
  itemsLeft: number
  itemsEatenInLevel: number
  hero: Hero
  bonus: { kind: BonusKind; points: number; ticksLeft: number } | null
  bonusesShown: number
  phase: Phase
}

type Item = 'pellet' | 'prism' | null

type Phase =
  | { kind: 'ready'; ticksLeft: number }
  | { kind: 'playing' }
  | { kind: 'levelClear'; ticksLeft: number }
```

`items` a une entrée par case (`index = ligne × 21 + colonne`), `null` pour un mur ou un couloir
vide. La grille elle-même n'est pas copiée dans l'état : elle est une constante du module
(`MAZE`), lue une fois depuis `layout.ts`. Pas de `Map` ni de `Set` :
`JSON.parse(JSON.stringify(state))` est l'identité.

`add-chasers` ajoutera `chasers`, `mode`, `surcharge`, `nest` et les phases `chaserCaught`, `dying`
et `gameOver`.

### API : `tick(state, input) → TickResult`

```ts
type GameInput = { direction: Direction | null }
type TickResult = { state: GameState; events: GameEvent[] }
```

`tick` fait un `structuredClone` de l'état puis les fonctions de règles modifient cette copie.
L'état pèse quelques kilo-octets ; un test de performance vérifie qu'une longue simulation reste
rapide. Un test vérifie que l'état d'entrée n'est jamais modifié.

Déroulé d'un tick selon la phase :

- `ready` : mémorise l'entrée, décompte ; à zéro, passe en `playing`.
- `playing`, dans cet ordre : entrée, déplacement de Mac, objet ou bonus mangé (score, vies
  supplémentaires, apparition du bonus), fin de niveau si plus aucun objet, décompte du bonus.
  `add-chasers` insérera après le ramassage : déplacement des traqueurs, sorties du nid, modes,
  surcharge et collisions.
- `levelClear` : décompte ; à zéro, prépare le niveau suivant et passe en `ready`.

`tickCount` augmente à chaque tick, quelle que soit la phase.

Alternative écartée : **pas de temps variable** (`tick(state, input, dtMs)`). Le rendu en temps
réel donnerait des parties différentes selon la fréquence d'affichage, et les tests ne pourraient
plus rejouer une partie. La boucle de `add-canvas-renderer` accumulera le temps réel et appellera
`tick` autant de fois que nécessaire.

### Événements

```ts
type GameEvent =
  | { type: 'pelletEaten'; tile: Tile }
  | { type: 'prismEaten'; tile: Tile }
  | { type: 'bonusAppeared'; kind: BonusKind }
  | { type: 'bonusEaten'; kind: BonusKind; points: number; tile: Tile }
  | { type: 'bonusExpired' }
  | { type: 'extraLife'; lives: number }
  | { type: 'levelCleared'; level: number }
  | { type: 'levelStarted'; level: number }
```

`add-chasers` complètera l'union. Le rendu et le son ne lisent que l'état et ces événements.

### Table des niveaux

`levels.ts` exporte `levelSettings(level): LevelSettings`, qui renvoie la ligne du niveau (la ligne
8 au-delà) avec les vitesses en cases/s et les durées en secondes, et des fonctions de conversion
vers les unités du moteur. Les valeurs propres aux traqueurs (vitesses, seuils, inactivité,
calendrier des modes) sont saisies dès ce change, testées, mais pas encore utilisées.

### Générateur aléatoire

mulberry32 avec état entier stocké dans `rngState`, comme dans Risky et Monopwnly. Ce change n'en a
pas encore l'usage (rien d'aléatoire pour Mac) ; il sert à partir de `add-chasers` (Fureteur,
traqueurs vulnérables). `Math.random` et l'horloge ne sont utilisés nulle part dans le moteur.

### Outillage de test

- `testing/builders.ts` : `gameWith({ hero, items, level, phase, … })` construit un état sur mesure
  à partir de `createGame`, par exemple Mac au centre d'une case donnée dans une direction donnée,
  ou un labyrinthe vidé sauf quelques objets.
- `runTicks(state, count, inputs?)` enchaîne des ticks et renvoie l'état final et tous les
  événements.
- `testing/autopilot.ts` : à chaque centre de case, cherche par parcours en largeur l'objet le plus
  proche et renvoie la direction qui y mène. Il sert aux tests de bout en bout (vider un niveau,
  puis, avec `add-chasers`, jouer des parties entières).

### Garde-fous d'architecture

ESLint, sur `src/engine/**` :

- `no-restricted-imports` interdit `vue` et `vue/*` ;
- `no-restricted-globals` interdit `window`, `document`, `localStorage`, `requestAnimationFrame`
  et `performance` (sauf dans les tests de performance) ;
- `no-restricted-properties` interdit `Math.random` et `Date.now`.

### Outillage

- Vite + `@vitejs/plugin-vue`, TypeScript `strict` avec `noUncheckedIndexedAccess`, configuration
  identique à celle de Monopwnly.
- Vitest avec des projets : `engine` (environnement node) dès maintenant ; les projets `render` et
  `ui` viendront avec les changes qui les remplissent.
- `vue-tsc --noEmit` pour la vérification de types.
- ESLint en configuration « flat » avec `typescript-eslint` et `eslint-plugin-vue`.
- Scripts : `dev`, `build`, `preview`, `test`, `test:watch`, `lint`, `type-check`.
- Champ `packageManager` dans `package.json` pour figer la version de pnpm (celle de Monopwnly).

Tailwind et happy-dom ne sont pas installés ici : ils arrivent avec `add-game-ui`.

## Risks / Trade-offs

- [Grille mal recopiée depuis `docs/jeu.md`] → tests d'invariants (dimensions, décomptes, couloirs
  d'une case, aucun cul-de-sac, connexité, symétrie) et tests de quelques cases de référence.
- [Coût de `structuredClone` à 60 ticks par seconde] → état compact (un tableau de 567 objets, des
  nombres) ; test de performance sur dix minutes de jeu simulé. Si la mesure se dégrade, `tick`
  pourra copier champ par champ sans changer l'API.
- [Virages qui semblent « durs » au doigt] → la direction voulue reste mémorisée jusqu'au virage ;
  une tolérance de virage anticipé pourra s'ajouter dans `hero.ts` si le ressenti l'exige.
- [Valeurs de la table qui rendent le jeu trop facile ou trop dur] → valeurs isolées dans
  `levels.ts` et `docs/jeu.md`, ajustables sans toucher aux règles.

## Migration Plan

Sans objet (projet vierge).
