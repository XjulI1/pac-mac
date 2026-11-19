# Design

## Context

Le moteur expose un `GameState` JSON (Mac, traqueurs avec `status` et `vulnerable`, `items`,
`bonus`, `surcharge`, `phase`, `tickCount`), la grille constante `MAZE` et des événements par tick
(`add-game-engine`, `add-chasers`). Il ne connaît que des cases et des unités internes (120 par
case). Ce change ajoute la représentation visuelle et la boucle temps réel. Motivation :
proposal.md ; exigences : `specs/` ; contenu (formes, couleurs) : `docs/jeu.md`.

## Goals / Non-Goals

**Goals :**

- Un rendu qui ne fait que lire l'état du moteur : aucune règle de jeu dupliquée, aucune écriture
  dans l'état.
- 60 images par seconde sur un téléphone de milieu de gamme : murs pré-rendus, aucun `shadowBlur`
  par image, pas de réactivité Vue dans la boucle.
- Toute la logique calculable (mise à l'échelle, contours, apparences, effets, interpolation,
  horloge) en fonctions pures testées en environnement node.
- Une boucle réutilisable par `add-game-ui` et `add-sound` sans modification.

**Non-Goals :**

- Tests de pixels ou captures d'écran comparées : vérification visuelle par check-list.
- Écrans, HUD, pause, commandes au doigt : `add-game-ui`.
- Sprites ou images : tout est dessiné en code.

## Decisions

### Arborescence

```
src/
  format.ts               formatScore : nombres à espaces fines insécables (pur)
  render/
    palette.ts            fond, Mac, traqueurs, vulnérable, objets, bonus, murs par niveau
    viewport.ts           fitMaze : taille de case, canvas, décalage (pur)
    wallContours.ts       arêtes mur / couloir, contours, simplification, décalage (pur)
    looks.ts              bouche, yeux, oscillation au nid, grésillement, pulsation,
                          clignotement de fin de niveau, aspect d'un traqueur (pur)
    interpolation.ts      position affichée entre deux ticks, copies du tunnel (pur)
    effects.ts            points flottants, traînées, désagrégation (pur)
    draw/
      walls.ts            calque des murs pré-rendu
      items.ts            pastilles, prismes, icônes de bonus (BONUS_ICONS)
      hero.ts             Mac et sa désagrégation
      chasers.ts          traqueurs et étincelles
      overlays.ts         « Prêt ? », points flottants
    mazeRenderer.ts       createMazeRenderer(canvas) : resize, render(frame), dispose
    MazeCanvas.vue        canvas, ResizeObserver, densité ; expose le renderer
    *.test.ts
  loop/
    fixedStep.ts          horloge à pas fixe (pur)
    gameLoop.ts           createGameLoop : planificateur injecté, ticks, événements, rendu
    useGameLoop.ts        enveloppe Vue (arrêt au démontage)
    *.test.ts
```

Une règle ESLint `no-restricted-imports` interdit `vue` dans `src/render/**/*.ts` et
`src/loop/{fixedStep,gameLoop}.ts` : seuls `MazeCanvas.vue` et `useGameLoop.ts` touchent à Vue.

### Mise à l'échelle

`fitMaze(cssWidth, cssHeight, devicePixelRatio)` :

- densité retenue `dpr = min(devicePixelRatio, 3)` ;
- taille de case en pixels physiques
  `tile = floor(min(cssWidth × dpr / 21, cssHeight × dpr / 27))` : un entier, pour que les
  pastilles et les tubes tombent sur la grille de pixels ;
- canvas de `21 × tile` sur `27 × tile` pixels physiques, affiché en
  `21 × tile / dpr` sur `27 × tile / dpr` pixels CSS, centré dans le conteneur.

Un `ResizeObserver` sur le conteneur recalcule la taille et invalide le calque des murs. Le
contexte 2D travaille en pixels physiques ; une case vaut `tile` pixels et une unité du moteur
`tile / 120`.

### Murs

`wallContours.ts`, entièrement pur :

1. **arêtes** : pour chaque case de mur, chaque côté qui touche une case non-mur de la grille
   (couloir, porte, nid) donne une arête unitaire, orientée pour garder le mur à droite ; les côtés
   qui donnent hors de la grille n'en donnent pas ;
2. **contours** : les arêtes s'enchaînent bout à bout en polylignes, fermées, ou ouvertes quand
   elles atteignent le bord de la grille (de part et d'autre du tunnel) ; la grille de
   `docs/jeu.md` donne 472 arêtes et 27 contours, dont 2 ouverts ;
3. **simplification** : les points alignés sont retirés, il ne reste que les coins ;
4. **décalage** : chaque coin est déplacé de 0,15 case vers l'intérieur du mur (somme des normales
   des deux arêtes voisines), ce qui laisse les couloirs plus larges que les tubes.

