import js from '@eslint/js'
import { defineConfig } from 'eslint/config'
import pluginVue from 'eslint-plugin-vue'
import globals from 'globals'
import tseslint from 'typescript-eslint'

const engineMessage = 'The game engine must stay pure: no Vue, no browser API, no clock, no Math.random.'
const browserGlobals = ['window', 'document', 'localStorage', 'requestAnimationFrame']

export default defineConfig(
  { ignores: ['dist/', 'coverage/', 'tmp/'] },
  js.configs.recommended,
  tseslint.configs.recommended,
  pluginVue.configs['flat/recommended'],
  {
    languageOptions: {
      globals: { ...globals.browser, ...globals.node },
    },
  },
  {
    files: ['**/*.vue'],
    languageOptions: {
      parserOptions: { parser: tseslint.parser },
    },
  },
  {
    files: ['src/engine/**/*.ts'],
    rules: {
      'no-restricted-imports': [
        'error',
        { patterns: [{ group: ['vue', 'vue/*'], message: engineMessage }] },
      ],
      'no-restricted-globals': [
        'error',
        ...[...browserGlobals, 'performance'].map((name) => ({ name, message: engineMessage })),
      ],
      'no-restricted-properties': [
        'error',
        { object: 'Math', property: 'random', message: engineMessage },
        { object: 'Date', property: 'now', message: engineMessage },
      ],
    },
  },
  {
    files: ['src/render/**/*.ts', 'src/loop/fixedStep.ts', 'src/loop/gameLoop.ts'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            { group: ['vue', 'vue/*'], message: 'Only MazeCanvas.vue and useGameLoop.ts may depend on Vue.' },
          ],
        },
      ],
    },
  },
  {
    files: ['src/engine/**/performance.test.ts'],
    rules: {
      'no-restricted-globals': [
        'error',
        ...browserGlobals.map((name) => ({ name, message: engineMessage })),
      ],
    },
  },
)
