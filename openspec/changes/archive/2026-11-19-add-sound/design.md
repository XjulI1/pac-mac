# Design

## Context

Le moteur (`add-game-engine`, `add-chasers`) émet à chaque tick une liste de `GameEvent` ; la
session de jeu de `add-game-ui` appelle `tick` depuis la boucle temps réel, met le jeu en pause et
affiche le HUD. Ce change branche le son sur ces événements sans toucher au moteur. Le moteur de
son de Tetris (`~/Git/Perso/tetris/src/audio`) sert de modèle : sons synthétisés par oscillateurs,
notes en notation scientifique, programmation à l'avance sur l'horloge du contexte audio.
Exigences : `specs/` ; motivation : proposal.md.

Contraintes :

- iOS et les navigateurs récents n'autorisent le son qu'après un geste de l'utilisateur ;
- la boucle de jeu peut enchaîner plusieurs ticks dans une même image (rattrapage après un
  ralentissement) : plusieurs pastilles peuvent arriver d'un coup ;
- le son ne doit jamais faire échouer le jeu : sans Web Audio, on joue en silence.

## Goals / Non-Goals

**Goals :**

- Toute la logique sonore testable sans navigateur : la correspondance événements → sons, la
  hauteur des notes et la programmation des séquences sont des fonctions pures.
- Une seule classe au contact de Web Audio, mince, testée avec un faux contexte.
- Des sons courts qui ne dépassent jamais la durée de la phase qu'ils accompagnent.

**Non-Goals :**

- Pas de fichier audio, pas de bibliothèque de son.
- Pas de musique pendant le jeu normal, pas de volume réglable.
- Pas de son dans le moteur : `src/engine/` reste sans aucune référence à l'audio.

## Decisions

### Arborescence

```
src/
  audio/
    notes.ts          noteFrequency, repris de Tetris
    catalog.ts        SoundId, Tone, catalogue des sons et jingles
    schedule.ts       séquence de tons → tons datés (pur)
    cues.ts           événements d'un ou plusieurs ticks → SoundCue[] (pur)
    soundEngine.ts    contexte Web Audio, bus, déverrouillage, muet, ambiance de surcharge
    useSound.ts       composable : préférence, raccourci M, branchement à la session
  storage/
    localStore.ts     readJson, writeJson, isStorageAvailable, neutralizeBlockedStorage
    soundPreference.ts
```

### Catalogue

```ts
type Tone = {
  note: string | null
  slideTo?: string
  beats: number
  wave: OscillatorType
  volume: number
}
type Sequence = { tempo: number; voices: Tone[][] }
```

Chaque son est une séquence d'une ou plusieurs voix jouées ensemble ; une note vaut `null` pour un
silence. Les sons, tous composés pour PacMac :

| Son | Déclencheur | Description | Durée max |
|---|---|---|---|
| `pellet` | `pelletEaten` | note de triangle très brève (40 ms), à hauteur variable (voir chaîne) | 0,05 s |
| `prism` | `prismEaten` | balayage en dent de scie de 180 à 720 Hz, puis accord bref do-mi-sol | 0,35 s |
| `capture` | `chaserCaught` | « zap » en onde carrée qui monte d'une octave ; note de départ mi5, la5, ré6 puis sol6 selon le rang dans la chaîne | 0,2 s |
| `chainComplete` | `chaserCaught` avec `chainBonus > 0` | arpège do6, mi6, sol6, do7 joué juste après la capture | 0,4 s |
| `revive` | `chaserRevived` | glissement doux de do4 à sol4, en triangle, à faible volume | 0,15 s |
| `bonusAppear` | `bonusAppeared` | deux notes aiguës mi6, si6 | 0,2 s |
| `bonusEaten` | `bonusEaten` | do6, sol6, do7 en montée rapide | 0,3 s |
| `extraLife` | `extraLife` | sol5, do6, mi6, sol6, la dernière tenue | 0,6 s |
| `levelClear` | `levelCleared` | cascade montante do5, mi5, sol5, do6, ré6, mi6, sol6, do7 puis accord final | 1,9 s |
| `death` | `heroCaught` | six éclats en onde carrée qui glissent vers le grave, légèrement désaccordés, puis un choc sourd | 1,9 s |
| `gameOver` | `gameOver` | la4, fa4, ré4, la3, lents, en dent de scie douce | 1,6 s |
| `gameStart` | lancement d'une partie par l'interface | jingle à deux voix, 8 temps à 150 BPM (voir ci-dessous) | 3,8 s |

