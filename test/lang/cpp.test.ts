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

  it("cppLanguage can parse namespace", () => {
    const tree = cppLanguage.parser.parse("namespace std { template<typename T> class vector {}; }");
    expect(tree.length).toBeGreaterThan(0);
    expect(tree.type.isTop).toBe(true);
  });

  it("cppLanguage can parse lambda expression", () => {
    const tree = cppLanguage.parser.parse("auto f = [](int x) { return x * x; };");
    expect(tree.length).toBeGreaterThan(0);
  });

  it("cppLanguage can parse struct", () => {
    const tree = cppLanguage.parser.parse("struct Node { int val; Node* next; };");
    expect(tree.length).toBeGreaterThan(0);
    expect(tree.type.isTop).toBe(true);
  });

  it("cppLanguage can parse enum class", () => {
    const tree = cppLanguage.parser.parse("enum class Color { Red, Green, Blue };");
    expect(tree.length).toBeGreaterThan(0);
  });

  it("tree.resolve() finds nodes in c++ code", () => {
    const code = "int main() { return 0; }";
    const tree = cppLanguage.parser.parse(code);
    for (let i = 0; i < code.length; i += 4) {
      const node = tree.resolve(i);
      expect(node).toBeDefined();
    }
  });

  it("cppLanguage can parse template function", () => {
    const tree = cppLanguage.parser.parse("template<typename T> T max(T a, T b) { return a > b ? a : b; }");
    expect(tree.length).toBeGreaterThan(0);
    expect(tree.type.isTop).toBe(true);
  });

  it("cppLanguage can parse smart pointer usage", () => {
    const tree = cppLanguage.parser.parse("std::unique_ptr<int> ptr = std::make_unique<int>(42);");
    expect(tree.length).toBeGreaterThan(0);
  });

  it("cppLanguage can parse range-based for loop", () => {
    const tree = cppLanguage.parser.parse("for (const auto& item : items) { process(item); }");
    expect(tree.length).toBeGreaterThan(0);
  });

  it("cppLanguage can parse initializer list", () => {
    const tree = cppLanguage.parser.parse("std::vector<int> v = {1, 2, 3, 4, 5};");
    expect(tree.length).toBeGreaterThan(0);
    expect(tree.type.isTop).toBe(true);
  });

  it("cppLanguage can parse virtual function", () => {
    const tree = cppLanguage.parser.parse("class Base { public: virtual void draw() = 0; virtual ~Base() = default; };");
    expect(tree.length).toBeGreaterThan(0);
  });

  it("cppLanguage can parse move semantics", () => {
    const tree = cppLanguage.parser.parse("std::string s = std::move(other); auto f = std::forward<T>(arg);");
    expect(tree.length).toBeGreaterThan(0);
  });

  it("cppLanguage can parse constexpr", () => {
    const tree = cppLanguage.parser.parse("constexpr int factorial(int n) { return n <= 1 ? 1 : n * factorial(n - 1); }");
    expect(tree.length).toBeGreaterThan(0);
    expect(tree.type.isTop).toBe(true);
  });

  it("cppLanguage can parse inheritance", () => {
    const tree = cppLanguage.parser.parse("class Animal { public: virtual void speak() = 0; };\nclass Dog : public Animal { public: void speak() override { } };");
    expect(tree.length).toBeGreaterThan(0);
    expect(tree.type.isTop).toBe(true);
  });

  it("cppLanguage can parse operator overloading", () => {
    const tree = cppLanguage.parser.parse("struct Vec2 { float x, y; Vec2 operator+(const Vec2& o) const { return {x+o.x, y+o.y}; } };");
    expect(tree.length).toBeGreaterThan(0);
    expect(tree.type.isTop).toBe(true);
  });

  it("cppLanguage can parse multiple inheritance", () => {
    const tree = cppLanguage.parser.parse("class C : public A, public B { };");
    expect(tree.length).toBeGreaterThan(0);
  });

  it("cppLanguage can parse static member function", () => {
    const tree = cppLanguage.parser.parse("class Counter { static int count; public: static int get() { return count; } };");
    expect(tree.length).toBeGreaterThan(0);
  });

  it("cppLanguage can parse type alias with using", () => {
    const tree = cppLanguage.parser.parse("using StringVec = std::vector<std::string>;\nusing Callback = std::function<void(int)>;");
    expect(tree.length).toBeGreaterThan(0);
    expect(tree.type.isTop).toBe(true);
  });

  it("cppLanguage can parse try-catch with multiple exceptions", () => {
    const tree = cppLanguage.parser.parse("try { risky(); } catch (const std::runtime_error& e) { } catch (const std::exception& e) { } catch (...) { }");
    expect(tree.length).toBeGreaterThan(0);
  });

  it("cppLanguage can parse nullptr and modern cast", () => {
    const tree = cppLanguage.parser.parse("int* p = nullptr; int x = static_cast<int>(3.14); auto* q = dynamic_cast<Derived*>(p);");
    expect(tree.length).toBeGreaterThan(0);
  });

  it("cppLanguage can parse structured bindings", () => {
    const tree = cppLanguage.parser.parse("auto [x, y] = getPoint(); auto& [key, val] = *map.begin();");
    expect(tree.length).toBeGreaterThan(0);
  });

  it("cppLanguage can parse conditional expression chains", () => {
    const tree = cppLanguage.parser.parse("int sign = (x > 0) ? 1 : (x < 0) ? -1 : 0;");
    expect(tree.length).toBeGreaterThan(0);
    expect(tree.type.isTop).toBe(true);
  });

  it("cppLanguage tree.toString() returns non-empty string", () => {
    const tree = cppLanguage.parser.parse("int x = 42;");
    expect(typeof tree.toString()).toBe("string");
    expect(tree.toString().length).toBeGreaterThan(0);
  });

  it("cppLanguage cursor traversal visits multiple nodes", () => {
    const tree = cppLanguage.parser.parse("void foo(int x, int y) { return x + y; }");
    let count = 0;
    tree.iterate({ enter: () => { count++; } });
    expect(count).toBeGreaterThan(3);
  });

  it("cppLanguage tree.resolveInner() finds innermost node", () => {
    const tree = cppLanguage.parser.parse("int main() { return 0; }");
    const node = tree.resolveInner(12);
    expect(node).toBeDefined();
    expect(node.from).toBeLessThanOrEqual(12);
    expect(node.to).toBeGreaterThanOrEqual(12);
  });

  it("cppLanguage can parse constexpr", () => {
    const tree = cppLanguage.parser.parse("constexpr int MAX = 100;\nconstexpr double PI = 3.14159;");
    expect(tree.length).toBeGreaterThan(0);
    expect(tree.type.isTop).toBe(true);
  });

  it("EditorState with cpp() has correct doc length", () => {
    const doc = "#include <iostream>\nint main() { return 0; }";
    const state = EditorState.create({ doc, extensions: [cpp()] });
    expect(state.doc.length).toBe(doc.length);
  });

  it("cpp() state doc line count is correct", () => {
    const state = EditorState.create({
      doc: "#include <iostream>\nusing namespace std;\nint main() { return 0; }",
      extensions: [cpp()],
    });
    expect(state.doc.lines).toBe(3);
  });

  it("cpp() state doc line text is accessible", () => {
    const state = EditorState.create({
      doc: "#include <iostream>\nint main() {}",
      extensions: [cpp()],
    });
    expect(state.doc.line(1).text).toBe("#include <iostream>");
  });

  it("cpp() state allows multiple sequential transactions", () => {
    let state = EditorState.create({ doc: "int x = 1;", extensions: [cpp()] });
    state = state.update({ changes: { from: 10, insert: "\nint y = 2;" } }).state;
    state = state.update({ changes: { from: state.doc.length, insert: "\nint z = 3;" } }).state;
    expect(state.doc.lines).toBe(3);
  });

  it("cpp() extension handles replacement transaction", () => {
    let state = EditorState.create({ doc: "int x = 1;", extensions: [cpp()] });
    state = state.update({ changes: { from: 4, to: 5, insert: "y" } }).state;
    expect(state.doc.toString()).toBe("int y = 1;");
  });

  it("cpp() doc length invariant holds", () => {
    const doc = "int main() { return 0; }";
    const state = EditorState.create({ doc, extensions: [cpp()] });
    expect(state.doc.length).toBe(doc.length);
  });

  it("cpp() state selection within code works", () => {
    const state = EditorState.create({
      doc: "int x = 1;\nint y = 2;",
      selection: { anchor: 0, head: 10 },
      extensions: [cpp()],
    });
    expect(state.selection.main.from).toBe(0);
    expect(state.selection.main.to).toBe(10);
  });

  it("cppLanguage parser tree has correct length", () => {
    const code = "namespace ns { void foo() {} }";
    const tree = cppLanguage.parser.parse(code);
    expect(tree.length).toBe(code.length);
  });

  it("cpp() state deletion transaction works", () => {
    let state = EditorState.create({ doc: "int x = 1;\nint y = 2;", extensions: [cpp()] });
    state = state.update({ changes: { from: 10, to: 21 } }).state;
    expect(state.doc.toString()).toBe("int x = 1;");
    expect(state.doc.lines).toBe(1);
  });

  it("cppLanguage can parse templates", () => {
    const tree = cppLanguage.parser.parse("template<typename T> T max(T a, T b) { return a > b ? a : b; }");
    expect(tree.length).toBeGreaterThan(0);
    expect(tree.type.isTop).toBe(true);
  });

  it("cpp() state doc line text is accessible", () => {
    const state = EditorState.create({
      doc: "#include <iostream>\nint main() { return 0; }",
      extensions: [cpp()],
    });
    expect(state.doc.line(1).text).toBe("#include <iostream>");
    expect(state.doc.line(2).text).toBe("int main() { return 0; }");
  });

  it("cpp() state allows multiple sequential transactions", () => {
    let state = EditorState.create({ doc: "int x = 1;", extensions: [cpp()] });
    state = state.update({ changes: { from: 10, insert: "\nint y = 2;" } }).state;
    state = state.update({ changes: { from: state.doc.length, insert: "\nint z = 3;" } }).state;
    expect(state.doc.lines).toBe(3);
  });

  it("cpp() state with unicode comment works", () => {
    const doc = "// こんにちは\nint main() {}";
    const state = EditorState.create({ doc, extensions: [cpp()] });
    expect(state.doc.toString()).toBe(doc);
  });

  it("cpp() state replacement transaction works", () => {
    let state = EditorState.create({ doc: "int x = 1;", extensions: [cpp()] });
    state = state.update({ changes: { from: 4, to: 5, insert: "y" } }).state;
    expect(state.doc.toString()).toBe("int y = 1;");
  });

  it("cpp() state line count is correct", () => {
    const state = EditorState.create({
      doc: "#include <a>\n#include <b>\n#include <c>",
      extensions: [cpp()],
    });
    expect(state.doc.lines).toBe(3);
  });
});
