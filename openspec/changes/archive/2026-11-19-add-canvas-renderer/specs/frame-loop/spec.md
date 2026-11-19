# Spec Delta

## Purpose

Faire avancer le moteur à 60 ticks par seconde en temps réel, quelle que soit la fréquence de
l'écran, et dessiner une image par rafraîchissement.

## ADDED Requirements

### Requirement: Horloge à pas fixe

`advanceClock(clock, nowMs)` SHALL renvoyer le nombre de ticks de 1/60 s à jouer depuis l'image
précédente et le coefficient `alpha` (fraction du tick suivant déjà écoulée, dans [0, 1[). La
première image après une création ou une remise à zéro SHALL jouer 0 tick. Le nombre de ticks dus
SHALL être compté depuis l'origine de l'horloge, sans accumulation d'arrondis.

#### Scenario: Écran à 60 Hz

- **WHEN** on fait avancer une horloge neuve avec 61 images espacées de 1 000 / 60 ms
- **THEN** la première joue 0 tick, chacune des suivantes 1 tick, soit 60 ticks en une seconde

#### Scenario: Écran à 120 Hz

- **WHEN** on fait avancer une horloge neuve aux instants 0, 8,333 et 16,667 ms
- **THEN** les images jouent 0, 0 puis 1 tick, et la deuxième a un `alpha` de 0,5

#### Scenario: Écran à 144 Hz

- **WHEN** on fait avancer une horloge neuve avec 145 images espacées de 1 000 / 144 ms
- **THEN** elles jouent 60 ticks en tout

#### Scenario: Écran à 30 Hz

- **WHEN** on fait avancer une horloge neuve aux instants 0 et 33,333 ms
- **THEN** la seconde image joue 2 ticks

### Requirement: Rattrapage plafonné

Une image SHALL jouer au plus 6 ticks ; le retard au-delà SHALL être abandonné. Après une remise à
zéro, l'image suivante SHALL jouer 0 tick, quel que soit le temps écoulé.

#### Scenario: Onglet revenu d'arrière-plan

- **WHEN** une horloge a joué une image à 16,667 ms, puis reçoit une image à 1 016,667 ms et une
  autre à 1 033,333 ms
- **THEN** l'image à 1 016,667 ms joue 6 ticks et la suivante 1 tick

#### Scenario: Reprise après une pause

- **WHEN** on remet l'horloge à zéro puis qu'une image arrive 10 secondes plus tard
- **THEN** cette image joue 0 tick

### Requirement: Boucle de jeu

`createGameLoop` SHALL, à chaque image, jouer les ticks dus en appelant `step` une fois par tick,
transmettre à `onEvents` les événements de tous ces ticks dans l'ordre, puis appeler `render` une
fois avec `alpha`. En pause, la boucle SHALL NOT demander d'image ni appeler `step` ; à la reprise,
l'horloge SHALL repartir sans rattrapage. `stop` SHALL annuler l'image demandée. Le planificateur
d'images SHALL être injecté.

#### Scenario: Image qui joue deux ticks

- **WHEN** un faux planificateur fournit une image qui doit jouer 2 ticks, et que `step` renvoie
  `[a]` puis `[b, c]`
- **THEN** `step` est appelé 2 fois, `onEvents` reçoit une fois `[a, b, c]` et `render` est appelé
  une fois

#### Scenario: Pause

- **WHEN** la boucle est mise en pause puis que 60 images sont fournies
- **THEN** `step` n'est pas appelé et aucune nouvelle image n'est demandée

#### Scenario: Reprise sans rattrapage

- **WHEN** la boucle reprend 5 secondes après sa mise en pause
- **THEN** la première image après la reprise ne joue aucun tick

#### Scenario: Arrêt

- **WHEN** on arrête une boucle en marche
- **THEN** l'image demandée est annulée et `running` vaut faux
