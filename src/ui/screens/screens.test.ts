import { flushPromises, mount } from '@vue/test-utils'
import { afterEach, describe, expect, it } from 'vitest'
import App from '../../App.vue'
import GameOverScreen from './GameOverScreen.vue'
import HomeScreen from './HomeScreen.vue'

const press = (key: string) => window.dispatchEvent(new KeyboardEvent('keydown', { key, cancelable: true }))

const idleScheduler = { requestFrame: () => 1, cancelFrame: () => {}, now: () => 1_700_000_000_000 }

const mounted: { unmount: () => void }[] = []
afterEach(() => {
  while (mounted.length) mounted.pop()!.unmount()
})

describe('HomeScreen', () => {
  it('shows the name of the game, the play button and the help', () => {
    const wrapper = mount(HomeScreen)
    mounted.push(wrapper)
    expect(wrapper.text()).toContain('PacMac')
    expect(wrapper.get('[data-test="play"]').text()).toBe('Jouer')
    expect(wrapper.text()).toContain('Clavier : flèches, ZQSD ou WASD — P ou Échap : pause')
    expect(wrapper.text()).toContain("Au doigt : glissez dans la direction voulue, n'importe où sur le jeu")
  })

  it('starts a game from the button or with Enter', async () => {
    const wrapper = mount(HomeScreen, { attachTo: document.body })
    mounted.push(wrapper)
    await wrapper.get('[data-test="play"]').trigger('click')
    press('Enter')
    expect(wrapper.emitted('play')).toHaveLength(2)
  })
})

describe('switching screens', () => {
  it('shows the home screen first, then the game screen once playing', async () => {
    const wrapper = mount(App, { props: { sessionDeps: idleScheduler }, attachTo: document.body })
    mounted.push(wrapper)
    expect(wrapper.find('[data-test="home-screen"]').exists()).toBe(true)
    await wrapper.get('[data-test="play"]').trigger('click')
    await flushPromises()
    expect(wrapper.find('[data-test="game-screen"]').exists()).toBe(true)
    expect(wrapper.find('[data-test="hud"]').exists()).toBe(true)
    expect(wrapper.find('[data-test="home-screen"]').exists()).toBe(false)
  })

  it('pauses with P and comes back home after a confirmed quit', async () => {
    const wrapper = mount(App, { props: { sessionDeps: idleScheduler }, attachTo: document.body })
    mounted.push(wrapper)
    await wrapper.get('[data-test="play"]').trigger('click')
    press('p')
    await flushPromises()
    expect(wrapper.find('[data-test="pause-overlay"]').exists()).toBe(true)
    await wrapper.get('[data-test="quit"]').trigger('click')
    await wrapper.get('[data-test="confirm"]').trigger('click')
    await flushPromises()
    expect(wrapper.find('[data-test="home-screen"]').exists()).toBe(true)
  })
})

describe('GameOverScreen', () => {
  it('shows the end of the game with the score and the level reached', () => {
    const wrapper = mount(GameOverScreen, { props: { score: 12_450, level: 3 }, slots: { results: '<p data-test="results">top</p>' } })
    mounted.push(wrapper)
    expect(wrapper.text()).toContain('Partie terminée')
    expect(wrapper.get('[data-test="final-score"]').text()).toBe('12 450')
    expect(wrapper.get('[data-test="final-level"]').text()).toBe('Niveau atteint : 3')
    expect(wrapper.find('[data-test="results"]').exists()).toBe(true)
  })

  it('replays from its button or with Enter, and goes home from its button or with Escape', async () => {
    const wrapper = mount(GameOverScreen, { props: { score: 10, level: 1 }, attachTo: document.body })
    mounted.push(wrapper)
    await wrapper.get('[data-test="replay"]').trigger('click')
    press('Enter')
    await wrapper.get('[data-test="home"]').trigger('click')
    press('Escape')
    expect(wrapper.emitted('replay')).toHaveLength(2)
    expect(wrapper.emitted('home')).toHaveLength(2)
  })
})
