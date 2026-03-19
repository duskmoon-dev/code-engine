# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

`@duskmoon-dev/code-engine` — deep fork of CodeMirror 6 + Lezer ecosystem collapsed into a single npm package with zero runtime dependencies. All 44 upstream repos are vendored into one monolith.

## Commands

```bash
bun test                              # run all 503 tests
bun test test/core/state.test.ts      # run a single test file
bun test --coverage                   # run tests with coverage report
bun run typecheck                     # tsc --noEmit
bun run build                         # typecheck → bundle → generate .d.ts → verify exports
bun run build:grammars                # rebuild Lezer grammar tables
bun run verify                        # verify all 84 export paths resolve
bun run sync                          # sync from 52 upstream repos (see UPSTREAM.md)
bun run clean                         # rm -rf dist
```

## Architecture

**Source layout** (`src/`):
- `core/` — CodeMirror core modules: `state`, `view`, `language`, `commands`, `search`, `autocomplete`, `lint`, `collab`, `merge`, `lsp`, `language-data`
- `parser/` — Lezer parser infrastructure: `common`, `lr`, `highlight`
- `lang/` — 22 language packs + `legacy/` stream modes
- `theme/` — `one-dark` (static colors) and `duskmoon` (CSS custom properties via `var(--color-*)`, `var(--syntax-*)`)
- `keymaps/` — `vim`, `emacs`
- `setup.ts` — `basicSetup` and `minimalSetup` extension arrays
- `index.ts` — barrel re-export of core modules

Each module has an `index.ts` barrel. The 42 subpath exports in `package.json` map `./path` → `dist/path/index.js` + `.d.ts`.

**Build pipeline** (`scripts/build.ts`): tsc type-check → clean dist → Bun.build (ES2022, ESM, code splitting, external source maps) → tsc declaration-only emit → verify-exports.

**Duskmoon-specific patches**: Shadow DOM overflow facet in `src/core/view/extension.ts` (marked `// [DUSKMOON]`), DuskMoonUI theme using CSS custom properties.

## Conventions

- **Runtime**: Bun for building, testing, and running scripts
- **Tests**: `bun:test` (`describe`/`it`/`expect`), import from `src/` not `dist/`
- **Language pack pattern**: export a factory function (`javascript()`) + language instance (`javascriptLanguage`) + optional completions/snippets
- **All external code is vendored** — never add runtime dependencies
- **Upstream tracking**: UPSTREAM.md maps each module to its upstream repo + commit SHA
