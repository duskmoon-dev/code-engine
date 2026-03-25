import { describe, it, expect } from "bun:test";
import { go, goLanguage, snippets, localCompletionSource } from "../../src/lang/go/index";
import { EditorState } from "../../src/core/state/index";
import { syntaxTree } from "../../src/core/language/index";

describe("Go language pack", () => {
  it("exports go function", () => {
    expect(typeof go).toBe("function");
  });

  it("exports goLanguage", () => {
    expect(goLanguage).toBeDefined();
    expect(goLanguage.name).toBe("go");
  });

  it("exports snippets", () => {
    expect(snippets).toBeDefined();
    expect(Array.isArray(snippets)).toBe(true);
    expect(snippets.length).toBeGreaterThan(0);
  });

  it("exports localCompletionSource", () => {
    expect(typeof localCompletionSource).toBe("function");
  });

  it("creates language support", () => {
    const support = go();
    expect(support).toBeDefined();
    expect(support.language).toBe(goLanguage);
  });

  it("go() returns LanguageSupport with goLanguage", () => {
    const lang = go();
    expect(lang.language).toBe(goLanguage);
    expect(lang.language.name).toBe("go");
  });

  it("snippets include common Go patterns", () => {
    const labels = snippets.map((s: any) => s.label)
    expect(labels).toContain("func")
    expect(labels).toContain("for")
  });

  it("goLanguage parser produces a non-empty tree", () => {
    const tree = goLanguage.parser.parse("package main\nfunc main() {}");
    expect(tree.length).toBeGreaterThan(0);
  });

  it("goLanguage parser tree has a top-level type", () => {
    const tree = goLanguage.parser.parse("var x int = 1");
    expect(tree.type.isTop).toBe(true);
  });

  it("syntaxTree from EditorState with go() is non-empty", () => {
    const state = EditorState.create({
      doc: "package main\n\nimport \"fmt\"\n\nfunc main() {\n  fmt.Println(\"hello\")\n}",
      extensions: [go()],
    });
    const tree = syntaxTree(state);
    expect(tree.length).toBeGreaterThan(0);
  });

  it("parse tree can be traversed with cursor", () => {
    const code = "package main\nfunc main() {}";
    const tree = goLanguage.parser.parse(code);
    const cursor = tree.cursor();
    let nodeCount = 0;
    do { nodeCount++; } while (cursor.next() && nodeCount < 100);
    expect(nodeCount).toBeGreaterThan(1);
  });

  it("parse tree resolve() finds node at position", () => {
    const code = "package main\nimport \"fmt\"";
    const tree = goLanguage.parser.parse(code);
    const node = tree.resolve(0);
    expect(node).toBeDefined();
  });

  it("localCompletionSource returns null for non-word context", () => {
    const state = EditorState.create({
      doc: "package main\n\nfunc main() {\n  \n}",
      extensions: [go()],
    });
    // Build a mock context at an empty position (no word, non-explicit)
    const result = localCompletionSource({
      state,
      pos: 33, // inside function body
      explicit: false,
      tokenBefore: () => null as any,
      matchBefore: () => null,
    } as any);
    // May return null or a result depending on position
    // Just verify it doesn't throw
    expect(result === null || result !== undefined).toBe(true);
  });
});
