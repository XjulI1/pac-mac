import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { SoundEngine } from './soundEngine'

function param() {
  return { value: 0, setValueAtTime: vi.fn(), linearRampToValueAtTime: vi.fn(), exponentialRampToValueAtTime: vi.fn() }
}

function fakeContext() {
  const context = {
    currentTime: 0,
    state: 'suspended' as AudioContextState,
    destination: {},
    oscillators: [] as { start: ReturnType<typeof vi.fn> }[],
    gains: [] as { gain: ReturnType<typeof param> }[],
    resume: vi.fn(async () => {
      context.state = 'running'
    }),
    suspend: vi.fn(async () => {
      context.state = 'suspended'
    }),
    createOscillator() {
      const oscillator = { type: '', frequency: param(), detune: param(), connect: vi.fn(), start: vi.fn(), stop: vi.fn() }
      context.oscillators.push(oscillator)
      return oscillator
    },
    createGain() {
      const gain = { gain: param(), connect: vi.fn() }
      context.gains.push(gain)
      return gain
    },
    createBiquadFilter() {
      return { type: '', frequency: param(), connect: vi.fn() }
    },
  }
  return context
}

function engineWith() {
  const context = fakeContext()
  const engine = new SoundEngine(() => context as unknown as AudioContext)
  return { engine, context }
}

beforeEach(() => {
  vi.useFakeTimers()
})

afterEach(() => {
  vi.useRealTimers()
})

describe('SoundEngine', () => {
  it('plays nothing before the first unlock', () => {
    const { engine, context } = engineWith()
    engine.play({ kind: 'play', sound: 'bonusEaten' })
    expect(context.oscillators).toHaveLength(0)
  })

  it('creates the context on the first unlock and resumes it when suspended', () => {
    const factory = vi.fn(() => fakeContext() as unknown as AudioContext)
    const engine = new SoundEngine(factory)
    engine.unlock()
    engine.unlock()
    expect(factory).toHaveBeenCalledTimes(1)
    expect((factory.mock.results[0]!.value as ReturnType<typeof fakeContext>).resume).toHaveBeenCalled()
  })

  it('stays silent without Web Audio', () => {
    const engine = new SoundEngine(() => null)
    expect(() => {
      engine.unlock()
      engine.play({ kind: 'play', sound: 'gameStart' })
      engine.play({ kind: 'ambience', action: 'start' })
      engine.suspend()
      engine.resume()
    }).not.toThrow()
  })

  it('sets the master gain to 0 when muted', () => {
    const { engine, context } = engineWith()
    engine.unlock()
    engine.setMuted(true)
    expect(context.gains[0]!.gain.value).toBe(0)
    engine.setMuted(false)
    expect(context.gains[0]!.gain.value).toBe(1)
  })

  it('creates one oscillator per note of a sound', () => {
    const { engine, context } = engineWith()
    engine.unlock()
    engine.play({ kind: 'play', sound: 'bonusEaten' })
    expect(context.oscillators).toHaveLength(3)
  })

  it('plays the start jingle, both voices', () => {
    const { engine, context } = engineWith()
    engine.unlock()
    engine.play({ kind: 'play', sound: 'gameStart' })
    expect(context.oscillators).toHaveLength(16)
  })

  it('schedules the ambience until it is stopped', () => {
    const { engine, context } = engineWith()
    engine.unlock()
    engine.play({ kind: 'ambience', action: 'start' })
    const scheduled = context.oscillators.length
    expect(scheduled).toBeGreaterThan(0)
    context.currentTime = 0.5
    vi.advanceTimersByTime(25)
    expect(context.oscillators.length).toBeGreaterThan(scheduled)
    engine.play({ kind: 'ambience', action: 'stop' })
    const stopped = context.oscillators.length
    context.currentTime = 1
    vi.advanceTimersByTime(100)
    expect(context.oscillators).toHaveLength(stopped)
  })

  it('keeps the ambience going while muted, so that it is heard again once unmuted', () => {
    const { engine, context } = engineWith()
    engine.unlock()
    engine.play({ kind: 'ambience', action: 'start' })
    engine.setMuted(true)
    const before = context.oscillators.length
    context.currentTime = 0.5
    vi.advanceTimersByTime(25)
    expect(context.oscillators.length).toBeGreaterThan(before)
    engine.setMuted(false)
    expect(context.gains[0]!.gain.value).toBe(1)
  })

  it('suspends and resumes the context', async () => {
    const { engine, context } = engineWith()
    engine.unlock()
    await Promise.resolve()
    engine.suspend()
    expect(context.suspend).toHaveBeenCalled()
    await Promise.resolve()
    engine.resume()
    expect(context.resume).toHaveBeenCalledTimes(2)
  })
})
