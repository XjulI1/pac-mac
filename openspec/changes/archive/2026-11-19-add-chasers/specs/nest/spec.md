# Spec Delta

## Purpose

Placer les traqueurs au départ, les faire sortir du nid au fil de la partie, et y faire revenir
puis repartir ceux qui ont été capturés.

## ADDED Requirements

### Requirement: Départ des traqueurs

Au début d'une partie, d'un niveau ou d'une reprise après une vie perdue, le Limier SHALL être
`active` au centre de (10, 8), tourné vers la gauche, et le Coupeur, le Gardien et le Fureteur
SHALL être `inNest` au centre de (10, 11), (9, 11) et (11, 11), aucun n'étant vulnérable.

#### Scenario: Partie neuve

- **WHEN** on crée une partie
- **THEN** `chasers` liste, dans l'ordre, le Limier `active` en (1 260, 1 020), le Coupeur `inNest`
  en (1 260, 1 380), le Gardien `inNest` en (1 140, 1 380) et le Fureteur `inNest` en
  (1 380, 1 380)

### Requirement: Sorties au fil des objets

Le premier traqueur encore `inNest`, dans l'ordre Coupeur, Gardien, Fureteur, SHALL sortir quand le
nombre d'objets mangés depuis le début du niveau ou la dernière vie perdue atteint son seuil. Un
seul traqueur SHALL sortir par tick, avec un événement `chaserReleased`.

#### Scenario: Niveau 1

- **WHEN** une partie neuve passe en `playing`
- **THEN** le Coupeur sort au premier tick de `playing`
- **AND** le Gardien sort quand le 15e objet est mangé, le Fureteur quand le 40e l'est

#### Scenario: Seuils nuls

- **WHEN** le niveau 3 passe en `playing`
- **THEN** le Coupeur, le Gardien et le Fureteur sortent aux trois premiers ticks, un par tick

#### Scenario: Compteur remis à zéro

- **WHEN** Mac perd une vie au niveau 1 après avoir mangé 50 objets
- **THEN** à la reprise, le Gardien attend que 15 nouveaux objets soient mangés pour sortir

### Requirement: Sortie par inactivité

Si Mac ne mange aucun objet pendant le délai d'inactivité du niveau, le premier traqueur encore
`inNest` SHALL sortir et le délai SHALL repartir de zéro.

#### Scenario: Mac qui traîne

- **WHEN** au niveau 1, le Coupeur est sorti et Mac ne mange rien pendant 240 ticks de `playing`
- **THEN** le Gardien sort au 240e tick
- **AND** le Fureteur sort 240 ticks plus tard si Mac ne mange toujours rien

### Requirement: Trajet de sortie

Un traqueur `leaving` SHALL rejoindre la colonne 10, monter par la porte jusqu'au centre de (10, 8),
puis devenir `active`.

#### Scenario: Sortie du Gardien

- **WHEN** le Gardien sort au niveau 1
- **THEN** il passe par le centre de (10, 11), franchit la porte et devient `active` au centre de
  (10, 8) 80 ticks après sa sortie

### Requirement: Retour des étincelles

Une étincelle SHALL se diriger vers la case de sortie (10, 8) comme un traqueur vers sa cible, puis
descendre par la porte jusqu'au point de régénération (10, 10) en `entering`. Arrivée là, elle SHALL
redevenir un traqueur non vulnérable en `leaving`, avec un événement `chaserRevived`.

#### Scenario: Régénération

- **WHEN** une étincelle atteint le centre de (10, 8)
- **THEN** elle passe en `entering`, atteint le centre de (10, 10) 10 ticks plus tard, redevient non
  vulnérable en `leaving` et l'événement `chaserRevived` est émis

#### Scenario: Ressortie pendant la surcharge

- **WHEN** un traqueur se régénère pendant une surcharge
- **THEN** il ressort non vulnérable et peut prendre une vie à Mac
