export type Direction = 'up' | 'right' | 'down' | 'left'

export type Point = { x: number; y: number }

export type Tile = { col: number; row: number }

export type Item = 'pellet' | 'prism' | null

export type BonusKind = 'crystal' | 'ring' | 'lightning' | 'moon' | 'crown' | 'diamond' | 'comet' | 'star'

export type Hero = {
  position: Point
  direction: Direction
  wantedDirection: Direction | null
  wantedTicksLeft: number
  moving: boolean
  carry: number
}

export type Bonus = { kind: BonusKind; points: number; ticksLeft: number }

export type ChaserId = 'hound' | 'cutter' | 'warden' | 'prowler'

export type ChaserStatus = 'inNest' | 'leaving' | 'active' | 'spark' | 'entering'

export type Chaser = {
  id: ChaserId
  position: Point
  direction: Direction
  carry: number
  status: ChaserStatus
  vulnerable: boolean
}

export type ModeKind = 'patrol' | 'chase'

export type Mode = { kind: ModeKind; step: number; ticksLeft: number | null }

export type Surcharge = { ticksLeft: number; chain: number }

export type NestCounters = { itemsEatenSinceRestart: number; ticksSinceLastItem: number }

export type Phase =
  | { kind: 'ready'; ticksLeft: number }
  | { kind: 'playing' }
  | { kind: 'levelClear'; ticksLeft: number }
  | { kind: 'chaserCaught'; ticksLeft: number; chaser: ChaserId; points: number }
  | { kind: 'dying'; ticksLeft: number; by: ChaserId }
  | { kind: 'gameOver' }

export type GameState = {
  rngState: number
  tickCount: number
  level: number
  score: number
  lives: number
  nextExtraLifeAt: number
  items: Item[]
  itemsLeft: number
  itemsEatenInLevel: number
  hero: Hero
  bonus: Bonus | null
  bonusesShown: number
  chasers: Chaser[]
  mode: Mode
  surcharge: Surcharge | null
  nest: NestCounters
  phase: Phase
}

export type GameInput = { direction: Direction | null }

export type GameEvent =
  | { type: 'pelletEaten'; tile: Tile }
  | { type: 'prismEaten'; tile: Tile }
  | { type: 'bonusAppeared'; kind: BonusKind }
  | { type: 'bonusEaten'; kind: BonusKind; points: number; tile: Tile }
  | { type: 'bonusExpired' }
  | { type: 'extraLife'; lives: number }
  | { type: 'levelCleared'; level: number }
  | { type: 'levelStarted'; level: number }
  | { type: 'chaserReleased'; chaser: ChaserId }
  | { type: 'modeChanged'; mode: ModeKind }
  | { type: 'surchargeStarted'; ticks: number }
  | { type: 'surchargeEnding' }
  | { type: 'surchargeEnded' }
  | { type: 'chaserCaught'; chaser: ChaserId; points: number; chainBonus: number; tile: Tile }
  | { type: 'chaserRevived'; chaser: ChaserId }
  | { type: 'heroCaught'; by: ChaserId }
  | { type: 'lifeLost'; livesLeft: number }
  | { type: 'gameOver'; score: number; level: number }

export type TickResult = { state: GameState; events: GameEvent[] }
