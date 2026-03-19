# PRD: `@duskmoon-dev/code-engine` — Deep Fork of CodeMirror 6

> Repository: `duskmoon-dev/codemirror`
> Published Package: `@duskmoon-dev/code-engine`
> License: MIT (same as upstream)
> Status: Draft
> Priority: Critical (blocks `@duskmoon-dev/el-code-editor`)

---

## 1. Overview

Deep fork of the entire CodeMirror 6 + Lezer ecosystem into a single published package: `@duskmoon-dev/code-engine`. All ~40 upstream repositories are collapsed into one monorepo with one npm artifact. The package is the sole editor dependency for `@duskmoon-dev/el-code-editor`.

### Goals

- **Zero third-party runtime dependencies** for the code editor element
- **Single import source** — consumers import everything from `@duskmoon-dev/code-engine`
- **Full ownership** — we can patch Shadow DOM issues, optimize for Bun, add DuskMoonUI-native theming at the engine level
- **Periodic upstream sync** — Opus in loki mode runs sync tasks on a cadence

### Non-Goals

- Not a community fork — this is an internal dependency, not published for general use (though it's public + MIT)
- Not a rewrite — we preserve CM6's architecture, just restructure packaging
- Not a compatibility layer — import paths change, the API surface stays

---

## 2. Upstream Inventory

### CodeMirror Packages (24 repos → collapsed)

**Core (12)**:

| Upstream Package           | Upstream Repo          | Role                                |
|----------------------------|------------------------|-------------------------------------|
| `@codemirror/state`        | `codemirror/state`     | Editor state, transactions, facets  |
| `@codemirror/view`         | `codemirror/view`      | DOM rendering, EditorView           |
| `@codemirror/language`     | `codemirror/language`  | Language support infra, indentation |
| `@codemirror/commands`     | `codemirror/commands`  | Default keybindings, editing cmds   |
| `@codemirror/search`       | `codemirror/search`    | Search & replace                    |
| `@codemirror/autocomplete` | `codemirror/autocomplete` | Completion UI & logic            |
| `@codemirror/lint`         | `codemirror/lint`      | Diagnostics/linting infra           |
| `@codemirror/collab`       | `codemirror/collab`    | Collaborative editing               |
| `@codemirror/language-data` | `codemirror/language-data` | Language metadata registry      |
| `@codemirror/merge`        | `codemirror/merge`     | Diff/merge view                     |
| `@codemirror/lsp-client`   | `codemirror/lsp-client` | LSP protocol client                |
| `codemirror`               | `codemirror/codemirror` | basicSetup convenience bundle      |

**Language Packs (13)**:

| Upstream Package                | Upstream Repo               |
|---------------------------------|-----------------------------|
| `@codemirror/lang-javascript`   | `codemirror/lang-javascript` |
| `@codemirror/lang-java`         | `codemirror/lang-java`       |
| `@codemirror/lang-json`         | `codemirror/lang-json`       |
| `@codemirror/lang-cpp`          | `codemirror/lang-cpp`        |
| `@codemirror/lang-php`          | `codemirror/lang-php`        |
| `@codemirror/lang-python`       | `codemirror/lang-python`     |
| `@codemirror/lang-go`           | `codemirror/lang-go`         |
| `@codemirror/lang-css`          | `codemirror/lang-css`        |
| `@codemirror/lang-sass`         | `codemirror/lang-sass`       |
| `@codemirror/lang-html`         | `codemirror/lang-html`       |
| `@codemirror/lang-sql`          | `codemirror/lang-sql`        |
| `@codemirror/lang-rust`         | `codemirror/lang-rust`       |
| `@codemirror/lang-xml`          | `codemirror/lang-xml`        |

**Language Packs Continued (8)**:

| Upstream Package                | Upstream Repo                |
|---------------------------------|------------------------------|
| `@codemirror/lang-markdown`     | `codemirror/lang-markdown`   |
| `@codemirror/lang-lezer`        | `codemirror/lang-lezer`      |
| `@codemirror/lang-wast`         | `codemirror/lang-wast`       |
| `@codemirror/lang-angular`      | `codemirror/lang-angular`    |
| `@codemirror/lang-vue`          | `codemirror/lang-vue`        |
| `@codemirror/lang-liquid`       | `codemirror/lang-liquid`     |
| `@codemirror/lang-less`         | `codemirror/lang-less`       |
| `@codemirror/lang-yaml`         | `codemirror/lang-yaml`       |
| `@codemirror/lang-jinja`        | `codemirror/lang-jinja`      |

**Other (2)**:

| Upstream Package                | Upstream Repo                |
|---------------------------------|------------------------------|
| `@codemirror/legacy-modes`      | `codemirror/legacy-modes`    |
| `@codemirror/theme-one-dark`    | `codemirror/theme-one-dark`  |

### Lezer Packages (~20 repos → collapsed)

**Runtime (3)** — these are embedded into the engine, not separate:

| Upstream Package      | Upstream Repo           | Role                          |
|-----------------------|-------------------------|-------------------------------|
| `@lezer/common`       | `lezer-parser/common`   | Tree data structure, Parser   |
| `@lezer/lr`           | `lezer-parser/lr`       | LR parser runtime             |
| `@lezer/highlight`    | `lezer-parser/highlight`| Syntax highlighting tags      |

**Build-time only (1)** — NOT included in the published package:

| Upstream Package      | Upstream Repo             | Role                          |
|-----------------------|---------------------------|-------------------------------|
| `@lezer/generator`    | `lezer-parser/generator`  | Grammar → parser compiler     |

**Language Grammars (~15)** — pre-compiled parser tables included:

| Upstream Package         | Upstream Repo               |
|--------------------------|-----------------------------|
| `@lezer/javascript`      | `lezer-parser/javascript`   |
| `@lezer/java`            | `lezer-parser/java`         |
| `@lezer/json`            | `lezer-parser/json`         |
| `@lezer/cpp`             | `lezer-parser/cpp`          |
| `@lezer/php`             | `lezer-parser/php`          |
| `@lezer/python`          | `lezer-parser/python`       |
| `@lezer/go`              | `lezer-parser/go`           |
| `@lezer/css`             | `lezer-parser/css`          |
| `@lezer/sass`            | `lezer-parser/sass`         |
| `@lezer/html`            | `lezer-parser/html`         |
| `@lezer/rust`            | `lezer-parser/rust`         |
| `@lezer/xml`             | `lezer-parser/xml`          |
| `@lezer/markdown`        | `lezer-parser/markdown`     |
| `@lezer/lezer`           | `lezer-parser/lezer`        |
| `@lezer/yaml`            | `lezer-parser/yaml`         |

### External Utility (1)

| Upstream Package | Upstream Repo       | Role                                    |
|------------------|---------------------|-----------------------------------------|
| `style-mod`      | `marijnh/style-mod` | CSS module injection (used by CM6 view) |

### Total: ~44 upstream repositories → 1 package

---

## 3. Repository Structure

```
duskmoon-dev/codemirror/
├── src/
│   ├── core/                      # Engine core
│   │   ├── state/                 # ← @codemirror/state
│   │   │   ├── index.ts
│   │   │   ├── state.ts
│   │   │   ├── transaction.ts
│   │   │   ├── facet.ts
│   │   │   ├── selection.ts
│   │   │   └── ...
│   │   ├── view/                  # ← @codemirror/view + style-mod inlined
│   │   │   ├── index.ts
│   │   │   ├── editorview.ts
│   │   │   ├── decoration.ts
│   │   │   ├── dom.ts
│   │   │   ├── style-mod.ts      # ← style-mod vendored here
│   │   │   └── ...
│   │   ├── language/              # ← @codemirror/language
│   │   ├── commands/              # ← @codemirror/commands
│   │   ├── search/                # ← @codemirror/search
│   │   ├── autocomplete/          # ← @codemirror/autocomplete
│   │   ├── lint/                  # ← @codemirror/lint
│   │   ├── collab/                # ← @codemirror/collab
│   │   ├── merge/                 # ← @codemirror/merge
│   │   ├── lsp/                   # ← @codemirror/lsp-client
│   │   └── language-data/         # ← @codemirror/language-data
│   │
│   ├── parser/                    # Lezer runtime
│   │   ├── common/                # ← @lezer/common
│   │   │   ├── index.ts
│   │   │   ├── tree.ts
│   │   │   └── ...
│   │   ├── lr/                    # ← @lezer/lr
│   │   │   ├── index.ts
│   │   │   ├── parse.ts
│   │   │   └── ...
│   │   └── highlight/             # ← @lezer/highlight
│   │       ├── index.ts
│   │       └── highlight.ts
│   │
│   ├── lang/                      # Language packs
│   │   ├── javascript/            # ← @codemirror/lang-javascript + @lezer/javascript
│   │   │   ├── index.ts           # CM6 language support wrapper
│   │   │   └── parser.ts          # Pre-compiled Lezer grammar
│   │   ├── python/                # ← @codemirror/lang-python + @lezer/python
│   │   ├── html/                  # ← @codemirror/lang-html + @lezer/html
│   │   ├── css/                   # ← @codemirror/lang-css + @lezer/css
│   │   ├── json/                  # ← @codemirror/lang-json + @lezer/json
│   │   ├── markdown/              # ← @codemirror/lang-markdown + @lezer/markdown
│   │   ├── xml/                   # ← @codemirror/lang-xml + @lezer/xml
│   │   ├── sql/                   # ← @codemirror/lang-sql
│   │   ├── rust/                  # ← @codemirror/lang-rust + @lezer/rust
│   │   ├── go/                    # ← @codemirror/lang-go + @lezer/go
│   │   ├── java/                  # ← @codemirror/lang-java + @lezer/java
│   │   ├── cpp/                   # ← @codemirror/lang-cpp + @lezer/cpp
│   │   ├── php/                   # ← @codemirror/lang-php + @lezer/php
│   │   ├── sass/                  # ← @codemirror/lang-sass + @lezer/sass
│   │   ├── less/                  # ← @codemirror/lang-less
│   │   ├── yaml/                  # ← @codemirror/lang-yaml + @lezer/yaml
│   │   ├── angular/               # ← @codemirror/lang-angular
│   │   ├── vue/                   # ← @codemirror/lang-vue
│   │   ├── liquid/                # ← @codemirror/lang-liquid
│   │   ├── wast/                  # ← @codemirror/lang-wast
│   │   ├── jinja/                 # ← @codemirror/lang-jinja
│   │   ├── lezer/                 # ← @codemirror/lang-lezer + @lezer/lezer
│   │   └── legacy/                # ← @codemirror/legacy-modes (all stream modes)
│   │       ├── index.ts
│   │       ├── elixir.ts
│   │       ├── ruby.ts
│   │       ├── erlang.ts
│   │       ├── dart.ts
│   │       ├── swift.ts
│   │       ├── kotlin.ts
│   │       ├── lua.ts
│   │       ├── shell.ts
│   │       ├── dockerfile.ts
│   │       ├── toml.ts
│   │       ├── nginx.ts
│   │       ├── nix.ts
│   │       ├── haskell.ts
│   │       └── ...              # All legacy stream modes
│   │
│   ├── theme/                     # Theme system
│   │   ├── one-dark.ts            # ← @codemirror/theme-one-dark
│   │   └── index.ts               # Theme creation utilities
│   │
│   ├── setup.ts                   # ← codemirror (basicSetup)
│   └── index.ts                   # Root barrel export
│
├── grammar/                       # Lezer grammar sources (.grammar files)
│   ├── javascript.grammar         # Source grammars for rebuilding parsers
│   ├── python.grammar
│   └── ...                        # Only used at build time via @lezer/generator
│
├── scripts/
│   ├── sync-upstream.ts           # Opus-driven upstream sync script
│   ├── build-grammars.ts          # Compile .grammar → parser.ts
│   ├── build.ts                   # Main build script
│   └── verify-exports.ts          # Ensure all exports resolve
│
├── test/                          # Upstream tests, restructured
│   ├── core/
│   ├── parser/
│   ├── lang/
│   └── ...
│
├── package.json
├── tsconfig.json
├── UPSTREAM.md                    # Tracks upstream commit SHAs per module
├── LICENSE                        # MIT (preserving upstream license)
├── CHANGELOG.md
└── README.md
```

---

## 4. Export Map

The single package exposes subpath exports so consumers get tree-shaking and can import only what they need:

```json
{
  "name": "@duskmoon-dev/code-engine",
  "version": "0.1.0",
  "type": "module",
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/index.js"
    },
    "./state": {
      "types": "./dist/core/state/index.d.ts",
      "import": "./dist/core/state/index.js"
    },
    "./view": {
      "types": "./dist/core/view/index.d.ts",
      "import": "./dist/core/view/index.js"
    },
    "./language": {
      "types": "./dist/core/language/index.d.ts",
      "import": "./dist/core/language/index.js"
    },
    "./commands": {
      "types": "./dist/core/commands/index.d.ts",
      "import": "./dist/core/commands/index.js"
    },
    "./search": {
      "types": "./dist/core/search/index.d.ts",
      "import": "./dist/core/search/index.js"
    },
    "./autocomplete": {
      "types": "./dist/core/autocomplete/index.d.ts",
      "import": "./dist/core/autocomplete/index.js"
    },
    "./lint": {
      "types": "./dist/core/lint/index.d.ts",
      "import": "./dist/core/lint/index.js"
    },
    "./collab": {
      "types": "./dist/core/collab/index.d.ts",
      "import": "./dist/core/collab/index.js"
    },
    "./merge": {
      "types": "./dist/core/merge/index.d.ts",
      "import": "./dist/core/merge/index.js"
    },
    "./lsp": {
      "types": "./dist/core/lsp/index.d.ts",
      "import": "./dist/core/lsp/index.js"
    },
    "./language-data": {
      "types": "./dist/core/language-data/index.d.ts",
      "import": "./dist/core/language-data/index.js"
    },
    "./parser/common": {
      "types": "./dist/parser/common/index.d.ts",
      "import": "./dist/parser/common/index.js"
    },
    "./parser/lr": {
      "types": "./dist/parser/lr/index.d.ts",
      "import": "./dist/parser/lr/index.js"
    },
    "./parser/highlight": {
      "types": "./dist/parser/highlight/index.d.ts",
      "import": "./dist/parser/highlight/index.js"
    },
    "./lang/javascript": {
      "types": "./dist/lang/javascript/index.d.ts",
      "import": "./dist/lang/javascript/index.js"
    },
    "./lang/python": {
      "types": "./dist/lang/python/index.d.ts",
      "import": "./dist/lang/python/index.js"
    },
    "./lang/html": {
      "types": "./dist/lang/html/index.d.ts",
      "import": "./dist/lang/html/index.js"
    },
    "./lang/css": {
      "types": "./dist/lang/css/index.d.ts",
      "import": "./dist/lang/css/index.js"
    },
    "./lang/json": {
      "types": "./dist/lang/json/index.d.ts",
      "import": "./dist/lang/json/index.js"
    },
    "./lang/markdown": {
      "types": "./dist/lang/markdown/index.d.ts",
      "import": "./dist/lang/markdown/index.js"
    },
    "./lang/xml": {
      "types": "./dist/lang/xml/index.d.ts",
      "import": "./dist/lang/xml/index.js"
    },
    "./lang/sql": {
      "types": "./dist/lang/sql/index.d.ts",
      "import": "./dist/lang/sql/index.js"
    },
    "./lang/rust": {
      "types": "./dist/lang/rust/index.d.ts",
      "import": "./dist/lang/rust/index.js"
    },
    "./lang/go": {
      "types": "./dist/lang/go/index.d.ts",
      "import": "./dist/lang/go/index.js"
    },
    "./lang/java": {
      "types": "./dist/lang/java/index.d.ts",
      "import": "./dist/lang/java/index.js"
    },
    "./lang/cpp": {
      "types": "./dist/lang/cpp/index.d.ts",
      "import": "./dist/lang/cpp/index.js"
    },
    "./lang/php": {
      "types": "./dist/lang/php/index.d.ts",
      "import": "./dist/lang/php/index.js"
    },
    "./lang/sass": {
      "types": "./dist/lang/sass/index.d.ts",
      "import": "./dist/lang/sass/index.js"
    },
    "./lang/less": {
      "types": "./dist/lang/less/index.d.ts",
      "import": "./dist/lang/less/index.js"
    },
    "./lang/yaml": {
      "types": "./dist/lang/yaml/index.d.ts",
      "import": "./dist/lang/yaml/index.js"
    },
    "./lang/angular": {
      "types": "./dist/lang/angular/index.d.ts",
      "import": "./dist/lang/angular/index.js"
    },
    "./lang/vue": {
      "types": "./dist/lang/vue/index.d.ts",
      "import": "./dist/lang/vue/index.js"
    },
    "./lang/liquid": {
      "types": "./dist/lang/liquid/index.d.ts",
      "import": "./dist/lang/liquid/index.js"
    },
    "./lang/wast": {
      "types": "./dist/lang/wast/index.d.ts",
      "import": "./dist/lang/wast/index.js"
    },
    "./lang/jinja": {
      "types": "./dist/lang/jinja/index.d.ts",
      "import": "./dist/lang/jinja/index.js"
    },
    "./lang/lezer": {
      "types": "./dist/lang/lezer/index.d.ts",
      "import": "./dist/lang/lezer/index.js"
    },
    "./lang/legacy/*": {
      "types": "./dist/lang/legacy/*.d.ts",
      "import": "./dist/lang/legacy/*.js"
    },
    "./theme/one-dark": {
      "types": "./dist/theme/one-dark.d.ts",
      "import": "./dist/theme/one-dark.js"
    },
    "./setup": {
      "types": "./dist/setup.d.ts",
      "import": "./dist/setup.js"
    }
  }
}
```

### Consumer Usage (in `@duskmoon-dev/el-code-editor`)

```typescript
// Before (upstream):
import { EditorView } from '@codemirror/view';
import { EditorState } from '@codemirror/state';
import { javascript } from '@codemirror/lang-javascript';
import { search } from '@codemirror/search';
import { MergeView } from '@codemirror/merge';
import { tags } from '@lezer/highlight';

// After (fork):
import { EditorView } from '@duskmoon-dev/code-engine/view';
import { EditorState } from '@duskmoon-dev/code-engine/state';
import { javascript } from '@duskmoon-dev/code-engine/lang/javascript';
import { search } from '@duskmoon-dev/code-engine/search';
import { MergeView } from '@duskmoon-dev/code-engine/merge';
import { tags } from '@duskmoon-dev/code-engine/parser/highlight';
```

---

## 5. Internal Import Rewriting

The biggest mechanical task in the collapse. Every upstream `@codemirror/*` and `@lezer/*` import becomes a relative import within the monolith.

### Rewrite Rules

```
@codemirror/state        → ../state     (or ../../core/state from lang/)
@codemirror/view         → ../view
@codemirror/language     → ../language
@codemirror/commands     → ../commands
@codemirror/search       → ../search
@codemirror/autocomplete → ../autocomplete
@codemirror/lint         → ../lint
@codemirror/merge        → ../merge
@lezer/common            → ../../parser/common  (from core/)
@lezer/lr                → ../../parser/lr
@lezer/highlight         → ../../parser/highlight
@lezer/javascript        → (inlined into lang/javascript/)
style-mod                → ./style-mod  (vendored into view/)
```

### Automation

The sync script handles this mechanically:

```typescript
// scripts/sync-upstream.ts (pseudocode)

const IMPORT_REWRITES: Record<string, string> = {
  '@codemirror/state': 'core/state',
  '@codemirror/view': 'core/view',
  '@codemirror/language': 'core/language',
  // ... all mappings
  '@lezer/common': 'parser/common',
  '@lezer/lr': 'parser/lr',
  '@lezer/highlight': 'parser/highlight',
  'style-mod': 'core/view/style-mod',
};

function rewriteImports(source: string, fromModule: string): string {
  for (const [external, internal] of Object.entries(IMPORT_REWRITES)) {
    const relativePath = computeRelative(fromModule, internal);
    source = source.replaceAll(
      new RegExp(`from ["']${escapeRegex(external)}["']`, 'g'),
      `from "${relativePath}"`
    );
  }
  return source;
}
```

---

## 6. Upstream Sync Process

### UPSTREAM.md — Tracking File

```markdown
# Upstream Sync Tracking

