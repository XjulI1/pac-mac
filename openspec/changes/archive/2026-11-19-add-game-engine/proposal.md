## Why

Le projet part de zéro. Tout ce qui viendra ensuite (traqueurs, rendu Canvas, interface, son,
meilleurs scores) consomme l'état d'une partie et doit respecter les mêmes règles. Il faut donc
d'abord un **socle applicatif** et un **moteur de jeu** pur, déterministe et sérialisable, testé en
TDD, sur lequel brancher l'affichage et le son sans jamais dupliquer de logique de jeu.

## What Changes

- **Socle du projet** : application Vite + Vue 3 + TypeScript strict, gérée avec pnpm, avec Vitest,
  ESLint et vérification de types. L'application affiche seulement un écran d'accueil provisoire.
- **Labyrinthe en données** : la grille de 21 × 27 cases de [`docs/jeu.md`](../../../docs/jeu.md),
  ses pastilles, ses prismes, la porte et l'intérieur du nid, le tunnel et les points remarquables,
  avec ses invariants vérifiés par les tests (couloirs d'une case, aucun cul-de-sac, connexité,
  symétrie, décomptes).
- **Table des niveaux** : vitesses, durée de surcharge, bonus, seuils de sortie du nid, délai
  d'inactivité et calendrier des modes de chaque niveau, tels que décrits dans `docs/jeu.md`. Les
  valeurs propres aux traqueurs sont saisies ici et servent à partir de `add-chasers`.
- **Moteur de jeu** (`src/engine/`, sans dépendance à Vue ni au DOM) :
  - création d'une partie à partir d'une graine : niveau 1, score 0, 3 vies, Mac à son départ ;
  - avance du jeu par ticks de 1/60 s : `tick(état, entrée) → { état, événements }` ;
  - phases `ready` (« Prêt ? »), `playing` et `levelClear` ;
  - déplacement de Mac sur la grille en unités entières : départ à l'arrêt jusqu'à la première
    commande, direction voulue mémorisée jusqu'au prochain virage possible, demi-tour immédiat, arrêt contre un mur, tunnel, porte du nid
    infranchissable ;
  - pastilles et prismes mangés, score, bonus qui apparaît deux fois par niveau, vies
    supplémentaires au score ;
  - fin de niveau quand tous les objets sont mangés, puis niveau suivant.
- **Événements** émis à chaque tick (objet mangé, bonus apparu, mangé ou disparu, vie gagnée,
  niveau terminé ou commencé) pour piloter les futures animations et les sons.
- **Déterminisme** : générateur pseudo-aléatoire à graine stocké dans l'état, aucune lecture de
  l'horloge ; même graine et mêmes entrées donnent la même partie.

## Capabilities

### New Capabilities

- `maze` : la grille, ses symboles, ses décomptes, ses invariants, le voisinage et le tunnel.
- `game-setup` : création d'une partie et état initial.
- `game-loop` : API `tick`, pas de temps fixe, phases, événements, déterminisme, sérialisation.
- `hero-movement` : déplacement de Mac, direction voulue, demi-tour, murs, tunnel, porte du nid.
- `pellets-and-scoring` : pastilles, prismes, bonus, score et vies supplémentaires.
- `level-progression` : table des niveaux, fin de niveau et passage au suivant.

### Modified Capabilities

(aucune, projet vierge)

## Hors périmètre

Chaque point fera l'objet d'un change ultérieur, dans cet ordre :

1. `add-chasers` : les quatre traqueurs et leurs comportements, le nid, l'alternance patrouille et
   traque, la surcharge déclenchée par les prismes, les captures, la perte de vies et la fin de
   partie.
2. `add-canvas-renderer` : rendu Canvas 2D néon du labyrinthe, des personnages et des animations.
3. `add-game-ui` : écrans, HUD, boucle de jeu en temps réel, commandes au clavier et au doigt,
   pause.
4. `add-sound` : effets sonores et jingles synthétisés.
5. `add-high-scores` : meilleurs scores et réglages conservés dans le navigateur.
6. `add-offline-pwa` : application installable et jouable hors ligne.

Rien de ce change n'est visible en jeu : il se vérifie par les tests du moteur.

## Impact

- Nouveau dépôt : `package.json`, configuration Vite, TypeScript, Vitest et ESLint, `index.html`,
  `src/main.ts`, `src/App.vue`.
- Nouveau module `src/engine/` (types, unités, labyrinthe, table des niveaux, générateur aléatoire,
  règles) avec tests colocalisés.
- Dépendances à installer par l'utilisateur (`pnpm install`) : vue, vite, @vitejs/plugin-vue,
  typescript, vue-tsc, vitest, eslint, @eslint/js, typescript-eslint, eslint-plugin-vue,
  vue-eslint-parser, globals, @types/node.
- Aucune dépendance runtime ajoutée au moteur.
