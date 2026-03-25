import { describe, it, expect } from "bun:test";
import { yaml, yamlLanguage, yamlFrontmatter } from "../../src/lang/yaml/index";
import { javascript } from "../../src/lang/javascript/index";
import { EditorState } from "../../src/core/state/index";
import { syntaxTree, LanguageSupport } from "../../src/core/language/index";

describe("YAML language pack", () => {
  it("exports yaml function", () => {
    expect(typeof yaml).toBe("function");
  });

  it("exports yamlLanguage", () => {
    expect(yamlLanguage).toBeDefined();
    expect(yamlLanguage.name).toBe("yaml");
  });

  it("exports yamlFrontmatter", () => {
    expect(typeof yamlFrontmatter).toBe("function");
  });

  it("creates language support", () => {
    const support = yaml();
    expect(support).toBeDefined();
    expect(support.language).toBe(yamlLanguage);
  });

  it("creates yamlFrontmatter with Language", () => {
    const jsLang = javascript().language;
    const support = yamlFrontmatter({ content: jsLang });
    expect(support).toBeDefined();
  });

  it("creates yamlFrontmatter with LanguageSupport", () => {
    const jsSupport = javascript();
    const support = yamlFrontmatter({ content: jsSupport });
    expect(support).toBeDefined();
  });

  it("yamlLanguage has correct name", () => {
    expect(yamlLanguage.name).toBe("yaml");
  });

  it("yaml() returns LanguageSupport with yamlLanguage", () => {
    const support = yaml();
    expect(support.language).toBe(yamlLanguage);
  });

  it("yamlLanguage parser produces a non-empty tree", () => {
    const tree = yamlLanguage.parser.parse("key: value\nlist:\n  - item1\n  - item2");
    expect(tree.length).toBeGreaterThan(0);
  });

  it("yamlLanguage parser tree has a top-level type", () => {
    const tree = yamlLanguage.parser.parse("a: 1\nb: 2");
    expect(tree.type.isTop).toBe(true);
  });

  it("yaml() returns LanguageSupport instance", () => {
    expect(yaml()).toBeInstanceOf(LanguageSupport);
  });

  it("syntaxTree from EditorState with yaml() is non-empty", () => {
    const state = EditorState.create({
      doc: "name: Alice\nage: 30",
      extensions: [yaml()],
    });
    const tree = syntaxTree(state);
    expect(tree.length).toBeGreaterThan(0);
  });

  it("yamlLanguage can parse nested structures", () => {
    const tree = yamlLanguage.parser.parse("outer:\n  inner:\n    deep: value");
    expect(tree.length).toBeGreaterThan(0);
    expect(tree.type.isTop).toBe(true);
  });

  it("yamlFrontmatter integrates with EditorState", () => {
    const state = EditorState.create({
      doc: "---\ntitle: Test\n---\nconsole.log('hi')",
      extensions: [yamlFrontmatter({ content: javascript() })],
    });
    expect(state.doc.toString()).toContain("title: Test");
  });

  it("yamlLanguage cursor traversal works on docker-compose style config", () => {
    const code = "services:\n  web:\n    image: nginx\n    ports:\n      - \"80:80\"";
    const tree = yamlLanguage.parser.parse(code);
    const cursor = tree.cursor();
    let nodeCount = 0;
    do { nodeCount++; } while (cursor.next() && nodeCount < 100);
    expect(nodeCount).toBeGreaterThan(1);
    expect(tree.length).toBeGreaterThan(0);
    expect(tree.type.isTop).toBe(true);
  });

  it("yamlLanguage can parse sequence (list) syntax", () => {
    const tree = yamlLanguage.parser.parse("- item1\n- item2\n- item3");
    expect(tree.length).toBeGreaterThan(0);
    expect(tree.type.isTop).toBe(true);
  });

  it("yamlLanguage can parse inline sequence", () => {
    const tree = yamlLanguage.parser.parse("colors: [red, green, blue]");
    expect(tree.length).toBeGreaterThan(0);
  });

  it("yamlLanguage can parse inline mapping", () => {
    const tree = yamlLanguage.parser.parse("point: {x: 1, y: 2}");
    expect(tree.length).toBeGreaterThan(0);
  });

  it("yamlLanguage can parse multi-line string (literal block)", () => {
    const tree = yamlLanguage.parser.parse("text: |\n  line one\n  line two");
    expect(tree.length).toBeGreaterThan(0);
    expect(tree.type.isTop).toBe(true);
  });

  it("yamlLanguage can parse folded block scalar", () => {
    const tree = yamlLanguage.parser.parse("description: >\n  This is a long\n  description folded");
    expect(tree.length).toBeGreaterThan(0);
  });

  it("yamlLanguage can parse comments", () => {
    const tree = yamlLanguage.parser.parse("# A comment\nkey: value # inline comment");
    expect(tree.length).toBeGreaterThan(0);
    expect(tree.type.isTop).toBe(true);
  });

  it("yamlLanguage can parse boolean values", () => {
    const tree = yamlLanguage.parser.parse("enabled: true\ndisabled: false");
    expect(tree.length).toBeGreaterThan(0);
  });

  it("yamlLanguage can parse null values", () => {
    const tree = yamlLanguage.parser.parse("optional: null\nalso_null: ~");
    expect(tree.length).toBeGreaterThan(0);
  });

  it("yamlLanguage can parse numeric values", () => {
    const tree = yamlLanguage.parser.parse("count: 42\npi: 3.14159\nneg: -7");
    expect(tree.length).toBeGreaterThan(0);
    expect(tree.type.isTop).toBe(true);
  });

  it("tree.resolve() finds nodes at multiple positions in YAML", () => {
    const code = "name: Alice\nage: 30\nroles:\n  - admin\n  - user";
    const tree = yamlLanguage.parser.parse(code);
    for (let i = 0; i < code.length; i += 6) {
      const node = tree.resolve(i);
      expect(node).toBeDefined();
    }
  });

  it("yamlLanguage can parse anchors and aliases", () => {
    const tree = yamlLanguage.parser.parse("defaults: &defaults\n  color: blue\n  size: large\nbtn:\n  <<: *defaults\n  color: red");
    expect(tree.length).toBeGreaterThan(0);
    expect(tree.type.isTop).toBe(true);
  });

  it("yamlLanguage can parse explicit document markers", () => {
    const tree = yamlLanguage.parser.parse("---\nkey: value\n...");
    expect(tree.length).toBeGreaterThan(0);
  });

  it("yamlLanguage can parse quoted strings", () => {
    const tree = yamlLanguage.parser.parse("single: 'hello world'\ndouble: \"foo: bar\"\nnewline: \"line1\\nline2\"");
    expect(tree.length).toBeGreaterThan(0);
    expect(tree.type.isTop).toBe(true);
  });

  it("yamlLanguage can parse deeply nested mapping", () => {
    const tree = yamlLanguage.parser.parse("a:\n  b:\n    c:\n      d:\n        e: value");
    expect(tree.length).toBeGreaterThan(0);
  });

  it("yamlLanguage cursor counts reasonable node count", () => {
    const code = "name: Alice\nage: 30\nroles:\n  - admin\n  - user\naddress:\n  city: NYC\n  zip: '10001'";
    const tree = yamlLanguage.parser.parse(code);
    let nodeCount = 0;
    tree.iterate({ enter: () => { nodeCount++; } });
    expect(nodeCount).toBeGreaterThan(5);
  });

  it("yamlLanguage tree.toString() returns non-empty string", () => {
    const tree = yamlLanguage.parser.parse("key: value");
    expect(typeof tree.toString()).toBe("string");
    expect(tree.toString().length).toBeGreaterThan(0);
  });

  it("tree.resolveInner() finds innermost node in YAML", () => {
    const tree = yamlLanguage.parser.parse("key: value\nother: 42");
    const node = tree.resolveInner(5);
    expect(node).toBeDefined();
    expect(node.from).toBeLessThanOrEqual(5);
    expect(node.to).toBeGreaterThanOrEqual(5);
  });
});
