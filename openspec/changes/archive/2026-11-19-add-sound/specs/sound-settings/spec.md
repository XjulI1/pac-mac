# Spec Delta

## Purpose

Laisser le joueur couper le son, retenir son choix, et gérer les contraintes des navigateurs :
déverrouillage au premier geste et son suspendu pendant la pause.

## ADDED Requirements

### Requirement: Couper et rétablir le son

La touche M et un bouton du HUD SHALL basculer le son entre actif et coupé. Le bouton SHALL
indiquer l'état courant par son icône et par un libellé accessible (« Couper le son » ou
« Rétablir le son »). La touche M SHALL NOT basculer le son quand le focus est dans un champ de
saisie.

#### Scenario: Touche M

- **WHEN** le son est actif et que le joueur appuie sur M pendant la partie
- **THEN** le son est coupé, et un second appui le rétablit

#### Scenario: Bouton du HUD

- **WHEN** le joueur touche le bouton de son du HUD alors que le son est actif
- **THEN** le son est coupé et le libellé du bouton devient « Rétablir le son »

#### Scenario: Saisie d'un nom

- **WHEN** le joueur tape un M dans un champ de texte
- **THEN** l'état du son ne change pas

#### Scenario: Ambiance rétablie en pleine surcharge

- **WHEN** le joueur coupe puis rétablit le son pendant une surcharge
- **THEN** l'ambiance de surcharge se fait de nouveau entendre jusqu'à la fin de la surcharge

### Requirement: Préférence conservée

Le choix du joueur SHALL être enregistré dans le navigateur sous la clé `pacmac:sound` et appliqué
au lancement suivant. Une préférence absente ou illisible SHALL valoir « son actif ».

#### Scenario: Relancement

- **WHEN** le joueur coupe le son puis recharge l'application
- **THEN** le son est coupé dès l'accueil

#### Scenario: Préférence illisible

- **WHEN** la clé `pacmac:sound` contient `"oui"`
- **THEN** le son est actif

### Requirement: Déverrouillage au premier geste

Le contexte audio SHALL être créé ou repris au premier geste de l'utilisateur (toucher, clic ou
touche du clavier). Avant ce geste, aucun son SHALL NOT être joué et aucune erreur SHALL NOT être
levée. Sans prise en charge de Web Audio, le jeu SHALL rester jouable en silence.

#### Scenario: Premier geste

- **WHEN** le joueur touche l'écran pour la première fois
- **THEN** le contexte audio est créé, et repris s'il était suspendu

#### Scenario: Son demandé trop tôt

- **WHEN** un son est demandé avant tout geste
- **THEN** rien n'est joué et aucune erreur n'est levée

#### Scenario: Navigateur sans Web Audio

- **WHEN** `AudioContext` n'existe pas et que le joueur lance une partie
- **THEN** la partie se joue normalement, sans son ni erreur

### Requirement: Son et pause

La pause du jeu, y compris la pause automatique quand la page est cachée, SHALL suspendre tous les
sons ; la reprise du jeu SHALL les reprendre. Quitter l'écran de jeu SHALL arrêter l'ambiance de
surcharge.

#### Scenario: Pause pendant une surcharge

- **WHEN** le joueur met le jeu en pause pendant une surcharge puis le reprend
- **THEN** le contexte audio est suspendu pendant la pause et l'ambiance reprend à la reprise

#### Scenario: Retour à l'accueil

- **WHEN** le joueur quitte la partie pendant une surcharge
- **THEN** l'ambiance s'arrête
