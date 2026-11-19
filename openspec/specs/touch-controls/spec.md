# touch-controls Specification

## Purpose
Diriger Mac au doigt par des glissements n'importe où sur la zone de jeu, sans que la page zoome ni
défile.
## Requirements
### Requirement: Reconnaissance d'un glissement

Le suivi d'un glissement SHALL renvoyer une direction dès que le plus grand des deux écarts depuis
l'ancre atteint 24 pixels CSS, selon l'axe dominant (horizontal à égalité), puis SHALL reposer
l'ancre sur le point courant. Un déplacement plus court ou un simple toucher SHALL NOT donner de
direction.

#### Scenario: Glissement vers la droite

- **WHEN** un glissement part de (100, 100) et passe par (130, 105)
- **THEN** il donne `right`

#### Scenario: Trop court

- **WHEN** un glissement part de (100, 100) et s'arrête en (110, 100)
- **THEN** il ne donne aucune direction

#### Scenario: Diagonale

- **WHEN** un glissement part de (100, 100) et passe par (125, 120)
- **THEN** il donne `right`, l'axe horizontal étant dominant

#### Scenario: Égalité

- **WHEN** un glissement part de (100, 100) et passe par (124, 76)
- **THEN** il donne `right`

### Requirement: Plusieurs directions dans un même glissement

Un glissement continu SHALL pouvoir donner plusieurs directions successives, mesurées chacune
depuis la nouvelle ancre. Une direction identique à la précédente du même glissement SHALL NOT être
renvoyée de nouveau.

#### Scenario: Virage sans lever le doigt

- **WHEN** un glissement part de (100, 100), passe par (130, 100) puis par (130, 135)
- **THEN** il donne `right` puis `down`

#### Scenario: Même direction prolongée

- **WHEN** un glissement part de (100, 100) et passe par (130, 100) puis par (170, 100)
- **THEN** il ne donne `right` qu'une fois

#### Scenario: Nouveau glissement

- **WHEN** un glissement qui a donné `right` se termine, et qu'un autre part de (100, 100) et passe
  par (130, 100)
- **THEN** le second donne `right` à son tour

### Requirement: Zone de jeu au doigt

Les glissements SHALL être reconnus sur toute la zone de jeu (HUD exclu), au doigt, au stylet et à
la souris bouton enfoncé, et chaque direction reconnue SHALL être transmise à la session comme une
direction demandée.

#### Scenario: Glissement sur le labyrinthe

- **WHEN** des événements `pointerdown` en (100, 300) puis `pointermove` en (100, 260) sont émis sur
  la zone de jeu
- **THEN** la session reçoit la direction `up`

### Requirement: Doigt posé après un glissement

Tant que le doigt (ou le bouton de la souris) reste posé après un glissement, la dernière direction
reconnue SHALL être maintenue, comme une touche enfoncée : envoyée au moteur à chaque tick. Lever le
doigt SHALL arrêter ce maintien ; le moteur garde alors la direction 0,5 s.

#### Scenario: Doigt qui reste posé

- **WHEN** un glissement donne `up` puis que le doigt reste immobile pendant 60 ticks
- **THEN** chacun de ces ticks reçoit `up`

#### Scenario: Doigt levé

- **WHEN** le doigt se lève après un glissement qui a donné `up`
- **THEN** les ticks suivants ne reçoivent plus de direction

#### Scenario: Simple toucher

- **WHEN** le doigt se pose et reste immobile sans avoir glissé
- **THEN** aucune direction n'est maintenue

### Requirement: Ni zoom ni défilement

Pendant une partie, la page SHALL NOT zoomer ni défiler au doigt : viewport sans zoom, zone de jeu
en `touch-action: none`, reste de l'application en `touch-action: manipulation`, défilement
élastique désactivé.

#### Scenario: Configuration de la page

- **WHEN** on lit `index.html` et le style de la zone de jeu
- **THEN** le viewport contient `maximum-scale=1`, `user-scalable=no` et `viewport-fit=cover`, et
  la zone de jeu a `touch-action: none`
