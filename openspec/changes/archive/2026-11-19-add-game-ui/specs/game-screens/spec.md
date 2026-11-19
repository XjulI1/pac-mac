# Spec Delta

## Purpose

Organiser l'application en écrans (accueil, partie, fin de partie) et définir comment on passe de
l'un à l'autre.

## ADDED Requirements

### Requirement: Écran d'accueil

Au lancement, l'application SHALL afficher un écran d'accueil au nom de PacMac, avec un bouton
« Jouer » et l'aide des commandes au clavier et au doigt. Entrée ou Espace SHALL lancer la partie
comme le bouton.

#### Scenario: Lancement de l'application

- **WHEN** l'utilisateur ouvre l'application
- **THEN** l'écran d'accueil affiche « PacMac », un bouton « Jouer » et l'aide « Clavier : flèches,
  ZQSD ou WASD — P ou Échap : pause » et « Au doigt : glissez dans la direction voulue, n'importe
  où sur le jeu »

#### Scenario: Jouer

- **WHEN** l'utilisateur clique sur « Jouer », ou appuie sur Entrée
- **THEN** l'écran de partie s'affiche avec une partie neuve en phase `ready`

### Requirement: Écran de partie

L'écran de partie SHALL afficher le HUD en haut et le labyrinthe dans toute la place restante, et
SHALL prendre en compte les zones sûres de l'écran. Il SHALL tenir sans défilement sur un écran de
360 × 640 pixels CSS.

#### Scenario: Téléphone de 360 × 640

- **WHEN** l'écran de partie est affiché dans une fenêtre de 360 × 640
- **THEN** le HUD et le labyrinthe entier sont visibles et la page ne défile pas

### Requirement: Écran de fin de partie

1 500 ms après que le moteur est passé en phase `gameOver`, l'application SHALL afficher par-dessus
le labyrinthe figé l'écran de fin : « Partie terminée », le score formaté, « Niveau atteint : N »,
et les boutons « Rejouer » et « Accueil ». Entrée SHALL rejouer et Échap revenir à l'accueil. Un
emplacement SHALL être réservé aux résultats de `add-high-scores`.

#### Scenario: Fin de partie

- **WHEN** le moteur passe en `gameOver` avec 12 450 points au niveau 3
- **THEN** 1 499 ms plus tard l'écran de fin n'est pas encore affiché
- **AND** à 1 500 ms il affiche « Partie terminée », « 12 450 » et « Niveau atteint : 3 »

#### Scenario: Rejouer

- **WHEN** l'utilisateur choisit « Rejouer »
- **THEN** une nouvelle partie démarre en phase `ready`, avec une nouvelle graine

#### Scenario: Retour à l'accueil

- **WHEN** l'utilisateur choisit « Accueil »
- **THEN** l'écran d'accueil s'affiche et la boucle de jeu est arrêtée
