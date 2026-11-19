/** Seed of a new game, drawn by the interface from the current time. */
export function createSeed(nowMs: number): number {
  return nowMs >>> 0
}
