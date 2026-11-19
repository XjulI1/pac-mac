/** Points of a pellet. */
export const PELLET_POINTS = 10

/** Points of a prism. */
export const PRISM_POINTS = 50

/** Lives at the start of a game, the one in play included. */
export const STARTING_LIVES = 3

/** Most lives a player can hold. */
export const MAX_LIVES = 5

/** Score of the first extra life. */
export const FIRST_EXTRA_LIFE = 10_000

/** Points between two extra lives after the first one. */
export const EXTRA_LIFE_STEP = 25_000

/** Items eaten in a level when each bonus appears. */
export const BONUS_THRESHOLDS: readonly number[] = [70, 150]

/** Seconds a bonus stays visible. */
export const BONUS_SECONDS = 9

/** Seconds of « Prêt ? » at the start of a game. */
export const GAME_START_SECONDS = 4

/** Seconds of « Prêt ? » at the start of a level or after a lost life. */
export const LEVEL_START_SECONDS = 2

/** Seconds the maze flashes once a level is cleared. */
export const LEVEL_CLEAR_SECONDS = 2

/** Seconds a requested direction is remembered while Mac cannot take it. */
export const WANTED_DIRECTION_SECONDS = 0.5

/** Points of the first chaser caught in a surcharge; each next one is worth this much more. */
export const CAPTURE_POINTS_STEP = 200

/** Captures that make a full chain within one surcharge. */
export const FULL_CHAIN = 4

/** Extra points for a full chain. */
export const FULL_CHAIN_BONUS = 1000

/** Seconds the game freezes on a capture. */
export const CAPTURE_FREEZE_SECONDS = 0.5

/** Seconds the game freezes while Mac falls apart. */
export const DYING_SECONDS = 2
