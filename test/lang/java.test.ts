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
});
