# Design

## Context

Le moteur (`add-game-engine`, `add-chasers`) expose `createGame({ seed })`, `tick(state, input)`,
l'état JSON et ses événements. Le rendu (`add-canvas-renderer`) fournit `MazeCanvas.vue`,
`createMazeRenderer`, les effets pilotés par les événements, `createGameLoop` à planificateur
injecté, `BONUS_ICONS` et `formatScore`. Ce change construit l'application autour : écrans, HUD,
commandes, pause et session de jeu. Motivation : proposal.md ; exigences : `specs/`.

## Goals / Non-Goals

**Goals :**

- Une session qui orchestre moteur, boucle et rendu, testable avec un faux planificateur et des
  minuteries simulées.
- Des commandes réactives : la direction demandée part au tick suivant, sans attendre une image.
- Aucune réactivité Vue par tick : le HUD ne se met à jour que quand une valeur affichée change.
- Toute la logique des commandes (touches, glissements) et du HUD en fonctions pures testées.

**Non-Goals :**

- Son, record, meilleurs scores, réglages : changes suivants, qui se brancheront sur les
  emplacements du HUD, les abonnés aux événements et l'écran de fin.
- Croix directionnelle, vibrations, reprise d'une partie après fermeture : après la V1.
- Mise en page dédiée au paysage ou à la tablette : elles restent jouables avec la mise en page du
  téléphone centrée.

## Decisions

### Arborescence

```
src/
  game/
    keyboard.ts           touche → commande (pur)
    swipe.ts              suivi d'un glissement → directions (pur)
    hud.ts                état + bonus récoltés → données du HUD (pur)
    seed.ts               createSeed(now) côté interface
    useGameSession.ts     partie, boucle, entrée, pause, compte à rebours, fin, abonnés
    useKeyboardControls.ts
    useSwipeControls.ts
    *.test.ts
  ui/
    screens/
      HomeScreen.vue
      GameScreen.vue        HUD + MazeCanvas + surcouches
      GameOverScreen.vue
    hud/
      GameHud.vue           emplacements `record` et `actions`
      LivesIndicator.vue
      BonusShelf.vue
      BonusIcon.vue         petit canvas qui dessine BONUS_ICONS
    PauseOverlay.vue
    ResumeCountdown.vue
    ConfirmDialog.vue
    *.test.ts
  App.vue                 bascule d'écrans
  style.css               Tailwind et thème néon
```

### Session de jeu

`useGameSession(deps?)` expose :

```ts
type SessionStatus = 'home' | 'playing' | 'paused' | 'resuming' | 'over'

type GameSession = {
  status: Readonly<Ref<SessionStatus>>
  hud: Readonly<ShallowRef<HudData | null>>
  countdown: Readonly<Ref<number | null>>
  start(): void
  requestDirection(direction: Direction): void
  holdDirection(direction: Direction | null): void
  pause(): void
  resume(): void
  togglePause(): void
  quit(): void
  attachRenderer(renderer: MazeRenderer): void
  onEvents(listener: (events: GameEvent[], state: GameState) => void): () => void
}
```

- `start` crée la partie avec `createSeed(now())` (`Date.now() >>> 0` par défaut), remet à zéro
  les bonus récoltés et les effets, démarre la boucle et passe en `playing`.
- `requestDirection` mémorise la direction ; le prochain `step` l'envoie à `tick`, puis repasse à
  `null`. Deux directions demandées entre deux ticks : la dernière l'emporte. Le moteur se charge
  ensuite de mémoriser le virage jusqu'à ce qu'il soit possible.
- `step` garde l'état précédent pour l'interpolation, applique `tick`, alimente les effets et les
  bonus récoltés (`bonusEaten`) et renvoie les événements.
- `onEvents` reçoit, une fois par image, les événements de tous les ticks de l'image et l'état
  courant ; `add-sound` s'y abonnera. Les abonnés sont appelés dans leur ordre d'inscription.
- Quand l'état atteint la phase `gameOver`, la session attend 1 500 ms (le labyrinthe figé reste
  affiché), arrête la boucle et passe en `over`.
- `quit` arrête la boucle, oublie la partie et passe en `home`.