`draw/walls.ts` dessine sur un canvas hors écran (`OffscreenCanvas` si disponible, sinon un canvas
détaché) : remplissage de chaque zone de mur à 15 % d'opacité de la couleur du niveau, puis le
contour décalé en tube de 0,12 case avec coins arrondis (`arcTo`, rayon 0,2 case), halo par
`shadowBlur` permis ici car le calque n'est rendu qu'une fois. La porte est une barre de 0,1 case
de haut, rose pâle. Le calque est mis en cache par couple (couleur, taille de case) et copié d'un
seul `drawImage` à chaque image.

Un mur fin d'une case reste un bloc plein bordé de lumière, jamais deux traits parallèles vides :
le rendu ne reprend pas le look à double trait du genre.

Couleur des murs, en boucle tous les quatre niveaux : violet `#8b5cff`, sarcelle `#17b3a3`, jaune
`#ffd84d`, lavande `#c3a6ff`. Pendant `levelClear`, les murs alternent entre cette couleur et le
blanc toutes les 15 ticks : deux calques en cache, aucun recalcul.

Alternative écartée : **dessiner chaque case de mur comme un carré**. Simple, mais les jointures
entre cases se voient et le halo s'additionne aux coins ; le contour donne des formes nettes et un
halo continu.

### Objets et bonus

- Pastille : carré de 0,14 case, rose très pâle `#ffd9f2`.
- Prisme : disque blanc de 0,3 case entouré d'un anneau dégradé irisé, dont l'échelle pulse entre
  0,75 et 1 sur 40 ticks ; immobile pendant `ready`.
- Bonus : `BONUS_ICONS: Record<BonusKind, (ctx, size) => void>`, une icône néon par nature, chacune
  de sa couleur, exportée pour que le HUD de `add-game-ui` la réutilise.

Pastilles et prismes sont redessinés à chaque image depuis `items` : 219 petits rectangles et
cercles coûtent moins qu'un calque à invalider à chaque objet mangé.

### Personnages

- **Mac** : carré de 0,8 case, coins de 0,22 case, cyan `#3df2ff`, toujours droit. Ses deux yeux
  (petits rectangles couleur du fond) sont décalés de 0,12 case vers sa direction. Sa bouche est une
  fente horizontale sous les yeux, dont la hauteur suit `mouthOpening` : 0 au centre d'une case,
  ouverte en grand à 30 unités du centre, deux fois par case ; fermée à l'arrêt.
- **Traqueurs** : triangle (Limier, pointe tournée vers sa direction), losange (Coupeur), hexagone
  (Gardien), étoile à quatre branches qui tourne lentement (Fureteur), aux couleurs de
  `docs/jeu.md`, avec un point lumineux qui indique la direction. Dans le nid, ils oscillent
  verticalement de ± 0,15 case sur 60 ticks, chacun avec son propre déphasage.
- **Vulnérable** : même forme, contour gris `#6b7394` sans halo ni point de direction ; quand la
  surcharge a 120 ticks ou moins, alternance gris / blanc `#e8ecff` toutes les 8 ticks.
- **Étincelle** (`spark`, `entering`) : point blanc de 0,2 case et traînée des 6 dernières positions
  à la couleur du traqueur, d'opacité décroissante.

Halo des personnages par double tracé (forme agrandie à faible opacité, puis forme nette) plutôt
que `shadowBlur`, trop coûteux par image sur téléphone.

`chaserLook(chaser, state)` résume l'apparence d'un traqueur : `hidden`, `normal`, `dim`, `flash`
ou `spark`. Ordre de priorité : masqué en `levelClear` et en `gameOver`, en `dying` après les
30 premiers ticks, et pour le traqueur de `phase.chaser` en `chaserCaught` ; puis étincelle ; puis
vulnérable (`dim` ou `flash`) ; sinon `normal`.

### Effets

`effects.ts` tient un petit magasin côté rendu, hors de l'état du moteur :

- `recordEvents(effects, events, state)` ajoute un texte de points pour `chaserCaught` (à la case de
  capture, couleur du traqueur, 60 ticks, plus une seconde ligne « +1 000 » si `chainBonus`) et
  pour `bonusEaten` (en (10, 13), couleur du bonus, 90 ticks) ;
- `visibleEffects(effects, tickCount)` renvoie les effets en cours avec leur progression et oublie
  les expirés ; le texte monte d'une demi-case en s'effaçant ;
- `pushTrail(trail, position)` garde les 6 dernières positions d'une étincelle ; la traînée est
  vidée dès que le traqueur n'est plus une étincelle.

Toutes les durées se comptent en `tickCount` du moteur : en pause, les effets s'arrêtent aussi.

