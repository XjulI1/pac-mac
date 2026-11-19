# render-effects Specification

## Purpose
Animer ce que le moteur signale : points affichés à la capture d'un traqueur ou au bonus mangé,
désagrégation de Mac, clignotement de fin de niveau, texte « Prêt ? » et traînée des étincelles.
## Requirements
### Requirement: Format des nombres

`formatScore(n)` SHALL écrire un entier positif en séparant les milliers par une espace fine
insécable (U+202F).

#### Scenario: Petits et grands nombres

- **WHEN** on formate 0, 400, 12 450 et 1 234 567
- **THEN** on obtient « 0 », « 400 », « 12 450 » et « 1 234 567 », séparés par U+202F

### Requirement: Points affichés

Un événement `chaserCaught` SHALL afficher ses points à la case de capture, à la couleur du
traqueur, pendant 60 ticks, avec une seconde ligne « +1 000 » quand `chainBonus` vaut 1 000. Un
événement `bonusEaten` SHALL afficher ses points en (10, 13), à la couleur du bonus, pendant
90 ticks. Un texte SHALL monter d'une demi-case et s'effacer au fil de sa durée, puis disparaître.
Les durées SHALL se compter en `tickCount` du moteur.

#### Scenario: Capture d'un traqueur

- **WHEN** l'événement `chaserCaught` du Coupeur, 400 points en (3, 4), est enregistré au tick
  1 000
- **THEN** au tick 1 000 un effet « 400 » de couleur `#ff4fd8` est visible en (3, 4), à sa position
  de départ et pleinement opaque
- **AND** au tick 1 030 il est monté d'un quart de case et à moitié transparent
- **AND** au tick 1 060 il a disparu

#### Scenario: Chaîne complète

- **WHEN** l'événement `chaserCaught` porte 800 points et un `chainBonus` de 1 000
- **THEN** les effets visibles sont « 800 » et « +1 000 »

#### Scenario: Bonus mangé

- **WHEN** l'événement `bonusEaten` d'une étoile à 2 500 points est enregistré au tick 500
- **THEN** l'effet « 2 500 » est visible en (10, 13) jusqu'au tick 589 et a disparu au tick 590

### Requirement: Désagrégation de Mac

Pendant la phase `dying`, `dyingVisual(phase)` SHALL laisser Mac intact et les traqueurs visibles
pendant les 30 premiers ticks, puis masquer les traqueurs et faire progresser la désagrégation de 0
à 1 sur les 90 ticks suivants. `dissolvePixels(progress)` SHALL découper Mac en 5 × 5 blocs qui
s'écartent du centre et s'effacent, sans hasard.

#### Scenario: Chronologie

- **WHEN** on calcule `dyingVisual` avec 120, 90, 45 puis 0 ticks restants
- **THEN** on obtient Mac intact et traqueurs visibles, puis une progression de 0, 0,5 et 1 avec
  les traqueurs masqués

#### Scenario: Début et fin de la désagrégation

- **WHEN** on appelle `dissolvePixels(0)` puis `dissolvePixels(1)`
- **THEN** les 25 blocs pavent d'abord le carré de Mac, pleinement opaques, puis sont tous
  transparents

#### Scenario: Reproductible

- **WHEN** on appelle deux fois `dissolvePixels(0.4)`
- **THEN** les deux résultats sont égaux

### Requirement: Clignotement de fin de niveau

Pendant la phase `levelClear`, les murs SHALL alterner entre la couleur du niveau et le blanc toutes
les 15 ticks, en commençant par la couleur du niveau. Mac reste visible, immobile, la bouche
fermée ; les traqueurs et le bonus sont masqués.

#### Scenario: Alternance

- **WHEN** on calcule la couleur des murs au niveau 1 avec 120, 100 puis 85 ticks restants
- **THEN** on obtient violet, blanc, puis violet

### Requirement: Texte « Prêt ? »

Le texte « Prêt ? » SHALL être affiché pendant toute la phase `ready`, centré sur la ligne 13 du
labyrinthe, et SHALL NOT l'être dans les autres phases.

#### Scenario: Début de partie

- **WHEN** la phase est `ready`, puis `playing`
- **THEN** le texte est affiché, puis ne l'est plus

### Requirement: Traînée des étincelles

Le rendu SHALL garder les 6 dernières positions de chaque étincelle et les dessiner en traînée
d'opacité décroissante. La traînée SHALL être vidée dès que le traqueur n'est plus une étincelle.

#### Scenario: Six positions au plus

- **WHEN** on ajoute 8 positions à la traînée d'une étincelle
- **THEN** elle contient les 6 dernières, de la plus ancienne à la plus récente

#### Scenario: Retour au nid

- **WHEN** le traqueur passe de `entering` à `leaving`
- **THEN** sa traînée est vide
