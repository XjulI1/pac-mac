# Contenu du jeu

Référence du contenu de PacMac : labyrinthe, personnages, objets, scores et table des niveaux. Les
specs d'OpenSpec y renvoient ; une valeur changée ici doit l'être aussi dans `src/engine/`, et
inversement.

Tout ce contenu est original. Le jeu reprend les mécaniques du genre (pastilles à ramasser, bonus
qui retourne la chasse, tunnel latéral, nid central, alternance patrouille et traque) sans reprendre
le labyrinthe, les personnages, les noms, les valeurs, les sons ni les visuels d'un jeu existant.

## Unités

- **Case** : unité de la grille. Une case mesure 120 unités internes, et le centre de la case
  (colonne `c`, ligne `r`) est au point (`c × 120 + 60`, `r × 120 + 60`).
- **Coordonnées** : (colonne, ligne), à partir de (0, 0) en haut à gauche.
- **Temps** : le moteur avance par ticks de 1/60 s. Une durée de `d` secondes dure `d × 60` ticks.
- **Vitesses** : en cases par seconde. Une vitesse de `v` cases/s fait `v × 120` unités par
  seconde, soit 1/60 de cette valeur par tick ; la fraction d'unité restante est reportée au tick
  suivant.

## Le labyrinthe

21 colonnes sur 27 lignes, symétrique par rapport à la colonne 10.

```
          11111111112
012345678901234567890
#####################   0
#.........#.........#   1
#.###.###.#.###.###.#   2
#o###.###.#.###.###o#   3
#...................#   4
#.###.#.#####.#.###.#   5
#.....#...#...#.....#   6
#####.###.#.###.#####   7
#####.#       #.#####   8
#####.# ##-## #.#####   9
#####.  #NNN#  .#####  10
     .# #NNN# #.       11
#####.# ##### #.#####  12
#####.#       #.#####  13
#####.# ##### #.#####  14
#.........#.........#  15
#.###.###.#.###.###.#  16
#o..#.....P.....#..o#  17
###.#.#.#####.#.#.###  18
#.....#...#...#.....#  19
#.###.###.#.###.###.#  20
#...#...........#...#  21
###.#.#.#####.#.#.###  22
#.....#...#...#.....#  23
#.#######.#.#######.#  24
#...................#  25
#####################  26
```

| Symbole | Case |
|---|---|
| `#` | Mur |
| `.` | Couloir avec une pastille |
| `o` | Couloir avec un prisme |
| espace | Couloir vide |
| `-` | Porte du nid : un mur pour Mac, franchissable par les traqueurs qui sortent ou rentrent |
| `N` | Intérieur du nid |
| `P` | Départ de Mac, couloir vide |

Décomptes : **215 pastilles**, **4 prismes** (219 objets), 256 cases de couloir, une porte et
6 cases de nid.

Propriétés vérifiées par les tests du moteur :

- les couloirs font une case de large : aucun carré de 2 × 2 cases de couloir ;
- aucun cul-de-sac : chaque case de couloir a au moins deux voisines praticables, tunnel compris ;
- toutes les cases de couloir communiquent entre elles ;
- la grille est symétrique par rapport à la colonne 10, au départ de Mac près.

Points remarquables :

| Élément | Position |
|---|---|
| Départ de Mac | (10, 17), tourné vers la gauche, à l'arrêt jusqu'à la première commande |
| Porte du nid | (10, 9) |
| Case de sortie du nid | (10, 8) |
| Point de régénération dans le nid | (10, 10) |
| Apparition du bonus | (10, 13) |
| Tunnel | ligne 11, colonnes 0 à 4 et 16 à 20 ; sortir par un bord fait réapparaître au bord opposé |

Une **intersection** est une case de couloir qui a au moins trois voisines praticables. La porte du
nid compte comme un mur dans ce calcul.

## Personnages

### Mac

Le personnage du joueur : un petit carré néon cyan (`#3df2ff`) aux coins arrondis, avec deux yeux
qui regardent dans la direction du déplacement et une bouche en fente qui s'ouvre et se ferme
quand il avance. Il se désagrège en pixels quand un traqueur le touche.

### Les traqueurs

Quatre formes géométriques au néon. Chacune a sa propre façon de choisir sa cible.

