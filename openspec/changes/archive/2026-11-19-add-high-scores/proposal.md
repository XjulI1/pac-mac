## Why

Un jeu d'arcade sans fin se rejoue pour battre son record. À la fin de `add-sound`, une partie
terminée ne laisse aucune trace : le score disparaît dès qu'on relance. Il faut un tableau des
meilleurs scores, conservé dans le navigateur, et le record à battre sous les yeux pendant la
partie.

## What Changes

- **Top 10 local** : score, niveau atteint, nom du joueur (1 à 10 caractères) et date de chaque
  partie, du meilleur au moins bon, conservés dans le navigateur grâce au stockage protégé de
  `add-sound`.
- **Saisie du nom** sur l'écran de fin de partie quand le score entre dans le top 10, avec le
  dernier nom saisi proposé par défaut ; le rang obtenu est mis en évidence dans le tableau.
- **Tableau sur l'accueil**, avec un bouton « Effacer les scores » qui demande confirmation.
- **Record dans le HUD** : le meilleur score enregistré, remplacé en direct par le score de la
  partie dès qu'il le dépasse.
- **Robustesse** : des données illisibles sont écartées sans planter ; si le navigateur bloque le
  stockage, un avertissement le signale sur l'accueil et le jeu reste jouable, les scores ne vivant
  alors que le temps de la session.

## Capabilities

### New Capabilities

- `high-scores` : classement, saisie du nom, tableau, record du HUD, effacement, données illisibles
  et stockage bloqué.

### Modified Capabilities

Aucune : l'écran de fin, l'accueil et le HUD de `add-game-ui` gagnent des éléments sans que leurs
exigences changent.

## Hors périmètre

- Classement en ligne ou partagé entre appareils.
- Statistiques de fin de partie détaillées (pastilles, captures, bonus, temps par niveau) : après la
  V1.
- Reprise d'une partie interrompue : après la V1.
- Classements séparés par mode de jeu : un seul mode en V1.
- Réglages autres que le son (déjà conservé par `add-sound`).

## Impact

- Nouveau module `src/storage/highScores.ts` (classement pur et persistance) avec tests, sur le
  modèle de Tetris.
- Écran de fin de partie : champ de nom et tableau avec le rang mis en évidence.
- Écran d'accueil : tableau, effacement avec confirmation, avertissement de stockage bloqué.
- HUD : record.
- Aucune nouvelle dépendance.
