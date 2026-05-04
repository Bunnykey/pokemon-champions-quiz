import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ command }) => ({
  base: command === 'build' ? '/pokemon-champions-quiz/' : '/',
  plugins: [react()],
  build: {
    chunkSizeWarningLimit: 1800,
  },
  test: {
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
  },
}))
