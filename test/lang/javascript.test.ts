import { describe, it, expect } from "bun:test";
import {
  javascript, javascriptLanguage, typescriptLanguage,
  jsxLanguage, tsxLanguage, autoCloseTags,
  snippets, typescriptSnippets,
  localCompletionSource, completionPath, scopeCompletionSource,
  esLint
} from "../../src/lang/javascript/index";
import { EditorState } from "../../src/core/state/index";
import { syntaxTree } from "../../src/core/language/index";

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
});
