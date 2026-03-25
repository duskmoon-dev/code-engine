import { describe, it, expect } from 'bun:test'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'

const playgroundSrc = join(import.meta.dir, '../../playground/src')
const rootDir = join(import.meta.dir, '../..')

function readComponent(name: string) {
  return readFileSync(join(playgroundSrc, 'components', name), 'utf-8')
}

function readPage(name: string) {
  return readFileSync(join(playgroundSrc, 'pages', name), 'utf-8')
}

describe('playground source validation', () => {
  describe('language registry consistency', () => {
    it('every language in languageLoaders has a sampleCode entry', () => {
      const editor = readComponent('EditorDemo.astro')

      // Extract language keys from languageLoaders block
      const loaderSection = editor.match(/const languageLoaders[\s\S]*?=\s*\{([\s\S]*?)\n  \}/)
      expect(loaderSection).not.toBeNull()
      const loaderKeys = [...loaderSection![1].matchAll(/^    (\w+):/gm)].map(m => m[1])
      expect(loaderKeys.length).toBeGreaterThanOrEqual(22)

      // Extract the sampleCode block and verify each loader key has a sample
      const sampleSection = editor.slice(editor.indexOf('const sampleCode'))
      for (const key of loaderKeys) {
        // Each key should appear as a property in sampleCode (indented with backtick value)
        const pattern = new RegExp(`\\b${key}:\\s*\``)
        expect(pattern.test(sampleSection)).toBe(true)
      }
    })

    it('languageLabels covers all languageLoaders keys', () => {
      const editor = readComponent('EditorDemo.astro')

      const loaderMatches = editor.match(/const languageLoaders[\s\S]*?=\s*\{([\s\S]*?)\n  \}/m)
      const loaderKeys = [...loaderMatches![1].matchAll(/^\s+(\w+):/gm)].map(m => m[1])

      const labelMatches = editor.match(/const languageLabels[\s\S]*?=\s*\{([\s\S]*?)\n  \}/m)
      expect(labelMatches).not.toBeNull()
      const labelKeys = [...labelMatches![1].matchAll(/^\s+(\w+):/gm)].map(m => m[1])

      expect(labelKeys.sort()).toEqual(loaderKeys.sort())
    })

    it('fileExtensions covers all languageLoaders keys', () => {
      const editor = readComponent('EditorDemo.astro')

      const loaderMatches = editor.match(/const languageLoaders[\s\S]*?=\s*\{([\s\S]*?)\n  \}/m)
      const loaderKeys = [...loaderMatches![1].matchAll(/^\s+(\w+):/gm)].map(m => m[1])

      const extMatches = editor.match(/const fileExtensions[\s\S]*?=\s*\{([\s\S]*?)\}/)
      expect(extMatches).not.toBeNull()
      const extKeys = [...extMatches![1].matchAll(/(\w+):/g)].map(m => m[1])

      for (const lang of loaderKeys) {
        expect(extKeys).toContain(lang)
      }
    })

    it('all language imports reference valid package exports', () => {
      const editor = readComponent('EditorDemo.astro')
      const pkg = JSON.parse(readFileSync(join(rootDir, 'package.json'), 'utf-8'))
      const exportKeys = Object.keys(pkg.exports)

      // Find all dynamic import paths
      const imports = [...editor.matchAll(/import\('(@duskmoon-dev\/code-engine\/[^']+)'\)/g)]
      for (const [, path] of imports) {
        const subpath = './' + path.replace('@duskmoon-dev/code-engine/', '')
        expect(exportKeys).toContain(subpath)
      }

      // Find all static import paths
      const staticImports = [...editor.matchAll(/from '(@duskmoon-dev\/code-engine\/[^']+)'/g)]
      for (const [, path] of staticImports) {
        const subpath = './' + path.replace('@duskmoon-dev/code-engine/', '')
        expect(exportKeys).toContain(subpath)
      }
    })
  })

  describe('ExportList component', () => {
    it('exports descriptions cover all package.json exports', () => {
      const exportList = readComponent('ExportList.astro')
      const pkg = JSON.parse(readFileSync(join(rootDir, 'package.json'), 'utf-8'))
      const exportKeys = Object.keys(pkg.exports).map(k => k === '.' ? '.' : k.slice(2))

      for (const key of exportKeys) {
        // Each export should have a description entry
        if (key.includes('*')) continue // wildcards handled separately
        expect(exportList).toContain(`'${key}'`)
      }
    })

    it('table headers have scope="col" for accessibility', () => {
      const exportList = readComponent('ExportList.astro')
      expect(exportList).toContain('scope="col"')
    })

    it('has aria-label on filter input', () => {
      const exportList = readComponent('ExportList.astro')
      expect(exportList).toContain('aria-label="Filter exports"')
    })
  })

  describe('Layout component', () => {
    it('has skip navigation link', () => {
      const layout = readFileSync(join(playgroundSrc, 'layouts', 'Layout.astro'), 'utf-8')
      expect(layout).toContain('skip-link')
      expect(layout).toContain('Skip to content')
    })

    it('has main landmark with id for skip link', () => {
      const layout = readFileSync(join(playgroundSrc, 'layouts', 'Layout.astro'), 'utf-8')
      expect(layout).toContain('id="main-content"')
    })

    it('has nav with aria-label', () => {
      const layout = readFileSync(join(playgroundSrc, 'layouts', 'Layout.astro'), 'utf-8')
      expect(layout).toContain('aria-label="Main navigation"')
    })

    it('sets lang="en" on html element', () => {
      const layout = readFileSync(join(playgroundSrc, 'layouts', 'Layout.astro'), 'utf-8')
      expect(layout).toContain('lang="en"')
    })

    it('includes JSON-LD structured data', () => {
      const layout = readFileSync(join(playgroundSrc, 'layouts', 'Layout.astro'), 'utf-8')
      expect(layout).toContain('application/ld+json')
      expect(layout).toContain('SoftwareSourceCode')
    })
  })

  describe('global.css', () => {
    it('has prefers-reduced-motion media query', () => {
      const css = readFileSync(join(playgroundSrc, 'styles', 'global.css'), 'utf-8')
      expect(css).toContain('prefers-reduced-motion')
    })

    it('has print styles', () => {
      const css = readFileSync(join(playgroundSrc, 'styles', 'global.css'), 'utf-8')
      expect(css).toContain('@media print')
    })

    it('defines all required design tokens', () => {
      const css = readFileSync(join(playgroundSrc, 'styles', 'global.css'), 'utf-8')
      const requiredTokens = [
        '--color-bg', '--color-surface', '--color-text', '--color-text-muted',
        '--color-accent', '--color-border', '--font-mono', '--font-sans',
        '--radius', '--space-sm', '--space-md', '--space-lg',
      ]
      for (const token of requiredTokens) {
        expect(css).toContain(token)
      }
    })

    it('has DuskMoon theme --syntax-* custom properties', () => {
      const css = readFileSync(join(playgroundSrc, 'styles', 'global.css'), 'utf-8')
      const syntaxTokens = [
        '--syntax-keyword', '--syntax-name', '--syntax-function',
        '--syntax-constant', '--syntax-definition', '--syntax-type',
        '--syntax-operator', '--syntax-comment', '--syntax-link',
        '--syntax-heading', '--syntax-atom', '--syntax-string',
        '--syntax-invalid', '--syntax-invalid-bg',
      ]
      for (const token of syntaxTokens) {
        expect(css).toContain(token)
      }
    })
  })

  describe('404 page', () => {
    it('has navigation back to all main pages', () => {
      const page = readPage('404.astro')
      expect(page).toContain('Home')
      expect(page).toContain('docs')
      expect(page).toContain('playground')
    })
  })

  describe('EditorDemo keyboard shortcuts', () => {
    it('has Ctrl+S shortcut for copy/share', () => {
      const editor = readComponent('EditorDemo.astro')
      expect(editor).toContain('Ctrl')
      expect(editor).toContain('S')
      expect(editor).toContain('serializeState')
    })

    it('has F11 shortcut for fullscreen toggle', () => {
      const editor = readComponent('EditorDemo.astro')
      expect(editor).toContain('F11')
      expect(editor).toContain('fullscreen')
    })

    it('has font size shortcut bindings', () => {
      const editor = readComponent('EditorDemo.astro')
      expect(editor).toContain('updateFontSize')
      expect(editor).toContain('font-size-controls')
      expect(editor).toContain('btn-font-decrease')
      expect(editor).toContain('btn-font-increase')
    })
  })

  describe('EditorDemo state serialization', () => {
    it('defines serializeState function', () => {
      const editor = readComponent('EditorDemo.astro')
      expect(editor).toContain('function serializeState')
    })

    it('defines restoreState function', () => {
      const editor = readComponent('EditorDemo.astro')
      expect(editor).toContain('function restoreState')
    })
  })

  describe('EditorDemo localStorage persistence', () => {
    it('references localStorage for state persistence', () => {
      const editor = readComponent('EditorDemo.astro')
      expect(editor).toContain('localStorage.setItem')
      expect(editor).toContain('localStorage.getItem')
      expect(editor).toContain('localStorage.removeItem')
    })

    it('has a storage key constant', () => {
      const editor = readComponent('EditorDemo.astro')
      expect(editor).toContain('STORAGE_KEY')
    })
  })

  describe('Homepage copy button', () => {
    it('has navigator.clipboard for copy functionality', () => {
      const index = readPage('index.astro')
      expect(index).toContain('navigator.clipboard')
    })

    it('has copy-btn class for styling', () => {
      const index = readPage('index.astro')
      expect(index).toContain('copy-btn')
    })
  })

  describe('Changelog component', () => {
    it('imports CHANGELOG.md with raw import', () => {
      const changelog = readComponent('Changelog.astro')
      expect(changelog).toContain("CHANGELOG.md?raw")
    })

    it('renders markdown with heading support', () => {
      const changelog = readComponent('Changelog.astro')
      expect(changelog).toContain('<h2>')
      expect(changelog).toContain('<h3>')
      expect(changelog).toContain('<h4>')
    })

    it('supports blockquotes and horizontal rules', () => {
      const changelog = readComponent('Changelog.astro')
      expect(changelog).toContain('blockquote')
      expect(changelog).toContain('<hr>')
    })
  })
})
