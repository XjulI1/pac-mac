import type { Direction } from '../engine'

/** Turns the moves of a pointer into directions. */
export type SwipeTracker = {
  start(x: number, y: number): void
  move(x: number, y: number): Direction | null
  end(): void
}

/** Creates a tracker: a direction every `threshold` CSS pixels along the dominant axis. */
export function createSwipeTracker(options: { threshold: number }): SwipeTracker {
  let anchor: { x: number; y: number } | null = null
  let last: Direction | null = null
  return {
    start(x, y) {
      anchor = { x, y }
      last = null
    },
    move(x, y) {
      if (!anchor) return null
      const dx = x - anchor.x
      const dy = y - anchor.y
      if (Math.max(Math.abs(dx), Math.abs(dy)) < options.threshold) return null
      anchor = { x, y }
      const direction: Direction = Math.abs(dx) >= Math.abs(dy) ? (dx > 0 ? 'right' : 'left') : dy > 0 ? 'down' : 'up'
      if (direction === last) return null
      last = direction
      return direction
    },
    end() {
      anchor = null
      last = null
    },
  }
}