`deps` permet d'injecter le planificateur d'images, `now` et les minuteries ; les tests passent
des faux, l'application les valeurs du navigateur.

Alternative écartée : **un store global (Pinia)**. Une seule partie à la fois, consommée par un
seul écran : un composable fourni par `provide` / `inject` suffit, sans dépendance.

### Données du HUD

`hudOf(state, collectedBonuses)` renvoie `{ score, level, reserveLives, bonuses }` :

- `reserveLives = max(0, lives − 1)` : la vie en jeu n'est pas affichée ; elle disparaît de la
  réserve au `lifeLost`, pas au moment du contact ;
- `bonuses` : les 7 derniers bonus récoltés dans la partie, du plus ancien au plus récent.

La session ne remplace `hud` (un `shallowRef`) que si l'une de ces valeurs a changé : au plus
quelques mises à jour par seconde, jamais 60.

### Clavier

`keyToCommand(key, modifiers)` lit `event.key` en minuscules, comme dans Tetris, pour que la
lettre imprimée sur la touche compte, en AZERTY comme en QWERTY :

| Touches | Commande |
|---|---|
| flèches | direction |
| Z ou W | haut |
| Q ou A | gauche |
| S | bas |
| D | droite |
| P ou Échap | pause / reprise |
| Entrée ou Espace | valider l'écran (Jouer, Reprendre, Rejouer) |

Touches ignorées : avec Ctrl, Cmd ou Alt, et quand la cible est un champ de saisie (la saisie du
nom de `add-high-scores` en dépend). `preventDefault` sur les flèches et l'Espace, pour que la page
ne défile pas. Une touche de direction maintenue est passée à `holdDirection` : `step` envoie à
`tick` la direction demandée s'il y en a une, sinon la direction maintenue, à chaque tick, pour que
le moteur ne l'oublie pas au bout de 0,5 s ; au relâchement, la dernière touche encore enfoncée
reprend la main, ou plus rien. Les répétitions automatiques du navigateur sont ignorées, pour les
directions comme pour la pause.

### Glissements

`createSwipeTracker({ threshold: 24 })`, pur, en pixels CSS :

- `start(x, y)` pose une ancre ;
- `move(x, y)` mesure le déplacement depuis l'ancre ; dès que le plus grand des deux écarts atteint
  le seuil, il renvoie la direction de l'axe dominant (horizontal à égalité) et repose l'ancre sur
  le point courant ; une direction identique à la précédente du même glissement n'est pas renvoyée
  deux fois de suite ;
- `end()` oublie le glissement.

Tant que le pointeur reste posé, `useSwipeControls` passe la dernière direction reconnue à
`holdDirection`, comme une touche maintenue au clavier, et la remet à `null` au relâchement ou à
l'annulation du pointeur : un glissement suivi d'un doigt immobile garde son virage au-delà des
0,5 s de mémoire du moteur.

Un même glissement continu peut ainsi donner « droite » puis « bas » pour prendre un virage, sans
lever le doigt. Un simple toucher ne donne rien. `useSwipeControls` branche le suivi sur les
`pointerdown` / `pointermove` / `pointerup` / `pointercancel` de la zone de jeu, avec capture du
pointeur ; il accepte le doigt, le stylet et la souris bouton enfoncé.

Seuil de 24 px : assez grand pour ignorer le tremblement d'un toucher, assez petit pour un virage
rapide (un quart de pouce environ). À valider en jeu.

### Pas de zoom ni de défilement

- `index.html` : `width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no,
  viewport-fit=cover` ;
- zone de jeu en `touch-action: none` ; reste de l'application en `touch-action: manipulation`
  (pas de zoom au double toucher) ;
- `overscroll-behavior: none`, `user-select: none` et `-webkit-tap-highlight-color: transparent`
  sur le corps de page ; `gesturestart` annulé pour Safari iOS.

### Pause

- `pause` est possible en `playing` (toutes les phases du moteur sauf `gameOver`) et en `resuming`
  (qui annule le compte à rebours) ; elle met la boucle en pause.
- Pause automatique sur `visibilitychange` (page cachée) et sur `blur` de la fenêtre, seulement en
  `playing`.
