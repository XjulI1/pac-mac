# Design

## Context

`add-game-engine` a posé le moteur : labyrinthe, Mac, objets, score, niveaux, `tick` à pas fixe,
déplacement générique `advance` et générateur à graine. Ce change y ajoute les quatre traqueurs, le
nid, l'alternance patrouille et traque, la surcharge, les captures, la perte de vies et la fin de
partie, tels que décrits dans `docs/jeu.md`. Il reste invisible : il se vérifie par les tests du
moteur, et le rendu arrive avec `add-canvas-renderer`.

## Goals / Non-Goals

**Goals :**

- Quatre comportements distincts et lisibles, chacun dans sa propre fonction de ciblage, testable
  seule.
- Réutiliser `advance` pour tous les déplacements : les traqueurs n'ont que leur propre règle de
  choix de direction.
- Garder un état JSON, un tick pur et le déterminisme, y compris pour les choix aléatoires.
- Des événements suffisants pour le rendu (captures, points, résurrections) et pour le son
  (surcharge, fin de surcharge, mort, fin de partie).

**Non-Goals :**

- Pas de dessin ni d'animation : la désagrégation de Mac, le grésillement des traqueurs
  vulnérables et l'affichage des points viennent avec `add-canvas-renderer`.
- Pas de difficulté réglable : la difficulté ne dépend que du niveau.
- Pas de traqueur supplémentaire au fil des niveaux ni de second labyrinthe (après la V1).

## Decisions

### Arborescence

```
src/engine/
  chasers/
    types.ts          ChaserId, Chaser, ChaserStatus
    roster.ts         les quatre traqueurs : identité, départ, coin de patrouille, ordre de sortie
    targets.ts        cibles de patrouille et de traque (houndTarget, cutterTarget, wardenTarget, prowlerTarget)
    steering.ts       choix de direction au centre d'une case (cible, hasard, interdits)
    chaserMovement.ts vitesse selon l'état et la case, déplacement, trajets scriptés du nid
    nest.ts           sorties du nid (seuils, inactivité), retour des étincelles
    modes.ts          calendrier patrouille / traque, demi-tours
    surcharge.ts      début, décompte, fin, chaîne de points
    collisions.ts     contact Mac / traqueur, capture ou perte de vie
  lives.ts            phases dying et gameOver, remise en place après une vie perdue
```

Identifiants : Limier `hound`, Coupeur `cutter`, Gardien `warden`, Fureteur `prowler`.

### Forme de l'état

```ts
type ChaserId = 'hound' | 'cutter' | 'warden' | 'prowler'

type ChaserStatus = 'inNest' | 'leaving' | 'active' | 'spark' | 'entering'

type Chaser = {
  id: ChaserId
  position: Point
  direction: Direction
  carry: number
  status: ChaserStatus
  vulnerable: boolean
}

type GameState = {
  // champs de add-game-engine, plus :
  chasers: Chaser[]
  mode: { kind: 'patrol' | 'chase'; step: number; ticksLeft: number | null }
  surcharge: { ticksLeft: number; chain: number } | null
  nest: { itemsEatenSinceRestart: number; ticksSinceLastItem: number }
}

type Phase =
  | /* phases de add-game-engine */
  | { kind: 'chaserCaught'; ticksLeft: number; chaser: ChaserId; points: number }
  | { kind: 'dying'; ticksLeft: number; by: ChaserId }
  | { kind: 'gameOver' }
```

`chasers` est toujours dans l'ordre Limier, Coupeur, Gardien, Fureteur. `mode.ticksLeft` vaut `null`
quand le calendrier est épuisé (traque permanente).

### Cycle de vie d'un traqueur

```
inNest ──seuil ou inactivité──▶ leaving ──arrivé en (10, 8)──▶ active
                                   ▲                              │
                                   │                     capturé (vulnérable)
                     reformé en (10, 10)                          ▼
                                   └──── entering ◀──arrivé en (10, 8)── spark
```

