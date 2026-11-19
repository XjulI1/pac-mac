# lives Specification

## Purpose
Faire perdre une vie à Mac quand un traqueur dangereux le touche, reprendre la partie, et la
terminer quand il n'y a plus de vie.
## Requirements
### Requirement: Contact

Un traqueur SHALL toucher Mac quand la distance entre leurs centres est strictement inférieure à
60 unités, en tenant compte du tunnel. Le contact SHALL être contrôlé après le déplacement de Mac et
après celui des traqueurs. Un traqueur ni vulnérable, ni `spark`, ni `entering` qui touche Mac
SHALL le prendre : phase `dying` pendant 120 ticks et événement `heroCaught` qui porte le
traqueur. Une étincelle SHALL NOT toucher Mac.

#### Scenario: Pris

- **WHEN** le Limier, `active` et non vulnérable, est à 50 unités de Mac après un tick
- **THEN** la phase est `dying` avec 120 ticks restants et l'événement `heroCaught` porte `hound`

#### Scenario: Juste à distance

- **WHEN** le Limier est à 60 unités de Mac
- **THEN** il ne le touche pas

#### Scenario: Étincelle inoffensive

- **WHEN** une étincelle passe sur la case de Mac
- **THEN** rien ne se passe

#### Scenario: Pas de croisement sans contact

- **WHEN** Mac et le Limier foncent l'un vers l'autre sur la ligne 25, pour chaque niveau de 1 à 8
- **THEN** le contact est toujours détecté avant qu'ils se croisent

#### Scenario: Capture et prise dans le même tick

- **WHEN** dans le même tick Mac touche un traqueur vulnérable et un traqueur dangereux
- **THEN** les points de la capture sont comptés et la phase est `dying`

### Requirement: Perte d'une vie

Pendant `dying`, tout SHALL être figé. À la fin de la phase, Mac SHALL perdre une vie, avec un
événement `lifeLost` qui porte les vies restantes. S'il lui en reste, Mac et les traqueurs SHALL
revenir à leurs positions de départ, le calendrier des modes et les compteurs du nid SHALL repartir
de zéro, la surcharge et le bonus SHALL être retirés, les objets SHALL rester tels quels, et la
phase SHALL passer en `ready` pour 120 ticks.

#### Scenario: Reprise

- **WHEN** la phase `dying` se termine avec 3 vies et 120 objets restants
- **THEN** il reste 2 vies, l'événement `lifeLost` porte 2, Mac est au départ, le Limier en (10, 8),
  les autres au nid, le mode en patrouille à l'étape 0, `surcharge` et `bonus` nuls, 120 objets
  restants et la phase `ready` avec 120 ticks

### Requirement: Fin de partie

Quand la dernière vie est perdue, la partie SHALL passer en phase `gameOver` avec un événement
`gameOver` qui porte le score et le niveau. En `gameOver`, `tick` SHALL seulement augmenter
`tickCount`.

#### Scenario: Dernière vie

- **WHEN** la phase `dying` se termine avec 1 vie, 12 340 points, au niveau 3
- **THEN** il reste 0 vie, la phase est `gameOver` et l'événement `gameOver` porte 12 340 points et
  le niveau 3

#### Scenario: Partie terminée

- **WHEN** on applique 100 ticks en `gameOver` avec la direction `up`
- **THEN** seul `tickCount` a changé

### Requirement: Parties complètes

Une partie jouée par le pilote automatique naïf SHALL toujours se terminer, en respectant les
invariants du moteur à chaque tick.

#### Scenario: Dix parties jusqu'au bout

- **WHEN** le pilote naïf joue les parties des graines 1 à 10, au plus une heure de jeu simulé
  chacune
- **THEN** chacune atteint `gameOver`
- **AND** à chaque tick, le score ne diminue jamais, les vies restent entre 0 et 5, chaque traqueur
  est sur l'axe de deux cases praticables (porte comprise seulement en `leaving`, `entering` ou dans
  le nid), et aucun traqueur `active` n'est dans le nid
- **AND** rejouer une graine redonne exactement le même état final
