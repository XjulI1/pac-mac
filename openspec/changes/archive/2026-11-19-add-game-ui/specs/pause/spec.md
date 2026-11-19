# Spec Delta

## Purpose

Mettre la partie en pause à la demande ou automatiquement, et la reprendre sans faire perdre de vie
au joueur.

## ADDED Requirements

### Requirement: Pause à la demande

En partie, P, Échap ou le bouton pause du HUD SHALL mettre la partie en pause : plus aucun tick
n'est joué et une surcouche « Pause » propose « Reprendre » et « Quitter la partie ». La pause
SHALL NOT être possible sur l'accueil ni sur l'écran de fin.

#### Scenario: Partie figée

- **WHEN** la partie est mise en pause puis que 60 images passent
- **THEN** `tickCount` n'a pas changé et la surcouche « Pause » est affichée

#### Scenario: Pas de pause en fin de partie

- **WHEN** on presse P sur l'écran de fin
- **THEN** rien ne change

### Requirement: Pause automatique

La partie SHALL se mettre en pause d'elle-même quand la page devient cachée (`visibilitychange`) ou
que la fenêtre perd le focus (`blur`), si elle était en cours.

#### Scenario: Passage en arrière-plan

- **WHEN** la page devient cachée pendant une partie
- **THEN** la session passe en pause

#### Scenario: Perte du focus

- **WHEN** la fenêtre perd le focus pendant une partie
- **THEN** la session passe en pause

#### Scenario: Déjà en pause

- **WHEN** la page devient cachée alors que la partie est déjà en pause
- **THEN** la session reste en pause, sans compte à rebours

### Requirement: Reprise avec compte à rebours

« Reprendre », P, Échap ou Entrée SHALL lancer un compte à rebours 3, 2, 1, une étape toutes les
500 ms, pendant lequel aucun tick n'est joué ; à sa fin, la partie SHALL reprendre sans rattrapage
du temps passé en pause. Une direction demandée pendant le compte à rebours SHALL être envoyée au
premier tick. Une nouvelle pause pendant le compte à rebours SHALL l'annuler.

#### Scenario: Reprise

- **WHEN** on choisit « Reprendre »
- **THEN** le compte à rebours affiche 3, puis 2 à 500 ms, puis 1 à 1 000 ms, et aucun tick n'est
  joué
- **AND** à 1 500 ms la session repasse en partie et la première image ne joue aucun tick

#### Scenario: Direction annoncée pendant le compte à rebours

- **WHEN** on presse ArrowLeft pendant le compte à rebours
- **THEN** le premier tick après la reprise reçoit la direction `left`

#### Scenario: Pause pendant le compte à rebours

- **WHEN** on presse P pendant le compte à rebours
- **THEN** le compte à rebours s'arrête et la session revient en pause

### Requirement: Quitter la partie

« Quitter la partie » SHALL demander confirmation ; confirmé, l'application SHALL revenir à
l'accueil et la partie est perdue ; annulé, la pause continue.

#### Scenario: Abandon confirmé

- **WHEN** on choisit « Quitter la partie » puis on confirme
- **THEN** l'accueil s'affiche et la boucle de jeu est arrêtée

#### Scenario: Abandon annulé

- **WHEN** on choisit « Quitter la partie » puis on annule
- **THEN** la surcouche « Pause » est toujours affichée
