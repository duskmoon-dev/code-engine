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

  it("javaLanguage can parse generic types", () => {
    const tree = javaLanguage.parser.parse("List<String> list = new ArrayList<>();");
    expect(tree.length).toBeGreaterThan(0);
  });

  it("javaLanguage can parse annotation", () => {
    const tree = javaLanguage.parser.parse("@Override public String toString() { return \"foo\"; }");
    expect(tree.length).toBeGreaterThan(0);
    expect(tree.type.isTop).toBe(true);
  });

  it("javaLanguage can parse enum", () => {
    const tree = javaLanguage.parser.parse("enum Day { MON, TUE, WED, THU, FRI, SAT, SUN }");
    expect(tree.length).toBeGreaterThan(0);
    expect(tree.type.isTop).toBe(true);
  });

  it("javaLanguage can parse try-catch", () => {
    const tree = javaLanguage.parser.parse("try { risky(); } catch (Exception e) { handle(e); } finally { cleanup(); }");
    expect(tree.length).toBeGreaterThan(0);
  });

  it("tree.resolve() finds nodes in java code", () => {
    const code = "public class Foo { int x = 0; }";
    const tree = javaLanguage.parser.parse(code);
    for (let i = 0; i < code.length; i += 5) {
      const node = tree.resolve(i);
      expect(node).toBeDefined();
    }
  });

  it("javaLanguage can parse lambda expression", () => {
    const tree = javaLanguage.parser.parse("Runnable r = () -> System.out.println(\"Hello\");");
    expect(tree.length).toBeGreaterThan(0);
    expect(tree.type.isTop).toBe(true);
  });

  it("javaLanguage can parse stream operations", () => {
    const tree = javaLanguage.parser.parse("list.stream().filter(x -> x > 0).map(x -> x * 2).collect(Collectors.toList());");
    expect(tree.length).toBeGreaterThan(0);
  });

  it("javaLanguage can parse switch expression", () => {
    const tree = javaLanguage.parser.parse("String result = switch(day) { case MON, TUE -> \"Weekday\"; case SAT, SUN -> \"Weekend\"; default -> \"Unknown\"; };");
    expect(tree.length).toBeGreaterThan(0);
  });

  it("javaLanguage can parse record type", () => {
    const tree = javaLanguage.parser.parse("record Point(int x, int y) {}");
    expect(tree.length).toBeGreaterThan(0);
  });

  it("javaLanguage can parse text block", () => {
    const tree = javaLanguage.parser.parse("String json = \"\"\"\n  {\n    \"name\": \"Alice\"\n  }\"\"\";");
    expect(tree.length).toBeGreaterThan(0);
    expect(tree.type.isTop).toBe(true);
  });

  it("javaLanguage can parse static import", () => {
    const tree = javaLanguage.parser.parse("import static java.util.Arrays.asList;");
    expect(tree.length).toBeGreaterThan(0);
  });

  it("javaLanguage can parse abstract class", () => {
    const tree = javaLanguage.parser.parse("abstract class Shape { abstract double area(); String name() { return \"Shape\"; } }");
    expect(tree.length).toBeGreaterThan(0);
    expect(tree.type.isTop).toBe(true);
  });

  it("javaLanguage can parse inner class", () => {
    const tree = javaLanguage.parser.parse("class Outer { private int x; class Inner { int getX() { return x; } } }");
    expect(tree.length).toBeGreaterThan(0);
    expect(tree.type.isTop).toBe(true);
  });

  it("javaLanguage can parse varargs", () => {
    const tree = javaLanguage.parser.parse("public static int sum(int... numbers) { int total = 0; for (int n : numbers) total += n; return total; }");
    expect(tree.length).toBeGreaterThan(0);
  });

  it("javaLanguage can parse multiple interface implementation", () => {
    const tree = javaLanguage.parser.parse("class MyClass implements Runnable, Comparable<MyClass> { public void run() {} public int compareTo(MyClass o) { return 0; } }");
    expect(tree.length).toBeGreaterThan(0);
    expect(tree.type.isTop).toBe(true);
  });

  it("javaLanguage can parse sealed class (Java 17)", () => {
    const tree = javaLanguage.parser.parse("sealed class Shape permits Circle, Rectangle {}");
    expect(tree.length).toBeGreaterThan(0);
  });

  it("javaLanguage can parse pattern matching instanceof", () => {
    const tree = javaLanguage.parser.parse("if (obj instanceof String s) { System.out.println(s.length()); }");
    expect(tree.length).toBeGreaterThan(0);
    expect(tree.type.isTop).toBe(true);
  });

  it("javaLanguage can parse optional chaining", () => {
    const tree = javaLanguage.parser.parse("Optional<String> opt = Optional.of(\"hello\"); String result = opt.filter(s -> s.length() > 3).map(String::toUpperCase).orElse(\"default\");");
    expect(tree.length).toBeGreaterThan(0);
  });

  it("javaLanguage can parse synchronized block", () => {
    const tree = javaLanguage.parser.parse("public synchronized void increment() { count++; } public void safe() { synchronized(this) { list.add(item); } }");
    expect(tree.length).toBeGreaterThan(0);
    expect(tree.type.isTop).toBe(true);
  });

  it("javaLanguage can parse ternary and compound assignment", () => {
    const tree = javaLanguage.parser.parse("int max = a > b ? a : b; int x = 0; x += 5; x *= 2; x %= 3;");
    expect(tree.length).toBeGreaterThan(0);
  });

  it("tree.resolveInner() finds innermost node in java code", () => {
    const tree = javaLanguage.parser.parse("class Foo { int x = 42; }");
    const node = tree.resolveInner(10);
    expect(node).toBeDefined();
    expect(node.from).toBeLessThanOrEqual(10);
    expect(node.to).toBeGreaterThanOrEqual(10);
  });

  it("javaLanguage tree.toString() returns non-empty string", () => {
    const tree = javaLanguage.parser.parse("class Hello { public static void main(String[] args) {} }");
    expect(typeof tree.toString()).toBe("string");
    expect(tree.toString().length).toBeGreaterThan(0);
  });

  it("javaLanguage cursor traversal visits multiple nodes", () => {
    const tree = javaLanguage.parser.parse("public class Foo { int x = 1; void bar() { x++; } }");
    let count = 0;
    tree.iterate({ enter: () => { count++; } });
    expect(count).toBeGreaterThan(3);
  });

  it("javaLanguage can parse generic class", () => {
    const tree = javaLanguage.parser.parse("class Box<T> { private T value; public T get() { return value; } public void set(T v) { value = v; } }");
    expect(tree.length).toBeGreaterThan(0);
    expect(tree.type.isTop).toBe(true);
  });

  it("javaLanguage can parse enum with methods", () => {
    const tree = javaLanguage.parser.parse("enum Planet { MERCURY(3.303e+23), VENUS(4.869e+24); double mass; Planet(double mass) { this.mass = mass; } }");
    expect(tree.length).toBeGreaterThan(0);
  });

  it("EditorState with java() has correct doc line count", () => {
    const state = EditorState.create({
      doc: "class A {}\nclass B {}\nclass C {}",
      extensions: [java()],
    });
    expect(state.doc.lines).toBe(3);
  });

  it("java() state doc line text is accessible", () => {
    const state = EditorState.create({
      doc: "public class Foo {}\npublic class Bar {}",
      extensions: [java()],
    });
    expect(state.doc.line(1).text).toBe("public class Foo {}");
  });

  it("java() state allows multiple sequential transactions", () => {
    let state = EditorState.create({ doc: "int x = 1;", extensions: [java()] });
    state = state.update({ changes: { from: 10, insert: "\nint y = 2;" } }).state;
    state = state.update({ changes: { from: state.doc.length, insert: "\nint z = 3;" } }).state;
    expect(state.doc.lines).toBe(3);
  });

  it("java() extension handles replacement transaction", () => {
    let state = EditorState.create({ doc: "int x = 1;", extensions: [java()] });
    state = state.update({ changes: { from: 4, to: 5, insert: "y" } }).state;
    expect(state.doc.toString()).toBe("int y = 1;");
  });

  it("java() state selection can span lines", () => {
    const state = EditorState.create({
      doc: "class A {}\nclass B {}",
      selection: { anchor: 0, head: 10 },
      extensions: [java()],
    });
    expect(state.selection.main.from).toBe(0);
    expect(state.selection.main.to).toBe(10);
  });

  it("java() doc length invariant holds", () => {
    const doc = "public class Foo {}";
    const state = EditorState.create({ doc, extensions: [java()] });
    expect(state.doc.length).toBe(doc.length);
  });

  it("java() state deletion transaction works", () => {
    let state = EditorState.create({ doc: "int x = 1;\nint y = 2;", extensions: [java()] });
    state = state.update({ changes: { from: 10, to: 21 } }).state;
    expect(state.doc.toString()).toBe("int x = 1;");
  });

  it("javaLanguage parser tree has correct length", () => {
    const code = "interface Runnable { void run(); }";
    const tree = javaLanguage.parser.parse(code);
    expect(tree.length).toBe(code.length);
  });

  it("java() state line text is accessible after transaction", () => {
    let state = EditorState.create({ doc: "class A {}", extensions: [java()] });
    state = state.update({ changes: { from: 10, insert: "\nclass B {}" } }).state;
    expect(state.doc.line(2).text).toBe("class B {}");
  });

  it("javaLanguage can parse enums", () => {
    const tree = javaLanguage.parser.parse("enum Day { MON, TUE, WED, THU, FRI, SAT, SUN }");
    expect(tree.length).toBeGreaterThan(0);
    expect(tree.type.isTop).toBe(true);
  });

  it("java() state doc line text is accessible", () => {
    const state = EditorState.create({
      doc: "import java.util.List;\nimport java.util.ArrayList;",
      extensions: [java()],
    });
    expect(state.doc.line(1).text).toBe("import java.util.List;");
    expect(state.doc.line(2).text).toBe("import java.util.ArrayList;");
  });

  it("java() state allows multiple sequential transactions", () => {
    let state = EditorState.create({ doc: "class A {}", extensions: [java()] });
    state = state.update({ changes: { from: 10, insert: "\nclass B {}" } }).state;
    state = state.update({ changes: { from: state.doc.length, insert: "\nclass C {}" } }).state;
    expect(state.doc.lines).toBe(3);
  });

  it("java() state with unicode comment works", () => {
    const doc = "// こんにちは\nclass Hello {}";
    const state = EditorState.create({ doc, extensions: [java()] });
    expect(state.doc.toString()).toBe(doc);
  });

  it("java() state replacement transaction works", () => {
    let state = EditorState.create({ doc: "class Foo {}", extensions: [java()] });
    state = state.update({ changes: { from: 6, to: 9, insert: "Bar" } }).state;
    expect(state.doc.toString()).toBe("class Bar {}");
  });

  it("java() state line count is correct", () => {
    const state = EditorState.create({
      doc: "import java.util.List;\nimport java.util.Map;\nimport java.util.Set;",
      extensions: [java()],
    });
    expect(state.doc.lines).toBe(3);
  });

  it("javaLanguage can parse generic class", () => {
    const tree = javaLanguage.parser.parse("class Container<T> { private T value; public T get() { return value; } }");
    expect(tree.length).toBeGreaterThan(0);
    expect(tree.type.isTop).toBe(true);
  });

  it("java() state allows 4 sequential transactions", () => {
    let state = EditorState.create({ doc: "int a = 1;", extensions: [java()] });
    state = state.update({ changes: { from: 10, insert: "\nint b = 2;" } }).state;
    state = state.update({ changes: { from: state.doc.length, insert: "\nint c = 3;" } }).state;
    state = state.update({ changes: { from: state.doc.length, insert: "\nint d = 4;" } }).state;
    expect(state.doc.lines).toBe(4);
    expect(state.doc.line(4).text).toBe("int d = 4;");
  });

  it("java() state allows deletion of entire content", () => {
    const doc = "class A {}\nclass B {}";
    let state = EditorState.create({ doc, extensions: [java()] });
    state = state.update({ changes: { from: 0, to: doc.length } }).state;
    expect(state.doc.toString()).toBe("");
  });

  it("java() state allows insert at start", () => {
    let state = EditorState.create({ doc: "public class Main {}", extensions: [java()] });
    state = state.update({ changes: { from: 0, insert: "import java.util.*;\n" } }).state;
    expect(state.doc.line(1).text).toBe("import java.util.*;");
  });

  it("javaLanguage can parse annotation", () => {
    const tree = javaLanguage.parser.parse("@Override\npublic String toString() { return \"obj\"; }");
    expect(tree.length).toBeGreaterThan(0);
  });
});
