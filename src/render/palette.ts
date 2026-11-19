import type { BonusKind, ChaserId } from '../engine'

/** Background of the maze and of the page. */
export const BACKGROUND_COLOR = '#07060f'

/** Mac. */
export const HERO_COLOR = '#3df2ff'

/** Each chaser. */
export const CHASER_COLORS: Readonly<Record<ChaserId, string>> = {
  hound: '#ff3b5c',
  cutter: '#ff4fd8',
  warden: '#ffa23b',
  prowler: '#4dff88',
}

/** A vulnerable chaser, « néon éteint ». */
export const VULNERABLE_COLOR = '#6b7394'

/** A vulnerable chaser flickering at the end of a surcharge. */
export const VULNERABLE_FLASH_COLOR = '#e8ecff'

/** Spark of a captured chaser. */
export const SPARK_COLOR = '#ffffff'

/** Pellets. */
export const PELLET_COLOR = '#ffd9f2'

/** Core of the prisms. */
export const PRISM_COLOR = '#ffffff'

/** Nest door. */
export const DOOR_COLOR = '#ffc2e6'

/** « Prêt ? » and other texts drawn on the maze. */
export const TEXT_COLOR = '#ffffff'

/** Walls flashing at the end of a level. */
export const WALL_FLASH_COLOR = '#ffffff'

/** Wall colors, one per level, in a loop. */
export const WALL_COLORS: readonly string[] = ['#8b5cff', '#17b3a3', '#ffd84d', '#c3a6ff']

/** Each kind of bonus. */
export const BONUS_COLORS: Readonly<Record<BonusKind, string>> = {
  crystal: '#9ff4ff',
  ring: '#ffcf5c',
  lightning: '#fff35c',
  moon: '#f2e6c4',
  crown: '#ffb547',
  diamond: '#c9f3ff',
  comet: '#ff8a5c',
  star: '#fff7a8',
}

/** Wall color of a level. */
export function wallColor(level: number): string {
  return WALL_COLORS[(level - 1) % WALL_COLORS.length] ?? WALL_COLORS[0]!
}
