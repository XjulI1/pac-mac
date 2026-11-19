import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import * as engine from '../engine'
import type { GameEvent, GameInput, GameState } from '../engine'
import { useGameSession } from './useGameSession'

const sent: GameInput[] = []
const tweaks: { phase?: GameState['phase']; extraEvents?: GameEvent[] } = {}

vi.mock('../engine', async (importOriginal) => {
  const actual = await importOriginal<typeof engine>()
  return {
    ...actual,
    tick: (state: GameState, input: GameInput) => {
      sent.push(input)
      const result = actual.tick(state, input)
      const phase = tweaks.phase ?? result.state.phase
      return { state: { ...result.state, phase }, events: [...result.events, ...(tweaks.extraEvents ?? [])] }
    },
  }
})

function fakeScheduler() {
  let pending: ((now: number) => void) | null = null
  let time = 0
  return {
    requestFrame: (callback: (now: number) => void) => {
      pending = callback
      return 1
    },
    cancelFrame: () => {
      pending = null
    },
    frames(count: number) {
      for (let index = 0; index < count; index++) {
        const callback = pending
        pending = null
        time += 1000 / 60
        callback?.(time)
      }
    },
    get pending() {
      return pending !== null
    },
  }
}

function setup(nowMs = 1_700_000_000_000) {
  const scheduler = fakeScheduler()
  const session = useGameSession({ ...scheduler, now: () => nowMs })
  return { scheduler, session }
}

beforeEach(() => {
  sent.length = 0
  delete tweaks.phase
  delete tweaks.extraEvents
  vi.useFakeTimers()
})

afterEach(() => {
  vi.useRealTimers()
})

describe('starting a game', () => {
  it('creates the game from a seed drawn from the time and starts playing', () => {
    const { session } = setup(1_700_000_000_000)
    session.start()
    expect(session.status.value).toBe('playing')
    expect(session.current()).toEqual(engine.createGame({ seed: 1_700_000_000_000 >>> 0 }))
  })

  it('changes the seed from one game to another', () => {
    const first = setup(1000).session
    const second = setup(2000).session
    first.start()
    second.start()
    expect(first.current()!.rngState).not.toBe(second.current()!.rngState)
  })
})

describe('directions', () => {
  it('sends a requested direction to the next tick only', () => {
    const { scheduler, session } = setup()
    session.start()
    scheduler.frames(1)
    session.requestDirection('up')
    scheduler.frames(2)
    expect(sent.map((input) => input.direction)).toEqual(['up', null])
  })

  it('keeps the last of two requests made between two ticks', () => {
    const { scheduler, session } = setup()
    session.start()
    scheduler.frames(1)
    session.requestDirection('up')
    session.requestDirection('left')
    scheduler.frames(1)
    expect(sent.map((input) => input.direction)).toEqual(['left'])
  })

  it('sends a held direction to every tick until released', () => {
    const { scheduler, session } = setup()
    session.start()
    scheduler.frames(1)
    session.holdDirection('down')
    scheduler.frames(3)
    session.holdDirection(null)
    scheduler.frames(1)
    expect(sent.map((input) => input.direction)).toEqual(['down', 'down', 'down', null])
  })
})

describe('subscribers', () => {
  it('receive the events of each frame with the state, in their order', () => {
    const { scheduler, session } = setup()
    const calls: string[] = []
    let eaten = false
    session.onEvents((events) => {
      calls.push('first')
      if (events.some((event) => event.type === 'pelletEaten')) eaten = true
    })
    session.onEvents(() => calls.push('second'))
    session.start()
    scheduler.frames(1)
    session.holdDirection('left')
    scheduler.frames(260)
    expect(eaten).toBe(true)
    expect(calls.slice(0, 2)).toEqual(['first', 'second'])
  })

  it('stop receiving once unsubscribed', () => {
    const { scheduler, session } = setup()
    const listener = vi.fn()
    const unsubscribe = session.onEvents(listener)
    session.start()
    scheduler.frames(2)
    unsubscribe()
    listener.mockClear()
    scheduler.frames(5)
    expect(listener).not.toHaveBeenCalled()
  })
})

