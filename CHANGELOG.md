# Changelog

## Unreleased

### Playground

- **Interactive playground**: Full CodeMirror editor at `/playground` with 23 language modes (including TypeScript via JSX pack), two themes, and 8+ extension toggles
- **URL state sharing**: Editor configuration and code serialized to URL hash; copy-link button with 8KB size guard
- **localStorage persistence**: All settings (language, theme, font size, tab size, extensions, keymaps) survive page refresh
- **API reference docs**: `/docs` with all 43 subpath exports categorized, filterable, with per-row copy-import buttons and Try-in-Playground links for each language
- **Changelog rendering**: `/docs` renders `CHANGELOG.md` at build time with section ID anchors for deep linking
- **OG / social metadata**: OpenGraph image, JSON-LD structured data, canonical URLs, Twitter card
- **Accessibility**: Skip-link, `lang="en"`, `aria-label` on all interactive controls, `role="region"` on scrollable tables, `tabindex` for keyboard navigation, `prefers-reduced-motion` CSS
- **Language-pack code splitting**: Each language loaded on demand; popular languages prefetched on idle; initial URL hash language loaded first
- **Editor UX**: Status bar (line/col/selection), font-size controls, fullscreen, word wrap, read-only, whitespace, folding, active line, bracket matching, vim/emacs keymaps, download, reset

### Tests

- 3560+ tests across 54 test files (up from 2900+ / 51)
- Playwright-style source-validation and build-output test suites for the playground
- Behavioral tests for `insertBracket` and `deleteBracketPair`

## 0.1.0 (2026-03-19)

Initial release — deep fork of CodeMirror 6 + Lezer ecosystem.

### Features

- **Monolith package**: 44 upstream repos collapsed into `@duskmoon-dev/code-engine`
- **Zero runtime dependencies**: all external code vendored (style-mod, crelt, w3c-keyname, find-cluster-break)
- **42 subpath exports**: tree-shakeable imports for state, view, language, commands, search, autocomplete, lint, collab, merge, lsp, language-data, parser/common, parser/lr, parser/highlight, 22 language packs, themes, and setup
- **22 language packs**: JavaScript/TypeScript/JSX, Python, HTML, CSS, JSON, Markdown, XML, SQL, Rust, Go, Java, C++, PHP, Sass, Less, YAML, Angular, Vue, Liquid, Wast, Jinja, Lezer
- **Legacy stream modes**: Elixir, Ruby, Erlang, Dart, Swift, Kotlin, Lua, Shell, Dockerfile, TOML, Nginx, Nix, Haskell, and more
- **DuskMoonUI theme**: Built-in theme reading CSS custom properties (`var(--color-*)`, `var(--syntax-*)`)
- **One Dark theme**: Ported from `@codemirror/theme-one-dark`
- **Bun-first build**: 280 output files in ~5s with code splitting and source maps
- **Pre-compiled parsers**: All Lezer grammar tables pre-compiled (no runtime `@lezer/generator`)

### Infrastructure

- GitHub Actions CI (typecheck, test, build)
- 2900+ tests across 51 test files (v0.1.0 baseline)
- Export verification script (84 paths verified)
- Upstream tracking in UPSTREAM.md (52 modules with commit SHAs)
- Interactive playground and API reference at [duskmoon-dev.github.io/code-engine](https://duskmoon-dev.github.io/code-engine/)
