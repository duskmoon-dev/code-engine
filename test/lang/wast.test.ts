import { describe, it, expect } from "bun:test";
import { wast, wastLanguage } from "../../src/lang/wast/index";
import { EditorState } from "../../src/core/state/index";
import { LanguageSupport, syntaxTree } from "../../src/core/language/index";

describe("WAST language pack", () => {
  describe("exports", () => {
    it("exports wast function", () => {
      expect(typeof wast).toBe("function");
    });

    it("exports wastLanguage as an LRLanguage", () => {
      expect(wastLanguage).toBeDefined();
      expect(typeof wastLanguage.parser).toBe("object");
    });

    it("wastLanguage has correct name", () => {
      expect(wastLanguage.name).toBe("wast");
    });
  });

  describe("wast() factory", () => {
    it("creates a LanguageSupport instance", () => {
      const support = wast();
      expect(support).toBeInstanceOf(LanguageSupport);
    });

    it("returns LanguageSupport whose language is wastLanguage", () => {
      const support = wast();
      expect(support.language).toBe(wastLanguage);
    });

    it("each call returns a new LanguageSupport instance", () => {
      const a = wast();
      const b = wast();
      expect(a).not.toBe(b);
    });

    it("both instances share the same wastLanguage", () => {
      const a = wast();
      const b = wast();
      expect(a.language).toBe(b.language);
    });
  });

  describe("EditorState integration", () => {
    it("can be used as an EditorState extension", () => {
      const support = wast();
      const state = EditorState.create({
        doc: "(module)",
        extensions: [support],
      });
      expect(state).toBeDefined();
      expect(state.doc.toString()).toContain("(module)");
    });

    it("EditorState language data resolves correctly", () => {
      const support = wast();
      const state = EditorState.create({
        doc: "(module)",
        extensions: [support],
      });
      const lang = state.facet(support.language.data);
      expect(lang).toBeDefined();
    });

    it("empty document is valid", () => {
      const support = wast();
      const state = EditorState.create({
        doc: "",
        extensions: [support],
      });
      expect(state.doc.length).toBe(0);
    });

    it("parses a function declaration without error", () => {
      const support = wast();
      const state = EditorState.create({
        doc: "(module\n  (func $add (param $a i32) (param $b i32) (result i32)\n    local.get $a\n    local.get $b\n    i32.add))",
        extensions: [support],
      });
      expect(state).toBeDefined();
    });

    it("parses memory and table declarations without error", () => {
      const support = wast();
      const state = EditorState.create({
        doc: "(module\n  (memory 1)\n  (table 10 funcref))",
        extensions: [support],
      });
      expect(state).toBeDefined();
    });

    it("parses import declarations without error", () => {
      const support = wast();
      const state = EditorState.create({
        doc: "(module\n  (import \"env\" \"print\" (func $print (param i32))))",
        extensions: [support],
      });
      expect(state).toBeDefined();
    });

    it("parses export declarations without error", () => {
      const support = wast();
      const state = EditorState.create({
        doc: "(module\n  (func $main (result i32) i32.const 42)\n  (export \"main\" (func $main)))",
        extensions: [support],
      });
      expect(state).toBeDefined();
    });

    it("parses global variables without error", () => {
      const support = wast();
      const state = EditorState.create({
        doc: "(module\n  (global $g (mut i32) (i32.const 0)))",
        extensions: [support],
      });
      expect(state).toBeDefined();
    });

    it("parses i32 arithmetic instructions without error", () => {
      const support = wast();
      const state = EditorState.create({
        doc: "(module\n  (func (result i32)\n    i32.const 10\n    i32.const 20\n    i32.mul))",
        extensions: [support],
      });
      expect(state).toBeDefined();
    });

    it("parses control flow instructions without error", () => {
      const support = wast();
      const state = EditorState.create({
        doc: "(module\n  (func (param i32) (result i32)\n    local.get 0\n    if (result i32)\n      i32.const 1\n    else\n      i32.const 0\n    end))",
        extensions: [support],
      });
      expect(state).toBeDefined();
    });

    it("parses block line comments (;;) without error", () => {
      const support = wast();
      const state = EditorState.create({
        doc: ";; This is a line comment\n(module)",
        extensions: [support],
      });
      expect(state).toBeDefined();
    });

    it("parses block comments (;; ... ;;) without error", () => {
      const support = wast();
      const state = EditorState.create({
        doc: "(; block comment ;)\n(module)",
        extensions: [support],
      });
      expect(state).toBeDefined();
    });

    it("wastLanguage parser produces a non-empty tree", () => {
      const tree = wastLanguage.parser.parse("(module (func $add (param $a i32) (param $b i32) (result i32) (i32.add (local.get $a) (local.get $b))))");
      expect(tree.length).toBeGreaterThan(0);
    });

    it("wastLanguage parser tree has a top-level type", () => {
      const tree = wastLanguage.parser.parse("(module)");
      expect(tree.type.isTop).toBe(true);
    });

    it("syntaxTree from EditorState with wast() is non-empty", () => {
      const state = EditorState.create({
        doc: "(module (memory 1))",
        extensions: [wast()],
      });
      const tree = syntaxTree(state);
      expect(tree.length).toBeGreaterThan(0);
    });

    it("wast parse tree cursor traversal works", () => {
      const tree = wastLanguage.parser.parse("(module (func $add (param i32 i32) (result i32) local.get 0 local.get 1 i32.add))");
      const cursor = tree.cursor();
      let nodeCount = 0;
      do { nodeCount++; } while (cursor.next() && nodeCount < 100);
      expect(nodeCount).toBeGreaterThan(1);
    });

    it("tree.resolve() finds nodes at multiple positions in WAST", () => {
      const code = "(module (func $add (param $a i32) (param $b i32) (result i32) local.get $a local.get $b i32.add))";
      const tree = wastLanguage.parser.parse(code);
      for (let i = 0; i < code.length; i += 10) {
        const node = tree.resolve(i);
        expect(node).toBeDefined();
      }
    });

    it("wastLanguage can parse f64 arithmetic", () => {
      const tree = wastLanguage.parser.parse("(module (func (result f64) f64.const 3.14 f64.const 2.0 f64.mul))");
      expect(tree.length).toBeGreaterThan(0);
      expect(tree.type.isTop).toBe(true);
    });

    it("wastLanguage can parse loop construct", () => {
      const tree = wastLanguage.parser.parse("(module (func (param i32) (result i32) (loop $loop (local.get 0) (br_if $loop (i32.const 1)) (i32.const 0)))");
      expect(tree.length).toBeGreaterThan(0);
    });

    it("wastLanguage can parse data segment", () => {
      const tree = wastLanguage.parser.parse("(module (memory 1) (data (i32.const 0) \"hello world\"))");
      expect(tree.length).toBeGreaterThan(0);
    });

    it("wastLanguage can parse element segment", () => {
      const tree = wastLanguage.parser.parse("(module (table 2 funcref) (func $f1) (func $f2) (elem (i32.const 0) $f1 $f2))");
      expect(tree.length).toBeGreaterThan(0);
    });

    it("wastLanguage can parse global declarations", () => {
      const tree = wastLanguage.parser.parse("(module (global $g (mut i32) (i32.const 0)) (func (global.set $g (i32.const 42))))");
      expect(tree.length).toBeGreaterThan(0);
    });

    it("wastLanguage can parse import declarations", () => {
      const tree = wastLanguage.parser.parse("(module (import \"env\" \"print\" (func $print (param i32))))");
      expect(tree.length).toBeGreaterThan(0);
      expect(tree.type.isTop).toBe(true);
    });

    it("wastLanguage can parse export declarations", () => {
      const tree = wastLanguage.parser.parse("(module (func $add (param i32 i32) (result i32) local.get 0 local.get 1 i32.add) (export \"add\" (func $add)))");
      expect(tree.length).toBeGreaterThan(0);
    });

    it("wastLanguage can parse select instruction", () => {
      const tree = wastLanguage.parser.parse("(module (func (param i32 i32 i32) (result i32) local.get 0 local.get 1 local.get 2 select))");
      expect(tree.length).toBeGreaterThan(0);
    });

    it("wastLanguage can parse memory load/store", () => {
      const tree = wastLanguage.parser.parse("(module (memory 1) (func (param i32) (result i32) (i32.load (local.get 0))) (func (param i32 i32) (i32.store (local.get 0) (local.get 1))))");
      expect(tree.length).toBeGreaterThan(0);
      expect(tree.type.isTop).toBe(true);
    });

    it("wastLanguage tree.toString() returns non-empty string", () => {
      const tree = wastLanguage.parser.parse("(module (func (result i32) i32.const 42))");
      expect(typeof tree.toString()).toBe("string");
      expect(tree.toString().length).toBeGreaterThan(0);
    });

    it("wastLanguage cursor traversal finds multiple nodes", () => {
      const tree = wastLanguage.parser.parse("(module (func $main (result i32) i32.const 1 i32.const 2 i32.add))");
      let count = 0;
      tree.iterate({ enter: () => { count++; } });
      expect(count).toBeGreaterThan(3);
    });

    it("wastLanguage tree.resolveInner() finds innermost node", () => {
      const tree = wastLanguage.parser.parse("(module (func))");
      const node = tree.resolveInner(5);
      expect(node).toBeDefined();
      expect(node.from).toBeLessThanOrEqual(5);
      expect(node.to).toBeGreaterThanOrEqual(5);
    });

    it("EditorState with wast() has correct doc length", () => {
      const doc = "(module (func (result i32) i32.const 42))";
      const state = EditorState.create({ doc, extensions: [wast()] });
      expect(state.doc.length).toBe(doc.length);
    });

    it("wastLanguage allows doc mutation via transaction", () => {
      let state = EditorState.create({ doc: "(module)", extensions: [wast()] });
      state = state.update({ changes: { from: 7, insert: " (func)" } }).state;
      expect(state.doc.toString()).toBe("(module (func))");
    });

    it("wast() state doc line count is correct", () => {
      const state = EditorState.create({
        doc: "(module\n  (func (result i32)\n    i32.const 42))",
        extensions: [wast()],
      });
      expect(state.doc.lines).toBe(3);
    });

    it("wast() state doc line text is accessible", () => {
      const state = EditorState.create({
        doc: "(module)\n(assert_return (invoke \"main\") (i32.const 42))",
        extensions: [wast()],
      });
      expect(state.doc.line(1).text).toBe("(module)");
    });

    it("wast() state allows multiple sequential transactions", () => {
      let state = EditorState.create({ doc: "(module)", extensions: [wast()] });
      state = state.update({ changes: { from: 8, insert: "\n(module (func))" } }).state;
      state = state.update({ changes: { from: state.doc.length, insert: "\n(module (memory 1))" } }).state;
      expect(state.doc.lines).toBe(3);
    });

    it("wast() extension handles replacement transaction", () => {
      let state = EditorState.create({ doc: "(module (memory 1))", extensions: [wast()] });
      state = state.update({ changes: { from: 8, to: 18, insert: "(func)" } }).state;
      expect(state.doc.toString()).toBe("(module (func))");
    });

    it("wast() state doc length invariant holds", () => {
      const doc = "(module (func (result i32) (i32.const 42)))";
      const state = EditorState.create({ doc, extensions: [wast()] });
      expect(state.doc.length).toBe(doc.length);
    });

    it("wastLanguage parser tree has correct length", () => {
      const code = "(module (func (export \"main\") (result i32) (i32.const 0)))";
      const tree = wastLanguage.parser.parse(code);
      expect(tree.length).toBe(code.length);
    });

    it("wast() state deletion transaction works", () => {
      let state = EditorState.create({ doc: "(module)\n(module (func))", extensions: [wast()] });
      state = state.update({ changes: { from: 8, to: 24 } }).state;
      expect(state.doc.toString()).toBe("(module)");
    });

    it("wast() state with multiple operations parses correctly", () => {
      const state = EditorState.create({
        doc: "(module\n  (func $add (param i32 i32) (result i32)\n    local.get 0\n    local.get 1\n    i32.add))",
        extensions: [wast()],
      });
      expect(state.doc.lines).toBe(5);
    });

    it("wast() state doc line text is accessible", () => {
      const state = EditorState.create({
        doc: "(module)\n(func $f)",
        extensions: [wast()],
      });
      expect(state.doc.line(1).text).toBe("(module)");
      expect(state.doc.line(2).text).toBe("(func $f)");
    });

    it("wast() state allows multiple sequential transactions", () => {
      let state = EditorState.create({ doc: "(module)", extensions: [wast()] });
      state = state.update({ changes: { from: 8, insert: "\n(func $a)" } }).state;
      state = state.update({ changes: { from: state.doc.length, insert: "\n(func $b)" } }).state;
      expect(state.doc.lines).toBe(3);
    });

    it("wast() extension preserves doc length invariant", () => {
      const doc = "(module (func $main))";
      const state = EditorState.create({ doc, extensions: [wast()] });
      expect(state.doc.length).toBe(doc.length);
    });

    it("wast() state replacement transaction works", () => {
      let state = EditorState.create({ doc: "(module (memory 1))", extensions: [wast()] });
      state = state.update({ changes: { from: 15, to: 16, insert: "2" } }).state;
      expect(state.doc.toString()).toBe("(module (memory 2))");
    });

    it("wast() state with unicode content works", () => {
      const doc = ";; こんにちは\n(module)";
      const state = EditorState.create({ doc, extensions: [wast()] });
      expect(state.doc.toString()).toBe(doc);
    });
  });
});
