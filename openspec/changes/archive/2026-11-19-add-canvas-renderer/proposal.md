## Why

Le moteur (`add-game-engine`, `add-chasers`) fait vivre une partie complète, mais rien ne permet
encore de la voir. Le rendu est ce qui donne son identité à PacMac : un labyrinthe néon lisible sur
un écran de téléphone, des personnages reconnaissables au premier coup d'œil, des animations
fluides à 60 images par seconde. Il faut aussi la boucle temps réel qui fait avancer le moteur à
pas fixe quelle que soit la fréquence de l'écran, avant que l'interface (`add-game-ui`) ne soit
branchée dessus.

## What Changes

- **Mise à l'échelle** : le labyrinthe de 21 × 27 cases occupe le plus de place possible dans son
  conteneur, avec une taille de case entière en pixels physiques et la densité de l'écran
  (`devicePixelRatio`, plafonnée à 3), sans déformation.
- **Murs néon** : chaque zone de mur est un bloc teinté bordé d'un tube lumineux qui suit son
  contour, coins arrondis, calculé depuis la grille du moteur et pré-rendu une fois par niveau et
  par taille sur un canvas hors écran. La couleur des murs change selon le niveau (palette
  originale de quatre couleurs). La porte du nid est une barre fine.
- **Objets** : pastilles en petits carrés lumineux, prismes pulsants à halo irisé, bonus en icônes
  néon (cristal, anneau, éclair, lune, couronne, diamant, comète, étoile).
- **Personnages** : Mac, carré cyan aux coins arrondis dont les yeux regardent sa direction et dont
  la bouche en fente s'ouvre et se ferme en avançant ; les quatre traqueurs avec leurs formes et
  couleurs de `docs/jeu.md`, qui oscillent dans le nid ; l'aspect vulnérable « néon éteint » qui
  grésille en fin de surcharge ; les étincelles et leur traînée.
- **Effets** pilotés par l'état et les événements du moteur : points qui s'affichent à la capture
  d'un traqueur ou au bonus mangé, désagrégation de Mac en pixels, clignotement des murs en fin de
  niveau, texte « Prêt ? ».
- **Tunnel** : un personnage à cheval sur un bord est dessiné des deux côtés, découpé au cadre du
  labyrinthe.
- **Boucle à pas fixe** : horloge pure qui convertit le temps réel en ticks de 1/60 s, avec
  rattrapage plafonné et coefficient d'interpolation ; boucle `requestAnimationFrame` qui appelle
  le moteur, collecte les événements et dessine une image interpolée entre les deux derniers ticks.
- **Écran provisoire** : `App.vue` affiche le labyrinthe et fait tourner une partie jouable aux
  flèches du clavier, en attendant `add-game-ui`.

## Capabilities

### New Capabilities

- `maze-rendering` : mise à l'échelle, contours et couleurs des murs, objets et bonus, tunnel.
- `actor-rendering` : apparence de Mac et des traqueurs selon leur état, interpolation des positions.
- `render-effects` : points affichés, désagrégation, fin de niveau, « Prêt ? », traînées.
- `frame-loop` : horloge à pas fixe, boucle d'animation, collecte des événements.

### Modified Capabilities

(aucune)

## Hors périmètre

Dans l'ordre des changes suivants :

1. `add-game-ui` : écrans (accueil, pause, fin de partie), HUD, commandes au clavier complètes et
   au doigt, pause automatique ; l'écran provisoire disparaît.
2. `add-sound` : effets sonores et jingles, abonnés aux événements collectés par la boucle.
3. `add-high-scores` : meilleurs scores et réglages.
4. `add-offline-pwa` : application installable et jouable hors ligne.

Pas de tests automatisés des pixels : seules les fonctions pures sont testées, le reste se vérifie
par une check-list visuelle.

## Impact

- Aucune dépendance à installer : Canvas 2D et `requestAnimationFrame` sont natifs.
- Nouveaux dossiers `src/render/` (palette, mise à l'échelle, contours, apparences, effets, dessin,
  composant `MazeCanvas.vue`) et `src/loop/` (horloge à pas fixe, boucle) ; nouveau
  `src/format.ts` (format des nombres, partagé avec le HUD).
- Nouveau projet Vitest `render` en environnement node.
- `src/App.vue` remplace l'accueil provisoire par l'écran de rendu provisoire.
- Dépend de `add-game-engine` et `add-chasers` (`MAZE`, `GameState`, `GameEvent`, `tick`). Le
  moteur n'est pas modifié ; le rendu ne fait que lire son état.
