## Why

À la fin de `add-game-ui`, PacMac se joue entièrement mais en silence. Dans un jeu d'arcade, le son
porte une bonne part de l'information : une pastille mangée, le début et la fin imminente d'une
surcharge, une capture, la perte d'une vie s'entendent avant de se voir, surtout sur un téléphone
où l'œil suit Mac et pas le reste du labyrinthe. Il faut des sons, sans alourdir l'application ni
dépendre de fichiers audio, et un moyen simple de les couper.

## What Changes

- **Sons synthétisés** en Web Audio, sans aucun fichier audio, sur le modèle du moteur de son de
  Tetris : oscillateurs, enveloppes et glissements de fréquence. Tous les sons et jingles sont des
  compositions originales.
- **Sons pilotés par les événements du moteur** : pastille (une note brève dont la hauteur monte
  quand Mac enchaîne les pastilles), prisme, ambiance de surcharge tant qu'elle dure et qui
  s'accélère quand elle va finir, capture d'un traqueur (de plus en plus aigu au fil de la chaîne)
  et chaîne complète, traqueur reformé dans le nid, bonus apparu et mangé, vie gagnée, fin de
  niveau, perte d'une vie, fin de partie. Le moteur ne connaît pas le son : une fonction pure
  traduit les événements de chaque tick en sons à jouer.
- **Jingle de début de partie**, joué par l'interface pendant « Prêt ? ».
- **Couper le son** avec la touche M ou un bouton dans le HUD ; la préférence est conservée dans le
  navigateur et s'applique dès le lancement suivant.
- **Déverrouillage audio** au premier geste de l'utilisateur (exigence d'iOS et des navigateurs
  récents) ; la pause du jeu met aussi le son en pause.
- **Stockage local protégé** : un petit module de lecture et d'écriture JSON dans `localStorage`
  qui ne plante jamais, même quand le navigateur bloque le stockage ou que les données sont
  illisibles. Il sert ici à la préférence de son et sera réutilisé par `add-high-scores`.

## Capabilities

### New Capabilities

- `sound-effects` : catalogue des sons, correspondance événements du moteur → sons, chaîne de
  pastilles, ambiance de surcharge, jingle de début de partie.
- `sound-settings` : couper et rétablir le son, préférence conservée, déverrouillage au premier
  geste, son suspendu pendant la pause.
- `browser-storage` : lecture et écriture JSON protégées dans le stockage du navigateur.

### Modified Capabilities

Aucune : le bouton de son s'ajoute au HUD de `add-game-ui` sans changer ses exigences, et le moteur
n'est pas touché.

## Hors périmètre

- Musique de fond pendant le jeu normal : seule la surcharge a une ambiance en V1.
- Réglage du volume (curseur) : le son est actif ou coupé.
- Sons propres au mode portrait ou au paysage, retour haptique (vibrations).
- Meilleurs scores et dernier nom saisi : `add-high-scores`, qui réutilise `browser-storage`.
- Mise en cache hors ligne : `add-offline-pwa` (les sons synthétisés n'ajoutent aucun fichier à
  mettre en cache).

## Impact

- Nouveau module `src/audio/` (notes, catalogue, programmation des séquences, correspondance des
  événements, moteur Web Audio, composable) avec tests colocalisés.
- Nouveau module `src/storage/` (stockage protégé, préférence de son) avec tests.
- HUD et écran de jeu de `add-game-ui` : bouton de son, raccourci M, branchement des événements de
  chaque tick, jingle au lancement d'une partie, suspension pendant la pause.
- Aucune nouvelle dépendance : Web Audio est une API du navigateur.