| Traqueur | Forme | Couleur | Position de départ | Coin de patrouille (cible) |
|---|---|---|---|---|
| **Limier** | triangle | rouge `#ff3b5c` | (10, 8), hors du nid, tourné vers la gauche | (20, −2), en haut à droite |
| **Coupeur** | losange | magenta `#ff4fd8` | (10, 11), dans le nid | (0, −2), en haut à gauche |
| **Gardien** | hexagone | orange `#ffa23b` | (9, 11), dans le nid | (20, 28), en bas à droite |
| **Fureteur** | étoile à quatre branches | vert `#4dff88` | (11, 11), dans le nid | (0, 28), en bas à gauche |

Cible de chacun en **traque** :

- **Limier** : la case de Mac.
- **Coupeur** : la prochaine intersection devant Mac. On part de la case de Mac dans sa direction et
  on suit le couloir case par case, en prenant les coudes, jusqu'à la première intersection, au
  plus 8 cases. Si Mac est arrêté contre un mur, la cible est sa case.
- **Gardien** : si Mac est à 5 cases ou moins de lui (distance de Manhattan, sans passer par le
  tunnel), la case de Mac. Sinon, le quart du labyrinthe qui contient le plus d'objets restants :
  il en vise la case repère.

  | Quart | Colonnes | Lignes | Case repère |
  |---|---|---|---|
  | haut gauche | 0 à 9 | 0 à 13 | (5, 4) |
  | haut droite | 11 à 20 | 0 à 13 | (15, 4) |
  | bas gauche | 0 à 9 | 14 à 26 | (5, 21) |
  | bas droite | 11 à 20 | 14 à 26 | (15, 21) |

  La colonne 10 ne compte pour aucun quart. À égalité, l'ordre du tableau départage.
- **Fureteur** : il choisit au hasard à chaque intersection, par le générateur de la partie. S'il
  voit Mac, c'est-à-dire s'il est sur la même ligne ou la même colonne sans mur entre eux (la vue ne
  traverse pas le tunnel), il prend la case de Mac pour cible et va 10 % plus vite tant qu'il le
  voit.

### Déplacement des traqueurs

- Un traqueur ne s'arrête jamais et ne fait jamais demi-tour de lui-même.
- Au centre de chaque case, il choisit parmi les directions praticables, demi-tour exclu, celle
  dont la case voisine est la plus proche de sa cible à vol d'oiseau. À égalité : haut, droite,
  bas, gauche.
- Il fait demi-tour à chaque changement de mode (patrouille ↔ traque) et au début d'une surcharge.
- Dans le tunnel, il ralentit (voir la table des niveaux).

### Modes

Les traqueurs alternent **patrouille** (chacun vise son coin) et **traque** (chacun vise sa cible),
en commençant par la patrouille, selon un calendrier qui dépend du niveau. Le calendrier repart du
début à chaque niveau et après chaque vie perdue, et il est suspendu pendant une surcharge.

| Niveaux | Patrouille | Traque | Patrouille | Traque | Patrouille | Traque | Patrouille | Puis |
|---|---|---|---|---|---|---|---|---|
| 1 | 6 s | 18 s | 6 s | 18 s | 4 s | 24 s | 4 s | traque |
| 2 à 4 | 5 s | 22 s | 5 s | 22 s | 3 s | 30 s | 3 s | traque |
| 5 et plus | 4 s | 25 s | 4 s | 25 s | 2 s | 40 s | 2 s | traque |

### Le nid

- Le Limier commence dehors. Les trois autres sortent dans l'ordre Coupeur, Gardien, Fureteur,
  quand le nombre d'objets mangés depuis le début du niveau (ou depuis la dernière vie perdue)
  atteint leur seuil.
- Si Mac ne mange rien pendant le **délai d'inactivité**, le prochain traqueur du nid sort aussitôt
  et le délai repart.
- Pour sortir, un traqueur rejoint la colonne 10, monte par la porte jusqu'à la case de sortie
  (10, 8), puis se déplace normalement.
- Un traqueur capturé devient une **étincelle** qui file à 12 cases/s vers la case de sortie, entre
  dans le nid jusqu'au point de régénération, s'y reforme aussitôt et ressort.

## Objets et scores

