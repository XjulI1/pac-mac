import { startingChasers } from '../chasers/roster'
import { MAZE, tileIndex } from '../maze/maze'
import { WANTED_DIRECTION_SECONDS } from '../rules'
import { countItems, createGame } from '../setup'
import { tick } from '../tick'
import type {
  Bonus,
  Chaser,
  ChaserId,
  ChaserStatus,
  Direction,
  GameEvent,
  GameInput,
  GameState,
  Item,
  Mode,
  NestCounters,
  Phase,
  Point,
  Surcharge,
  Tile,
} from '../types'
import { secondsToTicks, tileCenter } from '../units'

/** No direction requested this tick. */
export const NO_INPUT: GameInput = { direction: null }

/** Position and state of one chaser in a custom game. */
export type ChaserSetup = {
  tile?: Tile
  position?: Point
  direction?: Direction
  status?: ChaserStatus
  vulnerable?: boolean
}

/** Chasers of a custom game: none, the usual start, or only the listed ones. */
export type ChasersSetup = 'none' | 'start' | Partial<Record<ChaserId, ChaserSetup>>

/** Description of a custom game state for tests. */
export type GameSetup = {
  seed?: number
  level?: number
  phase?: Phase
  score?: number
  lives?: number
  nextExtraLifeAt?: number
  itemsEatenInLevel?: number
  bonus?: Bonus | null
  bonusesShown?: number
  hero?: {
    tile?: Tile
    position?: Point
    direction?: Direction
    moving?: boolean
    wantedDirection?: Direction | null
  }
  clearItems?: 'all' | readonly Tile[]
  addItems?: readonly { tile: Tile; item: Exclude<Item, null> }[]
  chasers?: ChasersSetup
  mode?: Mode
  surcharge?: Surcharge | null
  nest?: Partial<NestCounters>
}

/** Builds a game in the `playing` phase, adjusted by the setup, without chasers unless asked. */
export function gameWith(setup: GameSetup = {}): GameState {
  const state = createGame({ seed: setup.seed ?? 1 })
  state.phase = setup.phase ?? { kind: 'playing' }
  if (setup.level !== undefined) state.level = setup.level
  if (setup.score !== undefined) state.score = setup.score
  if (setup.lives !== undefined) state.lives = setup.lives
  if (setup.nextExtraLifeAt !== undefined) state.nextExtraLifeAt = setup.nextExtraLifeAt
  if (setup.itemsEatenInLevel !== undefined) state.itemsEatenInLevel = setup.itemsEatenInLevel
  if (setup.bonus !== undefined) state.bonus = setup.bonus
  if (setup.bonusesShown !== undefined) state.bonusesShown = setup.bonusesShown
  if (setup.hero) placeHero(state, setup.hero)
  if (setup.clearItems === 'all') state.items = state.items.map(() => null)
  else for (const tile of setup.clearItems ?? []) state.items[tileIndex(MAZE, tile)] = null
  for (const { tile, item } of setup.addItems ?? []) state.items[tileIndex(MAZE, tile)] = item
  state.itemsLeft = countItems(state.items)
  state.chasers = buildChasers(setup.chasers ?? 'none')
  if (setup.mode) state.mode = { ...setup.mode }
  if (setup.surcharge !== undefined) state.surcharge = setup.surcharge
  if (setup.nest) state.nest = { ...state.nest, ...setup.nest }
  return state
}

/** The same game with its chasers removed, to watch Mac alone. */
export function withoutChasers(state: GameState): GameState {
  return { ...state, chasers: [] }
}

function buildChasers(setup: ChasersSetup): Chaser[] {
  if (setup === 'none') return []
  if (setup === 'start') return startingChasers()
  return startingChasers().flatMap((chaser) => {
    const custom = setup[chaser.id]
    if (!custom) return []
    const placed = custom.tile ? tileCenter(custom.tile) : custom.position
    return [
      {
        ...chaser,
        position: placed ? { ...placed } : chaser.position,
        direction: custom.direction ?? chaser.direction,
        status: custom.status ?? (placed ? 'active' : chaser.status),
        vulnerable: custom.vulnerable ?? false,
      },
    ]
  })
}

function placeHero(state: GameState, hero: NonNullable<GameSetup['hero']>): void {
  if (hero.tile) state.hero.position = tileCenter(hero.tile)
  if (hero.position) state.hero.position = { ...hero.position }
  state.hero.direction = hero.direction ?? state.hero.direction
  state.hero.moving = hero.moving ?? true
  if (hero.wantedDirection !== undefined) {
    state.hero.wantedDirection = hero.wantedDirection
    state.hero.wantedTicksLeft = hero.wantedDirection ? secondsToTicks(WANTED_DIRECTION_SECONDS) : 0
  }
}

/** Inputs of a run: the same input every tick, a list (then no input), or a function of the tick. */
export type InputSource = GameInput | readonly GameInput[] | ((tickIndex: number, state: GameState) => GameInput)

/** Applies `count` ticks and returns the final state with all the events, in order. */
export function runTicks(
  state: GameState,
  count: number,
  inputs: InputSource = NO_INPUT,
): { state: GameState; events: GameEvent[] } {
  let current = state
  const events: GameEvent[] = []
  for (let index = 0; index < count; index++) {
    const result = tick(current, inputAt(inputs, index, current))
    current = result.state
    events.push(...result.events)
  }
  return { state: current, events }
}

function inputAt(inputs: InputSource, index: number, state: GameState): GameInput {
  if (typeof inputs === 'function') return inputs(index, state)
  if (Array.isArray(inputs)) return inputs[index] ?? NO_INPUT
  return inputs as GameInput
}
