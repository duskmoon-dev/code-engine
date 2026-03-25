import { defineConfig } from 'astro/config'
import sitemap from '@astrojs/sitemap'

export default defineConfig({
  output: 'static',
  site: 'https://duskmoon-dev.github.io',
  base: '/code-engine/',
  integrations: [sitemap()],
  vite: {
    build: {
      rollupOptions: {
        output: {
          manualChunks(id) {
            // Split each language pack into its own chunk
            const langMatch = id.match(/code-engine\/dist\/lang\/([^/]+)/)
            if (langMatch) return `lang-${langMatch[1]}`
          },
        },
      },
    },
  },
})
