import type { ManifestOptions } from 'vite-plugin-pwa'
import { THEME_BACKGROUND, THEME_COLOR } from '../theme.ts'

/** Web app manifest given to VitePWA, with relative addresses so that the app also installs under a sub-path. */
export const manifest: Partial<ManifestOptions> = {
  id: './',
  name: 'PacMac',
  short_name: 'PacMac',
  description: 'Jeu d’arcade néon : guidez Mac dans le labyrinthe, mangez les pastilles et semez les traqueurs.',
  lang: 'fr',
  dir: 'ltr',
  start_url: './',
  scope: './',
  display: 'standalone',
  orientation: 'portrait',
  background_color: THEME_BACKGROUND,
  theme_color: THEME_COLOR,
  icons: [
    { src: 'pwa-64x64.png', sizes: '64x64', type: 'image/png' },
    { src: 'pwa-192x192.png', sizes: '192x192', type: 'image/png' },
    { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png' },
    { src: 'maskable-icon-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
  ],
}
