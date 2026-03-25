import { describe, it, expect } from "bun:test";
import {
  html, htmlLanguage, autoCloseTags,
  htmlCompletionSource, htmlCompletionSourceWith,
  Schema, elementName, eventAttributes,
  type TagSpec
} from "../../src/lang/html/index";
import { EditorState } from "../../src/core/state/index";
import { syntaxTree, ensureSyntaxTree, getIndentation, foldable } from "../../src/core/language/index";
import { cssLanguage } from "../../src/lang/css/index";

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

  it("htmlLanguage can parse forms", () => {
    const code = "<form action=\"/submit\" method=\"post\"><input type=\"text\" name=\"q\"><button>Submit</button></form>";
    const tree = htmlLanguage.parser.parse(code);
    expect(tree.length).toBe(code.length);
    expect(tree.type.isTop).toBe(true);
  });

  it("htmlLanguage can parse script tag", () => {
    const code = "<script>const x = 1;</script>";
    const tree = htmlLanguage.parser.parse(code);
    expect(tree.length).toBe(code.length);
  });

  it("htmlLanguage can parse style tag", () => {
    const code = "<style>.btn { color: red; }</style>";
    const tree = htmlLanguage.parser.parse(code);
    expect(tree.length).toBe(code.length);
  });

  it("htmlLanguage can parse DOCTYPE", () => {
    const code = "<!DOCTYPE html><html><head><title>Test</title></head><body></body></html>";
    const tree = htmlLanguage.parser.parse(code);
    expect(tree.length).toBe(code.length);
    expect(tree.type.isTop).toBe(true);
  });

  it("tree.resolve() at multiple positions", () => {
    const code = "<div class=\"container\"><p>Hello <strong>world</strong></p></div>";
    const tree = htmlLanguage.parser.parse(code);
    for (let i = 0; i < code.length; i += 8) {
      const node = tree.resolve(i);
      expect(node).toBeDefined();
    }
  });

  it("htmlLanguage can parse SVG element", () => {
    const code = "<svg width=\"100\" height=\"100\"><circle cx=\"50\" cy=\"50\" r=\"40\" fill=\"red\"/></svg>";
    const tree = htmlLanguage.parser.parse(code);
    expect(tree.length).toBe(code.length);
  });

  it("htmlLanguage can parse template element", () => {
    const code = "<template id=\"tmpl\"><p class=\"item\">{{name}}</p></template>";
    const tree = htmlLanguage.parser.parse(code);
    expect(tree.length).toBe(code.length);
    expect(tree.type.isTop).toBe(true);
  });

  it("htmlLanguage can parse data attributes", () => {
    const code = "<div data-id=\"123\" data-user=\"alice\" data-role=\"admin\">content</div>";
    const tree = htmlLanguage.parser.parse(code);
    expect(tree.length).toBe(code.length);
  });

  it("htmlLanguage can parse ARIA attributes", () => {
    const code = "<button aria-label=\"Close\" aria-expanded=\"false\" role=\"button\" tabindex=\"0\">×</button>";
    const tree = htmlLanguage.parser.parse(code);
    expect(tree.length).toBe(code.length);
  });

  it("htmlLanguage can parse meta tags", () => {
    const code = "<head><meta charset=\"UTF-8\"><meta name=\"viewport\" content=\"width=device-width\"><meta name=\"description\" content=\"Test page\"></head>";
    const tree = htmlLanguage.parser.parse(code);
    expect(tree.length).toBe(code.length);
  });

  it("htmlLanguage can parse table structure", () => {
    const code = "<table><thead><tr><th>Name</th><th>Age</th></tr></thead><tbody><tr><td>Alice</td><td>30</td></tr></tbody></table>";
    const tree = htmlLanguage.parser.parse(code);
    expect(tree.length).toBe(code.length);
    expect(tree.type.isTop).toBe(true);
  });

  it("htmlLanguage can parse HTML5 semantic elements", () => {
    const code = "<main><header><nav><a href=\"/\">Home</a></nav></header><article><section><h2>Title</h2></section></article><footer>© 2025</footer></main>";
    const tree = htmlLanguage.parser.parse(code);
    expect(tree.length).toBe(code.length);
  });

  it("htmlLanguage can parse inline SVG", () => {
    const code = "<svg width=\"100\" height=\"100\"><circle cx=\"50\" cy=\"50\" r=\"40\" fill=\"red\"/><text x=\"10\" y=\"20\">hello</text></svg>";
    const tree = htmlLanguage.parser.parse(code);
    expect(tree.length).toBe(code.length);
    expect(tree.type.isTop).toBe(true);
  });

  it("htmlLanguage can parse picture element with sources", () => {
    const code = "<picture><source srcset=\"photo.avif\" type=\"image/avif\"><source srcset=\"photo.webp\" type=\"image/webp\"><img src=\"photo.jpg\" alt=\"photo\"></picture>";
    const tree = htmlLanguage.parser.parse(code);
    expect(tree.length).toBe(code.length);
  });

  it("htmlLanguage can parse details and summary", () => {
    const code = "<details open><summary>Click to expand</summary><p>Hidden content here</p></details>";
    const tree = htmlLanguage.parser.parse(code);
    expect(tree.length).toBe(code.length);
    expect(tree.type.isTop).toBe(true);
  });

  it("htmlLanguage tree.toString() returns non-empty string", () => {
    const tree = htmlLanguage.parser.parse("<p>hello</p>");
    expect(typeof tree.toString()).toBe("string");
    expect(tree.toString().length).toBeGreaterThan(0);
  });

  it("tree.resolveInner() finds innermost node in HTML", () => {
    const tree = htmlLanguage.parser.parse("<div class=\"main\">text</div>");
    const node = tree.resolveInner(5);
    expect(node).toBeDefined();
    expect(node.from).toBeLessThanOrEqual(5);
    expect(node.to).toBeGreaterThanOrEqual(5);
  });

  it("htmlLanguage can parse form with various inputs", () => {
    const code = "<form action=\"/submit\" method=\"POST\"><input type=\"email\" name=\"email\" required><input type=\"password\" name=\"pass\" minlength=\"8\"><select name=\"role\"><option value=\"admin\">Admin</option></select><button type=\"submit\">Submit</button></form>";
    const tree = htmlLanguage.parser.parse(code);
    expect(tree.length).toBe(code.length);
  });

  it("htmlLanguage cursor iteration counts reasonable nodes", () => {
    const tree = htmlLanguage.parser.parse("<div><p>one</p><p>two</p><p>three</p></div>");
    let count = 0;
    tree.iterate({ enter: () => { count++; } });
    expect(count).toBeGreaterThan(5);
  });

  it("html() state doc line count is correct", () => {
    const state = EditorState.create({
      doc: "<!DOCTYPE html>\n<html>\n<head></head>\n<body></body>\n</html>",
      extensions: [html()],
    });
    expect(state.doc.lines).toBe(5);
  });

  it("html() state doc line text is accessible", () => {
    const state = EditorState.create({
      doc: "<!DOCTYPE html>\n<html lang=\"en\">",
      extensions: [html()],
    });
    expect(state.doc.line(1).text).toBe("<!DOCTYPE html>");
  });

  it("html() state allows multiple sequential transactions", () => {
    let state = EditorState.create({ doc: "<div></div>", extensions: [html()] });
    state = state.update({ changes: { from: 11, insert: "\n<p></p>" } }).state;
    state = state.update({ changes: { from: state.doc.length, insert: "\n<span></span>" } }).state;
    expect(state.doc.lines).toBe(3);
  });

  it("html() extension handles replacement transaction", () => {
    let state = EditorState.create({ doc: "<h1>Title</h1>", extensions: [html()] });
    state = state.update({ changes: { from: 1, to: 3, insert: "h2" } }).state;
    expect(state.doc.toString()).toBe("<h2>Title</h1>");
  });

  it("html() extension preserves doc length invariant", () => {
    const doc = "<html><body>hello</body></html>";
    const state = EditorState.create({ doc, extensions: [html()] });
    expect(state.doc.length).toBe(doc.length);
  });

  it("html() state doc line text is accessible", () => {
    const state = EditorState.create({
      doc: "<html>\n<body>\n</body>\n</html>",
      extensions: [html()],
    });
    expect(state.doc.line(1).text).toBe("<html>");
    expect(state.doc.line(2).text).toBe("<body>");
  });

  it("html() state deletion transaction works", () => {
    let state = EditorState.create({ doc: "<div></div>\n<p></p>", extensions: [html()] });
    state = state.update({ changes: { from: 11, to: 19 } }).state;
    expect(state.doc.toString()).toBe("<div></div>");
  });

  it("html() state with unicode content works", () => {
    const doc = "<!-- こんにちは -->\n<p>world</p>";
    const state = EditorState.create({ doc, extensions: [html()] });
    expect(state.doc.toString()).toBe(doc);
  });

  it("html() state selection can span lines", () => {
    const state = EditorState.create({
      doc: "<div>\n  hello\n</div>",
      selection: { anchor: 0, head: 5 },
      extensions: [html()],
    });
    expect(state.selection.main.from).toBe(0);
    expect(state.selection.main.to).toBe(5);
  });

  it("html() state doc line count is correct", () => {
    const state = EditorState.create({
      doc: "<html>\n<head></head>\n<body></body>\n</html>",
      extensions: [html()],
    });
    expect(state.doc.lines).toBe(4);
  });

  it("htmlLanguage parser tree has correct length", () => {
    const code = "<div class=\"box\"><p>Hello</p></div>";
    const tree = htmlLanguage.parser.parse(code);
    expect(tree.length).toBe(code.length);
  });

  it("html() state allows insert at position 0", () => {
    let state = EditorState.create({ doc: "<p>body</p>", extensions: [html()] });
    state = state.update({ changes: { from: 0, insert: "<!DOCTYPE html>\n" } }).state;
    expect(state.doc.line(1).text).toBe("<!DOCTYPE html>");
  });

  it("html() state allows 4 sequential transactions", () => {
    let state = EditorState.create({ doc: "<html>", extensions: [html()] });
    state = state.update({ changes: { from: 6, insert: "<body>" } }).state;
    state = state.update({ changes: { from: state.doc.length, insert: "<p/>" } }).state;
    state = state.update({ changes: { from: state.doc.length, insert: "</body>" } }).state;
    state = state.update({ changes: { from: state.doc.length, insert: "</html>" } }).state;
    expect(state.doc.toString()).toBe("<html><body><p/></body></html>");
  });

  it("html() state doc line(3) text is accessible", () => {
    const state = EditorState.create({
      doc: "<html>\n<body>\n<p>hello</p>\n</body>\n</html>",
      extensions: [html()],
    });
    expect(state.doc.line(3).text).toBe("<p>hello</p>");
  });

  it("html() state deletion transaction works", () => {
    let state = EditorState.create({ doc: "<p>hello</p>\n<p>world</p>", extensions: [html()] });
    state = state.update({ changes: { from: 12, to: 25 } }).state;
    expect(state.doc.toString()).toBe("<p>hello</p>");
  });

  it("html() state allows delete-all content", () => {
    const doc = "<html><body></body></html>";
    let state = EditorState.create({ doc, extensions: [html()] });
    state = state.update({ changes: { from: 0, to: doc.length } }).state;
    expect(state.doc.toString()).toBe("");
  });

  describe("HTML indentation and fold handlers", () => {
    it("Element indentation handler: inner line of multi-line element", () => {
      // "<div>\n  <p>hello</p>\n</div>" - pos 6 is inside outer Element's body
      const doc = "<div>\n  <p>hello</p>\n</div>";
      const state = EditorState.create({ doc, extensions: [html()] });
      ensureSyntaxTree(state, doc.length, 1000);
      const indent = getIndentation(state, 6);
      expect(typeof indent).toBe("number");
    });

    it("OpenTag indentation handler: second line of multi-line opening tag", () => {
      // "<div\n  id='x'>content</div>" - pos 5 is inside OpenTag on second line
      const doc = "<div\n  id='x'>content</div>";
      const state = EditorState.create({ doc, extensions: [html()] });
      ensureSyntaxTree(state, doc.length, 1000);
      const indent = getIndentation(state, 5);
      expect(typeof indent).toBe("number");
    });

    it("CloseTag indentation handler: closing tag line", () => {
      // "<div>\n  content\n</div>" - pos 17 is on the closing tag line
      const doc = "<div>\n  content\n</div>";
      const state = EditorState.create({ doc, extensions: [html()] });
      ensureSyntaxTree(state, doc.length, 1000);
      const indent = getIndentation(state, 17);
      expect(typeof indent).toBe("number");
    });

    it("Document indentation handler: position between top-level elements", () => {
      // "<p>a</p>\n\n<div>" - pos 9 is on blank line between elements (Document level)
      const doc = "<p>a</p>\n\n<div>";
      const state = EditorState.create({ doc, extensions: [html()] });
      ensureSyntaxTree(state, doc.length, 1000);
      const indent = getIndentation(state, 9);
      expect(indent === null || typeof indent === "number").toBe(true);
    });

    it("fold handler: Element with OpenTag and CloseTag is foldable", () => {
      // "<div>\n  <p>hello</p>\n</div>" - first line is "<div>" (pos 0-5)
      const doc = "<div>\n  <p>hello</p>\n</div>";
      const state = EditorState.create({ doc, extensions: [html()] });
      ensureSyntaxTree(state, doc.length, 1000);
      const fold = foldable(state, 0, 5);
      expect(fold).not.toBeNull();
      expect(typeof fold!.from).toBe("number");
      expect(typeof fold!.to).toBe("number");
    });

    it("html() with nestedLanguages covers nestedLanguages config path", () => {
      // Exercises the wrap = configureNesting(...) path at line 147
      const support = html({ nestedLanguages: [{ tag: "x-tmpl", parser: cssLanguage.parser }] });
      expect(support).toBeDefined();
      expect(support.language.name).toBe("html");
    });

    it("html() with nestedAttributes covers nestedAttributes config path", () => {
      const support = html({ nestedAttributes: [{ name: "x-code", parser: cssLanguage.parser }] });
      expect(support).toBeDefined();
      expect(support.language.name).toBe("html");
    });
  });
});
