# Playground Package Design — v2

**Date:** 2026-03-25  
**Package:** `@duskmoon-dev/code-engine-playground`  
**Location:** `./playground/`  
**Repo:** `duskmoon-dev/code-engine`

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
    │   ├── playground.astro  # live editor page
    │   └── 404.astro         # custom 404 for GitHub Pages
    ├── styles/
    │   └── global.css        # site-wide styles (see Styling section)
    └── components/
        ├── ExportList.astro  # categorized export table (static)
        ├── Changelog.astro   # renders CHANGELOG.md (static)
        └── EditorDemo.astro  # live CodeMirror editor + controls
```

### Technology

- **Astro** (output: `static`) — static site generator; zero JS shipped by default; pages are Astro components
- **Vanilla TypeScript** — interactive editor controls live in `<script>` tags within `.astro` files; Astro/Vite bundles them automatically
- **Astro scoped styles + `global.css`** — layout shell, nav, controls use Astro `<style>` blocks; shared tokens (colors, spacing, typography) in a single CSS file imported by `Layout.astro` (see [Styling](#styling))
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

### Source vs Built Artifacts

The playground imports from `@duskmoon-dev/code-engine` via `workspace:*`. Vite resolves this to the package's **`exports` map**, which points to built artifacts under `dist/`. Therefore the main package **must be built before** the playground can build. The CI pipeline reflects this (see [Deployment](#deployment)).

If you want the playground to resolve source directly during local dev (faster iteration, no rebuild loop), add a Vite alias in `astro.config.ts`:

```ts
// optional: resolve source during dev only
vite: {
  resolve: {
    conditions: process.env.NODE_ENV === 'development' ? ['source'] : [],
  },
}
```

This requires a `"source"` condition in the main package's export map pointing to `src/` entry files. Without this, always run `bun run build` at root before `bun run dev` in the playground.

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
    "rootDir": "."
  }
}
```

