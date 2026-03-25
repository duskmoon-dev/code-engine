import { describe, it, expect } from "bun:test";
import { sass, sassLanguage, sassCompletionSource } from "../../src/lang/sass/index";
import { EditorState } from "../../src/core/state/index";
import { LanguageSupport, syntaxTree } from "../../src/core/language/index";

describe("Sass language pack", () => {
  describe("exports", () => {
    it("exports sass function", () => {
      expect(typeof sass).toBe("function");
    });

    it("exports sassLanguage", () => {
      expect(sassLanguage).toBeDefined();
      expect(sassLanguage.name).toBe("sass");
    });

    it("exports sassCompletionSource", () => {
      expect(typeof sassCompletionSource).toBe("function");
    });
  });

  describe("sass() factory", () => {
    it("creates LanguageSupport with default options (SCSS)", () => {
      const support = sass();
      expect(support).toBeInstanceOf(LanguageSupport);
    });

    it("default mode uses sassLanguage", () => {
      const support = sass();
      expect(support.language).toBe(sassLanguage);
    });

    it("creates LanguageSupport with indented mode", () => {
      const support = sass({ indented: true });
      expect(support).toBeInstanceOf(LanguageSupport);
    });

    it("indented mode language is defined", () => {
      const support = sass({ indented: true });
      expect(support.language).toBeDefined();
    });

    it("explicit indented:false returns SCSS mode", () => {
      const support = sass({ indented: false });
      expect(support.language).toBe(sassLanguage);
    });
  });

  describe("EditorState integration", () => {
    it("scss integrates with EditorState", () => {
      const state = EditorState.create({
        doc: `.container {\n  color: red;\n  $primary: #333;\n}`,
        extensions: [sass()],
      });
      expect(state.doc.toString()).toContain("$primary");
    });

    it("indented sass integrates with EditorState", () => {
      const state = EditorState.create({
        doc: `.container\n  color: red\n  $primary: #333`,
        extensions: [sass({ indented: true })],
      });
      expect(state.doc.toString()).toContain("$primary");
    });

    it("empty document is valid", () => {
      const state = EditorState.create({
        doc: "",
        extensions: [sass()],
      });
      expect(state.doc.length).toBe(0);
    });

    it("sassLanguage parser produces a non-empty tree", () => {
      const tree = sassLanguage.parser.parse("$color: red;\n.box { background: $color; }");
      expect(tree.length).toBeGreaterThan(0);
    });

    it("sassLanguage parser tree has a top-level type", () => {
      const tree = sassLanguage.parser.parse(".nav { a { color: #333; } }");
      expect(tree.type.isTop).toBe(true);
    });

    it("syntaxTree from EditorState with sass() is non-empty", () => {
      const state = EditorState.create({
        doc: "@mixin flex { display: flex; }\n.box { @include flex; }",
        extensions: [sass()],
      });
      const tree = syntaxTree(state);
      expect(tree.length).toBeGreaterThan(0);
    });
  });
});
