import { defineConfig, mergeConfig } from 'vitest/config'
import viteConfig from './vite.config.ts'

export default mergeConfig(
  viteConfig,
  defineConfig({
    test: {
      projects: [
        {
          extends: true,
          test: { name: 'engine', environment: 'node', include: ['src/engine/**/*.test.ts'] },
        },
        {
          extends: true,
          test: {
            name: 'render',
            environment: 'node',
            include: ['src/render/**/*.test.ts', 'src/loop/**/*.test.ts', 'src/format.test.ts'],
          },
        },
        {
          extends: true,
          test: {
            name: 'sound',
            environment: 'node',
            include: ['src/audio/**/*.test.ts', 'src/storage/**/*.test.ts', 'src/pwa/**/*.test.ts'],
            exclude: ['src/audio/useSound.test.ts'],
          },
        },
        {
          extends: true,
          test: {
            name: 'ui',
            environment: 'happy-dom',
            include: ['src/game/**/*.test.ts', 'src/ui/**/*.test.ts', 'src/audio/useSound.test.ts'],
          },
        },
      ],
    },
  }),
)
