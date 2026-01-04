import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    // Environnement de test
    environment: 'jsdom',

    // Setup files
    setupFiles: ['./src/tests/setup.js'],

    // Globals (optionnel, permet d'éviter les imports describe/it/expect)
    globals: true,

    // Coverage
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      exclude: [
        'node_modules/',
        'src/tests/',
        '**/*.config.js',
        '**/*.config.ts',
        '**/dist/',
        '**/build/',
        '**/.{idea,git,cache,output,temp}/',
        '**/{karma,rollup,webpack,vite,vitest,jest,ava,babel,nyc,cypress,tsup,build}.config.*',
      ],
      // Seuils de couverture
      thresholds: {
        lines: 70,
        functions: 70,
        branches: 70,
        statements: 70,
      },
    },

    // Inclure les tests
    include: ['src/**/*.{test,spec}.{js,jsx,ts,tsx}'],

    // Exclure
    exclude: [
      'node_modules',
      'dist',
      '.idea',
      '.git',
      '.cache',
      'build',
    ],

    // Timeout (ms)
    testTimeout: 10000,
  },

  // Resolve alias (pour imports @/)
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
