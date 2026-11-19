import { mount } from '@vue/test-utils'
import { afterEach, describe, expect, it } from 'vitest'
import ConfirmDialog from './ConfirmDialog.vue'
import PauseOverlay from './PauseOverlay.vue'
import ResumeCountdown from './ResumeCountdown.vue'

const press = (key: string) => window.dispatchEvent(new KeyboardEvent('keydown', { key, cancelable: true }))

const mounted: { unmount: () => void }[] = []
afterEach(() => {
  while (mounted.length) mounted.pop()!.unmount()
})

describe('PauseOverlay', () => {
  it('offers to resume or to quit the game', async () => {
    const wrapper = mount(PauseOverlay, { attachTo: document.body })
    mounted.push(wrapper)
    expect(wrapper.text()).toContain('Pause')
    await wrapper.get('[data-test="resume"]').trigger('click')
    press('Enter')
    expect(wrapper.emitted('resume')).toHaveLength(2)
  })

  it('asks for a confirmation before quitting', async () => {
    const wrapper = mount(PauseOverlay, { attachTo: document.body })
    mounted.push(wrapper)
    await wrapper.get('[data-test="quit"]').trigger('click')
    expect(wrapper.find('[data-test="confirm-dialog"]').exists()).toBe(true)
    await wrapper.get('[data-test="confirm"]').trigger('click')
    expect(wrapper.emitted('quit')).toHaveLength(1)
  })

  it('stays paused when the quit is cancelled', async () => {
    const wrapper = mount(PauseOverlay, { attachTo: document.body })
    mounted.push(wrapper)
    await wrapper.get('[data-test="quit"]').trigger('click')
    await wrapper.get('[data-test="cancel"]').trigger('click')
    expect(wrapper.find('[data-test="confirm-dialog"]').exists()).toBe(false)
    expect(wrapper.find('[data-test="pause-overlay"]').exists()).toBe(true)
    expect(wrapper.emitted('quit')).toBeUndefined()
  })

  it('does not resume on Enter while the confirmation is open', async () => {
    const wrapper = mount(PauseOverlay, { attachTo: document.body })
    mounted.push(wrapper)
    await wrapper.get('[data-test="quit"]').trigger('click')
    press('Enter')
    expect(wrapper.emitted('resume')).toBeUndefined()
    expect(wrapper.emitted('quit')).toHaveLength(1)
  })
})

describe('ConfirmDialog', () => {
  it('confirms with Enter and cancels with Escape', () => {
    const wrapper = mount(ConfirmDialog, { props: { title: 'Quitter ?', message: 'Sûr ?', confirmLabel: 'Quitter' }, attachTo: document.body })
    mounted.push(wrapper)
    press('Enter')
    press('Escape')
    expect(wrapper.emitted('confirm')).toHaveLength(1)
    expect(wrapper.emitted('cancel')).toHaveLength(1)
  })
})

describe('ResumeCountdown', () => {
  it('shows the current step', () => {
    const wrapper = mount(ResumeCountdown, { props: { value: 2 } })
    mounted.push(wrapper)
    expect(wrapper.text()).toBe('2')
  })
})
