# Changelog

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
- 503 tests across 37 test files
- Export verification script (84 paths verified)
- Upstream tracking in UPSTREAM.md (52 modules with commit SHAs)
