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

  it("rustLanguage can parse type alias", () => {
    const tree = rustLanguage.parser.parse("type Result<T> = std::result::Result<T, Box<dyn Error>>;\ntype Point = (f64, f64);");
    expect(tree.length).toBeGreaterThan(0);
    expect(tree.type.isTop).toBe(true);
  });

  it("rustLanguage can parse const and static", () => {
    const tree = rustLanguage.parser.parse("const MAX_SIZE: usize = 1024;\nstatic GREETING: &str = \"hello\";");
    expect(tree.length).toBeGreaterThan(0);
    expect(tree.type.isTop).toBe(true);
  });

  it("rustLanguage can parse Box and Rc types", () => {
    const tree = rustLanguage.parser.parse("let b: Box<i32> = Box::new(42);\nlet rc = Rc::new(RefCell::new(vec![1, 2, 3]));");
    expect(tree.length).toBeGreaterThan(0);
  });

  it("rustLanguage can parse pattern matching with destructuring", () => {
    const tree = rustLanguage.parser.parse("let (x, y, z) = (1, 2, 3); let Point { x, y } = point; if let Some(val) = opt { println!(\"{}\", val); }");
    expect(tree.length).toBeGreaterThan(0);
    expect(tree.type.isTop).toBe(true);
  });

  it("rustLanguage can parse iterator chains", () => {
    const tree = rustLanguage.parser.parse("let sum: i32 = (0..10).filter(|x| x % 2 == 0).map(|x| x * x).sum();");
    expect(tree.length).toBeGreaterThan(0);
  });

  it("rustLanguage can parse module declaration", () => {
    const tree = rustLanguage.parser.parse("mod utils { pub fn helper() -> &'static str { \"help\" } }\npub use utils::helper;");
    expect(tree.length).toBeGreaterThan(0);
    expect(tree.type.isTop).toBe(true);
  });

  it("tree.resolveInner() finds innermost node in rust code", () => {
    const tree = rustLanguage.parser.parse("fn main() { let x = 42; }");
    const node = tree.resolveInner(14);
    expect(node).toBeDefined();
    expect(node.from).toBeLessThanOrEqual(14);
    expect(node.to).toBeGreaterThanOrEqual(14);
  });

  it("rustLanguage tree.toString() returns non-empty string", () => {
    const tree = rustLanguage.parser.parse("fn main() { println!(\"hello\"); }");
    expect(typeof tree.toString()).toBe("string");
    expect(tree.toString().length).toBeGreaterThan(0);
  });

  it("rustLanguage cursor traversal finds nodes", () => {
    const tree = rustLanguage.parser.parse("fn add(a: i32, b: i32) -> i32 { a + b }");
    let count = 0;
    tree.iterate({ enter: () => { count++; } });
    expect(count).toBeGreaterThan(3);
  });

  it("rustLanguage can parse trait implementation", () => {
    const tree = rustLanguage.parser.parse("trait Animal { fn speak(&self) -> &str; }\nstruct Dog;\nimpl Animal for Dog { fn speak(&self) -> &str { \"woof\" } }");
    expect(tree.length).toBeGreaterThan(0);
    expect(tree.type.isTop).toBe(true);
  });

  it("rustLanguage can parse enum with data", () => {
    const tree = rustLanguage.parser.parse("enum Shape { Circle(f64), Rectangle(f64, f64), Triangle { base: f64, height: f64 } }");
    expect(tree.length).toBeGreaterThan(0);
  });

  it("rustLanguage can parse closures and higher-order functions", () => {
    const tree = rustLanguage.parser.parse("let nums = vec![1, 2, 3, 4, 5];\nlet doubled: Vec<i32> = nums.iter().map(|&x| x * 2).collect();");
    expect(tree.length).toBeGreaterThan(0);
    expect(tree.type.isTop).toBe(true);
  });

  it("rustLanguage can parse async fn", () => {
    const tree = rustLanguage.parser.parse("use std::io;\nasync fn read_file(path: &str) -> io::Result<String> {\n  tokio::fs::read_to_string(path).await\n}");
    expect(tree.length).toBeGreaterThan(0);
  });

  it("rustLanguage can parse generic functions with bounds", () => {
    const tree = rustLanguage.parser.parse("fn largest<T: PartialOrd>(list: &[T]) -> &T {\n  let mut largest = &list[0];\n  for item in list { if item > largest { largest = item; } }\n  largest\n}");
    expect(tree.length).toBeGreaterThan(0);
    expect(tree.type.isTop).toBe(true);
  });

  it("EditorState with rust() has correct doc line count", () => {
    const state = EditorState.create({
      doc: "fn main() {\n  let x = 1;\n  println!(\"{}\", x);\n}",
      extensions: [rust()],
    });
    expect(state.doc.lines).toBe(4);
  });

  it("rustLanguage allows doc mutation via transaction", () => {
    let state = EditorState.create({ doc: "fn main() {}", extensions: [rust()] });
    state = state.update({ changes: { from: 12, insert: "\nfn helper() {}" } }).state;
    expect(state.doc.lines).toBe(2);
  });

  it("rust() state doc line text is accessible", () => {
    const state = EditorState.create({
      doc: "fn main() {}\nfn helper() {}",
      extensions: [rust()],
    });
    expect(state.doc.line(1).text).toBe("fn main() {}");
  });

  it("rust() state allows multiple sequential transactions", () => {
    let state = EditorState.create({ doc: "fn main() {}", extensions: [rust()] });
    state = state.update({ changes: { from: 12, insert: "\nfn foo() {}" } }).state;
    state = state.update({ changes: { from: state.doc.length, insert: "\nfn bar() {}" } }).state;
    expect(state.doc.lines).toBe(3);
  });

  it("rust() extension handles replacement transaction", () => {
    let state = EditorState.create({ doc: "let x: i32 = 1;", extensions: [rust()] });
    state = state.update({ changes: { from: 4, to: 5, insert: "y" } }).state;
    expect(state.doc.toString()).toBe("let y: i32 = 1;");
  });

  it("rust() state selection can span lines", () => {
    const state = EditorState.create({
      doc: "fn main() {}\nfn helper() {}",
      selection: { anchor: 0, head: 12 },
      extensions: [rust()],
    });
    expect(state.selection.main.from).toBe(0);
    expect(state.selection.main.to).toBe(12);
  });
});
