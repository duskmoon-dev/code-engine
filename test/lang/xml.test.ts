import { describe, it, expect } from "bun:test";
import {
  xml, xmlLanguage, completeFromSchema, autoCloseTags,
  type ElementSpec, type AttrSpec
} from "../../src/lang/xml/index";
import { EditorState } from "../../src/core/state/index";
import { syntaxTree } from "../../src/core/language/index";

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
});
