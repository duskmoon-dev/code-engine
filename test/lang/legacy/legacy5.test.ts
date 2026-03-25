import { describe, it, expect } from "bun:test";
import { StreamLanguage, LanguageSupport, syntaxTree } from "../../../src/core/language/index";
import { EditorState } from "../../../src/core/state/index";

import { asterisk } from "../../../src/lang/legacy/asterisk";
import { crystal } from "../../../src/lang/legacy/crystal";
import { cypher } from "../../../src/lang/legacy/cypher";
import { elm } from "../../../src/lang/legacy/elm";
import { http } from "../../../src/lang/legacy/http";
import { mathematica } from "../../../src/lang/legacy/mathematica";
import { smalltalk } from "../../../src/lang/legacy/smalltalk";
import { pegjs } from "../../../src/lang/legacy/pegjs";
import { webIDL } from "../../../src/lang/legacy/webidl";
import { spreadsheet } from "../../../src/lang/legacy/spreadsheet";
import { idl } from "../../../src/lang/legacy/idl";
import { modelica } from "../../../src/lang/legacy/modelica";

describe("Legacy language packs (batch 5)", () => {
  describe("StreamParser exports", () => {
    it("asterisk is a StreamParser object", () => {
      expect(asterisk).toBeDefined();
      expect(typeof asterisk).toBe("object");
    });

    it("crystal is a StreamParser object", () => {
      expect(crystal).toBeDefined();
      expect(typeof crystal).toBe("object");
    });

    it("cypher is a StreamParser object", () => {
      expect(cypher).toBeDefined();
      expect(typeof cypher).toBe("object");
    });

    it("elm is a StreamParser object", () => {
      expect(elm).toBeDefined();
      expect(typeof elm).toBe("object");
    });

    it("http is a StreamParser object", () => {
      expect(http).toBeDefined();
      expect(typeof http).toBe("object");
    });

    it("mathematica is a StreamParser object", () => {
      expect(mathematica).toBeDefined();
      expect(typeof mathematica).toBe("object");
    });

    it("smalltalk is a StreamParser object", () => {
      expect(smalltalk).toBeDefined();
      expect(typeof smalltalk).toBe("object");
    });

    it("pegjs is a StreamParser object", () => {
      expect(pegjs).toBeDefined();
      expect(typeof pegjs).toBe("object");
    });

    it("webIDL is a StreamParser object", () => {
      expect(webIDL).toBeDefined();
      expect(typeof webIDL).toBe("object");
    });

    it("spreadsheet is a StreamParser object", () => {
      expect(spreadsheet).toBeDefined();
      expect(typeof spreadsheet).toBe("object");
    });

    it("idl is a StreamParser object", () => {
      expect(idl).toBeDefined();
      expect(typeof idl).toBe("object");
    });

    it("modelica is a StreamParser object", () => {
      expect(modelica).toBeDefined();
      expect(typeof modelica).toBe("object");
    });
  });

  describe("EditorState integration", () => {
    it("crystal integrates with EditorState", () => {
      const lang = StreamLanguage.define(crystal);
      const state = EditorState.create({
        doc: "def greet(name : String) : String\n  \"Hello, #{name}!\"\nend\nputs greet(\"World\")",
        extensions: [new LanguageSupport(lang)],
      });
      expect(state.doc.toString()).toContain("def greet");
    });

    it("elm integrates with EditorState", () => {
      const lang = StreamLanguage.define(elm);
      const state = EditorState.create({
        doc: "module Main exposing (..)\nimport Html exposing (text)\nmain = text \"Hello, World!\"",
        extensions: [new LanguageSupport(lang)],
      });
      expect(state.doc.toString()).toContain("module Main");
    });

    it("cypher integrates with EditorState", () => {
      const lang = StreamLanguage.define(cypher);
      const state = EditorState.create({
        doc: "MATCH (n:Person {name: 'Alice'})\nRETURN n.age",
        extensions: [new LanguageSupport(lang)],
      });
      expect(state.doc.toString()).toContain("MATCH");
    });

    it("http integrates with EditorState", () => {
      const lang = StreamLanguage.define(http);
      const state = EditorState.create({
        doc: "GET /api/users HTTP/1.1\nHost: example.com\nAccept: application/json",
        extensions: [new LanguageSupport(lang)],
      });
      expect(state.doc.toString()).toContain("GET /api/users");
    });

    it("smalltalk integrates with EditorState", () => {
      const lang = StreamLanguage.define(smalltalk);
      const state = EditorState.create({
        doc: "| x |\nx := 42.\nTranscript showCr: x printString.",
        extensions: [new LanguageSupport(lang)],
      });
      expect(state.doc.toString()).toContain("Transcript");
    });

    it("pegjs integrates with EditorState", () => {
      const lang = StreamLanguage.define(pegjs);
      const state = EditorState.create({
        doc: "start = word+\nword = chars:$[a-z]+ { return chars; }",
        extensions: [new LanguageSupport(lang)],
      });
      expect(state.doc.toString()).toContain("start = word+");
    });
  });

  describe("syntaxTree integration", () => {
    it("crystal syntaxTree is non-empty", () => {
      const lang = StreamLanguage.define(crystal);
      const state = EditorState.create({
        doc: "def hello\n  puts \"Hi\"\nend",
        extensions: [new LanguageSupport(lang)],
      });
      expect(syntaxTree(state).length).toBeGreaterThan(0);
    });

    it("elm syntaxTree is non-empty", () => {
      const lang = StreamLanguage.define(elm);
      const state = EditorState.create({
        doc: "module Main exposing (..)\nmain = text \"Hello\"",
        extensions: [new LanguageSupport(lang)],
      });
      expect(syntaxTree(state).length).toBeGreaterThan(0);
    });

    it("cypher syntaxTree is non-empty", () => {
      const lang = StreamLanguage.define(cypher);
      const state = EditorState.create({
        doc: "MATCH (n) RETURN n LIMIT 10",
        extensions: [new LanguageSupport(lang)],
      });
      expect(syntaxTree(state).length).toBeGreaterThan(0);
    });

    it("http syntaxTree is non-empty", () => {
      const lang = StreamLanguage.define(http);
      const state = EditorState.create({
        doc: "GET /api HTTP/1.1\nHost: example.com",
        extensions: [new LanguageSupport(lang)],
      });
      expect(syntaxTree(state).length).toBeGreaterThan(0);
    });

    it("smalltalk syntaxTree is non-empty", () => {
      const lang = StreamLanguage.define(smalltalk);
      const state = EditorState.create({
        doc: "| x |\nx := 42.",
        extensions: [new LanguageSupport(lang)],
      });
      expect(syntaxTree(state).length).toBeGreaterThan(0);
    });

    it("asterisk syntaxTree is non-empty", () => {
      const lang = StreamLanguage.define(asterisk);
      const state = EditorState.create({
        doc: "[general]\ncontext=default\n\n[default]\nexten => s,1,Answer()",
        extensions: [new LanguageSupport(lang)],
      });
      expect(syntaxTree(state).length).toBeGreaterThan(0);
    });

    it("mathematica syntaxTree is non-empty", () => {
      const lang = StreamLanguage.define(mathematica);
      const state = EditorState.create({
        doc: "f[x_] := x^2 + 1\nPlot[f[x], {x, -2, 2}]",
        extensions: [new LanguageSupport(lang)],
      });
      expect(syntaxTree(state).length).toBeGreaterThan(0);
    });

    it("spreadsheet syntaxTree is non-empty", () => {
      const lang = StreamLanguage.define(spreadsheet);
      const state = EditorState.create({
        doc: "=SUM(A1:A10)\n=AVERAGE(B1:B5)",
        extensions: [new LanguageSupport(lang)],
      });
      expect(syntaxTree(state).length).toBeGreaterThan(0);
    });

    it("idl syntaxTree is non-empty", () => {
      const lang = StreamLanguage.define(idl);
      const state = EditorState.create({
        doc: "x = findgen(100)\ny = sin(x / 10)\nplot, x, y",
        extensions: [new LanguageSupport(lang)],
      });
      expect(syntaxTree(state).length).toBeGreaterThan(0);
    });

    it("modelica syntaxTree is non-empty", () => {
      const lang = StreamLanguage.define(modelica);
      const state = EditorState.create({
        doc: "model Simple\n  Real x(start=1);\nequation\n  der(x) = -x;\nend Simple;",
        extensions: [new LanguageSupport(lang)],
      });
      expect(syntaxTree(state).length).toBeGreaterThan(0);
    });

    it("pegjs syntaxTree cursor traversal finds nodes", () => {
      const lang = StreamLanguage.define(pegjs);
      const state = EditorState.create({
        doc: "start = word+\nword = chars:$[a-z]+ { return chars; }",
        extensions: [new LanguageSupport(lang)],
      });
      const tree = syntaxTree(state);
      const cursor = tree.cursor();
      let count = 0;
      do { count++; } while (cursor.next() && count < 50);
      expect(count).toBeGreaterThan(0);
    });
  });
});
