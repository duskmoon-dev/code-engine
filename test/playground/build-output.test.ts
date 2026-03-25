import { describe, it, expect } from 'bun:test'
import { existsSync, readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'

const distDir = join(import.meta.dir, '../../playground/dist')
const hasBuilt = existsSync(join(distDir, 'index.html'))
if (!hasBuilt) {
  console.warn('⚠ playground/dist not found — skipping build-output tests (run: cd playground && bun run build)')
}
const pkgPath = join(import.meta.dir, '../../package.json')
const pkg = JSON.parse(readFileSync(pkgPath, 'utf-8'))
const exportKeys = Object.keys(pkg.exports)
const exportCount = exportKeys.length
const langCount = exportKeys.filter((k: string) => k.startsWith('./lang/') && !k.includes('*')).length

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
    expect(html).toContain(`${langCount} language packs`)
    expect(html).toContain(`${exportCount} Subpath Exports`)
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

  it('homepage has feature highlights section', requireBuild(() => {
    const html = readFileSync(join(distDir, 'index.html'), 'utf-8')
    expect(html).toContain(`${exportCount} Subpath Exports`)
    expect(html).toContain(`${langCount} Languages`)
    expect(html).toContain('Single Package')
  }))

  it('all pages have JSON-LD structured data', requireBuild(() => {
    const pages = ['index.html', 'docs/index.html', 'playground/index.html']
    for (const page of pages) {
      const html = readFileSync(join(distDir, page), 'utf-8')
      expect(html).toContain('application/ld+json')
      expect(html).toContain('SoftwareSourceCode')
    }
  }))

  it('404 page has navigation links', requireBuild(() => {
    const html = readFileSync(join(distDir, '404.html'), 'utf-8')
    expect(html).toContain('API Docs')
    expect(html).toContain('Playground')
    expect(html).toContain('/code-engine/docs')
    expect(html).toContain('/code-engine/playground')
  }))

  it('playground has copy code button', requireBuild(() => {
    const html = readFileSync(join(distDir, 'playground/index.html'), 'utf-8')
    expect(html).toContain('btn-copy')
    expect(html).toContain('Copy code to clipboard')
  }))

  it('playground has noscript fallback', requireBuild(() => {
    const html = readFileSync(join(distDir, 'playground/index.html'), 'utf-8')
    expect(html).toContain('<noscript>')
    expect(html).toContain('JavaScript is required')
  }))

  it('playground has font size controls', requireBuild(() => {
    const html = readFileSync(join(distDir, 'playground/index.html'), 'utf-8')
    expect(html).toContain('btn-font-decrease')
    expect(html).toContain('btn-font-increase')
    expect(html).toContain('font-size-display')
  }))

  it('playground has download button', requireBuild(() => {
    const html = readFileSync(join(distDir, 'playground/index.html'), 'utf-8')
    expect(html).toContain('btn-download')
    expect(html).toContain('Download editor content')
  }))

  it('playground has fullscreen button', requireBuild(() => {
    const html = readFileSync(join(distDir, 'playground/index.html'), 'utf-8')
    expect(html).toContain('btn-fullscreen')
    expect(html).toContain('Toggle fullscreen')
  }))

  it('playground has word wrap checkbox', requireBuild(() => {
    const html = readFileSync(join(distDir, 'playground/index.html'), 'utf-8')
    expect(html).toContain('ext-wordwrap')
    expect(html).toContain('Word Wrap')
  }))

  it('playground has read-only mode checkbox', requireBuild(() => {
    const html = readFileSync(join(distDir, 'playground/index.html'), 'utf-8')
    expect(html).toContain('ext-readonly')
    expect(html).toContain('Read-only')
  }))

  it('playground has whitespace visibility checkbox', requireBuild(() => {
    const html = readFileSync(join(distDir, 'playground/index.html'), 'utf-8')
    expect(html).toContain('ext-whitespace')
    expect(html).toContain('Whitespace')
  }))

  it('playground has bracket matching checkbox', requireBuild(() => {
    const html = readFileSync(join(distDir, 'playground/index.html'), 'utf-8')
    expect(html).toContain('ext-brackets')
    expect(html).toContain('Brackets')
  }))

  it('playground has code folding checkbox', requireBuild(() => {
    const html = readFileSync(join(distDir, 'playground/index.html'), 'utf-8')
    expect(html).toContain('ext-fold')
    expect(html).toContain('Folding')
  }))

  it('playground has active line highlight checkbox', requireBuild(() => {
    const html = readFileSync(join(distDir, 'playground/index.html'), 'utf-8')
    expect(html).toContain('ext-highlight-line')
    expect(html).toContain('Active Line')
  }))

  it('playground has tab size selector', requireBuild(() => {
    const html = readFileSync(join(distDir, 'playground/index.html'), 'utf-8')
    expect(html).toContain('id="tab-size"')
    expect(html).toContain('Select tab size')
  }))

  it('playground has vim and emacs keymap checkboxes', requireBuild(() => {
    const html = readFileSync(join(distDir, 'playground/index.html'), 'utf-8')
    expect(html).toContain('ext-vim')
    expect(html).toContain('ext-emacs')
    expect(html).toContain('Toggle Vim keymap')
    expect(html).toContain('Toggle Emacs keymap')
  }))

  it('playground has language loading indicator', requireBuild(() => {
    const html = readFileSync(join(distDir, 'playground/index.html'), 'utf-8')
    expect(html).toContain('lang-loading')
    expect(html).toContain('aria-live="polite"')
  }))

  it('playground has load error message element', requireBuild(() => {
    const html = readFileSync(join(distDir, 'playground/index.html'), 'utf-8')
    expect(html).toContain('load-error')
    expect(html).toContain('role="alert"')
    expect(html).toContain('Failed to load language pack')
  }))

  it('all pages have twitter card meta tags', requireBuild(() => {
    const pages = ['index.html', 'docs/index.html', 'playground/index.html']
    for (const page of pages) {
      const html = readFileSync(join(distDir, page), 'utf-8')
      expect(html).toContain('twitter:card')
      expect(html).toContain('twitter:title')
      expect(html).toContain('twitter:description')
    }
  }))

  it('all pages have canonical link', requireBuild(() => {
    const pages = ['index.html', 'docs/index.html', 'playground/index.html']
    for (const page of pages) {
      const html = readFileSync(join(distDir, page), 'utf-8')
      expect(html).toContain('rel="canonical"')
    }
  }))

  it('all pages have skip navigation link for accessibility', requireBuild(() => {
    const pages = ['index.html', 'docs/index.html', 'playground/index.html', '404.html']
    for (const page of pages) {
      const html = readFileSync(join(distDir, page), 'utf-8')
      expect(html).toContain('skip-link')
      expect(html).toContain('Skip to content')
    }
  }))

  it('all pages have nav with aria-label', requireBuild(() => {
    const pages = ['index.html', 'docs/index.html', 'playground/index.html']
    for (const page of pages) {
      const html = readFileSync(join(distDir, page), 'utf-8')
      expect(html).toContain('aria-label="Main navigation"')
    }
  }))

  it('homepage has install command', requireBuild(() => {
    const html = readFileSync(join(distDir, 'index.html'), 'utf-8')
    expect(html).toContain('bun add @duskmoon-dev/code-engine')
  }))

  it('homepage has quick start code snippet', requireBuild(() => {
    const html = readFileSync(join(distDir, 'index.html'), 'utf-8')
    expect(html).toContain('EditorState')
    expect(html).toContain('EditorView')
    expect(html).toContain('basicSetup')
  }))

  it('homepage has version, license and zero-deps badges', requireBuild(() => {
    const html = readFileSync(join(distDir, 'index.html'), 'utf-8')
    expect(html).toContain('MIT License')
    expect(html).toContain('Zero Dependencies')
    expect(html).toContain(`v${pkg.version}`)
  }))

  it('docs page has try-in-playground link', requireBuild(() => {
    const html = readFileSync(join(distDir, 'docs/index.html'), 'utf-8')
    expect(html).toContain('/code-engine/playground')
    expect(html).toContain('Try in Playground')
  }))

  it('playground editor region has aria-label', requireBuild(() => {
    const html = readFileSync(join(distDir, 'playground/index.html'), 'utf-8')
    expect(html).toContain('role="region"')
    expect(html).toContain('aria-label="Code editor"')
  }))

  it('playground controls toolbar has aria-label', requireBuild(() => {
    const html = readFileSync(join(distDir, 'playground/index.html'), 'utf-8')
    expect(html).toContain('role="toolbar"')
    expect(html).toContain('aria-label="Editor settings"')
  }))

  it('docs page has export table with import paths', requireBuild(() => {
    const html = readFileSync(join(distDir, 'docs/index.html'), 'utf-8')
    expect(html).toContain('@duskmoon-dev/code-engine/state')
    expect(html).toContain('@duskmoon-dev/code-engine/view')
    expect(html).toContain('@duskmoon-dev/code-engine/lang/javascript')
  }))

  it('all pages have footer with copyright', requireBuild(() => {
    const pages = ['index.html', 'docs/index.html', 'playground/index.html']
    for (const page of pages) {
      const html = readFileSync(join(distDir, page), 'utf-8')
      expect(html).toContain('duskmoon-dev')
      expect(html).toContain('MIT License')
    }
  }))

  it('all pages have og:url meta tag', requireBuild(() => {
    const pages = ['index.html', 'docs/index.html', 'playground/index.html']
    for (const page of pages) {
      const html = readFileSync(join(distDir, page), 'utf-8')
      expect(html).toContain('og:url')
    }
  }))

  it('export table headers have scope="col" for accessibility', requireBuild(() => {
    const html = readFileSync(join(distDir, 'docs/index.html'), 'utf-8')
    expect(html).toContain('scope="col"')
    // Both Import and Exports headers should have scope
    const scopeCount = (html.match(/scope="col"/g) ?? []).length
    // At least 2 per category table (7 categories × 2 headers = 14)
    expect(scopeCount).toBeGreaterThanOrEqual(14)
  }))

  it('playground has shortcuts dialog with close button', requireBuild(() => {
    const html = readFileSync(join(distDir, 'playground/index.html'), 'utf-8')
    expect(html).toContain('shortcuts-dialog')
    expect(html).toContain('shortcuts-close')
    // Dialog should be a <dialog> element
    expect(html).toContain('<dialog')
  }))

  it('docs page changelog section exists', requireBuild(() => {
    const html = readFileSync(join(distDir, 'docs/index.html'), 'utf-8')
    expect(html).toContain('Changelog')
    expect(html).toContain('changelog')
  }))

  it('playground has language loaders for all languages', requireBuild(() => {
    const html = readFileSync(join(distDir, 'playground/index.html'), 'utf-8')
    const astroDir = join(distDir, '_astro')
    if (!existsSync(astroDir)) return
    const jsFiles = readdirSync(astroDir).filter(f => f.endsWith('.js'))
    // The main editor script should reference all language import paths
    const mainScript = jsFiles
      .map(f => readFileSync(join(astroDir, f), 'utf-8'))
      .join('\n')
    // Check a sample of language paths are referenced
    const langs = ['javascript', 'python', 'rust', 'go', 'html', 'css']
    for (const lang of langs) {
      expect(mainScript).toContain(lang)
    }
  }))

  it('playground editor has aria-label for code editor region', requireBuild(() => {
    const html = readFileSync(join(distDir, 'playground/index.html'), 'utf-8')
    expect(html).toContain('aria-label="Code editor"')
  }))

  it('all HTML pages have valid structure (doctype, html, head, body)', requireBuild(() => {
    const pages = ['index.html', '404.html', 'docs/index.html', 'playground/index.html']
    for (const page of pages) {
      const html = readFileSync(join(distDir, page), 'utf-8')
      expect(html).toMatch(/^<!DOCTYPE html>/i)
      expect(html).toContain('<html')
      expect(html).toContain('<head>')
      expect(html).toContain('</head>')
      expect(html).toContain('<body')
      expect(html).toContain('</body>')
      expect(html).toContain('</html>')
    }
  }))

  it('no unclosed script tags in built pages', requireBuild(() => {
    const pages = ['index.html', 'docs/index.html', 'playground/index.html']
    for (const page of pages) {
      const html = readFileSync(join(distDir, page), 'utf-8')
      const openScripts = (html.match(/<script/g) ?? []).length
      const closeScripts = (html.match(/<\/script>/g) ?? []).length
      expect(openScripts).toBe(closeScripts)
    }
  }))

  it('bundle size is within acceptable limits', requireBuild(() => {
    const astroDir = join(distDir, '_astro')
    if (!existsSync(astroDir)) return
    const files = readdirSync(astroDir)
    const jsFiles = files.filter(f => f.endsWith('.js'))
    const cssFiles = files.filter(f => f.endsWith('.css'))

    // Total JS bundle should be under 2MB (languages are large)
    let totalJs = 0
    for (const f of jsFiles) {
      totalJs += readFileSync(join(astroDir, f)).length
    }
    expect(totalJs).toBeLessThan(2 * 1024 * 1024) // 2MB

    // CSS should be under 50KB
    let totalCss = 0
    for (const f of cssFiles) {
      totalCss += readFileSync(join(astroDir, f)).length
    }
    expect(totalCss).toBeLessThan(50 * 1024) // 50KB

    // No individual JS chunk should exceed 500KB (would indicate bundling issue)
    for (const f of jsFiles) {
      const size = readFileSync(join(astroDir, f)).length
      expect(size).toBeLessThan(500 * 1024)
    }
  }))

  it('docs page description mentions correct export count', requireBuild(() => {
    const html = readFileSync(join(distDir, 'docs/index.html'), 'utf-8')
    expect(html).toContain(`${exportCount} subpath exports`)
  }))

  it('404 page has base path hint', requireBuild(() => {
    const html = readFileSync(join(distDir, '404.html'), 'utf-8')
    expect(html).toContain('/code-engine/')
  }))

  it('404 page has suggested pages section', requireBuild(() => {
    const html = readFileSync(join(distDir, '404.html'), 'utf-8')
    expect(html).toContain('suggested-heading')
    expect(html).toContain('Project overview')
    expect(html).toContain('Full API reference')
    expect(html).toContain('Live editor')
  }))
})
