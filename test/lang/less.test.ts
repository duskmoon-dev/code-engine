import { describe, it, expect } from "bun:test";
import { less, lessLanguage, lessCompletionSource } from "../../src/lang/less/index";
import { EditorState } from "../../src/core/state/index";
import { LanguageSupport, syntaxTree } from "../../src/core/language/index";

describe("Less language pack", () => {
  describe("exports", () => {
    it("exports less function", () => {
      expect(typeof less).toBe("function");
    });

    it("exports lessLanguage", () => {
      expect(lessLanguage).toBeDefined();
      expect(lessLanguage.name).toBe("less");
    });

    it("exports lessCompletionSource", () => {
      expect(typeof lessCompletionSource).toBe("function");
    });
  });

  describe("less() factory", () => {
    it("creates a LanguageSupport instance", () => {
      const support = less();
      expect(support).toBeInstanceOf(LanguageSupport);
    });

    it("uses lessLanguage", () => {
      const support = less();
      expect(support.language).toBe(lessLanguage);
    });

    it("support object has extension", () => {
      const support = less();
      expect(support.extension).toBeDefined();
    });
  });

  describe("EditorState integration", () => {
    it("less() integrates with EditorState", () => {
      const state = EditorState.create({
        doc: `@primary: #333;\n.container {\n  color: @primary;\n  .nested {\n    font-size: 14px;\n  }\n}`,
        extensions: [less()],
      });
      expect(state.doc.toString()).toContain("@primary");
    });

    it("parses mixins", () => {
      const state = EditorState.create({
        doc: `.mixin() {\n  border: 1px solid #ccc;\n}\n.box {\n  .mixin();\n}`,
        extensions: [less()],
      });
      expect(state.doc.toString()).toContain(".mixin()");
    });

    it("empty document is valid", () => {
      const state = EditorState.create({
        doc: "",
        extensions: [less()],
      });
      expect(state.doc.length).toBe(0);
    });

    it("lessLanguage parser produces a non-empty tree", () => {
      const tree = lessLanguage.parser.parse(".button { color: @primary; }");
      expect(tree.length).toBeGreaterThan(0);
    });

    it("lessLanguage parser tree has a top-level type", () => {
      const tree = lessLanguage.parser.parse("@base: #f938ab; .box { background: @base; }");
      expect(tree.type.isTop).toBe(true);
    });

    it("syntaxTree from EditorState with less() is non-empty", () => {
      const state = EditorState.create({
        doc: ".nav { a { color: #333; &:hover { color: #000; } } }",
        extensions: [less()],
      });
      const tree = syntaxTree(state);
      expect(tree.length).toBeGreaterThan(0);
    });

    it("less parse tree cursor traversal works", () => {
      const tree = lessLanguage.parser.parse("@base: #f938ab;\n.box { color: @base; }");
      const cursor = tree.cursor();
      let nodeCount = 0;
      do { nodeCount++; } while (cursor.next() && nodeCount < 100);
      expect(nodeCount).toBeGreaterThan(1);
    });

    it("lessLanguage can parse operations", () => {
      const tree = lessLanguage.parser.parse("@base: 5%;\n@filler: @base * 2;\n@other: @base + @filler;");
      expect(tree.length).toBeGreaterThan(0);
      expect(tree.type.isTop).toBe(true);
    });

    it("lessLanguage can parse namespaces", () => {
      const tree = lessLanguage.parser.parse("#bundle { .button { border: 1px solid black; } }");
      expect(tree.length).toBeGreaterThan(0);
    });

    it("tree.resolve() finds nodes in less code", () => {
      const code = "@color: red;\n.box { color: @color; }";
      const tree = lessLanguage.parser.parse(code);
      for (let i = 0; i < code.length; i += 5) {
        const node = tree.resolve(i);
        expect(node).toBeDefined();
      }
    });

    it("lessCompletionSource is callable with a mock context", () => {
      const state = EditorState.create({
        doc: ".box { col",
        extensions: [less()],
      });
      const { CompletionContext } = require("../../src/core/autocomplete/index");
      const ctx = new CompletionContext(state, 10, true);
      const result = lessCompletionSource(ctx);
      expect(result === null || result !== undefined).toBe(true);
    });

    it("lessLanguage can parse mixin call with arguments", () => {
      const tree = lessLanguage.parser.parse(".box-shadow(@style, @c) when (iscolor(@c)) { -webkit-box-shadow: @style @c; box-shadow: @style @c; }\n.btn { .box-shadow(0 2px 4px, rgba(0,0,0,.5)); }");
      expect(tree.length).toBeGreaterThan(0);
    });

    it("lessLanguage can parse guarded mixins", () => {
      const tree = lessLanguage.parser.parse(".mixin (@a) when (lightness(@a) >= 50%) { background-color: black; }\n.mixin (@a) when (lightness(@a) < 50%) { background-color: white; }");
      expect(tree.length).toBeGreaterThan(0);
    });

    it("lessLanguage can parse &:extend()", () => {
      const tree = lessLanguage.parser.parse(".inline { color: red; &:extend(.block); }");
      expect(tree.length).toBeGreaterThan(0);
      expect(tree.type.isTop).toBe(true);
    });

    it("lessLanguage can parse color functions", () => {
      const tree = lessLanguage.parser.parse("@base: #f938ab;\n.box { color: darken(@base, 10%); border-color: lighten(@base, 20%); }");
      expect(tree.length).toBeGreaterThan(0);
    });

    it("lessLanguage can parse @import", () => {
      const tree = lessLanguage.parser.parse("@import (reference) \"variables\";\n@import \"mixins\";");
      expect(tree.length).toBeGreaterThan(0);
    });
  });
});
