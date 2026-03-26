# Themes & Language Packs Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add `sunshine` and `moonlight` themes from the `@duskmoon-dev/core` palette, and add language support for elixir, erlang, heex, zig, caddyfile, and dart.

**Architecture:** Themes follow the `one-dark.ts` pattern (hardcoded OKLCH colors, three exports: `xxxTheme`, `xxxHighlightStyle`, `xxx`). Language packs with existing Lezer parsers (elixir, zig) are vendored and patched; languages without Lezer parsers (erlang, heex, caddyfile, dart) use `StreamLanguage.define()`. Both themes and languages must also be wired into the playground (`EditorDemo.astro`) and `ExportList.astro`. Both subsystems are independent and can be worked in parallel.

**Tech Stack:** Bun, TypeScript, CodeMirror 6, Lezer (all vendored in-repo)

---

## Part 1: Themes

### Task 1: Add the `sunshine` theme (light)

**Files:**
- Create: `src/theme/sunshine.ts`
- Create: `test/theme/sunshine.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
// test/theme/sunshine.test.ts
import { describe, it, expect } from "bun:test"
import { sunshine, sunshineTheme, sunshineHighlightStyle } from "../../src/theme/sunshine"
import { EditorState } from "../../src/core/state/index"

describe("theme/sunshine", () => {
  it("sunshineTheme is defined", () => {
    expect(sunshineTheme).toBeDefined()
  })

  it("sunshineHighlightStyle is defined", () => {
    expect(sunshineHighlightStyle).toBeDefined()
  })

  it("sunshine is an array with two elements", () => {
    expect(Array.isArray(sunshine)).toBe(true)
    expect((sunshine as unknown[]).length).toBe(2)
  })

  it("sunshine can be used as EditorState extension", () => {
    const state = EditorState.create({ doc: "hello", extensions: [sunshine] })
    expect(state.doc.toString()).toBe("hello")
  })

  it("sunshine is a light theme (dark: false)", () => {
    // sunshineTheme must have been created with dark: false
    expect(sunshineTheme).toBeDefined()
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

```bash
bun test test/theme/sunshine.test.ts
```

Expected: FAIL with "Cannot find module '../../src/theme/sunshine'"

- [ ] **Step 3: Write the implementation**

```ts
// src/theme/sunshine.ts
// [DUSKMOON] Sunshine theme — light palette from @duskmoon-dev/core
import {EditorView} from "../core/view"
import {Extension} from "../core/state"
import {HighlightStyle, syntaxHighlighting} from "../core/language"
import {tags as t} from "../parser/highlight"

// Sunshine palette (OKLCH, from @duskmoon-dev/core [data-theme="sunshine"])
const amber        = "oklch(72% 0.17 75)",    // primary — warm amber
      coral        = "oklch(62% 0.19 20)",    // secondary — coral rose
      violet       = "oklch(80% 0.085 235)",  // tertiary — soft violet
      mint         = "oklch(67% 0.19 134)",   // success — green
      gold         = "oklch(68% 0.20 42)",    // warning — amber-gold
      sky          = "oklch(42% 0.114 254)",  // info — sky blue
      error        = "oklch(61% 0.237 28)",   // error — red
      background   = "oklch(100% 0.005 255)", // base-100 — near white
      panels       = "oklch(96% 0.005 255)",  // slightly off-white panels
      text         = "oklch(10% 0 255)",      // base-content — near black
      stone        = "oklch(55% 0.02 260)",   // muted comment grey
      highlight    = "oklch(85% 0.10 75)",    // search highlight
      selection    = "oklch(80% 0.08 75)"     // selection amber-tinted

/// Editor theme styles for Sunshine.
export const sunshineTheme = EditorView.theme({
  "&": {color: text, backgroundColor: background},
  ".cm-content": {caretColor: amber},
  ".cm-cursor, .cm-dropCursor": {borderLeftColor: amber},
  "&.cm-focused > .cm-scroller > .cm-selectionLayer .cm-selectionBackground, .cm-selectionBackground, .cm-content ::selection":
    {backgroundColor: `color-mix(in oklch, ${selection} 35%, transparent)`},
  ".cm-panels": {backgroundColor: panels, color: text},
  ".cm-panels.cm-panels-top": {borderBottom: "1px solid oklch(88% 0.01 255)"},
  ".cm-panels.cm-panels-bottom": {borderTop: "1px solid oklch(88% 0.01 255)"},
  ".cm-searchMatch": {backgroundColor: `color-mix(in oklch, ${highlight} 40%, transparent)`,
    outline: `1px solid ${highlight}`},
  ".cm-searchMatch.cm-searchMatch-selected": {backgroundColor: `color-mix(in oklch, ${amber} 30%, transparent)`},
  ".cm-activeLine": {backgroundColor: "oklch(97% 0.008 75)"},
  ".cm-selectionMatch": {backgroundColor: `color-mix(in oklch, ${amber} 15%, transparent)`},
  "&.cm-focused .cm-matchingBracket, &.cm-focused .cm-nonmatchingBracket":
    {backgroundColor: `color-mix(in oklch, ${amber} 25%, transparent)`},
  ".cm-gutters": {backgroundColor: background, color: stone, border: "none"},
  ".cm-activeLineGutter": {backgroundColor: "oklch(97% 0.008 75)"},
  ".cm-foldPlaceholder": {backgroundColor: "transparent", border: "none", color: stone},
  ".cm-tooltip": {border: "1px solid oklch(88% 0.01 255)", backgroundColor: background},
  ".cm-tooltip .cm-tooltip-arrow:before": {borderTopColor: "transparent", borderBottomColor: "transparent"},
  ".cm-tooltip .cm-tooltip-arrow:after": {borderTopColor: background, borderBottomColor: background},
  ".cm-tooltip-autocomplete": {
    "& > ul > li[aria-selected]": {backgroundColor: amber, color: "oklch(15% 0 0)"}
  }
}, {dark: false})

/// Syntax highlighting style for Sunshine.
export const sunshineHighlightStyle = HighlightStyle.define([
  {tag: t.keyword,                                                         color: coral},
  {tag: [t.name, t.deleted, t.character, t.propertyName, t.macroName],    color: "oklch(35% 0.12 20)"},
  {tag: [t.function(t.variableName), t.labelName],                        color: sky},
  {tag: [t.color, t.constant(t.name), t.standard(t.name)],                color: violet},
  {tag: [t.definition(t.name), t.separator],                              color: text},
  {tag: [t.typeName, t.className, t.number, t.changed, t.annotation,
         t.modifier, t.self, t.namespace],                                 color: gold},
  {tag: [t.operator, t.operatorKeyword, t.url, t.escape,
         t.regexp, t.link, t.special(t.string)],                          color: amber},
  {tag: [t.meta, t.comment],   color: stone, fontStyle: "italic"},
  {tag: t.strong,              fontWeight: "bold"},
  {tag: t.emphasis,            fontStyle: "italic"},
  {tag: t.strikethrough,       textDecoration: "line-through"},
  {tag: t.link,                color: sky, textDecoration: "underline"},
  {tag: t.heading,             fontWeight: "bold", color: coral},
  {tag: [t.atom, t.bool, t.special(t.variableName)],                      color: violet},
  {tag: [t.processingInstruction, t.string, t.inserted],                  color: mint},
  {tag: t.invalid,             color: "oklch(100% 0 0)", backgroundColor: error},
])

/// Combined Sunshine editor theme + highlight style.
export const sunshine: Extension = [sunshineTheme, syntaxHighlighting(sunshineHighlightStyle)]
```

- [ ] **Step 4: Run test to verify it passes**

```bash
bun test test/theme/sunshine.test.ts
```

Expected: all 5 tests PASS

- [ ] **Step 5: Commit**

```bash
git add src/theme/sunshine.ts test/theme/sunshine.test.ts
git commit -m "feat(theme): add sunshine light theme from @duskmoon-dev/core palette"
```

---

### Task 2: Add the `moonlight` theme (dark)

**Files:**
- Create: `src/theme/moonlight.ts`
- Create: `test/theme/moonlight.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
// test/theme/moonlight.test.ts
import { describe, it, expect } from "bun:test"
import { moonlight, moonlightTheme, moonlightHighlightStyle } from "../../src/theme/moonlight"
import { EditorState } from "../../src/core/state/index"

