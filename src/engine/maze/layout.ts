import type { Direction, Tile } from '../types'

/** The 27 rows of the maze, as drawn in docs/jeu.md. */
export const LAYOUT: readonly string[] = [
  '#####################',
  '#.........#.........#',
  '#.###.###.#.###.###.#',
  '#o###.###.#.###.###o#',
  '#...................#',
  '#.###.#.#####.#.###.#',
  '#.....#...#...#.....#',
  '#####.###.#.###.#####',
  '#####.#       #.#####',
  '#####.# ##-## #.#####',
  '#####.  #NNN#  .#####',
  '     .# #NNN# #.     ',
  '#####.# ##### #.#####',
  '#####.#       #.#####',
  '#####.# ##### #.#####',
  '#.........#.........#',
  '#.###.###.#.###.###.#',
  '#o..#.....P.....#..o#',
  '###.#.#.#####.#.#.###',
  '#.....#...#...#.....#',
  '#.###.###.#.###.###.#',
  '#...#...........#...#',
  '###.#.#.#####.#.#.###',
  '#.....#...#...#.....#',
  '#.#######.#.#######.#',
  '#...................#',
  '#####################',
]

/** Direction Mac faces at the start of each level. */
export const HERO_START_DIRECTION: Direction = 'left'

/** Tile where the bonus appears. */
export const BONUS_TILE: Tile = { col: 10, row: 13 }

/** Starting tiles inside the nest, in the order chasers leave it. */
export const NEST_STARTS: readonly Tile[] = [
  { col: 10, row: 11 },
  { col: 9, row: 11 },
  { col: 11, row: 11 },
]
