import { describe, it, expect } from "bun:test";
import { StreamLanguage, LanguageSupport, syntaxTree } from "../../../src/core/language/index";
import { EditorState } from "../../../src/core/state/index";

import { textile } from "../../../src/lang/legacy/textile";
import { stex } from "../../../src/lang/legacy/stex";
import { verilog } from "../../../src/lang/legacy/verilog";
import { xQuery } from "../../../src/lang/legacy/xquery";
import { solr } from "../../../src/lang/legacy/solr";
import { pig } from "../../../src/lang/legacy/pig";
import { apl } from "../../../src/lang/legacy/apl";
import { cobol } from "../../../src/lang/legacy/cobol";
import { liveScript } from "../../../src/lang/legacy/livescript";
import { yacas } from "../../../src/lang/legacy/yacas";
import { ebnf } from "../../../src/lang/legacy/ebnf";
import { forth } from "../../../src/lang/legacy/forth";

describe("Legacy language packs (batch 4)", () => {
  describe("StreamParser exports", () => {
    it("textile is a StreamParser object", () => {
      expect(textile).toBeDefined();
      expect(typeof textile).toBe("object");
    });

    it("stex is a StreamParser object", () => {
      expect(stex).toBeDefined();
      expect(typeof stex).toBe("object");
    });

    it("verilog is a StreamParser object", () => {
      expect(verilog).toBeDefined();
      expect(typeof verilog).toBe("object");
    });

    it("xQuery is a StreamParser object", () => {
      expect(xQuery).toBeDefined();
      expect(typeof xQuery).toBe("object");
    });

    it("solr is a StreamParser object", () => {
      expect(solr).toBeDefined();
      expect(typeof solr).toBe("object");
    });

    it("pig is a StreamParser object", () => {
      expect(pig).toBeDefined();
      expect(typeof pig).toBe("object");
    });

    it("apl is a StreamParser object", () => {
      expect(apl).toBeDefined();
      expect(typeof apl).toBe("object");
    });

    it("cobol is a StreamParser object", () => {
      expect(cobol).toBeDefined();
      expect(typeof cobol).toBe("object");
    });

    it("liveScript is a StreamParser object", () => {
      expect(liveScript).toBeDefined();
      expect(typeof liveScript).toBe("object");
    });

    it("yacas is a StreamParser object", () => {
      expect(yacas).toBeDefined();
      expect(typeof yacas).toBe("object");
    });

    it("ebnf is a StreamParser object", () => {
      expect(ebnf).toBeDefined();
      expect(typeof ebnf).toBe("object");
    });

    it("forth is a StreamParser object", () => {
      expect(forth).toBeDefined();
      expect(typeof forth).toBe("object");
    });
  });

  describe("EditorState integration", () => {
    it("stex integrates with EditorState (LaTeX)", () => {
      const lang = StreamLanguage.define(stex);
      const state = EditorState.create({
        doc: "\\documentclass{article}\n\\begin{document}\nHello, World!\n\\end{document}",
        extensions: [new LanguageSupport(lang)],
      });
      expect(state.doc.toString()).toContain("\\documentclass");
    });

    it("verilog integrates with EditorState", () => {
      const lang = StreamLanguage.define(verilog);
      const state = EditorState.create({
        doc: "module counter(clk, reset, count);\n  input clk, reset;\n  output [3:0] count;\nendmodule",
        extensions: [new LanguageSupport(lang)],
      });
      expect(state.doc.toString()).toContain("module counter");
    });

    it("cobol integrates with EditorState", () => {
      const lang = StreamLanguage.define(cobol);
      const state = EditorState.create({
        doc: "IDENTIFICATION DIVISION.\nPROGRAM-ID. HELLO-WORLD.\nPROCEDURE DIVISION.\n    DISPLAY 'Hello, World!'.",
        extensions: [new LanguageSupport(lang)],
      });
      expect(state.doc.toString()).toContain("IDENTIFICATION DIVISION");
    });

    it("textile integrates with EditorState", () => {
      const lang = StreamLanguage.define(textile);
      const state = EditorState.create({
        doc: "h1. Heading\n\np. This is a paragraph with *bold* and _italic_ text.",
        extensions: [new LanguageSupport(lang)],
      });
      expect(state.doc.toString()).toContain("h1. Heading");
    });

    it("ebnf integrates with EditorState", () => {
      const lang = StreamLanguage.define(ebnf);
      const state = EditorState.create({
        doc: "digit = '0' | '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' ;",
        extensions: [new LanguageSupport(lang)],
      });
      expect(state.doc.toString()).toContain("digit");
    });

    it("forth integrates with EditorState", () => {
      const lang = StreamLanguage.define(forth);
      const state = EditorState.create({
        doc: ": SQUARE DUP * ;\n5 SQUARE .",
        extensions: [new LanguageSupport(lang)],
      });
      expect(state.doc.toString()).toContain("SQUARE");
    });
  });

  describe("syntaxTree integration", () => {
    it("stex syntaxTree is non-empty", () => {
      const lang = StreamLanguage.define(stex);
      const state = EditorState.create({
        doc: "\\documentclass{article}\n\\begin{document}\nHello\n\\end{document}",
        extensions: [new LanguageSupport(lang)],
      });
      expect(syntaxTree(state).length).toBeGreaterThan(0);
    });

    it("verilog syntaxTree is non-empty", () => {
      const lang = StreamLanguage.define(verilog);
      const state = EditorState.create({
        doc: "module test; endmodule",
        extensions: [new LanguageSupport(lang)],
      });
      expect(syntaxTree(state).length).toBeGreaterThan(0);
    });

    it("ebnf syntaxTree is non-empty", () => {
      const lang = StreamLanguage.define(ebnf);
      const state = EditorState.create({
        doc: "digit = '0' | '1' ;",
        extensions: [new LanguageSupport(lang)],
      });
      expect(syntaxTree(state).length).toBeGreaterThan(0);
    });

    it("forth syntaxTree is non-empty", () => {
      const lang = StreamLanguage.define(forth);
      const state = EditorState.create({
        doc: ": DOUBLE 2 * ;",
        extensions: [new LanguageSupport(lang)],
      });
      expect(syntaxTree(state).length).toBeGreaterThan(0);
    });

    it("textile syntaxTree is non-empty", () => {
      const lang = StreamLanguage.define(textile);
      const state = EditorState.create({
        doc: "h1. Title\n\np. paragraph",
        extensions: [new LanguageSupport(lang)],
      });
      expect(syntaxTree(state).length).toBeGreaterThan(0);
    });

    it("cobol syntaxTree is non-empty", () => {
      const lang = StreamLanguage.define(cobol);
      const state = EditorState.create({
        doc: "IDENTIFICATION DIVISION.\nPROGRAM-ID. HELLO.",
        extensions: [new LanguageSupport(lang)],
      });
      expect(syntaxTree(state).length).toBeGreaterThan(0);
    });

    it("solr syntaxTree is non-empty", () => {
      const lang = StreamLanguage.define(solr);
      const state = EditorState.create({
        doc: "title:hello AND body:world",
        extensions: [new LanguageSupport(lang)],
      });
      expect(syntaxTree(state).length).toBeGreaterThan(0);
    });

    it("apl syntaxTree is non-empty", () => {
      const lang = StreamLanguage.define(apl);
      const state = EditorState.create({
        doc: "sum ← +/⍳10",
        extensions: [new LanguageSupport(lang)],
      });
      expect(syntaxTree(state).length).toBeGreaterThan(0);
    });

    it("xQuery syntaxTree is non-empty", () => {
      const lang = StreamLanguage.define(xQuery);
      const state = EditorState.create({
        doc: "for $x in doc('books.xml')//book return $x/title",
        extensions: [new LanguageSupport(lang)],
      });
      expect(syntaxTree(state).length).toBeGreaterThan(0);
    });

    it("pig syntaxTree is non-empty", () => {
      const lang = StreamLanguage.define(pig);
      const state = EditorState.create({
        doc: "A = LOAD 'data.txt' USING PigStorage(',');\nB = FILTER A BY $0 > 0;",
        extensions: [new LanguageSupport(lang)],
      });
      expect(syntaxTree(state).length).toBeGreaterThan(0);
    });

    it("liveScript syntaxTree is non-empty", () => {
      const lang = StreamLanguage.define(liveScript);
      const state = EditorState.create({
        doc: "add = (x, y) -> x + y\nconsole.log add 1, 2",
        extensions: [new LanguageSupport(lang)],
      });
      expect(syntaxTree(state).length).toBeGreaterThan(0);
    });

    it("xQuery integrates with EditorState", () => {
      const lang = StreamLanguage.define(xQuery);
      const state = EditorState.create({
        doc: "for $book in doc('books.xml')//book\nwhere $book/price < 30\nreturn $book/title",
        extensions: [new LanguageSupport(lang)],
      });
      expect(state.doc.toString()).toContain("for $book");
    });

    it("apl integrates with EditorState", () => {
      const lang = StreamLanguage.define(apl);
      const state = EditorState.create({
        doc: "sum ← +/⍳10\nproduct ← ×/1+⍳5",
        extensions: [new LanguageSupport(lang)],
      });
      expect(state.doc.toString()).toContain("sum");
    });

    it("ebnf doc line count is correct", () => {
      const lang = StreamLanguage.define(ebnf);
      const state = EditorState.create({
        doc: "digit = '0' | '1' ;\nletter = 'a' | 'b' ;\nword = letter+ ;",
        extensions: [new LanguageSupport(lang)],
      });
      expect(state.doc.lines).toBe(3);
    });

    it("cobol doc mutation via transaction works", () => {
      const lang = StreamLanguage.define(cobol);
      let state = EditorState.create({
        doc: "IDENTIFICATION DIVISION.",
        extensions: [new LanguageSupport(lang)],
      });
      state = state.update({ changes: { from: 24, insert: "\nPROGRAM-ID. TEST." } }).state;
      expect(state.doc.lines).toBe(2);
    });

    it("yacas syntaxTree is non-empty", () => {
      const lang = StreamLanguage.define(yacas);
      const state = EditorState.create({
        doc: "Factorial(n) := If(n = 0, 1, n * Factorial(n-1))",
        extensions: [new LanguageSupport(lang)],
      });
      expect(syntaxTree(state).length).toBeGreaterThan(0);
    });

    it("pig integrates with EditorState", () => {
      const lang = StreamLanguage.define(pig);
      const state = EditorState.create({
        doc: "A = LOAD 'input.txt' AS (id: int, name: chararray);\nB = FILTER A BY id > 0;\nDUMP B;",
        extensions: [new LanguageSupport(lang)],
      });
      expect(state.doc.toString()).toContain("LOAD");
    });

    it("xQuery doc line count is correct", () => {
      const lang = StreamLanguage.define(xQuery);
      const state = EditorState.create({
        doc: "for $i in 1 to 10\nreturn $i * $i",
        extensions: [new LanguageSupport(lang)],
      });
      expect(state.doc.lines).toBe(2);
    });

    it("liveScript doc mutation via transaction works", () => {
      const lang = StreamLanguage.define(liveScript);
      let state = EditorState.create({
        doc: "x = 1",
        extensions: [new LanguageSupport(lang)],
      });
      state = state.update({ changes: { from: 5, insert: "\ny = 2" } }).state;
      expect(state.doc.lines).toBe(2);
    });

    it("forth doc length is correct", () => {
      const lang = StreamLanguage.define(forth);
      const doc = ": SQUARE DUP * ;";
      const state = EditorState.create({ doc, extensions: [new LanguageSupport(lang)] });
      expect(state.doc.length).toBe(doc.length);
    });

    it("textile integrates with complex markup", () => {
      const lang = StreamLanguage.define(textile);
      const state = EditorState.create({
        doc: "h2. Section Title\n\np. This is *important* and _italic_ text.\n\nbq. A blockquote here.",
        extensions: [new LanguageSupport(lang)],
      });
      expect(state.doc.toString()).toContain("Section Title");
    });

    it("verilog integrates with EditorState more complex", () => {
      const lang = StreamLanguage.define(verilog);
      const state = EditorState.create({
        doc: "module alu(input [7:0] a, b, input [2:0] op, output reg [7:0] result);\nalways @(*) begin\n  case (op)\n    3'b000: result = a + b;\n    3'b001: result = a - b;\n    default: result = 8'h00;\n  endcase\nend\nendmodule",
        extensions: [new LanguageSupport(lang)],
      });
      expect(state.doc.toString()).toContain("module alu");
    });

    it("solr integrates with EditorState", () => {
      const lang = StreamLanguage.define(solr);
      const state = EditorState.create({
        doc: "title:\"hello world\" AND (author:alice OR author:bob) NOT deleted:true",
        extensions: [new LanguageSupport(lang)],
      });
      expect(state.doc.toString()).toContain("title:");
    });

    it("apl doc line count is correct", () => {
      const lang = StreamLanguage.define(apl);
      const state = EditorState.create({
        doc: "sum ← +/⍳10\nproduct ← ×/1+⍳5\nfactorial ← !/⍳10",
        extensions: [new LanguageSupport(lang)],
      });
      expect(state.doc.lines).toBe(3);
    });

    it("stex doc mutation via transaction works", () => {
      const lang = StreamLanguage.define(stex);
      let state = EditorState.create({
        doc: "\\documentclass{article}",
        extensions: [new LanguageSupport(lang)],
      });
      state = state.update({ changes: { from: 22, insert: "\n\\begin{document}" } }).state;
      expect(state.doc.lines).toBe(2);
    });

    it("pig doc length is correct", () => {
      const lang = StreamLanguage.define(pig);
      const doc = "A = LOAD 'data.txt';";
      const state = EditorState.create({ doc, extensions: [new LanguageSupport(lang)] });
      expect(state.doc.length).toBe(doc.length);
    });

    it("textile doc line count is correct", () => {
      const lang = StreamLanguage.define(textile);
      const state = EditorState.create({
        doc: "h1. Title\n\np. Paragraph one.\n\np. Paragraph two.",
        extensions: [new LanguageSupport(lang)],
      });
      expect(state.doc.lines).toBe(5);
    });

    it("verilog doc mutation via transaction works", () => {
      const lang = StreamLanguage.define(verilog);
      let state = EditorState.create({ doc: "module top;", extensions: [new LanguageSupport(lang)] });
      state = state.update({ changes: { from: 11, insert: "\nendmodule" } }).state;
      expect(state.doc.lines).toBe(2);
    });

    it("forth doc line text is accessible", () => {
      const lang = StreamLanguage.define(forth);
      const state = EditorState.create({
        doc: ": square dup * ;\n: cube dup dup * * ;",
        extensions: [new LanguageSupport(lang)],
      });
      expect(state.doc.line(1).text).toBe(": square dup * ;");
    });

    it("cobol doc replacement transaction works", () => {
      const lang = StreamLanguage.define(cobol);
      let state = EditorState.create({ doc: "IDENTIFICATION DIVISION.", extensions: [new LanguageSupport(lang)] });
      state = state.update({ changes: { from: 0, to: 14, insert: "ENVIRONMENT" } }).state;
      expect(state.doc.toString()).toBe("ENVIRONMENT DIVISION.");
    });

    it("ebnf doc length is correct", () => {
      const lang = StreamLanguage.define(ebnf);
      const doc = "digit = '0' | '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' ;";
      const state = EditorState.create({ doc, extensions: [new LanguageSupport(lang)] });
      expect(state.doc.length).toBe(doc.length);
    });

    it("xQuery doc line count is correct", () => {
      const lang = StreamLanguage.define(xQuery);
      const state = EditorState.create({
        doc: "for $x in /bookstore/book\nwhere $x/price > 30\nreturn $x/title",
        extensions: [new LanguageSupport(lang)],
      });
      expect(state.doc.lines).toBe(3);
    });

    it("solr doc mutation via transaction works", () => {
      const lang = StreamLanguage.define(solr);
      let state = EditorState.create({ doc: "q=*:*", extensions: [new LanguageSupport(lang)] });
      state = state.update({ changes: { from: 5, insert: "&rows=10" } }).state;
      expect(state.doc.toString()).toBe("q=*:*&rows=10");
    });

    it("liveScript doc line text is accessible", () => {
      const lang = StreamLanguage.define(liveScript);
      const state = EditorState.create({
        doc: "square = (x) -> x * x\ncube = (x) -> x * x * x",
        extensions: [new LanguageSupport(lang)],
      });
      expect(state.doc.line(1).text).toBe("square = (x) -> x * x");
    });

    it("apl doc replacement transaction works", () => {
      const lang = StreamLanguage.define(apl);
      let state = EditorState.create({ doc: "A ← 1 2 3", extensions: [new LanguageSupport(lang)] });
      state = state.update({ changes: { from: 7, to: 8, insert: "4" } }).state;
      expect(state.doc.toString()).toContain("4");
    });

    it("yacas doc length is correct", () => {
      const lang = StreamLanguage.define(yacas);
      const doc = "Factorial(n) := If(n=0, 1, n*Factorial(n-1));";
      const state = EditorState.create({ doc, extensions: [new LanguageSupport(lang)] });
      expect(state.doc.length).toBe(doc.length);
    });

    it("textile doc allows sequential transactions", () => {
      const lang = StreamLanguage.define(textile);
      let state = EditorState.create({ doc: "h1. Title", extensions: [new LanguageSupport(lang)] });
      state = state.update({ changes: { from: 9, insert: "\n\nParagraph text." } }).state;
      expect(state.doc.lines).toBe(3);
    });
  });
});
