import { describe, expect, it } from 'vitest'
import { gameWith, runTicks } from './builders'

describe('gameWith', () => {
  it('places Mac in a tile, moving in a direction, with chosen items', () => {
    const state = gameWith({
      level: 2,
      hero: { tile: { col: 1, row: 25 }, direction: 'right' },
      clearItems: 'all',
      addItems: [{ tile: { col: 2, row: 1 }, item: 'pellet' }],
    })
    expect(state.phase).toEqual({ kind: 'playing' })
    expect(state.level).toBe(2)
    expect(state.hero.position).toEqual({ x: 180, y: 3060 })
    expect(state.hero.direction).toBe('right')
    expect(state.hero.moving).toBe(true)
    expect(state.itemsLeft).toBe(1)
  })
})

describe('runTicks', () => {
  it('applies the ticks and gathers their events', () => {
    const state = gameWith({ hero: { tile: { col: 1, row: 1 }, direction: 'right' }, clearItems: [{ col: 1, row: 1 }] })
    const result = runTicks(state, 10)
    expect(result.state.tickCount).toBe(10)
    expect(result.events.filter((event) => event.type === 'pelletEaten')).toHaveLength(1)
  })

  it('reads a list of inputs, then sends no direction', () => {
    const state = gameWith({ hero: { tile: { col: 1, row: 25 }, direction: 'right' } })
    const result = runTicks(state, 5, [{ direction: 'left' }])
    expect(result.state.hero.direction).toBe('left')
    expect(result.state.hero.wantedDirection).toBeNull()
  })
})