- `inNest` : immobile (l'oscillation est un effet de rendu).
- `leaving` et `entering` : trajets scriptés, porte franchissable. En sortant, le traqueur rejoint
  la colonne 10, puis monte jusqu'au centre de (10, 8). En rentrant, il descend de (10, 8) jusqu'au
  point de régénération (10, 10), redevient non vulnérable, émet `chaserRevived` et repart aussitôt
  en `leaving`.
- `active` : déplacement normal par `advance`, avec la règle de choix de `steering.ts`.
- `spark` : déplacement normal vers la case de sortie (10, 8), à 12 cases/s ; arrivé à son centre,
  il passe en `entering`.

Le Limier commence en `active` en (10, 8) ; à son premier centre il choisit sa direction comme les
autres. Au centre de (10, 8), la case du dessus est un mur et la porte est fermée : il n'a que la
gauche et la droite, sans cas particulier.

### Choix de direction

`steering.ts` reçoit la case, la direction actuelle et une cible ou le mode « hasard » :

1. directions candidates : les quatre, moins le demi-tour, moins celles dont la voisine est un mur
   (la porte en est un pour un traqueur `active` ou `spark`) ;
2. avec une cible : la candidate dont la case voisine est la plus proche de la cible au carré de la
   distance euclidienne, en cases ; égalité départagée par l'ordre haut, droite, bas, gauche ;
3. au hasard : un tirage uniforme parmi les candidates, par le générateur de la partie.

Le labyrinthe n'a pas de cul-de-sac : il reste toujours au moins une candidate. Le hasard ne
consomme le générateur qu'aux intersections (plus d'une candidate), pour que les tests de cible
restent indépendants de la graine.

Alternative écartée : **plus court chemin (parcours en largeur) vers la cible**. Plus « intelligent »,
mais les traqueurs deviendraient implacables et indiscernables les uns des autres ; le choix
glouton case par case est la règle du genre, qui laisse au joueur des façons de les semer.

### Cibles

Fonctions pures de `targets.ts`, chacune testée seule :

- patrouille : le coin du traqueur (`roster.ts`), hors du labyrinthe, ce qui le fait tourner autour
  du bloc le plus proche ;
- `houndTarget` : la case de Mac ;
- `cutterTarget` : si Mac est arrêté, sa case ; sinon on part de la case de Mac dans sa direction,
  on avance case par case en prenant un coude quand il n'y a qu'une issue (demi-tour exclu), et on
  s'arrête à la première intersection, ou après 8 cases, ou devant un embranchement ;
- `wardenTarget` : la case de Mac si la distance de Manhattan entre le Gardien et Mac est d'au plus
  5 cases, sinon la case repère du quart qui contient le plus d'objets (requête de
  `add-game-engine`) ;
- `prowlerTarget` : la case de Mac s'il la voit (même ligne ou même colonne, que des cases
  praticables entre eux, sans boucler par le tunnel), sinon `null`, c'est-à-dire le hasard.

En patrouille, le Fureteur vise son coin comme les autres. Un traqueur vulnérable choisit toujours
au hasard.

### Vitesses

Vitesse d'un traqueur à un tick donné, dans cet ordre de priorité :

| État | Vitesse |
|---|---|
| `spark`, `entering` | 12 cases/s |
| `leaving`, `inNest` | vitesse « dans le tunnel » du niveau |
| vulnérable | vitesse « vulnérables » du niveau |
| sur une case du tunnel | vitesse « dans le tunnel » du niveau |
| Fureteur en traque qui voit Mac | vitesse des traqueurs + 10 %, arrondie à l'unité |
| sinon | vitesse des traqueurs du niveau |

Mac prend la vitesse « Mac en surcharge » tant qu'une surcharge est active.

### Ordre d'un tick en phase `playing`

