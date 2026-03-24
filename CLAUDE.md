# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

`@duskmoon-dev/code-engine` — deep fork of CodeMirror 6 + Lezer ecosystem collapsed into a single npm package with zero runtime dependencies. All 52 upstream modules are vendored into one monolith.

## Commands

```bash
bun install                           # install dependencies (frozen lockfile in CI)
bun test                              # run all tests (37 files, ~500 tests)
bun test test/core/state.test.ts      # run a single test file
bun test --coverage                   # run tests with coverage report
bun run typecheck                     # tsc --noEmit
bun run build                         # typecheck → clean → bundle → generate .d.ts → verify exports
bun run build:grammars                # rebuild Lezer grammar tables
bun run verify                        # verify all 42 subpath exports resolve
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

**Build pipeline** (`scripts/build.ts`): 5 steps — tsc type-check → clean dist → Bun.build (ES2022, ESM, code splitting, no minification, external source maps) → tsc declaration-only emit (`tsconfig.build.json`) → verify-exports.

**Verify step** (`scripts/verify-exports.ts`): checks all subpath exports resolve to real files, ensures no `require()` calls in dist, and ensures no `@codemirror/*` or `@lezer/*` import specifiers leak into dist (vendoring correctness).

**Duskmoon-specific patches**: `shadowHostOverflow` facet in `src/core/view/extension.ts` (marked `// [DUSKMOON]`) — sets `overflow: visible` on Shadow DOM host to prevent tooltip/autocomplete clipping. DuskMoonUI theme uses CSS custom properties.

## Conventions

- **Runtime**: Bun for building, testing, and running scripts — always use `bun`/`bunx`/`bun add`/`bun publish`, never `npm`/`npx`/`npm install`/`npm publish`
- **Tests**: `bun:test` (`describe`/`it`/`expect`), import from `src/` not `dist/`. Tests mirror source structure in `test/`
- **Path alias**: `tsconfig.json` maps `@duskmoon-dev/code-engine/*` → `./src/*` so source files can import each other using the package's public subpath specifiers
- **Language pack pattern**: export a factory function (`javascript()`) + language instance (`javascriptLanguage`) + optional variants, completions, and snippets
- **All external code is vendored** — never add runtime dependencies
- **Upstream tracking**: UPSTREAM.md maps each module to its upstream repo + commit SHA. Mark any fork-specific changes with `// [DUSKMOON]` comments
- **CI**: GitHub Actions runs typecheck + tests + build on every push/PR to `main`
