# sound-effects Specification

## Purpose
Accompagner la partie de sons synthétisés et originaux, déclenchés par les événements du moteur,
sans fichier audio.
## Requirements
### Requirement: Sons synthétisés

Chaque son SHALL être produit par des oscillateurs Web Audio à partir d'une séquence de notes
décrite dans le code ; l'application SHALL NOT charger de fichier audio. Le moteur de jeu SHALL
NOT dépendre du module de son.

#### Scenario: Catalogue complet

- **WHEN** on parcourt le catalogue des sons
- **THEN** il contient `pellet`, `prism`, `capture`, `chainComplete`, `revive`, `bonusAppear`,
  `bonusEaten`, `extraLife`, `levelClear`, `death`, `gameOver` et `gameStart`
- **AND** chaque note de chaque séquence est une note valide ou un silence, avec une durée
  strictement positive

#### Scenario: Conversion des notes

- **WHEN** on convertit `A4`, `C5` et `A2` en fréquences
- **THEN** on obtient 440 Hz, environ 523,25 Hz et 110 Hz

### Requirement: Durées accordées aux phases

Les sons qui accompagnent une phase figée SHALL tenir dans sa durée : `death` et `levelClear` en
moins de 2 secondes, `gameStart` en moins de 4 secondes.

#### Scenario: Durées maximales

- **WHEN** on calcule la durée totale programmée de `death`, `levelClear` et `gameStart`
- **THEN** elles valent au plus 1,9 s, 1,9 s et 3,8 s

#### Scenario: Programmation d'une séquence

- **WHEN** on programme le jingle `gameStart` (150 BPM) à partir de l'instant 10 s
- **THEN** la première note de la voix principale commence à 10 s et la deuxième à 10,2 s
- **AND** la dernière note de la voix principale (la5, 2 temps) commence à 12,4 s, celle de la
  basse (la2, 1 temps) à 12,8 s, et la séquence dure 3,2 s

### Requirement: Sons déclenchés par les événements

Une fonction pure SHALL traduire les événements d'un ou plusieurs ticks en sons à jouer :
`pelletEaten` → `pellet`, `prismEaten` → `prism`, `chaserCaught` → `capture` (puis `chainComplete`
si la chaîne est complète), `chaserRevived` → `revive`, `bonusAppeared` → `bonusAppear`,
`bonusEaten` → `bonusEaten`, `extraLife` → `extraLife`, `levelCleared` → `levelClear`,
`heroCaught` → `death`, `gameOver` → `gameOver`. Les autres événements SHALL NOT jouer de son. Un
même son SHALL être joué au plus une fois par appel.

#### Scenario: Correspondance simple

- **WHEN** on traduit les événements `bonusEaten` puis `extraLife`
- **THEN** on obtient `bonusEaten` puis `extraLife`

#### Scenario: Événements muets

- **WHEN** on traduit `levelStarted`, `lifeLost`, `modeChanged`, `chaserReleased` et
  `bonusExpired`
- **THEN** on n'obtient aucun son

#### Scenario: Rattrapage de plusieurs ticks

- **WHEN** on traduit d'un coup les événements de trois ticks qui contiennent chacun un
  `pelletEaten`
- **THEN** un seul son `pellet` est joué et le compteur de chaîne a avancé de 3

#### Scenario: Prisme et pastille ensemble

- **WHEN** un même appel contient `pelletEaten` et `prismEaten`
- **THEN** seul `prism` est joué

### Requirement: Chaîne de pastilles

La note du son `pellet` SHALL parcourir en aller-retour la gamme do5, ré5, mi5, sol5, la5, do6,
ré6, mi6, sol6, la6 au fil des pastilles mangées à la suite, et repartir de do5 quand plus de
24 ticks séparent deux pastilles.

#### Scenario: Montée puis descente

- **WHEN** on demande la note des pastilles de rang 0, 9, 10 et 18 d'une même chaîne
- **THEN** on obtient do5, la6, sol6 et do5

#### Scenario: Chaîne interrompue

- **WHEN** une pastille est mangée au tick 100, la suivante au tick 110, puis une autre au
  tick 140
- **THEN** leurs notes sont do5, ré5 puis de nouveau do5

### Requirement: Captures

Le son `capture` SHALL monter d'un cran à chaque traqueur capturé pendant une même surcharge :
note de départ mi5, la5, ré6 puis sol6 pour 200, 400, 600 et 800 points.

#### Scenario: Quatrième capture

- **WHEN** on traduit un `chaserCaught` de 800 points avec un `chainBonus` de 1 000
- **THEN** on obtient `capture` au cran 4, qui part de sol6, puis `chainComplete`

### Requirement: Ambiance de surcharge

Une ambiance SHALL jouer tant qu'une surcharge dure : elle démarre sur `surchargeStarted`,
accélère de 8 à 12 notes par seconde sur `surchargeEnding`, et s'arrête sur `surchargeEnded`,
`heroCaught`, `levelCleared` ou `gameOver`. Un prisme mangé pendant une surcharge SHALL la
relancer au tempo normal.

#### Scenario: Cycle complet

- **WHEN** on traduit successivement `surchargeStarted`, `surchargeEnding` puis `surchargeEnded`
- **THEN** on obtient les commandes d'ambiance `start`, `hurry` puis `stop`

#### Scenario: Mort pendant une surcharge

- **WHEN** on traduit `heroCaught` pendant une surcharge
- **THEN** on obtient l'arrêt de l'ambiance et le son `death`

### Requirement: Jingle de début de partie

L'interface SHALL jouer le jingle `gameStart` au lancement d'une partie (« Jouer » ou
« Rejouer »), pendant « Prêt ? », et SHALL NOT le jouer au début d'un niveau ni après une vie
perdue.

#### Scenario: Lancement d'une partie

- **WHEN** le joueur lance une partie depuis l'accueil
- **THEN** le moteur de son reçoit une fois `gameStart`

#### Scenario: Niveau suivant

- **WHEN** le niveau 2 commence
- **THEN** `gameStart` n'est pas joué