- `resume` passe en `resuming` : compte à rebours 3, 2, 1, une étape toutes les 500 ms, affiché
  par-dessus le labyrinthe ; les directions demandées pendant le compte à rebours sont mémorisées.
  À la fin, la boucle reprend (horloge remise à zéro, sans rattrapage) et la session repasse en
  `playing`.
- La surcouche de pause propose « Reprendre » et « Quitter la partie » ; quitter demande
  confirmation, puis ramène à l'accueil. La partie est perdue : pas de sauvegarde en V1.

Le compte à rebours est un choix de confort au doigt : reprendre instantanément ferait perdre une
vie à qui n'a pas encore le pouce sur l'écran. Il ne touche pas au moteur.

### Écrans et mise en page

- `App.vue` affiche `HomeScreen` en `home`, et `GameScreen` sinon ; `GameOverScreen` est une
  surcouche de `GameScreen` en `over`, par-dessus le labyrinthe figé.
- **Accueil** : titre « PacMac » en néon (CSS, `text-shadow`), bouton « Jouer », aide des
  commandes : « Clavier : flèches, ZQSD ou WASD — P ou Échap : pause » et « Au doigt : glissez
  dans la direction voulue, n'importe où sur le jeu ». Entrée ou Espace lancent la partie.
- **Partie** : colonne centrée, HUD de deux lignes en haut (ligne 1 : score, niveau, emplacement
  `actions` puis bouton pause ; ligne 2 : vies en réserve à gauche, emplacement `record` au centre,
  bonus récoltés à droite), puis le labyrinthe qui prend toute la hauteur restante. Le HUD prend la
  largeur CSS du labyrinthe calculée par `fitMaze`, pour rester aligné sur lui.
- **Fin de partie** : « Partie terminée », score formaté, « Niveau atteint : N », boutons
  « Rejouer » (Entrée) et « Accueil » (Échap), et un emplacement `results` pour la saisie du nom
  et les meilleurs scores de `add-high-scores`.
- Zones sûres : marges `env(safe-area-inset-*)` en haut et en bas.
- Thème : variables Tailwind (`@theme`) reprenant la palette de `src/render/palette.ts` ; police
  système, chiffres en `tabular-nums`. Aucune police externe, pour rester utilisable hors ligne.

Icônes du HUD : les vies sont de petits carrés cyan aux coins arrondis en CSS ; les bonus sont
dessinés par `BonusIcon.vue` avec `BONUS_ICONS` du rendu, pour que l'icône du HUD soit celle du
labyrinthe.

### Tests

- Projet Vitest `ui` en environnement happy-dom, sur `src/game/**/*.test.ts` et
  `src/ui/**/*.test.ts`.
- Fonctions pures (`keyboard`, `swipe`, `hud`, `seed`) testées directement.
- `useGameSession` testé avec un faux planificateur d'images, `now` fixé et
  `vi.useFakeTimers()` pour le compte à rebours et le délai de fin.
- Composants testés avec `@vue/test-utils` : textes, boutons, emplacements, événements émis.

## Risks / Trade-offs

- [Glissements mal reconnus, virages manqués] → seuil et axe dominant isolés dans `swipe.ts`,
  testés ; le moteur mémorise le virage demandé, ce qui pardonne un glissement en avance ; essai
  sur un vrai téléphone dans la check-list.
- [Pause automatique intempestive sur ordinateur (clic dans une autre fenêtre)] → c'est voulu : une
  partie d'arcade ne doit pas continuer sans le joueur ; la reprise est un appui.
- [HUD qui déborde à 360 px avec 4 vies et 7 bonus] → icônes de 14 px, vérifié dans la check-list ;
  au-delà, les bonus les plus anciens sont tronqués visuellement.
- [Safari iOS qui zoome malgré le viewport] → `touch-action` et annulation de `gesturestart` ;
  vérifié sur iPhone dans la check-list.
- [Un événement `gameOver` perdu si l'onglet passe en arrière-plan au même moment] → la session
  lit la phase de l'état après chaque image, pas seulement l'événement.

## Migration Plan

Sans objet : aucune donnée persistée.
