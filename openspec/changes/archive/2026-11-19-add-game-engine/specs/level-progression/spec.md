# Spec Delta

## Purpose

Fournir les réglages de chaque niveau et enchaîner les niveaux quand le labyrinthe est vidé.

## ADDED Requirements

### Requirement: Table des niveaux

`levelSettings(level)` SHALL renvoyer les valeurs de la table de `docs/jeu.md` : vitesses de Mac,
de Mac en surcharge, des traqueurs, des traqueurs vulnérables et dans le tunnel, durée de
surcharge, bonus, seuils de sortie du nid, délai d'inactivité et calendrier des modes. Au-delà du
niveau 8, les valeurs du niveau 8 SHALL s'appliquer.

#### Scenario: Niveau 1

- **WHEN** on lit `levelSettings(1)`
- **THEN** on obtient Mac 6,0 cases/s, Mac en surcharge 6,6, traqueurs 5,6, vulnérables 3,4,
  tunnel 3,0, surcharge 7 s, bonus `crystal` à 100 points, seuils de sortie 0, 15 et 40,
  inactivité 4 s et calendrier 6, 18, 6, 18, 4, 24 et 4 s

#### Scenario: Niveau 5

- **WHEN** on lit `levelSettings(5)`
- **THEN** la surcharge dure 3 s, l'inactivité 3 s et le calendrier vaut 4, 25, 4, 25, 2, 40 et
  2 s

#### Scenario: Au-delà du niveau 8

- **WHEN** on compare `levelSettings(8)` et `levelSettings(12)`
- **THEN** elles sont égales en profondeur

#### Scenario: Vitesses entières en unités

- **WHEN** on convertit chaque vitesse de la table en unités par seconde
- **THEN** on obtient toujours un entier

### Requirement: Fin de niveau

Quand Mac mange le dernier objet du labyrinthe, la partie SHALL passer en phase `levelClear` pour
2 secondes avec un événement `levelCleared`, et le bonus visible SHALL disparaître. Pendant cette
phase, Mac SHALL NOT bouger et les entrées SHALL être ignorées.

#### Scenario: Dernier objet

- **WHEN** il ne reste qu'une pastille, en (2, 1), et que Mac la mange
- **THEN** la phase est `levelClear` avec 120 ticks restants, `bonus` est nul et l'événement
  `levelCleared` porte le niveau 1

#### Scenario: Jeu figé

- **WHEN** on applique 60 ticks en phase `levelClear` avec la direction `up`
- **THEN** la position de Mac et sa direction voulue n'ont pas changé

### Requirement: Niveau suivant

À la fin de la phase `levelClear`, la partie SHALL passer au niveau suivant : tous les objets
remis en place, Mac à son départ tourné vers la gauche, à l'arrêt, sans direction voulue, compteurs d'objets
et de bonus du niveau remis à zéro, phase `ready` pour 2 secondes, événement `levelStarted`. Le
score et les vies SHALL être conservés.

#### Scenario: Passage au niveau 2

- **WHEN** la phase `levelClear` du niveau 1 se termine, avec 2 500 points et 2 vies
- **THEN** `level` vaut 2, `itemsLeft` 219, `itemsEatenInLevel` 0, `bonusesShown` 0, Mac est en
  (1 260, 2 100) tourné vers la gauche et à l'arrêt, la phase est `ready` avec 120 ticks restants
- **AND** le score vaut 2 500, les vies 2, et l'événement `levelStarted` porte le niveau 2

#### Scenario: Niveau vidé par le pilote automatique

- **WHEN** le pilote automatique joue une partie neuve jusqu'à 10 800 ticks
- **THEN** le niveau 1 est terminé et le niveau 2 commencé
- **AND** le score vaut 2 350 plus les points des bonus mangés
