import type { BonusKind, GameEvent, GameState } from '../engine'

/** What the HUD shows. */
export type HudData = { score: number; level: number; reserveLives: number; bonuses: readonly BonusKind[] }

const SHOWN_BONUSES = 7

/** HUD data of a game: lives in reserve leave out the one in play. */
export function hudOf(state: GameState, bonuses: readonly BonusKind[]): HudData {
  return {
    score: state.score,
    level: state.level,
    reserveLives: Math.max(0, state.lives - 1),
    bonuses: bonuses.slice(-SHOWN_BONUSES),
  }
}

/** Bonuses eaten so far, with those of new events, the last seven kept. */
export function collectBonuses(collected: readonly BonusKind[], events: readonly GameEvent[]): BonusKind[] {
  const eaten = events.flatMap((event) => (event.type === 'bonusEaten' ? [event.kind] : []))
  return [...collected, ...eaten].slice(-SHOWN_BONUSES)
}

/** Whether two HUD data show exactly the same thing. */
export function sameHud(a: HudData | null, b: HudData | null): boolean {
  if (!a || !b) return a === b
  return (
    a.score === b.score &&
    a.level === b.level &&
    a.reserveLives === b.reserveLives &&
    a.bonuses.length === b.bonuses.length &&
    a.bonuses.every((kind, index) => kind === b.bonuses[index])
  )
}
