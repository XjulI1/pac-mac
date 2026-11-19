# Spec Delta

## Purpose

Dessiner le labyrinthe à la bonne échelle : taille des cases, murs néon calculés depuis la grille,
couleur des murs selon le niveau, objets, bonus et tunnel.

## ADDED Requirements

### Requirement: Mise à l'échelle

`fitMaze(cssWidth, cssHeight, devicePixelRatio)` SHALL renvoyer la plus grande taille de case
entière en pixels physiques qui fait tenir les 21 × 27 cases dans le conteneur, avec une densité
plafonnée à 3, la taille du canvas en pixels physiques et en pixels CSS, et le décalage qui le
centre dans le conteneur.

#### Scenario: Téléphone de 360 px en densité 2

- **WHEN** on appelle `fitMaze(360, 560, 2)`
- **THEN** la case mesure 34 pixels physiques, le canvas 714 × 918 pixels physiques et
  357 × 459 pixels CSS, décalé de 1,5 px à gauche et de 50,5 px en haut

#### Scenario: Téléphone en densité 3

- **WHEN** on appelle `fitMaze(390, 600, 3)`
- **THEN** la case mesure 55 pixels physiques et le canvas 385 × 495 pixels CSS

#### Scenario: Densité plafonnée

- **WHEN** on compare `fitMaze(390, 600, 4)` et `fitMaze(390, 600, 3)`
- **THEN** les deux résultats sont égaux

#### Scenario: Ordinateur en paysage

- **WHEN** on appelle `fitMaze(1280, 656, 1)`
- **THEN** la case mesure 24 pixels et le canvas 504 × 648 pixels, la hauteur étant le facteur
  limitant

### Requirement: Contours des murs

Les murs SHALL être tracés le long de la frontière entre les cases de mur et les cases non-mur de la
grille (couloirs, porte, nid), à partir de `MAZE`, en contours qui utilisent chaque arête de cette
frontière exactement une fois. Un contour SHALL être fermé, ou ouvert avec ses deux extrémités sur
le bord gauche ou droit de la grille.

#### Scenario: Décompte sur la grille du jeu

- **WHEN** on calcule les contours de `MAZE`
- **THEN** on obtient 472 arêtes réparties en 27 contours, 25 fermés et 2 ouverts
- **AND** les contours ouverts vont de (21, 11) à (0, 11) et de (0, 12) à (21, 12), en coordonnées
  de coins de case

#### Scenario: Bloc rectangulaire

- **WHEN** on calcule le contour du bloc de murs des colonnes 2 à 4 et des lignes 2 et 3
- **THEN** c'est un contour fermé de 10 arêtes qui, simplifié, n'a plus que les 4 coins (2, 2),
  (5, 2), (5, 4) et (2, 4)

#### Scenario: Décalage vers l'intérieur du mur

- **WHEN** on décale ce contour simplifié de 0,15 case vers l'intérieur du mur
- **THEN** ses coins sont (2,15 ; 2,15), (4,85 ; 2,15), (4,85 ; 3,85) et (2,15 ; 3,85)

#### Scenario: Symétrie

- **WHEN** on applique aux contours la symétrie par rapport à l'axe vertical du labyrinthe
- **THEN** on retrouve le même ensemble d'arêtes

### Requirement: Couleur des murs selon le niveau

`wallColor(level)` SHALL suivre en boucle la palette violet `#8b5cff`, sarcelle `#17b3a3`, jaune
`#ffd84d`, lavande `#c3a6ff`. Ces couleurs SHALL être différentes entre elles et de celles de Mac et
des quatre traqueurs.

#### Scenario: Cycle de quatre niveaux

- **WHEN** on lit `wallColor` pour les niveaux 1, 2, 4 et 5
- **THEN** on obtient violet, sarcelle, lavande puis de nouveau violet

#### Scenario: Couleurs distinctes des personnages

- **WHEN** on compare les quatre couleurs de murs à `#3df2ff`, `#ff3b5c`, `#ff4fd8`, `#ffa23b` et
  `#4dff88`
- **THEN** aucune n'est égale à une couleur de personnage

### Requirement: Objets et bonus

Le rendu SHALL dessiner chaque pastille et chaque prisme encore présents dans `items`, et le bonus
visible en (10, 13) avec l'icône de sa nature. Chaque nature de bonus SHALL avoir une icône et une
couleur. L'échelle d'un prisme SHALL pulser entre 0,75 et 1 sur 40 ticks, et rester à 1 pendant la
phase `ready`.

#### Scenario: Une icône par bonus

- **WHEN** on parcourt les huit natures de bonus
- **THEN** `BONUS_ICONS` et la palette ont une entrée pour chacune

#### Scenario: Pulsation des prismes

- **WHEN** on calcule l'échelle d'un prisme en phase `playing` aux ticks 0, 20 et 40
- **THEN** on obtient 1, 0,75 puis 1

#### Scenario: Prismes immobiles avant le départ

- **WHEN** on calcule l'échelle d'un prisme en phase `ready` au tick 20
- **THEN** on obtient 1

### Requirement: Personnages dans le tunnel

Un personnage dont le centre est à moins d'une demi-case d'un bord gauche ou droit du labyrinthe
SHALL être dessiné aussi de l'autre côté, décalé de 21 cases, et le dessin SHALL être découpé au
cadre du labyrinthe.

#### Scenario: Près du bord gauche

- **WHEN** on demande les copies à dessiner pour un centre en x = 30 unités
- **THEN** on obtient 30 et 2 550

#### Scenario: Au milieu

- **WHEN** on demande les copies pour un centre en x = 1 260 unités
- **THEN** on obtient seulement 1 260

#### Scenario: Près du bord droit

- **WHEN** on demande les copies pour un centre en x = 2 500 unités
- **THEN** on obtient 2 500 et −20
