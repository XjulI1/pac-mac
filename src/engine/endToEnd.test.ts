import { describe, expect, it } from 'vitest'
import { MAZE, cellAt, isWalkable } from './maze/maze'
import { createGame } from './setup'
import { autopilotInput } from './testing/autopilot'
import { runTicks, withoutChasers } from './testing/builders'
import { playWithAutopilot } from './testing/runs'
import { tick } from './tick'
import type { GameEvent, GameState } from './types'
import { TILE_UNITS, tileOfPoint } from './units'

function isOnCorridorAxis(state: GameState): boolean {
  const { x, y } = state.hero.position
  const tile = tileOfPoint(state.hero.position, MAZE.width)
  const onAxis = x % TILE_UNITS === TILE_UNITS / 2 || y % TILE_UNITS === TILE_UNITS / 2
  return onAxis && isWalkable(MAZE, tile) && cellAt(MAZE, tile) !== 'nest'
}

describe('a level played by the autopilot without chasers', () => {
  it('is cleared within 3 minutes, then level 2 starts', () => {
    let state = withoutChasers(createGame({ seed: 1 }))
    const events: GameEvent[] = []
    for (let index = 0; index < 10_800 && state.level === 1; index++) {
      const result = tick(state, autopilotInput(state))
      state = result.state
      events.push(...result.events)
      expect(isOnCorridorAxis(state), `Mac off the corridors at tick ${state.tickCount}`).toBe(true)
      expect(state.itemsLeft).toBe(state.items.filter((item) => item !== null).length)
    }
    expect(state.level).toBe(2)
    expect(events).toContainEqual({ type: 'levelStarted', level: 2 })
    const bonusPoints = events.reduce((sum, event) => (event.type === 'bonusEaten' ? sum + event.points : sum), 0)
    expect(state.score).toBe(2350 + bonusPoints)
  })
})

describe('determinism', () => {
  it('replays the same game from the same seed and inputs', () => {
    const first = playWithAutopilot(42, 3000)
    const second = playWithAutopilot(42, 3000)
    expect(second.state).toEqual(first.state)
    expect(second.events).toEqual(first.events)
  })
})

describe('serialisation', () => {
  it('goes on identically from a JSON copy', () => {
    const halfway = runTicks(createGame({ seed: 42 }), 500, (_index, state) => autopilotInput(state)).state
    const copy = JSON.parse(JSON.stringify(halfway)) as GameState
    expect(copy).toEqual(halfway)
    const original = runTicks(halfway, 500, (_index, state) => autopilotInput(state)).state
    const resumed = runTicks(copy, 500, (_index, state) => autopilotInput(state)).state
    expect(resumed).toEqual(original)
  })
})
