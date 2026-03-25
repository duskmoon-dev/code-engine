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
});
