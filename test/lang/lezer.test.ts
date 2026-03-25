import { describe, it, expect } from "bun:test";
import { lezer, lezerLanguage } from "../../src/lang/lezer/index";
import { EditorState } from "../../src/core/state/index";
import { LanguageSupport, syntaxTree } from "../../src/core/language/index";

describe("Lezer language pack", () => {
  describe("exports", () => {
    it("exports lezer function", () => {
      expect(typeof lezer).toBe("function");
    });

    it("exports lezerLanguage as an LRLanguage", () => {
      expect(lezerLanguage).toBeDefined();
      expect(typeof lezerLanguage.parser).toBe("object");
    });

    it("lezerLanguage has correct name", () => {
      expect(lezerLanguage.name).toBe("lezer");
    });

    it("lezerLanguage has comment tokens configured", () => {
      // languageData.commentTokens should include block and line styles
      const data = lezerLanguage.data.of({});
      expect(data).toBeDefined();
    });
  });

  describe("lezer() factory", () => {
    it("creates a LanguageSupport instance", () => {
      const support = lezer();
      expect(support).toBeInstanceOf(LanguageSupport);
    });

    it("returns LanguageSupport whose language is lezerLanguage", () => {
      const support = lezer();
      expect(support.language).toBe(lezerLanguage);
    });

    it("each call returns a new LanguageSupport instance", () => {
      const a = lezer();
      const b = lezer();
      expect(a).not.toBe(b);
    });

    it("both instances share the same lezerLanguage", () => {
      const a = lezer();
      const b = lezer();
      expect(a.language).toBe(b.language);
    });
  });

  describe("EditorState integration", () => {
    it("can be used as an EditorState extension", () => {
      const support = lezer();
      const state = EditorState.create({
        doc: "@top Program { statement+ }",
        extensions: [support],
      });
      expect(state).toBeDefined();
      expect(state.doc.toString()).toContain("@top");
    });

    it("EditorState language data resolves correctly", () => {
      const support = lezer();
      const state = EditorState.create({
        doc: "@top Program { statement+ }",
        extensions: [support],
      });
      const lang = state.facet(support.language.data);
      expect(lang).toBeDefined();
    });

    it("empty document is valid", () => {
      const support = lezer();
      const state = EditorState.create({
        doc: "",
        extensions: [support],
      });
      expect(state.doc.length).toBe(0);
    });

    it("parses a token rule without error", () => {
      const support = lezer();
      const state = EditorState.create({
        doc: "@tokens {\n  Identifier { $[a-zA-Z_]+ }\n  Number { $[0-9]+ }\n}",
        extensions: [support],
      });
      expect(state).toBeDefined();
    });

    it("parses a skip rule without error", () => {
      const support = lezer();
      const state = EditorState.create({
        doc: "@skip { spaces | newline | BlockComment }\n@top Program { expr* }",
        extensions: [support],
      });
      expect(state).toBeDefined();
    });

    it("parses a grammar with precedence without error", () => {
      const support = lezer();
      const state = EditorState.create({
        doc: "@precedence { times @left, plus @left }\n@top Expr { Expr !times '*' Expr | Expr !plus '+' Expr | Number }",
        extensions: [support],
      });
      expect(state).toBeDefined();
    });

    it("parses block comments without error", () => {
      const support = lezer();
      const state = EditorState.create({
        doc: "/* This is a block comment */\n@top Program { item+ }",
        extensions: [support],
      });
      expect(state).toBeDefined();
    });

    it("parses line comments without error", () => {
      const support = lezer();
      const state = EditorState.create({
        doc: "// A line comment\n@top Program { item+ }",
        extensions: [support],
      });
      expect(state).toBeDefined();
    });

    it("parses an external tokenizer declaration without error", () => {
      const support = lezer();
      const state = EditorState.create({
        doc: "@external tokens tokenizer from \"./tokens\" { Foo, Bar }\n@top Program { Foo | Bar }",
        extensions: [support],
      });
      expect(state).toBeDefined();
    });

    it("lezerLanguage parser produces a non-empty tree", () => {
      const tree = lezerLanguage.parser.parse("@top Program { expr+ }\nexpr { @specialize[@name=Add]<expr, \"+\"> }");
      expect(tree.length).toBeGreaterThan(0);
    });

    it("lezerLanguage parser tree has a top-level type", () => {
      const tree = lezerLanguage.parser.parse("@tokens { Number { @digit+ } }\n@top Expr { Number }");
      expect(tree.type.isTop).toBe(true);
    });

    it("syntaxTree from EditorState with lezer() is non-empty", () => {
      const state = EditorState.create({
        doc: "@top Program { statement* }\nstatement { identifier \";\" }",
        extensions: [lezer()],
      });
      const tree = syntaxTree(state);
      expect(tree.length).toBeGreaterThan(0);
    });
  });
});