Jingle de début de partie, 150 BPM :

- voix principale (onde carrée) : la4 ½, do5 ½, mi5 ½, la5 ½, sol5 1, mi5 ½, sol5 ½, do6 1, si5 ½,
  sol5 ½, la5 2 ;
- basse (triangle) : la2 2, fa2 2, do3 2, mi2 1, la2 1.

Les durées maximales sont vérifiées par des tests : `death` et `levelClear` tiennent dans les
2 secondes de `dying` et `levelClear`, `gameStart` dans les 4 secondes de « Prêt ? ».

### Chaîne de pastilles

Plutôt qu'un même bruit répété, chaque pastille joue une note de la gamme pentatonique de do sur
deux octaves (do5, ré5, mi5, sol5, la5, do6, ré6, mi6, sol6, la6), parcourue en aller-retour : la
mélodie monte quand Mac enchaîne les pastilles, redescend, remonte. La position dans la gamme vient
d'un compteur `PelletStreak = { count: number; lastTick: number }`, remis à zéro quand plus de
24 ticks (0,4 s) séparent deux pastilles. `pelletNote(count)` donne la note : position
`count mod 18`, lue en aller (0 à 9) puis en retour (8 à 1).

### Correspondance événements → sons

```ts
type SoundCue =
  | { kind: 'play'; sound: SoundId; step?: number }
  | { kind: 'ambience'; action: 'start' | 'hurry' | 'stop' }

cuesFor(events: GameEvent[], tickCount: number, streak: PelletStreak): { cues: SoundCue[]; streak: PelletStreak }
```

- `cuesFor` reçoit tous les événements des ticks enchaînés depuis la dernière image, et le
  `tickCount` du dernier ; le compteur de chaîne avance pour chaque pastille, mais **un seul** son
  `pellet` est joué par appel, avec la note de la dernière.
- `prismEaten` joue `prism` ; une pastille mangée dans le même appel ne joue pas en plus.
- `surchargeStarted` → ambiance `start` (un prisme pendant une surcharge la relance au tempo
  normal) ; `surchargeEnding` → `hurry` ; `surchargeEnded`, `heroCaught`, `levelCleared` et
  `gameOver` → `stop`.
- `chaserCaught` → `capture` avec `step` = rang dans la chaîne (`points / 200`), suivi de
  `chainComplete` si `chainBonus > 0`.
- `levelStarted`, `lifeLost`, `modeChanged`, `chaserReleased` et `bonusExpired` ne jouent rien :
  ils sont fréquents ou déjà couverts par un autre son.
- Un même `SoundId` n'apparaît qu'une fois par appel.

Alternative écartée : **un son par événement, sans agrégation**. Après un rattrapage de plusieurs
ticks, des sons identiques se superposeraient et saturaient.

### Ambiance de surcharge

Un ostinato grave de quatre notes (la2, mi3, la3, mi3) en onde carrée filtrée, à faible volume, sur
un bus dédié. Il joue 8 notes par seconde, 12 après `hurry`, jusqu'à `stop`. La programmation suit
le principe de Tetris : une minuterie toutes les 25 ms programme les notes des 120 prochaines
millisecondes sur l'horloge du contexte audio, ce qui évite les à-coups.

### Moteur Web Audio

