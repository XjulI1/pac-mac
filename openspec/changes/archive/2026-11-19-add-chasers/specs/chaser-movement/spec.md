# Spec Delta

## Purpose

Déplacer les traqueurs sur la grille : choix de direction au centre de chaque case, interdits,
hasard, et vitesse selon leur état et la case où ils se trouvent.

## ADDED Requirements

### Requirement: Choix vers la cible

Au centre d'une case, un traqueur `active` ou `spark` qui a une cible SHALL prendre, parmi les
directions praticables autres que le demi-tour, celle dont la case voisine est la plus proche de la
cible (carré de la distance euclidienne, en cases). À égalité, l'ordre haut, droite, bas, gauche
SHALL départager.

#### Scenario: Vers une cible au-dessus

- **WHEN** un traqueur arrive au centre de (5, 4) en allant vers la droite, avec la cible (5, −2)
- **THEN** il prend la direction `up`

#### Scenario: Égalité

- **WHEN** un traqueur arrive au centre de (5, 4) en allant vers la droite, avec la cible (6, 3)
- **THEN** les cases (5, 3) et (6, 4) sont à égale distance et il prend la direction `up`

### Requirement: Pas de demi-tour spontané ni de porte

Un traqueur SHALL NOT choisir le demi-tour au centre d'une case, même si sa cible est derrière lui.
Pour un traqueur `active` ou `spark`, la porte du nid SHALL être un mur.

#### Scenario: Cible derrière

- **WHEN** un traqueur est au centre de (2, 25) en allant vers la droite, avec la cible (0, 25)
- **THEN** il continue vers la droite, seule direction possible

#### Scenario: Porte fermée

- **WHEN** un traqueur `active` est au centre de (10, 8) en allant vers la droite, avec la cible
  (10, 20)
- **THEN** il continue vers la droite sans franchir la porte

### Requirement: Choix au hasard

Un traqueur vulnérable, ou le Fureteur en traque qui ne voit pas Mac, SHALL choisir au hasard,
par le générateur de la partie, parmi les directions possibles. Le générateur SHALL être consommé
seulement quand il y a plus d'une direction possible.

#### Scenario: Hasard à une intersection

- **WHEN** un traqueur vulnérable arrive au centre de (5, 4) en allant vers la droite, avec 300
  graines différentes
- **THEN** il prend toujours `up`, `right` ou `down`, chacune au moins une fois, jamais `left`

#### Scenario: Pas de tirage dans un couloir

- **WHEN** un traqueur vulnérable passe le centre de (3, 25) en allant vers la droite
- **THEN** il continue vers la droite et `rngState` n'a pas changé

### Requirement: Vitesses des traqueurs

Un traqueur SHALL avancer, dans cet ordre de priorité : à 12 cases/s en `spark` ou `entering` ; à
la vitesse « dans le tunnel » du niveau en `inNest` ou `leaving` ; à la vitesse « vulnérables » s'il
est vulnérable ; à la vitesse « dans le tunnel » sur une case du tunnel ; à la vitesse des traqueurs
plus 10 % pour le Fureteur en traque qui voit Mac ; à la vitesse des traqueurs du niveau sinon.

#### Scenario: Vitesse normale au niveau 1

- **WHEN** un traqueur `active` avance 60 ticks dans un couloir hors tunnel au niveau 1
- **THEN** il a parcouru 672 unités

#### Scenario: Ralentissement dans le tunnel

- **WHEN** un traqueur `active` avance 60 ticks dans le tunnel au niveau 1
- **THEN** il a parcouru 360 unités

#### Scenario: Étincelle

- **WHEN** une étincelle avance 60 ticks sans atteindre le nid
- **THEN** elle a parcouru 1 440 unités

#### Scenario: Fureteur lancé

- **WHEN** le Fureteur en traque voit Mac pendant 60 ticks au niveau 1, hors tunnel
- **THEN** il a parcouru 739 unités

### Requirement: Mac plus rapide en surcharge

Pendant une surcharge, Mac SHALL avancer à la vitesse « Mac en surcharge » du niveau.

#### Scenario: Surcharge au niveau 1

- **WHEN** Mac avance 60 ticks en ligne droite pendant une surcharge au niveau 1
- **THEN** il a parcouru 792 unités
