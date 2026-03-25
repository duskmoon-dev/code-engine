import { describe, it, expect } from "bun:test";
import { java, javaLanguage } from "../../src/lang/java/index";
import { EditorState } from "../../src/core/state/index";
import { syntaxTree, LanguageSupport } from "../../src/core/language/index";

describe("Java language pack", () => {
  it("exports java function", () => {
    expect(typeof java).toBe("function");
  });

  it("exports javaLanguage", () => {
    expect(javaLanguage).toBeDefined();
    expect(javaLanguage.name).toBe("java");
  });

  it("creates language support", () => {
    const support = java();
    expect(support).toBeDefined();
    expect(support.language).toBe(javaLanguage);
  });

  it("java() returns a LanguageSupport instance", () => {
    expect(java()).toBeInstanceOf(LanguageSupport);
  });

  it("java() integrates with EditorState", () => {
    const state = EditorState.create({
      doc: `public class Hello {\n    public static void main(String[] args) {\n        System.out.println("Hello!");\n    }\n}`,
      extensions: [java()],
    });
    expect(state.doc.toString()).toContain("public class Hello");
  });

  it("javaLanguage parser produces a non-empty tree", () => {
    const tree = javaLanguage.parser.parse("int x = 42;");
    expect(tree.length).toBeGreaterThan(0);
  });

  it("javaLanguage parser tree has a top-level type", () => {
    const tree = javaLanguage.parser.parse("class Foo {}");
    expect(tree.type.isTop).toBe(true);
  });

  it("syntaxTree from EditorState with java() is non-empty", () => {
    const state = EditorState.create({
      doc: "public class Main { public static void main(String[] args) {} }",
      extensions: [java()],
    });
    const tree = syntaxTree(state);
    expect(tree.length).toBeGreaterThan(0);
  });

  it("java parse tree cursor traversal works", () => {
    const tree = javaLanguage.parser.parse("public class Fibonacci { public static int fib(int n) { return n <= 1 ? n : fib(n-1) + fib(n-2); } }");
    const cursor = tree.cursor();
    let nodeCount = 0;
    do { nodeCount++; } while (cursor.next() && nodeCount < 100);
    expect(nodeCount).toBeGreaterThan(1);
  });

  it("javaLanguage can parse interface", () => {
    const tree = javaLanguage.parser.parse("interface Runnable { void run(); }");
    expect(tree.length).toBeGreaterThan(0);
    expect(tree.type.isTop).toBe(true);
  });
});
