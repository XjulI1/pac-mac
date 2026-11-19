# Spec Delta

## Purpose

Isoler les traqueurs du test de bout en bout de fin de niveau : le pilote automatique naïf, qui
fonce vers la pastille la plus proche sans regarder les traqueurs, ne peut plus vider un niveau
maintenant qu'ils existent.

## MODIFIED Requirements

### Requirement: Niveau suivant

À la fin de la phase `levelClear`, la partie SHALL passer au niveau suivant : tous les objets
remis en place, Mac à son départ tourné vers la gauche, à l'arrêt, sans direction voulue, compteurs d'objets
et de bonus du niveau remis à zéro, phase `ready` pour 2 secondes, événement `levelStarted`. Le
score et les vies SHALL être conservés.

#### Scenario: Passage au niveau 2

- **WHEN** la phase `levelClear` du niveau 1 se termine, avec 2 500 points et 2 vies
- **THEN** `level` vaut 2, `itemsLeft` 219, `itemsEatenInLevel` 0, `bonusesShown` 0, Mac est en
  (1 260, 2 100) tourné vers la gauche et à l'arrêt, la phase est `ready` avec 120 ticks restants
- **AND** le score vaut 2 500, les vies 2, et l'événement `levelStarted` porte le niveau 2

#### Scenario: Niveau vidé par le pilote automatique

- **WHEN** le pilote automatique joue une partie neuve dont on a retiré les traqueurs, jusqu'à
  10 800 ticks
- **THEN** le niveau 1 est terminé et le niveau 2 commencé
- **AND** le score vaut 2 350 plus les points des bonus mangés
