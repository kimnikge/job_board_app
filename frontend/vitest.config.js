import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath } from 'url'
import path from 'path'

export default defineConfig({
  plugins: [vue()],
  test: {
    globals: true,
    environment: 'jsdom',
    watch: false,
    run: true,
    setupFiles: [
      './src/test/setup.js',
      './src/test/supabase-setup.js' // Добавляем настройку Supabase
    ],
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
    deps: {
      inline: ['@vue', '@vueuse', 'pinia']
    },
    coverage: {
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'src/test/',
      ]
    }
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  }
})
