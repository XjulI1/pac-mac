import { describe, expect, it } from 'vitest'
import { MAZE, cellAt, isWalkable } from './maze/maze'
import { createGame } from './setup'
import { autopilotInput } from './testing/autopilot'
import { tick } from './tick'
import type { Chaser, GameState, Point } from './types'
import { TILE_UNITS, tileOfPoint } from './units'

const ONE_HOUR = 60 * 60 * 60
const NEST_PATHS: readonly Chaser['status'][] = ['inNest', 'leaving', 'entering']

function isOnAxis(point: Point): boolean {
  return point.x % TILE_UNITS === TILE_UNITS / 2 || point.y % TILE_UNITS === TILE_UNITS / 2
}

function checkChaser(chaser: Chaser, at: string): void {
  const tile = tileOfPoint(chaser.position, MAZE.width)
  const throughDoor = NEST_PATHS.includes(chaser.status)
  expect(isOnAxis(chaser.position), `${chaser.id} off axis ${at}`).toBe(true)
  expect(isWalkable(MAZE, tile, { throughDoor }), `${chaser.id} in a wall ${at}`).toBe(true)
  if (chaser.status === 'active') expect(cellAt(MAZE, tile), `${chaser.id} active in the nest ${at}`).not.toBe('nest')
}

function playToTheEnd(seed: number): GameState {
  let state = createGame({ seed })
  while (state.phase.kind !== 'gameOver' && state.tickCount < ONE_HOUR) {
    const previous = state
    state = tick(state, autopilotInput(state)).state
    const at = `at tick ${state.tickCount} of seed ${seed}`
    expect(state.score, `score went down ${at}`).toBeGreaterThanOrEqual(previous.score)
    expect(state.lives).toBeGreaterThanOrEqual(0)
    expect(state.lives).toBeLessThanOrEqual(5)
    expect(isOnAxis(state.hero.position), `Mac off axis ${at}`).toBe(true)
    for (const chaser of state.chasers) checkChaser(chaser, at)
  }
  return state
}

describe('complete games played by the naive autopilot', () => {
  it('always reach the end while keeping the engine invariants', () => {
    for (let seed = 1; seed <= 10; seed++) {
      expect(playToTheEnd(seed).phase.kind, `seed ${seed}`).toBe('gameOver')
    }
  })

  it('replay to the very same end', () => {
    expect(playToTheEnd(3)).toEqual(playToTheEnd(3))
  })
})
