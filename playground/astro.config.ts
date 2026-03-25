import { defineConfig } from 'astro/config'

export default defineConfig({
  output: 'static',
  base: '/code-engine',
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
