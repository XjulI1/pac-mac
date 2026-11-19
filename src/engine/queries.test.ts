import { describe, expect, it } from 'vitest'
import { currentLevelSettings, heroTile, itemAt, itemsLeftByQuarter } from './queries'
import { createGame } from './setup'
import { gameWith } from './testing/builders'

describe('queries', () => {
  it('finds the tile of Mac', () => {
    expect(heroTile(createGame({ seed: 1 }))).toEqual({ col: 10, row: 17 })
    expect(heroTile(gameWith({ hero: { position: { x: 239, y: 3060 } } }))).toEqual({ col: 1, row: 25 })
  })

  it('reads the item of a tile', () => {
    const state = createGame({ seed: 1 })
    expect(itemAt(state, { col: 1, row: 1 })).toBe('pellet')
    expect(itemAt(state, { col: 1, row: 3 })).toBe('prism')
    expect(itemAt(state, { col: 0, row: 0 })).toBeNull()
  })

  it('counts the items left in each quarter, ignoring the middle column', () => {
    expect(itemsLeftByQuarter(createGame({ seed: 1 }))).toEqual({
      topLeft: 43,
      topRight: 43,
      bottomLeft: 65,
      bottomRight: 65,
    })
    const eaten = gameWith({ clearItems: [{ col: 1, row: 25 }, { col: 10, row: 25 }] })
    expect(itemsLeftByQuarter(eaten)).toEqual({ topLeft: 43, topRight: 43, bottomLeft: 64, bottomRight: 65 })
  })

  it('gives the settings of the level being played', () => {
    expect(currentLevelSettings(gameWith({ level: 3 })).surchargeSeconds).toBe(5)
  })
})
