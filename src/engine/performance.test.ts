import { describe, expect, it } from 'vitest'
import { createGame } from './setup'
import { autopilotInput } from './testing/autopilot'
import { tick } from './tick'

describe('performance', () => {
  it('simulates ten minutes of play with the chasers in less than 3 seconds', () => {
    let seed = 7
    let state = createGame({ seed })
    const start = performance.now()
    for (let index = 0; index < 36_000; index++) {
      if (state.phase.kind === 'gameOver') state = createGame({ seed: ++seed })
      state = tick(state, autopilotInput(state)).state
    }
    const elapsed = performance.now() - start
    expect(elapsed).toBeLessThan(3000)
  })
})
