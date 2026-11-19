# Tasks

## 1. Stockage protégé (`browser-storage`)

- [x] 1.1 Écrire les tests de `src/storage/localStore.ts` avec un faux stockage : lecture d'une valeur, clé absente, JSON corrompu, accès qui lève une erreur, écriture réussie (`true`), quota dépassé (`false`), `isStorageAvailable` vrai ou faux et clé de test supprimée, `neutralizeBlockedStorage` qui remplace un accès bloqué par `null` et laisse un stockage sain intact.
- [x] 1.2 Implémenter `src/storage/localStore.ts` (sur le modèle de Tetris et de la garde de Monopwnly) et appeler `neutralizeBlockedStorage()` au début de `src/main.ts` ; vérifier que les tests 1.1 passent.
- [x] 1.3 Ajouter `src/storage/**/*.test.ts` et `src/audio/**/*.test.ts` aux projets Vitest (environnement node pour `src/audio/`, sauf `useSound` en happy-dom) ; vérifier que `pnpm test` les exécute.

## 2. Notes, catalogue et programmation (`sound-effects`)

- [x] 2.1 Écrire les tests de `noteFrequency` (A4, C5, A2, dièses et bémols, note invalide refusée), repris de Tetris.
- [x] 2.2 Implémenter `src/audio/notes.ts` ; vérifier que les tests 2.1 passent.
- [x] 2.3 Écrire les tests de `schedule.ts` : instants de départ et durées d'une séquence à une et deux voix, silences, tempo, durée totale ; jingle `gameStart` programmé à 10 s (notes à 10 s, 10,2 s, 12,4 s et 12,8 s, durée 3,2 s).
- [x] 2.4 Implémenter `src/audio/schedule.ts` ; vérifier que les tests 2.3 passent.
- [x] 2.5 Écrire les tests du catalogue : les douze sons présents, notes valides, durées positives, durées maximales de `death`, `levelClear` (1,9 s) et `gameStart` (3,8 s), notes de départ de `capture` par cran, gamme de la chaîne de pastilles et `pelletNote` (rangs 0, 9, 10, 18).
- [x] 2.6 Saisir `src/audio/catalog.ts` d'après le tableau du design ; vérifier que les tests 2.5 passent.

## 3. Correspondance événements → sons (`sound-effects`)

- [x] 3.1 Écrire les tests de `cuesFor` : correspondance de chaque événement, événements muets, un seul `pellet` pour trois ticks enchaînés avec un compteur avancé de 3, `prism` seul avec une pastille, chaîne remise à zéro après plus de 24 ticks, `capture` au bon cran suivi de `chainComplete`, cycle d'ambiance `start` / `hurry` / `stop`, arrêt de l'ambiance sur `heroCaught`, `levelCleared` et `gameOver`, aucun son en double dans un même appel.
- [x] 3.2 Implémenter `src/audio/cues.ts` ; vérifier que les tests 3.1 passent.

## 4. Moteur Web Audio

- [x] 4.1 Écrire les tests de `SoundEngine` avec un faux `AudioContext` minimal (oscillateurs et gains enregistrés) : rien avant `unlock`, contexte créé au premier `unlock` et repris s'il est suspendu, aucune erreur sans `AudioContext`, gain maître à 0 quand le son est coupé, un son joué crée autant d'oscillateurs que de notes non muettes, ambiance programmée puis arrêtée, `suspend` et `resume` transmis au contexte.
- [x] 4.2 Implémenter `src/audio/soundEngine.ts` (bus maître, bus d'ambiance, minuterie de programmation de 25 ms sur 120 ms) ; vérifier que les tests 4.1 passent.

## 5. Préférence, raccourci et branchement (`sound-settings`)

- [x] 5.1 Écrire les tests de `src/storage/soundPreference.ts` : préférence absente ou illisible → son actif, aller-retour `{ muted: true }` sous `pacmac:sound`.
- [x] 5.2 Implémenter `src/storage/soundPreference.ts` ; vérifier que les tests 5.1 passent.
- [x] 5.3 Écrire les tests de `useSound` (happy-dom, moteur de son factice) : préférence appliquée au montage, `unlock` au premier geste puis écouteur retiré, touche M qui bascule et enregistre la préférence, touche M ignorée dans un champ de saisie, événements d'une image transmis au moteur, `gameStart` au lancement d'une partie mais pas au niveau suivant, `suspend` à la pause et quand la page est cachée, `resume` à la reprise, ambiance arrêtée au retour à l'accueil.
- [x] 5.4 Implémenter `src/audio/useSound.ts` et le brancher dans `App.vue` sur la session de jeu de `add-game-ui` ; vérifier que les tests 5.3 passent.
- [x] 5.5 Écrire les tests du bouton de son du HUD : icône et libellé accessible selon l'état, clic qui bascule le son.
- [x] 5.6 Ajouter le bouton au HUD ; vérifier que les tests 5.5 passent.

## 6. Vérification d'ensemble

- [x] 6.1 Dans un navigateur piloté (Chromium sans interface, Web Audio instrumenté) : aucun contexte audio avant le premier geste, contexte créé et jingle joué au lancement, un son par pastille mangée, touche M reconnue en AZERTY et préférence enregistrée, contexte suspendu pendant la pause.
- [ ] 6.4 Écouter sur ordinateur puis sur un téléphone (`pnpm dev --host`) : jingle au lancement, chaîne de pastilles audible, prisme et ambiance de surcharge qui accélère avant la fin, captures de plus en plus aiguës, mort, fin de niveau et fin de partie, bouton du HUD, préférence conservée après rechargement, silence quand l'onglet est caché ; vérifier qu'aucun son ne déborde sur la phase suivante.
- [x] 6.2 Lancer `pnpm lint`, `pnpm type-check`, `pnpm test` et `pnpm build` ; tout doit passer sans erreur ni avertissement, et `src/engine/` ne doit importer aucun module de `src/audio/`.
- [x] 6.3 Mettre à jour le README (son coupable avec M ou le bouton du HUD, sons synthétisés sans fichier, mode silencieux de l'iPhone qui coupe aussi le jeu).
