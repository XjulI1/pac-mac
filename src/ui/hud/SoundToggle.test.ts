import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import SoundToggle from './SoundToggle.vue'

describe('SoundToggle', () => {
  it('offers to mute while the sound is on', () => {
    const wrapper = mount(SoundToggle, { props: { muted: false } })
    expect(wrapper.attributes('aria-label')).toBe('Couper le son')
    expect(wrapper.find('[data-test="sound-icon"]').exists()).toBe(true)
  })

  it('offers to unmute while the sound is off', () => {
    const wrapper = mount(SoundToggle, { props: { muted: true } })
    expect(wrapper.attributes('aria-label')).toBe('Rétablir le son')
    expect(wrapper.find('[data-test="muted-icon"]').exists()).toBe(true)
  })

  it('asks to toggle the sound when clicked', async () => {
    const wrapper = mount(SoundToggle, { props: { muted: false } })
    await wrapper.trigger('click')
    expect(wrapper.emitted('toggle')).toHaveLength(1)
  })
})
