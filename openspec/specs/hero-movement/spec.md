# hero-movement Specification

## Purpose
Déplacer Mac sur la grille selon les entrées du joueur : vitesse, direction voulue, demi-tour,
murs, tunnel et porte du nid.
## Requirements
### Requirement: Départ à l'arrêt

Au début de chaque niveau et après chaque vie perdue, Mac SHALL attendre à l'arrêt la première
direction praticable demandée par le joueur, pendant que les traqueurs bougent déjà.

#### Scenario: Mac attend une commande

- **WHEN** une partie neuve passe en `playing` et qu'on applique 300 ticks sans entrée
- **THEN** Mac est toujours en (1 260, 2 100), à l'arrêt

#### Scenario: Première commande

- **WHEN** Mac attend au départ et qu'on envoie `left`
- **THEN** il part vers la gauche au tick même et se trouve en (1 248, 2 100)

#### Scenario: Commande vers un mur

- **WHEN** Mac attend au départ et qu'on envoie `up`
- **THEN** il reste à l'arrêt, et la direction `up` est oubliée au bout de 30 ticks

### Requirement: Vitesse

En phase `playing`, Mac SHALL avancer à la vitesse de son niveau, convertie en unités entières par
tick, la fraction d'unité restante étant reportée au tick suivant.

#### Scenario: Vitesse au niveau 1

- **WHEN** Mac est au centre de (1, 25), en mouvement vers la droite, au niveau 1, et qu'on
  applique 10 ticks
- **THEN** il est en (300, 3 060)

#### Scenario: Vitesse fractionnaire au niveau 2

- **WHEN** Mac est au centre de (1, 25), en mouvement vers la droite, au niveau 2 (6,4 cases/s),
  et qu'on applique 60 ticks
- **THEN** il a parcouru exactement 768 unités et se trouve en (948, 3 060)

### Requirement: Continuer tout droit et s'arrêter contre un mur

Au centre d'une case, sans direction voulue praticable, Mac en mouvement SHALL continuer dans sa
direction si la case voisine est praticable, et SHALL s'arrêter au centre sinon, en gardant sa
direction. Mac à l'arrêt SHALL le rester tant qu'aucune direction voulue n'est praticable.

#### Scenario: Arrêt contre un mur

- **WHEN** Mac est au centre de (3, 25), en mouvement vers la gauche, au niveau 1, et qu'on
  applique 30 ticks
- **THEN** il est arrêté au centre de (1, 25), en (180, 3 060), avec `moving` faux et la direction
  `left`

### Requirement: Direction voulue

Une entrée non nulle SHALL remplacer la direction voulue. Au centre d'une case, Mac SHALL prendre la
direction voulue si la case voisine dans cette direction est praticable. Une direction voulue que
Mac n'a pas pu prendre SHALL être oubliée après 30 ticks de `playing` ; une nouvelle entrée, même
identique, SHALL relancer ce délai, qui ne court pas pendant `ready`.

#### Scenario: Virage au premier centre possible

- **WHEN** Mac est au départ (1 260, 2 100), en mouvement vers la gauche, au niveau 1, avec la
  direction voulue `up`, et qu'on applique 11 ticks
- **THEN** il a tourné au centre de (9, 17) et se trouve en (1 140, 2 088), direction `up`

#### Scenario: Virage annoncé juste avant

- **WHEN** Mac est au centre de (7, 25), en mouvement vers la droite, au niveau 1, qu'on envoie
  `up` et qu'on applique 21 ticks
- **THEN** il a dépassé (8, 25) sans tourner, a tourné au centre de (9, 25) et se trouve en
  (1 140, 3 048), direction `up`

#### Scenario: Virage oublié

- **WHEN** Mac est au centre de (2, 25), en mouvement vers la droite, au niveau 1, qu'on envoie
  `up` et qu'on applique 71 ticks
- **THEN** la direction voulue est nulle depuis le 30e tick, Mac n'a pas tourné en (9, 25) et se
  trouve en (1 152, 3 060), direction `right`

#### Scenario: Délai relancé

- **WHEN** Mac est au centre de (2, 25), en mouvement vers la droite, au niveau 1, et qu'on envoie
  `up` à chaque tick
- **THEN** il tourne au centre de (9, 25)

#### Scenario: Repartir d'un arrêt

- **WHEN** Mac est arrêté au centre de (1, 25) face au mur de gauche, qu'on envoie `down` puis `up`
- **THEN** il reste arrêté après `down`, et part vers le haut après `up`

### Requirement: Demi-tour immédiat

Une direction voulue opposée à la direction actuelle SHALL faire faire demi-tour à Mac dans le tick
même, y compris entre deux centres.

#### Scenario: Demi-tour entre deux centres

- **WHEN** Mac, parti du centre de (1, 25) vers la droite au niveau 1, est en (216, 3 060) après
  3 ticks, et qu'on envoie `left`
- **THEN** au tick suivant il est en (204, 3 060), direction `left`

### Requirement: Tunnel

Mac SHALL traverser le tunnel à sa vitesse normale et réapparaître au bord opposé.

#### Scenario: Sortie par la gauche

- **WHEN** Mac est au centre de (0, 11), en mouvement vers la gauche, au niveau 1, et qu'on
  applique 10 ticks
- **THEN** il est au centre de (20, 11), en (2 460, 1 380)

### Requirement: Porte et nid interdits à Mac

La porte et l'intérieur du nid SHALL être des murs pour Mac.

#### Scenario: Passage devant la porte

- **WHEN** Mac est au centre de (10, 8), en mouvement vers la gauche, avec la direction voulue
  `down`, et qu'on applique 1 tick
- **THEN** il continue vers la gauche et se trouve en (1 248, 1 020)
