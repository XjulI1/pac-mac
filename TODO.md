# TODO

Ce qu'il reste à faire pour livrer la V1. Le détail de chaque étape se trouve dans le `tasks.md` du
change correspondant ; ce fichier ne suit que les grandes étapes et les points transverses.

## Avant de commencer

- [ ] Relire les artefacts des 7 changes dans `openspec/changes/`.
- [x] Valider le contenu du jeu : [`docs/jeu.md`](docs/jeu.md) (labyrinthe, personnages, scores,
  table des niveaux, rythme d'une partie).
- [x] Valider chacune des [décisions](#décisions) ci-dessous, ou demander sa correction dans la spec
  concernée.
- [ ] Créer le dépôt distant et y pousser la feuille de route.

## Décisions

Choix faits là où le genre laisse de la place à l'interprétation, ou là où une application impose
de trancher, validés le 19 novembre 2026. Les specs indiquées reflètent ces décisions.

### Moteur (`add-game-engine`, specs `game-loop` et `hero-movement`)

- [x] **Pas de temps fixe** de 1/60 s et positions en entiers (une case = 120 unités) : la partie ne
  dépend pas de la fréquence d'affichage et les tests rejouent une partie à l'identique.
- [x] **Mac attend la première commande** à chaque début de niveau et après chaque vie perdue,
  pendant que les traqueurs bougent déjà ; une direction donnée pendant « Prêt ? » est prise dès le
  départ.
- [x] **Virage annoncé oublié après 0,5 s** s'il n'a pas pu être pris ; une touche maintenue ou un
  doigt laissé posé après un glissement le garde vivant ; pas de virage anticipé qui couperait les
  coins.
- [x] **Demi-tour immédiat**, même entre deux cases.
- [x] **Pas de ralentissement** de Mac quand il mange une pastille.
- [x] **Commandes mémorisées pendant « Prêt ? »**, ignorées pendant le clignotement de fin de niveau.

### Objets et niveaux (`add-game-engine`, specs `pellets-and-scoring` et `level-progression`)

- [x] **Objet mangé à mi-chemin**, dès que le centre de Mac entre dans la case.
- [x] **Deux bonus par niveau**, aux 70e et 150e objets, visibles 9 s, retirés si Mac perd une vie.
- [x] **3 vies** au départ ; **vie supplémentaire** à 10 000 points puis tous les 25 000 points,
  sans dépasser 5 vies.
- [x] **Niveaux sans fin** : au-delà du niveau 8, les réglages du niveau 8 s'appliquent.

### Traqueurs (`add-chasers`, specs `chaser-movement` et `chaser-targets`)

- [x] **Choix glouton** au centre de chaque case, vers la case voisine la plus proche de la cible à
  vol d'oiseau, égalité départagée haut, droite, bas, gauche ; jamais de demi-tour spontané.
- [x] **Coupeur** : prochaine intersection devant Mac, coudes compris, au plus 8 cases.
- [x] **Gardien** : charge Mac à 5 cases ou moins (distance de Manhattan), sinon défend le quart le
  plus riche en objets ; la colonne centrale ne compte pour aucun quart.
- [x] **Fureteur** : hasard à chaque intersection, cible et vitesse + 10 % quand il voit Mac dans
  une ligne ou une colonne dégagée, jamais à travers le tunnel.

### Modes, nid et surcharge (`add-chasers`, specs `chaser-modes`, `nest` et `surcharge`)

- [x] **Demi-tour** des traqueurs à chaque changement de mode et au début d'une surcharge.
- [x] **Calendrier des modes suspendu** pendant une surcharge, remis à zéro à chaque niveau et
  après chaque vie perdue.
- [x] **Compteurs du nid remis à zéro** après une vie perdue (mêmes seuils qu'en début de niveau,
  sans compteur global séparé).
- [x] **Traqueurs du nid vulnérables** eux aussi pendant une surcharge ; un traqueur régénéré
  ressort dangereux.
- [x] **Chaîne de captures** à 200, 400, 600 et 800 points, plus 1 000 pour les quatre ; un nouveau
  prisme relance la surcharge et remet la chaîne à 200.
- [x] **Jeu figé 0,5 s** à chaque capture.

### Vies (`add-chasers`, spec `lives`)

- [x] **Contact à moins d'une demi-case** entre les centres, contrôlé avant et après le déplacement
  des traqueurs : impossible de se croiser sans se toucher.
- [x] **Danger prioritaire** : si Mac capture un traqueur et en touche un dangereux dans le même
  tick, les points sont comptés et Mac perd une vie.

### Rendu (`add-canvas-renderer`)

- [x] **Murs** : chaque zone de mur est un bloc teinté à 15 % bordé d'un tube lumineux aux coins
  arrondis, décalé de 0,15 case vers l'intérieur ; un mur fin reste un bloc plein, jamais deux
  traits parallèles. Porte du nid en barre rose pâle.
- [x] **Couleur des murs** en boucle tous les 4 niveaux : violet `#8b5cff`, sarcelle `#17b3a3`,
  jaune `#ffd84d`, lavande `#c3a6ff`.
- [x] **Objets** : pastilles en petits carrés rose pâle, prismes en disques blancs à anneau irisé
  qui pulsent (immobiles pendant « Prêt ? »).
- [x] **Mac** toujours droit : ses yeux se décalent vers sa direction, sa bouche s'ouvre deux fois
  par case.
- [x] **Traqueurs** : le triangle du Limier pointe vers sa direction, l'étoile du Fureteur tourne,
  un point lumineux indique la direction de chacun ; ils oscillent dans le nid ; vulnérables, gris
  sans halo, avec une alternance gris / blanc toutes les 8 ticks en fin de surcharge ; étincelle
  avec une traînée de 6 positions.
- [x] **Effets** : points affichés 1 s à la capture (plus « +1 000 » pour la chaîne complète),
  1,5 s pour un bonus ; à la mort, 0,5 s figé puis Mac qui se désagrège en 5 × 5 blocs ; murs qui
  clignotent en blanc en fin de niveau.
- [x] **Netteté** : densité d'écran plafonnée à 3, case d'un nombre entier de pixels physiques,
  labyrinthe centré.
- [x] **Boucle** : au plus 6 ticks rattrapés par image (au-delà, le retard est abandonné),
  interpolation entre deux ticks sauf pour un saut de plus d'une case (tunnel).

### Interface (`add-game-ui`)

- [x] **Glissements** : seuil de 24 px, axe dominant (horizontal à égalité), plusieurs virages dans
  un même glissement, aussi à la souris bouton enfoncé. Seuil à confirmer sur un vrai téléphone.
- [x] **Doigt posé = direction maintenue** : après un glissement, tant que le doigt reste posé, sa
  dernière direction est renvoyée au moteur comme une touche enfoncée.
- [x] **Clavier** : flèches, ZQSD et WASD lus d'après la lettre imprimée ; touche maintenue renvoyée
  à chaque tick, dernière touche enfoncée prioritaire ; P ou Échap pour la pause ; Entrée ou Espace
  pour valider.
- [x] **Pause** automatique quand la page passe en arrière-plan ou perd le focus ; reprise après un
  compte à rebours 3, 2, 1 de 1,5 s.
- [x] **Fin de partie** : écran de fin 1,5 s après la dernière vie perdue, le labyrinthe figé
  restant affiché entre-temps.
- [x] **Quitter une partie** demande confirmation ; la partie est perdue (pas de reprise en V1).
- [x] **HUD** sur deux lignes, à la largeur du labyrinthe : score, niveau, vies en réserve (sans
  celle en jeu), 7 derniers bonus récoltés.
- [x] **Pas de police externe**, pour que tout fonctionne hors ligne.

### Son (`add-sound`)

- [x] **Sons originaux** synthétisés, décrits dans le design : pastille sur une gamme pentatonique
  qui monte quand Mac enchaîne et repart du bas après 0,4 s sans pastille, un seul son de pastille
  par image.
- [x] **Pas de musique** pendant le jeu normal ; une ambiance seulement pendant la surcharge, qui
  accélère pendant ses 2 dernières secondes.
- [x] **Captures** de plus en plus aiguës, avec un arpège pour la chaîne complète.
- [x] **Jingle de départ** de 3,2 s au lancement d'une partie seulement, pas aux niveaux suivants.
- [x] **Silence** pour le début de niveau, la vie perdue, le changement de mode, la sortie du nid et
  la disparition du bonus.
- [x] **Son actif ou coupé**, sans réglage de volume, avec la touche M ou le bouton du HUD ;
  préférence conservée, son actif par défaut. La pause coupe tout le son.

### Meilleurs scores (`add-high-scores`)

- [x] **Top 10** local : score, niveau atteint, nom et date ; à égalité, le nouveau score se place
  sous l'ancien ; un score nul n'y entre jamais.
- [x] **Nom** de 1 à 10 caractères, prérempli avec le dernier nom saisi ; quitter l'écran de fin
  sans enregistrer abandonne le score.
- [x] **Record** du HUD : le plus grand du meilleur score enregistré et du score en cours.
- [x] **Stockage bloqué** : scores gardés en mémoire le temps de la session, avec un avertissement
  sur l'accueil. Clés de stockage préfixées `pacmac:`.
- [x] Sur iPhone, les scores de Safari et ceux de l'application installée sont séparés : c'est une
  limite du système, acceptée.

### Application hors ligne (`add-offline-pwa`)

- [x] **Manifeste** en `standalone` et `portrait` (ce qui verrouille aussi une tablette Android sur
  laquelle l'application est installée).
- [x] **Bandeau de mise à jour** sur l'accueil seulement, jamais en jeu, en pause ni sur l'écran de
  fin.

## Changes de la V1

À appliquer et archiver dans cet ordre (`/opsx:apply` puis `/opsx:archive`) : chaque change suppose
les précédents implémentés.

- [x] `add-game-engine` : socle du projet et moteur de jeu (labyrinthe, Mac, objets, score, niveaux)
- [x] `add-chasers` : traqueurs, nid, modes, surcharge, vies et fin de partie
- [x] `add-canvas-renderer` : rendu Canvas 2D néon et boucle à pas fixe
- [x] `add-game-ui` : écrans, HUD, commandes au clavier et au doigt, pause
- [x] `add-sound` : effets sonores et jingles synthétisés
- [x] `add-high-scores` : meilleurs scores conservés dans le navigateur
- [x] `add-offline-pwa` : application installable et jouable hors ligne

## Déploiement

- [ ] Servir `dist/` en **HTTPS** (obligatoire pour le service worker et l'installation, sauf sur
  `localhost`).
- [ ] En-tête `Cache-Control: no-cache` sur `sw.js`, `index.html` et `manifest.webmanifest` ; les
  fichiers de `assets/` (noms hachés) peuvent être mis en cache longue durée.
- [ ] Tester sur un vrai téléphone en portrait : glissements et seuil de 24 px, virages enchaînés
  sans lever le doigt, absence de zoom et de défilement, zones sûres, HUD lisible avec 4 vies et
  7 bonus, pause automatique en quittant l'application.
- [ ] Écouter les sons sur ordinateur et sur téléphone (`pnpm dev --host`) : jingle, chaîne de
  pastilles, ambiance de surcharge, captures, mort, fin de niveau et de partie, son après le premier
  toucher sur iOS.
- [ ] Installer l'application sur iPhone (« Sur l'écran d'accueil »), sur Android et depuis Chrome
  sur ordinateur : icône, nom, ouverture en portrait sans barre d'adresse, partie complète hors
  ligne avec un score enregistré, nouvelle version appliquée après fermeture de tous les onglets.
- [ ] Vérifier la fluidité sur un écran à 120 Hz.

## Après la V1

- [ ] Plusieurs labyrinthes, qui alternent au fil des niveaux.
- [ ] Reprise d'une partie interrompue.
- [ ] Deux joueurs en alternance sur le même appareil.
- [ ] Statistiques de fin de partie (objets, captures, bonus, temps par niveau).
- [ ] Croix directionnelle à l'écran, en option des glissements.
