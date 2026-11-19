# PacMac

Jeu d'arcade original de labyrinthe et de poursuite, au style néon, en application web jouable au
doigt sur téléphone en portrait et au clavier sur ordinateur.

> La V1 est implémentée : les specs sont dans `openspec/specs/`, l'historique des étapes dans
> `openspec/changes/archive/` et ce qu'il reste à vérifier sur appareil réel dans
> [`TODO.md`](TODO.md).

## Le jeu

On dirige **Mac**, un petit carré néon, dans un labyrinthe semé de pastilles. Quatre traqueurs le
poursuivent, chacun à sa façon. Manger un **prisme** déclenche une **surcharge** : pendant quelques
secondes, les traqueurs s'éteignent, ralentissent, et Mac peut les capturer. Une fois le labyrinthe
vidé, on passe au niveau suivant, un peu plus rapide, et ainsi de suite jusqu'à la dernière vie.

- **Labyrinthe original** de 21 × 27 cases, avec 215 pastilles, 4 prismes, un tunnel latéral et un
  nid central. Le détail est dans [`docs/jeu.md`](docs/jeu.md).
- **Quatre traqueurs** aux comportements distincts :
  - le **Limier** fonce droit sur Mac ;
  - le **Coupeur** lui coupe la route à la prochaine intersection ;
  - le **Gardien** défend la zone la plus riche en pastilles ;
  - le **Fureteur** erre au hasard, mais charge dès qu'il aperçoit Mac.
- **Règles du genre** : pastilles et prismes, alternance de patrouille et de traque, captures en
  chaîne pendant la surcharge, bonus qui apparaissent deux fois par niveau, vies supplémentaires au
  score.
- **Niveaux sans fin**, de plus en plus rapides, avec des surcharges de plus en plus courtes.
- **Style néon** dessiné en Canvas 2D, à 60 images par seconde.
- **Commandes** : glissements du doigt n'importe où sur l'écran, ou flèches, ZQSD et WASD au clavier.
  Un virage annoncé juste avant un croisement est pris dès que possible ; une touche maintenue ou un
  doigt laissé posé le garde aussi longtemps qu'il le faut.
- **Sons synthétisés** à la volée, sans fichier audio.
- **Meilleurs scores** conservés dans le navigateur.
- **Jouable hors ligne et installable** sur l'écran d'accueil d'un téléphone.

Labyrinthe, personnages, noms, valeurs, sons et visuels sont originaux : le jeu reprend les
mécaniques du genre, pas un jeu existant.

### Son

- Tous les sons sont synthétisés à la volée en Web Audio, sans aucun fichier audio : jingle de
  départ, pastilles qui montent la gamme quand Mac les enchaîne, ambiance pendant la surcharge,
  captures de plus en plus aiguës, bonus, vie gagnée, fin de niveau, mort et fin de partie.
- Le son démarre au premier toucher ou à la première touche, comme l'exigent les navigateurs.
- **M** ou le bouton haut-parleur du HUD coupent et rétablissent le son ; le choix est conservé
  dans le navigateur. La pause coupe tout le son.
- Sur iPhone, le mode silencieux coupe aussi le son du jeu.

### Meilleurs scores

- Les 10 meilleurs scores (nom, score, niveau atteint, date) sont conservés dans le navigateur et
  affichés sur l'accueil ; le record à battre s'affiche dans le HUD et suit le score dès qu'il le
  dépasse.
- En fin de partie, un score qui entre dans le classement demande un nom (10 caractères au plus),
  prérempli avec le dernier nom saisi. Quitter l'écran de fin sans enregistrer abandonne le score.
- « Effacer les scores », sur l'accueil, vide le classement après confirmation.
- Si le navigateur bloque l'enregistrement (navigation privée stricte, données de site bloquées),
  un avertissement s'affiche et les scores ne durent que le temps de la session.
- Sur iPhone, les scores de Safari et ceux de l'application installée sur l'écran d'accueil sont
  séparés.

### Hors ligne et installation

- Après une première visite en ligne, l'application se lance et se joue **sans réseau** : partie,
  sons, préférence de son et meilleurs scores compris.
- Elle s'**installe** depuis le navigateur (« Sur l'écran d'accueil » sur iPhone, « Installer
  l'application » sur Android ou dans Chrome sur ordinateur) et s'ouvre alors en plein écran, en
  portrait, sans barre d'adresse.
- Une **nouvelle version** se télécharge en arrière-plan. Un bandeau « Nouvelle version
  disponible » propose de recharger, sur l'accueil seulement, jamais en pleine partie. Sans action,
  la nouvelle version s'applique au lancement suivant.
- En développement (`pnpm dev`), aucun service worker n'est enregistré : le mode hors ligne se
  teste avec `pnpm build` puis `pnpm preview`.

## Stack technique

- [Vue 3](https://vuejs.org/) (Composition API, `<script setup lang="ts">`) et [Vite](https://vite.dev/)
- TypeScript strict
- Canvas 2D pour le rendu, Web Audio pour les sons
- [Tailwind CSS](https://tailwindcss.com/) pour l'interface
- [Vitest](https://vitest.dev/) pour les tests
- [pnpm](https://pnpm.io/) comme gestionnaire de paquets

Le moteur de jeu est écrit en TypeScript pur, sans dépendance à Vue ni au navigateur. Il avance par
pas fixes de 1/60 de seconde, il est déterministe (même graine et mêmes commandes donnent la même
partie) et son état se sérialise directement en JSON. Le rendu, le son et l'interface s'appuient
tous sur ce moteur.

## Méthode

Le projet suit [OpenSpec](https://github.com/Fission-AI/OpenSpec) : chaque étape est un *change*
avec sa proposition, ses specs, son design et ses tâches, implémenté en TDD avec `/opsx:apply`
puis archivé avec `/opsx:archive`.

## Démarrage

```bash
pnpm install              # installer les dépendances
pnpm dev                  # lancer l'application en développement (pnpm dev --host pour un téléphone)
pnpm test                 # lancer les tests
pnpm test:calibration     # mesurer l'équilibre des traqueurs sur 50 parties simulées
pnpm lint                 # analyser le code
pnpm type-check           # vérifier les types
pnpm build                # construire la version de production
pnpm preview              # servir la version construite (service worker et mode hors ligne actifs)
pnpm generate-pwa-assets  # régénérer les icônes PNG de public/ depuis public/icon.svg
```

## Licence

[MIT](LICENSE.md).
