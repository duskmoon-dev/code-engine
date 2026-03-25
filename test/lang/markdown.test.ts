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
import { htmlLanguage } from "../../src/lang/html/index";
import { EditorState } from "../../src/core/state/index";

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

  describe("parseCode behavioral", () => {
    it("parseCode returns a MarkdownExtension with wrap", () => {
      const ext = parseCode({ codeParser: () => null });
      expect(ext).toBeDefined();
      expect(typeof (ext as any).wrap).toBe("function");
    });

    it("parseCode with codeParser covers FencedCode path", () => {
      const jsParser = javascript().language.parser;
      const ext = parseCode({ codeParser: (info) => info === "js" ? jsParser : null });
      const p = markdownLanguage.parser.configure(ext);
      const tree = p.parse("```js\nconsole.log('hi');\n```\n");
      expect(tree.length).toBeGreaterThan(0);
    });

    it("parseCode with codeParser covers FencedCode without info (CodeInfo branch)", () => {
      const jsParser = javascript().language.parser;
      const ext = parseCode({ codeParser: () => jsParser });
      const p = markdownLanguage.parser.configure(ext);
      // FencedCode without language tag - codeParser receives ""
      const tree = p.parse("```\nconsole.log('hi');\n```\n");
      expect(tree.length).toBeGreaterThan(0);
    });

    it("parseCode with htmlParser covers HTMLBlock path and leftOverSpace", () => {
      const ext = parseCode({ htmlParser: htmlLanguage.parser });
      const p = markdownLanguage.parser.configure(ext);
      // An HTML block in markdown triggers the HTMLBlock branch
      const tree = p.parse("<div>\nhello\n</div>\n\nsome text");
      expect(tree.length).toBeGreaterThan(0);
    });

    it("parseCode with codeParser returning null skips nested parse", () => {
      const ext = parseCode({ codeParser: () => null });
      const p = markdownLanguage.parser.configure(ext);
      const tree = p.parse("```python\nx = 1\n```\n");
      expect(tree.length).toBeGreaterThan(0);
    });
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

  it("parser produces a tree with a top-level type", () => {
    const tree = parser.parse("# Heading\n\nParagraph text.");
    expect(tree.type.isTop).toBe(true);
  });

  it("parser can parse a table (GFM)", () => {
    const tree = parser.configure([Table]).parse("| a | b |\n|---|---|\n| 1 | 2 |");
    expect(tree.length).toBeGreaterThan(0);
  });

  it("parser can parse strikethrough (GFM)", () => {
    const tree = parser.configure([Strikethrough]).parse("~~deleted text~~");
    expect(tree.length).toBeGreaterThan(0);
  });

  it("markdownLanguage parser produces a tree from complex document", () => {
    const doc = [
      "# Title",
      "",
      "## Section",
      "",
      "- item 1",
      "- item 2",
      "",
      "```js",
      "const x = 1;",
      "```",
    ].join("\n");
    const tree = markdownLanguage.parser.parse(doc);
    expect(tree.length).toBeGreaterThan(0);
    expect(tree.type.isTop).toBe(true);
  });

  it("markdownLanguage can parse links", () => {
    const tree = markdownLanguage.parser.parse("[Click here](https://example.com)");
    expect(tree.length).toBeGreaterThan(0);
  });

  it("markdownLanguage can parse images", () => {
    const tree = markdownLanguage.parser.parse("![Alt text](image.png)");
    expect(tree.length).toBeGreaterThan(0);
    expect(tree.type.isTop).toBe(true);
  });

  it("markdownLanguage can parse blockquotes", () => {
    const tree = markdownLanguage.parser.parse("> This is a blockquote\n> with multiple lines");
    expect(tree.length).toBeGreaterThan(0);
  });

  it("markdownLanguage can parse ordered lists", () => {
    const tree = markdownLanguage.parser.parse("1. First item\n2. Second item\n3. Third item");
    expect(tree.length).toBeGreaterThan(0);
    expect(tree.type.isTop).toBe(true);
  });

  it("markdownLanguage can parse inline code", () => {
    const tree = markdownLanguage.parser.parse("Use `const x = 1` for assignments.");
    expect(tree.length).toBeGreaterThan(0);
  });

  it("markdownLanguage can parse bold and italic", () => {
    const tree = markdownLanguage.parser.parse("**bold** and *italic* and ***bold italic***");
    expect(tree.length).toBeGreaterThan(0);
    expect(tree.type.isTop).toBe(true);
  });

  it("markdownLanguage cursor traversal works on full document", () => {
    const doc = "# Header\n\n**Bold** text with `code`.\n\n- item 1\n- item 2\n\n> quote";
    const tree = markdownLanguage.parser.parse(doc);
    const cursor = tree.cursor();
    let nodeCount = 0;
    do { nodeCount++; } while (cursor.next() && nodeCount < 200);
    expect(nodeCount).toBeGreaterThan(1);
  });

  it("tree.resolve() finds nodes at multiple positions", () => {
    const doc = "# Hello World\n\nThis is a paragraph with **bold** text.";
    const tree = markdownLanguage.parser.parse(doc);
    for (let i = 0; i < doc.length; i += 6) {
      const node = tree.resolve(i);
      expect(node).toBeDefined();
    }
  });

  it("markdownLanguage can parse footnotes", () => {
    const tree = markdownLanguage.parser.parse("This has a footnote[^1].\n\n[^1]: The footnote text.");
    expect(tree.length).toBeGreaterThan(0);
    expect(tree.type.isTop).toBe(true);
  });

  it("markdownLanguage can parse horizontal rule", () => {
    const tree = markdownLanguage.parser.parse("Before\n\n---\n\nAfter");
    expect(tree.length).toBeGreaterThan(0);
  });

  it("markdownLanguage can parse fenced code block with language", () => {
    const tree = markdownLanguage.parser.parse("```typescript\nconst x: number = 42;\nconsole.log(x);\n```");
    expect(tree.length).toBeGreaterThan(0);
    expect(tree.type.isTop).toBe(true);
  });

  it("markdownLanguage can parse nested lists", () => {
    const tree = markdownLanguage.parser.parse("- item 1\n  - nested 1\n  - nested 2\n- item 2\n  1. numbered sub\n  2. numbered sub 2");
    expect(tree.length).toBeGreaterThan(0);
  });

  it("markdownLanguage can parse atx headings all levels", () => {
    const tree = markdownLanguage.parser.parse("# H1\n## H2\n### H3\n#### H4\n##### H5\n###### H6");
    expect(tree.length).toBeGreaterThan(0);
    expect(tree.type.isTop).toBe(true);
  });

  it("markdownLanguage can parse reference-style links", () => {
    const tree = markdownLanguage.parser.parse("See [the docs][docs].\n\n[docs]: https://example.com \"Documentation\"");
    expect(tree.length).toBeGreaterThan(0);
  });

  it("parser.configure() with task list produces non-empty tree", () => {
    const tree = parser.configure([TaskList]).parse("- [x] done task\n- [ ] pending task");
    expect(tree.length).toBeGreaterThan(0);
    expect(tree.type.isTop).toBe(true);
  });

  it("markdownLanguage can parse blockquotes", () => {
    const tree = markdownLanguage.parser.parse("> This is a blockquote\n> with multiple lines\n>> Nested blockquote");
    expect(tree.length).toBeGreaterThan(0);
    expect(tree.type.isTop).toBe(true);
  });

  it("markdownLanguage can parse horizontal rule", () => {
    const tree = markdownLanguage.parser.parse("before\n\n---\n\nafter\n\n***\n\n___");
    expect(tree.length).toBeGreaterThan(0);
  });

  it("markdownLanguage can parse inline code", () => {
    const tree = markdownLanguage.parser.parse("Use `console.log()` for debugging. The `const` keyword declares a constant.");
    expect(tree.length).toBeGreaterThan(0);
    expect(tree.type.isTop).toBe(true);
  });

  it("markdownLanguage can parse strikethrough", () => {
    const tree = markdownLanguage.parser.parse("This is ~~deleted~~ text and this is **bold ~~bold-deleted~~**.");
    expect(tree.length).toBeGreaterThan(0);
  });

  it("markdownLanguage can parse image with title", () => {
    const tree = markdownLanguage.parser.parse("![Alt text](photo.jpg \"Optional title\")\n![another](https://example.com/img.png)");
    expect(tree.length).toBeGreaterThan(0);
    expect(tree.type.isTop).toBe(true);
  });

  it("markdownLanguage tree.toString() returns non-empty string", () => {
    const tree = markdownLanguage.parser.parse("# Hello\nWorld");
    expect(typeof tree.toString()).toBe("string");
    expect(tree.toString().length).toBeGreaterThan(0);
  });

  it("tree.resolveInner() finds innermost node in Markdown", () => {
    const tree = markdownLanguage.parser.parse("# Title\n\nParagraph here");
    const node = tree.resolveInner(3);
    expect(node).toBeDefined();
    expect(node.from).toBeLessThanOrEqual(3);
    expect(node.to).toBeGreaterThanOrEqual(3);
  });

  it("markdownLanguage can parse definition lists", () => {
    const tree = markdownLanguage.parser.parse("Term\n: Definition\n\nAnother term\n: Another definition");
    expect(tree.length).toBeGreaterThan(0);
  });

  it("markdown() state doc line text is accessible", () => {
    const state = EditorState.create({
      doc: "# Title\n\nFirst paragraph.\n\nSecond paragraph.",
      extensions: [markdown()],
    });
    expect(state.doc.line(1).text).toBe("# Title");
    expect(state.doc.line(3).text).toBe("First paragraph.");
  });

  it("markdown() state allows multiple sequential transactions", () => {
    let state = EditorState.create({ doc: "# Hello", extensions: [markdown()] });
    state = state.update({ changes: { from: 7, insert: "\n\nWorld" } }).state;
    state = state.update({ changes: { from: state.doc.length, insert: "\n\nFoo" } }).state;
    expect(state.doc.lines).toBe(5);
  });

  it("markdown() state deletion transaction works", () => {
    let state = EditorState.create({ doc: "# Title\n\nParagraph.", extensions: [markdown()] });
    state = state.update({ changes: { from: 7, to: 19 } }).state;
    expect(state.doc.toString()).toBe("# Title");
  });

  it("markdown() state with unicode content works", () => {
    const doc = "# こんにちは\n\nWorld";
    const state = EditorState.create({ doc, extensions: [markdown()] });
    expect(state.doc.toString()).toBe(doc);
  });

  it("markdown() extension preserves doc length invariant", () => {
    const doc = "# Hello\n\nWorld";
    const state = EditorState.create({ doc, extensions: [markdown()] });
    expect(state.doc.length).toBe(doc.length);
  });

  it("markdownLanguage parser tree has correct length", () => {
    const code = "# Title\n\nParagraph text here.";
    const tree = markdownLanguage.parser.parse(code);
    expect(tree.length).toBe(code.length);
  });

  it("markdown() state allows 4 sequential transactions", () => {
    let state = EditorState.create({ doc: "# Title", extensions: [markdown()] });
    state = state.update({ changes: { from: 7, insert: "\n\npara1" } }).state;
    state = state.update({ changes: { from: state.doc.length, insert: "\n\npara2" } }).state;
    state = state.update({ changes: { from: state.doc.length, insert: "\n\npara3" } }).state;
    expect(state.doc.lines).toBe(7);
  });

  it("markdown() state allows deletion of entire content", () => {
    const doc = "# Title\n\nParagraph.";
    let state = EditorState.create({ doc, extensions: [markdown()] });
    state = state.update({ changes: { from: 0, to: doc.length } }).state;
    expect(state.doc.toString()).toBe("");
  });

  it("markdown() state allows insert at start", () => {
    let state = EditorState.create({ doc: "# Body", extensions: [markdown()] });
    state = state.update({ changes: { from: 0, insert: "---\ntitle: doc\n---\n\n" } }).state;
    expect(state.doc.line(1).text).toBe("---");
  });

  it("markdown() state selection within single line", () => {
    const state = EditorState.create({
      doc: "# Hello World",
      selection: { anchor: 2, head: 7 },
      extensions: [markdown()],
    });
    expect(state.selection.main.from).toBe(2);
    expect(state.selection.main.to).toBe(7);
  });
});
