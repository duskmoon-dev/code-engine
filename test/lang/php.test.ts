import { describe, it, expect } from "bun:test";
import { php, phpLanguage } from "../../src/lang/php/index";
import { htmlLanguage } from "../../src/lang/html/index";
import { EditorState } from "../../src/core/state/index";
import { syntaxTree, LanguageSupport } from "../../src/core/language/index";

describe("PHP language pack", () => {
  it("exports php function", () => {
    expect(typeof php).toBe("function");
  });

  it("exports phpLanguage", () => {
    expect(phpLanguage).toBeDefined();
    expect(phpLanguage.name).toBe("php");
  });

  it("creates language support with default options (html base)", () => {
    const support = php();
    expect(support).toBeDefined();
  });

  it("creates language support with plain mode", () => {
    const support = php({ plain: true });
    expect(support).toBeDefined();
  });

  it("creates language support with null base (no html embedding)", () => {
    const support = php({ baseLanguage: null });
    expect(support).toBeDefined();
  });

  it("creates language support with custom base language", () => {
    const support = php({ baseLanguage: htmlLanguage });
    expect(support).toBeDefined();
  });

  it("php() returns LanguageSupport with a language", () => {
    const lang = php();
    expect(lang.language).toBeDefined();
  });

  it("phpLanguage parser produces a non-empty tree from plain PHP", () => {
    const tree = phpLanguage.parser.parse("<?php echo 'hello'; ?>");
    expect(tree.length).toBeGreaterThan(0);
  });

  it("phpLanguage parser tree has a top-level type", () => {
    const tree = phpLanguage.parser.parse("<?php $x = 1; ?>");
    expect(tree.type.isTop).toBe(true);
  });

  it("php() returns LanguageSupport instance", () => {
    expect(php()).toBeInstanceOf(LanguageSupport);
  });

  it("php({ plain: true }) returns LanguageSupport instance", () => {
    expect(php({ plain: true })).toBeInstanceOf(LanguageSupport);
  });

  it("syntaxTree from EditorState with php() is non-empty", () => {
    const state = EditorState.create({
      doc: "<?php echo 'hello'; ?>",
      extensions: [php()],
    });
    const tree = syntaxTree(state);
    expect(tree.length).toBeGreaterThan(0);
  });

  it("phpLanguage parser can parse function declaration", () => {
    const tree = phpLanguage.parser.parse("<?php function greet($name) { return 'Hello, ' . $name; } ?>");
    expect(tree.length).toBeGreaterThan(0);
    expect(tree.type.isTop).toBe(true);
  });

  it("phpLanguage cursor traversal works on function with call", () => {
    const code = "<?php function add($a, $b) { return $a + $b; } echo add(1, 2); ?>";
    const tree = phpLanguage.parser.parse(code);
    const cursor = tree.cursor();
    let nodeCount = 0;
    do { nodeCount++; } while (cursor.next() && nodeCount < 100);
    expect(nodeCount).toBeGreaterThan(1);
    expect(tree.length).toBeGreaterThan(0);
    expect(tree.type.isTop).toBe(true);
  });

  it("phpLanguage can parse class declaration", () => {
    const tree = phpLanguage.parser.parse("<?php class Animal { private $name; public function __construct($n) { $this->name = $n; } } ?>");
    expect(tree.length).toBeGreaterThan(0);
    expect(tree.type.isTop).toBe(true);
  });

  it("phpLanguage can parse interface declaration", () => {
    const tree = phpLanguage.parser.parse("<?php interface Drawable { public function draw(): void; } ?>");
    expect(tree.length).toBeGreaterThan(0);
  });

  it("phpLanguage can parse trait declaration", () => {
    const tree = phpLanguage.parser.parse("<?php trait Greetable { public function greet() { return 'Hello!'; } } ?>");
    expect(tree.length).toBeGreaterThan(0);
    expect(tree.type.isTop).toBe(true);
  });

  it("phpLanguage can parse namespace declaration", () => {
    const tree = phpLanguage.parser.parse("<?php namespace App\\Models; class User {} ?>");
    expect(tree.length).toBeGreaterThan(0);
  });

  it("phpLanguage can parse use statement", () => {
    const tree = phpLanguage.parser.parse("<?php use App\\Http\\Controllers\\HomeController; ?>");
    expect(tree.length).toBeGreaterThan(0);
  });

  it("phpLanguage can parse array syntax", () => {
    const tree = phpLanguage.parser.parse("<?php $arr = [1, 2, 3]; $map = ['key' => 'value']; ?>");
    expect(tree.length).toBeGreaterThan(0);
    expect(tree.type.isTop).toBe(true);
  });

  it("phpLanguage can parse try-catch", () => {
    const tree = phpLanguage.parser.parse("<?php try { riskyOp(); } catch (Exception $e) { echo $e->getMessage(); } finally { cleanup(); } ?>");
    expect(tree.length).toBeGreaterThan(0);
  });

  it("phpLanguage can parse arrow function", () => {
    const tree = phpLanguage.parser.parse("<?php $double = fn($x) => $x * 2; ?>");
    expect(tree.length).toBeGreaterThan(0);
  });

  it("phpLanguage can parse heredoc", () => {
    const tree = phpLanguage.parser.parse("<?php $text = <<<EOT\nHello World\nEOT; ?>");
    expect(tree.length).toBeGreaterThan(0);
  });

  it("tree.resolve() finds nodes at multiple positions in PHP", () => {
    const code = "<?php $x = 10; $y = 20; echo $x + $y; ?>";
    const tree = phpLanguage.parser.parse(code);
    for (let i = 0; i < code.length; i += 5) {
      const node = tree.resolve(i);
      expect(node).toBeDefined();
    }
  });

  it("phpLanguage can parse match expression (PHP 8)", () => {
    const tree = phpLanguage.parser.parse("<?php $result = match($status) { 'active' => 'Active user', 'banned' => 'Banned user', default => 'Unknown' }; ?>");
    expect(tree.length).toBeGreaterThan(0);
    expect(tree.type.isTop).toBe(true);
  });

  it("phpLanguage can parse named arguments (PHP 8)", () => {
    const tree = phpLanguage.parser.parse("<?php htmlspecialchars(string: $str, encoding: 'UTF-8'); ?>");
    expect(tree.length).toBeGreaterThan(0);
  });

  it("phpLanguage can parse nullsafe operator", () => {
    const tree = phpLanguage.parser.parse("<?php $city = $user?->getAddress()?->city; ?>");
    expect(tree.length).toBeGreaterThan(0);
    expect(tree.type.isTop).toBe(true);
  });

  it("phpLanguage can parse union types", () => {
    const tree = phpLanguage.parser.parse("<?php function process(int|string $value): int|float { return is_string($value) ? strlen($value) : $value * 1.0; } ?>");
    expect(tree.length).toBeGreaterThan(0);
  });

  it("phpLanguage can parse enum (PHP 8.1)", () => {
    const tree = phpLanguage.parser.parse("<?php enum Status: string { case Active = 'active'; case Inactive = 'inactive'; } ?>");
    expect(tree.length).toBeGreaterThan(0);
    expect(tree.type.isTop).toBe(true);
  });

  it("phpLanguage can parse constructor property promotion", () => {
    const tree = phpLanguage.parser.parse("<?php class User { public function __construct(public readonly string $name, private int $age) {} } ?>");
    expect(tree.length).toBeGreaterThan(0);
  });

  it("phpLanguage can parse fibers (PHP 8.1)", () => {
    const tree = phpLanguage.parser.parse("<?php $fiber = new Fiber(function(): void { $value = Fiber::suspend('hello'); echo $value; }); $value = $fiber->start(); ?>");
    expect(tree.length).toBeGreaterThan(0);
    expect(tree.type.isTop).toBe(true);
  });

  it("phpLanguage can parse spread operator", () => {
    const tree = phpLanguage.parser.parse("<?php $arr1 = [1, 2, 3]; $arr2 = [4, 5, 6]; $merged = [...$arr1, ...$arr2]; ?>");
    expect(tree.length).toBeGreaterThan(0);
  });

  it("tree.resolveInner() finds innermost node in PHP", () => {
    const tree = phpLanguage.parser.parse("<?php $x = 42; echo $x; ?>");
    const node = tree.resolveInner(10);
    expect(node).toBeDefined();
    expect(node.from).toBeLessThanOrEqual(10);
    expect(node.to).toBeGreaterThanOrEqual(10);
  });

  it("phpLanguage tree.toString() returns non-empty string", () => {
    const tree = phpLanguage.parser.parse("<?php echo 'Hello'; ?>");
    expect(typeof tree.toString()).toBe("string");
    expect(tree.toString().length).toBeGreaterThan(0);
  });

  it("phpLanguage cursor traversal finds multiple nodes", () => {
    const tree = phpLanguage.parser.parse("<?php function add($a, $b) { return $a + $b; } ?>");
    let count = 0;
    tree.iterate({ enter: () => { count++; } });
    expect(count).toBeGreaterThan(3);
  });

  it("phpLanguage can parse abstract class", () => {
    const tree = phpLanguage.parser.parse("<?php abstract class Shape { abstract public function area(): float; public function describe(): string { return 'shape'; } } ?>");
    expect(tree.length).toBeGreaterThan(0);
    expect(tree.type.isTop).toBe(true);
  });

  it("phpLanguage can parse trait", () => {
    const tree = phpLanguage.parser.parse("<?php trait Greetable { public function greet(): string { return 'Hello, ' . $this->name; } } class User { use Greetable; public string $name = 'World'; } ?>");
    expect(tree.length).toBeGreaterThan(0);
  });

  it("EditorState with php() has correct doc line count", () => {
    const state = EditorState.create({
      doc: "<?php\n$x = 1;\n$y = 2;\necho $x + $y;\n?>",
      extensions: [php()],
    });
    expect(state.doc.lines).toBe(5);
  });

  it("php() state doc line text is accessible", () => {
    const state = EditorState.create({
      doc: "<?php\necho 'Hello';\n?>",
      extensions: [php()],
    });
    expect(state.doc.line(2).text).toBe("echo 'Hello';");
  });

  it("php() state allows multiple sequential transactions", () => {
    let state = EditorState.create({ doc: "<?php $x = 1;", extensions: [php()] });
    state = state.update({ changes: { from: 13, insert: "\n$y = 2;" } }).state;
    state = state.update({ changes: { from: state.doc.length, insert: "\n$z = 3;" } }).state;
    expect(state.doc.lines).toBe(3);
  });

  it("php() extension handles replacement transaction", () => {
    let state = EditorState.create({ doc: "<?php $x = 1;", extensions: [php()] });
    state = state.update({ changes: { from: 6, to: 8, insert: "$y" } }).state;
    expect(state.doc.toString()).toBe("<?php $y = 1;");
  });

  it("php() extension preserves doc length invariant", () => {
    const doc = "<?php echo 'Hello'; ?>";
    const state = EditorState.create({ doc, extensions: [php()] });
    expect(state.doc.length).toBe(doc.length);
  });

  it("php() state doc line text is accessible", () => {
    const state = EditorState.create({
      doc: "<?php\n$x = 1;\n$y = 2;",
      extensions: [php()],
    });
    expect(state.doc.line(1).text).toBe("<?php");
    expect(state.doc.line(2).text).toBe("$x = 1;");
  });

  it("php() state deletion transaction works", () => {
    let state = EditorState.create({ doc: "<?php $x = 1;\n$y = 2;", extensions: [php()] });
    state = state.update({ changes: { from: 13, to: 21 } }).state;
    expect(state.doc.toString()).toBe("<?php $x = 1;");
  });

  it("phpLanguage parser tree has correct length", () => {
    const code = "<?php function greet($name) { return 'Hello ' . $name; }";
    const tree = phpLanguage.parser.parse(code);
    expect(tree.length).toBe(code.length);
  });

  it("php() with htmlLanguage base state integrates", () => {
    const state = EditorState.create({
      doc: "<html><body><?php echo 'hi'; ?></body></html>",
      extensions: [php({ baseLanguage: htmlLanguage })],
    });
    expect(state.doc.toString()).toContain("<?php");
  });
});