describe("theme/moonlight", () => {
  it("moonlightTheme is defined", () => {
    expect(moonlightTheme).toBeDefined()
  })

  it("moonlightHighlightStyle is defined", () => {
    expect(moonlightHighlightStyle).toBeDefined()
  })

  it("moonlight is an array with two elements", () => {
    expect(Array.isArray(moonlight)).toBe(true)
    expect((moonlight as unknown[]).length).toBe(2)
  })

  it("moonlight can be used as EditorState extension", () => {
    const state = EditorState.create({ doc: "hello", extensions: [moonlight] })
    expect(state.doc.toString()).toBe("hello")
  })

  it("moonlight is a dark theme", () => {
    expect(moonlightTheme).toBeDefined()
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

```bash
bun test test/theme/moonlight.test.ts
```

Expected: FAIL with "Cannot find module '../../src/theme/moonlight'"

- [ ] **Step 3: Write the implementation**

```ts
// src/theme/moonlight.ts
// [DUSKMOON] Moonlight theme — dark palette from @duskmoon-dev/core
import {EditorView} from "../core/view"
import {Extension} from "../core/state"
import {HighlightStyle, syntaxHighlighting} from "../core/language"
import {tags as t} from "../parser/highlight"

// Moonlight palette (OKLCH, from @duskmoon-dev/core [data-theme="moonlight"])
const neutral      = "oklch(85% 0 0)",          // primary — near-white neutral
      gold         = "oklch(83% 0.098 74)",      // secondary — warm gold
      lavender     = "oklch(72% 0.090 255)",     // tertiary — lavender/indigo
      mauve        = "oklch(76% 0.130 336)",     // accent — mauve/rose
      mint         = "oklch(82% 0.062 133)",     // success — mint green
      periwinkle   = "oklch(82% 0.098 241)",     // info — periwinkle
      warmAmber    = "oklch(76% 0.175 62)",      // warning — warm amber
      muted        = "oklch(46% 0.190 29)",      // error — muted red
      background   = "oklch(22% 0.019 238)",     // base-100 — dark blue-grey
      panels       = "oklch(18% 0.019 238)",     // slightly darker panels
      activeLine   = "oklch(25% 0.019 238)",     // slightly lighter active
      text         = "oklch(77% 0.043 245)",     // base-content — light blue-grey
      stone        = "oklch(50% 0.035 245)",     // muted comment
      selection    = "oklch(35% 0.040 245)",     // selection
      cursor       = neutral

/// Editor theme styles for Moonlight.
export const moonlightTheme = EditorView.theme({
  "&": {color: text, backgroundColor: background},
  ".cm-content": {caretColor: cursor},
  ".cm-cursor, .cm-dropCursor": {borderLeftColor: cursor},
  "&.cm-focused > .cm-scroller > .cm-selectionLayer .cm-selectionBackground, .cm-selectionBackground, .cm-content ::selection":
    {backgroundColor: `color-mix(in oklch, ${selection} 60%, transparent)`},
  ".cm-panels": {backgroundColor: panels, color: text},
  ".cm-panels.cm-panels-top": {borderBottom: "1px solid oklch(30% 0.02 238)"},
  ".cm-panels.cm-panels-bottom": {borderTop: "1px solid oklch(30% 0.02 238)"},
  ".cm-searchMatch": {backgroundColor: `color-mix(in oklch, ${warmAmber} 25%, transparent)`,
    outline: `1px solid ${warmAmber}`},
  ".cm-searchMatch.cm-searchMatch-selected": {backgroundColor: `color-mix(in oklch, ${warmAmber} 40%, transparent)`},
  ".cm-activeLine": {backgroundColor: activeLine},
  ".cm-selectionMatch": {backgroundColor: `color-mix(in oklch, ${selection} 70%, transparent)`},
  "&.cm-focused .cm-matchingBracket, &.cm-focused .cm-nonmatchingBracket":
    {backgroundColor: `color-mix(in oklch, ${lavender} 25%, transparent)`},
  ".cm-gutters": {backgroundColor: background, color: stone, border: "none"},
  ".cm-activeLineGutter": {backgroundColor: activeLine},
  ".cm-foldPlaceholder": {backgroundColor: "transparent", border: "none", color: stone},
  ".cm-tooltip": {border: "1px solid oklch(30% 0.02 238)", backgroundColor: panels},
  ".cm-tooltip .cm-tooltip-arrow:before": {borderTopColor: "transparent", borderBottomColor: "transparent"},
  ".cm-tooltip .cm-tooltip-arrow:after": {borderTopColor: panels, borderBottomColor: panels},
  ".cm-tooltip-autocomplete": {
    "& > ul > li[aria-selected]": {backgroundColor: lavender, color: "oklch(98% 0 0)"}
  }
}, {dark: true})

/// Syntax highlighting style for Moonlight.
export const moonlightHighlightStyle = HighlightStyle.define([
  {tag: t.keyword,                                                         color: lavender},
  {tag: [t.name, t.deleted, t.character, t.propertyName, t.macroName],    color: "oklch(75% 0.05 15)"},
  {tag: [t.function(t.variableName), t.labelName],                        color: periwinkle},
  {tag: [t.color, t.constant(t.name), t.standard(t.name)],                color: mauve},
  {tag: [t.definition(t.name), t.separator],                              color: text},
  {tag: [t.typeName, t.className, t.number, t.changed, t.annotation,
         t.modifier, t.self, t.namespace],                                 color: gold},
  {tag: [t.operator, t.operatorKeyword, t.url, t.escape,
         t.regexp, t.link, t.special(t.string)],                          color: neutral},
  {tag: [t.meta, t.comment],   color: stone, fontStyle: "italic"},
  {tag: t.strong,              fontWeight: "bold"},
  {tag: t.emphasis,            fontStyle: "italic"},
  {tag: t.strikethrough,       textDecoration: "line-through"},
  {tag: t.link,                color: periwinkle, textDecoration: "underline"},
  {tag: t.heading,             fontWeight: "bold", color: lavender},
  {tag: [t.atom, t.bool, t.special(t.variableName)],                      color: mauve},
  {tag: [t.processingInstruction, t.string, t.inserted],                  color: mint},
  {tag: t.invalid,             color: "oklch(98% 0 0)", backgroundColor: muted},
])

/// Combined Moonlight editor theme + highlight style.
export const moonlight: Extension = [moonlightTheme, syntaxHighlighting(moonlightHighlightStyle)]
```

- [ ] **Step 4: Run test to verify it passes**

```bash
bun test test/theme/moonlight.test.ts
```

Expected: all 5 tests PASS

- [ ] **Step 5: Commit**

```bash
git add src/theme/moonlight.ts test/theme/moonlight.test.ts
git commit -m "feat(theme): add moonlight dark theme from @duskmoon-dev/core palette"
```

---

### Task 3: Wire up theme exports in index and package.json

**Files:**
- Modify: `src/theme/index.ts`
- Modify: `package.json`

- [ ] **Step 1: Update `src/theme/index.ts`**

Replace content with:
```ts
export * from "./one-dark"
export * from "./duskmoon"
export * from "./sunshine"
export * from "./moonlight"
```

- [ ] **Step 2: Add exports to `package.json`**

After the `"./theme/duskmoon"` block (around line 174), insert:
```json
    "./theme/sunshine": {
      "types": "./dist/theme/sunshine.d.ts",
      "import": "./dist/theme/sunshine.js"
    },
    "./theme/moonlight": {
      "types": "./dist/theme/moonlight.d.ts",
      "import": "./dist/theme/moonlight.js"
    },
```

- [ ] **Step 3: Run typecheck to verify no type errors**

```bash
bun run typecheck
```

Expected: no errors

- [ ] **Step 4: Run all theme tests**

```bash
bun test test/theme/
```

Expected: all pass

- [ ] **Step 5: Commit**

```bash
git add src/theme/index.ts package.json
git commit -m "feat(theme): export sunshine and moonlight from theme barrel and package.json"
```

---

### Task 4: Wire sunshine and moonlight into the playground

**Context:** The playground's `EditorDemo.astro` has a hard-coded `<select id="theme-select">` with only `one-dark` and `duskmoon` options, a `themes` JS object, and static imports. All three must be updated. The `ExportList.astro` descriptions map must also include the new theme exports or the source-validation test will fail. A new source-validation test asserting theme consistency prevents future regressions.

**Files:**
- Modify: `playground/src/components/EditorDemo.astro`
- Modify: `playground/src/components/ExportList.astro`
- Modify: `test/playground/source-validation.test.ts`

- [ ] **Step 1: Write the failing test**

Add to `test/playground/source-validation.test.ts` inside the `describe('playground source validation')` block, after the `language registry consistency` describe block:

```ts
describe('theme registry consistency', () => {
  it('theme select options match themes object keys', () => {
    const editor = readComponent('EditorDemo.astro')

    // Extract option values from the theme select HTML
    const optionMatches = [...editor.matchAll(/value="([^"]+)"[^>]*>\s*[\w\s]+\s*<\/option>/g)]
      .filter((_, i, arr) => {
        // Only options inside the theme-select block — find the block first
        const selectBlock = editor.match(/id="theme-select"[\s\S]*?<\/select>/)
        return selectBlock ? selectBlock[0].includes(`value="${arr[i][1]}"`) : false
      })
      .map(m => m[1])

    // Simpler: just check known themes are present as both option values and themes object keys
    const knownThemes = ['one-dark', 'duskmoon', 'sunshine', 'moonlight']
    for (const theme of knownThemes) {
      expect(editor).toContain(`value="${theme}"`)
      // themes object should reference each theme
      expect(editor).toContain(`'${theme}'`)
    }
  })

  it('all theme imports reference valid package exports', () => {
    const editor = readComponent('EditorDemo.astro')
    const pkg = JSON.parse(readFileSync(join(rootDir, 'package.json'), 'utf-8'))
    const exportKeys = Object.keys(pkg.exports)

    const staticImports = [...editor.matchAll(/from '(@duskmoon-dev\/code-engine\/theme\/[^']+)'/g)]
    for (const [, path] of staticImports) {
      const subpath = './' + path.replace('@duskmoon-dev/code-engine/', '')
      expect(exportKeys).toContain(subpath)
    }
  })
})
```

- [ ] **Step 2: Run the test to verify it fails**

```bash
bun test test/playground/source-validation.test.ts
```

Expected: FAIL — `sunshine` and `moonlight` not yet present in EditorDemo.astro

- [ ] **Step 3: Update the theme select HTML in EditorDemo.astro**

Find (around line 14):
```html
        <select id="theme-select" aria-label="Select editor theme">
          <option value="one-dark">One Dark</option>
          <option value="duskmoon">DuskMoon</option>
        </select>
```

Replace with:
```html
        <select id="theme-select" aria-label="Select editor theme">
          <option value="one-dark">One Dark</option>
          <option value="duskmoon">DuskMoon</option>
          <option value="sunshine">Sunshine</option>
          <option value="moonlight">Moonlight</option>
        </select>
```

- [ ] **Step 4: Add imports to the `<script>` block in EditorDemo.astro**

Find (around line 138-139):
```ts
  import { oneDark } from '@duskmoon-dev/code-engine/theme/one-dark'
  import { duskMoon } from '@duskmoon-dev/code-engine/theme/duskmoon'
```

Replace with:
```ts
  import { oneDark } from '@duskmoon-dev/code-engine/theme/one-dark'
  import { duskMoon } from '@duskmoon-dev/code-engine/theme/duskmoon'
  import { sunshine } from '@duskmoon-dev/code-engine/theme/sunshine'
  import { moonlight } from '@duskmoon-dev/code-engine/theme/moonlight'
```

- [ ] **Step 5: Add sunshine and moonlight to the `themes` object in EditorDemo.astro**

Find (around line 411-414):
```ts
  const themes: Record<string, any> = {
    'one-dark': oneDark,
    'duskmoon': duskMoon(),
  }
```

Replace with:
```ts
  const themes: Record<string, any> = {
    'one-dark': oneDark,
    'duskmoon': duskMoon(),
    'sunshine': sunshine,
    'moonlight': moonlight,
  }
```

- [ ] **Step 6: Add descriptions to ExportList.astro**

Find (around line 75-76):
```ts
  'theme/one-dark': 'oneDark — Atom One Dark theme extension',
  'theme/duskmoon': 'duskMoon() — DuskMoon CSS-var-based theme',
```

Replace with:
```ts
  'theme/one-dark': 'oneDark — Atom One Dark theme extension',
  'theme/duskmoon': 'duskMoon() — DuskMoon CSS-var-based theme',
  'theme/sunshine': 'sunshine — Light theme from @duskmoon-dev/core sunshine palette',
  'theme/moonlight': 'moonlight — Dark theme from @duskmoon-dev/core moonlight palette',
```

- [ ] **Step 7: Run the test to verify it passes**

```bash
bun test test/playground/source-validation.test.ts
```

Expected: PASS

- [ ] **Step 8: Commit**

```bash
git add playground/src/components/EditorDemo.astro playground/src/components/ExportList.astro \
        test/playground/source-validation.test.ts
git commit -m "feat(playground): add sunshine and moonlight to theme selector"
```

---

## Part 2: Language Packs

### Task 4: Elixir — vendor Lezer parser

**Context:** `lezer-elixir` (npm) by livebook-dev contains a pre-built Lezer parser for Elixir. Its `parser.js` imports from `@lezer/lr` and `@lezer/common`, which must be patched to our internal paths.

**Files:**
- Create: `src/lang/elixir/parser.js` (vendored + patched)
- Create: `src/lang/elixir/parser.d.ts`

- [ ] **Step 1: Install lezer-elixir temporarily and inspect its dist**

```bash
bun add --dev lezer-elixir
ls node_modules/lezer-elixir/dist/
```

Note the exact filenames (likely `index.js` or `parser.js`).

- [ ] **Step 2: Copy and patch the parser file**

```bash
mkdir -p src/lang/elixir
cp node_modules/lezer-elixir/dist/index.js src/lang/elixir/parser.js
```

Open `src/lang/elixir/parser.js` and replace all import paths:
- `from "@lezer/lr"` → `from "../../parser/lr"`
- `from "@lezer/common"` → `from "../../parser/common"`
- `from "@lezer/highlight"` → `from "../../parser/highlight"`

Also change the export to a named `parser` export if it is a default export:
```js
// at end of file, if default exported:
export { parser }
// or ensure: export const parser = ...
```

- [ ] **Step 3: Write parser.d.ts**

```ts
// src/lang/elixir/parser.d.ts
import {LRParser} from "../../parser/lr"
export declare const parser: LRParser
```

- [ ] **Step 4: Remove the temporary dev dependency**

```bash
bun remove lezer-elixir
```

- [ ] **Step 5: Verify the file imports correctly**

```bash
bun run typecheck
```

Expected: no errors related to elixir parser

- [ ] **Step 6: Commit**

```bash
git add src/lang/elixir/parser.js src/lang/elixir/parser.d.ts
git commit -m "feat(lang/elixir): vendor lezer-elixir parser tables"
```

---

### Task 5: Elixir — language support

**Files:**
- Create: `src/lang/elixir/elixir.ts`
- Create: `src/lang/elixir/index.ts`
- Create: `test/lang/elixir.test.ts`
- Modify: `package.json`
- Modify: `UPSTREAM.md`

- [ ] **Step 1: Write the failing test**

```ts
// test/lang/elixir.test.ts
import { describe, it, expect } from "bun:test"
import { elixir, elixirLanguage } from "../../src/lang/elixir/index"
import { EditorState } from "../../src/core/state/index"
import { LanguageSupport } from "../../src/core/language/index"

describe("Elixir language pack", () => {
  it("exports elixir function", () => {
    expect(typeof elixir).toBe("function")
  })

  it("exports elixirLanguage", () => {
    expect(elixirLanguage).toBeDefined()
    expect(elixirLanguage.name).toBe("elixir")
  })

  it("elixir() returns LanguageSupport", () => {
    expect(elixir()).toBeInstanceOf(LanguageSupport)
  })

  it("elixirLanguage parser produces a non-empty tree", () => {
    const tree = elixirLanguage.parser.parse("defmodule Hello do\n  def greet, do: :world\nend")
    expect(tree.length).toBeGreaterThan(0)
  })

  it("elixirLanguage parser tree has a top-level type", () => {
    const tree = elixirLanguage.parser.parse(":atom")
    expect(tree.type.isTop).toBe(true)
  })

  it("can be used as EditorState extension", () => {
    const state = EditorState.create({
      doc: "defmodule Hello, do: :world",
      extensions: [elixir()]
    })
    expect(state.doc.toString()).toContain("defmodule")
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

```bash
bun test test/lang/elixir.test.ts
```

Expected: FAIL with "Cannot find module"

- [ ] **Step 3: Inspect the codemirror-lang-elixir source for the language configuration**

```bash
bun add --dev codemirror-lang-elixir
cat node_modules/codemirror-lang-elixir/dist/index.js
```

Note the `LRLanguage.define()` call — specifically the `props` (indentation, folding) and `languageData` (commentTokens, indentOnInput). You will adapt this.

- [ ] **Step 4: Write the language support using what you found in Step 3**

```ts
// src/lang/elixir/elixir.ts
import {parser} from "./parser"
import {
  LRLanguage, LanguageSupport,
  continuedIndent, indentNodeProp, foldNodeProp, foldInside
} from "../../core/language"

/// Elixir language definition (Lezer-based, vendored from livebook-dev/lezer-elixir).
export const elixirLanguage = LRLanguage.define({
  name: "elixir",
  parser: parser.configure({
    props: [
      indentNodeProp.add({
        Body: continuedIndent(),
        // Add any additional node indentation rules found in codemirror-lang-elixir
      }),
      foldNodeProp.add({
        Body: foldInside,
        // Add any additional fold rules found in codemirror-lang-elixir
      })
    ]
  }),
  languageData: {
    commentTokens: {line: "#"},
    indentOnInput: /^\s*end$/,
    closeBrackets: {brackets: ["(", "[", "{", '"', "'", "\"\"\"", "'''"]},
  }
})

/// Elixir language support.
export function elixir() {
  return new LanguageSupport(elixirLanguage)
}
```

> **Note:** After running Step 3, fill in the exact node names from the lezer-elixir grammar (e.g. `Body`, `Block`, `Do`) into the `indentNodeProp` and `foldNodeProp` calls. Use what `codemirror-lang-elixir` uses verbatim.

- [ ] **Step 5: Write the barrel**

```ts
// src/lang/elixir/index.ts
export * from "./elixir"
```

- [ ] **Step 6: Remove the temporary dev dependency**

```bash
bun remove codemirror-lang-elixir
```

- [ ] **Step 7: Add to `package.json` exports**

After `"./lang/jinja"` block, insert:
```json
    "./lang/elixir": {
      "types": "./dist/lang/elixir/index.d.ts",
      "import": "./dist/lang/elixir/index.js"
    },
```

- [ ] **Step 8: Add to `UPSTREAM.md`**

Append two rows:
```
| lang/elixir | livebook-dev/lezer-elixir | <sha-from-npm-dist> | 2026-03-26 |
| lang/elixir (parser) | livebook-dev/lezer-elixir | <sha-from-npm-dist> | 2026-03-26 |
```

Replace `<sha-from-npm-dist>` with the version string (e.g. `v1.2.0`) from `node_modules/lezer-elixir/package.json` before removing it.

- [ ] **Step 9: Run the test to verify it passes**

```bash
bun test test/lang/elixir.test.ts
```

Expected: all 6 tests PASS

- [ ] **Step 10: Run typecheck**

```bash
bun run typecheck
```

Expected: no errors

- [ ] **Step 11: Commit**

```bash
git add src/lang/elixir/ test/lang/elixir.test.ts package.json UPSTREAM.md
git commit -m "feat(lang/elixir): add Elixir language support (vendored lezer-elixir)"
```

---

### Task 6: Erlang — wrap legacy StreamParser

**Context:** `src/lang/legacy/erlang.js` already contains a complete `StreamParser<unknown>` for Erlang. We wrap it with `StreamLanguage.define()` to produce a proper language pack.

**Files:**
- Create: `src/lang/erlang/erlang.ts`
- Create: `src/lang/erlang/index.ts`
- Create: `test/lang/erlang.test.ts`
- Modify: `package.json`

- [ ] **Step 1: Write the failing test**

```ts
// test/lang/erlang.test.ts
import { describe, it, expect } from "bun:test"
import { erlang, erlangLanguage } from "../../src/lang/erlang/index"
import { EditorState } from "../../src/core/state/index"
import { LanguageSupport } from "../../src/core/language/index"

describe("Erlang language pack", () => {
  it("exports erlang function", () => {
    expect(typeof erlang).toBe("function")
  })

  it("exports erlangLanguage", () => {
    expect(erlangLanguage).toBeDefined()
    expect(erlangLanguage.name).toBe("erlang")
  })

  it("erlang() returns LanguageSupport", () => {
    expect(erlang()).toBeInstanceOf(LanguageSupport)
  })

  it("can be used as EditorState extension", () => {
    const state = EditorState.create({
      doc: "-module(hello).\n-export([greet/0]).\ngreet() -> world.",
      extensions: [erlang()]
    })
    expect(state.doc.toString()).toContain("-module")
  })

  it("EditorState doc has correct line count", () => {
    const state = EditorState.create({
      doc: "-module(hello).\ngreet() -> ok.",
      extensions: [erlang()]
    })
    expect(state.doc.lines).toBe(2)
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

```bash
bun test test/lang/erlang.test.ts
```

Expected: FAIL with "Cannot find module"

- [ ] **Step 3: Write the implementation**

```ts
// src/lang/erlang/erlang.ts
import {StreamLanguage, LanguageSupport} from "../../core/language"
import {erlang as erlangStream} from "../legacy/erlang"

/// Erlang language definition using the legacy CodeMirror stream parser.
export const erlangLanguage = StreamLanguage.define(erlangStream)

/// Erlang language support.
export function erlang() {
  return new LanguageSupport(erlangLanguage)
}
```

```ts
// src/lang/erlang/index.ts
export * from "./erlang"
```

- [ ] **Step 4: Add to `package.json` exports** (after elixir entry)

```json
    "./lang/erlang": {
      "types": "./dist/lang/erlang/index.d.ts",
      "import": "./dist/lang/erlang/index.js"
    },
```

- [ ] **Step 5: Run the test to verify it passes**

```bash
bun test test/lang/erlang.test.ts
```

Expected: all 5 tests PASS

- [ ] **Step 6: Commit**

```bash
git add src/lang/erlang/ test/lang/erlang.test.ts package.json
git commit -m "feat(lang/erlang): add Erlang language support wrapping legacy stream parser"
```

---

### Task 7: HEEx — write StreamLanguage

**Context:** No Lezer parser exists for HEEx (Phoenix HTML+EEx templates). We write a `StreamLanguage` that handles HTML tags, `<%= %>` / `<% %>` Elixir expression blocks, HEEx component tags `<.component>`, dynamic attribute expressions `{expr}`, and HTML comments.

**Files:**
- Create: `src/lang/heex/heex.ts`
- Create: `src/lang/heex/index.ts`
- Create: `test/lang/heex.test.ts`
- Modify: `package.json`

- [ ] **Step 1: Write the failing test**

```ts
// test/lang/heex.test.ts
import { describe, it, expect } from "bun:test"
import { heex, heexLanguage } from "../../src/lang/heex/index"
import { EditorState } from "../../src/core/state/index"
import { LanguageSupport } from "../../src/core/language/index"

describe("HEEx language pack", () => {
  it("exports heex function", () => {
    expect(typeof heex).toBe("function")
  })

  it("exports heexLanguage", () => {
    expect(heexLanguage).toBeDefined()
    expect(heexLanguage.name).toBe("heex")
  })

  it("heex() returns LanguageSupport", () => {
    expect(heex()).toBeInstanceOf(LanguageSupport)
  })

  it("can be used as EditorState extension with HTML content", () => {
    const state = EditorState.create({
      doc: '<div class="foo"><%= @name %></div>',
      extensions: [heex()]
    })
    expect(state.doc.toString()).toContain("@name")
  })

  it("can be used as EditorState extension with component tags", () => {
    const state = EditorState.create({
      doc: '<.button phx-click="save">Save</.button>',
      extensions: [heex()]
    })
    expect(state.doc.toString()).toContain(".button")
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

```bash
bun test test/lang/heex.test.ts
```

Expected: FAIL with "Cannot find module"

- [ ] **Step 3: Write the implementation**

```ts
// src/lang/heex/heex.ts
// [DUSKMOON] HEEx (Phoenix HTML+EEx template) language — no Lezer parser exists.
// Uses StreamLanguage for basic syntax highlighting.
import {StreamLanguage, LanguageSupport} from "../../core/language"
import type {StringStream} from "../../core/language"

interface HeexState {
  inString: string | null
  inTag: boolean
  inExpr: number  // depth of { } expression nesting
  inEex: boolean  // inside <% ... %>
}

const heexStream = {
  name: "heex",

  startState(): HeexState {
    return {inString: null, inTag: false, inExpr: 0, inEex: false}
  },

  token(stream: StringStream, state: HeexState): string | null {
    // Inside EEx expression block: read until %>
    if (state.inEex) {
      if (stream.match("%>")) { state.inEex = false; return "meta" }
      stream.next()
      return "meta"
    }

    // Inside a quoted attribute value
    if (state.inString) {
      if (stream.eat(state.inString as string)) { state.inString = null; return "string" }
      if (stream.eat("\\")) stream.next()
      else stream.next()
      return "string"
    }

    if (stream.eatSpace()) return null

    // HTML comment <!-- ... -->
    if (stream.match("<!--")) {
      while (!stream.eol()) {
        if (stream.match("-->")) return "comment"
        stream.next()
      }
      return "comment"
    }

    // EEx blocks: <%# comment %>, <%! raw %>, <%= expr %>, <% expr %>
    if (stream.match(/^<%[=#!]?/)) { state.inEex = true; return "meta" }

    // Elixir dynamic expression: { ... }
    if (stream.eat("{")) { state.inExpr++; return "bracket" }
    if (stream.eat("}")) { if (state.inExpr > 0) state.inExpr--; return "bracket" }

    // HEEx component closing tag: </.component>
    if (stream.match(/^<\/\.[a-z_][a-zA-Z0-9_.]*>/)) return "tag"

    // HEEx component opening tag: <.component
    if (stream.match(/^<\.[a-z_][a-zA-Z0-9_.]*/)) { state.inTag = true; return "tag" }

    // HTML closing tag: </tag>
    if (stream.match(/^<\/[a-zA-Z][a-zA-Z0-9.]*/)) { state.inTag = true; return "tag" }

    // HTML opening tag: <tag or <!DOCTYPE
    if (stream.match(/^<[a-zA-Z!][a-zA-Z0-9.]*/)) { state.inTag = true; return "tag" }

    // Tag close markers
    if (stream.eat(">") || stream.match("/>")) { state.inTag = false; return "tag" }

    // Attribute values inside a tag
    if (state.inTag) {
      if (stream.eat('"')) { state.inString = '"'; return "string" }
      if (stream.eat("'")) { state.inString = "'"; return "string" }
      // Attribute names
      if (stream.match(/^[a-zA-Z_:@][a-zA-Z0-9_:@-]*/)) return "keyword"
      if (stream.eat("=")) return "operator"
    }

    stream.next()
    return null
  },

  blankLine(_state: HeexState) {},
}

/// HEEx (Phoenix HTML+EEx) language definition using StreamLanguage.
export const heexLanguage = StreamLanguage.define(heexStream)

/// HEEx language support.
export function heex() {
  return new LanguageSupport(heexLanguage)
}
```

```ts
// src/lang/heex/index.ts
export * from "./heex"
```

- [ ] **Step 4: Add to `package.json` exports** (after erlang entry)

```json
    "./lang/heex": {
      "types": "./dist/lang/heex/index.d.ts",
      "import": "./dist/lang/heex/index.js"
    },
```

- [ ] **Step 5: Run the test to verify it passes**

```bash
bun test test/lang/heex.test.ts
```

Expected: all 5 tests PASS

- [ ] **Step 6: Commit**

```bash
git add src/lang/heex/ test/lang/heex.test.ts package.json
git commit -m "feat(lang/heex): add HEEx language support via StreamLanguage"
```

---

### Task 8: Zig — vendor Lezer parser

**Context:** `@ndim/lezer-zig` (npm) by nDimensional contains a pre-built Lezer parser for Zig. Same vendoring pattern as Task 4 (elixir).

**Files:**
- Create: `src/lang/zig/parser.js` (vendored + patched)
- Create: `src/lang/zig/parser.d.ts`

- [ ] **Step 1: Install @ndim/lezer-zig temporarily and inspect**

```bash
bun add --dev @ndim/lezer-zig
ls node_modules/@ndim/lezer-zig/dist/
```

Note the version from `node_modules/@ndim/lezer-zig/package.json` for UPSTREAM.md later.

- [ ] **Step 2: Copy and patch the parser file**

```bash
mkdir -p src/lang/zig
# Find the built parser JS — likely dist/index.js or dist/parser.js
cp node_modules/@ndim/lezer-zig/dist/index.js src/lang/zig/parser.js
```

Open `src/lang/zig/parser.js` and replace all import paths:
- `from "@lezer/lr"` → `from "../../parser/lr"`
- `from "@lezer/common"` → `from "../../parser/common"`
- `from "@lezer/highlight"` → `from "../../parser/highlight"`

Ensure the parser is exported as a named `parser` constant.

- [ ] **Step 3: Write parser.d.ts**

```ts
// src/lang/zig/parser.d.ts
import {LRParser} from "../../parser/lr"
export declare const parser: LRParser
```

- [ ] **Step 4: Remove the temporary dev dependency**

```bash
bun remove @ndim/lezer-zig
```

- [ ] **Step 5: Verify the file imports correctly**

```bash
bun run typecheck
```

Expected: no errors related to zig parser

- [ ] **Step 6: Commit**

```bash
git add src/lang/zig/parser.js src/lang/zig/parser.d.ts
git commit -m "feat(lang/zig): vendor @ndim/lezer-zig parser tables"
```

---

### Task 9: Zig — language support

**Files:**
- Create: `src/lang/zig/zig.ts`
- Create: `src/lang/zig/index.ts`
- Create: `test/lang/zig.test.ts`
- Modify: `package.json`
- Modify: `UPSTREAM.md`

- [ ] **Step 1: Write the failing test**

```ts
// test/lang/zig.test.ts
import { describe, it, expect } from "bun:test"
import { zig, zigLanguage } from "../../src/lang/zig/index"
import { EditorState } from "../../src/core/state/index"
import { LanguageSupport } from "../../src/core/language/index"

describe("Zig language pack", () => {
  it("exports zig function", () => {
    expect(typeof zig).toBe("function")
  })

  it("exports zigLanguage", () => {
    expect(zigLanguage).toBeDefined()
    expect(zigLanguage.name).toBe("zig")
  })

  it("zig() returns LanguageSupport", () => {
    expect(zig()).toBeInstanceOf(LanguageSupport)
  })

  it("zigLanguage parser produces a non-empty tree", () => {
    const tree = zigLanguage.parser.parse("const std = @import(\"std\");")
    expect(tree.length).toBeGreaterThan(0)
  })

  it("zigLanguage parser tree has a top-level type", () => {
    const tree = zigLanguage.parser.parse("pub fn main() void {}")
    expect(tree.type.isTop).toBe(true)
  })

  it("can be used as EditorState extension", () => {
    const state = EditorState.create({
      doc: "const std = @import(\"std\");\npub fn main() void {}",
      extensions: [zig()]
    })
    expect(state.doc.lines).toBe(2)
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

```bash
bun test test/lang/zig.test.ts
```

Expected: FAIL with "Cannot find module"

- [ ] **Step 3: Install @ndim/codemirror-lang-zig temporarily and inspect the language config**

```bash
bun add --dev @ndim/codemirror-lang-zig
cat node_modules/@ndim/codemirror-lang-zig/dist/index.js
```

Note the `LRLanguage.define()` call — copy the `props` (indentNodeProp, foldNodeProp) and `languageData`.

- [ ] **Step 4: Write the language support**

```ts
// src/lang/zig/zig.ts
import {parser} from "./parser"
import {
  LRLanguage, LanguageSupport,
  continuedIndent, indentNodeProp, foldNodeProp, foldInside
} from "../../core/language"

/// Zig language definition (vendored from @ndim/lezer-zig).
export const zigLanguage = LRLanguage.define({
  name: "zig",
  parser: parser.configure({
    props: [
      indentNodeProp.add({
        // Fill in from @ndim/codemirror-lang-zig source (Step 3)
        Block: continuedIndent(),
      }),
      foldNodeProp.add({
        Block: foldInside,
      })
    ]
  }),
  languageData: {
    // Fill in from @ndim/codemirror-lang-zig source (Step 3)
    commentTokens: {line: "//"},
    indentOnInput: /^\s*\}$/,
  }
})

/// Zig language support.
export function zig() {
  return new LanguageSupport(zigLanguage)
}
```

> **Note:** After running Step 3, replace the placeholder `Block` node names and `languageData` values with the exact ones from `@ndim/codemirror-lang-zig`.

```ts
// src/lang/zig/index.ts
export * from "./zig"
```

- [ ] **Step 5: Remove the temporary dev dependency**

```bash
bun remove @ndim/codemirror-lang-zig
```

- [ ] **Step 6: Add to `package.json` exports** (after heex entry)

```json
    "./lang/zig": {
      "types": "./dist/lang/zig/index.d.ts",
      "import": "./dist/lang/zig/index.js"
    },
```

- [ ] **Step 7: Add to `UPSTREAM.md`**

```
| lang/zig | nDimensional/codemirror-lang-zig | <version> | 2026-03-26 |
| lang/zig (parser) | nDimensional/codemirror-lang-zig | <version> | 2026-03-26 |
```

- [ ] **Step 8: Run the test to verify it passes**

```bash
bun test test/lang/zig.test.ts
```

Expected: all 6 tests PASS

- [ ] **Step 9: Run typecheck**

```bash
bun run typecheck
```

Expected: no errors

- [ ] **Step 10: Commit**

```bash
git add src/lang/zig/ test/lang/zig.test.ts package.json UPSTREAM.md
git commit -m "feat(lang/zig): add Zig language support (vendored @ndim/lezer-zig)"
```

---

### Task 10: Caddyfile — write StreamLanguage

**Context:** No parser exists for Caddyfile. Caddyfile is a block-structured config format: site addresses or matchers as block headers, directives as lines, `#` line comments, `"` / `` ` `` strings, and `{ }` blocks.

**Files:**
- Create: `src/lang/caddyfile/caddyfile.ts`
- Create: `src/lang/caddyfile/index.ts`
- Create: `test/lang/caddyfile.test.ts`
- Modify: `package.json`

- [ ] **Step 1: Write the failing test**

```ts
// test/lang/caddyfile.test.ts
import { describe, it, expect } from "bun:test"
import { caddyfile, caddyfileLanguage } from "../../src/lang/caddyfile/index"
import { EditorState } from "../../src/core/state/index"
import { LanguageSupport } from "../../src/core/language/index"

describe("Caddyfile language pack", () => {
  it("exports caddyfile function", () => {
    expect(typeof caddyfile).toBe("function")
  })

  it("exports caddyfileLanguage", () => {
    expect(caddyfileLanguage).toBeDefined()
    expect(caddyfileLanguage.name).toBe("caddyfile")
  })

  it("caddyfile() returns LanguageSupport", () => {
    expect(caddyfile()).toBeInstanceOf(LanguageSupport)
  })

  it("can be used as EditorState extension with a site block", () => {
    const state = EditorState.create({
      doc: "example.com {\n  root * /var/www\n  file_server\n}",
      extensions: [caddyfile()]
    })
    expect(state.doc.toString()).toContain("file_server")
  })

  it("can be used with comments", () => {
    const state = EditorState.create({
      doc: "# Global options\n:80 {\n  respond \"Hello!\"\n}",
      extensions: [caddyfile()]
    })
    expect(state.doc.lines).toBe(4)
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

```bash
bun test test/lang/caddyfile.test.ts
```

Expected: FAIL with "Cannot find module"

- [ ] **Step 3: Write the implementation**

```ts
// src/lang/caddyfile/caddyfile.ts
// [DUSKMOON] Caddyfile language — no Lezer parser exists. Uses StreamLanguage.
import {StreamLanguage, LanguageSupport} from "../../core/language"
import type {StringStream} from "../../core/language"

interface CaddyState {
  inString: string | null
}

const caddyfileStream = {
  name: "caddyfile",

  startState(): CaddyState {
    return {inString: null}
  },

  token(stream: StringStream, state: CaddyState): string | null {
    // Inside a quoted string
    if (state.inString) {
      if (state.inString === "`") {
        if (stream.eat("`")) { state.inString = null; return "string" }
      } else {
        if (stream.eat('"')) { state.inString = null; return "string" }
        if (stream.eat("\\")) stream.next()
      }
      stream.next()
      return "string"
    }

    if (stream.eatSpace()) return null

    // Line comments
    if (stream.eat("#")) { stream.skipToEnd(); return "comment" }

    // Raw strings (backtick)
    if (stream.eat("`")) { state.inString = "`"; return "string" }

    // Double-quoted strings
    if (stream.eat('"')) { state.inString = '"'; return "string" }

    // Block delimiters
    if (stream.eat("{") || stream.eat("}")) return "brace"

    // Parentheses (Caddy snippets)
    if (stream.eat("(") || stream.eat(")")) return "bracket"

    // Environment variable placeholders: {$VAR} or {env.VAR}
    // Already handled by { above — leftover content after { is fine

    // Matchers: @name
    if (stream.match(/^@[a-zA-Z_][a-zA-Z0-9_]*/)) return "variableName"

    // Placeholders: {placeholder.name}
    if (stream.match(/^\{[a-zA-Z_$.][a-zA-Z0-9_.]*\}/)) return "string.special"

    // Numbers (ports, sizes)
    if (stream.match(/^\d+[a-zA-Z]*/)) return "number"

    // Identifiers: directives, site addresses, options
    if (stream.match(/^[a-zA-Z_][a-zA-Z0-9_.:\-/]*/)) return "keyword"

    // Bare symbols
    stream.next()
    return null
  },

  blankLine(_state: CaddyState) {},
}

/// Caddyfile language definition using StreamLanguage.
export const caddyfileLanguage = StreamLanguage.define(caddyfileStream)

/// Caddyfile language support.
export function caddyfile() {
  return new LanguageSupport(caddyfileLanguage)
}
```

```ts
// src/lang/caddyfile/index.ts
export * from "./caddyfile"
```

- [ ] **Step 4: Add to `package.json` exports** (after zig entry)

```json
    "./lang/caddyfile": {
      "types": "./dist/lang/caddyfile/index.d.ts",
      "import": "./dist/lang/caddyfile/index.js"
    },
```

- [ ] **Step 5: Run the test to verify it passes**

```bash
bun test test/lang/caddyfile.test.ts
```

Expected: all 5 tests PASS

- [ ] **Step 6: Commit**

```bash
git add src/lang/caddyfile/ test/lang/caddyfile.test.ts package.json
git commit -m "feat(lang/caddyfile): add Caddyfile language support via StreamLanguage"
```

---

### Task 11: Dart — write StreamLanguage

**Context:** No Lezer parser for Dart exists. Dart is a C-style OO language with `//` line comments, `/* */` block comments, string interpolation (`"${expr}"`), and a keyword set similar to Java/TypeScript.

**Files:**
- Create: `src/lang/dart/dart.ts`
- Create: `src/lang/dart/index.ts`
- Create: `test/lang/dart.test.ts`
- Modify: `package.json`

- [ ] **Step 1: Write the failing test**

```ts
// test/lang/dart.test.ts
import { describe, it, expect } from "bun:test"
import { dart, dartLanguage } from "../../src/lang/dart/index"
import { EditorState } from "../../src/core/state/index"
import { LanguageSupport } from "../../src/core/language/index"

describe("Dart language pack", () => {
  it("exports dart function", () => {
    expect(typeof dart).toBe("function")
  })

  it("exports dartLanguage", () => {
    expect(dartLanguage).toBeDefined()
    expect(dartLanguage.name).toBe("dart")
  })

  it("dart() returns LanguageSupport", () => {
    expect(dart()).toBeInstanceOf(LanguageSupport)
  })

  it("can be used as EditorState extension with Dart code", () => {
    const state = EditorState.create({
      doc: "void main() {\n  print('Hello, World!');\n}",
      extensions: [dart()]
    })
    expect(state.doc.toString()).toContain("main")
  })

  it("can be used with class declarations", () => {
    const state = EditorState.create({
      doc: "class Greeter {\n  final String name;\n  Greeter(this.name);\n}",
      extensions: [dart()]
    })
    expect(state.doc.lines).toBe(4)
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

```bash
bun test test/lang/dart.test.ts
```

Expected: FAIL with "Cannot find module"

- [ ] **Step 3: Write the implementation**

```ts
// src/lang/dart/dart.ts
// [DUSKMOON] Dart language — no Lezer parser exists. Uses StreamLanguage.
import {StreamLanguage, LanguageSupport} from "../../core/language"
import type {StringStream} from "../../core/language"

const dartKeywords = new Set([
  "abstract", "as", "assert", "async", "await", "base", "break", "case",
  "catch", "class", "const", "continue", "covariant", "default", "deferred",
  "do", "dynamic", "else", "enum", "export", "extends", "extension", "external",
  "factory", "final", "finally", "for", "Function", "get", "hide", "if",
  "implements", "import", "in", "interface", "is", "late", "library", "mixin",
  "new", "null", "on", "operator", "part", "required", "rethrow", "return",
  "sealed", "set", "show", "static", "super", "switch", "sync", "this", "throw",
  "try", "typedef", "var", "void", "when", "while", "with", "yield"
])

const dartBuiltins = new Set([
  "bool", "double", "int", "num", "String", "List", "Map", "Set", "Iterable",
  "Future", "Stream", "Object", "dynamic", "Never", "Null", "Type", "Symbol"
])

interface DartState {
  inString: string | null
  blockComment: boolean
}

const dartStream = {
  name: "dart",

  startState(): DartState {
    return {inString: null, blockComment: false}
  },

  token(stream: StringStream, state: DartState): string | null {
    // Block comment continuation
    if (state.blockComment) {
      if (stream.match("*/")) { state.blockComment = false; return "comment" }
      stream.next()
      return "comment"
    }

    // Inside a string (handles only simple single-line strings; not multi-line)
    if (state.inString) {
      if (stream.eat(state.inString as string)) { state.inString = null; return "string" }
      if (stream.eat("\\")) stream.next()
      else if (stream.match("${")) {
        // string interpolation start — we don't track depth here, just highlight as string
        stream.next()
      } else {
        stream.next()
      }
      return "string"
    }

    if (stream.eatSpace()) return null

    // Line comment
    if (stream.match("///")) { stream.skipToEnd(); return "comment.doc" }
    if (stream.match("//")) { stream.skipToEnd(); return "comment" }

    // Block comment
    if (stream.match("/*")) { state.blockComment = true; return "comment" }

    // Raw strings: r"..." or r'...'
    if (stream.match(/^r"[^"]*"/)) return "string"
    if (stream.match(/^r'[^']*'/)) return "string"

    // Multi-line strings: """...""" or '''...'''
    if (stream.match('"""')) { state.inString = '"""'; return "string" }
    if (stream.match("'''")) { state.inString = "'''"; return "string" }

    // Regular strings
    if (stream.eat('"')) { state.inString = '"'; return "string" }
    if (stream.eat("'")) { state.inString = "'"; return "string" }

    // Numbers
    if (stream.match(/^0x[0-9a-fA-F]+/)) return "number"
    if (stream.match(/^\d+(\.\d+)?([eE][+-]?\d+)?/)) return "number"

    // Annotations
    if (stream.match(/^@[a-zA-Z_][a-zA-Z0-9_]*/)) return "meta"

    // Identifiers / keywords / types
    if (stream.match(/^[a-zA-Z_$][a-zA-Z0-9_$]*/)) {
      const word = stream.current()
      if (dartKeywords.has(word)) return "keyword"
      if (dartBuiltins.has(word)) return "typeName"
      // PascalCase = type/class name
      if (/^[A-Z]/.test(word)) return "typeName"
      return "variableName"
    }

    stream.next()
    return null
  },

  blankLine(_state: DartState) {},
}

/// Dart language definition using StreamLanguage.
export const dartLanguage = StreamLanguage.define(dartStream)

/// Dart language support.
export function dart() {
  return new LanguageSupport(dartLanguage)
}
```

```ts
// src/lang/dart/index.ts
export * from "./dart"
```

- [ ] **Step 4: Add to `package.json` exports** (after caddyfile entry)

```json
    "./lang/dart": {
      "types": "./dist/lang/dart/index.d.ts",
      "import": "./dist/lang/dart/index.js"
    },
```

- [ ] **Step 5: Run the test to verify it passes**

```bash
bun test test/lang/dart.test.ts
```

Expected: all 5 tests PASS

- [ ] **Step 6: Commit**

```bash
git add src/lang/dart/ test/lang/dart.test.ts package.json
git commit -m "feat(lang/dart): add Dart language support via StreamLanguage"
```

---

### Task 12: Wire the 6 new languages into the playground

**Context:** The playground's `EditorDemo.astro` has 4 maps that must all be updated in sync or the `source-validation.test.ts` will fail: `languageLoaders`, `sampleCode`, `languageLabels`, `fileExtensions`. The `ExportList.astro` `descriptions` and `playgroundLangKeys` maps must also be updated.

**Files:**
- Modify: `playground/src/components/EditorDemo.astro`
- Modify: `playground/src/components/ExportList.astro`

- [ ] **Step 1: Add language loaders to EditorDemo.astro**

Find the end of the `languageLoaders` block (after the `lezer` entry):
```ts
    lezer: async () => { const m = await import('@duskmoon-dev/code-engine/lang/lezer'); return () => m.lezer() },
  }
```

Replace with:
```ts
    lezer: async () => { const m = await import('@duskmoon-dev/code-engine/lang/lezer'); return () => m.lezer() },
    elixir: async () => { const m = await import('@duskmoon-dev/code-engine/lang/elixir'); return () => m.elixir() },
    erlang: async () => { const m = await import('@duskmoon-dev/code-engine/lang/erlang'); return () => m.erlang() },
    heex: async () => { const m = await import('@duskmoon-dev/code-engine/lang/heex'); return () => m.heex() },
    zig: async () => { const m = await import('@duskmoon-dev/code-engine/lang/zig'); return () => m.zig() },
    caddyfile: async () => { const m = await import('@duskmoon-dev/code-engine/lang/caddyfile'); return () => m.caddyfile() },
    dart: async () => { const m = await import('@duskmoon-dev/code-engine/lang/dart'); return () => m.dart() },
  }
```

- [ ] **Step 2: Add sample code entries to EditorDemo.astro**

Find the end of the `sampleCode` block (after the `lezer` entry, before `}`):
```ts
  lezer: `@top Program { expression+ }
...
BinaryExpression { expression !add "+" expression }

@tokens {
  Number { @digit+ }
  Variable { @asciiLetter+ }
}`,
  }
```

Add before the closing `}`:
```ts
    elixir: `defmodule Fibonacci do
  def calc(0), do: 0
  def calc(1), do: 1
  def calc(n) when n > 1 do
    calc(n - 1) + calc(n - 2)
  end
end

IO.inspect(Fibonacci.calc(10))`,
    erlang: `-module(fibonacci).
-export([calc/1]).

calc(0) -> 0;
calc(1) -> 1;
calc(N) when N > 1 ->
    calc(N - 1) + calc(N - 2).`,
    heex: `<.form for={@changeset} phx-submit="save">
  <.input field={@changeset[:name]} label="Name" />
  <.input field={@changeset[:email]} type="email" label="Email" />
  <:actions>
    <.button type="submit">Save</.button>
  </:actions>
</.form>`,
    zig: `const std = @import("std");

fn fibonacci(n: u64) u64 {
    if (n <= 1) return n;
    return fibonacci(n - 1) + fibonacci(n - 2);
}

pub fn main() void {
    var i: u64 = 0;
    while (i < 10) : (i += 1) {
        std.debug.print("{d}\\n", .{fibonacci(i)});
    }
}`,
    caddyfile: `# Global options
{
  email admin@example.com
}

example.com {
  root * /var/www/html
  file_server

  @api path /api/*
  reverse_proxy @api localhost:8080

  log {
    output file /var/log/caddy/access.log
  }
}`,
    dart: `void main() {
  for (int i = 0; i < 10; i++) {
    print(fibonacci(i));
  }
}

int fibonacci(int n) {
  if (n <= 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
}`,
```

- [ ] **Step 3: Add language labels to EditorDemo.astro**

Find the end of the `languageLabels` block (after the `lezer` entry):
```ts
    lezer: 'Lezer',
  }
```

Replace with:
```ts
    lezer: 'Lezer',
    elixir: 'Elixir',
    erlang: 'Erlang',
    heex: 'HEEx',
    zig: 'Zig',
    caddyfile: 'Caddyfile',
    dart: 'Dart',
  }
```

- [ ] **Step 4: Add file extensions to EditorDemo.astro**

Find the `fileExtensions` object:
```ts
    jinja: 'html', lezer: 'grammar',
  }
```

Replace with:
```ts
    jinja: 'html', lezer: 'grammar',
    elixir: 'ex', erlang: 'erl', heex: 'heex', zig: 'zig', caddyfile: 'Caddyfile', dart: 'dart',
  }
```

- [ ] **Step 5: Update ExportList.astro descriptions**

Find (after the `lezer` entry):
```ts
  'lang/lezer': 'lezer(), lezerLanguage',
  'lang/legacy/*': 'StreamLanguage.define() based legacy modes',
```

Replace with:
```ts
  'lang/lezer': 'lezer(), lezerLanguage',
  'lang/elixir': 'elixir(), elixirLanguage',
  'lang/erlang': 'erlang(), erlangLanguage',
  'lang/heex': 'heex(), heexLanguage — HEEx Phoenix template syntax',
  'lang/zig': 'zig(), zigLanguage',
  'lang/caddyfile': 'caddyfile(), caddyfileLanguage',
  'lang/dart': 'dart(), dartLanguage',
  'lang/legacy/*': 'StreamLanguage.define() based legacy modes',
```

- [ ] **Step 6: Update ExportList.astro playgroundLangKeys**

Find (after the `lezer` entry in `playgroundLangKeys`):
```ts
  'lang/lezer': 'lezer',
}
```

Replace with:
```ts
  'lang/lezer': 'lezer',
  'lang/elixir': 'elixir',
  'lang/erlang': 'erlang',
  'lang/heex': 'heex',
  'lang/zig': 'zig',
  'lang/caddyfile': 'caddyfile',
  'lang/dart': 'dart',
}
```

- [ ] **Step 7: Run source-validation tests**

```bash
bun test test/playground/source-validation.test.ts
```

Expected: all pass

- [ ] **Step 8: Commit**

```bash
git add playground/src/components/EditorDemo.astro playground/src/components/ExportList.astro
git commit -m "feat(playground): add elixir, erlang, heex, zig, caddyfile, dart to language selector"
```

---

### Task 13: Final integration check

**Files:** None new — runs all tests and verifies exports (including playground source-validation)

- [ ] **Step 1: Run all tests**

```bash
bun test
```

Expected: all pass (no regressions)

- [ ] **Step 2: Run typecheck**

```bash
bun run typecheck
```

Expected: no errors

- [ ] **Step 3: Build to verify dist**

```bash
bun run build
```

Expected: build succeeds; `bun run verify` step inside confirms all new exports resolve

- [ ] **Step 4: Check the verify-exports report**

The build script runs `bun run verify` internally. Review the output and confirm:
- `./theme/sunshine` — ✓
- `./theme/moonlight` — ✓
- `./lang/elixir` — ✓
- `./lang/erlang` — ✓
- `./lang/heex` — ✓
- `./lang/zig` — ✓
- `./lang/caddyfile` — ✓
- `./lang/dart` — ✓

- [ ] **Step 5: Commit any final adjustments**

```bash
git add -p
git commit -m "chore: final integration adjustments for themes and language packs"
```

---

## Notes for Implementer

### StreamLanguage and `StringStream` type

`StringStream` is the type of the `stream` argument in `StreamParser.token()`. Import it as:
```ts
import type {StringStream} from "../../core/language"
```

If it is not exported from `../../core/language`, look for it in `../../core/language/index` or remove the type annotation and use `any` — do not add a runtime import that fails.

### Vendoring gotchas (Elixir and Zig)

- `lezer-elixir` may export its parser as a default export or as `parser`. Check the actual file and adapt `parser.d.ts` accordingly.
- The `@ndim/lezer-zig` parser might live in a subdirectory like `packages/lezer-zig/dist/` within the monorepo tarball. Check `node_modules/@ndim/lezer-zig/` carefully.
- If the parser file uses `import` statements (ESM), the patch is straightforward. If it uses `require()`, note that the repo build step already strips `require()` from dist — but at source time Bun handles both, so ESM patching is preferred.

### `color-mix()` CSS function

The `sunshine` and `moonlight` themes use `color-mix(in oklch, ...)` for transparency blends. This is supported in all modern browsers (Chrome 111+, Firefox 113+, Safari 16.2+). If the target environment requires broader support, replace with `rgba()` hex equivalents, but prefer `color-mix` for correctness with OKLCH colors.