describe('HUD', () => {
  it('collects the bonuses eaten', () => {
    const { scheduler, session } = setup()
    session.start()
    scheduler.frames(1)
    tweaks.extraEvents = [{ type: 'bonusEaten', kind: 'crystal', points: 100, tile: { col: 10, row: 13 } }]
    scheduler.frames(1)
    delete tweaks.extraEvents
    expect(session.hud.value?.bonuses).toEqual(['crystal'])
  })

  it('is not replaced when nothing shown changes', () => {
    const { scheduler, session } = setup()
    session.start()
    const before = session.hud.value
    scheduler.frames(61)
    expect(session.hud.value).toBe(before)
  })
})

describe('end of the game', () => {
  it('shows the end 1 500 ms after the game is over and stops the loop', () => {
    const { scheduler, session } = setup()
    session.start()
    scheduler.frames(1)
    tweaks.phase = { kind: 'gameOver' }
    scheduler.frames(1)
    vi.advanceTimersByTime(1499)
    expect(session.status.value).toBe('playing')
    vi.advanceTimersByTime(1)
    expect(session.status.value).toBe('over')
    expect(scheduler.pending).toBe(false)
  })

  it('goes back home and stops the loop on quit', () => {
    const { scheduler, session } = setup()
    session.start()
    session.quit()
    expect(session.status.value).toBe('home')
    expect(scheduler.pending).toBe(false)
  })
})

describe('pause', () => {
  it('stops the ticks', () => {
    const { scheduler, session } = setup()
    session.start()
    scheduler.frames(2)
    const ticks = session.current()!.tickCount
    session.pause()
    scheduler.frames(60)
    expect(session.status.value).toBe('paused')
    expect(session.current()!.tickCount).toBe(ticks)
  })

  it('is not possible at home nor once the game is over', () => {
    const { scheduler, session } = setup()
    session.pause()
    expect(session.status.value).toBe('home')
    session.start()
    scheduler.frames(1)
    tweaks.phase = { kind: 'gameOver' }
    scheduler.frames(1)
    session.pause()
    expect(session.status.value).toBe('playing')
    vi.advanceTimersByTime(1500)
    session.pause()
    expect(session.status.value).toBe('over')
  })

  it('counts down 3, 2, 1 without ticks, then plays on without catching up', () => {
    const { scheduler, session } = setup()
    session.start()
    scheduler.frames(2)
    session.pause()
    const ticks = session.current()!.tickCount
    session.resume()
    expect(session.status.value).toBe('resuming')
    expect(session.countdown.value).toBe(3)
    vi.advanceTimersByTime(500)
    expect(session.countdown.value).toBe(2)
    vi.advanceTimersByTime(500)
    expect(session.countdown.value).toBe(1)
    scheduler.frames(10)
    expect(session.current()!.tickCount).toBe(ticks)
    vi.advanceTimersByTime(500)
    expect(session.status.value).toBe('playing')
    expect(session.countdown.value).toBeNull()
    scheduler.frames(1)
    expect(session.current()!.tickCount).toBe(ticks)
    scheduler.frames(1)
    expect(session.current()!.tickCount).toBe(ticks + 1)
  })

  it('sends a direction asked during the countdown to the first tick', () => {
    const { scheduler, session } = setup()
    session.start()
    scheduler.frames(2)
    session.pause()
    session.resume()
    session.requestDirection('left')
    vi.advanceTimersByTime(1500)
    sent.length = 0
    scheduler.frames(2)
    expect(sent[0]?.direction).toBe('left')
  })

  it('cancels the countdown on a new pause', () => {
    const { session, scheduler } = setup()
    session.start()
    scheduler.frames(1)
    session.pause()
    session.resume()
    vi.advanceTimersByTime(600)
    session.togglePause()
    expect(session.status.value).toBe('paused')
    expect(session.countdown.value).toBeNull()
    vi.advanceTimersByTime(2000)
    expect(session.status.value).toBe('paused')
  })
})
