import { describe, it, expect } from "bun:test";
import {
  css, cssLanguage,
  cssCompletionSource, defineCSSCompletionSource
} from "../../src/lang/css/index";
import { EditorState } from "../../src/core/state/index";
import { syntaxTree } from "../../src/core/language/index";

describe("CSS language pack", () => {
  it("exports css function", () => {
    expect(typeof css).toBe("function");
  });

  it("exports cssLanguage", () => {
    expect(cssLanguage).toBeDefined();
    expect(cssLanguage.name).toBe("css");
  });

  it("exports cssCompletionSource", () => {
    expect(typeof cssCompletionSource).toBe("function");
  });

  it("exports defineCSSCompletionSource", () => {
    expect(typeof defineCSSCompletionSource).toBe("function");
  });

  it("creates language support", () => {
    const support = css();
    expect(support).toBeDefined();
    expect(support.language).toBe(cssLanguage);
  });

  it("defineCSSCompletionSource returns a CompletionSource", () => {
    const source = defineCSSCompletionSource(() => false);
    expect(typeof source).toBe("function");
  });

  it("defineCSSCompletionSource with variable checker", () => {
    const source = defineCSSCompletionSource(node => node.name === "VariableName");
    expect(typeof source).toBe("function");
  });

  it("css() returns LanguageSupport with cssLanguage", () => {
    const lang = css();
    expect(lang.language).toBe(cssLanguage);
    expect(lang.language.name).toBe("css");
  });

  it("cssLanguage parser produces a non-empty tree", () => {
    const tree = cssLanguage.parser.parse("body { color: red; }");
    expect(tree.length).toBeGreaterThan(0);
  });

  it("cssLanguage parser tree has a top-level type", () => {
    const tree = cssLanguage.parser.parse(".foo { display: flex; }");
    expect(tree.type.isTop).toBe(true);
  });

  it("syntaxTree from EditorState with css() is non-empty", () => {
    const state = EditorState.create({
      doc: "h1 { font-size: 2em; margin: 0; }",
      extensions: [css()],
    });
    const tree = syntaxTree(state);
    expect(tree.length).toBeGreaterThan(0);
  });

  it("css parse tree cursor traversal works", () => {
    const tree = cssLanguage.parser.parse(".container { display: flex; flex-direction: column; }");
    const cursor = tree.cursor();
    let nodeCount = 0;
    do { nodeCount++; } while (cursor.next() && nodeCount < 100);
    expect(nodeCount).toBeGreaterThan(1);
  });

  it("css parse tree resolves node at position", () => {
    const code = "body { color: #333; }";
    const tree = cssLanguage.parser.parse(code);
    const node = tree.resolve(5);
    expect(node).toBeDefined();
    expect(node.type).toBeDefined();
  });

  it("cssCompletionSource is a function", () => {
    expect(typeof cssCompletionSource).toBe("function");
  });

  it("defineCSSCompletionSource returns a function", () => {
    const source = defineCSSCompletionSource(() => null);
    expect(typeof source).toBe("function");
  });

  it("cssLanguage can parse media queries", () => {
    const tree = cssLanguage.parser.parse("@media (max-width: 768px) { .box { display: none; } }");
    expect(tree.length).toBeGreaterThan(0);
    expect(tree.type.isTop).toBe(true);
  });

  it("cssLanguage can parse keyframes", () => {
    const tree = cssLanguage.parser.parse("@keyframes slide-in { from { transform: translateX(-100%); } to { transform: translateX(0); } }");
    expect(tree.length).toBeGreaterThan(0);
  });

  it("cssLanguage can parse CSS custom properties", () => {
    const tree = cssLanguage.parser.parse(":root { --primary: #333; --accent: blue; } .btn { color: var(--primary); }");
    expect(tree.length).toBeGreaterThan(0);
    expect(tree.type.isTop).toBe(true);
  });

  it("cssLanguage can parse pseudo-selectors", () => {
    const tree = cssLanguage.parser.parse("a:hover { color: red; } li:first-child { font-weight: bold; }");
    expect(tree.length).toBeGreaterThan(0);
  });

  it("cssLanguage can parse attribute selectors", () => {
    const tree = cssLanguage.parser.parse("input[type='text'] { border: 1px solid; }");
    expect(tree.length).toBeGreaterThan(0);
  });

  it("tree.resolve() finds nodes in CSS at multiple positions", () => {
    const code = ".container { margin: 0 auto; padding: 20px; }";
    const tree = cssLanguage.parser.parse(code);
    for (let i = 0; i < code.length; i += 6) {
      const node = tree.resolve(i);
      expect(node).toBeDefined();
    }
  });

  it("cssLanguage can parse grid layout", () => {
    const tree = cssLanguage.parser.parse(".grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; }");
    expect(tree.length).toBeGreaterThan(0);
    expect(tree.type.isTop).toBe(true);
  });

  it("cssLanguage can parse flexbox", () => {
    const tree = cssLanguage.parser.parse(".flex { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; }");
    expect(tree.length).toBeGreaterThan(0);
  });

  it("cssLanguage can parse calc() function", () => {
    const tree = cssLanguage.parser.parse(".full { width: calc(100% - 2rem); height: calc(100vh - 60px); }");
    expect(tree.length).toBeGreaterThan(0);
  });

  it("cssLanguage can parse @supports rule", () => {
    const tree = cssLanguage.parser.parse("@supports (display: grid) { .layout { display: grid; } }");
    expect(tree.length).toBeGreaterThan(0);
    expect(tree.type.isTop).toBe(true);
  });

  it("cssLanguage can parse pseudo-elements", () => {
    const tree = cssLanguage.parser.parse("p::before { content: '> '; } a::after { content: ' ↗'; }");
    expect(tree.length).toBeGreaterThan(0);
  });

  it("cssLanguage can parse CSS transitions", () => {
    const tree = cssLanguage.parser.parse(".btn { transition: all 0.3s ease-in-out; transform: scale(1); } .btn:hover { transform: scale(1.05); }");
    expect(tree.length).toBeGreaterThan(0);
  });

  it("cssLanguage can parse CSS animations", () => {
    const tree = cssLanguage.parser.parse(".spinner { animation: spin 1s linear infinite; } @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }");
    expect(tree.length).toBeGreaterThan(0);
    expect(tree.type.isTop).toBe(true);
  });

  it("cssLanguage can parse @import", () => {
    const tree = cssLanguage.parser.parse("@import url('normalize.css');\n@import 'variables.css';");
    expect(tree.length).toBeGreaterThan(0);
    expect(tree.type.isTop).toBe(true);
  });

  it("cssLanguage can parse adjacent sibling selector", () => {
    const tree = cssLanguage.parser.parse("h1 + p { margin-top: 0; } h2 ~ p { color: gray; }");
    expect(tree.length).toBeGreaterThan(0);
  });

  it("cssLanguage can parse :not() and :is() pseudo-class", () => {
    const tree = cssLanguage.parser.parse("a:not(.active) { opacity: 0.7; } :is(h1, h2, h3) { font-weight: bold; }");
    expect(tree.length).toBeGreaterThan(0);
    expect(tree.type.isTop).toBe(true);
  });

  it("cssLanguage can parse clip-path and transform", () => {
    const tree = cssLanguage.parser.parse(".hero { clip-path: polygon(0 0, 100% 0, 100% 80%, 0 100%); transform: perspective(500px) rotateY(10deg); }");
    expect(tree.length).toBeGreaterThan(0);
  });

  it("tree.resolveInner() finds innermost node in CSS", () => {
    const tree = cssLanguage.parser.parse("body { color: red; }");
    const node = tree.resolveInner(7);
    expect(node).toBeDefined();
    expect(node.from).toBeLessThanOrEqual(7);
    expect(node.to).toBeGreaterThanOrEqual(7);
  });

  it("cssLanguage tree.toString() returns non-empty string", () => {
    const tree = cssLanguage.parser.parse("p { font-size: 16px; }");
    expect(typeof tree.toString()).toBe("string");
    expect(tree.toString().length).toBeGreaterThan(0);
  });

  it("cssLanguage can parse CSS logical properties", () => {
    const tree = cssLanguage.parser.parse(".box { margin-inline: 1rem; padding-block: 0.5rem; border-inline-start: 2px solid; }");
    expect(tree.length).toBeGreaterThan(0);
    expect(tree.type.isTop).toBe(true);
  });

  it("cssLanguage cursor traversal finds multiple nodes", () => {
    const tree = cssLanguage.parser.parse("body { color: red; } h1 { font-size: 2em; }");
    let count = 0;
    tree.iterate({ enter: () => { count++; } });
    expect(count).toBeGreaterThan(5);
  });

  it("cssLanguage can parse CSS custom property (variable)", () => {
    const tree = cssLanguage.parser.parse(":root { --primary-color: #3498db; --font-size: 16px; }\n.btn { color: var(--primary-color); font-size: var(--font-size); }");
    expect(tree.length).toBeGreaterThan(0);
  });

  it("cssLanguage can parse grid layout", () => {
    const tree = cssLanguage.parser.parse(".grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; grid-template-areas: 'header header header' 'sidebar main main'; }");
    expect(tree.length).toBeGreaterThan(0);
    expect(tree.type.isTop).toBe(true);
  });

  it("EditorState with css() has correct doc line count", () => {
    const state = EditorState.create({
      doc: "body { margin: 0; }\n.app { display: flex; }\n.header { background: blue; }",
      extensions: [css()],
    });
    expect(state.doc.lines).toBe(3);
  });

  it("cssLanguage allows doc mutation via transaction", () => {
    let state = EditorState.create({ doc: "p { color: red; }", extensions: [css()] });
    state = state.update({ changes: { from: 17, insert: "\nh1 { color: blue; }" } }).state;
    expect(state.doc.lines).toBe(2);
  });

  it("css() state doc line text is accessible", () => {
    const state = EditorState.create({
      doc: "body { margin: 0; }\n.container { display: flex; }",
      extensions: [css()],
    });
    expect(state.doc.line(1).text).toBe("body { margin: 0; }");
  });

  it("css() state allows multiple sequential transactions", () => {
    let state = EditorState.create({ doc: "p { color: red; }", extensions: [css()] });
    state = state.update({ changes: { from: 17, insert: "\nh1 { font-size: 2em; }" } }).state;
    state = state.update({ changes: { from: state.doc.length, insert: "\n.btn { cursor: pointer; }" } }).state;
    expect(state.doc.lines).toBe(3);
  });

  it("css() state allows replacement transaction", () => {
    let state = EditorState.create({ doc: "p { color: red; }", extensions: [css()] });
    state = state.update({ changes: { from: 12, to: 15, insert: "blue" } }).state;
    expect(state.doc.toString()).toContain("blue");
  });

  it("css() doc length invariant holds", () => {
    const doc = ".box { width: 100px; }";
    const state = EditorState.create({ doc, extensions: [css()] });
    expect(state.doc.length).toBe(doc.length);
  });

  it("css() state deletion transaction works", () => {
    let state = EditorState.create({ doc: "p { color: red; }\nh1 { color: blue; }", extensions: [css()] });
    state = state.update({ changes: { from: 17, to: 37 } }).state;
    expect(state.doc.toString()).toBe("p { color: red; }");
  });

  it("css() state with unicode content works", () => {
    const doc = "/* こんにちは */\n.box { color: red; }";
    const state = EditorState.create({ doc, extensions: [css()] });
    expect(state.doc.toString()).toBe(doc);
  });

  it("css() state selection can span lines", () => {
    const state = EditorState.create({
      doc: "p {\n  color: red;\n}",
      selection: { anchor: 0, head: 3 },
      extensions: [css()],
    });
    expect(state.selection.main.from).toBe(0);
    expect(state.selection.main.to).toBe(3);
  });

  it("css() state doc line count is correct", () => {
    const state = EditorState.create({
      doc: "p { color: red; }\nh1 { font-size: 2em; }\n.box { margin: 0; }",
      extensions: [css()],
    });
    expect(state.doc.lines).toBe(3);
  });
});
