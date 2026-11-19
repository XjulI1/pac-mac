# high-scores Specification

## Purpose
Conserver dans le navigateur les dix meilleurs scores, les afficher sur l'accueil et en fin de
partie, et montrer le record à battre pendant le jeu.
## Requirements
### Requirement: Classement

Le classement SHALL contenir au plus 10 entrées (nom, score, niveau atteint, date), triées du
meilleur au moins bon score. Un score SHALL entrer dans le classement s'il est strictement positif
et que le classement a moins de 10 entrées ou que le score dépasse strictement le dixième. Une
nouvelle entrée SHALL se placer sous les scores égaux déjà présents.

#### Scenario: Classement incomplet

- **WHEN** le classement a 4 entrées et qu'une partie se termine avec 120 points
- **THEN** le score se qualifie

#### Scenario: Score nul

- **WHEN** une partie se termine avec 0 point
- **THEN** le score ne se qualifie pas

#### Scenario: Classement complet

- **WHEN** le classement a 10 entrées dont la dernière vaut 5 000 points
- **THEN** 5 000 points ne se qualifient pas et 5 010 points se qualifient

#### Scenario: Égalité

- **WHEN** on insère 8 000 points dans un classement qui contient déjà 9 000, 8 000 et 7 000
- **THEN** la nouvelle entrée est troisième, sous l'ancien 8 000, et le 7 000 passe quatrième

#### Scenario: Coupure à 10 entrées

- **WHEN** on insère un score qui se qualifie dans un classement de 10 entrées
- **THEN** le classement a toujours 10 entrées et l'ancien dixième en est sorti

### Requirement: Saisie du nom en fin de partie

Quand le score se qualifie, l'écran de fin SHALL proposer un champ « Votre nom » prérempli avec le
dernier nom saisi, limité à 10 caractères. Le nom SHALL être débarrassé de ses espaces en début et
en fin ; un nom vide SHALL NOT pouvoir être enregistré. Après l'enregistrement, le tableau SHALL
s'afficher avec la ligne du joueur mise en évidence, et le nom SHALL devenir le dernier nom saisi.
Pendant la saisie, le clavier SHALL NOT commander le jeu ni le son.

#### Scenario: Entrée dans le top 10

- **WHEN** une partie se termine avec 12 340 points au niveau 4, alors que le dernier nom saisi est
  « Alex »
- **THEN** l'écran de fin affiche le champ prérempli avec « Alex »
- **AND** après validation par Entrée, le tableau montre « Alex », 12 340, niveau 4, à son rang, mis
  en évidence

#### Scenario: Nom vide

- **WHEN** le joueur efface le champ ou n'y laisse que des espaces
- **THEN** le bouton « Enregistrer » est désactivé et Entrée n'enregistre rien

#### Scenario: Nouveau record

- **WHEN** le score dépasse le premier du classement
- **THEN** l'écran de fin annonce « Nouveau record ! »

#### Scenario: Score hors classement

- **WHEN** le score ne se qualifie pas
- **THEN** l'écran de fin n'affiche pas de champ et montre directement le tableau

### Requirement: Tableau sur l'accueil

L'accueil SHALL afficher le classement (rang, nom, score, niveau, date au format court français),
ou « Aucun score pour l'instant » s'il est vide.

#### Scenario: Tableau rempli

- **WHEN** le classement contient 3 entrées
- **THEN** l'accueil affiche 3 lignes dans l'ordre, avec par exemple la date « 19/11/2026 »

#### Scenario: Tableau vide

- **WHEN** aucun score n'est enregistré
- **THEN** l'accueil affiche « Aucun score pour l'instant » et pas de bouton « Effacer les scores »

### Requirement: Effacement des scores

Le bouton « Effacer les scores » de l'accueil SHALL demander confirmation, puis vider le
classement en mémoire et dans le navigateur. Le dernier nom saisi SHALL être conservé.

#### Scenario: Confirmation acceptée

- **WHEN** le joueur touche « Effacer les scores » puis confirme
- **THEN** le classement est vide, y compris après rechargement, et le dernier nom saisi est
  inchangé

#### Scenario: Confirmation refusée

- **WHEN** le joueur annule la confirmation
- **THEN** le classement est inchangé

### Requirement: Record dans le HUD

Le HUD SHALL afficher un record égal au plus grand du meilleur score enregistré et du score de la
partie en cours.

#### Scenario: Record à battre

- **WHEN** le meilleur score enregistré vaut 20 000 et que la partie en est à 3 500 points
- **THEN** le HUD affiche un record de 20 000

#### Scenario: Record battu en direct

- **WHEN** le score de la partie passe de 19 990 à 20 040 alors que le meilleur score enregistré
  vaut 20 000
- **THEN** le record affiché devient 20 040

#### Scenario: Aucun score enregistré

- **WHEN** le classement est vide et que la partie en est à 0 point
- **THEN** le HUD affiche un record de 0

### Requirement: Persistance et robustesse

Le classement SHALL être enregistré sous la clé `pacmac:high-scores` et le dernier nom sous
`pacmac:last-name`. Au chargement, les entrées mal formées SHALL être écartées et une valeur qui
n'est pas un tableau SHALL donner un classement vide, sans erreur. Si le navigateur bloque le
stockage, l'accueil SHALL afficher un avertissement, la partie SHALL rester jouable et le
classement SHALL être conservé en mémoire pour la session.

#### Scenario: Rechargement

- **WHEN** le joueur enregistre un score puis recharge l'application
- **THEN** le score figure dans le tableau de l'accueil

#### Scenario: Entrées mal formées

- **WHEN** la clé contient un tableau avec une entrée valide, une entrée sans nom et une entrée dont
  le score est une chaîne
- **THEN** le classement ne contient que l'entrée valide

#### Scenario: Valeur illisible

- **WHEN** la clé contient `{` ou `42`
- **THEN** le classement est vide et l'application démarre normalement

#### Scenario: Stockage bloqué

- **WHEN** le navigateur bloque le stockage
- **THEN** l'accueil affiche « Votre navigateur bloque l'enregistrement : les scores ne seront pas
  conservés après la fermeture. »
- **AND** un score enregistré en fin de partie apparaît dans le tableau jusqu'au rechargement