Last full sync: 2026-03-18

| Module             | Upstream Repo              | Upstream SHA | Synced Date |
|--------------------|----------------------------|--------------|-------------|
| core/state         | codemirror/state           | abc1234      | 2026-03-18  |
| core/view          | codemirror/view            | def5678      | 2026-03-18  |
| parser/common      | lezer-parser/common        | 111aaaa      | 2026-03-18  |
| lang/javascript    | codemirror/lang-javascript | 222bbbb      | 2026-03-18  |
| ...                | ...                        | ...          | ...         |
```

### Sync Script Flow

```
1. Clone/pull all upstream repos into a temp directory
2. For each module:
   a. Diff upstream src/ against our src/<mapped-path>/
   b. Apply upstream changes (git patch or file copy)
   c. Run import rewriting
   d. Run type check (tsc --noEmit)
   e. Run tests for that module
   f. If pass → commit with message "sync: <module> from <upstream-sha>"
   g. If fail → create branch "sync/<module>-<date>" with conflict markers
3. Update UPSTREAM.md
4. Run full build + full test suite
5. If all green → merge to main, tag release
```

### Cadence

- **Monthly**: Full sync of all modules
- **On-demand**: When a specific upstream fix is needed
- **Automated PR**: Opus creates a PR with sync results, human reviews

---

## 7. DuskMoonUI-Specific Modifications

These are changes we make on top of upstream that won't be synced back. They live in clearly marked sections or separate files.

### 7.1 Shadow DOM Improvements

**Location**: `src/core/view/`

- Ensure `adoptedStyleSheets` fallback to `<style>` injection when unavailable
- Fix tooltip positioning to account for Shadow DOM host clipping
- Add `EditorView.shadowHostOverflow` facet to control overflow behavior

### 7.2 Built-in DuskMoonUI Theme

**Location**: `src/theme/duskmoon.ts` (new file, not from upstream)

```typescript
// A CM6 theme that reads DuskMoonUI CSS custom properties
// This lives in the engine so el-code-editor doesn't need to build it
export function duskMoonTheme(root: Element): Extension { ... }
export function duskMoonHighlightStyle(root: Element): Extension { ... }
```

### 7.3 Bun-Optimized Build

- Use Bun's bundler instead of Rollup
- Inline `style-mod` directly into view (eliminate one external dep)
- Pre-compile all Lezer grammars at build time (no runtime `@lezer/generator` needed)

### 7.4 Custom Modifications Tracking

Every DuskMoonUI-specific change is tagged with a comment:

```typescript
// [DUSKMOON] Shadow DOM overflow fix — not in upstream
// See: https://github.com/duskmoon-dev/codemirror/issues/XX
```

The sync script knows to preserve `[DUSKMOON]` blocks during upstream merge.

---

## 8. Build System

### Build Script

```typescript
// scripts/build.ts