| Objet | Points |
|---|---|
| Pastille | 10 |
| Prisme | 50, et déclenche une surcharge |
| Traqueur capturé pendant une surcharge | 200, puis 400, 600 et 800 |
| Chaîne complète (les quatre traqueurs capturés pendant la même surcharge) | 1 000 en plus |
| Bonus | selon le niveau |

### Surcharge

- Manger un prisme rend vulnérables tous les traqueurs qui ne sont pas des étincelles, y compris
  ceux du nid, pour la durée de surcharge du niveau. Les traqueurs vulnérables font demi-tour,
  ralentissent et choisissent leur direction au hasard à chaque intersection.
- Le premier traqueur capturé rapporte 200 points, le suivant 400, puis 600 et 800. Un nouveau prisme
  relance la surcharge à sa durée complète et remet la chaîne à 200.
- Un traqueur vulnérable grésille pendant les 2 dernières secondes de la surcharge.
- La capture fige le jeu 0,5 s, le temps d'afficher les points.

### Bonus

Un bonus apparaît en (10, 13) quand Mac a mangé **70** puis **150** objets dans le niveau. Il reste
**9 s**, ou jusqu'à ce que Mac le mange ou perde une vie.

| Niveau | Bonus | Points |
|---|---|---|
| 1 | Cristal | 100 |
| 2 | Anneau | 250 |
| 3 | Éclair | 400 |
| 4 | Lune | 600 |
| 5 | Couronne | 800 |
| 6 | Diamant | 1 200 |
| 7 | Comète | 1 800 |
| 8 et plus | Étoile | 2 500 |

### Vies

- La partie commence avec **3 vies**, celle en jeu comprise.
- Une vie supplémentaire à **10 000 points**, puis tous les **25 000 points** (35 000, 60 000…),
  sans dépasser **5 vies**.
- Un traqueur qui n'est ni vulnérable ni une étincelle touche Mac quand leurs centres sont à moins
  d'une demi-case l'un de l'autre : Mac perd une vie. Les pastilles déjà mangées le restent.

## Table des niveaux

Vitesses en cases par seconde.

| Niveau | Mac | Mac en surcharge | Traqueurs | Vulnérables | Dans le tunnel | Surcharge | Seuils de sortie (Coupeur / Gardien / Fureteur) | Inactivité |
|---|---|---|---|---|---|---|---|---|
| 1 | 6,0 | 6,6 | 5,6 | 3,4 | 3,0 | 7 s | 0 / 15 / 40 | 4 s |
| 2 | 6,4 | 6,8 | 6,0 | 3,6 | 3,2 | 6 s | 0 / 0 / 20 | 4 s |
| 3 | 6,8 | 7,0 | 6,4 | 3,8 | 3,4 | 5 s | 0 / 0 / 0 | 4 s |
| 4 | 7,0 | 7,2 | 6,8 | 4,0 | 3,4 | 4 s | 0 / 0 / 0 | 4 s |
| 5 | 7,2 | 7,4 | 7,0 | 4,0 | 3,6 | 3 s | 0 / 0 / 0 | 3 s |
| 6 | 7,4 | 7,5 | 7,2 | 4,2 | 3,6 | 2 s | 0 / 0 / 0 | 3 s |
| 7 | 7,5 | 7,5 | 7,4 | 4,2 | 3,8 | 2 s | 0 / 0 / 0 | 3 s |
| 8 et plus | 7,5 | 7,5 | 7,6 | 4,4 | 3,8 | 1 s | 0 / 0 / 0 | 3 s |

Étincelle : 12 cases/s à tous les niveaux. Fureteur qui voit Mac : sa vitesse du moment + 10 %,
arrondie à l'unité interne.

## Rythme d'une partie

| Moment | Durée |
|---|---|
| Début de partie (« Prêt ? ») | 4 s |
| Début de niveau, reprise après une vie perdue | 2 s |
| Capture d'un traqueur | 0,5 s figé |
| Perte d'une vie | 2 s |
| Fin de niveau (le labyrinthe clignote) | 2 s |
| Mémoire d'un virage annoncé que Mac n'a pas encore pu prendre | 0,5 s |

Le jeu est figé pendant ces moments : seuls les animations et les sons avancent.
