import { moveChasers } from './chasers/chaserMovement'
import { resolveCollisions } from './chasers/collisions'
import { tickMode } from './chasers/modes'
import { noteItemEaten, releaseFromNest } from './chasers/nest'
import { startSurcharge, tickSurcharge } from './chasers/surcharge'
import { moveHero, rememberDirection } from './hero'
import { countDownBonus, eatAtHeroTile } from './items'
import { clearLevel, tickLevelClear } from './level'
import { levelSettings } from './levels'
import { tickDying } from './lives'
import type { GameEvent, GameInput, GameState, TickResult } from './types'
import { speedToUnitsPerSecond } from './units'

/** Advances a game by one tick of 1/60 s; the given state is never modified. */
export function tick(state: GameState, input: GameInput): TickResult {
  const next = structuredClone(state)
  const events: GameEvent[] = []
  next.tickCount += 1
  switch (next.phase.kind) {
    case 'ready':
      tickReady(next, input)
      break
    case 'playing':
      tickPlaying(next, input, events)
      break
    case 'chaserCaught':
      tickChaserCaught(next, input)
      break
    case 'dying':
      tickDying(next, events)
      break
    case 'levelClear':
      tickLevelClear(next, events)
      break
    case 'gameOver':
      break
  }
  return { state: next, events }
}

function tickReady(state: GameState, input: GameInput): void {
  if (state.phase.kind !== 'ready') return
  state.hero = rememberDirection(state.hero, input)
  const ticksLeft = state.phase.ticksLeft - 1
  state.phase = ticksLeft > 0 ? { kind: 'ready', ticksLeft } : { kind: 'playing' }
}

function tickChaserCaught(state: GameState, input: GameInput): void {
  if (state.phase.kind !== 'chaserCaught') return
  state.hero = rememberDirection(state.hero, input)
  const ticksLeft = state.phase.ticksLeft - 1
  state.phase = ticksLeft > 0 ? { ...state.phase, ticksLeft } : { kind: 'playing' }
}

function tickPlaying(state: GameState, input: GameInput, events: GameEvent[]): void {
  const settings = levelSettings(state.level)
  const heroSpeed = state.surcharge ? settings.heroSurchargeSpeed : settings.heroSpeed
  state.hero = moveHero(rememberDirection(state.hero, input), speedToUnitsPerSecond(heroSpeed))
  countDownBonus(state, events)
  const eaten = eatAtHeroTile(state, events)
  if (eaten) noteItemEaten(state)
  if (eaten === 'prism') startSurcharge(state, events)
  if (state.itemsLeft === 0) {
    clearLevel(state, events)
    return
  }
  if (!resolveCollisions(state, events)) return
  moveChasers(state, events)
  if (!resolveCollisions(state, events)) return
  releaseFromNest(state, events, eaten !== null)
  tickMode(state, events)
  if (eaten !== 'prism') tickSurcharge(state, events)
}
