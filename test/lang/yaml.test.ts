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
});
