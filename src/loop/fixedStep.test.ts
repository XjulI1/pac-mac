import { describe, expect, it } from 'vitest'
import { advanceClock, resetClock, type Clock } from './fixedStep'

function play(times: readonly number[], clock: Clock = resetClock()) {
  const results: { ticks: number; alpha: number }[] = []
  let current = clock
  for (const time of times) {
    const result = advanceClock(current, time)
    current = result.clock
    results.push({ ticks: result.ticks, alpha: result.alpha })
  }
  return { results, clock: current }
}

const frames = (count: number, hertz: number) => Array.from({ length: count }, (_, index) => (index * 1000) / hertz)

describe('advanceClock', () => {
  it('plays no tick on its first frame', () => {
    expect(advanceClock(resetClock(), 12_345).ticks).toBe(0)
  })

  it('plays one tick per frame at 60 Hz', () => {
    const { results } = play(frames(61, 60))
    expect(results[0]!.ticks).toBe(0)
    expect(results.slice(1).every((result) => result.ticks === 1)).toBe(true)
  })

  it('plays one tick every other frame at 120 Hz, with an alpha of 0.5 in between', () => {
    const { results } = play(frames(3, 120))
    expect(results.map((result) => result.ticks)).toEqual([0, 0, 1])
    expect(results[1]!.alpha).toBeCloseTo(0.5)
  })

  it('plays 60 ticks in one second at 144 Hz', () => {
    const { results } = play(frames(145, 144))
    expect(results.reduce((sum, result) => sum + result.ticks, 0)).toBe(60)
  })

  it('plays two ticks per frame at 30 Hz', () => {
    expect(play(frames(2, 30)).results[1]!.ticks).toBe(2)
  })

  it('plays at most 6 ticks per frame, then goes on normally', () => {
    const { results } = play([0, 1000 / 60, 1000 + 1000 / 60, 1000 + 2000 / 60])
    expect(results.map((result) => result.ticks)).toEqual([0, 1, 6, 1])
  })

  it('plays no tick on the first frame after a reset', () => {
    const { clock } = play([0, 1000 / 60])
    expect(advanceClock(resetClock(), 10_000).ticks).toBe(0)
    expect(clock.ticksDone).toBe(1)
  })
})
