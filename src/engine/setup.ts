import { initialMode } from './chasers/modes'
import { startingChasers } from './chasers/roster'
import { MAZE } from './maze/maze'
import { seedRng } from './rng'
import { FIRST_EXTRA_LIFE, GAME_START_SECONDS, STARTING_LIVES } from './rules'
import type { GameState, Hero, Item } from './types'
import { secondsToTicks, tileCenter } from './units'

/** Options of a new game. */
export type GameOptions = { seed: number }

/** Creates a game at level 1, waiting in the « Prêt ? » phase. */
export function createGame(options: GameOptions): GameState {
  const items = initialItems()
  return {
    rngState: seedRng(options.seed),
    tickCount: 0,
    level: 1,
    score: 0,
    lives: STARTING_LIVES,
    nextExtraLifeAt: FIRST_EXTRA_LIFE,
    items,
    itemsLeft: countItems(items),
    itemsEatenInLevel: 0,
    hero: startingHero(),
    bonus: null,
    bonusesShown: 0,
    chasers: startingChasers(),
    mode: initialMode(1),
    surcharge: null,
    nest: { itemsEatenSinceRestart: 0, ticksSinceLastItem: 0 },
    phase: { kind: 'ready', ticksLeft: secondsToTicks(GAME_START_SECONDS) },
  }
}

/** Items of the maze at the start of a level, one entry per tile. */
export function initialItems(): Item[] {
  return MAZE.cells.map((cell) => (cell === 'pellet' ? 'pellet' : cell === 'prism' ? 'prism' : null))
}

/** Number of items left in an item array. */
export function countItems(items: readonly Item[]): number {
  return items.filter((item) => item !== null).length
}

/** Mac at his start: centered, facing left, stopped, waiting for a command. */
export function startingHero(): Hero {
  return {
    position: tileCenter(MAZE.heroStart),
    direction: MAZE.heroStartDirection,
    wantedDirection: null,
    wantedTicksLeft: 0,
    moving: false,
    carry: 0,
  }
}
