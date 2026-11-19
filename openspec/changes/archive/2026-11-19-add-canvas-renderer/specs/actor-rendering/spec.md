# Spec Delta

## Purpose

Donner à Mac et aux traqueurs leur apparence selon leur état, et placer chaque personnage entre deux
ticks pour une animation fluide.

## ADDED Requirements

### Requirement: Palette des personnages

La palette SHALL reprendre les couleurs de `docs/jeu.md` : Mac `#3df2ff`, Limier `#ff3b5c`, Coupeur
`#ff4fd8`, Gardien `#ffa23b`, Fureteur `#4dff88`, et SHALL définir l'aspect vulnérable gris
`#6b7394` et son éclat blanc `#e8ecff`.

#### Scenario: Couleur de chaque traqueur

- **WHEN** on lit la couleur de `hound`, `cutter`, `warden` et `prowler`
- **THEN** on obtient `#ff3b5c`, `#ff4fd8`, `#ffa23b` et `#4dff88`

### Requirement: Bouche et regard de Mac

La bouche de Mac SHALL s'ouvrir et se fermer deux fois par case parcourue : `mouthOpening` vaut 0
quand Mac est au centre d'une case ou à mi-chemin entre deux centres, 1 à 30 unités de ces points,
et 0 quand Mac est arrêté. Ses yeux SHALL être décalés de 0,12 case vers sa direction.

#### Scenario: Au centre d'une case

- **WHEN** Mac avance vers la gauche et se trouve en (1 260, 2 100)
- **THEN** `mouthOpening` vaut 0

#### Scenario: Bouche grande ouverte

- **WHEN** Mac avance vers la gauche et se trouve en (1 230, 2 100)
- **THEN** `mouthOpening` vaut 1

#### Scenario: Arrêté contre un mur

- **WHEN** Mac est arrêté en (180, 3 060)
- **THEN** `mouthOpening` vaut 0

#### Scenario: Regard

- **WHEN** Mac est tourné vers le haut
- **THEN** le décalage de ses yeux vaut (0, −0,12) case

### Requirement: Aspect des traqueurs

`chaserLook(chaser, state)` SHALL renvoyer `hidden` en phase `levelClear` ou `gameOver`, en phase
`dying` à partir de son 30e tick, et pour le traqueur capturé pendant `chaserCaught` ; sinon
`spark` pour un traqueur `spark` ou `entering` ; sinon, pour un traqueur vulnérable, `dim` si la
surcharge a plus de 120 ticks restants et, à 120 ou moins, `dim` et `flash` en alternance toutes les
8 ticks (`dim` quand `floor(tickCount / 8)` est pair) ; sinon `normal`.

#### Scenario: Vulnérable en début de surcharge

- **WHEN** un traqueur vulnérable est dessiné avec une surcharge à 300 ticks restants
- **THEN** son aspect est `dim`

#### Scenario: Grésillement en fin de surcharge

- **WHEN** un traqueur vulnérable est dessiné avec une surcharge à 100 ticks restants, aux ticks
  160 puis 168
- **THEN** son aspect est `dim` puis `flash`

#### Scenario: Étincelle

- **WHEN** un traqueur est en `entering`
- **THEN** son aspect est `spark`

#### Scenario: Traqueur capturé pendant le gel

- **WHEN** la phase est `chaserCaught` pour `warden`
- **THEN** le Gardien est `hidden` et les autres traqueurs gardent leur aspect

#### Scenario: Perte d'une vie

- **WHEN** la phase est `dying` avec 100 puis 80 ticks restants
- **THEN** les traqueurs sont visibles, puis `hidden`

### Requirement: Oscillation dans le nid

Un traqueur `inNest` SHALL osciller verticalement de 0,15 case au plus, avec une période de 60 ticks
et un déphasage propre à chaque traqueur. Un traqueur hors du nid SHALL NOT osciller.

#### Scenario: Amplitude et période

- **WHEN** on calcule l'oscillation du Coupeur à chaque tick de 0 à 120
- **THEN** elle reste entre −0,15 et 0,15 case et vaut la même chose aux ticks t et t + 60

#### Scenario: Déphasage

- **WHEN** on calcule l'oscillation du Coupeur et du Gardien au tick 0
- **THEN** les deux valeurs diffèrent

### Requirement: Interpolation entre deux ticks

La position dessinée d'un personnage SHALL être interpolée linéairement entre sa position avant le
dernier tick et sa position courante, selon le coefficient `alpha` de la boucle. Si l'écart dépasse
une case sur un axe, la position courante SHALL être prise telle quelle.

#### Scenario: Mi-chemin

- **WHEN** on interpole entre (1 260, 2 100) et (1 248, 2 100) avec `alpha` = 0,5
- **THEN** on obtient (1 254, 2 100)

#### Scenario: Traversée du tunnel

- **WHEN** on interpole entre (6, 1 380) et (2 514, 1 380) avec `alpha` = 0,5
- **THEN** on obtient (2 514, 1 380)

#### Scenario: Remise en place

- **WHEN** on interpole entre (180, 3 060) et (1 260, 2 100) avec `alpha` = 0,3
- **THEN** on obtient (1 260, 2 100)