// 1. Compile Lezer grammars (.grammar → .ts parser tables)
//    Uses @lezer/generator as a BUILD-TIME dependency only
await buildGrammars();

// 2. Type check everything
await $`tsc --noEmit`;

// 3. Build with Bun bundler
//    - Each subpath export gets its own entry point
//    - Tree-shaking enabled
//    - Source maps generated
await Bun.build({
  entrypoints: [
    'src/index.ts',
    'src/core/state/index.ts',
    'src/core/view/index.ts',
    'src/core/language/index.ts',
    'src/core/commands/index.ts',
    'src/core/search/index.ts',
    'src/core/autocomplete/index.ts',
    'src/core/lint/index.ts',
    'src/core/collab/index.ts',
    'src/core/merge/index.ts',
    'src/core/lsp/index.ts',
    'src/core/language-data/index.ts',
    'src/parser/common/index.ts',
    'src/parser/lr/index.ts',
    'src/parser/highlight/index.ts',
    'src/lang/javascript/index.ts',
    'src/lang/python/index.ts',
    // ... all lang/* entry points
    'src/theme/one-dark.ts',
    'src/theme/duskmoon.ts',
    'src/setup.ts',
  ],
  outdir: './dist',
  target: 'browser',
  splitting: true,        // Shared chunks between entry points
  sourcemap: 'external',
  minify: false,          // Consumers bundle; we ship readable
});

