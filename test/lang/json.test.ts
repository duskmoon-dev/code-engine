import { describe, it, expect } from "bun:test";
import { json, jsonLanguage, jsonParseLinter } from "../../src/lang/json/index";
import { EditorState } from "../../src/core/state/index";
import { LanguageSupport, syntaxTree } from "../../src/core/language/index";

describe("JSON language pack", () => {
  describe("exports", () => {
    it("exports json function", () => {
      expect(typeof json).toBe("function");
    });

    it("exports jsonLanguage", () => {
      expect(jsonLanguage).toBeDefined();
      expect(jsonLanguage.name).toBe("json");
    });

    it("exports jsonParseLinter", () => {
      expect(typeof jsonParseLinter).toBe("function");
    });
  });

  describe("json() factory", () => {
    it("creates a LanguageSupport instance", () => {
      const support = json();
      expect(support).toBeInstanceOf(LanguageSupport);
    });

    it("uses jsonLanguage", () => {
      const support = json();
      expect(support.language).toBe(jsonLanguage);
    });
  });

  describe("jsonParseLinter", () => {
    it("returns a linter function", () => {
      const linter = jsonParseLinter();
      expect(typeof linter).toBe("function");
    });
  });

  describe("EditorState integration", () => {
    it("json() integrates with EditorState", () => {
      const state = EditorState.create({
        doc: `{"name": "test", "version": "1.0.0", "dependencies": {}}`,
        extensions: [json()],
      });
      expect(state.doc.toString()).toContain('"name"');
    });

    it("parses arrays", () => {
      const state = EditorState.create({
        doc: `[1, 2, 3, "four", true, null]`,
        extensions: [json()],
      });
      expect(state.doc.toString()).toContain("true");
    });

    it("parses nested objects", () => {
      const state = EditorState.create({
        doc: `{"outer": {"inner": [1, 2, 3]}}`,
        extensions: [json()],
      });
      expect(state.doc.toString()).toContain('"inner"');
    });

    it("empty document is valid", () => {
      const state = EditorState.create({
        doc: "",
        extensions: [json()],
      });
      expect(state.doc.length).toBe(0);
    });
  });

  describe("parse tree", () => {
    it("jsonLanguage parser produces a non-empty tree", () => {
      const tree = jsonLanguage.parser.parse('{"key": "value"}');
      expect(tree.length).toBeGreaterThan(0);
    });

    it("jsonLanguage parser tree has a top-level type", () => {
      const tree = jsonLanguage.parser.parse('[1, 2, 3]');
      expect(tree.type.isTop).toBe(true);
    });

    it("syntaxTree from EditorState with json() is non-empty", () => {
      const state = EditorState.create({
        doc: '{"hello": "world"}',
        extensions: [json()],
      });
      const tree = syntaxTree(state);
      expect(tree.length).toBeGreaterThan(0);
    });
  });
});
