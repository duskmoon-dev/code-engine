import { describe, it, expect } from "bun:test";
import {
  markdown,
  markdownLanguage,
  parser, MarkdownParser,
  parseCode,
  GFM, Table, TaskList, Strikethrough, Autolink,
  Subscript, Superscript, Emoji,
} from "../../src/lang/markdown/index";
import { javascript } from "../../src/lang/javascript/index";

describe("Markdown language pack", () => {
  it("exports markdown function", () => {
    expect(typeof markdown).toBe("function");
  });

  it("exports markdownLanguage", () => {
    expect(markdownLanguage).toBeDefined();
    expect(markdownLanguage.name).toBe("markdown");
  });

  it("creates language support with default options", () => {
    const support = markdown();
    expect(support).toBeDefined();
    expect(support.language).toBe(markdownLanguage);
  });

  it("creates language support with GFM extension", () => {
    const support = markdown({ extensions: [GFM] });
    expect(support).toBeDefined();
  });

  it("creates language support with multiple extensions", () => {
    const support = markdown({ extensions: [GFM, Strikethrough, TaskList] });
    expect(support).toBeDefined();
  });

  it("creates language support with codeLanguages", () => {
    const support = markdown({
      codeLanguages: [javascript()],
    });
    expect(support).toBeDefined();
  });

  it("exports parser", () => {
    expect(parser).toBeDefined();
    expect(parser instanceof MarkdownParser).toBe(true);
  });

  it("exports MarkdownParser", () => {
    expect(MarkdownParser).toBeDefined();
    expect(typeof MarkdownParser).toBe("function");
  });

  it("exports parseCode function", () => {
    expect(typeof parseCode).toBe("function");
  });

  it("exports GFM extension", () => {
    expect(GFM).toBeDefined();
    expect(Array.isArray(GFM)).toBe(true);
  });

  it("exports Table extension", () => {
    expect(Table).toBeDefined();
  });

  it("exports TaskList extension", () => {
    expect(TaskList).toBeDefined();
  });

  it("exports Strikethrough extension", () => {
    expect(Strikethrough).toBeDefined();
  });

  it("exports Autolink extension", () => {
    expect(Autolink).toBeDefined();
  });

  it("exports Subscript extension", () => {
    expect(Subscript).toBeDefined();
  });

  it("exports Superscript extension", () => {
    expect(Superscript).toBeDefined();
  });

  it("exports Emoji extension", () => {
    expect(Emoji).toBeDefined();
  });

  it("parser can parse markdown text", () => {
    const tree = parser.parse("# Hello\n\nThis is **markdown**.");
    expect(tree).toBeDefined();
    expect(tree.length).toBeGreaterThan(0);
  });
});