// 4. Generate .d.ts files
await $`tsc --emitDeclarationOnly --outDir dist`;

// 5. Verify all exports resolve
await verifyExports();
```

### package.json Scripts

```json
{
  "scripts": {
    "build": "bun run scripts/build.ts",
    "build:grammars": "bun run scripts/build-grammars.ts",
    "test": "bun test",
    "typecheck": "tsc --noEmit",
    "sync": "bun run scripts/sync-upstream.ts",
    "verify": "bun run scripts/verify-exports.ts",
    "clean": "rm -rf dist"
  },
  "devDependencies": {
    "@lezer/generator": "^1.8.0",
    "typescript": "^5.6.0",
    "@types/bun": "latest"
  }
}
```

Note: `@lezer/generator` is a **dev dependency only** — used to compile `.grammar` files during build. It is NOT included in the published package.

---

## 9. Implementation Phases

### Phase 1 — Scaffold & Core (Week 1)

**Deliverables**:
- Create `duskmoon-dev/codemirror` repo
- Clone all 44 upstream repos
- Set up directory structure per Section 3
- Copy source files into collapsed structure
- Run import rewriting script
- Get `tsc --noEmit` passing (type check)
- Get `bun build` producing output
- Verify `src/core/state`, `src/core/view`, `src/parser/*` work

**Acceptance Criteria**:
- `import { EditorView } from '@duskmoon-dev/code-engine/view'` works
- `import { EditorState } from '@duskmoon-dev/code-engine/state'` works
- A basic editor renders in a test HTML file
- Zero type errors

### Phase 2 — All Core Modules (Week 2)

**Deliverables**:
- Complete all `core/*` modules (commands, search, autocomplete, lint, merge, collab, lsp)
- Complete all `parser/*` modules
- Inline `style-mod` into `core/view/`
- Port upstream tests for core modules
- Set up CI (GitHub Actions with Bun)

**Acceptance Criteria**:
- All core module tests pass
- Search, autocomplete, merge all functional
- `basicSetup` from `./setup` creates a working editor

### Phase 3 — Language Packs (Week 3)

**Deliverables**:
- All `lang/*` modules with pre-compiled parser tables
- Grammar build script (`scripts/build-grammars.ts`)
- All legacy stream modes under `lang/legacy/`
- Port language-specific tests

**Acceptance Criteria**:
- Every language listed in Section 2 highlights correctly
- Dynamic import of lang modules works (`import('@duskmoon-dev/code-engine/lang/python')`)
- Grammar rebuild from `.grammar` source produces identical output

### Phase 4 — DuskMoonUI Integration (Week 4)

**Deliverables**:
- `src/theme/duskmoon.ts` — built-in DuskMoonUI theme
- Shadow DOM improvements in `core/view/`
- `UPSTREAM.md` fully populated
- Sync script tested end-to-end
- First npm publish of `@duskmoon-dev/code-engine@0.1.0`

**Acceptance Criteria**:
- `el-code-editor` PRD can be implemented using only `@duskmoon-dev/code-engine`
- Theme reads `var(--color-*)` tokens from host document
- Upstream sync script runs cleanly on current upstream HEAD

### Phase 5 — Ongoing

- Monthly upstream syncs via Opus
- DuskMoonUI-specific patches as needed
- New language additions (community Lezer grammars)
- Performance optimizations for Bun runtime

---

## 10. Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Import rewriting breaks circular deps | Build fails | CM6 has minimal circular deps by design; test incrementally per module |
| Upstream API changes in sync | Merge conflicts | `[DUSKMOON]` markers preserved; conflicts isolated to branches |
| Bundle size bloat from monolith | Larger than needed | Subpath exports + `splitting: true` ensure tree-shaking works |
| Lezer grammar compilation requires Node | Build complexity | `@lezer/generator` works with Bun; test in CI |
| CM6's `style-mod` depends on global `document` | Breaks in SSR | Already an upstream issue; we inline and can patch |
| Missing test coverage after restructure | Regressions | Port all upstream tests; add integration tests for import paths |

---

## 11. Constraints

- **MIT license preserved** — all files keep upstream copyright + MIT headers
- **No runtime dependencies** — the published package has zero `dependencies` in package.json
- **`@lezer/generator` is dev-only** — grammars are pre-compiled; generator never ships
- **Subpath exports are stable API** — once published, import paths don't change
- **`[DUSKMOON]` comment convention** — all non-upstream changes are tagged
- **Bun-first** — build and test with Bun; Node.js compat is secondary
- **Browser target** — no Node.js-specific code in published output
- **Source maps** — always included for debugging
- **Readable output** — no minification; consumers handle their own bundling

---

## 12. Updated Dependency Chain

```
@duskmoon-dev/el-code-editor
└── @duskmoon-dev/code-engine     (this package — zero deps)
    └── (all CM6 + Lezer code inlined)

@duskmoon-dev/el-code-editor
└── @duskmoon-dev/el-core         (workspace — BaseElement)
```

The `el-code-editor` package's only non-workspace dependency is `@duskmoon-dev/code-engine`. No `@codemirror/*`, no `@lezer/*`, no `style-mod`, no `@replit/*`.

**Note on Vim/Emacs keymaps**: `@replit/codemirror-vim` and `@replit/codemirror-emacs` are also forked into this package under `src/keymaps/vim.ts` and `src/keymaps/emacs.ts`, with corresponding exports:

```json
"./keymaps/vim": { ... },
"./keymaps/emacs": { ... }
```

---

## 13. Verification Checklist (for Opus)

After initial fork is complete, verify:

- [ ] `bun install` — zero external runtime dependencies
- [ ] `bun run typecheck` — zero type errors
- [ ] `bun run build` — produces `dist/` with all subpath entry points
- [ ] `bun test` — all ported tests pass
- [ ] Smoke test: render a basic editor in a browser
- [ ] Smoke test: render editor inside Shadow DOM
- [ ] Smoke test: switch theme reads CSS custom properties
- [ ] Smoke test: load JavaScript, Python, Elixir languages
- [ ] Smoke test: MergeView (split + unified) renders
- [ ] Smoke test: search panel opens and finds text
- [ ] Smoke test: Vim mode activates with `:` command line
- [ ] `bun run scripts/verify-exports.ts` — all export paths resolve
- [ ] Published `dist/` has no `require()` calls
- [ ] Published `dist/` has no `@codemirror` or `@lezer` import specifiers remaining
- [ ] UPSTREAM.md lists all modules with commit SHAs

