import { registerSW } from 'virtual:pwa-register'
import { createApp } from 'vue'
import App from './App.vue'
import { createUpdateState } from './pwa/updateState'
import { neutralizeBlockedStorage } from './storage/localStore'
import './style.css'

neutralizeBlockedStorage()

const updates = createUpdateState(import.meta.env.PROD && 'serviceWorker' in navigator ? registerSW : undefined)

createApp(App, { updates }).mount('#app')
