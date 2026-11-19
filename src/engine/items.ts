import { levelSettings } from './levels'
import { MAZE, tileIndex } from './maze/maze'
import {
  BONUS_SECONDS,
  BONUS_THRESHOLDS,
  EXTRA_LIFE_STEP,
  MAX_LIVES,
  PELLET_POINTS,
  PRISM_POINTS,
} from './rules'
import type { GameEvent, GameState, Item, Tile } from './types'
import { secondsToTicks, tileOfPoint } from './units'

/** Eats the item and the bonus in Mac's tile, if any, and returns the item eaten. */
export function eatAtHeroTile(state: GameState, events: GameEvent[]): Item {
  const tile = tileOfPoint(state.hero.position, MAZE.width)
  const item = eatItem(state, tile, events)
  eatBonus(state, tile, events)
  return item
}

/** Adds points to the score and grants the extra lives they reach. */
export function addScore(state: GameState, points: number, events: GameEvent[]): void {
  state.score += points
  while (state.score >= state.nextExtraLifeAt) {
    if (state.lives < MAX_LIVES) {
      state.lives += 1
      events.push({ type: 'extraLife', lives: state.lives })
    }
    state.nextExtraLifeAt += EXTRA_LIFE_STEP
  }
}

/** Counts down the visible bonus and removes it when its time is up. */
export function countDownBonus(state: GameState, events: GameEvent[]): void {
  if (!state.bonus) return
  const ticksLeft = state.bonus.ticksLeft - 1
  if (ticksLeft > 0) {
    state.bonus = { ...state.bonus, ticksLeft }
    return
  }
  state.bonus = null
  events.push({ type: 'bonusExpired' })
}

function eatItem(state: GameState, tile: Tile, events: GameEvent[]): Item {
  const index = tileIndex(MAZE, tile)
  const item = state.items[index] ?? null
  if (!item) return null
  state.items[index] = null
  state.itemsLeft -= 1
  state.itemsEatenInLevel += 1
  if (item === 'pellet') {
    addScore(state, PELLET_POINTS, events)
    events.push({ type: 'pelletEaten', tile })
  } else {
    addScore(state, PRISM_POINTS, events)
    events.push({ type: 'prismEaten', tile })
  }
  showBonusIfDue(state, events)
  return item
}

function showBonusIfDue(state: GameState, events: GameEvent[]): void {
  if (state.bonusesShown >= BONUS_THRESHOLDS.length) return
  if (state.itemsEatenInLevel !== BONUS_THRESHOLDS[state.bonusesShown]) return
  const { kind, points } = levelSettings(state.level).bonus
  state.bonus = { kind, points, ticksLeft: secondsToTicks(BONUS_SECONDS) }
  state.bonusesShown += 1
  events.push({ type: 'bonusAppeared', kind })
}

function eatBonus(state: GameState, tile: Tile, events: GameEvent[]): void {
  if (!state.bonus) return
  if (tile.col !== MAZE.bonusTile.col || tile.row !== MAZE.bonusTile.row) return
  const { kind, points } = state.bonus
  state.bonus = null
  addScore(state, points, events)
  events.push({ type: 'bonusEaten', kind, points, tile })
}
