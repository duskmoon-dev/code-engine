import { defineConfig } from 'astro/config'
import sitemap from '@astrojs/sitemap'
import { existsSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import type { Plugin } from 'vite'
import pkg from '../package.json'

const __dirname = dirname(fileURLToPath(import.meta.url))
const srcRoot = resolve(__dirname, '../src')

/**
 * Build a map from `@duskmoon-dev/code-engine/<subpath>` to the corresponding
 * source file under `src/`.  The package.json `exports` field maps subpaths to
 * `dist/` outputs — we reverse that to `src/` and swap `.js` → `.ts`.
 */
function buildAliasMap(): Record<string, string> {
  const aliases: Record<string, string> = {}
  for (const [subpath, entry] of Object.entries(pkg.exports)) {
    if (subpath.includes('*')) continue // skip wildcard exports
    const specifier = `@duskmoon-dev/code-engine${subpath === '.' ? '' : `/${subpath.slice(2)}`}`
    const distPath = (entry as { import: string }).import // e.g. "./dist/core/state/index.js"
    // dist/core/state/index.js → src/core/state/index.ts
    const srcPath = distPath.replace(/^\.\/dist\//, '').replace(/\.js$/, '.ts')
    const resolved = resolve(srcRoot, srcPath)
    // Some files live directly under src/ (e.g. src/setup.ts) while others
    // are directories with index.ts.  Try the exact path first, then without
    // the /index.ts suffix, to find what actually exists.
    if (existsSync(resolved)) {
      aliases[specifier] = resolved
    } else {
      // e.g. src/setup.ts exists but we computed src/setup/index.ts — try parent
      const alt = resolved.replace(/\/index\.ts$/, '.ts')
      if (existsSync(alt)) aliases[specifier] = alt
    }
  }
  return aliases
}

/**
 * Vite plugin that resolves `@duskmoon-dev/code-engine/*` imports to the local
 * source tree so the playground always uses the current working tree.
 */
function codeEngineSourcePlugin(): Plugin {
  const aliases = buildAliasMap()
  return {
    name: 'code-engine-source-alias',
    enforce: 'pre',
    resolveId(source) {
      if (aliases[source]) return aliases[source]
      return null
    },
  }
}

export default defineConfig({
  output: 'static',
  site: 'https://duskmoon-dev.github.io',
  base: '/code-engine/',
  integrations: [sitemap()],
  vite: {
    plugins: [codeEngineSourcePlugin()],
    resolve: {
      // .grammar.js files use bare relative imports (e.g. '../html') that
      // resolve to TypeScript index files — ensure Vite tries .ts before .js
      extensions: ['.mjs', '.js', '.mts', '.ts', '.jsx', '.tsx', '.json'],
    },
    build: {
      rollupOptions: {
        output: {
          manualChunks(id) {
            // Split each language pack into its own chunk
            const langMatch = id.match(/code-engine\/src\/lang\/([^/]+)/)
            if (langMatch) return `lang-${langMatch[1]}`
          },
        },
      },
    },
  },
})
