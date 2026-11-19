# Tasks

## 1. Classement (`high-scores`)

- [x] 1.1 Écrire les tests des fonctions pures de `src/storage/highScores.ts` : `qualifies` (classement incomplet, score nul, classement complet à égalité et au-dessus), `insertHighScore` (rang, égalité placée dessous, coupure à 10, rang `null` hors classement), `normalizeName` (espaces retirés, coupe à 10 caractères), `parseHighScores` (entrées valides gardées et triées, entrées mal formées écartées, valeur qui n'est pas un tableau → classement vide).
- [x] 1.2 Implémenter les fonctions pures ; vérifier que les tests 1.1 passent.
- [x] 1.3 Écrire les tests de `useHighScores` avec un faux stockage : lecture au démarrage, `record` qui met à jour le classement, le dernier nom et le stockage, `clear` qui vide le classement et garde le dernier nom, `best` à 0 sans score, stockage bloqué → `storageAvailable` faux et classement gardé en mémoire.
- [x] 1.4 Implémenter `useHighScores` sur `src/storage/localStore.ts` (clés `pacmac:high-scores` et `pacmac:last-name`) ; vérifier que les tests 1.3 passent.

## 2. Écran de fin de partie

- [x] 2.1 Écrire les tests de l'écran de fin : champ prérempli avec le dernier nom quand le score se qualifie, « Nouveau record ! » ou « Vous entrez dans le top 10 », bouton désactivé pour un nom vide ou fait d'espaces, enregistrement par Entrée et par le bouton, tableau avec la ligne du joueur mise en évidence, tableau direct sans champ quand le score ne se qualifie pas, touches M, P et flèches sans effet pendant la saisie.
- [x] 2.2 Ajouter la saisie du nom et le tableau à l'écran de fin de `add-game-ui`, avec la date ISO de l'enregistrement ; vérifier que les tests 2.1 passent.

## 3. Accueil et HUD

- [x] 3.1 Écrire les tests de l'accueil : tableau rempli dans l'ordre avec la date au format `19/11/2026`, « Aucun score pour l'instant » sans bouton d'effacement, effacement après confirmation, annulation sans effet, avertissement de stockage bloqué.
- [x] 3.2 Ajouter le tableau, le bouton « Effacer les scores » (boîte de confirmation de `add-game-ui`) et l'avertissement à l'accueil ; vérifier que les tests 3.1 passent.
- [x] 3.3 Écrire les tests du record du HUD : meilleur score enregistré, record qui suit le score dès qu'il le dépasse, 0 sans score.
- [x] 3.4 Ajouter le record au HUD ; vérifier que les tests 3.3 passent.

## 4. Vérification d'ensemble

- [x] 4.1 Avec `pnpm dev` : jouer trois parties courtes, vérifier l'entrée dans le tableau, le dernier nom proposé, le rang mis en évidence, le record du HUD qui suit le score, la persistance après rechargement et l'effacement ; en navigation privée stricte ou avec les données de site bloquées, vérifier l'avertissement et que le jeu reste jouable.
- [x] 4.2 Lancer `pnpm lint`, `pnpm type-check`, `pnpm test` et `pnpm build` ; tout doit passer sans erreur ni avertissement.
- [x] 4.3 Mettre à jour le README (meilleurs scores conservés dans le navigateur, effacement depuis l'accueil).
