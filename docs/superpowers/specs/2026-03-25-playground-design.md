# Playground Package Design

**Date:** 2026-03-25
**Package:** `@duskmoon-dev/code-engine-playground`
**Location:** `./playground/`

---

## Problem

`@duskmoon-dev/code-engine` ships 42 subpath exports covering all CodeMirror 6 + Lezer modules, but its GitHub Pages site is a single auto-generated static HTML page (`scripts/build-docs.ts`). There is no interactive demo, no structured API reference, and no way to explore the package's capabilities without reading source code.

---

## Goal

Replace the existing static page with a proper Astro-based documentation and playground site deployed to GitHub Pages. The site must include:

1. A homepage with installation + quick-start
2. A full API reference for all 42 exports
3. An interactive live editor demonstrating language packs, themes, and extensions

---

## Architecture

### Package Structure

The playground is a standalone private package in a **Bun workspace** at `./playground/`. It references `@duskmoon-dev/code-engine` via `workspace:*` so it always runs against the local source build.

```
playground/
├── package.json              # private, workspace:* dep on @duskmoon-dev/code-engine
├── astro.config.ts           # output: 'static', base: '/code-engine'
├── tsconfig.json             # extends ../tsconfig.json
├── public/
│   └── favicon.svg
└── src/
    ├── layouts/
    │   └── Layout.astro      # shared shell: nav, head, footer
    ├── pages/
    │   ├── index.astro       # homepage
    │   ├── docs.astro        # API reference + changelog
    │   └── playground.astro  # live editor page
    └── components/
        ├── ExportList.astro  # categorized export table (static)
        ├── Changelog.astro   # renders CHANGELOG.md (static)
        └── EditorDemo.astro  # live CodeMirror editor + controls
```

### Technology

- **Astro** (output: `static`) — static site generator; zero JS shipped by default; pages are Astro components
- **Vanilla TypeScript** — interactive editor controls live in `<script>` tags within `.astro` files; Astro/Vite bundles them automatically
- **No additional UI framework** — CodeMirror's own `Compartment` + `StateEffect` API is sufficient for hot-swapping language, theme, and extensions

### Root Changes

Add `"workspaces"` as a new top-level key (the root `package.json` does not currently have one) and append to `"scripts"`:

```json
// root package.json — new key:
"workspaces": ["playground"],

// root package.json — add to "scripts":
"build:playground": "cd playground && bun run build"
```

`bun install` at root automatically installs all workspace members. The `workspace:*` dep in `playground/package.json` resolves to the local `@duskmoon-dev/code-engine` source — no separate build step required before `bun run dev` in the playground.

### `playground/astro.config.ts`

```ts
import { defineConfig } from 'astro/config'

export default defineConfig({
  output: 'static',
  base: '/code-engine',
})
```

### `playground/tsconfig.json`

```json
{
  "extends": "../tsconfig.json",
  "include": ["src/**/*.ts", "src/**/*.astro"],
  "compilerOptions": {
    "rootDir": ".",
    "outDir": "./dist",
    "noEmit": true
  }
}
```

### `playground/package.json`

```json
{
  "name": "@duskmoon-dev/code-engine-playground",
  "version": "0.0.1",
  "private": true,
  "scripts": {
    "dev": "astro dev",
    "build": "astro build",
    "preview": "astro preview"
  },
  "dependencies": {
    "@duskmoon-dev/code-engine": "workspace:*"
  },
  "devDependencies": {
    "astro": "^5.x"
  }
}
```

### Workspace & Lockfile

After adding `playground/` as a workspace member, run `bun install` at the repo root to regenerate `bun.lock`. The updated lockfile must be committed. CI's `bun install` step does **not** use `--frozen-lockfile` for the playground build (the existing deploy-pages workflow does not pass `--frozen-lockfile`; this is preserved).

---

## Pages

### `/` — Homepage

Content:
- Package name (`@duskmoon-dev/code-engine`) and version badge
- Description: "Deep fork of CodeMirror 6 + Lezer — single package, zero dependencies"
- Badges: version, MIT license, Zero Dependencies
- Install block: `bun add @duskmoon-dev/code-engine`
- Quick-start code snippet (imports for `state`, `view`, `setup`, `lang/javascript`)
- Navigation links to `/docs` and `/playground`

### `/docs` — API Reference

Content:
- All exports organized in a table by category. The `package.json` has 42 named export keys total: the root `.` entry, 40 named subpath exports, and one wildcard `./lang/legacy/*`. For the reference table, render the 6 named categories below (the legacy wildcard is noted as a single entry, not expanded):
  - **Root** (1): `.` (barrel re-export of core modules)
  - **Core** (11): `state`, `view`, `language`, `commands`, `search`, `autocomplete`, `lint`, `collab`, `merge`, `lsp`, `language-data`
  - **Parser** (3): `parser/common`, `parser/lr`, `parser/highlight`
  - **Languages** (22 + legacy wildcard): all named `lang/*` packs + `lang/legacy/*`
  - **Themes** (2): `theme/one-dark`, `theme/duskmoon`
  - **Keymaps** (2): `keymaps/vim`, `keymaps/emacs`
  - **Setup** (1): `setup` (basicSetup, minimalSetup)
