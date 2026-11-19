import { describe, expect, it } from 'vitest'
import { MAZE } from './maze/maze'
import { quarterOf } from './queries'
import { createGame } from './setup'
import { autopilotInput } from './testing/autopilot'
import { cautiousAutopilotInput } from './testing/cautiousAutopilot'
import { tick } from './tick'
import type { ChaserId, GameInput, GameState } from './types'
import { tileOfPoint } from './units'

const SEEDS = 50
const CAUTIOUS_LIMIT = 5 * 60 * 60

type Pilot = (state: GameState) => GameInput

function play(seed: number, pilot: Pilot, limit: number, onTick: (state: GameState) => void): GameState {
  let state = createGame({ seed })
  while (state.phase.kind !== 'gameOver' && state.tickCount < limit) {
    state = tick(state, pilot(state)).state
    onTick(state)
  }
  return state
}

const average = (values: readonly number[]) => values.reduce((sum, value) => sum + value, 0) / values.length

describe.runIf(process.env.PACMAC_CALIBRATION)('calibration', () => {
  it('reports how long the pilots survive and where the chasers roam', { timeout: 15 * 60 * 1000 }, () => {
    const naiveLives: number[] = []
    const cautiousLevels: number[] = []
    const roaming = new Map<ChaserId, Record<string, number>>()
    for (let seed = 1; seed <= SEEDS; seed++) {
      let playingTicks = 0
      play(seed, autopilotInput, Number.POSITIVE_INFINITY, (state) => {
        if (state.phase.kind === 'playing') playingTicks += 1
      })
      naiveLives.push(playingTicks / 3 / 60)
      const cautious = play(seed, cautiousAutopilotInput, CAUTIOUS_LIMIT, (state) => {
        for (const chaser of state.chasers) {
          if (chaser.status !== 'active') continue
          const quarter = quarterOf(tileOfPoint(chaser.position, MAZE.width)) ?? 'middle'
          const counts = roaming.get(chaser.id) ?? {}
          counts[quarter] = (counts[quarter] ?? 0) + 1
          roaming.set(chaser.id, counts)
        }
      })
      cautiousLevels.push(cautious.level)
    }
    console.log(`Naive autopilot: ${average(naiveLives).toFixed(1)} s of play per life on average`)
    console.log(
      `Cautious autopilot (5 min at most): level ${average(cautiousLevels).toFixed(2)} on average, ${Math.max(...cautiousLevels)} at best`,
    )
    for (const [id, counts] of roaming) {
      const total = Object.values(counts).reduce((sum, count) => sum + count, 0)
      const shares = Object.entries(counts)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([quarter, count]) => `${quarter} ${Math.round((100 * count) / total)} %`)
      console.log(`${id}: ${shares.join(', ')}`)
    }
    expect(naiveLives).toHaveLength(SEEDS)
  })
})
