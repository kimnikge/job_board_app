import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'
import { visualizer } from 'rollup-plugin-visualizer'
import { preloadPlugin } from './plugins/preload.js'

export default defineConfig({
  plugins: [
    vue(),
    visualizer({
      filename: 'dist/stats.html',
      open: false,
      gzipSize: true,
      brotliSize: true,
    }),
    preloadPlugin()
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

          // Разделение по модулям
          if (id.includes('src/modules/auth')) {
            return 'module-auth'
          }
          if (id.includes('src/modules/companies')) {
            return 'module-companies'
          }
          if (id.includes('src/modules/jobs')) {
            return 'module-jobs'
          }
          if (id.includes('src/modules/resume')) {
            return 'module-resume'
          }
          if (id.includes('src/modules/profile')) {
            return 'module-profile'
          }
          if (id.includes('src/modules/otclik')) {
            return 'module-otclik'
          }
          if (id.includes('src/modules/urgent')) {
            return 'module-urgent'
          }
          if (id.includes('src/modules/home')) {
            return 'module-home'
          }
          if (id.includes('src/modules/user')) {
            return 'module-user'
          }

          // Layouts и shared
          if (id.includes('src/layouts')) {
            return 'layouts'
          }
          if (id.includes('src/shared')) {
            return 'shared'
          }
          if (id.includes('src/components')) {
            return 'components'
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
    port: 8080,
    host: '0.0.0.0',
    open: true
  }
})