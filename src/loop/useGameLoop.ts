import { onBeforeUnmount } from 'vue'
import { createGameLoop, type GameLoop, type GameLoopOptions } from './gameLoop'

/** A game loop on `requestAnimationFrame`, stopped when the component unmounts. */
export function useGameLoop(options: Omit<GameLoopOptions, 'requestFrame' | 'cancelFrame'>): GameLoop {
  const loop = createGameLoop({
    requestFrame: (callback) => requestAnimationFrame(callback),
    cancelFrame: (handle) => cancelAnimationFrame(handle),
    ...options,
  })
  onBeforeUnmount(() => loop.stop())
  return loop
}
