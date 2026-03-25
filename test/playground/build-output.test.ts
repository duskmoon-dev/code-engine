import { describe, it, expect } from 'bun:test'
import { existsSync, readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'

const distDir = join(import.meta.dir, '../../playground/dist')
const hasBuilt = existsSync(join(distDir, 'index.html'))

function requireBuild(fn: () => void) {
  return () => {
    if (!hasBuilt) return // skip when playground hasn't been built
    fn()
  }
}

describe('playground build output', () => {
  it('dist directory exists (requires playground build)', requireBuild(() => {
    expect(existsSync(distDir)).toBe(true)
  }))

  it('all pages are generated', requireBuild(() => {
    const pages = ['index.html', '404.html', 'docs/index.html', 'playground/index.html']
    for (const page of pages) {
      expect(existsSync(join(distDir, page))).toBe(true)
    }
  }))

  it('favicon is copied to dist', requireBuild(() => {
    expect(existsSync(join(distDir, 'favicon.svg'))).toBe(true)
  }))

  it('robots.txt is copied to dist', requireBuild(() => {
    expect(existsSync(join(distDir, 'robots.txt'))).toBe(true)
  }))

  it('_astro directory contains language chunks', requireBuild(() => {
    const astroDir = join(distDir, '_astro')
    if (!existsSync(astroDir)) return
    const files = readdirSync(astroDir)
    const langChunks = files.filter(f => f.startsWith('lang-') && f.endsWith('.js'))
    // Should have chunks for dynamically-loaded languages (at least 15+)
    expect(langChunks.length).toBeGreaterThanOrEqual(15)
  }))

  it('homepage has correct base path links', requireBuild(() => {
    const html = readFileSync(join(distDir, 'index.html'), 'utf-8')
    expect(html).toContain('href="/code-engine/')
    expect(html).toContain('href="/code-engine/docs"')
    expect(html).toContain('href="/code-engine/playground"')
  }))

  it('homepage reads version from package.json', requireBuild(() => {
    const html = readFileSync(join(distDir, 'index.html'), 'utf-8')
    const pkg = JSON.parse(readFileSync(join(import.meta.dir, '../../package.json'), 'utf-8'))
    expect(html).toContain(`v${pkg.version}`)
  }))

  it('docs page contains all export categories', requireBuild(() => {
    const html = readFileSync(join(distDir, 'docs/index.html'), 'utf-8')
    const categories = ['Root', 'Core', 'Parser', 'Languages', 'Themes', 'Keymaps', 'Setup']
    for (const cat of categories) {
      expect(html).toContain(cat)
    }
  }))

  it('docs page contains npm and GitHub links', requireBuild(() => {
    const html = readFileSync(join(distDir, 'docs/index.html'), 'utf-8')
    expect(html).toContain('npmjs.com/package/@duskmoon-dev/code-engine')
    expect(html).toContain('github.com/duskmoon-dev/code-engine')
  }))

  it('playground page loads editor script', requireBuild(() => {
    const html = readFileSync(join(distDir, 'playground/index.html'), 'utf-8')
    expect(html).toContain('EditorDemo')
    expect(html).toContain('id="editor"')
    expect(html).toContain('id="lang-select"')
    expect(html).toContain('id="theme-select"')
  }))

  it('404 page has back-to-home link', requireBuild(() => {
    const html = readFileSync(join(distDir, '404.html'), 'utf-8')
    expect(html).toContain('/code-engine/')
    expect(html).toContain('404')
  }))

  it('no @codemirror or @lezer import statements leak into built JS', requireBuild(() => {
    const astroDir = join(distDir, '_astro')
    if (!existsSync(astroDir)) return
    const jsFiles = readdirSync(astroDir).filter(f => f.endsWith('.js'))
    // Check for actual import/from statements, not error message strings
    const importPattern = /from\s+["']@(?:codemirror|lezer)\//
    for (const file of jsFiles) {
      const content = readFileSync(join(astroDir, file), 'utf-8')
      expect(importPattern.test(content)).toBe(false)
    }
  }))

  it('all pages have meta theme-color', requireBuild(() => {
    const pages = ['index.html', '404.html', 'docs/index.html', 'playground/index.html']
    for (const page of pages) {
      const html = readFileSync(join(distDir, page), 'utf-8')
      expect(html).toContain('theme-color')
    }
  }))

  it('sitemap is generated', requireBuild(() => {
    expect(existsSync(join(distDir, 'sitemap-index.xml'))).toBe(true)
    const sitemap = readFileSync(join(distDir, 'sitemap-index.xml'), 'utf-8')
    expect(sitemap).toContain('duskmoon-dev.github.io')
  }))

  it('playground page has share and reset buttons', requireBuild(() => {
    const html = readFileSync(join(distDir, 'playground/index.html'), 'utf-8')
    expect(html).toContain('btn-share')
    expect(html).toContain('btn-reset')
  }))

  it('docs page has legacy language note', requireBuild(() => {
    const html = readFileSync(join(distDir, 'docs/index.html'), 'utf-8')
    expect(html).toContain('StreamLanguage.define')
  }))

  it('homepage has correct export count', requireBuild(() => {
    const html = readFileSync(join(distDir, 'index.html'), 'utf-8')
    expect(html).toContain('23 languages')
    expect(html).toContain('43 exports')
  }))

  it('playground has status bar', requireBuild(() => {
    const html = readFileSync(join(distDir, 'playground/index.html'), 'utf-8')
    expect(html).toContain('status-bar')
    expect(html).toContain('status-pos')
    expect(html).toContain('status-lang')
    expect(html).toContain('status-doc')
  }))

  it('docs and playground pages have specific meta descriptions', requireBuild(() => {
    const docs = readFileSync(join(distDir, 'docs/index.html'), 'utf-8')
    expect(docs).toContain('Full API reference')
    const playground = readFileSync(join(distDir, 'playground/index.html'), 'utf-8')
    expect(playground).toContain('Interactive code editor playground')
  }))

  it('playground has indent tabs control', requireBuild(() => {
    const html = readFileSync(join(distDir, 'playground/index.html'), 'utf-8')
    expect(html).toContain('ext-indent-tabs')
    expect(html).toContain('Use Tabs')
  }))

  it('playground has grouped controls with dividers', requireBuild(() => {
    const html = readFileSync(join(distDir, 'playground/index.html'), 'utf-8')
    expect(html).toContain('control-group')
    expect(html).toContain('divider')
    expect(html).toContain('aria-hidden="true"')
  }))

  it('playground has keyboard shortcuts dialog', requireBuild(() => {
    const html = readFileSync(join(distDir, 'playground/index.html'), 'utf-8')
    expect(html).toContain('shortcuts-dialog')
    expect(html).toContain('Keyboard Shortcuts')
    expect(html).toContain('Ctrl')
  }))

  it('docs page has export search/filter', requireBuild(() => {
    const html = readFileSync(join(distDir, 'docs/index.html'), 'utf-8')
    expect(html).toContain('export-search')
    expect(html).toContain('Filter exports')
  }))

  it('docs page has copy-import buttons', requireBuild(() => {
    const html = readFileSync(join(distDir, 'docs/index.html'), 'utf-8')
    expect(html).toContain('copy-import-btn')
  }))

  it('all pages have og:image meta tag', requireBuild(() => {
    const pages = ['index.html', 'docs/index.html', 'playground/index.html']
    for (const page of pages) {
      const html = readFileSync(join(distDir, page), 'utf-8')
      expect(html).toContain('og:image')
      expect(html).toContain('og-image.svg')
    }
  }))

  it('og-image.svg exists in dist', requireBuild(() => {
    expect(existsSync(join(distDir, 'og-image.svg'))).toBe(true)
  }))

  it('robots.txt references correct sitemap URL', requireBuild(() => {
    const robots = readFileSync(join(distDir, 'robots.txt'), 'utf-8')
    expect(robots).toContain('sitemap-index.xml')
    expect(robots).not.toContain('sitemap.xml\n')
  }))

  it('homepage has try-in-playground link', requireBuild(() => {
    const html = readFileSync(join(distDir, 'index.html'), 'utf-8')
    expect(html).toContain('Try in Playground')
    expect(html).toContain('/code-engine/playground')
  }))

  it('docs changelog renders links as anchors', requireBuild(() => {
    const html = readFileSync(join(distDir, 'docs/index.html'), 'utf-8')
    // The changelog contains a link to the playground
    expect(html).toContain('duskmoon-dev.github.io/code-engine')
  }))
})
