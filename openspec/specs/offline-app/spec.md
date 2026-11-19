# offline-app Specification

## Purpose
Permettre de lancer et de jouer à PacMac sans connexion réseau, de l'installer comme une
application sur téléphone ou ordinateur, et de passer à une nouvelle version sans jamais
interrompre une partie.
## Requirements
### Requirement: Mise en cache de l'application

Dans la version de production, l'application SHALL enregistrer un service worker qui met en cache,
dès la première visite, tous les fichiers nécessaires à son fonctionnement : page, scripts, styles,
icônes et manifeste. Aucun fichier nécessaire au jeu SHALL NOT être chargé depuis un autre domaine.

#### Scenario: Première visite

- **WHEN** l'utilisateur ouvre l'application pour la première fois avec une connexion
- **THEN** une fois la page chargée, tous les fichiers de la version de production sont en cache

#### Scenario: Liste du cache

- **WHEN** la version de production est construite
- **THEN** la liste des fichiers mis en cache contient la page d'accueil, chaque script et feuille
  de style générés, le manifeste et chaque icône

### Requirement: Jeu hors ligne

Une fois les fichiers en cache, l'application SHALL se lancer et rester entièrement jouable sans
connexion : partie complète, sons, préférence de son et meilleurs scores.

#### Scenario: Lancement sans réseau

- **WHEN** l'utilisateur ouvre l'application hors ligne après une première visite
- **THEN** l'accueil s'affiche normalement, avec le tableau des meilleurs scores

#### Scenario: Partie hors ligne

- **WHEN** l'utilisateur joue une partie complète hors ligne jusqu'à la fin et entre dans le top 10
- **THEN** les sons se font entendre, le nom s'enregistre et le score figure dans le tableau après
  rechargement hors ligne

### Requirement: Application installable

L'application SHALL fournir un manifeste web qui la rend installable sur téléphone et sur
ordinateur : nom « PacMac », langue française, affichage autonome sans barre d'adresse,
orientation portrait, couleurs de fond et de thème égales à celles de l'interface, et icônes de 192
et 512 pixels dont une variante « maskable ». La page SHALL déclarer une icône pour l'écran
d'accueil d'iOS. Le manifeste SHALL utiliser des adresses relatives, pour que l'application
s'installe aussi quand elle est servie sous un sous-chemin.

#### Scenario: Contenu du manifeste

- **WHEN** on lit les options du manifeste
- **THEN** elles déclarent le nom et le nom court « PacMac », la langue `fr`, l'affichage
  `standalone`, l'orientation `portrait`, `start_url`, `scope` et `id` à `./`
- **AND** elles déclarent des icônes de 192 et 512 pixels dont une « maskable », chacune présente
  dans `public/`

#### Scenario: Couleurs du thème

- **WHEN** on compare les couleurs du manifeste, les variables de `style.css` et la balise
  `theme-color` d'`index.html`
- **THEN** la couleur de fond et la couleur de thème sont identiques partout

#### Scenario: Lancement depuis l'écran d'accueil

- **WHEN** l'utilisateur lance l'application installée sur un téléphone
- **THEN** elle s'ouvre en portrait, sans barre d'adresse, sur l'accueil du jeu

### Requirement: Mise à jour vers une nouvelle version

Quand une nouvelle version est déployée, l'application SHALL la télécharger en arrière-plan sans
modifier la version en cours d'utilisation. Une fois la nouvelle version prête, un bandeau
« Nouvelle version disponible » avec un bouton « Recharger » SHALL s'afficher sur l'accueil. Le
bandeau SHALL NOT s'afficher pendant une partie, en pause ni sur l'écran de fin ; si la nouvelle
version devient prête à ces moments-là, le bandeau SHALL apparaître au retour à l'accueil.
« Recharger » SHALL activer la nouvelle version et recharger la page. Si l'utilisateur n'agit pas,
la nouvelle version SHALL s'appliquer au lancement suivant de l'application.

#### Scenario: Nouvelle version prête sur l'accueil

- **WHEN** une nouvelle version devient prête alors que l'accueil est affiché
- **THEN** le bandeau « Nouvelle version disponible » s'affiche avec le bouton « Recharger »

#### Scenario: Nouvelle version prête pendant une partie

- **WHEN** une nouvelle version devient prête pendant une surcharge
- **THEN** aucun bandeau ne s'affiche pendant la partie ni pendant la saisie du nom en fin de
  partie, et le bandeau s'affiche dès que l'utilisateur revient à l'accueil

#### Scenario: Recharger

- **WHEN** l'utilisateur touche « Recharger »
- **THEN** la nouvelle version est activée et la page se recharge sur l'accueil, les meilleurs
  scores et la préférence de son intacts

#### Scenario: Pas d'action de l'utilisateur

- **WHEN** l'utilisateur ignore le bandeau, ferme l'application puis la rouvre
- **THEN** c'est la nouvelle version qui se lance

### Requirement: Absence de service worker

En mode développement, l'application SHALL NOT enregistrer de service worker. Si le navigateur ne
prend pas en charge les service workers ou si leur enregistrement échoue, l'application SHALL
fonctionner normalement en ligne, sans message d'erreur.

#### Scenario: Mode développement

- **WHEN** l'application est lancée avec `pnpm dev`
- **THEN** aucun service worker n'est enregistré

#### Scenario: Navigateur sans service worker

- **WHEN** l'application s'ouvre dans un navigateur qui ne prend pas en charge les service workers
- **THEN** l'accueil s'affiche normalement et aucun bandeau de mise à jour ne s'affiche

#### Scenario: Échec de l'enregistrement

- **WHEN** l'enregistrement du service worker échoue
- **THEN** l'état « mise à jour prête » reste faux et aucune erreur n'est affichée
