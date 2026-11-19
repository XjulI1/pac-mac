import { flushPromises, mount } from '@vue/test-utils'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createHighScores } from '../../storage/useHighScores'
import HudRecord from '../hud/HudRecord.vue'
import GameOverScreen from '../screens/GameOverScreen.vue'
import HighScoreResults from './HighScoreResults.vue'
import HomeHighScores from './HomeHighScores.vue'

const values = new Map<string, string>()
const line = (name: string, score: number, date = '2026-11-19T12:00:00.000Z') => ({ name, score, level: 2, date })
const press = (key: string, target: EventTarget = window) =>
  target.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true }))

const mounted: { unmount: () => void }[] = []

beforeEach(() => {
  values.clear()
  vi.stubGlobal('localStorage', {
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => values.set(key, value),
    removeItem: (key: string) => values.delete(key),
  })
})

afterEach(() => {
  while (mounted.length) mounted.pop()!.unmount()
  vi.unstubAllGlobals()
})

function withScores(lines: ReturnType<typeof line>[], lastName?: string) {
  values.set('pacmac:high-scores', JSON.stringify(lines))
  if (lastName) values.set('pacmac:last-name', JSON.stringify(lastName))
  return createHighScores()
}

describe('end of a game', () => {
  it('offers the last name typed when the score enters the table', () => {
    const highScores = withScores([line('Lou', 20_000)], 'Alex')
    const wrapper = mount(HighScoreResults, { props: { score: 12_340, level: 4, highScores } })
    mounted.push(wrapper)
    expect((wrapper.get('[data-test="name-input"]').element as HTMLInputElement).value).toBe('Alex')
    expect(wrapper.get('[data-test="entry-title"]').text()).toBe('Vous entrez dans le top 10')
  })

  it('announces a new record', () => {
    const highScores = withScores([line('Lou', 20_000)])
    const wrapper = mount(HighScoreResults, { props: { score: 25_000, level: 6, highScores } })
    mounted.push(wrapper)
    expect(wrapper.get('[data-test="entry-title"]').text()).toBe('Nouveau record !')
  })

  it('records with Enter and highlights the line of the player', async () => {
    const highScores = withScores([line('Lou', 20_000), line('Max', 5000)], 'Alex')
    const wrapper = mount(HighScoreResults, { props: { score: 12_340, level: 4, highScores }, attachTo: document.body })
    mounted.push(wrapper)
    await wrapper.get('[data-test="name-form"]').trigger('submit')
    const lines = wrapper.findAll('[data-test="score-line"]')
    const cells = lines.map((row) => row.findAll('td').map((cell) => cell.text()))
    expect(cells.map((row) => row[1])).toEqual(['Lou', 'Alex', 'Max'])
    expect(cells[1]![2]).toBe('12\u202f340')
    expect(cells[1]![3]).toBe('Niv. 4')
    expect(lines[1]!.attributes('data-highlight')).toBe('true')
    expect(highScores.lastName.value).toBe('Alex')
  })

  it('cannot record an empty name', async () => {
    const highScores = withScores([])
    const wrapper = mount(HighScoreResults, { props: { score: 300, level: 1, highScores } })
    mounted.push(wrapper)
    await wrapper.get('[data-test="name-input"]').setValue('   ')
    expect(wrapper.get('[data-test="save-score"]').attributes('disabled')).toBeDefined()
    await wrapper.get('[data-test="name-form"]').trigger('submit')
    expect(highScores.scores.value).toEqual([])
  })

  it('shows the table at once when the score does not enter it', () => {
    const highScores = withScores([])
    const wrapper = mount(HighScoreResults, { props: { score: 0, level: 1, highScores } })
    mounted.push(wrapper)
    expect(wrapper.find('[data-test="name-form"]').exists()).toBe(false)
    expect(wrapper.find('[data-test="no-scores"]').exists()).toBe(true)
  })

  it('keeps Enter in the name field away from the replay button', async () => {
    const wrapper = mount(GameOverScreen, {
      props: { score: 300, level: 1 },
      slots: { results: '<input data-test="field" />' },
      attachTo: document.body,
    })
    mounted.push(wrapper)
    press('Enter', wrapper.get('[data-test="field"]').element)
    expect(wrapper.emitted('replay')).toBeUndefined()
  })
})

describe('home screen table', () => {
  it('lists the scores in order with their date', () => {
    const highScores = withScores([line('A', 900), line('B', 800), line('C', 700)])
    const wrapper = mount(HomeHighScores, { props: { highScores } })
    mounted.push(wrapper)
    const lines = wrapper.findAll('[data-test="score-line"]')
    expect(lines).toHaveLength(3)
    expect(lines[0]!.text()).toContain('19/11/2026')
    expect(lines.map((row) => row.findAll('td')[1]!.text())).toEqual(['A', 'B', 'C'])
  })

  it('says so when there is no score, without the clear button', () => {
    const wrapper = mount(HomeHighScores, { props: { highScores: withScores([]) } })
    mounted.push(wrapper)
    expect(wrapper.text()).toContain("Aucun score pour l'instant")
    expect(wrapper.find('[data-test="clear-scores"]').exists()).toBe(false)
  })

  it('clears the scores once confirmed, keeping the last name', async () => {
    const highScores = withScores([line('A', 900)], 'Alex')
    const wrapper = mount(HomeHighScores, { props: { highScores }, attachTo: document.body })
    mounted.push(wrapper)
    await wrapper.get('[data-test="clear-scores"]').trigger('click')
    await wrapper.get('[data-test="confirm"]').trigger('click')
    await flushPromises()
    expect(highScores.scores.value).toEqual([])
    expect(values.get('pacmac:high-scores')).toBe('[]')
    expect(highScores.lastName.value).toBe('Alex')
  })

  it('keeps the scores when the clearing is cancelled', async () => {
    const highScores = withScores([line('A', 900)])
    const wrapper = mount(HomeHighScores, { props: { highScores }, attachTo: document.body })
    mounted.push(wrapper)
    await wrapper.get('[data-test="clear-scores"]').trigger('click')
    await wrapper.get('[data-test="cancel"]').trigger('click')
    expect(highScores.scores.value).toHaveLength(1)
  })

  it('warns when the browser blocks storage', () => {
    Object.defineProperty(globalThis, 'localStorage', {
      configurable: true,
      get() {
        throw new Error('SecurityError')
      },
    })
    const wrapper = mount(HomeHighScores, { props: { highScores: createHighScores() } })
    mounted.push(wrapper)
    expect(wrapper.get('[data-test="storage-warning"]').text()).toBe(
      "Votre navigateur bloque l'enregistrement : les scores ne seront pas conservés après la fermeture.",
    )
  })
})

describe('record in the HUD', () => {
  it('shows the best stored score until the game beats it', async () => {
    const wrapper = mount(HudRecord, { props: { best: 20_000, score: 3500 } })
    mounted.push(wrapper)
    expect(wrapper.text()).toBe('Record 20 000')
    await wrapper.setProps({ score: 20_040 })
    expect(wrapper.text()).toBe('Record 20 040')
  })

  it('shows 0 without any score', () => {
    const wrapper = mount(HudRecord, { props: { best: 0, score: 0 } })
    mounted.push(wrapper)
    expect(wrapper.text()).toBe('Record 0')
  })
})
