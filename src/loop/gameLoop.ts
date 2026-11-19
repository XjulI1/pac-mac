import type { GameEvent } from '../engine'
import { advanceClock, resetClock } from './fixedStep'

/** What a game loop needs: a frame scheduler, a tick, a renderer and an optional listener of events. */
export type GameLoopOptions = {
  requestFrame: (callback: (nowMs: number) => void) => number
  cancelFrame: (handle: number) => void
  step: () => GameEvent[]
  render: (alpha: number) => void
  onEvents?: (events: GameEvent[]) => void
}

/** A real-time loop that plays ticks of 1/60 s and draws one frame per screen refresh. */
export type GameLoop = {
  start(): void
  stop(): void
  pause(): void
  resume(): void
  readonly running: boolean
  readonly paused: boolean
}

/** Creates a loop driven by the given frame scheduler. */
export function createGameLoop(options: GameLoopOptions): GameLoop {
  let clock = resetClock()
  let handle: number | null = null
  let running = false
  let paused = false

  const schedule = () => {
    handle = options.requestFrame(frame)
  }

  const cancel = () => {
    if (handle !== null) options.cancelFrame(handle)
    handle = null
  }

  const frame = (nowMs: number) => {
    handle = null
    if (!running || paused) return
    const advance = advanceClock(clock, nowMs)
    clock = advance.clock
    const events: GameEvent[] = []
    for (let index = 0; index < advance.ticks; index++) events.push(...options.step())
    if (advance.ticks > 0) options.onEvents?.(events)
    options.render(advance.alpha)
    if (running && !paused) schedule()
  }

  return {
    start() {
      if (running) return
      running = true
      paused = false
      clock = resetClock()
      schedule()
    },
    stop() {
      running = false
      paused = false
      cancel()
    },
    pause() {
      if (!running || paused) return
      paused = true
      cancel()
    },
    resume() {
      if (!running || !paused) return
      paused = false
      clock = resetClock()
      schedule()
    },
    get running() {
      return running
    },
    get paused() {
      return paused
    },
  }
}
