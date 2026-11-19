# game-loop Specification

## Purpose
Faire avancer une partie par ticks de 1/60 s avec une entrée, à travers ses phases, en émettant des
événements, de façon pure, déterministe et sérialisable.
## Requirements
### Requirement: API de tick

`tick(state, input)` SHALL renvoyer un nouvel état et la liste des événements du tick, sans
modifier l'état reçu. `input.direction` SHALL valoir une direction ou `null`. `tickCount` SHALL
augmenter de 1 à chaque tick, quelle que soit la phase.

#### Scenario: État d'entrée intact

- **WHEN** on appelle `tick` sur un état puis on le compare à une copie faite avant l'appel
- **THEN** les deux sont égaux en profondeur

#### Scenario: Compteur de ticks

- **WHEN** on applique 10 ticks à une partie neuve
- **THEN** `tickCount` vaut 10

### Requirement: Phase « Prêt ? »

Pendant la phase `ready`, le jeu SHALL rester figé : Mac ne bouge pas, mais une direction reçue
SHALL être mémorisée comme direction voulue. À la fin du décompte, la phase SHALL passer à
`playing` ; Mac peut bouger à partir du tick suivant.

#### Scenario: Fin du décompte

- **WHEN** on applique 239 ticks à une partie neuve
- **THEN** la phase est `ready` avec 1 tick restant et Mac est toujours en (1 260, 2 100)
- **AND** au 240e tick la phase passe à `playing` et Mac n'a pas bougé
- **AND** sans entrée, Mac est toujours en (1 260, 2 100) au 241e tick

#### Scenario: Direction annoncée pendant « Prêt ? »

- **WHEN** on envoie la direction `right` pendant la phase `ready` d'une partie neuve, puis on
  applique des ticks sans entrée jusqu'au 241e
- **THEN** Mac part vers la droite et se trouve en (1 272, 2 100)

### Requirement: Durées en ticks

Toute durée de `docs/jeu.md` donnée en secondes SHALL durer exactement `secondes × 60` ticks.

#### Scenario: Conversion

- **WHEN** on convertit 4 s, 2 s et 0,5 s
- **THEN** on obtient 240, 120 et 30 ticks

### Requirement: Déterminisme

Deux parties créées avec la même graine et soumises à la même suite d'entrées SHALL produire les
mêmes états et les mêmes événements à chaque tick. Le moteur SHALL NOT lire l'horloge ni utiliser
`Math.random`.

#### Scenario: Rejeu

- **WHEN** on joue deux fois 3 000 ticks depuis la graine 42 avec la même suite d'entrées
- **THEN** les états finaux sont égaux en profondeur et les listes d'événements sont identiques

### Requirement: Sérialisation

L'état SHALL être du JSON pur : `JSON.parse(JSON.stringify(state))` SHALL redonner un état égal en
profondeur, et une partie reprise depuis cette copie SHALL se poursuivre à l'identique.

#### Scenario: Aller-retour en cours de partie

- **WHEN** on sérialise l'état après 500 ticks, on le relit, puis on applique 500 ticks avec les
  mêmes entrées à l'original et à la copie
- **THEN** les deux états finaux sont égaux en profondeur

### Requirement: Performance

Un tick SHALL rester assez rapide pour tourner à 60 ticks par seconde sur téléphone.

#### Scenario: Dix minutes de jeu

- **WHEN** on simule 36 000 ticks avec le pilote automatique
- **THEN** la simulation prend moins de 3 secondes en environnement de test
