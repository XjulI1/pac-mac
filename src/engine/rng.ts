/** Result of a draw: the value and the state to keep for the next draw. */
export type Draw<T> = { value: T; state: number }

/** Initial generator state for a seed. */
export function seedRng(seed: number): number {
  return seed >>> 0
}

/** Draws a number in [0, 1) with mulberry32. */
export function nextRandom(state: number): Draw<number> {
  const nextState = (state + 0x6d2b79f5) >>> 0
  let mixed = nextState
  mixed = Math.imul(mixed ^ (mixed >>> 15), mixed | 1)
  mixed ^= mixed + Math.imul(mixed ^ (mixed >>> 7), mixed | 61)
  const value = ((mixed ^ (mixed >>> 14)) >>> 0) / 4294967296
  return { value, state: nextState }
}

/** Draws an integer in [0, maxExclusive). */
export function randomInt(state: number, maxExclusive: number): Draw<number> {
  const draw = nextRandom(state)
  return { value: Math.floor(draw.value * maxExclusive), state: draw.state }
}

/** Draws one element of a non-empty list. */
export function randomChoice<T>(state: number, options: readonly T[]): Draw<T> {
  const draw = randomInt(state, options.length)
  const value = options[draw.value]
  if (value === undefined) throw new Error('randomChoice needs at least one option')
  return { value, state: draw.state }
}
