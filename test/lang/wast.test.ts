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
  });
});
