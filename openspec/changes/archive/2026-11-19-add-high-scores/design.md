# Design

## Context

`add-game-ui` fournit l'accueil, l'écran de jeu avec son HUD et l'écran de fin de partie, qui
reçoit le score et le niveau de l'événement `gameOver`. `add-sound` a créé `src/storage/localStore.ts`
(lecture et écriture JSON protégées, `isStorageAvailable`). Les meilleurs scores de Tetris
(`~/Git/Perso/tetris/src/storage/highScores.ts`) servent de modèle. Exigences : `specs/` ;
motivation : proposal.md.

## Goals / Non-Goals

**Goals :**

- Un classement pur (insertion, qualification, normalisation du nom), testé sans navigateur.
- Une seule source de vérité réactive pour l'accueil, le HUD et l'écran de fin.
- Aucun plantage quelles que soient les données trouvées dans le stockage.

**Non-Goals :**

- Pas de serveur ni de partage des scores.
- Pas de migration de format : une entrée qui ne respecte pas le format actuel est écartée.

## Decisions

### Données

```ts
type HighScore = { name: string; score: number; level: number; date: string }
```

- Clé `pacmac:high-scores` : tableau d'au plus 10 entrées, du meilleur au moins bon score.
- Clé `pacmac:last-name` : dernier nom saisi, chaîne.
- `date` est une date ISO fournie par l'interface au moment de l'enregistrement (le moteur ne lit
  jamais l'horloge) et affichée au format court français (`19/11/2026`).

### Classement (`src/storage/highScores.ts`)

Fonctions pures, reprises de Tetris et adaptées :

- `qualifies(scores, score)` : vrai si le score est strictement positif et que le tableau a moins
  de 10 entrées ou que le score dépasse strictement le dixième ;
- `insertHighScore(scores, entry)` : insère l'entrée **sous** les scores égaux (le premier arrivé
  garde son rang), coupe à 10, renvoie le nouveau tableau et le rang (0 à 9) ou `null` ;
- `normalizeName(name)` : supprime les espaces en début et fin et coupe à 10 caractères ; un nom
  vide après nettoyage est refusé par l'interface (bouton désactivé), jamais remplacé en silence ;
- `parseHighScores(value)` : garde les entrées bien formées (nom de 1 à 10 caractères, score et
  niveau entiers positifs, date ISO lisible), les trie et coupe à 10 ; toute autre valeur donne un
  tableau vide.

### État partagé (`useHighScores`)

Un composable à instance unique (état au niveau du module) expose `scores`, `best`, `lastName`,
`storageAvailable`, `record(entry)` et `clear()`. Il lit le stockage une fois au démarrage. Chaque
modification met à jour l'état en mémoire puis tente l'écriture ; si elle échoue, l'état en
mémoire reste valable pour la session. `storageAvailable` vient de `isStorageAvailable()`.

Alternative écartée : relire le stockage à chaque affichage. Inutile pour un seul onglet, et le
tableau disparaîtrait d'un écran à l'autre quand le stockage est bloqué.

### Fin de partie

L'écran de fin de `add-game-ui` reçoit le score et le niveau. Si `qualifies` est vrai, il affiche
« Nouveau record ! » quand le score bat le premier, sinon « Vous entrez dans le top 10 », puis un
champ « Votre nom » prérempli avec `lastName`, `maxlength` 10, focus automatique, validation par
Entrée ou par le bouton « Enregistrer ». Après l'enregistrement, le tableau s'affiche avec la ligne
du joueur mise en évidence, puis les boutons habituels (« Rejouer », « Accueil »). Si le score ne
se qualifie pas, l'écran affiche directement le tableau. Pendant la saisie, les touches du clavier
ne commandent ni le jeu ni le son. Quitter l'écran sans enregistrer abandonne le score.

### Accueil et HUD

- Accueil : tableau des 10 meilleurs scores (rang, nom, score, niveau, date), ou « Aucun score
  pour l'instant » ; bouton « Effacer les scores », visible seulement s'il y a des scores, qui
  ouvre la boîte de confirmation de `add-game-ui` (« Effacer les 10 meilleurs scores ? »). Le
  dernier nom saisi est conservé. Si `storageAvailable` est faux, un avertissement : « Votre
  navigateur bloque l'enregistrement : les scores ne seront pas conservés après la fermeture. »
- HUD : « Record » affiche `max(best, score de la partie)`, qui suit donc le score en direct dès
  qu'il dépasse l'ancien record.

## Risks / Trade-offs

- [Deux onglets ouverts qui enregistrent chacun un score] → le dernier qui écrit l'emporte ; cas
  marginal pour un jeu solo, accepté.
- [Nom avec des caractères exotiques ou des émojis] → affiché tel quel par Vue (texte échappé) ;
  la longueur est comptée en unités de code, ce qui peut couper un émoji : accepté.
- [Score enregistré avec une date d'un appareil mal réglé] → la date n'est qu'informative et
  n'intervient pas dans le classement.

## Migration Plan

Sans objet : premier format de scores. Une entrée mal formée trouvée plus tard sera écartée par
`parseHighScores`.
