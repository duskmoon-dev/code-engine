# Repository Guidelines

## Project Structure & Module Organization

`@duskmoon-dev/code-engine` packages vendored CodeMirror and Lezer modules as a TypeScript/ESM library with no runtime dependencies.

- `src/core/` contains editor state, views, commands, and extensions; `src/parser/` contains parser infrastructure.
- `src/lang/`, `src/theme/`, and `src/keymaps/` provide language packs, themes, and keybindings. Module APIs use `index.ts` barrels.
- `test/` mirrors source areas. `grammar/` contains grammar definitions; `scripts/` handles builds and upstream synchronization.
- `playground/` is the Astro demo workspace; static assets live in `playground/public/`. Design documents live in `docs/`. `dist/` is generated output.

## Build, Test, and Development Commands

Use Bun and run these commands from the repository root:

- `bun install`: install library and playground dependencies.
- `bun run dev`: start the Astro playground against local source.
- `bun run typecheck`: check source TypeScript without emitting files.
- `bun run build`: typecheck, rebuild `dist/`, emit declarations, repair duplicate exports, and verify exports.
- `bun run build:playground`: build the demo site.
- `bun run build:grammars`: regenerate committed parser files after grammar changes.
- `bun run verify`: check built export paths and vendoring constraints.
- `bun test`: run the test suite.

## Coding Style & Naming Conventions

Use two-space indentation and preserve each file's quote and semicolon conventions. Vendored library source typically uses double quotes without semicolons. Use PascalCase for classes/types and camelCase for functions/variables. Keep public exports aligned with `package.json`. No repository formatter or linter is configured; use TypeScript checks and match surrounding code.

## Testing Guidelines

Use `bun:test` with `describe`, `it`, and `expect`. Name tests `*.test.ts` and generally import from `src/`. Run focused checks such as `bun test test/core/state.test.ts`; add regression cases for behavior changes. `bun test --coverage` produces the CI coverage report; no minimum threshold is configured. For PRD tasks, keep edits and tests within the specified scope.

## Commit & Pull Request Guidelines

Follow the history's Conventional Commits: `feat(playground): ...`, `fix(ci): ...`, or `docs: ...`. Keep changes focused. PRs should explain the behavior change, link relevant issues, list validation, and include screenshots for visual changes. CI checks typechecking, tests, and library/playground builds. Place worktrees under `.trees/<branch>`.

## Vendored Code & Upstream Tracking

Preserve the library's zero-runtime-dependency design. Mark fork-specific changes with `// [DUSKMOON]`; update `UPSTREAM.md` when synchronizing upstream revisions.
