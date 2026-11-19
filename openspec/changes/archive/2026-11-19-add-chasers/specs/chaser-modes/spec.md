# Spec Delta

## Purpose

Alterner patrouille et traque selon le calendrier du niveau, avec un demi-tour à chaque bascule.

## ADDED Requirements

### Requirement: Calendrier des modes

Chaque niveau et chaque reprise après une vie perdue SHALL commencer en patrouille, à l'étape 0 du
calendrier du niveau. À la fin de chaque étape, le mode SHALL basculer (patrouille ↔ traque) avec un
événement `modeChanged`. Après la dernière étape, le mode SHALL rester en traque, avec `ticksLeft`
nul. Le calendrier SHALL avancer seulement en phase `playing`.

#### Scenario: Début de partie

- **WHEN** on crée une partie
- **THEN** le mode est la patrouille, à l'étape 0, avec 360 ticks restants

#### Scenario: Première bascule

- **WHEN** la phase `ready` d'une partie neuve se termine puis que 360 ticks de `playing` passent
  sans surcharge
- **THEN** le mode est la traque, à l'étape 1, avec 1 080 ticks restants, et l'événement
  `modeChanged` porte `chase`

#### Scenario: Traque permanente

- **WHEN** 80 secondes de `playing` sans surcharge se sont écoulées au niveau 1
- **THEN** le mode est la traque avec `ticksLeft` nul et n'en change plus

#### Scenario: Niveau 2

- **WHEN** le niveau 2 commence
- **THEN** le mode est la patrouille avec 300 ticks restants

### Requirement: Demi-tour à la bascule

À chaque bascule de mode, chaque traqueur `active` non vulnérable SHALL faire demi-tour sur-le-champ.

#### Scenario: Demi-tour du Limier

- **WHEN** le mode bascule alors que le Limier, `active`, va vers la gauche
- **THEN** il va vers la droite au tick de la bascule

#### Scenario: Pas de demi-tour dans le nid

- **WHEN** le mode bascule alors que le Fureteur est `inNest`
- **THEN** sa direction ne change pas

### Requirement: Suspension pendant la surcharge

Le calendrier des modes SHALL être suspendu tant qu'une surcharge est active.

#### Scenario: Surcharge en cours

- **WHEN** une surcharge de 420 ticks se déroule pendant la patrouille avec 200 ticks restants
- **THEN** il reste toujours 200 ticks de patrouille à la fin de la surcharge