- Full Changelog (rendered from `CHANGELOG.md` at build time). In `Changelog.astro`, use Astro's `readFile` from `node:fs/promises` or `readFileSync` from `node:fs`. Path resolution: `new URL('../../../CHANGELOG.md', import.meta.url)` navigates from `playground/src/components/` up three levels to the repo root. Render as plain `<pre>` or split on `\n## ` to produce `<section>` per release — no markdown parser dependency needed.
- Links to npm package and GitHub repository

### `/playground` — Live Editor

Content:
- Full-width CodeMirror editor instance
- Control sidebar or toolbar with:
  - **Language dropdown** — all 22 supported languages
  - **Theme toggle** — one-dark ↔ duskmoon
  - **Extension checkboxes**: line numbers, autocomplete, vim keymap, emacs keymap (vim/emacs are mutually exclusive)

---

## Interactive Editor (`EditorDemo.astro`)

### Editor Initialization

All import paths match the exact subpath export keys in `package.json` (prefixed with `@duskmoon-dev/code-engine`):

```ts
// inside <script> tag — compiled by Astro/Vite
import { EditorState, Compartment } from '@duskmoon-dev/code-engine/state'
import { EditorView } from '@duskmoon-dev/code-engine/view'
import { basicSetup } from '@duskmoon-dev/code-engine/setup'
import { javascript } from '@duskmoon-dev/code-engine/lang/javascript'
import { python } from '@duskmoon-dev/code-engine/lang/python'
import { html } from '@duskmoon-dev/code-engine/lang/html'
// ... import all 22 language factories the same way
import { oneDark } from '@duskmoon-dev/code-engine/theme/one-dark'
import { duskmoon } from '@duskmoon-dev/code-engine/theme/duskmoon'
import { vim } from '@duskmoon-dev/code-engine/keymaps/vim'
import { emacs } from '@duskmoon-dev/code-engine/keymaps/emacs'

// sampleCode: a plain object mapping language name to a code string
const sampleCode: Record<string, string> = {
  javascript: 'function hello() {\n  console.log("Hello, world!")\n}',
  python: 'def hello():\n    print("Hello, world!")',
  html: '<!DOCTYPE html>\n<html>\n  <body>Hello, world!</body>\n</html>',
  // ... one snippet per language; keep them short (5–10 lines)
}

const languageCompartment = new Compartment()
const themeCompartment = new Compartment()
const extensionCompartment = new Compartment()

const view = new EditorView({
  state: EditorState.create({
    doc: sampleCode['javascript'],
    extensions: [
      basicSetup,
      languageCompartment.of(javascript()),
      themeCompartment.of(oneDark),
      extensionCompartment.of([]),
    ],
  }),
  parent: document.getElementById('editor')!,
})
```

### Hot-Swapping

All three compartments are reconfigured via `view.dispatch({ effects: compartment.reconfigure(newExtension) })` — no editor teardown/recreate needed.

Language changes also update the editor doc to a language-appropriate sample snippet.

Vim and emacs keymaps are mutually exclusive: checking one auto-unchecks the other via JavaScript before dispatching the compartment reconfiguration. Both can be unchecked (no keymap active).

---

## Deployment

### Updated `deploy-pages.yml`

The existing two-job structure (`build` + `deploy`) is preserved. Only the steps within the `build` job change — replace the `bun run scripts/build-docs.ts` step and the artifact upload path:

```yaml
# within the existing 'build' job:
- name: Install dependencies
  run: bun install

- name: Build package
  run: bun run build

- name: Build playground
  run: cd playground && bun run build

- name: Upload Pages artifact
  uses: actions/upload-pages-artifact@v3
  with:
    path: playground/dist

# the existing 'deploy' job (needs: build, uses deploy-pages@v4) is unchanged
```

### Base Path

`astro.config.ts` sets `base: '/code-engine'` so all assets resolve correctly under `https://duskmoon-dev.github.io/code-engine/`.

### Retired Files

`scripts/build-docs.ts` is deleted. All references to it in CI workflows are removed.

---

## Verification

| Check | Command / Action |
|-------|-----------------|
| Dev server starts | `cd playground && bun run dev` |
| All three pages load | Visit `/`, `/docs`, `/playground` |
| Language switcher works | Select each language → syntax highlighting updates |
| Theme toggle works | Toggle → editor colors switch |
| Extension checkboxes work | Check/uncheck → features toggle |
| Production build succeeds | `cd playground && bun run build` → `playground/dist/` exists |
| No broken asset paths | All pages load correctly with base path `/code-engine` |
| CI deploy succeeds | Push to `main` → Pages deployment passes |
