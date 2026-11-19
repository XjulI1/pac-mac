import { describe, expect, it } from 'vitest'
import { MAZE } from '../engine'
import { offsetContour, simplifyContour, wallContours, wallEdges, type Corner } from './wallContours'

const key = (corner: Corner) => `${corner.x},${corner.y}`
const undirected = (from: Corner, to: Corner) => [key(from), key(to)].sort().join('|')

describe('wall edges', () => {
  it('finds 472 unit edges between walls and the rest of the grid', () => {
    expect(wallEdges(MAZE)).toHaveLength(472)
  })

  it('is symmetric around the vertical axis of the maze', () => {
    const edges = wallEdges(MAZE)
    const set = new Set(edges.map((edge) => undirected(edge.from, edge.to)))
    const mirrored = new Set(
      edges.map((edge) => undirected({ x: 21 - edge.from.x, y: edge.from.y }, { x: 21 - edge.to.x, y: edge.to.y })),
    )
    expect(mirrored).toEqual(set)
  })

  it('treats the door and the nest as non-walls', () => {
    const edges = wallEdges(MAZE).map((edge) => undirected(edge.from, edge.to))
    expect(edges).toContain(undirected({ x: 10, y: 9 }, { x: 10, y: 10 }))
    expect(edges).toContain(undirected({ x: 9, y: 11 }, { x: 9, y: 12 }))
  })
})

describe('wall contours', () => {
  const contours = wallContours(MAZE)

  it('chains the edges into 27 contours, 25 closed and 2 open', () => {
    expect(contours).toHaveLength(27)
    expect(contours.filter((contour) => contour.closed)).toHaveLength(25)
  })

  it('uses every edge exactly once', () => {
    const used = contours.flatMap((contour) => {
      const points = contour.closed ? [...contour.points, contour.points[0]!] : contour.points
      return points.slice(1).map((point, index) => undirected(points[index]!, point))
    })
    expect(used).toHaveLength(472)
    expect(new Set(used).size).toBe(472)
  })

  it('opens the two contours along the tunnel from edge to edge', () => {
    const open = contours
      .filter((contour) => !contour.closed)
      .map((contour) => [key(contour.points[0]!), key(contour.points.at(-1)!)])
    expect(open).toEqual(expect.arrayContaining([['21,11', '0,11'], ['0,12', '21,12']]))
  })

  it('simplifies a rectangular block to its four corners', () => {
    const block = contours.find((contour) => contour.points.some((point) => point.x === 2 && point.y === 2))!
    expect(block.closed).toBe(true)
    expect(block.points).toHaveLength(10)
    const corners = simplifyContour(block).points.map(key)
    expect(corners.sort()).toEqual(['2,2', '2,4', '5,2', '5,4'])
  })

  it('moves the corners of a contour into the wall', () => {
    const block = contours.find((contour) => contour.points.some((point) => point.x === 2 && point.y === 2))!
    const shifted = offsetContour(simplifyContour(block), 0.15).points.map((point) => [
      Math.round(point.x * 100) / 100,
      Math.round(point.y * 100) / 100,
    ])
    expect(shifted).toEqual(
      expect.arrayContaining([
        [2.15, 2.15],
        [4.85, 2.15],
        [4.85, 3.85],
        [2.15, 3.85],
      ]),
    )
    expect(shifted).toHaveLength(4)
  })
})
