const NARROW_NO_BREAK_SPACE = ' '

/** Writes a whole number with its thousands separated by a narrow no-break space, as in French. */
export function formatScore(value: number): string {
  return Math.trunc(value)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, NARROW_NO_BREAK_SPACE)
}
