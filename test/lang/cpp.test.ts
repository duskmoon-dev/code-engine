import { describe, it, expect } from "bun:test";
import { cpp, cppLanguage } from "../../src/lang/cpp/index";
import { EditorState } from "../../src/core/state/index";
import { syntaxTree } from "../../src/core/language/index";
import { LanguageSupport } from "../../src/core/language/index";

describe("C++ language pack", () => {
  it("exports cpp function", () => {
    expect(typeof cpp).toBe("function");
  });

  it("exports cppLanguage", () => {
    expect(cppLanguage).toBeDefined();
    expect(cppLanguage.name).toBe("cpp");
  });

  it("creates language support", () => {
    const support = cpp();
    expect(support).toBeDefined();
    expect(support.language).toBe(cppLanguage);
  });

  it("cpp() returns a LanguageSupport instance", () => {
    expect(cpp()).toBeInstanceOf(LanguageSupport);
  });

  it("cpp() integrates with EditorState", () => {
    const state = EditorState.create({
      doc: `#include <iostream>\nint main() {\n    std::cout << "Hello!" << std::endl;\n    return 0;\n}`,
      extensions: [cpp()],
    });
    expect(state.doc.toString()).toContain("#include");
  });

  it("cppLanguage parser produces a non-empty tree", () => {
    const tree = cppLanguage.parser.parse("int x = 42;");
    expect(tree.length).toBeGreaterThan(0);
  });

  it("cppLanguage parser tree has a top-level type", () => {
    const tree = cppLanguage.parser.parse("void foo() {}");
    expect(tree.type.isTop).toBe(true);
  });

  it("syntaxTree from EditorState with cpp() is non-empty", () => {
    const state = EditorState.create({
      doc: "int main() { return 0; }",
      extensions: [cpp()],
    });
    const tree = syntaxTree(state);
    expect(tree.length).toBeGreaterThan(0);
  });

  it("cpp parse tree cursor traversal works", () => {
    const tree = cppLanguage.parser.parse("template<typename T> T max(T a, T b) { return a > b ? a : b; }");
    const cursor = tree.cursor();
    let nodeCount = 0;
    do { nodeCount++; } while (cursor.next() && nodeCount < 100);
    expect(nodeCount).toBeGreaterThan(1);
  });

  it("cppLanguage can parse class declaration", () => {
    const tree = cppLanguage.parser.parse("class Point { public: int x, y; Point(int x, int y): x(x), y(y) {} };");
    expect(tree.length).toBeGreaterThan(0);
    expect(tree.type.isTop).toBe(true);
  });
});
