import { resolve } from 'path'
import { writeFileSync, readFileSync, existsSync } from 'fs'

// Плагин для автоматического добавления preload для критичных chunks
export function preloadPlugin() {
  return {
    name: 'preload-critical-chunks',
    generateBundle(options, bundle) {
      // Найти критичные chunks
      const criticalChunks = []
      
      Object.keys(bundle).forEach(fileName => {
        const chunk = bundle[fileName]
        if (chunk.type === 'chunk') {
          // Определяем критичные chunks
          if (fileName.includes('index') || 
              fileName.includes('vendor-vue') || 
              fileName.includes('layouts') ||
              fileName.includes('shared')) {
            criticalChunks.push(fileName)
          }
        }
      })

      // Создать preload теги
      const preloadTags = criticalChunks.map(fileName => {
        const extension = fileName.split('.').pop()
        const as = extension === 'css' ? 'style' : 'script'
        return `    <link rel="preload" href="/assets/${fileName}" as="${as}">`
      }).join('\n')

      // Обновить index.html
      const indexPath = resolve(process.cwd(), 'dist/index.html')
      if (existsSync(indexPath)) {
        let html = readFileSync(indexPath, 'utf-8')
        
        // Вставить preload теги после существующих
        html = html.replace(
          '    <!-- DNS prefetch для внешних ресурсов -->',
          `    <!-- Preload критических chunks -->\n${preloadTags}\n    <!-- DNS prefetch для внешних ресурсов -->`
        )
        
        writeFileSync(indexPath, html)
        console.log(`✓ Added preload tags for ${criticalChunks.length} critical chunks`)
      }
    }
  }
}
