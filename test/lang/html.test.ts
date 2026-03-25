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
});
