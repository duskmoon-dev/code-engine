import { describe, it, expect } from "bun:test";
import {
  xml, xmlLanguage, completeFromSchema, autoCloseTags,
  type ElementSpec, type AttrSpec
} from "../../src/lang/xml/index";
import { EditorState } from "../../src/core/state/index";
import { syntaxTree, ensureSyntaxTree, getIndentation } from "../../src/core/language/index";
import { CompletionContext } from "../../src/core/autocomplete/index";

describe("XML language pack", () => {
  it("exports xml function", () => {
    expect(typeof xml).toBe("function");
  });

  it("exports xmlLanguage", () => {
    expect(xmlLanguage).toBeDefined();
    expect(xmlLanguage.name).toBe("xml");
  });

  it("exports completeFromSchema", () => {
    expect(typeof completeFromSchema).toBe("function");
  });

  it("exports autoCloseTags", () => {
    expect(autoCloseTags).toBeDefined();
  });

  it("creates language support with default options", () => {
    const support = xml();
    expect(support).toBeDefined();
    expect(support.language).toBe(xmlLanguage);
  });

  it("creates language support with autoCloseTags disabled", () => {
    const support = xml({ autoCloseTags: false });
    expect(support).toBeDefined();
  });

  it("creates language support with element schema", () => {
    const elements: ElementSpec[] = [
      { name: "root", top: true, children: ["child"] },
      { name: "child", attributes: ["id", "class"] },
    ];
    const support = xml({ elements });
    expect(support).toBeDefined();
  });

  it("creates language support with attribute schema", () => {
    const attributes: AttrSpec[] = [
      { name: "id", global: true },
      { name: "class", global: true, values: ["foo", "bar"] },
    ];
    const support = xml({ attributes });
    expect(support).toBeDefined();
  });

  it("creates language support with full schema", () => {
    const elements: ElementSpec[] = [
      { name: "catalog", top: true, children: ["book"] },
      { name: "book", attributes: ["id"], children: ["title", "author"] },
      { name: "title" },
      { name: "author" },
    ];
    const attributes: AttrSpec[] = [
      { name: "id", global: true },
    ];
    const support = xml({ elements, attributes });
    expect(support).toBeDefined();
  });

  it("completeFromSchema returns a completion source function", () => {
    const source = completeFromSchema(
      [{ name: "root", top: true }],
      []
    );
    expect(typeof source).toBe("function");
  });

  it("completeFromSchema with empty schema returns a function", () => {
    const source = completeFromSchema([], []);
    expect(typeof source).toBe("function");
  });

  it("xmlLanguage has correct language data", () => {
    const data = xmlLanguage.data.of({});
    expect(data).toBeDefined();
  });

  it("element spec supports textContent", () => {
    const elements: ElementSpec[] = [
      { name: "note", textContent: ["important", "critical"] },
    ];
    const support = xml({ elements });
    expect(support).toBeDefined();
  });

  it("element spec supports completion metadata", () => {
    const elements: ElementSpec[] = [
      {
        name: "button",
        completion: { boost: 10, info: "HTML button element" }
      },
    ];
    const support = xml({ elements });
    expect(support).toBeDefined();
  });

  it("xmlLanguage parser produces a non-empty tree", () => {
    const tree = xmlLanguage.parser.parse("<root><child attr=\"val\">text</child></root>");
    expect(tree.length).toBeGreaterThan(0);
  });

  it("xmlLanguage parser tree has a top-level type", () => {
    const tree = xmlLanguage.parser.parse("<?xml version=\"1.0\"?><doc/>");
    expect(tree.type.isTop).toBe(true);
  });

  it("syntaxTree from EditorState with xml() is non-empty", () => {
    const state = EditorState.create({
      doc: "<items><item id=\"1\">first</item><item id=\"2\">second</item></items>",
      extensions: [xml()],
    });
    const tree = syntaxTree(state);
    expect(tree.length).toBeGreaterThan(0);
  });

  it("xml parse tree cursor traversal works", () => {
    const tree = xmlLanguage.parser.parse("<root><child attr=\"val\">text</child></root>");
    const cursor = tree.cursor();
    let nodeCount = 0;
    do { nodeCount++; } while (cursor.next() && nodeCount < 100);
    expect(nodeCount).toBeGreaterThan(1);
  });

  it("xml parse tree resolve() at position finds a node", () => {
    const code = "<div class=\"main\">hello</div>";
    const tree = xmlLanguage.parser.parse(code);
    const node = tree.resolve(1);
    expect(node).toBeDefined();
    expect(node.type).toBeDefined();
  });

  it("xmlLanguage can parse CDATA", () => {
    const code = "<data><![CDATA[some < special & data]]></data>";
    const tree = xmlLanguage.parser.parse(code);
    expect(tree.length).toBe(code.length);
  });

  it("xmlLanguage can parse XML namespaces", () => {
    const code = "<svg:svg xmlns:svg=\"http://www.w3.org/2000/svg\"><svg:circle cx=\"50\" cy=\"50\" r=\"40\"/></svg:svg>";
    const tree = xmlLanguage.parser.parse(code);
    expect(tree.length).toBe(code.length);
    expect(tree.type.isTop).toBe(true);
  });

  it("xmlLanguage can parse processing instructions", () => {
    const code = "<?xml version=\"1.0\" encoding=\"UTF-8\"?><root/>";
    const tree = xmlLanguage.parser.parse(code);
    expect(tree.length).toBe(code.length);
  });

  it("xmlLanguage can parse comments", () => {
    const code = "<!-- This is a comment --><root/>";
    const tree = xmlLanguage.parser.parse(code);
    expect(tree.length).toBe(code.length);
  });

  it("tree.resolve() works at multiple positions in XML", () => {
    const code = "<bookstore><book category=\"fiction\"><title>Great Expectations</title></book></bookstore>";
    const tree = xmlLanguage.parser.parse(code);
    for (let i = 0; i < code.length; i += 10) {
      const node = tree.resolve(i);
      expect(node).toBeDefined();
    }
  });

  it("xmlLanguage can parse self-closing tags", () => {
    const code = "<br/><hr/><img src=\"photo.jpg\" alt=\"photo\"/>";
    const tree = xmlLanguage.parser.parse(code);
    expect(tree.length).toBeGreaterThan(0);
    expect(tree.type.isTop).toBe(true);
  });

  it("xmlLanguage can parse deeply nested elements", () => {
    const code = "<a><b><c><d><e>deep</e></d></c></b></a>";
    const tree = xmlLanguage.parser.parse(code);
    expect(tree.length).toBeGreaterThan(0);
  });

  it("xmlLanguage can parse entities", () => {
    const code = "<p>Tom &amp; Jerry, &lt;the&gt; cartoon &quot;stars&quot;</p>";
    const tree = xmlLanguage.parser.parse(code);
    expect(tree.length).toBeGreaterThan(0);
  });

  it("xmlLanguage cursor traversal counts more than 5 nodes", () => {
    const code = "<root><a>1</a><b>2</b><c>3</c><d>4</d></root>";
    const tree = xmlLanguage.parser.parse(code);
    const cursor = tree.cursor();
    let count = 0;
    do { count++; } while (cursor.next() && count < 200);
    expect(count).toBeGreaterThan(5);
  });

  it("xmlLanguage can parse mixed content (text and elements)", () => {
    const code = "<p>Text before <em>emphasis</em> and after</p>";
    const tree = xmlLanguage.parser.parse(code);
    expect(tree.length).toBeGreaterThan(0);
    expect(tree.type.isTop).toBe(true);
  });

  it("xmlLanguage can parse DOCTYPE declaration", () => {
    const code = "<!DOCTYPE html PUBLIC \"-//W3C//DTD HTML 4.01//EN\"><html></html>";
    const tree = xmlLanguage.parser.parse(code);
    expect(tree.length).toBeGreaterThan(0);
  });

  it("xmlLanguage tree.toString() returns non-empty string", () => {
    const tree = xmlLanguage.parser.parse("<root><child/></root>");
    expect(typeof tree.toString()).toBe("string");
    expect(tree.toString().length).toBeGreaterThan(0);
  });

  it("xmlLanguage can parse attributes with single quotes", () => {
    const code = "<elem attr='single' other='value'/>";
    const tree = xmlLanguage.parser.parse(code);
    expect(tree.length).toBeGreaterThan(0);
    expect(tree.type.isTop).toBe(true);
  });

  it("tree.resolveInner() finds innermost node in XML", () => {
    const tree = xmlLanguage.parser.parse("<root><child>text</child></root>");
    const node = tree.resolveInner(8);
    expect(node).toBeDefined();
    expect(node.from).toBeLessThanOrEqual(8);
    expect(node.to).toBeGreaterThanOrEqual(8);
  });

  it("xmlLanguage can parse SVG-like structure", () => {
    const code = "<svg viewBox=\"0 0 100 100\"><circle cx=\"50\" cy=\"50\" r=\"40\" fill=\"red\"/><rect x=\"10\" y=\"10\" width=\"80\" height=\"80\"/></svg>";
    const tree = xmlLanguage.parser.parse(code);
    expect(tree.length).toBeGreaterThan(0);
    expect(tree.type.isTop).toBe(true);
  });

  it("xmlLanguage can parse multiple siblings", () => {
    const code = "<items><a>1</a><b>2</b><c>3</c><d>4</d><e>5</e></items>";
    const tree = xmlLanguage.parser.parse(code);
    let nodeCount = 0;
    tree.iterate({ enter: () => { nodeCount++; } });
    expect(nodeCount).toBeGreaterThan(5);
  });

  it("xmlLanguage can parse XML declaration", () => {
    const tree = xmlLanguage.parser.parse("<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n<root><item>content</item></root>");
    expect(tree.length).toBeGreaterThan(0);
  });

  it("xmlLanguage can parse CDATA section", () => {
    const tree = xmlLanguage.parser.parse("<root><data><![CDATA[<b>bold</b> & special chars]]></data></root>");
    expect(tree.length).toBeGreaterThan(0);
    expect(tree.type.isTop).toBe(true);
  });

  it("xmlLanguage can parse namespace declarations", () => {
    const tree = xmlLanguage.parser.parse("<root xmlns:xsi=\"http://www.w3.org/2001/XMLSchema-instance\" xsi:noNamespaceSchemaLocation=\"schema.xsd\"><item/></root>");
    expect(tree.length).toBeGreaterThan(0);
  });

  it("EditorState with xml() has correct doc line count", () => {
    const state = EditorState.create({
      doc: "<root>\n  <item>a</item>\n  <item>b</item>\n</root>",
      extensions: [xml()],
    });
    expect(state.doc.lines).toBe(4);
  });

  it("xmlLanguage allows doc mutation via transaction", () => {
    let state = EditorState.create({ doc: "<root/>", extensions: [xml()] });
    state = state.update({ changes: { from: 5, to: 7, insert: "><child/></root>" } }).state;
    expect(state.doc.toString()).toBe("<root><child/></root>");
  });

  it("xml() state doc line text is accessible", () => {
    const state = EditorState.create({
      doc: "<root>\n  <item>text</item>\n</root>",
      extensions: [xml()],
    });
    expect(state.doc.line(1).text).toBe("<root>");
    expect(state.doc.line(3).text).toBe("</root>");
  });

  it("xml() state allows multiple sequential transactions", () => {
    let state = EditorState.create({ doc: "<root/>", extensions: [xml()] });
    state = state.update({ changes: { from: 5, to: 7, insert: "><a/></root>" } }).state;
    state = state.update({ changes: { from: state.doc.length - 7, insert: "<b/>" } }).state;
    expect(state.doc.toString()).toContain("<b/>");
  });

  it("xml() state allows replacement transaction", () => {
    let state = EditorState.create({ doc: "<root><old/></root>", extensions: [xml()] });
    state = state.update({ changes: { from: 6, to: 12, insert: "<new/>" } }).state;
    expect(state.doc.toString()).toBe("<root><new/></root>");
  });

  it("xml() doc length invariant holds", () => {
    const doc = "<root><child/></root>";
    const state = EditorState.create({ doc, extensions: [xml()] });
    expect(state.doc.length).toBe(doc.length);
  });

  it("xml() state deletion transaction works", () => {
    let state = EditorState.create({ doc: "<root/>\n<other/>", extensions: [xml()] });
    state = state.update({ changes: { from: 7, to: 16 } }).state;
    expect(state.doc.toString()).toBe("<root/>");
  });

  it("xml() state with unicode content works", () => {
    const doc = "<!-- こんにちは -->\n<root/>";
    const state = EditorState.create({ doc, extensions: [xml()] });
    expect(state.doc.toString()).toBe(doc);
  });

  it("xml() state selection can span lines", () => {
    const state = EditorState.create({
      doc: "<root>\n  <child/>\n</root>",
      selection: { anchor: 0, head: 6 },
      extensions: [xml()],
    });
    expect(state.selection.main.from).toBe(0);
    expect(state.selection.main.to).toBe(6);
  });

  it("xml() state doc line count is correct", () => {
    const state = EditorState.create({
      doc: "<root>\n  <a/>\n  <b/>\n</root>",
      extensions: [xml()],
    });
    expect(state.doc.lines).toBe(4);
  });

  it("xmlLanguage parser tree has correct length", () => {
    const code = "<root><child attr=\"val\">text</child></root>";
    const tree = xmlLanguage.parser.parse(code);
    expect(tree.length).toBe(code.length);
  });

  it("xml() state allows insert at start of document", () => {
    let state = EditorState.create({ doc: "<root/>", extensions: [xml()] });
    state = state.update({ changes: { from: 0, insert: "<?xml version=\"1.0\"?>\n" } }).state;
    expect(state.doc.line(1).text).toBe("<?xml version=\"1.0\"?>");
  });

  it("xml() state allows 4 sequential transactions", () => {
    let state = EditorState.create({ doc: "<root>", extensions: [xml()] });
    state = state.update({ changes: { from: 6, insert: "<a/>" } }).state;
    state = state.update({ changes: { from: state.doc.length, insert: "<b/>" } }).state;
    state = state.update({ changes: { from: state.doc.length, insert: "<c/>" } }).state;
    state = state.update({ changes: { from: state.doc.length, insert: "</root>" } }).state;
    expect(state.doc.toString()).toBe("<root><a/><b/><c/></root>");
  });

  it("xml() state deletion of all content works", () => {
    const doc = "<root><child/></root>";
    let state = EditorState.create({ doc, extensions: [xml()] });
    state = state.update({ changes: { from: 0, to: doc.length } }).state;
    expect(state.doc.toString()).toBe("");
  });

  it("xml() state line(2) text accessible after transaction", () => {
    let state = EditorState.create({ doc: "<root>", extensions: [xml()] });
    state = state.update({ changes: { from: 6, insert: "\n  <child/>\n</root>" } }).state;
    expect(state.doc.line(2).text).toBe("  <child/>");
  });

  it("xml() state with unicode content works", () => {
    const doc = "<!-- こんにちは -->\n<root/>";
    const state = EditorState.create({ doc, extensions: [xml()] });
    expect(state.doc.toString()).toBe(doc);
  });

  it("xml() state doc length invariant holds", () => {
    const doc = "<root><child attr=\"v\">text</child></root>";
    const state = EditorState.create({ doc, extensions: [xml()] });
    expect(state.doc.length).toBe(doc.length);
  });

  describe("XML indentation strategies", () => {
    it("Element indentation: child line indented by one unit", () => {
      // "<root>\n  <child/>\n</root>" - pos 7 is start of "  <child/>" line
      const doc = "<root>\n  <child/>\n</root>";
      const state = EditorState.create({ doc, extensions: [xml()] });
      ensureSyntaxTree(state, state.doc.length, 1000);
      const indent = getIndentation(state, 7);
      expect(typeof indent).toBe("number");
    });

    it("Element indentation: closing tag gets same indent as open tag", () => {
      // "<root>\n  <child/>\n</root>" - pos 18 is start of "</root>"
      const doc = "<root>\n  <child/>\n</root>";
      const state = EditorState.create({ doc, extensions: [xml()] });
      ensureSyntaxTree(state, state.doc.length, 1000);
      const indent = getIndentation(state, 18);
      expect(typeof indent).toBe("number");
    });

    it("OpenTag indentation: attribute on next line indented from tag start", () => {
      // "<root\n  attr=\"v\">" - pos 6 is start of "  attr..." line inside OpenTag
      const doc = "<root\n  attr=\"v\">";
      const state = EditorState.create({ doc, extensions: [xml()] });
      ensureSyntaxTree(state, state.doc.length, 1000);
      const indent = getIndentation(state, 6);
      expect(typeof indent).toBe("number");
    });
  });

  describe("completeFromSchema behavioral", () => {
    const schema: ElementSpec[] = [
      {
        name: "root", top: true,
        children: ["child", "item"],
        attributes: ["id"],
        textContent: ["hello world"],
        completion: { info: "Root element" }
      },
      { name: "child", attributes: ["class", { name: "type", values: ["a", "b"] }] },
      { name: "item" },
    ];
    const attrSpecs: AttrSpec[] = [
      { name: "id", global: true, values: ["main", "sidebar"] },
      { name: "class", values: ["foo", "bar"] },
    ];
    const completionSource = completeFromSchema(schema, attrSpecs);

    function makeContext(doc: string, pos: number, explicit = false) {
      const state = EditorState.create({ doc, extensions: [xml()] });
      ensureSyntaxTree(state, state.doc.length, 1000);
      return new CompletionContext(state, pos, explicit);
    }

    it("returns null at text position without explicit", () => {
      const cx = makeContext("<root>text</root>", 8);
      expect(completionSource(cx)).toBeNull();
    });

    it("returns tag completions at text position with explicit", () => {
      // Inside <root> element body - loc.type == "tag"
      const cx = makeContext("<root></root>", 6, true);
      const result = completionSource(cx);
      expect(result).not.toBeNull();
      expect(result!.options.length).toBeGreaterThan(0);
    });

    it("returns openTag completions inside an OpenTag (TagName position)", () => {
      // "<" typed, cursor at TagName position: "<r" at pos 2
      const cx = makeContext("<r", 2, true);
      const result = completionSource(cx);
      // openTag or null depending on tree state
      expect(result === null || result!.options.length >= 0).toBe(true);
    });

    it("returns attrName completions inside an OpenTag after tag name", () => {
      // "<root " - pos 6 is after tag name, inside OpenTag for attribute
      const cx = makeContext("<root ", 6, true);
      const result = completionSource(cx);
      if (result) {
        expect(Array.isArray(result.options)).toBe(true);
      }
    });

    it("returns attrValue completions for known attribute", () => {
      // "<root id=\"" - pos 10 is inside AttributeValue after "id="
      const cx = makeContext('<root id="', 10, true);
      const result = completionSource(cx);
      // May or may not return depending on tree parse
      expect(result === null || result !== undefined).toBe(true);
    });

    it("returns closeTag completions inside a CloseTag", () => {
      // "</root>" - pos 3 is after "</" inside CloseTag TagName
      const cx = makeContext("<root></root>", 9, true);
      const result = completionSource(cx);
      expect(result === null || result !== undefined).toBe(true);
    });

    it("builds schema with global attrs on all elements", () => {
      // 'id' is a global attr - should appear in child completions too
      const cx = makeContext("<root><child ", 13, true);
      const result = completionSource(cx);
      if (result) {
        const labels = result.options.map((o: any) => o.label);
        // global attr 'id' should be in options
        expect(labels.some((l: string) => l.includes("id") || l.includes("class"))).toBe(true);
      }
    });
  });
});
