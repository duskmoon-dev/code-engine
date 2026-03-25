import { describe, it, expect } from "bun:test";
import { less, lessLanguage, lessCompletionSource } from "../../src/lang/less/index";
import { EditorState } from "../../src/core/state/index";
import { LanguageSupport } from "../../src/core/language/index";

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
  });
});
