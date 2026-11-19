import { describe, expect, it, vi } from 'vitest'
import type { GameEvent } from '../engine'
import { createGameLoop } from './gameLoop'

function fakeScheduler() {
  let pending: ((now: number) => void) | null = null
  let handle = 0
  return {
    requestFrame: vi.fn((callback: (now: number) => void) => {
      pending = callback
      handle += 1
      return handle
    }),
    cancelFrame: vi.fn(() => {
      pending = null
    }),
    frame(now: number) {
      const callback = pending
      pending = null
      callback?.(now)
    },
    get pending() {
      return pending !== null
    },
  }
}

const event = (level: number): GameEvent => ({ type: 'levelStarted', level })

describe('createGameLoop', () => {
  it('steps once per tick and hands the events of the frame over in one call', () => {
    const scheduler = fakeScheduler()
    const batches = [[event(1)], [event(2), event(3)]]
    const step = vi.fn(() => batches.shift() ?? [])
    const onEvents = vi.fn()
    const render = vi.fn()
    const loop = createGameLoop({ ...scheduler, step, render, onEvents })
    loop.start()
    scheduler.frame(0)
    scheduler.frame(2000 / 60)
    expect(step).toHaveBeenCalledTimes(2)
    expect(onEvents).toHaveBeenCalledTimes(1)
    expect(onEvents).toHaveBeenCalledWith([event(1), event(2), event(3)])
    expect(render).toHaveBeenCalledTimes(2)
    expect(render.mock.calls[1]![0]).toBeGreaterThanOrEqual(0)
  })

  it('requests no frame and steps no tick while paused', () => {
    const scheduler = fakeScheduler()
    const step = vi.fn(() => [])
    const loop = createGameLoop({ ...scheduler, step, render: vi.fn() })
    loop.start()
    scheduler.frame(0)
    loop.pause()
    for (let index = 1; index <= 60; index++) scheduler.frame((index * 1000) / 60)
    expect(step).not.toHaveBeenCalled()
    expect(scheduler.pending).toBe(false)
    expect(loop.paused).toBe(true)
  })

  it('resumes without catching up', () => {
    const scheduler = fakeScheduler()
    const step = vi.fn(() => [])
    const loop = createGameLoop({ ...scheduler, step, render: vi.fn() })
    loop.start()
    scheduler.frame(0)
    loop.pause()
    loop.resume()
    scheduler.frame(5000)
    expect(step).not.toHaveBeenCalled()
    scheduler.frame(5000 + 1000 / 60)
    expect(step).toHaveBeenCalledTimes(1)
  })

  it('cancels the requested frame when stopped', () => {
    const scheduler = fakeScheduler()
    const loop = createGameLoop({ ...scheduler, step: () => [], render: vi.fn() })
    loop.start()
    loop.stop()
    expect(scheduler.cancelFrame).toHaveBeenCalled()
    expect(scheduler.pending).toBe(false)
    expect(loop.running).toBe(false)
  })
})
