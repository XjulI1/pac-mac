import { flushPromises, mount } from '@vue/test-utils'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { readonly, ref } from 'vue'
import App from '../../App.vue'
import HomeScreen from './HomeScreen.vue'

const mounted: { unmount: () => void }[] = []
afterEach(() => {
  while (mounted.length) mounted.pop()!.unmount()
})

describe('update banner', () => {
  it('shows « Nouvelle version disponible » with a reload button when an update is ready', async () => {
    const wrapper = mount(HomeScreen, { props: { updateReady: true } })
    mounted.push(wrapper)
    expect(wrapper.get('[data-test="update-banner"]').text()).toContain('Nouvelle version disponible')
    await wrapper.get('[data-test="reload"]').trigger('click')
    expect(wrapper.emitted('reload')).toHaveLength(1)
  })

  it('stays hidden without an update', () => {
    const wrapper = mount(HomeScreen)
    mounted.push(wrapper)
    expect(wrapper.find('[data-test="update-banner"]').exists()).toBe(false)
  })

  it('never shows during a game, and shows once back home', async () => {
    const updateReady = ref(false)
    const applyUpdate = vi.fn(async () => {})
    const wrapper = mount(App, {
      props: {
        sessionDeps: { requestFrame: () => 1, cancelFrame: () => {}, now: () => 1 },
        updates: { updateReady: readonly(updateReady), applyUpdate },
      },
      attachTo: document.body,
    })
    mounted.push(wrapper)
    await wrapper.get('[data-test="play"]').trigger('click')
    updateReady.value = true
    await flushPromises()
    expect(wrapper.find('[data-test="update-banner"]').exists()).toBe(false)
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'p', cancelable: true }))
    await flushPromises()
    expect(wrapper.find('[data-test="update-banner"]').exists()).toBe(false)
    await wrapper.get('[data-test="quit"]').trigger('click')
    await wrapper.get('[data-test="confirm"]').trigger('click')
    await flushPromises()
    await wrapper.get('[data-test="reload"]').trigger('click')
    expect(applyUpdate).toHaveBeenCalledOnce()
  })
})
