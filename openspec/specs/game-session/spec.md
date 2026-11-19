# game-session Specification

## Purpose
Orchestrer une partie : la créer, faire tourner le moteur dans la boucle de rendu, lui transmettre
les directions demandées, publier ses événements et détecter sa fin.
## Requirements
### Requirement: Création d'une partie

`start` SHALL créer une partie avec une graine tirée par l'interface à partir de l'heure courante,
remettre à zéro les bonus récoltés et les effets du rendu, démarrer la boucle et passer en
`playing`. Le moteur SHALL NOT lire l'heure lui-même.

#### Scenario: Graine issue de l'heure

- **WHEN** on démarre une partie avec une heure injectée de 1 700 000 000 000 ms
- **THEN** la partie est celle de `createGame({ seed: 1 700 000 000 000 >>> 0 })`

#### Scenario: Rejouer change de graine

- **WHEN** on démarre deux parties à deux heures différentes
- **THEN** leurs `rngState` diffèrent

### Requirement: Direction au tick suivant

Une direction demandée SHALL être envoyée au tick suivant, puis la direction envoyée SHALL
redevenir `null`. Si plusieurs directions sont demandées entre deux ticks, la dernière SHALL
l'emporter.

#### Scenario: Une demande

- **WHEN** on demande `up` puis qu'une image joue 2 ticks
- **THEN** le premier tick reçoit `up` et le second `null`

#### Scenario: Deux demandes entre deux ticks

- **WHEN** on demande `up` puis `left` avant le tick suivant
- **THEN** ce tick reçoit `left`

### Requirement: Événements publiés

La session SHALL transmettre à chaque abonné, une fois par image, les événements de tous les ticks
de l'image dans l'ordre et l'état courant. Un abonné SHALL pouvoir se désinscrire.

#### Scenario: Abonné

- **WHEN** un abonné est inscrit et qu'une image joue un tick où Mac mange une pastille
- **THEN** l'abonné reçoit une liste qui contient `pelletEaten`

#### Scenario: Désinscription

- **WHEN** l'abonné se désinscrit puis qu'une image passe
- **THEN** il n'est plus appelé

### Requirement: Fin de partie

Quand l'état atteint la phase `gameOver`, la session SHALL attendre 1 500 ms, arrêter la boucle et
passer en `over`, même si l'événement `gameOver` n'a pas été vu par un abonné.

#### Scenario: Délai avant l'écran de fin

- **WHEN** un tick fait passer l'état en `gameOver`
- **THEN** la session reste en `playing` pendant 1 499 ms, puis passe en `over` et la boucle est
  arrêtée