`SoundEngine` (classe, comme dans Tetris) :

- `unlock()` crée le contexte au premier appel, puis le reprend s'il est suspendu ; sans
  `AudioContext`, il ne fait rien et le jeu reste muet ;
- `setMuted(muted)` met le gain maître à 0 ou à 1 ; l'ambiance continue d'être programmée en
  silence, pour reprendre au bon endroit si l'on rétablit le son en pleine surcharge ;
- `play(cue)` joue un son ou pilote l'ambiance ; avant `unlock`, il ne fait rien ;
- `suspend()` et `resume()` suspendent et reprennent le contexte audio (pause du jeu, page cachée) ;
- `stopAll()` arrête l'ambiance (retour à l'accueil).

Les tons datés viennent de `schedule.ts` (fonction pure : séquence + instant de départ → liste de
`{ frequency, slideTo, start, duration, wave, volume }`), si bien que `SoundEngine` ne fait que
créer les oscillateurs. Il est testé avec un faux `AudioContext` minimal.

### Composable et branchement

`useSound(session)` est appelé une fois par `App.vue` :

- lit la préférence au démarrage et l'applique ;
- installe un écouteur unique `pointerdown` / `keydown` / `touchend` (phase de capture) qui appelle
  `unlock()` au premier geste ;
- écoute la touche M (`event.key` en minuscules, comme le clavier de `add-game-ui`, pour que la
  lettre imprimée compte en AZERTY comme en QWERTY ; sans modificateur) pour basculer le son, sauf
  quand le focus est dans un champ de saisie ;
- reçoit les événements de chaque image de la session de `add-game-ui`, les passe à `cuesFor` et
  joue les sons ;
- joue `gameStart` quand une partie est lancée (« Jouer » ou « Rejouer ») ;
- suspend le son quand le jeu est en pause ou la page cachée, le reprend à la reprise du jeu, et
  arrête l'ambiance quand on quitte l'écran de jeu.

Le bouton de son du HUD (icône haut-parleur, barré quand le son est coupé, libellé accessible
« Couper le son » / « Rétablir le son ») appelle la même bascule.

### Stockage protégé

`localStore.ts` reprend le module de Tetris et la garde de Monopwnly :

- `readJson(key)` renvoie `undefined` si le stockage est absent, bloqué ou si la valeur n'est pas
  du JSON ;
- `writeJson(key, value)` renvoie `false` au lieu de lever une erreur (stockage bloqué ou plein) ;
- `isStorageAvailable()` tente une écriture et une suppression d'une clé de test ;
- `neutralizeBlockedStorage()` remplace par `null` un `localStorage` dont le simple accès lève une
  erreur (données de site bloquées dans Safari), appelé une fois dans `main.ts`.

Toutes les clés sont préfixées par `pacmac:`. La préférence de son est `pacmac:sound`, de la forme
`{ muted: boolean }` ; toute autre valeur vaut « son actif ».

## Risks / Trade-offs

- [Sur iPhone, le bouton de sonnerie en mode silencieux coupe Web Audio] → comportement du
  système, signalé dans le README ; rien à corriger.
- [Rattrapage de plusieurs ticks qui empile les sons] → agrégation dans `cuesFor`, un son par
  identifiant et par appel.
- [Sons répétitifs ou fatigants sur une longue partie] → pastille très courte et douce, mélodie de
  chaîne qui varie ; volumes réglés dans `catalog.ts` seulement.
- [Ressemblance involontaire avec un son connu du genre] → chaque son est décrit et noté ici
  explicitement, et reste une composition originale ; pas de son de pastille à deux tons alternés
  ni d'ambiance de fond continue pendant le jeu normal.
- [Contexte audio laissé suspendu par le navigateur après un retour d'arrière-plan] → `resume()` à
  chaque reprise du jeu et à chaque geste.

## Migration Plan

Sans objet : aucune donnée existante. Une préférence absente vaut « son actif ».
