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

    it('persists theme in localStorage', () => {
      const editor = readComponent('EditorDemo.astro')
      // autoSave should include theme
      expect(editor).toContain("theme: themeSelect.value")
    })

    it('persists fontSize in localStorage', () => {
      const editor = readComponent('EditorDemo.astro')
      expect(editor).toContain("fontSize: currentFontSize")
    })

    it('persists tab settings in localStorage', () => {
      const editor = readComponent('EditorDemo.astro')
      expect(editor).toContain("tabSize: tabSizeSelect.value")
      expect(editor).toContain("useTabs: indentTabsCheckbox.checked")
    })

    it('persists extension toggles in localStorage', () => {
      const editor = readComponent('EditorDemo.astro')
      expect(editor).toContain("lineNumbers: lineNumbersCheckbox.checked")
      expect(editor).toContain("autocomplete: autocompleteCheckbox.checked")
      expect(editor).toContain("wordWrap: wordWrapCheckbox.checked")
      expect(editor).toContain("highlightLine: highlightLineCheckbox.checked")
      expect(editor).toContain("brackets: bracketsCheckbox.checked")
      expect(editor).toContain("fold: foldCheckbox.checked")
      expect(editor).toContain("vim: vimCheckbox.checked")
      expect(editor).toContain("emacs: emacsCheckbox.checked")
    })

    it('restores theme from localStorage', () => {
      const editor = readComponent('EditorDemo.astro')
      expect(editor).toContain("if (theme && themes[theme])")
    })

    it('restores fontSize from localStorage', () => {
      const editor = readComponent('EditorDemo.astro')
      // updateFontSize called with stored value
      expect(editor).toContain("if (typeof fontSize === 'number') updateFontSize(fontSize)")
    })

    it('restores extension toggles from localStorage', () => {
      const editor = readComponent('EditorDemo.astro')
      expect(editor).toContain("if (typeof lineNumbers === 'boolean') lineNumbersCheckbox.checked = lineNumbers")
      expect(editor).toContain("if (typeof wordWrap === 'boolean') wordWrapCheckbox.checked = wordWrap")
    })
  })

  describe('EditorDemo URL hash update timing', () => {
    it('calls updateHash inside switchLanguage after language loads', () => {
      const editor = readComponent('EditorDemo.astro')
      // updateHash must appear inside the try block of switchLanguage
      const switchLangFn = editor.match(/async function switchLanguage[\s\S]*?^  \}/m)?.[0] ?? ''
      expect(switchLangFn).toContain('updateHash()')
    })

    it('does not register a separate updateHash handler on langSelect change', () => {
      const editor = readComponent('EditorDemo.astro')
      // The separate langSelect.addEventListener('change', updateHash) must not exist
      // (updateHash is called inside switchLanguage instead)
      const lines = editor.split('\n')
      const separateHashListener = lines.find(
        l => l.includes("langSelect.addEventListener('change', updateHash)")
      )
      expect(separateHashListener).toBeUndefined()
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

  describe('ExportList table accessibility', () => {
    it('has role="region" on table-wrap divs for accessibility', () => {
      const exportList = readComponent('ExportList.astro')
      expect(exportList).toContain('role="region"')
    })

    it('has tabindex="0" on table-wrap divs for keyboard scrolling', () => {
      const exportList = readComponent('ExportList.astro')
      expect(exportList).toContain('tabindex="0"')
    })
  })

  describe('EditorDemo noscript fallback', () => {
    it('has a <noscript> element with JavaScript-required message', () => {
      const editor = readComponent('EditorDemo.astro')
      expect(editor).toContain('<noscript>')
      expect(editor).toContain('noscript-msg')
    })
  })

  describe('EditorDemo download button', () => {
    it('has fileExtensions map for download file types', () => {
      const editor = readComponent('EditorDemo.astro')
      expect(editor).toContain('fileExtensions')
    })

    it('has btn-download button', () => {
      const editor = readComponent('EditorDemo.astro')
      expect(editor).toContain('btn-download')
    })
  })

  describe('EditorDemo share URL functionality', () => {
    it('has btn-share button', () => {
      const editor = readComponent('EditorDemo.astro')
      expect(editor).toContain('btn-share')
    })

    it('has serializeState function for share URL generation', () => {
      const editor = readComponent('EditorDemo.astro')
      expect(editor).toContain('serializeState')
    })
  })

  describe('ExportList Try-in-Playground links', () => {
    it('has playgroundLangKeys map for language exports', () => {
      const exportList = readComponent('ExportList.astro')
      expect(exportList).toContain('playgroundLangKeys')
    })

    it('renders try-lang-link anchor for language exports', () => {
      const exportList = readComponent('ExportList.astro')
      expect(exportList).toContain('try-lang-link')
      expect(exportList).toContain('playground#lang=')
    })

    it('playgroundLangKeys covers all named lang/* exports', () => {
      const exportList = readComponent('ExportList.astro')
      const pkg = JSON.parse(readFileSync(join(rootDir, 'package.json'), 'utf-8'))
      const langExports = Object.keys(pkg.exports)
        .filter(k => k.startsWith('./lang/') && !k.includes('*'))
        .map(k => k.slice(2)) // strip './'

      for (const lang of langExports) {
        expect(exportList).toContain(`'${lang}':`)
      }
    })
  })

  describe('Changelog section IDs', () => {
    it('h2 headings have id attributes for deep linking', () => {
      const changelog = readComponent('Changelog.astro')
      expect(changelog).toContain('id="cl-')
    })

    it('id generation uses kebab-case from heading text', () => {
      const changelog = readComponent('Changelog.astro')
      // Should use .replace to create slug-style ids
      expect(changelog).toContain("replace(/[^a-z0-9]+/g, '-')")
    })
  })

  describe('Layout og:image meta tag', () => {
    it('has og:image meta tag referencing og-image.svg', () => {
      const layout = readFileSync(join(playgroundSrc, 'layouts', 'Layout.astro'), 'utf-8')
      expect(layout).toContain('og:image')
      expect(layout).toContain('og-image.svg')
    })
  })

  describe('global.css reduced motion support', () => {
    it('has prefers-reduced-motion media query', () => {
      const css = readFileSync(join(playgroundSrc, 'styles', 'global.css'), 'utf-8')
      expect(css).toContain('prefers-reduced-motion')
    })
  })

  describe('EditorDemo language prefetching', () => {
    it('uses requestIdleCallback to prefetch popular languages', () => {
      const editor = readComponent('EditorDemo.astro')
      expect(editor).toContain('requestIdleCallback')
    })

    it('prioritizes URL hash language in prefetch order', () => {
      const editor = readComponent('EditorDemo.astro')
      expect(editor).toContain('initialLang')
      expect(editor).toContain('prefetchOrder')
      expect(editor).toContain('location.hash')
    })
  })

  describe('EditorDemo error handling', () => {
    it('shows failed language name in error message', () => {
      const editor = readComponent('EditorDemo.astro')
      expect(editor).toContain('failed-lang-name')
      expect(editor).toContain('failedLangName')
    })

    it('has retry button for failed language loads', () => {
      const editor = readComponent('EditorDemo.astro')
      expect(editor).toContain('btn-retry-lang')
      expect(editor).toContain('retryLangBtn')
      expect(editor).toContain('lastFailedLang')
    })

    it('logs console warnings for localStorage failures', () => {
      const editor = readComponent('EditorDemo.astro')
      expect(editor).toContain("console.warn('localStorage unavailable:")
      expect(editor).toContain("console.warn('Failed to save editor state:")
      expect(editor).toContain("console.warn('Failed to restore editor state:")
    })

    it('shows URL size in KB when share URL is too large', () => {
      const editor = readComponent('EditorDemo.astro')
      expect(editor).toContain('sizeKB')
      expect(editor).toContain('Too large')
    })
  })

  describe('Changelog component', () => {
    it('imports CHANGELOG.md with raw import', () => {
      const changelog = readComponent('Changelog.astro')
      expect(changelog).toContain("CHANGELOG.md?raw")
    })

    it('renders markdown with heading support', () => {
      const changelog = readComponent('Changelog.astro')
      // Headings are generated via template literals with id anchors
      expect(changelog).toContain('<h2')
      expect(changelog).toContain('<h3')
      expect(changelog).toContain('<h4')
    })

    it('supports blockquotes and horizontal rules', () => {
      const changelog = readComponent('Changelog.astro')
      expect(changelog).toContain('blockquote')
      expect(changelog).toContain('<hr>')
    })
  })
})
