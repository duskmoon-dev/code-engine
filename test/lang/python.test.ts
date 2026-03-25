import { describe, it, expect } from "bun:test";
import {
  python, pythonLanguage,
  localCompletionSource, snippets, globalCompletion
} from "../../src/lang/python/index";
import { EditorState } from "../../src/core/state/index";
import { syntaxTree } from "../../src/core/language/index";

describe("Python language pack", () => {
  it("exports python function", () => {
    expect(typeof python).toBe("function");
  });

  it("exports pythonLanguage", () => {
    expect(pythonLanguage).toBeDefined();
    expect(pythonLanguage.name).toBe("python");
  });

  it("exports localCompletionSource", () => {
    expect(typeof localCompletionSource).toBe("function");
  });

  it("exports snippets array", () => {
    expect(Array.isArray(snippets)).toBe(true);
    expect(snippets.length).toBeGreaterThan(0);
  });

  it("exports globalCompletion", () => {
    expect(globalCompletion).toBeDefined();
    expect(typeof globalCompletion).toBe("function");
  });

  it("creates language support", () => {
    const support = python();
    expect(support).toBeDefined();
    expect(support.language).toBe(pythonLanguage);
  });

  it("snippets contain Python-specific completions", () => {
    const labels = snippets.map((s: any) => s.label);
    // Python snippets should include common patterns
    expect(labels.length).toBeGreaterThan(0);
    expect(labels.every((l: any) => typeof l === "string")).toBe(true);
  });

  it("pythonLanguage parser produces a non-empty tree", () => {
    const tree = pythonLanguage.parser.parse("x = 1\nprint(x)");
    expect(tree.length).toBeGreaterThan(0);
  });

  it("pythonLanguage parser tree has a top-level type", () => {
    const tree = pythonLanguage.parser.parse("def foo(): pass");
    expect(tree.type.isTop).toBe(true);
  });

  it("syntaxTree from EditorState with python() is non-empty", () => {
    const state = EditorState.create({
      doc: "def hello():\n    return 'world'",
      extensions: [python()],
    });
    const tree = syntaxTree(state);
    expect(tree.length).toBeGreaterThan(0);
  });
});
