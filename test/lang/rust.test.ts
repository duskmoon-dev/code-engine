import { describe, it, expect } from "bun:test";
import { rust, rustLanguage } from "../../src/lang/rust/index";
import { EditorState } from "../../src/core/state/index";
import { syntaxTree, LanguageSupport } from "../../src/core/language/index";

describe("Rust language pack", () => {
  it("exports rust function", () => {
    expect(typeof rust).toBe("function");
  });

  it("exports rustLanguage", () => {
    expect(rustLanguage).toBeDefined();
    expect(rustLanguage.name).toBe("rust");
  });

  it("creates language support", () => {
    const support = rust();
    expect(support).toBeDefined();
    expect(support.language).toBe(rustLanguage);
  });

  it("rust() returns LanguageSupport instance", () => {
    expect(rust()).toBeInstanceOf(LanguageSupport);
  });

  it("rust() returns LanguageSupport with rustLanguage", () => {
    const lang = rust();
    expect(lang.language).toBe(rustLanguage);
    expect(lang.language.name).toBe("rust");
  });

  it("rustLanguage can parse a Rust program", () => {
    const state = EditorState.create({
      doc: `fn main() {\n    println!("Hello, world!");\n}`,
      extensions: [rust()],
    });
    expect(state).toBeDefined();
    expect(state.doc.toString()).toContain("fn main");
  });

  it("rustLanguage parser produces a non-empty tree", () => {
    const tree = rustLanguage.parser.parse("let x: i32 = 42;");
    expect(tree.length).toBeGreaterThan(0);
  });

  it("rustLanguage parser tree has a top-level type", () => {
    const tree = rustLanguage.parser.parse("fn foo() {}");
    expect(tree.type.isTop).toBe(true);
  });

  it("syntaxTree from EditorState with rust() is non-empty", () => {
    const state = EditorState.create({
      doc: "fn main() { let x = 1; }",
      extensions: [rust()],
    });
    const tree = syntaxTree(state);
    expect(tree.length).toBeGreaterThan(0);
  });

  it("rust parse tree cursor traversal works", () => {
    const tree = rustLanguage.parser.parse("fn factorial(n: u64) -> u64 { if n == 0 { 1 } else { n * factorial(n - 1) } }");
    const cursor = tree.cursor();
    let nodeCount = 0;
    do { nodeCount++; } while (cursor.next() && nodeCount < 100);
    expect(nodeCount).toBeGreaterThan(1);
  });

  it("rustLanguage can parse enum declaration", () => {
    const tree = rustLanguage.parser.parse("enum Color { Red, Green, Blue }");
    expect(tree.length).toBeGreaterThan(0);
    expect(tree.type.isTop).toBe(true);
  });
});
