import { cellAt, type Maze } from '../engine'

/** A corner of the grid, in tiles: (0, 0) is the top left corner of the maze. */
export type Corner = { x: number; y: number }

/** A unit edge between a wall and a non-wall cell, oriented so that the wall is on its right. */
export type Edge = { from: Corner; to: Corner }

/** A chain of corners along walls; an open one starts and ends on the left or right side of the grid. */
export type Contour = { points: Corner[]; closed: boolean }

type Grid = Pick<Maze, 'width' | 'height' | 'cells'>

/** Unit edges between walls and the rest of the grid; sides facing out of the grid give none. */
export function wallEdges(grid: Grid): Edge[] {
  const edges: Edge[] = []
  for (let row = 0; row < grid.height; row++) {
    for (let col = 0; col < grid.width; col++) {
      if (cellAt(grid, { col, row }) !== 'wall') continue
      if (isOpen(grid, col, row - 1)) edges.push(edge(col, row, col + 1, row))
      if (isOpen(grid, col + 1, row)) edges.push(edge(col + 1, row, col + 1, row + 1))
      if (isOpen(grid, col, row + 1)) edges.push(edge(col + 1, row + 1, col, row + 1))
      if (isOpen(grid, col - 1, row)) edges.push(edge(col, row + 1, col, row))
    }
  }
  return edges
}

/** Chains the wall edges into contours, open ones first, hugging the walls at shared corners. */
export function wallContours(grid: Grid): Contour[] {
  const edges = wallEdges(grid)
  const outgoing = new Map<string, Edge[]>()
  const incoming = new Set<string>()
  for (const item of edges) {
    outgoing.set(cornerKey(item.from), [...(outgoing.get(cornerKey(item.from)) ?? []), item])
    incoming.add(cornerKey(item.to))
  }
  const used = new Set<Edge>()
  const contours: Contour[] = []
  for (const item of edges) {
    if (!incoming.has(cornerKey(item.from)) && !used.has(item)) contours.push(follow(item, outgoing, used, false))
  }
  for (const item of edges) {
    if (!used.has(item)) contours.push(follow(item, outgoing, used, true))
  }
  return contours
}

/** Removes the corners where a contour goes straight on. */
export function simplifyContour(contour: Contour): Contour {
  const { points, closed } = contour
  const kept = points.filter((point, index) => {
    const previous = closed ? points[(index - 1 + points.length) % points.length] : points[index - 1]
    const next = closed ? points[(index + 1) % points.length] : points[index + 1]
    if (!previous || !next) return true
    const first = direction(previous, point)
    const second = direction(point, next)
    return first.x !== second.x || first.y !== second.y
  })
  return { points: kept, closed }
}

/** Moves every corner of a contour by `distance` tiles into the wall. */
export function offsetContour(contour: Contour, distance: number): Contour {
  const { points, closed } = contour
  const shifted = points.map((point, index) => {
    const previous = closed ? points[(index - 1 + points.length) % points.length] : points[index - 1]
    const next = closed ? points[(index + 1) % points.length] : points[index + 1]
    const normals = [previous && rightNormal(previous, point), next && rightNormal(point, next)].filter(
      (normal): normal is Corner => normal !== undefined,
    )
    const sum = normals.reduce((total, normal) => ({ x: total.x + normal.x, y: total.y + normal.y }), { x: 0, y: 0 })
    return { x: point.x + sum.x * distance, y: point.y + sum.y * distance }
  })
  return { points: shifted, closed }
}

function follow(start: Edge, outgoing: Map<string, Edge[]>, used: Set<Edge>, closed: boolean): Contour {
  const points: Corner[] = [start.from]
  let current = start
  used.add(current)
  for (;;) {
    if (closed && cornerKey(current.to) === cornerKey(start.from)) return { points, closed: true }
    points.push(current.to)
    const next = nextEdge(current, outgoing.get(cornerKey(current.to)) ?? [], used)
    if (!next) return { points, closed: false }
    used.add(next)
    current = next
  }
}

function nextEdge(current: Edge, candidates: readonly Edge[], used: Set<Edge>): Edge | undefined {
  const heading = direction(current.from, current.to)
  const preferences = [
    { x: -heading.y, y: heading.x },
    heading,
    { x: heading.y, y: -heading.x },
  ]
  for (const wanted of preferences) {
    const found = candidates.find((candidate) => {
      const step = direction(candidate.from, candidate.to)
      return !used.has(candidate) && step.x === wanted.x && step.y === wanted.y
    })
    if (found) return found
  }
  return undefined
}

function isOpen(grid: Grid, col: number, row: number): boolean {
  if (row < 0 || row >= grid.height || col < 0 || col >= grid.width) return false
  return cellAt(grid, { col, row }) !== 'wall'
}

function edge(x1: number, y1: number, x2: number, y2: number): Edge {
  return { from: { x: x1, y: y1 }, to: { x: x2, y: y2 } }
}

function direction(from: Corner, to: Corner): Corner {
  return { x: Math.sign(to.x - from.x), y: Math.sign(to.y - from.y) }
}

function rightNormal(from: Corner, to: Corner): Corner {
  const heading = direction(from, to)
  return { x: -heading.y, y: heading.x }
}

function cornerKey(corner: Corner): string {
  return `${corner.x},${corner.y}`
}
