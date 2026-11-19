import { describe, expect, it } from 'vitest'
import type { BonusKind } from '../engine'
import { BONUS_COLORS, CHASER_COLORS, HERO_COLOR, VULNERABLE_COLOR, VULNERABLE_FLASH_COLOR, WALL_COLORS, wallColor } from './palette'

const BONUS_KINDS: BonusKind[] = ['crystal', 'ring', 'lightning', 'moon', 'crown', 'diamond', 'comet', 'star']

describe('palette', () => {
  it('gives Mac and the chasers the colors of docs/jeu.md', () => {
    expect(HERO_COLOR).toBe('#3df2ff')
    expect([CHASER_COLORS.hound, CHASER_COLORS.cutter, CHASER_COLORS.warden, CHASER_COLORS.prowler]).toEqual([
      '#ff3b5c',
      '#ff4fd8',
      '#ffa23b',
      '#4dff88',
    ])
  })

  it('gives the vulnerable chasers a dim grey and a white flash', () => {
    expect(VULNERABLE_COLOR).toBe('#6b7394')
    expect(VULNERABLE_FLASH_COLOR).toBe('#e8ecff')
  })

  it('cycles the wall color every four levels', () => {
    expect([1, 2, 3, 4, 5].map(wallColor)).toEqual(['#8b5cff', '#17b3a3', '#ffd84d', '#c3a6ff', '#8b5cff'])
  })

  it('keeps the wall colors apart from each other and from the characters', () => {
    const characters = [HERO_COLOR, ...Object.values(CHASER_COLORS)]
    expect(new Set(WALL_COLORS).size).toBe(4)
    for (const color of WALL_COLORS) expect(characters).not.toContain(color)
  })

  it('has a color for each kind of bonus', () => {
    for (const kind of BONUS_KINDS) expect(BONUS_COLORS[kind]).toMatch(/^#[0-9a-f]{6}$/)
  })
})
