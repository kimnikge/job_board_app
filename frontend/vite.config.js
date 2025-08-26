import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'
import { visualizer } from 'rollup-plugin-visualizer'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    vue(),
    VitePWA({
      registerType: 'autoUpdate',
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,jpg,jpeg,webp}'],
        cleanupOutdatedCaches: true,
        skipWaiting: true
      },
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'masked-icon.svg'],
      manifest: {
        name: 'Job Board Астана - Работа в общепите',
        short_name: 'JobBoard KZ',
        description: 'Поиск работы в ресторанах, кафе и заведениях общепита Астаны',
        theme_color: '#667eea',
        background_color: '#0a0a0a',
        display: 'standalone',
        orientation: 'portrait',
        scope: '/',
        start_url: '/',
        icons: [
          {
            src: '/images/icon-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: '/images/icon-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          },
          {
            src: '/images/icon-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      },
      devOptions: {
        enabled: true
      }
    }),
    visualizer({
      filename: 'dist/stats.html',
      open: false,
      gzipSize: true,
      brotliSize: true,
    })
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    }
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // Vendor библиотеки
          if (id.includes('node_modules')) {
            if (id.includes('vue')) {
              return 'vendor-vue'
            }
            if (id.includes('lucide')) {
              return 'vendor-ui'
            }
            if (id.includes('supabase')) {
              return 'vendor-supabase'
            }
            if (id.includes('axios')) {
              return 'vendor-utils'
            }
            return 'vendor-other'
          }

          // Логические группы (актуальная структура)
          if (id.includes('src/layouts')) {
            return 'layouts'
          }
          if (id.includes('src/components')) {
            return 'components'
          }
          if (id.includes('src/stores')) {
            return 'stores'
          }
          if (id.includes('src/services')) {
            return 'services'
          }
        }
      }
    },
    chunkSizeWarningLimit: 1000,
    // Дополнительные оптимизации
    cssCodeSplit: true,
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.info', 'console.debug', 'console.warn']
      }
    }
  },
  css: {
    postcss: {
      plugins: [
        require('autoprefixer')({
          overrideBrowserslist: ['> 1%', 'last 2 versions']
        })
      ]
    }
  },
  server: {
    port: 3000,
    host: 'localhost',
    open: true
  }
})