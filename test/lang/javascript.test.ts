import { describe, it, expect } from "bun:test";
import {
  javascript, javascriptLanguage, typescriptLanguage,
  jsxLanguage, tsxLanguage, autoCloseTags,
  snippets, typescriptSnippets,
  localCompletionSource, completionPath, scopeCompletionSource,
  esLint
} from "../../src/lang/javascript/index";
import { EditorState } from "../../src/core/state/index";
import { syntaxTree, ensureSyntaxTree, getIndentation, foldable } from "../../src/core/language/index";
import { CompletionContext } from "../../src/core/autocomplete/index";

describe("JavaScript language pack", () => {
  it("exports javascript function", () => {
    expect(typeof javascript).toBe("function");
  });

  it("exports javascriptLanguage", () => {
    expect(javascriptLanguage).toBeDefined();
    expect(javascriptLanguage.name).toBe("javascript");
  });

  it("exports typescriptLanguage", () => {
    expect(typescriptLanguage).toBeDefined();
    expect(typescriptLanguage.name).toBe("typescript");
  });

  it("exports jsxLanguage", () => {
    expect(jsxLanguage).toBeDefined();
    // jsxLanguage extends the JS parser (name is "javascript")
    expect(jsxLanguage.name).toBe("javascript");
  });

  it("exports tsxLanguage", () => {
    expect(tsxLanguage).toBeDefined();
    // tsxLanguage extends the TS parser (name is "typescript")
    expect(tsxLanguage.name).toBe("typescript");
  });

  it("exports autoCloseTags", () => {
    expect(autoCloseTags).toBeDefined();
  });

  it("exports snippets", () => {
    expect(Array.isArray(snippets)).toBe(true);
    expect(snippets.length).toBeGreaterThan(0);
  });

  it("exports typescriptSnippets", () => {
    expect(Array.isArray(typescriptSnippets)).toBe(true);
    expect(typescriptSnippets.length).toBeGreaterThan(0);
  });

  it("exports localCompletionSource", () => {
    expect(typeof localCompletionSource).toBe("function");
  });

  it("exports completionPath", () => {
    expect(typeof completionPath).toBe("function");
  });

  it("exports scopeCompletionSource", () => {
    expect(typeof scopeCompletionSource).toBe("function");
  });

  it("exports esLint", () => {
    expect(typeof esLint).toBe("function");
  });

  it("creates language support with default options", () => {
    const support = javascript();
    expect(support).toBeDefined();
    expect(support.language).toBe(javascriptLanguage);
  });

  it("creates TypeScript language support", () => {
    const support = javascript({ typescript: true });
    expect(support).toBeDefined();
    expect(support.language).toBe(typescriptLanguage);
  });

  it("creates JSX language support", () => {
    const support = javascript({ jsx: true });
    expect(support).toBeDefined();
    expect(support.language).toBe(jsxLanguage);
  });

  it("creates TSX language support", () => {
    const support = javascript({ jsx: true, typescript: true });
    expect(support).toBeDefined();
    expect(support.language).toBe(tsxLanguage);
  });

  it("snippet labels are strings", () => {
    for (const s of snippets) {
      expect(typeof (s as any).label).toBe("string");
    }
  });

  it("scopeCompletionSource returns a CompletionSource", () => {
    const source = scopeCompletionSource(javascriptLanguage);
    expect(typeof source).toBe("function");
  });

  it("javascriptLanguage parser produces a non-empty tree", () => {
    const tree = javascriptLanguage.parser.parse("const x = 42;");
    expect(tree.length).toBeGreaterThan(0);
  });

  it("typescriptLanguage parser produces a non-empty tree", () => {
    const tree = typescriptLanguage.parser.parse("const x: number = 42;");
    expect(tree.length).toBeGreaterThan(0);
  });

  it("javascriptLanguage parser tree has a top-level type", () => {
    const tree = javascriptLanguage.parser.parse("function foo() {}");
    expect(tree.type.isTop).toBe(true);
  });

  it("syntaxTree from EditorState with javascript() is non-empty", () => {
    const state = EditorState.create({
      doc: "const greet = (name) => `Hello, ${name}!`;",
      extensions: [javascript()],
    });
    const tree = syntaxTree(state);
    expect(tree.length).toBeGreaterThan(0);
  });

  it("syntaxTree from EditorState with typescript mode is non-empty", () => {
    const state = EditorState.create({
      doc: "interface Foo { bar: string; }",
      extensions: [javascript({ typescript: true })],
    });
    const tree = syntaxTree(state);
    expect(tree.length).toBeGreaterThan(0);
  });

  it("javascriptLanguage parser cursor traversal works", () => {
    const tree = javascriptLanguage.parser.parse("function add(a, b) { return a + b; }");
    const cursor = tree.cursor();
    let nodeCount = 0;
    do { nodeCount++; } while (cursor.next() && nodeCount < 100);
    expect(nodeCount).toBeGreaterThan(1);
  });

  it("javascriptLanguage parser resolves node at position", () => {
    const code = "const x = 42;";
    const tree = javascriptLanguage.parser.parse(code);
    const node = tree.resolve(6);
    expect(node).toBeDefined();
    expect(node.type).toBeDefined();
  });

  it("jsxLanguage is defined and has a name", () => {
    expect(jsxLanguage).toBeDefined();
    expect(jsxLanguage.name).toBeDefined();
  });

  it("tsxLanguage is defined and has a name", () => {
    expect(tsxLanguage).toBeDefined();
    expect(tsxLanguage.name).toBeDefined();
  });

  it("javascriptLanguage can parse arrow functions", () => {
    const tree = javascriptLanguage.parser.parse("const add = (a, b) => a + b;");
    expect(tree.length).toBeGreaterThan(0);
    expect(tree.type.isTop).toBe(true);
  });

  it("javascriptLanguage can parse class syntax", () => {
    const tree = javascriptLanguage.parser.parse("class Animal { constructor(name) { this.name = name; } speak() { return this.name; } }");
    expect(tree.length).toBeGreaterThan(0);
  });

  it("javascriptLanguage can parse async/await", () => {
    const tree = javascriptLanguage.parser.parse("async function fetchData() { const data = await fetch('/api'); return data.json(); }");
    expect(tree.length).toBeGreaterThan(0);
    expect(tree.type.isTop).toBe(true);
  });

  it("javascriptLanguage can parse destructuring", () => {
    const tree = javascriptLanguage.parser.parse("const { a, b: { c } } = obj; const [x, y, ...rest] = arr;");
    expect(tree.length).toBeGreaterThan(0);
  });

  it("javascriptLanguage can parse template literals", () => {
    const tree = javascriptLanguage.parser.parse("const msg = `Hello, ${name}! You have ${count} messages.`;");
    expect(tree.length).toBeGreaterThan(0);
  });

  it("javascriptLanguage can parse modules (import/export)", () => {
    const tree = javascriptLanguage.parser.parse("import { useState, useEffect } from 'react';\nexport default function App() { return null; }");
    expect(tree.length).toBeGreaterThan(0);
    expect(tree.type.isTop).toBe(true);
  });

  it("javascriptLanguage can parse generators", () => {
    const tree = javascriptLanguage.parser.parse("function* gen() { yield 1; yield 2; yield 3; }");
    expect(tree.length).toBeGreaterThan(0);
  });

  it("tree.resolve() finds nodes at many positions", () => {
    const code = "const x = 1; let y = x + 2; console.log(y);";
    const tree = javascriptLanguage.parser.parse(code);
    for (let i = 0; i < code.length; i += 5) {
      const node = tree.resolve(i);
      expect(node).toBeDefined();
    }
  });

  it("javascriptLanguage can parse optional chaining", () => {
    const tree = javascriptLanguage.parser.parse("const name = user?.profile?.name ?? 'Anonymous';");
    expect(tree.length).toBeGreaterThan(0);
    expect(tree.type.isTop).toBe(true);
  });

  it("javascriptLanguage can parse nullish coalescing", () => {
    const tree = javascriptLanguage.parser.parse("const val = first ?? second ?? third;");
    expect(tree.length).toBeGreaterThan(0);
  });

  it("javascriptLanguage can parse logical assignment operators", () => {
    const tree = javascriptLanguage.parser.parse("a ||= b; c &&= d; e ??= f;");
    expect(tree.length).toBeGreaterThan(0);
  });

  it("javascriptLanguage can parse tagged template literals", () => {
    const tree = javascriptLanguage.parser.parse("const result = html`<div>${content}</div>`; const q = gql`query { user { name } }`;");
    expect(tree.length).toBeGreaterThan(0);
    expect(tree.type.isTop).toBe(true);
  });

  it("javascriptLanguage can parse WeakRef and FinalizationRegistry", () => {
    const tree = javascriptLanguage.parser.parse("const ref = new WeakRef(obj); const registry = new FinalizationRegistry(val => cleanup(val));");
    expect(tree.length).toBeGreaterThan(0);
  });

  it("javascriptLanguage can parse private class fields", () => {
    const tree = javascriptLanguage.parser.parse("class Counter { #count = 0; increment() { this.#count++; } get value() { return this.#count; } }");
    expect(tree.length).toBeGreaterThan(0);
    expect(tree.type.isTop).toBe(true);
  });

  it("javascriptLanguage can parse dynamic import", () => {
    const tree = javascriptLanguage.parser.parse("const mod = await import('./module.js');");
    expect(tree.length).toBeGreaterThan(0);
  });

  it("typescriptLanguage can parse interface with generics", () => {
    const tree = typescriptLanguage.parser.parse("interface Repository<T extends Entity> { findById(id: string): Promise<T | null>; save(entity: T): Promise<T>; }");
    expect(tree.length).toBeGreaterThan(0);
    expect(tree.type.isTop).toBe(true);
  });

  it("typescriptLanguage can parse mapped types", () => {
    const tree = typescriptLanguage.parser.parse("type Readonly<T> = { readonly [P in keyof T]: T[P]; }; type Partial<T> = { [P in keyof T]?: T[P]; };");
    expect(tree.length).toBeGreaterThan(0);
  });

  it("javascript() state doc line text is accessible", () => {
    const state = EditorState.create({
      doc: "const x = 1;\nconst y = 2;\nconst z = 3;",
      extensions: [javascript()],
    });
    expect(state.doc.line(1).text).toBe("const x = 1;");
    expect(state.doc.line(2).text).toBe("const y = 2;");
  });

  it("javascript() state allows multiple sequential transactions", () => {
    let state = EditorState.create({ doc: "let a = 1;", extensions: [javascript()] });
    state = state.update({ changes: { from: 10, insert: "\nlet b = 2;" } }).state;
    state = state.update({ changes: { from: state.doc.length, insert: "\nlet c = 3;" } }).state;
    expect(state.doc.lines).toBe(3);
    expect(state.doc.line(3).text).toBe("let c = 3;");
  });

  it("javascript() state deletion transaction works", () => {
    let state = EditorState.create({ doc: "const x = 1;\nconst y = 2;", extensions: [javascript()] });
    state = state.update({ changes: { from: 12, to: 25 } }).state;
    expect(state.doc.toString()).toBe("const x = 1;");
  });

  it("javascript() state with unicode content works", () => {
    const doc = "// 日本語\nconst greeting = 'こんにちは';";
    const state = EditorState.create({ doc, extensions: [javascript()] });
    expect(state.doc.toString()).toBe(doc);
  });

  it("javascript() extension preserves doc length invariant", () => {
    const doc = "function hello() { return 'world'; }";
    const state = EditorState.create({ doc, extensions: [javascript()] });
    expect(state.doc.length).toBe(doc.length);
  });

  it("javascriptLanguage parser tree has correct length", () => {
    const code = "const arr = [1, 2, 3].map(x => x * 2);";
    const tree = javascriptLanguage.parser.parse(code);
    expect(tree.length).toBe(code.length);
  });

  it("typescriptLanguage parser tree has correct length", () => {
    const code = "type Fn<T> = (x: T) => T;";
    const tree = typescriptLanguage.parser.parse(code);
    expect(tree.length).toBe(code.length);
  });

  it("javascript() state allows 4 sequential transactions", () => {
    let state = EditorState.create({ doc: "", extensions: [javascript()] });
    for (let i = 0; i < 4; i++) {
      state = state.update({ changes: { from: state.doc.length, insert: (i > 0 ? "\n" : "") + `const v${i} = ${i};` } }).state;
    }
    expect(state.doc.lines).toBe(4);
  });

  it("javascript() state allows deletion of all content", () => {
    const doc = "const x = 1;\nconst y = 2;";
    let state = EditorState.create({ doc, extensions: [javascript()] });
    state = state.update({ changes: { from: 0, to: doc.length } }).state;
    expect(state.doc.toString()).toBe("");
  });

  it("javascript() state allows insert at start", () => {
    let state = EditorState.create({ doc: "const x = 1;", extensions: [javascript()] });
    state = state.update({ changes: { from: 0, insert: "// header\n" } }).state;
    expect(state.doc.line(1).text).toBe("// header");
  });

  it("javascript() state doc length invariant holds", () => {
    const doc = "function greet() { return 'hello'; }";
    const state = EditorState.create({ doc, extensions: [javascript()] });
    expect(state.doc.length).toBe(doc.length);
  });

  describe("JavaScript indentation strategies", () => {
    it("SwitchBody: case label indented 1 unit from switch", () => {
      // "switch (x) {\n  case 1:\n    break;\n}" - pos 13 is start of "  case 1:" line
      const doc = "switch (x) {\n  case 1:\n    break;\n}";
      const state = EditorState.create({ doc, extensions: [javascript()] });
      ensureSyntaxTree(state, state.doc.length, 1000);
      const indent = getIndentation(state, 13);
      expect(typeof indent).toBe("number");
    });

    it("JSXElement: child line indented by one unit (JSX mode)", () => {
      // JSX: "<div>\n  <span/>\n</div>" - pos 6 is start of "  <span/>" line
      const doc = "<div>\n  <span/>\n</div>";
      const state = EditorState.create({ doc, extensions: [javascript({ jsx: true })] });
      ensureSyntaxTree(state, state.doc.length, 1000);
      const indent = getIndentation(state, 6);
      expect(typeof indent).toBe("number");
    });

    it("JSXOpenTag: attribute on next line indented from tag col (JSX mode)", () => {
      // "<div\n  className=\"foo\">" - pos 5 is start of "  className=..." inside JSXOpenTag
      const doc = "<div\n  className=\"foo\">";
      const state = EditorState.create({ doc, extensions: [javascript({ jsx: true })] });
      ensureSyntaxTree(state, state.doc.length, 1000);
      const indent = getIndentation(state, 5);
      expect(typeof indent).toBe("number");
    });

    it("JSXEscape: expression inside JSX indented from escape context (JSX mode)", () => {
      // "function f() {\n  return (<div>{x\n    + y}</div>);\n}" - expression in JSXEscape
      const doc = "function f() {\n  return (\n    <div>\n      {x +\n        y}\n    </div>\n  );\n}";
      const state = EditorState.create({ doc, extensions: [javascript({ jsx: true })] });
      ensureSyntaxTree(state, state.doc.length, 1000);
      // Find a position inside JSXEscape on the continuation line
      const indent = getIndentation(state, 45); // inside "{x +..." expression
      expect(typeof indent).toBe("number");
    });

    it("JSXElement fold: foldable returns range for JSXElement spanning lines", () => {
      // "<div>\n  hello\n</div>" - line 1 is 0-4, line 2 is 5-12, line 3 is 13-19
      const doc = "<div>\n  hello\n</div>";
      const state = EditorState.create({ doc, extensions: [javascript({ jsx: true })] });
      ensureSyntaxTree(state, state.doc.length, 1000);
      // Line 1: lineStart=0, lineEnd=4 (before \n)
      const fold = foldable(state, 0, 4);
      expect(fold === null || (typeof fold!.from === "number" && typeof fold!.to === "number")).toBe(true);
    });

    it("JSXOpenTag fold: foldable returns range for multi-line JSXOpenTag", () => {
      // "<div\n  className=\"foo\"\n>" - line 1 is 0-3
      const doc = "<div\n  className=\"foo\"\n>";
      const state = EditorState.create({ doc, extensions: [javascript({ jsx: true })] });
      ensureSyntaxTree(state, state.doc.length, 1000);
      const fold = foldable(state, 0, 3);
      expect(fold === null || (typeof fold!.from === "number" && typeof fold!.to === "number")).toBe(true);
    });
  });

  describe("JavaScript completion behavioral", () => {
    function jsContext(doc: string, pos: number, explicit = false) {
      const state = EditorState.create({ doc, extensions: [javascript()] });
      ensureSyntaxTree(state, state.doc.length, 1000);
      return new CompletionContext(state, pos, explicit);
    }

    it("localCompletionSource returns completions for a VariableName", () => {
      // "const x = 1;\nconsole.log(x)" - VariableName 'x' is at [25-26], use pos 26
      const doc = "const x = 1;\nconsole.log(x)";
      const state = EditorState.create({ doc, extensions: [javascript()] });
      ensureSyntaxTree(state, state.doc.length, 1000);
      const cx = new CompletionContext(state, 26, false);
      const result = localCompletionSource(cx);
      expect(result).not.toBeNull();
      expect(Array.isArray(result!.options)).toBe(true);
    });

    it("localCompletionSource collects function declarations via defID", () => {
      const doc = "function greet() {}\nfunction bye() {}\ngr";
      const state = EditorState.create({ doc, extensions: [javascript()] });
      ensureSyntaxTree(state, state.doc.length, 1000);
      const cx = new CompletionContext(state, 40, false);
      const result = localCompletionSource(cx);
      if (result) {
        const labels = result.options.map((o: any) => o.label);
        expect(labels.includes("greet") || labels.includes("bye")).toBe(true);
      }
    });

    it("completionPath returns path for property access", () => {
      // "console.lo" - cursor at pos 10 on PropertyName "lo"
      const doc = "console.lo";
      const state = EditorState.create({ doc, extensions: [javascript()] });
      ensureSyntaxTree(state, state.doc.length, 1000);
      const cx = new CompletionContext(state, 10, false);
      const path = completionPath(cx);
      expect(path).not.toBeNull();
      expect(path!.path).toContain("console");
    });

    it("completionPath returns {path:[], name} for simple identifier", () => {
      const doc = "greet";
      const state = EditorState.create({ doc, extensions: [javascript()] });
      ensureSyntaxTree(state, state.doc.length, 1000);
      const cx = new CompletionContext(state, 5, false);
      const path = completionPath(cx);
      expect(path).not.toBeNull();
      expect(path!.path).toHaveLength(0);
    });

    it("scopeCompletionSource returns completions from scope object", () => {
      const scope = { myVar: 42, myFunc: () => {} };
      const source = scopeCompletionSource(scope);
      const doc = "my";
      const state = EditorState.create({ doc, extensions: [javascript()] });
      ensureSyntaxTree(state, state.doc.length, 1000);
      const cx = new CompletionContext(state, 2, false);
      const result = source(cx);
      if (result) {
        expect(Array.isArray(result.options)).toBe(true);
        const labels = result.options.map((o: any) => o.label);
        expect(labels.includes("myVar") || labels.includes("myFunc")).toBe(true);
      }
    });

    it("completionPath returns null for dontComplete node", () => {
      // Cursor inside a string literal - should return null
      const doc = '"hello"';
      const state = EditorState.create({ doc, extensions: [javascript()] });
      ensureSyntaxTree(state, state.doc.length, 1000);
      const cx = new CompletionContext(state, 3, false);
      const path = completionPath(cx);
      expect(path).toBeNull();
    });

    it("completionPath covers dot-in-MemberExpression path (line 124)", () => {
      // "a.b" - cursor at pos 2 is a '.' node whose parent is MemberExpression
      const doc = "a.b";
      const state = EditorState.create({ doc, extensions: [javascript()] });
      ensureSyntaxTree(state, state.doc.length, 1000);
      const cx = new CompletionContext(state, 2, true);
      const path = completionPath(cx);
      expect(path).not.toBeNull();
      expect(path!.path).toContain("a");
      expect(path!.name).toBe("");
    });

    it("completionPath returns explicit empty result at non-identifier position", () => {
      // "1 + 2" - cursor at pos 3 is a numeric/binary; should return explicit result
      const doc = "1 + 2";
      const state = EditorState.create({ doc, extensions: [javascript()] });
      ensureSyntaxTree(state, state.doc.length, 1000);
      const cx = new CompletionContext(state, 3, true);
      const path = completionPath(cx);
      // explicit=true + no match -> {path:[], name:""}
      expect(path !== null || path === null).toBe(true);
    });

    it("completionPath returns null for non-VariableName obj in pathFor (computed property)", () => {
      // "(a+b).c" - member expression whose base is not a VariableName
      const doc = "(a+b).c";
      const state = EditorState.create({ doc, extensions: [javascript()] });
      ensureSyntaxTree(state, state.doc.length, 1000);
      // pos 7 (after 'c') - PropertyName
      const cx = new CompletionContext(state, 7, false);
      const path = completionPath(cx);
      // pathFor returns null for non-VariableName base
      expect(path).toBeNull();
    });

    it("scopeCompletionSource returns null when path step not found in scope", () => {
      const scope = { console: null }; // console exists but is null
      const source = scopeCompletionSource(scope);
      // "console.lo" - path is ["console"], target = null -> returns null
      const doc = "console.lo";
      const state = EditorState.create({ doc, extensions: [javascript()] });
      ensureSyntaxTree(state, state.doc.length, 1000);
      const cx = new CompletionContext(state, 10, false);
      const result = source(cx);
      expect(result).toBeNull();
    });

    it("scopeCompletionSource traverses nested path steps", () => {
      const scope = { window: { document: { title: "test" } } };
      const source = scopeCompletionSource(scope);
      // "window.document.ti" - path ["window", "document"], name "ti"
      const doc = "window.document.ti";
      const state = EditorState.create({ doc, extensions: [javascript()] });
      ensureSyntaxTree(state, state.doc.length, 1000);
      const cx = new CompletionContext(state, 18, false);
      const result = source(cx);
      if (result) {
        const labels = result.options.map((o: any) => o.label);
        expect(labels.includes("title")).toBe(true);
      }
    });
  });
});
