# chaser-targets Specification

## Purpose
Donner à chaque traqueur sa cible : son coin en patrouille, sa propre stratégie en traque.
## Requirements
### Requirement: Coins de patrouille

En patrouille, chaque traqueur SHALL viser son coin, hors du labyrinthe : Limier (20, −2), Coupeur
(0, −2), Gardien (20, 28), Fureteur (0, 28).

#### Scenario: Cibles de patrouille

- **WHEN** on demande la cible de chaque traqueur en patrouille
- **THEN** on obtient (20, −2), (0, −2), (20, 28) et (0, 28)

### Requirement: Limier

En traque, le Limier SHALL viser la case de Mac.

#### Scenario: Cible du Limier

- **WHEN** Mac est dans la case (3, 19) et que le mode est la traque
- **THEN** le Limier vise (3, 19)

### Requirement: Coupeur

En traque, le Coupeur SHALL viser la prochaine intersection devant Mac : en partant de la case de
Mac dans sa direction, case par case, en prenant un coude quand il n'y a qu'une issue (demi-tour
exclu), jusqu'à la première intersection, ou après 8 cases, ou devant un embranchement. Si Mac est
arrêté, le Coupeur SHALL viser la case de Mac.

#### Scenario: Intersection proche

- **WHEN** Mac est au départ (10, 17), en mouvement vers la gauche
- **THEN** le Coupeur vise (9, 17)

#### Scenario: Huit cases tout droit

- **WHEN** Mac est en (1, 25), en mouvement vers la droite
- **THEN** le Coupeur vise (9, 25)

#### Scenario: Deux coudes

- **WHEN** Mac est en (2, 21), en mouvement vers la gauche
- **THEN** le Coupeur vise (3, 19), après les coudes de (1, 21) et (1, 19)

#### Scenario: Limite de 8 cases

- **WHEN** Mac est en (9, 25), en mouvement vers la gauche
- **THEN** le Coupeur vise (1, 25), 8 cases plus loin, sans y trouver d'intersection

#### Scenario: Mac arrêté

- **WHEN** Mac est arrêté en (1, 25) face au mur
- **THEN** le Coupeur vise (1, 25)

### Requirement: Gardien

En traque, le Gardien SHALL viser la case de Mac si la distance de Manhattan entre eux est d'au plus
5 cases (sans passer par le tunnel), et sinon la case repère du quart qui contient le plus d'objets
restants : haut gauche (5, 4), haut droite (15, 4), bas gauche (5, 21), bas droite (15, 21), la
colonne 10 ne comptant dans aucun quart et l'ordre de cette liste départageant les égalités.

#### Scenario: Mac à portée

- **WHEN** le Gardien est en (5, 4) et Mac en (8, 6)
- **THEN** le Gardien vise (8, 6)

#### Scenario: Mac hors de portée, partie neuve

- **WHEN** le Gardien est en (5, 4), Mac en (9, 6), et qu'aucun objet n'a été mangé (43, 43, 65 et
  65 objets par quart)
- **THEN** le Gardien vise (5, 21), le bas gauche passant avant le bas droite à égalité

#### Scenario: Quart le plus riche

- **WHEN** Mac, hors de portée, a mangé une pastille du quart bas gauche
- **THEN** le Gardien vise (15, 21)

### Requirement: Fureteur

En traque, le Fureteur SHALL viser la case de Mac s'il le voit, c'est-à-dire s'ils sont sur la même
ligne ou la même colonne avec uniquement des cases praticables entre eux, sans boucler par le
tunnel. Sinon il SHALL choisir au hasard.

#### Scenario: Vu dans un couloir

- **WHEN** le Fureteur est en (1, 25) et Mac en (7, 25)
- **THEN** le Fureteur vise (7, 25)

#### Scenario: Vu dans une colonne

- **WHEN** le Fureteur est en (5, 4) et Mac en (5, 15)
- **THEN** le Fureteur vise (5, 15)

#### Scenario: Mur entre eux

- **WHEN** le Fureteur est en (1, 21) et Mac en (5, 21)
- **THEN** le Fureteur n'a pas de cible et choisit au hasard

#### Scenario: Pas de vue à travers le tunnel

- **WHEN** le Fureteur est en (1, 11) et Mac en (19, 11)
- **THEN** le Fureteur n'a pas de cible
