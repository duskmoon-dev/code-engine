import { describe, it, expect } from "bun:test";
import { StreamLanguage, LanguageSupport, syntaxTree } from "../../../src/core/language/index";
import { EditorState } from "../../../src/core/state/index";

import { dylan } from "../../../src/lang/legacy/dylan";
import { ecl } from "../../../src/lang/legacy/ecl";
import { eiffel } from "../../../src/lang/legacy/eiffel";
import { factor } from "../../../src/lang/legacy/factor";
import { gas } from "../../../src/lang/legacy/gas";
import { nsis } from "../../../src/lang/legacy/nsis";
import { oz } from "../../../src/lang/legacy/oz";
import { sieve } from "../../../src/lang/legacy/sieve";
import { ntriples } from "../../../src/lang/legacy/ntriples";
import { fSharp, oCaml, sml } from "../../../src/lang/legacy/mllike";
import { mumps } from "../../../src/lang/legacy/mumps";
import { troff } from "../../../src/lang/legacy/troff";

describe("Legacy language packs (batch 6)", () => {
  describe("StreamParser exports", () => {
    it("dylan is a StreamParser object", () => {
      expect(dylan).toBeDefined();
      expect(typeof dylan).toBe("object");
    });

    it("ecl is a StreamParser object", () => {
      expect(ecl).toBeDefined();
      expect(typeof ecl).toBe("object");
    });

    it("eiffel is a StreamParser object", () => {
      expect(eiffel).toBeDefined();
      expect(typeof eiffel).toBe("object");
    });

    it("factor is a StreamParser object", () => {
      expect(factor).toBeDefined();
      expect(typeof factor).toBe("object");
    });

    it("gas is a StreamParser object", () => {
      expect(gas).toBeDefined();
      expect(typeof gas).toBe("object");
    });

    it("nsis is a StreamParser object", () => {
      expect(nsis).toBeDefined();
      expect(typeof nsis).toBe("object");
    });

    it("oz is a StreamParser object", () => {
      expect(oz).toBeDefined();
      expect(typeof oz).toBe("object");
    });

    it("sieve is a StreamParser object", () => {
      expect(sieve).toBeDefined();
      expect(typeof sieve).toBe("object");
    });

    it("ntriples is a StreamParser object", () => {
      expect(ntriples).toBeDefined();
      expect(typeof ntriples).toBe("object");
    });

    it("fSharp (mllike) is a StreamParser object", () => {
      expect(fSharp).toBeDefined();
      expect(typeof fSharp).toBe("object");
    });

    it("oCaml (mllike) is a StreamParser object", () => {
      expect(oCaml).toBeDefined();
      expect(typeof oCaml).toBe("object");
    });

    it("sml (mllike) is a StreamParser object", () => {
      expect(sml).toBeDefined();
      expect(typeof sml).toBe("object");
    });

    it("mumps is a StreamParser object", () => {
      expect(mumps).toBeDefined();
      expect(typeof mumps).toBe("object");
    });

    it("troff is a StreamParser object", () => {
      expect(troff).toBeDefined();
      expect(typeof troff).toBe("object");
    });
  });

  describe("EditorState integration", () => {
    it("eiffel integrates with EditorState", () => {
      const lang = StreamLanguage.define(eiffel);
      const state = EditorState.create({
        doc: "class HELLO\nfeature\n  make\n    do\n      print (\"Hello, World!%N\")\n    end\nend",
        extensions: [new LanguageSupport(lang)],
      });
      expect(state.doc.toString()).toContain("class HELLO");
    });

    it("fSharp integrates with EditorState", () => {
      const lang = StreamLanguage.define(fSharp);
      const state = EditorState.create({
        doc: "let greet name = printfn \"Hello, %s!\" name\ngreet \"World\"",
        extensions: [new LanguageSupport(lang)],
      });
      expect(state.doc.toString()).toContain("let greet");
    });

    it("oCaml integrates with EditorState", () => {
      const lang = StreamLanguage.define(oCaml);
      const state = EditorState.create({
        doc: "let greet name = Printf.printf \"Hello, %s!\\n\" name\nlet () = greet \"World\"",
        extensions: [new LanguageSupport(lang)],
      });
      expect(state.doc.toString()).toContain("let greet");
    });

    it("sieve integrates with EditorState", () => {
      const lang = StreamLanguage.define(sieve);
      const state = EditorState.create({
        doc: "require [\"fileinto\"];\nif header :contains \"Subject\" \"SPAM\" {\n  fileinto \"Junk\";\n}",
        extensions: [new LanguageSupport(lang)],
      });
      expect(state.doc.toString()).toContain("require");
    });

    it("oz integrates with EditorState", () => {
      const lang = StreamLanguage.define(oz);
      const state = EditorState.create({
        doc: "functor\nexport main: Main\ndefine\n  proc {Main}\n    {Show hello}\n  end\nend",
        extensions: [new LanguageSupport(lang)],
      });
      expect(state.doc.toString()).toContain("functor");
    });

    it("factor integrates with EditorState", () => {
      const lang = StreamLanguage.define(factor);
      const state = EditorState.create({
        doc: ": hello ( -- ) \"Hello, World!\" print ;",
        extensions: [new LanguageSupport(lang)],
      });
      expect(state.doc.toString()).toContain("hello");
    });
  });

  describe("syntaxTree integration", () => {
    it("fSharp syntaxTree is non-empty", () => {
      const lang = StreamLanguage.define(fSharp);
      const state = EditorState.create({
        doc: "let x = 42",
        extensions: [new LanguageSupport(lang)],
      });
      expect(syntaxTree(state).length).toBeGreaterThan(0);
    });

    it("oCaml syntaxTree is non-empty", () => {
      const lang = StreamLanguage.define(oCaml);
      const state = EditorState.create({
        doc: "let x = 42",
        extensions: [new LanguageSupport(lang)],
      });
      expect(syntaxTree(state).length).toBeGreaterThan(0);
    });

    it("sml syntaxTree is non-empty", () => {
      const lang = StreamLanguage.define(sml);
      const state = EditorState.create({
        doc: "val x = 42",
        extensions: [new LanguageSupport(lang)],
      });
      expect(syntaxTree(state).length).toBeGreaterThan(0);
    });

    it("eiffel syntaxTree is non-empty", () => {
      const lang = StreamLanguage.define(eiffel);
      const state = EditorState.create({
        doc: "class HELLO\nfeature\nend",
        extensions: [new LanguageSupport(lang)],
      });
      expect(syntaxTree(state).length).toBeGreaterThan(0);
    });

    it("sieve syntaxTree is non-empty", () => {
      const lang = StreamLanguage.define(sieve);
      const state = EditorState.create({
        doc: "require [\"fileinto\"];",
        extensions: [new LanguageSupport(lang)],
      });
      expect(syntaxTree(state).length).toBeGreaterThan(0);
    });

    it("dylan syntaxTree is non-empty", () => {
      const lang = StreamLanguage.define(dylan);
      const state = EditorState.create({
        doc: "define method greet (name :: <string>)\n  format-out(\"Hello, %s!\\n\", name);\nend method greet;",
        extensions: [new LanguageSupport(lang)],
      });
      expect(syntaxTree(state).length).toBeGreaterThan(0);
    });

    it("gas syntaxTree is non-empty", () => {
      const lang = StreamLanguage.define(gas);
      const state = EditorState.create({
        doc: ".section .data\nhello: .asciz \"Hello, World!\"",
        extensions: [new LanguageSupport(lang)],
      });
      expect(syntaxTree(state).length).toBeGreaterThan(0);
    });

    it("nsis syntaxTree is non-empty", () => {
      const lang = StreamLanguage.define(nsis);
      const state = EditorState.create({
        doc: "!define PRODUCT_NAME \"MyApp\"\nName \"${PRODUCT_NAME}\"\nOutFile \"installer.exe\"",
        extensions: [new LanguageSupport(lang)],
      });
      expect(syntaxTree(state).length).toBeGreaterThan(0);
    });

    it("ntriples syntaxTree is non-empty", () => {
      const lang = StreamLanguage.define(ntriples);
      const state = EditorState.create({
        doc: "<http://example.org/s> <http://example.org/p> <http://example.org/o> .",
        extensions: [new LanguageSupport(lang)],
      });
      expect(syntaxTree(state).length).toBeGreaterThan(0);
    });

    it("oz syntaxTree cursor traversal finds nodes", () => {
      const lang = StreamLanguage.define(oz);
      const state = EditorState.create({
        doc: "functor\nexport main: Main\ndefine proc {Main} skip end\nend",
        extensions: [new LanguageSupport(lang)],
      });
      const tree = syntaxTree(state);
      const cursor = tree.cursor();
      let count = 0;
      do { count++; } while (cursor.next() && count < 50);
      expect(count).toBeGreaterThan(0);
    });

    it("fSharp integrates with EditorState", () => {
      const lang = StreamLanguage.define(fSharp);
      const state = EditorState.create({
        doc: "let greet name = printfn \"Hello, %s!\" name\ngreet \"World\"",
        extensions: [new LanguageSupport(lang)],
      });
      expect(state.doc.toString()).toContain("let greet");
    });

    it("oCaml integrates with EditorState", () => {
      const lang = StreamLanguage.define(oCaml);
      const state = EditorState.create({
        doc: "let rec factorial n =\n  if n = 0 then 1\n  else n * factorial (n - 1)",
        extensions: [new LanguageSupport(lang)],
      });
      expect(state.doc.toString()).toContain("factorial");
    });

    it("eiffel integrates with EditorState", () => {
      const lang = StreamLanguage.define(eiffel);
      const state = EditorState.create({
        doc: "class HELLO_WORLD\ncreate make\nfeature\n  make do\n    io.put_string (\"Hello, World!%N\")\n  end\nend",
        extensions: [new LanguageSupport(lang)],
      });
      expect(state.doc.toString()).toContain("class HELLO_WORLD");
    });

    it("fSharp doc line count is correct", () => {
      const lang = StreamLanguage.define(fSharp);
      const state = EditorState.create({
        doc: "let x = 1\nlet y = 2\nlet z = x + y",
        extensions: [new LanguageSupport(lang)],
      });
      expect(state.doc.lines).toBe(3);
    });

    it("mumps doc mutation via transaction works", () => {
      const lang = StreamLanguage.define(mumps);
      let state = EditorState.create({
        doc: "SET x=1",
        extensions: [new LanguageSupport(lang)],
      });
      state = state.update({ changes: { from: 7, insert: "\nWRITE x" } }).state;
      expect(state.doc.lines).toBe(2);
    });

    it("sml integrates with EditorState", () => {
      const lang = StreamLanguage.define(sml);
      const state = EditorState.create({
        doc: "fun factorial 0 = 1\n  | factorial n = n * factorial (n - 1)",
        extensions: [new LanguageSupport(lang)],
      });
      expect(state.doc.toString()).toContain("factorial");
    });

    it("dylan integrates with EditorState", () => {
      const lang = StreamLanguage.define(dylan);
      const state = EditorState.create({
        doc: "define method greet (name :: <string>)\n  format-out(\"Hello, %s!\\n\", name);\nend method greet;",
        extensions: [new LanguageSupport(lang)],
      });
      expect(state.doc.toString()).toContain("define method");
    });

    it("troff integrates with EditorState", () => {
      const lang = StreamLanguage.define(troff);
      const state = EditorState.create({
        doc: ".TH MYCOMMAND 1\n.SH NAME\nmycommand \\- a sample command\n.SH SYNOPSIS\n.B mycommand [OPTIONS]",
        extensions: [new LanguageSupport(lang)],
      });
      expect(state.doc.toString()).toContain(".TH MYCOMMAND");
    });

    it("ecl integrates with EditorState", () => {
      const lang = StreamLanguage.define(ecl);
      const state = EditorState.create({
        doc: "MyData := DATASET([{1,'Alice'},{2,'Bob'}], {INTEGER id; STRING name;});",
        extensions: [new LanguageSupport(lang)],
      });
      expect(state.doc.toString()).toContain("DATASET");
    });

    it("nsis doc line count is correct", () => {
      const lang = StreamLanguage.define(nsis);
      const state = EditorState.create({
        doc: "Name \"MyApp\"\nOutFile \"installer.exe\"\nInstallDir $PROGRAMFILES\\MyApp",
        extensions: [new LanguageSupport(lang)],
      });
      expect(state.doc.lines).toBe(3);
    });

    it("gas doc mutation via transaction works", () => {
      const lang = StreamLanguage.define(gas);
      let state = EditorState.create({
        doc: ".section .text",
        extensions: [new LanguageSupport(lang)],
      });
      state = state.update({ changes: { from: 14, insert: "\n.globl main" } }).state;
      expect(state.doc.lines).toBe(2);
    });

    it("ecl doc line count is correct", () => {
      const lang = StreamLanguage.define(ecl);
      const state = EditorState.create({
        doc: "IMPORT Std;\nds := DATASET([{1,'Alice'},{2,'Bob'}], {INTEGER id; STRING name;});\nOUTPUT(ds);",
        extensions: [new LanguageSupport(lang)],
      });
      expect(state.doc.lines).toBe(3);
    });

    it("oz doc mutation via transaction works", () => {
      const lang = StreamLanguage.define(oz);
      let state = EditorState.create({
        doc: "declare X = 42",
        extensions: [new LanguageSupport(lang)],
      });
      state = state.update({ changes: { from: 14, insert: "\n{Browse X}" } }).state;
      expect(state.doc.lines).toBe(2);
    });

    it("mumps doc length is correct", () => {
      const lang = StreamLanguage.define(mumps);
      const doc = "SET X=42\nWRITE X";
      const state = EditorState.create({ doc, extensions: [new LanguageSupport(lang)] });
      expect(state.doc.length).toBe(doc.length);
    });

    it("sieve doc line count is correct", () => {
      const lang = StreamLanguage.define(sieve);
      const state = EditorState.create({
        doc: "require [\"fileinto\"];\nif header :contains \"Subject\" \"SPAM\" {\n  fileinto \"Junk\";\n}",
        extensions: [new LanguageSupport(lang)],
      });
      expect(state.doc.lines).toBe(4);
    });

    it("fSharp doc mutation via transaction works", () => {
      const lang = StreamLanguage.define(fSharp);
      let state = EditorState.create({
        doc: "let x = 1",
        extensions: [new LanguageSupport(lang)],
      });
      state = state.update({ changes: { from: 9, insert: "\nlet y = 2" } }).state;
      expect(state.doc.lines).toBe(2);
    });

    it("dylan doc length is correct", () => {
      const lang = StreamLanguage.define(dylan);
      const doc = "define method greet() format-out(\"Hello\\n\") end;";
      const state = EditorState.create({ doc, extensions: [new LanguageSupport(lang)] });
      expect(state.doc.length).toBe(doc.length);
    });

    it("eiffel doc mutation via transaction works", () => {
      const lang = StreamLanguage.define(eiffel);
      let state = EditorState.create({ doc: "class HELLO", extensions: [new LanguageSupport(lang)] });
      state = state.update({ changes: { from: 11, insert: "\nend" } }).state;
      expect(state.doc.lines).toBe(2);
    });

    it("nsis doc line text is accessible", () => {
      const lang = StreamLanguage.define(nsis);
      const state = EditorState.create({
        doc: "Section \"Main\"\n  DetailPrint \"Hello\"\nSectionEnd",
        extensions: [new LanguageSupport(lang)],
      });
      expect(state.doc.line(1).text).toBe("Section \"Main\"");
    });

    it("gas doc replacement transaction works", () => {
      const lang = StreamLanguage.define(gas);
      let state = EditorState.create({ doc: ".section .text", extensions: [new LanguageSupport(lang)] });
      state = state.update({ changes: { from: 9, to: 14, insert: ".data" } }).state;
      expect(state.doc.toString()).toBe(".section .data");
    });

    it("troff doc line count is correct", () => {
      const lang = StreamLanguage.define(troff);
      const state = EditorState.create({
        doc: ".TH FOO 1\n.SH NAME\nfoo - a program\n.SH SYNOPSIS\nfoo [options]",
        extensions: [new LanguageSupport(lang)],
      });
      expect(state.doc.lines).toBe(5);
    });
  });
});
