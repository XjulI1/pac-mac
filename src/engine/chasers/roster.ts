import { MAZE } from '../maze/maze'
import type { Chaser, ChaserId, Tile } from '../types'
import { tileCenter } from '../units'

/** The four chasers, in the order they are stored and checked. */
export const CHASER_IDS: readonly ChaserId[] = ['hound', 'cutter', 'warden', 'prowler']

/** Order in which the chasers waiting in the nest come out. */
export const NEST_ORDER: readonly ChaserId[] = ['cutter', 'warden', 'prowler']

/** Corner each chaser aims at while patrolling, outside the maze. */
export const PATROL_CORNERS: Readonly<Record<ChaserId, Tile>> = {
  hound: { col: 20, row: -2 },
  cutter: { col: 0, row: -2 },
  warden: { col: 20, row: 28 },
  prowler: { col: 0, row: 28 },
}

/** Speed of a captured chaser going back to the nest, in tiles per second. */
export const SPARK_SPEED = 12

/** Speed factor of the Fureteur while it sees Mac. */
export const PROWLER_BOOST = 1.1

/** Distance, in tiles, under which the Gardien charges Mac. */
export const WARDEN_RANGE = 5

/** Most tiles the Coupeur looks ahead of Mac. */
export const CUTTER_LOOKAHEAD = 8

/** The chasers at the start of a level or after a lost life. */
export function startingChasers(): Chaser[] {
  const [cutterStart, wardenStart, prowlerStart] = MAZE.nestStarts
  if (!cutterStart || !wardenStart || !prowlerStart) throw new Error('The maze needs three starts inside the nest')
  return [
    { id: 'hound', position: tileCenter(MAZE.nestExit), direction: 'left', carry: 0, status: 'active', vulnerable: false },
    inNest('cutter', cutterStart),
    inNest('warden', wardenStart),
    inNest('prowler', prowlerStart),
  ]
}

function inNest(id: ChaserId, tile: Tile): Chaser {
  return { id, position: tileCenter(tile), direction: 'up', carry: 0, status: 'inNest', vulnerable: false }
}
