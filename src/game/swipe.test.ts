import { describe, expect, it } from 'vitest'
import { createSwipeTracker } from './swipe'

function swipe(points: readonly [number, number][]) {
  const tracker = createSwipeTracker({ threshold: 24 })
  const [first, ...rest] = points
  tracker.start(first![0], first![1])
  return rest.map(([x, y]) => tracker.move(x, y)).filter((direction) => direction !== null)
}

describe('swipe tracker', () => {
  it('gives a direction once the move reaches 24 px', () => {
    expect(swipe([[100, 100], [130, 105]])).toEqual(['right'])
  })

  it('gives nothing for a shorter move', () => {
    expect(swipe([[100, 100], [110, 100]])).toEqual([])
  })

  it('follows the dominant axis', () => {
    expect(swipe([[100, 100], [125, 120]])).toEqual(['right'])
    expect(swipe([[100, 100], [110, 70]])).toEqual(['up'])
  })

  it('prefers the horizontal axis on a tie', () => {
    expect(swipe([[100, 100], [124, 76]])).toEqual(['right'])
  })

  it('turns without lifting the finger', () => {
    expect(swipe([[100, 100], [130, 100], [130, 135]])).toEqual(['right', 'down'])
  })

  it('gives the same direction only once in a row', () => {
    expect(swipe([[100, 100], [130, 100], [170, 100]])).toEqual(['right'])
  })

  it('starts afresh after the end of a swipe', () => {
    const tracker = createSwipeTracker({ threshold: 24 })
    tracker.start(100, 100)
    expect(tracker.move(130, 100)).toBe('right')
    tracker.end()
    tracker.start(100, 100)
    expect(tracker.move(130, 100)).toBe('right')
  })

  it('gives nothing for a mere touch or a move without a start', () => {
    const tracker = createSwipeTracker({ threshold: 24 })
    expect(tracker.move(300, 300)).toBeNull()
    tracker.start(100, 100)
    expect(tracker.move(100, 100)).toBeNull()
  })
})
