# Spec Delta

## Purpose

Faire manger à Mac les pastilles, les prismes et les bonus, tenir le score et accorder les vies
supplémentaires.

## ADDED Requirements

### Requirement: Pastilles et prismes

Quand le centre de Mac entre dans une case qui contient un objet, Mac SHALL le manger : l'objet
disparaît, `itemsLeft` diminue de 1, `itemsEatenInLevel` augmente de 1 et le score augmente de 10
pour une pastille ou de 50 pour un prisme. Un événement `pelletEaten` ou `prismEaten` SHALL porter
la case.

#### Scenario: Pastille mangée à mi-chemin

- **WHEN** Mac est au centre de (1, 1), case vidée, tourné vers la droite au niveau 1, avec une
  pastille en (2, 1)
- **THEN** la pastille est encore là après 4 ticks
- **AND** au 5e tick elle a disparu, le score a augmenté de 10, `itemsLeft` a baissé de 1 et
  l'événement `pelletEaten` porte la case (2, 1)

#### Scenario: Prisme

- **WHEN** Mac entre dans la case (1, 3) qui contient un prisme
- **THEN** le score augmente de 50 et l'événement `prismEaten` porte la case (1, 3)

#### Scenario: Couloir vide

- **WHEN** Mac traverse des cases vides
- **THEN** le score ne change pas et aucun événement d'objet n'est émis

### Requirement: Apparition du bonus

Un bonus SHALL apparaître en (10, 13) quand `itemsEatenInLevel` atteint 70, puis 150, avec la
nature et les points du niveau, pour 9 secondes. Un événement `bonusAppeared` SHALL être émis. Pas
plus de deux bonus par niveau.

#### Scenario: Premier bonus

- **WHEN** Mac mange son 70e objet du niveau 1
- **THEN** `bonus` vaut `{ kind: 'crystal', points: 100, ticksLeft: 540 }`, `bonusesShown` vaut 1
  et l'événement `bonusAppeared` est émis

#### Scenario: Second bonus et pas de troisième

- **WHEN** Mac mange son 150e objet du niveau, puis tous les autres
- **THEN** un second bonus apparaît au 150e objet et aucun autre ensuite

#### Scenario: Bonus selon le niveau

- **WHEN** le 70e objet est mangé au niveau 3, puis au niveau 11
- **THEN** le bonus est `lightning` à 400 points, puis `star` à 2 500 points

### Requirement: Bonus mangé ou disparu

Quand le centre de Mac entre dans la case du bonus pendant qu'il est visible, Mac SHALL le manger
et marquer ses points, avec un événement `bonusEaten`. Un bonus non mangé SHALL disparaître au
bout de 540 ticks avec un événement `bonusExpired`.

#### Scenario: Bonus mangé

- **WHEN** un bonus de 100 points est visible et que Mac entre dans la case (10, 13)
- **THEN** le score augmente de 100, `bonus` devient nul et l'événement `bonusEaten` porte
  `crystal`, 100 points et la case (10, 13)

#### Scenario: Bonus disparu

- **WHEN** un bonus vient d'apparaître et que Mac reste loin de lui pendant 540 ticks
- **THEN** `bonus` est nul et l'événement `bonusExpired` a été émis une fois

### Requirement: Vies supplémentaires

Quand le score atteint `nextExtraLifeAt`, Mac SHALL gagner une vie, sans dépasser 5, avec un
événement `extraLife`, et le seuil suivant SHALL être fixé 25 000 points plus loin. Le premier
seuil est 10 000 points. Si Mac a déjà 5 vies, le seuil avance sans vie ni événement.

#### Scenario: Première vie supplémentaire

- **WHEN** Mac a 9 990 points et 3 vies et mange une pastille
- **THEN** il a 10 000 points, 4 vies, `nextExtraLifeAt` vaut 35 000 et l'événement `extraLife`
  porte 4 vies

#### Scenario: Vie suivante

- **WHEN** Mac a 34 950 points et mange un prisme
- **THEN** il gagne une vie et `nextExtraLifeAt` vaut 60 000

#### Scenario: Plafond de 5 vies

- **WHEN** Mac a 5 vies et 9 990 points et mange une pastille
- **THEN** il garde 5 vies, `nextExtraLifeAt` vaut 35 000 et aucun événement `extraLife` n'est émis
