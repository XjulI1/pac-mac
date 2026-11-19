import { describe, expect, it } from 'vitest'
import { DIRECTIONS } from '../directions'
import type { Tile } from '../types'
import { LAYOUT } from './layout'
import { MAZE, cellAt, isIntersection, isWalkable, neighbour, parseMaze, type Cell } from './maze'

const corridors = (): Tile[] => {
  const tiles: Tile[] = []
  for (let row = 0; row < MAZE.height; row++) {
    for (let col = 0; col < MAZE.width; col++) {
      if (isWalkable(MAZE, { col, row })) tiles.push({ col, row })
    }
  }
  return tiles
}

const countCells = (kind: Cell) => MAZE.cells.filter((cell) => cell === kind).length

describe('maze grid', () => {
  it('measures 21 columns by 27 rows', () => {
    expect(MAZE.width).toBe(21)
    expect(MAZE.height).toBe(27)
  })

  it('reads the reference cells', () => {
    const tiles: Tile[] = [
      { col: 0, row: 0 },
      { col: 1, row: 1 },
      { col: 1, row: 3 },
      { col: 7, row: 8 },
      { col: 10, row: 9 },
      { col: 9, row: 10 },
      { col: 10, row: 17 },
    ]
    expect(tiles.map((tile) => cellAt(MAZE, tile))).toEqual(['wall', 'pellet', 'prism', 'empty', 'door', 'nest', 'empty'])
  })

  it('rejects a row of the wrong length with its number', () => {
    const rows = [...LAYOUT]
    rows[5] = rows[5]!.slice(1)
    expect(() => parseMaze(rows)).toThrow(/row 5/)
  })

  it('rejects an unknown symbol with its row number', () => {
    const rows = [...LAYOUT]
    rows[2] = `x${rows[2]!.slice(1)}`
    expect(() => parseMaze(rows)).toThrow(/row 2/)
  })
})

describe('maze counts', () => {
  it('holds 215 pellets, 4 prisms, 256 corridors, one door and 6 nest cells', () => {
    expect(countCells('pellet')).toBe(215)
    expect(countCells('prism')).toBe(4)
    expect(corridors()).toHaveLength(256)
    expect(countCells('door')).toBe(1)
    expect(countCells('nest')).toBe(6)
  })
})

describe('maze invariants', () => {
  it('has no square of 2 by 2 corridor cells', () => {
    for (let row = 0; row < MAZE.height - 1; row++) {
      for (let col = 0; col < MAZE.width - 1; col++) {
        const square = [
          { col, row },
          { col: col + 1, row },
          { col, row: row + 1 },
          { col: col + 1, row: row + 1 },
        ]
        expect(square.every((tile) => isWalkable(MAZE, tile)), `square at (${col}, ${row})`).toBe(false)
      }
    }
  })

  it('has no dead end, tunnel included', () => {
    for (const tile of corridors()) {
      const open = DIRECTIONS.filter((direction) => isWalkable(MAZE, neighbour(MAZE, tile, direction)))
      expect(open.length, `exits of (${tile.col}, ${tile.row})`).toBeGreaterThanOrEqual(2)
    }
  })

  it('connects every corridor to the start of Mac', () => {
    const key = (tile: Tile) => `${tile.col},${tile.row}`
    const seen = new Set([key(MAZE.heroStart)])
    const queue: Tile[] = [MAZE.heroStart]
    for (let tile = queue.shift(); tile; tile = queue.shift()) {
      for (const direction of DIRECTIONS) {
        const next = neighbour(MAZE, tile, direction)
        if (next && isWalkable(MAZE, next) && !seen.has(key(next))) {
          seen.add(key(next))
          queue.push(next)
        }
      }
    }
    expect(seen.size).toBe(256)
  })

  it('is symmetric around column 10', () => {
    for (let row = 0; row < MAZE.height; row++) {
      for (let col = 0; col < MAZE.width; col++) {
        expect(cellAt(MAZE, { col, row }), `(${col}, ${row})`).toBe(cellAt(MAZE, { col: 20 - col, row }))
      }
    }
  })
})

describe('maze landmarks', () => {
  it('starts Mac at (10, 17) facing left', () => {
    expect(MAZE.heroStart).toEqual({ col: 10, row: 17 })
    expect(MAZE.heroStartDirection).toBe('left')
  })

  it('locates the door, the nest exit, the regeneration point and the bonus', () => {
    expect(MAZE.door).toEqual({ col: 10, row: 9 })
    expect(MAZE.nestExit).toEqual({ col: 10, row: 8 })
    expect(MAZE.regeneration).toEqual({ col: 10, row: 10 })
    expect(MAZE.bonusTile).toEqual({ col: 10, row: 13 })
  })

  it('lists the starting cells inside the nest', () => {
    expect(MAZE.nestStarts).toEqual([
      { col: 10, row: 11 },
      { col: 9, row: 11 },
      { col: 11, row: 11 },
    ])
    for (const tile of MAZE.nestStarts) expect(cellAt(MAZE, tile)).toBe('nest')
  })

  it('lists the 10 tunnel cells', () => {
    const columns = MAZE.tunnel.map((tile) => tile.col).sort((a, b) => a - b)
    expect(columns).toEqual([0, 1, 2, 3, 4, 16, 17, 18, 19, 20])
    expect(MAZE.tunnel.every((tile) => tile.row === 11)).toBe(true)
  })
})

describe('maze neighbourhood', () => {
  it('crosses the tunnel from one edge to the other', () => {
    expect(neighbour(MAZE, { col: 0, row: 11 }, 'left')).toEqual({ col: 20, row: 11 })
    expect(neighbour(MAZE, { col: 20, row: 11 }, 'right')).toEqual({ col: 0, row: 11 })
  })

  it('has no neighbour above the first row or below the last one', () => {
    expect(neighbour(MAZE, { col: 3, row: 0 }, 'up')).toBeNull()
    expect(neighbour(MAZE, { col: 3, row: 26 }, 'down')).toBeNull()
  })

  it('keeps the door closed unless asked to go through it', () => {
    const below = neighbour(MAZE, MAZE.nestExit, 'down')
    expect(isWalkable(MAZE, below)).toBe(false)
    expect(isWalkable(MAZE, below, { throughDoor: true })).toBe(true)
    expect(isWalkable(MAZE, MAZE.regeneration)).toBe(false)
    expect(isWalkable(MAZE, MAZE.regeneration, { throughDoor: true })).toBe(true)
  })

  it('recognises intersections', () => {
    expect(isIntersection(MAZE, { col: 5, row: 4 })).toBe(true)
    expect(isIntersection(MAZE, { col: 2, row: 1 })).toBe(false)
    expect(isIntersection(MAZE, { col: 10, row: 8 })).toBe(false)
  })
})
