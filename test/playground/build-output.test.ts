import { describe, it, expect } from 'bun:test'
import { existsSync, readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'

const distDir = join(import.meta.dir, '../../playground/dist')

describe('playground build output', () => {
  it('dist directory exists', () => {
    expect(existsSync(distDir)).toBe(true)
  })

  it('all pages are generated', () => {
    const pages = ['index.html', '404.html', 'docs/index.html', 'playground/index.html']
    for (const page of pages) {
      expect(existsSync(join(distDir, page))).toBe(true)
    }
  })

  it('favicon is copied to dist', () => {
    expect(existsSync(join(distDir, 'favicon.svg'))).toBe(true)
  })

  it('robots.txt is copied to dist', () => {
    expect(existsSync(join(distDir, 'robots.txt'))).toBe(true)
  })

  it('_astro directory contains language chunks', () => {
    const astroDir = join(distDir, '_astro')
    if (!existsSync(astroDir)) return // skip if not built
    const files = readdirSync(astroDir)
    const langChunks = files.filter(f => f.startsWith('lang-') && f.endsWith('.js'))
    // Should have chunks for dynamically-loaded languages (at least 15+)
    expect(langChunks.length).toBeGreaterThanOrEqual(15)
  })

  it('homepage has correct base path links', () => {
    const html = readFileSync(join(distDir, 'index.html'), 'utf-8')
    expect(html).toContain('href="/code-engine/')
    expect(html).toContain('href="/code-engine/docs"')
    expect(html).toContain('href="/code-engine/playground"')
  })

  it('homepage reads version from package.json', () => {
    const html = readFileSync(join(distDir, 'index.html'), 'utf-8')
    const pkg = JSON.parse(readFileSync(join(import.meta.dir, '../../package.json'), 'utf-8'))
    expect(html).toContain(`v${pkg.version}`)
  })

  it('docs page contains all export categories', () => {
    const html = readFileSync(join(distDir, 'docs/index.html'), 'utf-8')
    const categories = ['Root', 'Core', 'Parser', 'Languages', 'Themes', 'Keymaps', 'Setup']
    for (const cat of categories) {
      expect(html).toContain(cat)
    }
  })

  it('docs page contains npm and GitHub links', () => {
    const html = readFileSync(join(distDir, 'docs/index.html'), 'utf-8')
    expect(html).toContain('npmjs.com/package/@duskmoon-dev/code-engine')
    expect(html).toContain('github.com/duskmoon-dev/code-engine')
  })

  it('playground page loads editor script', () => {
    const html = readFileSync(join(distDir, 'playground/index.html'), 'utf-8')
    expect(html).toContain('EditorDemo')
    expect(html).toContain('id="editor"')
    expect(html).toContain('id="lang-select"')
    expect(html).toContain('id="theme-select"')
  })

  it('404 page has back-to-home link', () => {
    const html = readFileSync(join(distDir, '404.html'), 'utf-8')
    expect(html).toContain('/code-engine/')
    expect(html).toContain('404')
  })

  it('no @codemirror or @lezer import statements leak into built JS', () => {
    const astroDir = join(distDir, '_astro')
    if (!existsSync(astroDir)) return
    const jsFiles = readdirSync(astroDir).filter(f => f.endsWith('.js'))
    // Check for actual import/from statements, not error message strings
    const importPattern = /from\s+["']@(?:codemirror|lezer)\//
    for (const file of jsFiles) {
      const content = readFileSync(join(astroDir, file), 'utf-8')
      expect(importPattern.test(content)).toBe(false)
    }
  })

  it('all pages have meta theme-color', () => {
    const pages = ['index.html', '404.html', 'docs/index.html', 'playground/index.html']
    for (const page of pages) {
      const html = readFileSync(join(distDir, page), 'utf-8')
      expect(html).toContain('theme-color')
    }
  })
})
