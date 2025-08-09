import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'
import { visualizer } from 'rollup-plugin-visualizer'

export default defineConfig({
  plugins: [
    vue(),
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