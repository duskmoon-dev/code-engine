# @duskmoon-dev/code-engine

[![CI](https://github.com/duskmoon-dev/code-engine/actions/workflows/ci.yml/badge.svg)](https://github.com/duskmoon-dev/code-engine/actions/workflows/ci.yml)
[![Test](https://github.com/duskmoon-dev/code-engine/actions/workflows/test.yml/badge.svg)](https://github.com/duskmoon-dev/code-engine/actions/workflows/test.yml)
[![npm version](https://img.shields.io/npm/v/@duskmoon-dev/code-engine)](https://www.npmjs.com/package/@duskmoon-dev/code-engine)

Deep fork of CodeMirror 6 + Lezer ecosystem — single package, zero dependencies.

Collapses 44 upstream repositories into one npm package with 43 tree-shakeable subpath exports.

## Install

```bash
bun add @duskmoon-dev/code-engine
```

## Quick Start

```typescript
import { EditorState } from "@duskmoon-dev/code-engine/state";
import { EditorView } from "@duskmoon-dev/code-engine/view";
import { basicSetup } from "@duskmoon-dev/code-engine/setup";
import { javascript } from "@duskmoon-dev/code-engine/lang/javascript";

new EditorView({
  state: EditorState.create({
    doc: 'console.log("Hello!");',
    extensions: [basicSetup, javascript()],
  }),
  parent: document.getElementById("editor")!,
});
```

## Exports

| Path | Description |
|------|-------------|
| `/state` | EditorState, Transaction, Text, StateField, StateEffect |
| `/view` | EditorView, ViewPlugin, Decoration, keymap, tooltips, panels, gutters |
| `/language` | Language, HighlightStyle, fold, indent, bracket matching |
| `/commands` | Default keymaps, history, undo/redo |
| `/search` | Search & replace |
| `/autocomplete` | Autocomplete, snippets, close brackets |
| `/lint` | Linting framework |
| `/collab` | Collaborative editing |
| `/merge` | Merge view |
| `/lsp` | LSP client integration |
| `/language-data` | Language metadata |
| `/parser/common` | Tree, SyntaxNode, Parser interface |
| `/parser/lr` | LR parser implementation |
| `/parser/highlight` | Syntax highlighting tags |
| `/lang/*` | 22 language packs: JavaScript, Python, HTML, CSS, JSON, Markdown, XML, SQL, Rust, Go, Java, C++, PHP, Sass, Less, YAML, Angular, Vue, Liquid, Wast, Jinja, Lezer |
| `/lang/legacy/*` | Stream modes: Elixir, Ruby, Erlang, Dart, Swift, Kotlin, Lua, Shell, Dockerfile, TOML, Nginx, Nix, Haskell, and more |
| `/theme/one-dark` | One Dark theme |
| `/theme/duskmoon` | DuskMoonUI theme (CSS custom properties) |
| `/keymaps/vim` | Vim keybindings |
| `/keymaps/emacs` | Emacs keybindings |
| `/setup` | `basicSetup` and `minimalSetup` extension arrays |

## Development

```bash
bun install                           # install dependencies
bun test                              # run tests (1000+ tests across 43 files)
bun test test/core/state.test.ts      # run a single test file
bun run typecheck                     # type check
bun run build                         # full build pipeline
bun run verify                        # verify all export paths
```

## License

MIT
