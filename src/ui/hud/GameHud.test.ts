import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import GameHud from './GameHud.vue'

const hud = { score: 12_450, level: 3, reserveLives: 2, bonuses: ['crystal', 'ring'] as const }

describe('GameHud', () => {
  it('shows the formatted score and the level', () => {
    const wrapper = mount(GameHud, { props: { hud } })
    expect(wrapper.get('[data-test="score"]').text()).toBe('12 450')
    expect(wrapper.get('[data-test="level"]').text()).toBe('Niveau 3')
  })

  it('shows one icon per life in reserve', () => {
    const wrapper = mount(GameHud, { props: { hud } })
    expect(wrapper.findAll('[data-test="life"]')).toHaveLength(2)
  })

  it('shows the bonuses collected, oldest first', () => {
    const wrapper = mount(GameHud, { props: { hud } })
    expect(wrapper.findAll('[data-test="bonus-icon"]').map((icon) => icon.attributes('data-kind'))).toEqual([
      'crystal',
      'ring',
    ])
  })

  it('renders the actions and record slots', () => {
    const wrapper = mount(GameHud, {
      props: { hud },
      slots: { actions: '<span data-test="sound">son</span>', record: '<span data-test="record">Record</span>' },
    })
    expect(wrapper.find('[data-test="sound"]').exists()).toBe(true)
    expect(wrapper.find('[data-test="record"]').exists()).toBe(true)
  })

  it('asks for the pause from its button', async () => {
    const wrapper = mount(GameHud, { props: { hud } })
    await wrapper.get('[data-test="pause"]').trigger('click')
    expect(wrapper.emitted('pause')).toHaveLength(1)
  })
})
