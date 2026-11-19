## Why

Avec `add-game-engine`, Mac parcourt le labyrinthe et vide les niveaux, mais rien ne le menace : il
n'y a pas encore de jeu. Ce change ajoute ce qui en fait un jeu de poursuite : quatre traqueurs aux
comportements distincts et lisibles, l'alternance de patrouille et de traque qui donne des moments
de répit, la surcharge qui retourne la chasse, et la perte de vies jusqu'à la fin de partie.

## What Changes

- **Quatre traqueurs** (`src/engine/chasers/`), décrits dans [`docs/jeu.md`](../../../docs/jeu.md) :
  - **Limier** : vise Mac ;
  - **Coupeur** : vise la prochaine intersection devant Mac ;
  - **Gardien** : défend le quart du labyrinthe le plus riche en objets, et charge Mac quand il
    approche à 5 cases ou moins ;
  - **Fureteur** : erre au hasard et fonce sur Mac quand il le voit dans un couloir.
- **Déplacement** : choix glouton au centre de chaque case vers la cible, jamais de demi-tour
  spontané, porte du nid fermée, ralentissement dans le tunnel, vitesses de la table des niveaux.
- **Modes** : alternance patrouille (chacun vers son coin) et traque selon le calendrier du niveau,
  avec un demi-tour à chaque changement.
- **Nid** : sorties au fil des objets mangés ou après un délai d'inactivité ; un traqueur capturé
  devient une étincelle qui rentre au nid, s'y reforme et ressort.
- **Surcharge** : un prisme rend les traqueurs vulnérables pour la durée du niveau ; Mac accélère,
  les traqueurs ralentissent et errent ; chaque capture rapporte 200, 400, 600 puis 800 points, et
  1 000 de plus pour les quatre.
- **Vies et fin de partie** : un traqueur dangereux qui touche Mac lui coûte une vie ; la partie
  reprend avec les objets restants, ou se termine quand il n'y a plus de vie.
- **Événements** pour le rendu et le son : sortie du nid, changement de mode, début, fin proche et
  fin de surcharge, capture, retour au nid, Mac pris, vie perdue, fin de partie.

## Capabilities

### New Capabilities

- `chaser-movement` : choix de direction, interdits, hasard, vitesses selon l'état et la case.
- `chaser-targets` : cibles de patrouille et de traque des quatre traqueurs.
- `chaser-modes` : calendrier patrouille / traque, demi-tours, suspension pendant la surcharge.
- `nest` : départ des traqueurs, sorties du nid, retour et régénération des étincelles.
- `surcharge` : vulnérabilité, chaîne de points, fin de surcharge, gel à la capture.
- `lives` : contact avec Mac, perte d'une vie, reprise, fin de partie.

### Modified Capabilities

(aucune : les capacités de `add-game-engine` gardent leurs exigences ; ce change ajoute des phases
et des événements sans en retirer)

## Hors périmètre

Chaque point fera l'objet d'un change ultérieur, dans cet ordre :

1. `add-canvas-renderer` : dessin des traqueurs, de leur aspect vulnérable et des étincelles,
   désagrégation de Mac, points affichés à la capture.
2. `add-game-ui` : écrans, HUD (vies en réserve), fin de partie, boucle temps réel, commandes.
3. `add-sound` : sons de surcharge, de capture, de mort et de fin de partie.
4. `add-high-scores` : meilleurs scores enregistrés en fin de partie.
5. `add-offline-pwa` : application installable et jouable hors ligne.

Après la V1 : traqueurs plus nombreux ou plus malins au fil des niveaux, réglage de difficulté,
second labyrinthe.

Rien de ce change n'est visible en jeu : il se vérifie par les tests du moteur.

## Impact

- Nouveau dossier `src/engine/chasers/` et nouveau fichier `src/engine/lives.ts`, avec tests
  colocalisés.
- `src/engine/types.ts`, `setup.ts`, `tick.ts`, `items.ts` et `level.ts` étendus (champs d'état,
  phases, événements, remise en place des traqueurs).
- Pilote automatique de test complété d'une variante prudente.
- Aucune dépendance ajoutée.