La désagrégation dépend seulement de la phase : `dyingVisual(phase)` renvoie les traqueurs visibles
et Mac intact pendant les 30 premiers ticks de `dying`, puis les traqueurs masqués et une
progression de 0 à 1 sur les 90 ticks suivants. `dissolvePixels(progress)` découpe Mac en 5 × 5
blocs qui s'écartent du centre selon des directions fixes (dérivées de l'indice du bloc, sans
hasard), rétrécissent et s'effacent.

« Prêt ? » s'affiche en blanc, centré sur la ligne 13 entre les colonnes 7 et 13, pendant toute
la phase `ready`.

### Interpolation et tunnel

La boucle garde l'état avant le dernier tick et l'état courant. Pour chaque personnage, la position
dessinée est `précédente + (courante − précédente) × alpha`, sauf si l'écart dépasse une case sur
un axe (traversée du tunnel, remise en place après une vie perdue ou un niveau) : on prend alors la
position courante. Un personnage dont le centre est à moins d'une demi-case d'un bord gauche ou
droit est dessiné deux fois (sa copie décalée de 21 cases), avec un découpage au cadre du
labyrinthe.

### Horloge à pas fixe

`fixedStep.ts` :

```ts
type Clock = { originMs: number | null; ticksDone: number }
advanceClock(clock, nowMs): { clock: Clock; ticks: number; alpha: number }
resetClock(): Clock
```

- première image après création ou remise à zéro : on fixe l'origine, 0 tick ;
- ticks dus : `floor((now − origine) × 60 / 1000 + 1e-6)` ; on joue la différence avec les ticks
  déjà faits ;
- au plus 6 ticks par image : au-delà, l'origine est avancée et le retard est abandonné (un onglet
  qui revient d'arrière-plan ne rejoue pas les secondes perdues) ;
- `alpha` est la fraction du tick suivant déjà écoulée, dans [0, 1[.

Compter les ticks depuis une origine, plutôt qu'accumuler des durées d'image, évite la dérive
d'arrondi : sur une seconde, la boucle joue exactement 60 ticks, à 60, 120 ou 144 Hz.

### Boucle

```ts
createGameLoop({ requestFrame, cancelFrame, step, render, onEvents }): GameLoop
type GameLoop = { start(): void; stop(): void; pause(): void; resume(): void; readonly running: boolean }
```

À chaque image : `advanceClock`, puis `step()` autant de fois que de ticks (chaque `step` renvoie
les événements de son tick), puis `onEvents` avec les événements de l'image dans l'ordre des
ticks, puis `render(alpha)`. En pause, aucune image n'est demandée ; `resume` remet l'horloge à
zéro. Le planificateur est injecté : les tests passent un faux `requestFrame` piloté à la main,
l'application passe `requestAnimationFrame`. `useGameLoop` ne fait qu'arrêter la boucle au
démontage du composant.

La boucle ne connaît ni l'entrée ni le moteur : c'est le `step` fourni par l'appelant qui appelle
`tick(state, input)`. L'écran provisoire de ce change, puis la session de `add-game-ui`, le
fournissent.

### Écran provisoire

`App.vue` affiche `MazeCanvas` en plein écran sur fond sombre, crée une partie avec la graine
`Date.now()` (côté interface, jamais dans le moteur), mémorise la dernière flèche pressée et
l'envoie au tick suivant, et relance une partie avec Entrée après `gameOver`. Il disparaît avec
`add-game-ui`.

### Format des nombres

`formatScore(n)` sépare les milliers par une espace fine insécable (U+202F), comme le veut la
typographie française : `12 450`. Il sert aux points flottants ici et au HUD ensuite.

## Risks / Trade-offs

- [Images perdues sur un téléphone modeste] → murs pré-rendus, halo par double tracé, pas de
  `shadowBlur` par image, densité plafonnée à 3 ; mesure dans la check-list (profilage avec un CPU
  ralenti 4 ×).
- [Couleurs peu lisibles pour les daltoniens] → chaque traqueur a aussi sa forme propre, et l'état
  vulnérable change la forme d'aspect (gris sans halo), pas seulement la teinte.
- [Labyrinthe trop petit sur un écran de 360 px] → 360 px CSS × 2 donnent des cases de 34 pixels
  physiques (17 px CSS), lisibles ; vérifié dans la check-list.
- [Texte « Prêt ? » ou points qui débordent d'une case] → taille de police en fraction de case,
  vérifiée sur les plus petites tailles.
- [Interpolation qui fait « glisser » un personnage dans un mur au moment d'un virage] → en un
  tick un personnage avance d'au plus 24 unités : s'il tourne au centre d'une case, l'interpolation
  coupe le coin d'au plus 0,1 case, à l'intérieur du couloir ; vérifié visuellement à 120 Hz.

## Migration Plan

Sans objet : aucune donnée persistée.
