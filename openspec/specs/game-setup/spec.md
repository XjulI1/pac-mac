# game-setup Specification

## Purpose
Créer une partie à partir d'une graine et définir l'état initial.
## Requirements
### Requirement: Création d'une partie

`createGame({ seed })` SHALL renvoyer une partie au niveau 1, avec un score de 0, 3 vies, une
première vie supplémentaire à 10 000 points, tous les objets du labyrinthe en place, aucun bonus,
et la phase `ready` pour 4 secondes.

#### Scenario: État initial

- **WHEN** on crée une partie avec la graine 42
- **THEN** `level` vaut 1, `score` 0, `lives` 3, `nextExtraLifeAt` 10 000 et `tickCount` 0
- **AND** `itemsLeft` vaut 219, `itemsEatenInLevel` 0, `bonus` est nul et `bonusesShown` vaut 0
- **AND** la phase est `ready` avec 240 ticks restants

#### Scenario: Objets en place

- **WHEN** on crée une partie
- **THEN** la case (1, 1) contient une pastille, la case (1, 3) un prisme et la case (10, 17) rien

### Requirement: Mac au départ

À la création, Mac SHALL être au centre de sa case de départ, tourné vers la gauche, à l'arrêt,
sans direction voulue.

#### Scenario: Position de départ

- **WHEN** on crée une partie
- **THEN** Mac est en (1 260, 2 100) unités, direction `left`, `moving` faux et `wantedDirection`
  nul

### Requirement: Graine et générateur

La graine SHALL initialiser le générateur pseudo-aléatoire stocké dans `rngState` ; deux parties
créées avec la même graine SHALL être identiques.

#### Scenario: Même graine

- **WHEN** on crée deux parties avec la graine 7
- **THEN** les deux états sont égaux en profondeur

#### Scenario: Graines différentes

- **WHEN** on crée une partie avec la graine 7 et une autre avec la graine 8
- **THEN** leurs `rngState` diffèrent
