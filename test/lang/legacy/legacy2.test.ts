import { describe, it, expect } from "bun:test";
import { StreamLanguage, LanguageSupport, syntaxTree } from "../../../src/core/language/index";
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

  describe("syntaxTree integration", () => {
    it("haskell syntaxTree is non-empty", () => {
      const lang = StreamLanguage.define(haskell);
      const state = EditorState.create({
        doc: "main = putStrLn \"Hello\"",
        extensions: [new LanguageSupport(lang)],
      });
      expect(syntaxTree(state).length).toBeGreaterThan(0);
    });

    it("groovy syntaxTree is non-empty", () => {
      const lang = StreamLanguage.define(groovy);
      const state = EditorState.create({
        doc: "def x = 42",
        extensions: [new LanguageSupport(lang)],
      });
      expect(syntaxTree(state).length).toBeGreaterThan(0);
    });

    it("nginx syntaxTree is non-empty", () => {
      const lang = StreamLanguage.define(nginx);
      const state = EditorState.create({
        doc: "server { listen 80; }",
        extensions: [new LanguageSupport(lang)],
      });
      expect(syntaxTree(state).length).toBeGreaterThan(0);
    });

    it("vb syntaxTree is non-empty", () => {
      const lang = StreamLanguage.define(vb);
      const state = EditorState.create({
        doc: "Module Program\n  Sub Main()\n    Console.WriteLine(\"Hello\")\n  End Sub\nEnd Module",
        extensions: [new LanguageSupport(lang)],
      });
      expect(syntaxTree(state).length).toBeGreaterThan(0);
    });

    it("commonLisp syntaxTree is non-empty", () => {
      const lang = StreamLanguage.define(commonLisp);
      const state = EditorState.create({
        doc: "(defun greet (name) (format t \"Hello, ~a!\" name))",
        extensions: [new LanguageSupport(lang)],
      });
      expect(syntaxTree(state).length).toBeGreaterThan(0);
    });

    it("pascal syntaxTree is non-empty", () => {
      const lang = StreamLanguage.define(pascal);
      const state = EditorState.create({
        doc: "program HelloWorld;\nbegin\n  writeln('Hello, World!');\nend.",
        extensions: [new LanguageSupport(lang)],
      });
      expect(syntaxTree(state).length).toBeGreaterThan(0);
    });

    it("scheme syntaxTree is non-empty", () => {
      const lang = StreamLanguage.define(scheme);
      const state = EditorState.create({
        doc: "(define (square x) (* x x))\n(square 5)",
        extensions: [new LanguageSupport(lang)],
      });
      expect(syntaxTree(state).length).toBeGreaterThan(0);
    });

    it("julia syntaxTree is non-empty", () => {
      const lang = StreamLanguage.define(julia);
      const state = EditorState.create({
        doc: "function square(x)\n  return x^2\nend\nprint(square(5))",
        extensions: [new LanguageSupport(lang)],
      });
      expect(syntaxTree(state).length).toBeGreaterThan(0);
    });

    it("fortran syntaxTree is non-empty", () => {
      const lang = StreamLanguage.define(fortran);
      const state = EditorState.create({
        doc: "PROGRAM Hello\n  PRINT *, 'Hello!'\nEND PROGRAM Hello",
        extensions: [new LanguageSupport(lang)],
      });
      expect(syntaxTree(state).length).toBeGreaterThan(0);
    });

    it("powerShell syntaxTree is non-empty", () => {
      const lang = StreamLanguage.define(powerShell);
      const state = EditorState.create({
        doc: "Get-Process | Where-Object { $_.CPU -gt 10 }",
        extensions: [new LanguageSupport(lang)],
      });
      expect(syntaxTree(state).length).toBeGreaterThan(0);
    });

    it("haskell integrates with EditorState", () => {
      const lang = StreamLanguage.define(haskell);
      const state = EditorState.create({
        doc: "module Main where\nimport Data.List (sort)\nmain :: IO ()\nmain = print (sort [3,1,2])",
        extensions: [new LanguageSupport(lang)],
      });
      expect(state.doc.toString()).toContain("module Main");
    });

    it("groovy integrates with EditorState", () => {
      const lang = StreamLanguage.define(groovy);
      const state = EditorState.create({
        doc: "def greet = { name -> \"Hello, $name!\" }\nprintln greet('World')",
        extensions: [new LanguageSupport(lang)],
      });
      expect(state.doc.toString()).toContain("greet");
    });

    it("julia integrates with EditorState", () => {
      const lang = StreamLanguage.define(julia);
      const state = EditorState.create({
        doc: "function fib(n)\n  n <= 1 ? n : fib(n-1) + fib(n-2)\nend\nprintln(fib(10))",
        extensions: [new LanguageSupport(lang)],
      });
      expect(state.doc.toString()).toContain("fib");
    });

    it("haskell doc line count is correct", () => {
      const lang = StreamLanguage.define(haskell);
      const state = EditorState.create({
        doc: "module Main where\nmain = putStrLn \"Hello\"",
        extensions: [new LanguageSupport(lang)],
      });
      expect(state.doc.lines).toBe(2);
    });

    it("scheme doc mutation via transaction works", () => {
      const lang = StreamLanguage.define(scheme);
      let state = EditorState.create({
        doc: "(+ 1 2)",
        extensions: [new LanguageSupport(lang)],
      });
      state = state.update({ changes: { from: 7, insert: "\n(* 3 4)" } }).state;
      expect(state.doc.lines).toBe(2);
    });

    it("brainfuck integrates with EditorState", () => {
      const lang = StreamLanguage.define(brainfuck);
      const state = EditorState.create({
        doc: "++++++++[>++++[>++>+++>+++>+<<<<-]>+>+>->>+[<]<-]>>.>---.+++++++..+++.>>.<-.<.+++.------.--------.>>+.>++.",
        extensions: [new LanguageSupport(lang)],
      });
      expect(state.doc.toString()).toContain("[>++++");
    });

    it("vb integrates with EditorState", () => {
      const lang = StreamLanguage.define(vb);
      const state = EditorState.create({
        doc: "Module Hello\n  Sub Main()\n    Console.WriteLine(\"Hello, World!\")\n  End Sub\nEnd Module",
        extensions: [new LanguageSupport(lang)],
      });
      expect(state.doc.toString()).toContain("Console.WriteLine");
    });

    it("commonLisp integrates with EditorState", () => {
      const lang = StreamLanguage.define(commonLisp);
      const state = EditorState.create({
        doc: "(defun factorial (n)\n  (if (<= n 1) 1\n    (* n (factorial (- n 1)))))",
        extensions: [new LanguageSupport(lang)],
      });
      expect(state.doc.toString()).toContain("factorial");
    });

    it("nginx doc line count is correct", () => {
      const lang = StreamLanguage.define(nginx);
      const state = EditorState.create({
        doc: "http {\n  server {\n    listen 80;\n  }\n}",
        extensions: [new LanguageSupport(lang)],
      });
      expect(state.doc.lines).toBe(5);
    });

    it("pascal doc mutation via transaction works", () => {
      const lang = StreamLanguage.define(pascal);
      let state = EditorState.create({
        doc: "program Test;",
        extensions: [new LanguageSupport(lang)],
      });
      state = state.update({ changes: { from: 13, insert: "\nbegin end." } }).state;
      expect(state.doc.lines).toBe(2);
    });

    it("powerShell doc length is correct", () => {
      const lang = StreamLanguage.define(powerShell);
      const doc = "Write-Host \"Hello, World!\"";
      const state = EditorState.create({ doc, extensions: [new LanguageSupport(lang)] });
      expect(state.doc.length).toBe(doc.length);
    });

    it("haskell doc line count is correct", () => {
      const lang = StreamLanguage.define(haskell);
      const state = EditorState.create({
        doc: "module Main where\nimport Data.List\nmain = putStrLn \"Hello\"",
        extensions: [new LanguageSupport(lang)],
      });
      expect(state.doc.lines).toBe(3);
    });

    it("groovy doc mutation via transaction works", () => {
      const lang = StreamLanguage.define(groovy);
      let state = EditorState.create({
        doc: "println \"hello\"",
        extensions: [new LanguageSupport(lang)],
      });
      state = state.update({ changes: { from: 15, insert: "\nprintln \"world\"" } }).state;
      expect(state.doc.lines).toBe(2);
    });

    it("scheme doc length is correct", () => {
      const lang = StreamLanguage.define(scheme);
      const doc = "(define (fact n) (if (= n 0) 1 (* n (fact (- n 1)))))";
      const state = EditorState.create({ doc, extensions: [new LanguageSupport(lang)] });
      expect(state.doc.length).toBe(doc.length);
    });

    it("julia doc line count is correct", () => {
      const lang = StreamLanguage.define(julia);
      const state = EditorState.create({
        doc: "function greet(name)\n  println(\"Hello, $name!\")\nend",
        extensions: [new LanguageSupport(lang)],
      });
      expect(state.doc.lines).toBe(3);
    });

    it("tcl doc mutation via transaction works", () => {
      const lang = StreamLanguage.define(tcl);
      let state = EditorState.create({
        doc: "puts \"hello\"",
        extensions: [new LanguageSupport(lang)],
      });
      state = state.update({ changes: { from: 12, insert: "\nputs \"world\"" } }).state;
      expect(state.doc.lines).toBe(2);
    });

    it("pascal doc length is correct", () => {
      const lang = StreamLanguage.define(pascal);
      const doc = "program Hello;\nbegin\n  writeln('Hello');\nend.";
      const state = EditorState.create({ doc, extensions: [new LanguageSupport(lang)] });
      expect(state.doc.length).toBe(doc.length);
    });

    it("nginx doc mutation via transaction works", () => {
      const lang = StreamLanguage.define(nginx);
      let state = EditorState.create({ doc: "server {", extensions: [new LanguageSupport(lang)] });
      state = state.update({ changes: { from: 8, insert: "\n  listen 80;\n}" } }).state;
      expect(state.doc.lines).toBe(3);
    });

    it("powerShell doc line text is accessible", () => {
      const lang = StreamLanguage.define(powerShell);
      const state = EditorState.create({
        doc: "Get-Process\nGet-Service",
        extensions: [new LanguageSupport(lang)],
      });
      expect(state.doc.line(1).text).toBe("Get-Process");
    });

    it("commonLisp doc replacement transaction works", () => {
      const lang = StreamLanguage.define(commonLisp);
      let state = EditorState.create({ doc: "(defun foo () nil)", extensions: [new LanguageSupport(lang)] });
      state = state.update({ changes: { from: 8, to: 11, insert: "bar" } }).state;
      expect(state.doc.toString()).toBe("(defun bar () nil)");
    });

    it("vb doc line count is correct", () => {
      const lang = StreamLanguage.define(vb);
      const state = EditorState.create({
        doc: "Module Main\n  Sub Main()\n    Console.WriteLine(\"Hello\")\n  End Sub\nEnd Module",
        extensions: [new LanguageSupport(lang)],
      });
      expect(state.doc.lines).toBe(5);
    });
  });
});
