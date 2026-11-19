import { describe, expect, it } from 'vitest'
import { formatScore } from './format'

describe('formatScore', () => {
  it('separates thousands with a narrow no-break space', () => {
    expect([0, 400, 12_450, 1_234_567].map(formatScore)).toEqual(['0', '400', '12 450', '1 234 567'])
  })
})
