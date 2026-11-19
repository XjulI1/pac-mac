import { existsSync, readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import { THEME_BACKGROUND, THEME_COLOR } from '../theme'
import { manifest } from './manifest'

const root = fileURLToPath(new URL('../../', import.meta.url))
const read = (path: string) => readFileSync(`${root}${path}`, 'utf8')

describe('manifest', () => {
  it('names the app in French, standalone and in portrait', () => {
    expect(manifest).toMatchObject({
      name: 'PacMac',
      short_name: 'PacMac',
      lang: 'fr',
      display: 'standalone',
      orientation: 'portrait',
    })
  })

  it('uses relative addresses', () => {
    expect([manifest.start_url, manifest.scope, manifest.id]).toEqual(['./', './', './'])
  })

  it('takes its colors from the theme', () => {
    expect(manifest.background_color).toBe(THEME_BACKGROUND)
    expect(manifest.theme_color).toBe(THEME_COLOR)
  })

  it('declares 192 and 512 pixel icons, one of them maskable, all present in public/', () => {
    const icons = manifest.icons ?? []
    expect(icons.map((icon) => icon.sizes)).toEqual(expect.arrayContaining(['192x192', '512x512']))
    expect(icons.some((icon) => icon.purpose === 'maskable')).toBe(true)
    for (const icon of icons) expect(existsSync(`${root}public/${icon.src}`), icon.src).toBe(true)
  })
})

describe('theme colors', () => {
  it('match the variables of style.css and the theme-color of index.html', () => {
    expect(read('src/style.css')).toContain(`--color-night: ${THEME_BACKGROUND};`)
    expect(read('index.html')).toContain(`<meta name="theme-color" content="${THEME_COLOR}" />`)
  })
})
