# Spec Delta

## Purpose

Diriger Mac et piloter la partie au clavier, sur les dispositions AZERTY et QWERTY.

## ADDED Requirements

### Requirement: Directions

Les flèches, Z, Q, S, D et W, A SHALL donner une direction, en lisant le caractère de la touche
sans tenir compte de la casse : Z et W vers le haut, Q et A vers la gauche, S vers le bas, D vers la
droite.

#### Scenario: Flèches

- **WHEN** on presse ArrowUp, ArrowLeft, ArrowDown puis ArrowRight
- **THEN** on obtient `up`, `left`, `down` puis `right`

#### Scenario: Lettres AZERTY et QWERTY

- **WHEN** on presse z, Q, s, d, w et a
- **THEN** on obtient `up`, `left`, `down`, `right`, `up` puis `left`

#### Scenario: Direction envoyée au moteur

- **WHEN** on presse puis relâche ArrowUp pendant une partie, entre deux ticks
- **THEN** le tick suivant reçoit la direction `up`, et le tick d'après aucune direction

### Requirement: Touche maintenue

Tant qu'une touche de direction est enfoncée, sa direction SHALL être envoyée au moteur à chaque
tick, pour que le moteur ne l'oublie pas au bout de 0,5 s. Avec plusieurs touches enfoncées, la
dernière pressée SHALL l'emporter ; à son relâchement, la précédente encore enfoncée SHALL reprendre
la main. Les répétitions automatiques du navigateur SHALL être ignorées.

#### Scenario: Flèche maintenue

- **WHEN** on maintient ArrowUp pendant 60 ticks puis qu'on la relâche
- **THEN** chacun des 60 ticks reçoit `up`, et les ticks suivants aucune direction

#### Scenario: Deux touches

- **WHEN** on maintient ArrowLeft, puis ArrowUp, puis qu'on relâche ArrowUp
- **THEN** les ticks reçoivent `left`, puis `up`, puis de nouveau `left`

### Requirement: Pause et validation

P et Échap SHALL basculer la pause ; Entrée et Espace SHALL valider l'écran affiché (Jouer,
Reprendre, Rejouer). Une répétition automatique de P ou Échap SHALL être ignorée.

#### Scenario: Pause au clavier

- **WHEN** on presse P pendant une partie, puis P de nouveau
- **THEN** la partie se met en pause, puis le compte à rebours de reprise commence

#### Scenario: Répétition ignorée

- **WHEN** on maintient Échap enfoncé et que le navigateur répète la touche
- **THEN** la pause ne bascule qu'une fois

### Requirement: Touches ignorées

Une touche SHALL être ignorée si Ctrl, Cmd ou Alt est enfoncé, ou si la cible est un champ de
saisie. Les flèches et l'Espace prises en compte SHALL NOT faire défiler la page.

#### Scenario: Raccourci du navigateur

- **WHEN** on presse Ctrl + D
- **THEN** aucune direction n'est envoyée

#### Scenario: Saisie de texte

- **WHEN** on tape « zqsd » dans un champ de saisie
- **THEN** aucune direction n'est envoyée

#### Scenario: Pas de défilement

- **WHEN** on presse ArrowDown pendant une partie
- **THEN** l'événement clavier est marqué `defaultPrevented`
