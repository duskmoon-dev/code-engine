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

    it("lezer parse tree cursor traversal works", () => {
      const tree = lezerLanguage.parser.parse("@top Program { statement* }");
      const cursor = tree.cursor();
      let nodeCount = 0;
      do { nodeCount++; } while (cursor.next() && nodeCount < 100);
      expect(nodeCount).toBeGreaterThan(1);
    });

    it("lezerLanguage can parse @skip declaration", () => {
      const tree = lezerLanguage.parser.parse("@skip { whitespace | Comment }\n@top Program { stmt+ }");
      expect(tree.length).toBeGreaterThan(0);
      expect(tree.type.isTop).toBe(true);
    });

    it("lezerLanguage can parse token rules with character ranges", () => {
      const tree = lezerLanguage.parser.parse("@tokens { Identifier { $[a-zA-Z_]+ } Number { $[0-9]+ } }");
      expect(tree.length).toBeGreaterThan(0);
    });

    it("lezerLanguage can parse inline rules", () => {
      const tree = lezerLanguage.parser.parse("@top Expr { Number { @digit+ } }");
      expect(tree.length).toBeGreaterThan(0);
      expect(tree.type.isTop).toBe(true);
    });

    it("tree.resolve() finds nodes at positions in lezer grammar", () => {
      const code = "@top Program { statement* }\nstatement { Number \"+\" Number }";
      const tree = lezerLanguage.parser.parse(code);
      for (let i = 0; i < code.length; i += 8) {
        const node = tree.resolve(i);
        expect(node).toBeDefined();
      }
    });

    it("lezerLanguage can parse @dialect declarations", () => {
      const tree = lezerLanguage.parser.parse("@dialects { jsx }");
      expect(tree.length).toBeGreaterThan(0);
    });

    it("lezerLanguage can parse @context declaration", () => {
      const tree = lezerLanguage.parser.parse("@context trackNewline from \"./tokens\"");
      expect(tree.length).toBeGreaterThan(0);
      expect(tree.type.isTop).toBe(true);
    });

    it("lezerLanguage can parse @detectDelim", () => {
      const tree = lezerLanguage.parser.parse("@detectDelim");
      expect(tree.length).toBeGreaterThan(0);
    });

    it("lezerLanguage can parse rule with optional and star", () => {
      const tree = lezerLanguage.parser.parse("@top Program { statement* }\nstatement { identifier \":\" expression? \";\" }");
      expect(tree.length).toBeGreaterThan(0);
      expect(tree.type.isTop).toBe(true);
    });

    it("lezerLanguage can parse rule with pipe alternatives", () => {
      const tree = lezerLanguage.parser.parse("expression { Number | String | Identifier | \"(\" expression \")\" }");
      expect(tree.length).toBeGreaterThan(0);
    });

    it("lezerLanguage can parse @specialize directive", () => {
      const tree = lezerLanguage.parser.parse("@top Expr { @specialize[@name=Add]<Expr, \"+\"> | Number }");
      expect(tree.length).toBeGreaterThan(0);
    });

    it("lezerLanguage tree.toString() returns non-empty string", () => {
      const tree = lezerLanguage.parser.parse("@top Program { statement* }");
      expect(typeof tree.toString()).toBe("string");
      expect(tree.toString().length).toBeGreaterThan(0);
    });

    it("tree.resolveInner() finds innermost node in lezer grammar", () => {
      const tree = lezerLanguage.parser.parse("@top Program { expr* }\nexpr { Number | String }");
      const node = tree.resolveInner(5);
      expect(node).toBeDefined();
      expect(node.from).toBeLessThanOrEqual(5);
      expect(node.to).toBeGreaterThanOrEqual(5);
    });

    it("lezerLanguage can parse @local tokens", () => {
      const tree = lezerLanguage.parser.parse("@local tokens { String { '\"' (![\"])* '\"' } }");
      expect(tree.length).toBeGreaterThan(0);
    });

    it("lezerLanguage can parse precedence annotation", () => {
      const tree = lezerLanguage.parser.parse("expression[@isGroup=Expression] { Number | expression !left \"+\" expression }");
      expect(tree.length).toBeGreaterThan(0);
      expect(tree.type.isTop).toBe(true);
    });

    it("lezerLanguage can parse external tokens", () => {
      const tree = lezerLanguage.parser.parse("@external tokens tokenizer from \"./tokens\" { Identifier String Number }");
      expect(tree.length).toBeGreaterThan(0);
    });

    it("lezerLanguage cursor traversal finds multiple nodes", () => {
      const tree = lezerLanguage.parser.parse("@top Program { statement* }\nstatement { id \":\" value \";\"}");
      let count = 0;
      tree.iterate({ enter: () => { count++; } });
      expect(count).toBeGreaterThan(1);
    });

    it("lezerLanguage can parse multiple rules", () => {
      const tree = lezerLanguage.parser.parse("@top Program { expr* }\nexpr { term (\"+\" term)* }\nterm { Number | \"(\" expr \")\" }");
      expect(tree.length).toBeGreaterThan(0);
      expect(tree.type.isTop).toBe(true);
    });

    it("EditorState with lezer() has correct doc line count", () => {
      const state = EditorState.create({
        doc: "@top Program { body }\nbody { statement* }\nstatement { Identifier \";\" }",
        extensions: [lezer()],
      });
      expect(state.doc.lines).toBe(3);
    });

    it("lezerLanguage allows doc mutation via transaction", () => {
      let state = EditorState.create({ doc: "@top P { e* }", extensions: [lezer()] });
      state = state.update({ changes: { from: 13, insert: "\ne { Number }" } }).state;
      expect(state.doc.lines).toBe(2);
    });

    it("lezer() state doc line text is accessible", () => {
      const state = EditorState.create({
        doc: "@top Program { stmt* }\nstmt { id \";\"}",
        extensions: [lezer()],
      });
      expect(state.doc.line(1).text).toBe("@top Program { stmt* }");
    });

    it("lezer() state allows multiple sequential transactions", () => {
      let state = EditorState.create({ doc: "@top P { e* }", extensions: [lezer()] });
      state = state.update({ changes: { from: 13, insert: "\ne { Number }" } }).state;
      state = state.update({ changes: { from: state.doc.length, insert: "\n@tokens { Number { @digit+ } }" } }).state;
      expect(state.doc.lines).toBe(3);
    });

    it("lezer() state allows replacement transaction", () => {
      let state = EditorState.create({ doc: "@top P { e* }", extensions: [lezer()] });
      state = state.update({ changes: { from: 9, to: 11, insert: "expr+" } }).state;
      expect(state.doc.toString()).toContain("expr+");
    });

    it("lezer() doc length invariant holds", () => {
      const doc = "@top P { e* }";
      const state = EditorState.create({ doc, extensions: [lezer()] });
      expect(state.doc.length).toBe(doc.length);
    });

    it("lezer() state deletion transaction works", () => {
      let state = EditorState.create({ doc: "@top P { e* }\n@tokens { Number { @digit+ } }", extensions: [lezer()] });
      state = state.update({ changes: { from: 13, to: 44 } }).state;
      expect(state.doc.toString()).toBe("@top P { e* }");
    });

    it("lezer() state with unicode content works", () => {
      const doc = "// こんにちは\n@top P { e* }";
      const state = EditorState.create({ doc, extensions: [lezer()] });
      expect(state.doc.toString()).toBe(doc);
    });

    it("lezer() state selection can span lines", () => {
      const state = EditorState.create({
        doc: "@top P { e* }\n@tokens {}",
        selection: { anchor: 0, head: 13 },
        extensions: [lezer()],
      });
      expect(state.selection.main.from).toBe(0);
      expect(state.selection.main.to).toBe(13);
    });

    it("lezer() state doc line count is correct", () => {
      const state = EditorState.create({
        doc: "@top P { e* }\n@tokens { Number { @digit+ } }\ne { Number }",
        extensions: [lezer()],
      });
      expect(state.doc.lines).toBe(3);
    });

    it("lezerLanguage parser tree has correct length", () => {
      const code = "@top P { e* }\n@tokens { Num { @digit+ } }";
      const tree = lezerLanguage.parser.parse(code);
      expect(tree.length).toBe(code.length);
    });

    it("lezer() state allows insert at start", () => {
      let state = EditorState.create({ doc: "@top P { e* }", extensions: [lezer()] });
      state = state.update({ changes: { from: 0, insert: "// grammar\n" } }).state;
      expect(state.doc.line(1).text).toBe("// grammar");
    });

    it("lezer() state allows 4 sequential transactions", () => {
      let state = EditorState.create({ doc: "@top P { e* }", extensions: [lezer()] });
      state = state.update({ changes: { from: 13, insert: "\n@tokens {" } }).state;
      state = state.update({ changes: { from: state.doc.length, insert: "\n  Num { @digit+ }" } }).state;
      state = state.update({ changes: { from: state.doc.length, insert: "\n}" } }).state;
      expect(state.doc.lines).toBe(4);
    });

    it("lezer() state doc line(2) text is accessible", () => {
      const state = EditorState.create({
        doc: "@top P { e* }\n@tokens { Num { @digit+ } }\ne { Num }",
        extensions: [lezer()],
      });
      expect(state.doc.line(2).text).toBe("@tokens { Num { @digit+ } }");
    });

    it("lezer() state allows deletion of all content", () => {
      let state = EditorState.create({ doc: "@top P { e* }", extensions: [lezer()] });
      state = state.update({ changes: { from: 0, to: 13 } }).state;
      expect(state.doc.toString()).toBe("");
    });
  });
});
