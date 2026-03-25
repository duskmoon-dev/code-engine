import { describe, it, expect } from "bun:test";
import { StreamLanguage, LanguageSupport } from "../../../src/core/language/index";
import { EditorState } from "../../../src/core/state/index";

import { haskell } from "../../../src/lang/legacy/haskell";
import { pascal } from "../../../src/lang/legacy/pascal";
import { brainfuck } from "../../../src/lang/legacy/brainfuck";
import { groovy } from "../../../src/lang/legacy/groovy";
import { scheme } from "../../../src/lang/legacy/scheme";
import { fortran } from "../../../src/lang/legacy/fortran";
import { julia } from "../../../src/lang/legacy/julia";
import { tcl } from "../../../src/lang/legacy/tcl";
import { vb } from "../../../src/lang/legacy/vb";
import { nginx } from "../../../src/lang/legacy/nginx";
import { powerShell } from "../../../src/lang/legacy/powershell";
import { commonLisp } from "../../../src/lang/legacy/commonlisp";

describe("Legacy language packs (batch 2)", () => {
  describe("StreamParser exports", () => {
    it("haskell is a StreamParser object", () => {
      expect(haskell).toBeDefined();
      expect(typeof haskell).toBe("object");
    });

    it("pascal is a StreamParser object", () => {
      expect(pascal).toBeDefined();
      expect(typeof pascal).toBe("object");
    });

    it("brainfuck is a StreamParser object", () => {
      expect(brainfuck).toBeDefined();
      expect(typeof brainfuck).toBe("object");
    });

    it("groovy is a StreamParser object", () => {
      expect(groovy).toBeDefined();
      expect(typeof groovy).toBe("object");
    });

    it("scheme is a StreamParser object", () => {
      expect(scheme).toBeDefined();
      expect(typeof scheme).toBe("object");
    });

    it("fortran is a StreamParser object", () => {
      expect(fortran).toBeDefined();
      expect(typeof fortran).toBe("object");
    });

    it("julia is a StreamParser object", () => {
      expect(julia).toBeDefined();
      expect(typeof julia).toBe("object");
    });

    it("tcl is a StreamParser object", () => {
      expect(tcl).toBeDefined();
      expect(typeof tcl).toBe("object");
    });

    it("vb is a StreamParser object", () => {
      expect(vb).toBeDefined();
      expect(typeof vb).toBe("object");
    });

    it("nginx is a StreamParser object", () => {
      expect(nginx).toBeDefined();
      expect(typeof nginx).toBe("object");
    });

    it("powerShell is a StreamParser object", () => {
      expect(powerShell).toBeDefined();
      expect(typeof powerShell).toBe("object");
    });

    it("commonLisp is a StreamParser object", () => {
      expect(commonLisp).toBeDefined();
      expect(typeof commonLisp).toBe("object");
    });
  });

  describe("EditorState integration", () => {
    it("haskell integrates with EditorState", () => {
      const lang = StreamLanguage.define(haskell);
      const state = EditorState.create({
        doc: "main :: IO ()\nmain = putStrLn \"Hello, World!\"",
        extensions: [new LanguageSupport(lang)],
      });
      expect(state.doc.toString()).toContain("putStrLn");
    });

    it("pascal integrates with EditorState", () => {
      const lang = StreamLanguage.define(pascal);
      const state = EditorState.create({
        doc: "program Hello;\nbegin\n  writeln('Hello, World!');\nend.",
        extensions: [new LanguageSupport(lang)],
      });
      expect(state.doc.toString()).toContain("program Hello");
    });

    it("groovy integrates with EditorState", () => {
      const lang = StreamLanguage.define(groovy);
      const state = EditorState.create({
        doc: "def greet(name) { \"Hello, ${name}!\" }\nprintln greet('World')",
        extensions: [new LanguageSupport(lang)],
      });
      expect(state.doc.toString()).toContain("def greet");
    });

    it("scheme integrates with EditorState", () => {
      const lang = StreamLanguage.define(scheme);
      const state = EditorState.create({
        doc: "(define (factorial n)\n  (if (= n 0) 1 (* n (factorial (- n 1)))))",
        extensions: [new LanguageSupport(lang)],
      });
      expect(state.doc.toString()).toContain("factorial");
    });

    it("fortran integrates with EditorState", () => {
      const lang = StreamLanguage.define(fortran);
      const state = EditorState.create({
        doc: "PROGRAM Hello\n  PRINT *, 'Hello, World!'\nEND PROGRAM Hello",
        extensions: [new LanguageSupport(lang)],
      });
      expect(state.doc.toString()).toContain("PROGRAM Hello");
    });

    it("tcl integrates with EditorState", () => {
      const lang = StreamLanguage.define(tcl);
      const state = EditorState.create({
        doc: "proc greet {name} {\n  puts \"Hello, $name!\"\n}\ngreet World",
        extensions: [new LanguageSupport(lang)],
      });
      expect(state.doc.toString()).toContain("proc greet");
    });

    it("nginx integrates with EditorState", () => {
      const lang = StreamLanguage.define(nginx);
      const state = EditorState.create({
        doc: "server {\n  listen 80;\n  server_name example.com;\n}",
        extensions: [new LanguageSupport(lang)],
      });
      expect(state.doc.toString()).toContain("server_name");
    });

    it("powerShell integrates with EditorState", () => {
      const lang = StreamLanguage.define(powerShell);
      const state = EditorState.create({
        doc: "function Get-Greeting { param($Name); \"Hello, $Name!\" }\nGet-Greeting 'World'",
        extensions: [new LanguageSupport(lang)],
      });
      expect(state.doc.toString()).toContain("Get-Greeting");
    });
  });
});
