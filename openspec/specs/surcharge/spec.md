# surcharge Specification

## Purpose
Retourner la chasse quand Mac mange un prisme : traqueurs vulnérables pour un temps, captures en
chaîne, gel à chaque capture, fin de la surcharge.
## Requirements
### Requirement: Début de surcharge

Quand Mac mange un prisme, une surcharge SHALL démarrer pour la durée du niveau, avec une chaîne à
zéro et un événement `surchargeStarted`. Tous les traqueurs qui ne sont ni `spark` ni `entering`
SHALL devenir vulnérables, et ceux en `active` SHALL faire demi-tour.

#### Scenario: Prisme au niveau 1

- **WHEN** Mac mange un prisme au niveau 1 alors que le Limier est `active` vers la gauche, le
  Coupeur `inNest` et le Gardien `spark`
- **THEN** `surcharge` vaut `{ ticksLeft: 420, chain: 0 }` et l'événement `surchargeStarted` porte
  420 ticks
- **AND** le Limier est vulnérable et va vers la droite, le Coupeur est vulnérable, le Gardien ne
  l'est pas

#### Scenario: Nouveau prisme pendant une surcharge

- **WHEN** Mac mange un second prisme alors qu'il reste 100 ticks de surcharge et qu'un traqueur a
  déjà été capturé
- **THEN** il reste 420 ticks, la chaîne vaut 0 et les traqueurs régénérés depuis redeviennent
  vulnérables

### Requirement: Capture

Un traqueur vulnérable qui touche Mac SHALL être capturé : la chaîne augmente de 1, Mac marque
`200 × chaîne` points, et 1 000 points de plus quand la chaîne atteint 4. Le traqueur SHALL devenir
une étincelle non vulnérable, avec un événement `chaserCaught` qui porte le traqueur, les points, le
bonus de chaîne et la case. La partie SHALL passer en phase `chaserCaught` pendant 30 ticks, où tout
est figé, puis revenir en `playing`.

#### Scenario: Chaîne complète

- **WHEN** Mac capture les quatre traqueurs pendant la même surcharge
- **THEN** les événements `chaserCaught` portent 200, 400, 600 puis 800 points, le dernier avec un
  bonus de chaîne de 1 000
- **AND** le score a augmenté de 3 000

#### Scenario: Jeu figé à la capture

- **WHEN** Mac capture un traqueur
- **THEN** la phase est `chaserCaught` pendant 30 ticks, sans que Mac, les traqueurs ni les
  décomptes ne bougent, puis redevient `playing`

### Requirement: Fin de surcharge

Le décompte de surcharge SHALL avancer seulement en phase `playing`. L'événement `surchargeEnding`
SHALL être émis au tick où il reste 120 ticks, ou au début de la surcharge si elle dure 120 ticks
ou moins. À zéro, tous les traqueurs SHALL redevenir non vulnérables, `surcharge` SHALL devenir
nul et l'événement `surchargeEnded` SHALL être émis.

#### Scenario: Fin proche

- **WHEN** 300 ticks de `playing` se sont écoulés depuis un prisme mangé au niveau 1
- **THEN** l'événement `surchargeEnding` est émis à ce tick

#### Scenario: Surcharge courte

- **WHEN** Mac mange un prisme au niveau 6 (2 s)
- **THEN** `surchargeStarted` et `surchargeEnding` sont émis dans le même tick

#### Scenario: Fin

- **WHEN** 420 ticks de `playing` se sont écoulés depuis un prisme mangé au niveau 1
- **THEN** aucun traqueur n'est vulnérable, `surcharge` est nul et l'événement `surchargeEnded` est
  émis
