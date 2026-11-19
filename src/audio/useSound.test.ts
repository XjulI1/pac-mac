import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { effectScope, nextTick, ref, type EffectScope } from 'vue'
import { createGame, type GameEvent } from '../engine'
import type { GameSession, SessionListener, SessionStatus } from '../game/useGameSession'
import { useSound, type SoundPlayer } from './useSound'

function fakeEngine() {
  return {
    unlock: vi.fn(),
    setMuted: vi.fn(),
    play: vi.fn(),
    suspend: vi.fn(),
    resume: vi.fn(),
    stopAll: vi.fn(),
  } satisfies SoundPlayer
}

function fakeSession() {
  const status = ref<SessionStatus>('home')
  const listeners: SessionListener[] = []
  const session = {
    status,
    onEvents: (listener: SessionListener) => {
      listeners.push(listener)
      return () => listeners.splice(listeners.indexOf(listener), 1)
    },
  }
  const emit = (events: GameEvent[]) => listeners.forEach((listener) => listener(events, createGame({ seed: 1 })))
  return { session: session as unknown as GameSession, status, emit, listeners }
}

const storage = new Map<string, string>()
let scope: EffectScope

beforeEach(() => {
  storage.clear()
  vi.stubGlobal('localStorage', {
    getItem: (key: string) => storage.get(key) ?? null,
    setItem: (key: string, value: string) => storage.set(key, value),
    removeItem: (key: string) => storage.delete(key),
  })
  scope = effectScope()
})

afterEach(() => {
  scope.stop()
  vi.unstubAllGlobals()
})

function setup() {
  const engine = fakeEngine()
  const fake = fakeSession()
  const controls = scope.run(() => useSound(fake.session, engine))!
  return { engine, controls, ...fake }
}

const key = (value: string, target: EventTarget = window) =>
  target.dispatchEvent(new KeyboardEvent('keydown', { key: value, bubbles: true, cancelable: true }))

describe('useSound', () => {
  it('applies the stored preference', () => {
    storage.set('pacmac:sound', '{"muted":true}')
    const { engine, controls } = setup()
    expect(engine.setMuted).toHaveBeenCalledWith(true)
    expect(controls.muted.value).toBe(true)
  })

  it('unlocks the audio on the first gesture only', () => {
    const { engine } = setup()
    window.dispatchEvent(new Event('pointerdown'))
    window.dispatchEvent(new Event('touchend'))
    expect(engine.unlock).toHaveBeenCalledTimes(1)
  })

  it('toggles the sound with M and keeps the choice', () => {
    const { engine, controls } = setup()
    key('m')
    expect(controls.muted.value).toBe(true)
    expect(engine.setMuted).toHaveBeenLastCalledWith(true)
    expect(storage.get('pacmac:sound')).toBe('{"muted":true}')
    key('M')
    expect(controls.muted.value).toBe(false)
  })

  it('ignores M typed in a text field', () => {
    const { controls } = setup()
    const input = document.createElement('input')
    document.body.append(input)
    key('m', input)
    expect(controls.muted.value).toBe(false)
    input.remove()
  })

  it('plays the sounds of the events of a frame', () => {
    const { engine, emit } = setup()
    emit([{ type: 'bonusAppeared', kind: 'ring' }])
    expect(engine.play).toHaveBeenCalledWith({ kind: 'play', sound: 'bonusAppear' })
  })

  it('plays the start jingle when a game is launched, not at the next level', async () => {
    const { engine, status, emit } = setup()
    status.value = 'playing'
    await nextTick()
    emit([{ type: 'levelStarted', level: 2 }])
    const jingles = engine.play.mock.calls.filter(([cue]) => cue.kind === 'play' && cue.sound === 'gameStart')
    expect(jingles).toHaveLength(1)
  })

  it('suspends the sound during a pause and resumes it after the countdown', async () => {
    const { engine, status } = setup()
    status.value = 'playing'
    await nextTick()
    engine.resume.mockClear()
    status.value = 'paused'
    await nextTick()
    expect(engine.suspend).toHaveBeenCalledTimes(1)
    status.value = 'resuming'
    await nextTick()
    expect(engine.resume).not.toHaveBeenCalled()
    status.value = 'playing'
    await nextTick()
    expect(engine.resume).toHaveBeenCalledTimes(1)
  })

  it('stops the ambience when going back home', async () => {
    const { engine, status } = setup()
    status.value = 'playing'
    await nextTick()
    status.value = 'home'
    await nextTick()
    expect(engine.stopAll).toHaveBeenCalled()
  })
})
