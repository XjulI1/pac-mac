/** Fixed step clock: where it started and how many ticks it has played since. */
export type Clock = { originMs: number | null; ticksDone: number }

const TICKS_PER_SECOND = 60
const MS_PER_TICK = 1000 / TICKS_PER_SECOND
const MAX_TICKS_PER_FRAME = 6
const EPSILON = 1e-6

/** A clock that will start on its next frame. */
export function resetClock(): Clock {
  return { originMs: null, ticksDone: 0 }
}

/** Ticks of 1/60 s to play at `nowMs`, and how far into the next tick the frame is (alpha in [0, 1)). */
export function advanceClock(clock: Clock, nowMs: number): { clock: Clock; ticks: number; alpha: number } {
  if (clock.originMs === null) return { clock: { originMs: nowMs, ticksDone: 0 }, ticks: 0, alpha: 0 }
  let originMs = clock.originMs
  let ticks = Math.floor((nowMs - originMs) / MS_PER_TICK + EPSILON) - clock.ticksDone
  if (ticks > MAX_TICKS_PER_FRAME) {
    originMs += (ticks - MAX_TICKS_PER_FRAME) * MS_PER_TICK
    ticks = MAX_TICKS_PER_FRAME
  }
  const ticksDone = clock.ticksDone + Math.max(0, ticks)
  const alpha = Math.min(Math.max((nowMs - originMs) / MS_PER_TICK - ticksDone, 0), 1 - EPSILON)
  return { clock: { originMs, ticksDone }, ticks: Math.max(0, ticks), alpha }
}
