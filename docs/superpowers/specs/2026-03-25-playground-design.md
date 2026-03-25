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

```json
// package.json additions
{
  "workspaces": ["playground"],
  "scripts": {
    "build:playground": "cd playground && bun run build"
  }
}
```

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
- All 42 exports organized in a table by category:
  - **Core** (11): `state`, `view`, `language`, `commands`, `search`, `autocomplete`, `lint`, `collab`, `merge`, `lsp`, `language-data`
  - **Parser** (3): `parser/common`, `parser/lr`, `parser/highlight`
  - **Languages** (22): all `lang/*` packs
  - **Themes** (2): `theme/one-dark`, `theme/duskmoon`
  - **Keymaps** (2): `keymaps/vim`, `keymaps/emacs`
  - **Setup** (1): `setup` (basicSetup, minimalSetup)
- Full Changelog (rendered from `CHANGELOG.md` at build time using Astro's `fs` access)
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

```ts
// inside <script> tag — compiled by Astro/Vite
import { EditorState } from '@duskmoon-dev/code-engine/state'
import { EditorView, basicSetup } from '@duskmoon-dev/code-engine/setup'
import { Compartment } from '@duskmoon-dev/code-engine/state'
import { javascript } from '@duskmoon-dev/code-engine/lang/javascript'
import { oneDark } from '@duskmoon-dev/code-engine/theme/one-dark'
// ... other language/theme/keymap imports

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

Vim and emacs keymaps are mutually exclusive: selecting one deselects the other.

---

## Deployment

### Updated `deploy-pages.yml`

```yaml
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

- name: Deploy to GitHub Pages
  uses: actions/deploy-pages@v4
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
