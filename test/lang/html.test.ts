import { describe, it, expect } from "bun:test";
import {
  html, htmlLanguage, autoCloseTags,
  htmlCompletionSource, htmlCompletionSourceWith,
  Schema, elementName, eventAttributes,
  type TagSpec
} from "../../src/lang/html/index";
import { EditorState } from "../../src/core/state/index";
import { syntaxTree } from "../../src/core/language/index";

describe("HTML language pack", () => {
  it("exports html function", () => {
    expect(typeof html).toBe("function");
  });

  it("exports htmlLanguage", () => {
    expect(htmlLanguage).toBeDefined();
    expect(htmlLanguage.name).toBe("html");
  });

  it("exports autoCloseTags", () => {
    expect(autoCloseTags).toBeDefined();
  });

  it("exports htmlCompletionSource", () => {
    expect(typeof htmlCompletionSource).toBe("function");
  });

  it("exports htmlCompletionSourceWith", () => {
    expect(typeof htmlCompletionSourceWith).toBe("function");
  });

  it("exports Schema", () => {
    expect(Schema).toBeDefined();
  });

  it("exports elementName", () => {
    expect(typeof elementName).toBe("function");
  });

  it("exports eventAttributes", () => {
    expect(Array.isArray(eventAttributes)).toBe(true);
    expect(eventAttributes.length).toBeGreaterThan(0);
  });

  it("creates language support with default options", () => {
    const support = html();
    expect(support).toBeDefined();
    expect(support.language).toBe(htmlLanguage);
  });

  it("creates language support with matchClosingTags disabled", () => {
    const support = html({ matchClosingTags: false });
    expect(support).toBeDefined();
  });

  it("creates language support with selfClosingTags enabled", () => {
    const support = html({ selfClosingTags: true });
    expect(support).toBeDefined();
  });

  it("creates language support with custom tags", () => {
    const extraTags: Record<string, TagSpec> = {
      "my-button": { attrs: { disabled: null, label: null } },
    };
    const support = html({ extraTags });
    expect(support).toBeDefined();
  });

  it("htmlCompletionSourceWith returns a completion source", () => {
    const source = htmlCompletionSourceWith({});
    expect(typeof source).toBe("function");
  });

  it("htmlCompletionSourceWith with extra tags", () => {
    const extraTags: Record<string, TagSpec> = {
      "x-button": { attrs: { type: ["button", "submit", "reset"] } },
    };
    const source = htmlCompletionSourceWith({ extraTags });
    expect(typeof source).toBe("function");
  });

  it("htmlLanguage parser produces a non-empty tree", () => {
    const tree = htmlLanguage.parser.parse("<div class=\"foo\">hello</div>");
    expect(tree.length).toBeGreaterThan(0);
  });

  it("htmlLanguage parser tree has a top-level type", () => {
    const tree = htmlLanguage.parser.parse("<!DOCTYPE html><html><body></body></html>");
    expect(tree.type.isTop).toBe(true);
  });

  it("syntaxTree from EditorState with html() is non-empty", () => {
    const state = EditorState.create({
      doc: "<p>Hello <strong>world</strong></p>",
      extensions: [html()],
    });
    const tree = syntaxTree(state);
    expect(tree.length).toBeGreaterThan(0);
  });

  it("html parser can traverse tree with cursor", () => {
    const tree = htmlLanguage.parser.parse("<ul><li>item 1</li><li>item 2</li></ul>");
    const cursor = tree.cursor();
    let nodeCount = 0;
    do { nodeCount++; } while (cursor.next() && nodeCount < 100);
    expect(nodeCount).toBeGreaterThan(1);
  });

  it("html parser resolves a node at a position", () => {
    const code = "<div id=\"main\">content</div>";
    const tree = htmlLanguage.parser.parse(code);
    const node = tree.resolve(5);
    expect(node).toBeDefined();
    expect(node.type).toBeDefined();
  });

  it("html() accepts selfClosingTags option", () => {
    const support = html({ selfClosingTags: true });
    expect(support).toBeDefined();
  });
});
