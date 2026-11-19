import { readonly, ref, type Ref } from 'vue'

/** Callbacks accepted by `registerSW` of `virtual:pwa-register` (the subset used here). */
export type RegisterOptions = {
  onNeedRefresh?: () => void
  onOfflineReady?: () => void
  onRegisterError?: (error: unknown) => void
}

/** Signature of `registerSW`: gives the function that activates the waiting version. */
export type RegisterServiceWorker = (options: RegisterOptions) => (reloadPage?: boolean) => Promise<void>

/** Whether a new version waits, and how to switch to it. */
export type UpdateState = {
  updateReady: Readonly<Ref<boolean>>
  applyUpdate: () => Promise<void>
}

/** Update state of the app; without registration (development, no service worker support) it never becomes ready. */
export function createUpdateState(register?: RegisterServiceWorker): UpdateState {
  const updateReady = ref(false)
  if (!register) return { updateReady: readonly(updateReady), applyUpdate: async () => {} }
  const updateServiceWorker = register({
    onNeedRefresh: () => {
      updateReady.value = true
    },
    onOfflineReady: () => {},
    onRegisterError: () => {},
  })
  return { updateReady: readonly(updateReady), applyUpdate: () => updateServiceWorker(true) }
}