1. entrée et déplacement de Mac ;
2. objet ou bonus mangé ; un prisme démarre ou relance la surcharge ;
3. fin de niveau si plus aucun objet (on s'arrête là) ;
4. collisions ;
5. déplacement des traqueurs ;
6. collisions ;
7. sorties du nid ;
8. décomptes : mode (suspendu pendant la surcharge), surcharge, bonus, inactivité.

Deux contrôles de collision encadrent le déplacement des traqueurs. Le seuil de contact est d'une
demi-case (60 unités) et, en un tick, Mac (7,5 cases/s au plus) et un traqueur dangereux (le
Fureteur lancé, 8,4 cases/s au plus) se rapprochent d'au plus 15 + 17 = 32 unités : ils ne peuvent
pas se croiser sans contact. Les étincelles, plus rapides, ne touchent jamais Mac.

### Collisions

Pour chaque traqueur à moins de 60 unités de Mac (distance euclidienne en unités, en tenant compte
du tunnel), dans l'ordre Limier, Coupeur, Gardien, Fureteur :

- vulnérable → capture : `chain` augmente de 1, points `200 × chain`, 1 000 de plus quand `chain`
  atteint 4, le traqueur devient `spark` non vulnérable, événement `chaserCaught` ;
- `spark` ou `entering` → rien ;
- sinon → Mac est pris.

Si Mac est pris, la partie passe en `dying` même si une capture a eu lieu dans le même tick. Sinon,
s'il y a eu au moins une capture, elle passe en `chaserCaught` pour 30 ticks avec le dernier
traqueur capturé. Les points passent par la même fonction que les objets, pour que les vies
supplémentaires s'appliquent.

### Surcharge

- Un prisme mangé : `surcharge = { ticksLeft: durée du niveau, chain: 0 }`, tous les traqueurs
  qui ne sont ni `spark` ni `entering` deviennent vulnérables, ceux en `active` font demi-tour,
  événement `surchargeStarted`.
- Un prisme mangé pendant une surcharge fait la même chose : durée complète, chaîne remise à 0.
- `surchargeEnding` est émis au tick où il reste 120 ticks, ou dès le début si la surcharge dure
  2 secondes ou moins ; le rendu fait grésiller les traqueurs vulnérables à partir de là.
- À zéro : tous les traqueurs redeviennent non vulnérables, `surcharge` vaut `null`, événement
  `surchargeEnded`.
- Le calendrier des modes est suspendu tant que `surcharge` n'est pas `null`.

### Modes

`mode` suit le calendrier du niveau (`levelSettings(level).modeSchedule`), en commençant par la
patrouille à l'étape 0. À la fin d'une étape : étape suivante, bascule patrouille ↔ traque,
événement `modeChanged`, et demi-tour de chaque traqueur `active` non vulnérable. Après la
dernière étape, `ticksLeft` vaut `null`.

### Nid

À chaque tick de `playing`, après les déplacements :

- `nest.itemsEatenSinceRestart` compte les objets mangés depuis le début du niveau ou la dernière
  vie perdue ; `nest.ticksSinceLastItem` repart de zéro à chaque objet mangé ;
- le premier traqueur encore `inNest` dans l'ordre Coupeur, Gardien, Fureteur sort si son seuil
  est atteint, ou si `ticksSinceLastItem` atteint le délai d'inactivité du niveau (le délai repart
  alors de zéro) ;
- un seul traqueur sort par tick : avec des seuils nuls, ils sortent sur trois ticks consécutifs ;
- chaque sortie émet `chaserReleased`.

### Vies et fin de partie

- Mac pris : phase `dying` de 120 ticks, événement `heroCaught`. Tout est figé.
- Fin de `dying` : une vie en moins et événement `lifeLost`. S'il ne reste aucune vie : phase
  `gameOver` et événement `gameOver` avec le score et le niveau. Sinon : Mac et les traqueurs à
  leurs positions de départ, mode et compteurs du nid remis à zéro, surcharge et bonus retirés,
  objets conservés, phase `ready` de 120 ticks.
- En `gameOver`, `tick` ne change plus que `tickCount`.
- Le début d'un niveau remet les traqueurs en place de la même façon.

### Événements ajoutés

```ts
type GameEvent =
  | /* événements de add-game-engine */
  | { type: 'chaserReleased'; chaser: ChaserId }
  | { type: 'modeChanged'; mode: 'patrol' | 'chase' }
  | { type: 'surchargeStarted'; ticks: number }
  | { type: 'surchargeEnding' }
  | { type: 'surchargeEnded' }
  | { type: 'chaserCaught'; chaser: ChaserId; points: number; chainBonus: number; tile: Tile }
  | { type: 'chaserRevived'; chaser: ChaserId }
  | { type: 'heroCaught'; by: ChaserId }
  | { type: 'lifeLost'; livesLeft: number }
  | { type: 'gameOver'; score: number; level: number }
```

### Pilote automatique

Le pilote de `add-game-engine` reste naïf (objet le plus proche) : il perd ses vies et permet de
tester des parties entières jusqu'au `gameOver`. Une variante prudente, qui écarte les cases
voisines d'un traqueur dangereux, sert au test qui vérifie qu'une partie peut dépasser le niveau 1.

## Risks / Trade-offs

- [Traqueurs trop faciles ou trop durs à semer] → valeurs isolées dans `levels.ts` et
  `docs/jeu.md` ; tests de bout en bout qui mesurent la durée de vie moyenne du pilote naïf et la
  progression du pilote prudent, pour repérer une dérive après un réglage.
- [Traqueurs bloqués dans une boucle sans fin autour d'un bloc] → la patrouille et l'alternance
  des modes, avec demi-tour, cassent ces boucles ; test qui vérifie que chaque traqueur visite au
  moins la moitié des quarts du labyrinthe sur cinq minutes de jeu.
- [Contact manqué entre deux ticks] → seuil d'une demi-case et deux contrôles par tick ; test
  dédié avec Mac et un traqueur qui foncent l'un vers l'autre à toutes les vitesses de la table.
- [Ordre des événements fragile pour le son] → ordre fixé par le déroulé du tick et vérifié par
  des tests d'enchaînement (prisme puis capture, capture puis mort dans le même tick).

## Migration Plan

Sans objet : rien n'est encore sauvegardé, les états existants ne vivent que dans les tests.
