# Spec Delta

## Purpose

Décrire le labyrinthe en données : la grille de `docs/jeu.md`, ses symboles, ses décomptes, ses
invariants, le voisinage des cases et le tunnel.

## ADDED Requirements

### Requirement: Grille et symboles

Le moteur SHALL exposer le labyrinthe `MAZE` lu depuis les 27 lignes de 21 caractères de
`docs/jeu.md`, chaque case étant un mur (`#`), un couloir avec pastille (`.`), un couloir avec prisme
(`o`), un couloir vide (espace ou `P`), la porte du nid (`-`) ou l'intérieur du nid (`N`).

#### Scenario: Dimensions

- **WHEN** on lit `MAZE`
- **THEN** il mesure 21 colonnes sur 27 lignes

#### Scenario: Cases de référence

- **WHEN** on interroge les cases (0, 0), (1, 1), (1, 3), (7, 8), (10, 9), (9, 10) et (10, 17)
- **THEN** on obtient dans l'ordre un mur, une pastille, un prisme, un couloir vide, la porte, le nid
  et un couloir vide

#### Scenario: Une ligne de longueur incorrecte est refusée

- **WHEN** on lit une grille dont une ligne fait 20 caractères
- **THEN** la lecture lève une erreur qui indique le numéro de la ligne

### Requirement: Décomptes

Le labyrinthe SHALL contenir 215 pastilles, 4 prismes, 256 cases de couloir, une porte et 6 cases
de nid.

#### Scenario: Objets et cases

- **WHEN** on compte les cases de `MAZE` par nature
- **THEN** on trouve 215 pastilles, 4 prismes, 256 couloirs (pastilles, prismes et vides compris),
  1 porte et 6 cases de nid

### Requirement: Couloirs sans cul-de-sac et connexes

Les couloirs SHALL faire une case de large (aucun carré de 2 × 2 cases de couloir), chaque case de
couloir SHALL avoir au moins deux voisines praticables, tunnel compris, et toutes les cases de
couloir SHALL communiquer entre elles sans passer par la porte.

#### Scenario: Aucun carré ouvert

- **WHEN** on examine chaque carré de 2 × 2 cases
- **THEN** aucun n'est fait de quatre cases de couloir

#### Scenario: Aucun cul-de-sac

- **WHEN** on compte les voisines praticables de chaque case de couloir
- **THEN** chacune en a au moins deux

#### Scenario: Connexité

- **WHEN** on parcourt les couloirs en largeur depuis le départ de Mac
- **THEN** on atteint les 256 cases de couloir

### Requirement: Symétrie

La grille SHALL être symétrique par rapport à la colonne 10, au départ de Mac près.

#### Scenario: Cases miroirs

- **WHEN** on compare chaque case (c, r) à la case (20 − c, r)
- **THEN** elles sont de même nature, en traitant `P` comme un couloir vide

### Requirement: Points remarquables

Le moteur SHALL exposer les positions de `docs/jeu.md` : départ de Mac (10, 17), porte (10, 9),
case de sortie du nid (10, 8), point de régénération (10, 10), apparition du bonus (10, 13), cases
de départ des traqueurs et cases du tunnel (ligne 11, colonnes 0 à 4 et 16 à 20).

#### Scenario: Départ de Mac

- **WHEN** on lit le départ de Mac
- **THEN** il est en (10, 17), tourné vers la gauche

#### Scenario: Tunnel

- **WHEN** on liste les cases du tunnel
- **THEN** on obtient les cases (0 à 4, 11) et (16 à 20, 11), soit 10 cases

### Requirement: Voisinage, tunnel et porte

La voisine d'une case dans une direction SHALL être la case adjacente, sauf sur un bord de la ligne
du tunnel où elle SHALL être la case du bord opposé. La porte SHALL être un mur, sauf pour un
déplacement qui demande explicitement à la franchir.

#### Scenario: Traversée du tunnel

- **WHEN** on demande la voisine de gauche de (0, 11) et la voisine de droite de (20, 11)
- **THEN** on obtient (20, 11) puis (0, 11)

#### Scenario: Porte fermée par défaut

- **WHEN** on demande si la case sous (10, 8) est praticable sans franchir la porte
- **THEN** la réponse est non
- **AND** elle est oui en demandant à franchir la porte

### Requirement: Intersections

Une case de couloir SHALL être une intersection si elle a au moins trois voisines praticables, la
porte comptant comme un mur.

#### Scenario: Croisement

- **WHEN** on interroge la case (5, 4)
- **THEN** c'est une intersection (4 voisines praticables)

#### Scenario: Couloir droit

- **WHEN** on interroge la case (2, 1)
- **THEN** ce n'est pas une intersection

#### Scenario: Case au-dessus de la porte

- **WHEN** on interroge la case (10, 8)
- **THEN** ce n'est pas une intersection (2 voisines praticables, la porte comptant comme un mur)
