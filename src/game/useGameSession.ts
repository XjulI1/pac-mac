import { getCurrentScope, onScopeDispose, readonly, ref, shallowRef, type Ref, type ShallowRef } from 'vue'
import { createGame, tick, type BonusKind, type Direction, type GameEvent, type GameState } from '../engine'
import { createGameLoop } from '../loop/gameLoop'
import { createEffects, recordEvents, updateTrails, visibleEffects } from '../render/effects'
import type { MazeRenderer } from '../render/mazeRenderer'
import { collectBonuses, hudOf, sameHud, type HudData } from './hud'
import { createSeed } from './seed'

/** Where the player is: home screen, playing, paused, counting down before resuming, or game over. */
export type SessionStatus = 'home' | 'playing' | 'paused' | 'resuming' | 'over'

/** Listener of the events of every frame, with the state after them. */
export type SessionListener = (events: GameEvent[], state: GameState) => void

/** A game being played, its loop, its pause and its subscribers. */
export type GameSession = {
  status: Readonly<Ref<SessionStatus>>
  hud: Readonly<ShallowRef<HudData | null>>
  countdown: Readonly<Ref<number | null>>
  start(): void
  requestDirection(direction: Direction): void
  holdDirection(direction: Direction | null): void
  pause(): void
  resume(): void
  togglePause(): void
  quit(): void
  attachRenderer(renderer: MazeRenderer | null): void
  onEvents(listener: SessionListener): () => void
  current(): GameState | null
}

/** Browser services a session relies on, replaceable in tests. */
export type SessionDeps = {
  requestFrame?: (callback: (nowMs: number) => void) => number
  cancelFrame?: (handle: number) => void
  now?: () => number
}

const GAME_OVER_DELAY_MS = 1500
const COUNTDOWN_STEP_MS = 500
const COUNTDOWN_START = 3

/** Creates the game session of the application. */
export function useGameSession(deps: SessionDeps = {}): GameSession {
  const status = ref<SessionStatus>('home')
  const hud = shallowRef<HudData | null>(null)
  const countdown = ref<number | null>(null)
  const listeners = new Set<SessionListener>()
  const now = deps.now ?? (() => Date.now())

  let state: GameState | null = null
  let previous: GameState | null = null
  let effects = createEffects()
  let bonuses: BonusKind[] = []
  let requested: Direction | null = null
  let held: Direction | null = null
  let renderer: MazeRenderer | null = null
  let countdownTimers: ReturnType<typeof setTimeout>[] = []
  let overTimer: ReturnType<typeof setTimeout> | null = null

  const loop = createGameLoop({
    requestFrame: deps.requestFrame ?? ((callback) => requestAnimationFrame(callback)),
    cancelFrame: deps.cancelFrame ?? ((handle) => cancelAnimationFrame(handle)),
    step,
    render,
    onEvents: publish,
  })

  function step(): GameEvent[] {
    if (!state) return []
    previous = state
    const result = tick(state, { direction: requested ?? held })
    requested = null
    state = result.state
    effects = updateTrails(recordEvents(effects, result.events, state), state)
    bonuses = collectBonuses(bonuses, result.events)
    refreshHud()
    watchGameOver()
    return result.events
  }

  function render(alpha: number) {
    if (!renderer || !state || !previous) return
    const visible = visibleEffects(effects, state.tickCount)
    effects = visible.effects
    renderer.render({ previous, current: state, alpha, texts: visible.texts, trails: effects.trails })
  }

  function publish(events: GameEvent[]) {
    if (!state) return
    for (const listener of listeners) listener(events, state)
  }

  function refreshHud() {
    if (!state) return
    const next = hudOf(state, bonuses)
    if (!sameHud(hud.value, next)) hud.value = next
  }

  function watchGameOver() {
    if (!state || state.phase.kind !== 'gameOver' || overTimer !== null) return
    overTimer = setTimeout(() => {
      overTimer = null
      loop.stop()
      status.value = 'over'
    }, GAME_OVER_DELAY_MS)
  }

  function clearTimers() {
    for (const timer of countdownTimers) clearTimeout(timer)
    countdownTimers = []
    countdown.value = null
    if (overTimer !== null) clearTimeout(overTimer)
    overTimer = null
  }

  function start() {
    clearTimers()
    loop.stop()
    state = createGame({ seed: createSeed(now()) })
    previous = state
    effects = createEffects()
    bonuses = []
    requested = null
    held = null
    hud.value = null
    refreshHud()
    status.value = 'playing'
    loop.start()
    render(0)
  }

  function pause() {
    if (status.value === 'resuming') {
      clearTimers()
      status.value = 'paused'
      return
    }
    if (status.value !== 'playing' || state?.phase.kind === 'gameOver') return
    loop.pause()
    status.value = 'paused'
  }

  function resume() {
    if (status.value !== 'paused') return
    status.value = 'resuming'
    countdown.value = COUNTDOWN_START
    for (let step = 1; step <= COUNTDOWN_START; step++) {
      countdownTimers.push(
        setTimeout(() => {
          if (step < COUNTDOWN_START) {
            countdown.value = COUNTDOWN_START - step
            return
          }
          countdownTimers = []
          countdown.value = null
          status.value = 'playing'
          loop.resume()
        }, step * COUNTDOWN_STEP_MS),
      )
    }
  }

  function togglePause() {
    if (status.value === 'playing' || status.value === 'resuming') pause()
    else if (status.value === 'paused') resume()
  }

  function quit() {
    clearTimers()
    loop.stop()
    requested = null
    held = null
    status.value = 'home'
  }

  if (getCurrentScope()) onScopeDispose(quit)

  return {
    status: readonly(status),
    hud,
    countdown: readonly(countdown),
    start,
    requestDirection(direction) {
      requested = direction
    },
    holdDirection(direction) {
      held = direction
    },
    pause,
    resume,
    togglePause,
    quit,
    attachRenderer(next) {
      renderer = next
      render(1)
    },
    onEvents(listener) {
      listeners.add(listener)
      return () => listeners.delete(listener)
    },
    current: () => state,
  }
}
