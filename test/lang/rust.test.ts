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

  it("rustLanguage can parse struct", () => {
    const tree = rustLanguage.parser.parse("struct Point { x: f64, y: f64 }");
    expect(tree.length).toBeGreaterThan(0);
    expect(tree.type.isTop).toBe(true);
  });

  it("rustLanguage can parse trait", () => {
    const tree = rustLanguage.parser.parse("trait Animal { fn sound(&self) -> &str; }");
    expect(tree.length).toBeGreaterThan(0);
    expect(tree.type.isTop).toBe(true);
  });

  it("rustLanguage can parse impl block", () => {
    const tree = rustLanguage.parser.parse("impl Display for Point { fn fmt(&self, f: &mut Formatter) -> Result { write!(f, \"({}, {})\", self.x, self.y) } }");
    expect(tree.length).toBeGreaterThan(0);
  });

  it("rustLanguage can parse use statement", () => {
    const tree = rustLanguage.parser.parse("use std::collections::HashMap;");
    expect(tree.length).toBeGreaterThan(0);
    expect(tree.type.isTop).toBe(true);
  });

  it("rustLanguage can parse closures", () => {
    const tree = rustLanguage.parser.parse("let double = |x: i32| x * 2;");
    expect(tree.length).toBeGreaterThan(0);
  });

  it("tree.resolve() finds nodes in rust code", () => {
    const code = "fn main() { let x = 42; }";
    const tree = rustLanguage.parser.parse(code);
    for (let i = 0; i < code.length; i += 4) {
      const node = tree.resolve(i);
      expect(node).toBeDefined();
    }
  });

  it("rustLanguage can parse enum with data", () => {
    const tree = rustLanguage.parser.parse("enum Message { Quit, Move { x: i32, y: i32 }, Write(String), ChangeColor(i32, i32, i32) }");
    expect(tree.length).toBeGreaterThan(0);
    expect(tree.type.isTop).toBe(true);
  });

  it("rustLanguage can parse match expression", () => {
    const tree = rustLanguage.parser.parse("match val { Some(x) if x > 0 => println!(\"pos {}\", x), Some(_) => println!(\"non-pos\"), None => println!(\"none\") }");
    expect(tree.length).toBeGreaterThan(0);
  });

  it("rustLanguage can parse lifetime annotations", () => {
    const tree = rustLanguage.parser.parse("fn longest<'a>(x: &'a str, y: &'a str) -> &'a str { if x.len() > y.len() { x } else { y } }");
    expect(tree.length).toBeGreaterThan(0);
    expect(tree.type.isTop).toBe(true);
  });

  it("rustLanguage can parse async/await", () => {
    const tree = rustLanguage.parser.parse("async fn fetch(url: &str) -> Result<String, Error> { let resp = reqwest::get(url).await?; resp.text().await }");
    expect(tree.length).toBeGreaterThan(0);
  });

  it("rustLanguage can parse macro invocation", () => {
    const tree = rustLanguage.parser.parse("let v = vec![1, 2, 3]; println!(\"{:?}\", v); assert_eq!(v.len(), 3);");
    expect(tree.length).toBeGreaterThan(0);
  });

  it("rustLanguage can parse where clause", () => {
    const tree = rustLanguage.parser.parse("fn print_all<T>(items: &[T]) where T: Display + Debug { for item in items { println!(\"{:?}\", item); } }");
    expect(tree.length).toBeGreaterThan(0);
    expect(tree.type.isTop).toBe(true);
  });
});
