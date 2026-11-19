# Spec Delta

## Purpose

Afficher en haut de l'écran de partie ce que le joueur doit savoir d'un coup d'œil : score,
niveau, vies en réserve et bonus récoltés, avec la place prévue pour le record et le son.

## ADDED Requirements

### Requirement: Score et niveau

Le HUD SHALL afficher le score formaté par `formatScore` et « Niveau N ».

#### Scenario: Affichage

- **WHEN** l'état a 12 450 points au niveau 3
- **THEN** le HUD affiche « 12 450 » et « Niveau 3 »

### Requirement: Vies en réserve

Le HUD SHALL afficher une icône par vie en réserve, c'est-à-dire `lives − 1`, sans descendre sous
zéro. La vie perdue SHALL disparaître de la réserve à l'événement `lifeLost`, pas au contact.

#### Scenario: Début de partie

- **WHEN** une partie commence avec 3 vies
- **THEN** le HUD affiche 2 icônes de vie

#### Scenario: Vie perdue

- **WHEN** Mac est touché, puis la phase `dying` se termine
- **THEN** le HUD affiche toujours 2 icônes pendant `dying`, puis 1 après `lifeLost`

#### Scenario: Vie gagnée

- **WHEN** l'événement `extraLife` porte 4 vies
- **THEN** le HUD affiche 3 icônes

### Requirement: Bonus récoltés

Le HUD SHALL afficher les icônes des 7 derniers bonus mangés dans la partie, du plus ancien au plus
récent, avec les icônes du labyrinthe. La liste SHALL repartir vide à chaque nouvelle partie.

#### Scenario: Deux bonus

- **WHEN** Mac mange un cristal puis un anneau
- **THEN** le HUD affiche les icônes `crystal` puis `ring`

#### Scenario: Au-delà de sept

- **WHEN** Mac a mangé 9 bonus dans la partie
- **THEN** le HUD affiche les 7 derniers

### Requirement: Mises à jour économes

Les données du HUD SHALL NOT être remplacées à un tick où aucune valeur affichée ne change.

#### Scenario: Ticks sans changement

- **WHEN** 60 ticks passent en phase `ready`
- **THEN** les données du HUD ne sont pas remplacées

### Requirement: Emplacements réservés

Le HUD SHALL offrir un emplacement `actions`, à côté du bouton pause, et un emplacement `record`,
pour les changes `add-sound` et `add-high-scores`.

#### Scenario: Contenu injecté

- **WHEN** on monte `GameHud` avec un contenu dans les emplacements `actions` et `record`
- **THEN** les deux contenus sont rendus dans le HUD