> Note: `noEmit` is implicit — Astro handles compilation and output. No `outDir` needed here; Astro writes to `dist/` via its own config.

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
- All exports organized in a table by category. The `package.json` has 42 named export keys total: the root `.` entry, 40 named subpath exports, and one wildcard `./lang/legacy/*`. For the reference table, render the 6 named categories below:
  - **Root** (1): `.` (barrel re-export of core modules)
  - **Core** (11): `state`, `view`, `language`, `commands`, `search`, `autocomplete`, `lint`, `collab`, `merge`, `lsp`, `language-data`
  - **Parser** (3): `parser/common`, `parser/lr`, `parser/highlight`
  - **Languages** (22 named + legacy wildcard): all named `lang/*` packs (see [Language Registry](#language-registry) for the complete list) + `lang/legacy/*`
  - **Themes** (2): `theme/one-dark`, `theme/duskmoon`
  - **Keymaps** (2): `keymaps/vim`, `keymaps/emacs`
  - **Setup** (1): `setup` (basicSetup, minimalSetup)
- **Legacy languages note**: The `lang/legacy/*` wildcard covers languages using `StreamLanguage.define()` rather than native Lezer tree-sitter parsers. These are listed as a single wildcard row in the export table with a note explaining the different initialization pattern (see [Language Registry](#language-registry) for details).
- Full Changelog (rendered from `CHANGELOG.md` at build time — see [Changelog rendering](#changelog-rendering))
- Links to npm package and GitHub repository

### `/playground` — Live Editor

Content:
- Full-width CodeMirror editor instance
- Control bar (see [Responsive Layout](#responsive-layout) for placement)
  - **Language dropdown** (`<select>`) — all 22 named languages
  - **Theme toggle** (`<select>`) — one-dark ↔ duskmoon
  - **Extension checkboxes** (`<input type="checkbox">`): line numbers, autocomplete, vim keymap, emacs keymap

### `/404` — Not Found

A minimal 404 page styled consistently with `Layout.astro`. Displays a message and a link back to the homepage. Required because GitHub Pages serves a static 404 for any path that doesn't match a built file, and the non-root base path (`/code-engine`) makes misrouted URLs likely.

---

## Changelog Rendering

In `Changelog.astro`, use a Vite raw import to read the changelog at build time:

```ts
// Changelog.astro frontmatter
import changelog from '../../../CHANGELOG.md?raw'

const sections = changelog.split('\n## ').map((s, i) => i === 0 ? s : '## ' + s)
```

This avoids a `node:fs` dependency — Vite handles the file read and inlines it at build time. Render each section as a `<section>` with the heading extracted, or render the whole thing inside a `<pre>` block. No markdown parser dependency needed.

Path resolution: `../../../CHANGELOG.md` navigates from `playground/src/components/` up three levels to the repo root.

---

## Language Registry

The playground needs two parallel maps: one for language factory functions (to configure the compartment) and one for sample code snippets. These are the canonical lists.

### Named Language Exports (22)

Each export path below is relative to `@duskmoon-dev/code-engine/`:

| # | Export Path | Factory | Init Pattern |
|---|-----------|---------|-------------|
| 1 | `lang/javascript` | `javascript()` | Lezer native |
| 2 | `lang/typescript` | `javascript({ typescript: true })` | Lezer native (via JS pack) |
| 3 | `lang/python` | `python()` | Lezer native |
| 4 | `lang/html` | `html()` | Lezer native |
| 5 | `lang/css` | `css()` | Lezer native |
| 6 | `lang/json` | `json()` | Lezer native |
| 7 | `lang/markdown` | `markdown()` | Lezer native |
| 8 | `lang/xml` | `xml()` | Lezer native |
| 9 | `lang/sql` | `sql()` | Lezer native |
| 10 | `lang/rust` | `rust()` | Lezer native |
| 11 | `lang/cpp` | `cpp()` | Lezer native |
| 12 | `lang/java` | `java()` | Lezer native |
| 13 | `lang/php` | `php()` | Lezer native |
| 14 | `lang/go` | `go()` | Lezer native |
| 15 | `lang/yaml` | `yaml()` | Lezer native |
| 16 | `lang/toml` | `toml()` | Lezer native |
| 17 | `lang/sass` | `sass()` | Lezer native |
| 18 | `lang/less` | `less()` | Lezer native |
| 19 | `lang/wast` | `wast()` | Lezer native |
| 20 | `lang/liquid` | `liquid()` | Lezer native |
| 21 | `lang/vue` | `vue()` | Lezer native |
| 22 | `lang/angular` | `angular()` | Lezer native |

> **Implementor note:** Verify the exact list and factory signatures against the actual `package.json` exports and source. Some language packs may accept config objects (e.g., `javascript({ jsx: true, typescript: true })`). The playground should use default config (no args) unless a language requires configuration to be useful.

### Legacy Languages (`lang/legacy/*`)

Legacy language packs use `StreamLanguage.define()` from `@codemirror/language` (re-exported via `@duskmoon-dev/code-engine/language`). They are **excluded from the playground dropdown** because:

1. They require a different initialization pattern (`StreamLanguage.define(mode)` rather than calling a factory)
2. The wildcard export makes them harder to enumerate at build time
3. They represent older, less-maintained language support

They are documented in the `/docs` export table as a single `lang/legacy/*` row with a note on the `StreamLanguage` pattern.

### Language Map & Sample Code

The `EditorDemo.astro` `<script>` block must define two lookup objects:

```ts
import type { LanguageSupport } from '@duskmoon-dev/code-engine/language'

// Factory map: language key → function returning LanguageSupport
const languageMap: Record<string, () => LanguageSupport> = {
  javascript: () => javascript(),
  typescript: () => javascript({ typescript: true }),
  python: () => python(),
  html: () => html(),
  css: () => css(),
  // ... all 22
}

// Sample snippets: language key → short demo code (5–10 lines)
const sampleCode: Record<string, string> = {
  javascript: 'function hello() {\n  console.log("Hello, world!")\n}',
  typescript: 'function hello(name: string): void {\n  console.log(`Hello, ${name}!`)\n}',
  python: 'def hello():\n    print("Hello, world!")',
  html: '<!DOCTYPE html>\n<html>\n  <body>Hello, world!</body>\n</html>',
  css: 'body {\n  font-family: sans-serif;\n  color: #333;\n}',
  // ... all 22
}
```

Both maps **must share the same key set**. The `<select>` dropdown is populated from `Object.keys(languageMap)`.

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
// ... import all 22 language factories
import { oneDark } from '@duskmoon-dev/code-engine/theme/one-dark'
import { duskmoon } from '@duskmoon-dev/code-engine/theme/duskmoon'
import { vim } from '@duskmoon-dev/code-engine/keymaps/vim'
import { emacs } from '@duskmoon-dev/code-engine/keymaps/emacs'

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

Language changes also update the editor doc to a language-appropriate sample snippet:

```ts
function switchLanguage(key: string) {
  const langFactory = languageMap[key]
  if (!langFactory) return

  view.dispatch({
    changes: { from: 0, to: view.state.doc.length, insert: sampleCode[key] ?? '' },
    effects: languageCompartment.reconfigure(langFactory()),
  })
}
```

### Control Bindings

Controls are plain HTML elements with vanilla `addEventListener` bindings:

- **Language dropdown**: `<select id="lang-select">` with `change` listener calling `switchLanguage(select.value)`
- **Theme toggle**: `<select id="theme-select">` with `change` listener dispatching `themeCompartment.reconfigure(...)`
- **Extension checkboxes**: `<input type="checkbox" id="ext-linenumbers">` etc., each with a `change` listener

**Vim/emacs mutual exclusion**: When a keymap checkbox is checked, the handler unchecks the other keymap checkbox via `otherCheckbox.checked = false` before dispatching the compartment reconfiguration with the combined active extensions. Both can be unchecked (no keymap active).

```ts
const vimCheckbox = document.getElementById('ext-vim') as HTMLInputElement
const emacsCheckbox = document.getElementById('ext-emacs') as HTMLInputElement

vimCheckbox.addEventListener('change', () => {
  if (vimCheckbox.checked) emacsCheckbox.checked = false
  reconfigureExtensions()
})
emacsCheckbox.addEventListener('change', () => {
  if (emacsCheckbox.checked) vimCheckbox.checked = false
  reconfigureExtensions()
})

function reconfigureExtensions() {
  const exts = []
  if (vimCheckbox.checked) exts.push(vim())
  if (emacsCheckbox.checked) exts.push(emacs())
  // ... other extension checkboxes
  view.dispatch({ effects: extensionCompartment.reconfigure(exts) })
}
```

---

## Styling

### Approach

- **`src/styles/global.css`** — defines CSS custom properties for colors, spacing, and typography. Imported once in `Layout.astro` via `import '../styles/global.css'`. Keeps the site visually consistent without a CSS framework dependency.
- **Astro scoped `<style>` blocks** — each `.astro` component styles itself; Astro auto-scopes to avoid collisions.
- **CodeMirror theming** — handled entirely by the CM6 theme extensions (`oneDark`, `duskmoon`). The site shell does not attempt to style `.cm-editor` internals.

### Design Tokens (in `global.css`)

```css
:root {
  --color-bg: #0d1117;
  --color-surface: #161b22;
  --color-text: #e6edf3;
  --color-text-muted: #8b949e;
  --color-accent: #58a6ff;
  --color-border: #30363d;
  --font-mono: 'JetBrains Mono', 'Fira Code', monospace;
  --font-sans: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  --radius: 6px;
  --space-sm: 0.5rem;
  --space-md: 1rem;
  --space-lg: 2rem;
}
```

> These tokens are suggestions — adjust to match the duskmoon theme palette.

### Responsive Layout

- **Desktop (≥768px)**: playground page uses a two-column layout — controls sidebar (240px fixed) on the left, editor fills remaining width.
- **Mobile (<768px)**: controls collapse to a horizontal toolbar above the editor. Dropdowns and checkboxes wrap naturally.
- **Homepage and docs**: single-column centered content with `max-width: 48rem`.

---

## Deployment

### Updated `deploy-pages.yml`

The existing two-job structure (`build` + `deploy`) is preserved. Only the steps within the `build` job change — replace the `bun run scripts/build-docs.ts` step and the artifact upload path:

```yaml
# within the existing 'build' job:
- name: Install dependencies
  run: bun install

- name: Cache Bun dependencies
  uses: actions/cache@v4
  with:
    path: ~/.bun/install/cache
    key: bun-${{ runner.os }}-${{ hashFiles('bun.lock') }}
    restore-keys: bun-${{ runner.os }}-

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

> **Note:** `bun run build` at root is required before the playground build because `workspace:*` resolves to the package's export map, which points to built artifacts under `dist/`.

### Base Path

`astro.config.ts` sets `base: '/code-engine'` matching the GitHub repo name `duskmoon-dev/code-engine`. All assets resolve correctly under `https://duskmoon-dev.github.io/code-engine/`.

### Retired Files

`scripts/build-docs.ts` is deleted. All references to it in CI workflows are removed.

---

## Verification

| Check | Command / Action |
|-------|-----------------|
| Dev server starts | `cd playground && bun run dev` |
| All pages load | Visit `/`, `/docs`, `/playground`, `/404` |
| Language switcher works | Select each of the 22 languages → syntax highlighting + sample code update |
| Theme toggle works | Toggle one-dark ↔ duskmoon → editor colors switch |
| Extension checkboxes work | Check/uncheck → features toggle |
| Vim/emacs exclusion | Check vim → emacs unchecks; check emacs → vim unchecks; both unchecked is valid |
| Changelog renders | `/docs` shows formatted changelog from repo root `CHANGELOG.md` |
| Responsive layout | Resize browser: controls sidebar → top toolbar at <768px |
| Production build succeeds | `cd playground && bun run build` → `playground/dist/` exists |
| No broken asset paths | All pages load correctly with base path `/code-engine` |
| CI deploy succeeds | Push to `main` → Pages deployment passes |

---

## Resolved Decisions

1. **Source condition for dev** — **No.** Do not add a `"source"` export condition. The root `bun run build` is fast and keeps dev and CI resolution paths identical. A source condition adds export map complexity for a single internal consumer. If rebuild latency becomes painful, this is a backward-compatible addition later.

2. **Language list accuracy** — The 22-row table in this PRD is a **template, not the source of truth.** The implementor's first task is to extract the canonical list from `package.json` before writing any code:

   ```bash
   bun -e "const pkg = await Bun.file('package.json').json(); console.log(Object.keys(pkg.exports).filter(k => k.startsWith('./lang/') && !k.includes('*')).sort().join('\n'))"
   ```

   The language registry table, `languageMap`, `sampleCode`, and the `<select>` dropdown must all be updated to match the actual output. If a language pack requires non-default config to be useful (e.g., `javascript({ typescript: true })` for TypeScript), note it in the table's Factory column.

3. **Duskmoon theme tokens** — **Derive from the CM6 duskmoon theme.** The site shell wraps the editor — visual discontinuity between them looks broken. Extract background, surface, text, accent, and border values from the duskmoon theme source file and use them as the `global.css` custom properties. The `global.css` tokens in this PRD are placeholders; replace them with actual values from the theme. When the theme evolves, the site tokens update to match.