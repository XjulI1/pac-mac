/** One line of the high score table. */
export type HighScore = { name: string; score: number; level: number; date: string }

/** Lines kept in the table. */
export const MAX_HIGH_SCORES = 10

/** Longest name a player can give. */
export const MAX_NAME_LENGTH = 10

/** Whether a final score enters the table: positive, and the table not full or its last score beaten. */
export function qualifies(scores: readonly HighScore[], score: number): boolean {
  if (score <= 0) return false
  if (scores.length < MAX_HIGH_SCORES) return true
  return score > (scores[MAX_HIGH_SCORES - 1]?.score ?? 0)
}

/** Inserts an entry under the equal scores, keeps ten lines, and gives its rank (0 to 9) or null. */
export function insertHighScore(scores: readonly HighScore[], entry: HighScore): { scores: HighScore[]; rank: number | null } {
  const index = scores.findIndex((existing) => existing.score < entry.score)
  const position = index === -1 ? scores.length : index
  const next = [...scores.slice(0, position), entry, ...scores.slice(position)].slice(0, MAX_HIGH_SCORES)
  return { scores: next, rank: position < MAX_HIGH_SCORES ? position : null }
}

/** A name without leading or trailing spaces, cut to ten characters. */
export function normalizeName(name: string): string {
  return name.trim().slice(0, MAX_NAME_LENGTH).trim()
}

/** The well-formed entries of a stored value, best first, ten at most; anything else gives an empty table. */
export function parseHighScores(value: unknown): HighScore[] {
  if (!Array.isArray(value)) return []
  return value
    .filter(isHighScore)
    .map(({ name, score, level, date }) => ({ name, score, level, date }))
    .sort((a, b) => b.score - a.score)
    .slice(0, MAX_HIGH_SCORES)
}

/** A date of the table in the short French format, such as 19/11/2026. */
export function formatDate(iso: string): string {
  const date = new Date(iso)
  const day = String(date.getDate()).padStart(2, '0')
  const month = String(date.getMonth() + 1).padStart(2, '0')
  return `${day}/${month}/${date.getFullYear()}`
}

function isHighScore(value: unknown): value is HighScore {
  if (typeof value !== 'object' || value === null) return false
  const entry = value as Record<string, unknown>
  return (
    typeof entry.name === 'string' &&
    entry.name.length > 0 &&
    entry.name.length <= MAX_NAME_LENGTH &&
    isPositiveInteger(entry.score) &&
    isPositiveInteger(entry.level) &&
    typeof entry.date === 'string' &&
    !Number.isNaN(Date.parse(entry.date))
  )
}

function isPositiveInteger(value: unknown): value is number {
  return typeof value === 'number' && Number.isInteger(value) && value >= 0
}
