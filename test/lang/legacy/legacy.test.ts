import { describe, it, expect } from "bun:test";
import { StreamLanguage, LanguageSupport, syntaxTree } from "../../../src/core/language/index";
import { EditorState } from "../../../src/core/state/index";

// Legacy language packs — StreamParser-based
import { shell } from "../../../src/lang/legacy/shell";
import { ruby } from "../../../src/lang/legacy/ruby";
import { lua } from "../../../src/lang/legacy/lua";
import { dockerFile as dockerfile } from "../../../src/lang/legacy/dockerfile";
import { toml } from "../../../src/lang/legacy/toml";
import { erlang } from "../../../src/lang/legacy/erlang";
import { python as legacyPython } from "../../../src/lang/legacy/python";
import { r } from "../../../src/lang/legacy/r";
import { perl } from "../../../src/lang/legacy/perl";
import { swift } from "../../../src/lang/legacy/swift";
import { clojure } from "../../../src/lang/legacy/clojure";
import { coffeeScript } from "../../../src/lang/legacy/coffeescript";

describe("Legacy language packs (StreamLanguage)", () => {
  describe("StreamParser exports", () => {
    it("shell is a StreamParser object", () => {
      expect(shell).toBeDefined();
      expect(typeof shell).toBe("object");
    });

    it("ruby is a StreamParser object", () => {
      expect(ruby).toBeDefined();
      expect(typeof ruby).toBe("object");
    });

    it("lua is a StreamParser object", () => {
      expect(lua).toBeDefined();
      expect(typeof lua).toBe("object");
    });

    it("dockerfile is a StreamParser object", () => {
      expect(dockerfile).toBeDefined();
      expect(typeof dockerfile).toBe("object");
    });

    it("toml is a StreamParser object", () => {
      expect(toml).toBeDefined();
      expect(typeof toml).toBe("object");
    });

    it("erlang is a StreamParser object", () => {
      expect(erlang).toBeDefined();
      expect(typeof erlang).toBe("object");
    });

    it("legacy python is a StreamParser object", () => {
      expect(legacyPython).toBeDefined();
      expect(typeof legacyPython).toBe("object");
    });

    it("r is a StreamParser object", () => {
      expect(r).toBeDefined();
      expect(typeof r).toBe("object");
    });

    it("perl is a StreamParser object", () => {
      expect(perl).toBeDefined();
      expect(typeof perl).toBe("object");
    });

    it("swift is a StreamParser object", () => {
      expect(swift).toBeDefined();
      expect(typeof swift).toBe("object");
    });

    it("clojure is a StreamParser object", () => {
      expect(clojure).toBeDefined();
      expect(typeof clojure).toBe("object");
    });

    it("coffeeScript is a StreamParser object", () => {
      expect(coffeeScript).toBeDefined();
      expect(typeof coffeeScript).toBe("object");
    });
  });

  describe("StreamLanguage.define()", () => {
    it("wraps shell in a LanguageSupport", () => {
      const lang = StreamLanguage.define(shell);
      const support = new LanguageSupport(lang);
      expect(support).toBeInstanceOf(LanguageSupport);
    });

    it("wraps ruby in a LanguageSupport", () => {
      const lang = StreamLanguage.define(ruby);
      const support = new LanguageSupport(lang);
      expect(support).toBeInstanceOf(LanguageSupport);
    });

    it("wraps toml in a LanguageSupport", () => {
      const lang = StreamLanguage.define(toml);
      const support = new LanguageSupport(lang);
      expect(support).toBeInstanceOf(LanguageSupport);
    });
  });

  describe("EditorState integration", () => {
    it("shell language integrates with EditorState", () => {
      const lang = StreamLanguage.define(shell);
      const state = EditorState.create({
        doc: "#!/bin/bash\necho 'Hello, World!'\nfor i in 1 2 3; do\n  echo $i\ndone",
        extensions: [new LanguageSupport(lang)],
      });
      expect(state.doc.toString()).toContain("echo");
    });

    it("ruby language integrates with EditorState", () => {
      const lang = StreamLanguage.define(ruby);
      const state = EditorState.create({
        doc: "def hello\n  puts 'Hello, World!'\nend\nhello",
        extensions: [new LanguageSupport(lang)],
      });
      expect(state.doc.toString()).toContain("def hello");
    });

    it("toml language integrates with EditorState", () => {
      const lang = StreamLanguage.define(toml);
      const state = EditorState.create({
        doc: "[package]\nname = \"my-package\"\nversion = \"1.0.0\"",
        extensions: [new LanguageSupport(lang)],
      });
      expect(state.doc.toString()).toContain("[package]");
    });

    it("dockerfile language integrates with EditorState", () => {
      const lang = StreamLanguage.define(dockerfile);
      const state = EditorState.create({
        doc: "FROM node:18\nWORKDIR /app\nCOPY . .\nRUN npm install\nCMD [\"node\", \"server.js\"]",
        extensions: [new LanguageSupport(lang)],
      });
      expect(state.doc.toString()).toContain("FROM node:18");
    });

    it("legacy python integrates with EditorState", () => {
      const lang = StreamLanguage.define(legacyPython);
      const state = EditorState.create({
        doc: "def hello():\n    print('Hello')\nhello()",
        extensions: [new LanguageSupport(lang)],
      });
      expect(state.doc.toString()).toContain("def hello");
    });

    it("r language integrates with EditorState", () => {
      const lang = StreamLanguage.define(r);
      const state = EditorState.create({
        doc: "x <- c(1, 2, 3)\nprint(mean(x))",
        extensions: [new LanguageSupport(lang)],
      });
      expect(state.doc.toString()).toContain("x <- c(1, 2, 3)");
    });

    it("swift language integrates with EditorState", () => {
      const lang = StreamLanguage.define(swift);
      const state = EditorState.create({
        doc: "func greet(name: String) -> String {\n    return \"Hello, \\(name)!\"\n}",
        extensions: [new LanguageSupport(lang)],
      });
      expect(state.doc.toString()).toContain("func greet");
    });
  });

  describe("syntaxTree integration", () => {
    it("shell syntaxTree is non-empty", () => {
      const lang = StreamLanguage.define(shell);
      const state = EditorState.create({
        doc: "#!/bin/bash\necho hello",
        extensions: [new LanguageSupport(lang)],
      });
      const tree = syntaxTree(state);
      expect(tree.length).toBeGreaterThan(0);
    });

    it("ruby syntaxTree is non-empty", () => {
      const lang = StreamLanguage.define(ruby);
      const state = EditorState.create({
        doc: "def hello\n  puts 'hi'\nend",
        extensions: [new LanguageSupport(lang)],
      });
      const tree = syntaxTree(state);
      expect(tree.length).toBeGreaterThan(0);
    });

    it("toml syntaxTree is non-empty", () => {
      const lang = StreamLanguage.define(toml);
      const state = EditorState.create({
        doc: "[package]\nname = \"test\"",
        extensions: [new LanguageSupport(lang)],
      });
      const tree = syntaxTree(state);
      expect(tree.length).toBeGreaterThan(0);
    });

    it("lua syntaxTree is non-empty", () => {
      const lang = StreamLanguage.define(lua);
      const state = EditorState.create({
        doc: "function add(a, b) return a + b end",
        extensions: [new LanguageSupport(lang)],
      });
      const tree = syntaxTree(state);
      expect(tree.length).toBeGreaterThan(0);
    });

    it("perl syntaxTree is non-empty", () => {
      const lang = StreamLanguage.define(perl);
      const state = EditorState.create({
        doc: "sub greet { my $name = shift; return \"Hello, $name!\"; }",
        extensions: [new LanguageSupport(lang)],
      });
      const tree = syntaxTree(state);
      expect(tree.length).toBeGreaterThan(0);
    });

    it("StreamLanguage.define creates a language with a parser", () => {
      const lang = StreamLanguage.define(shell);
      expect(lang.parser).toBeDefined();
    });

    it("multiple StreamLanguage wrappings are independent", () => {
      const shellLang = StreamLanguage.define(shell);
      const rubyLang = StreamLanguage.define(ruby);
      expect(shellLang).not.toBe(rubyLang);
      expect(typeof shellLang.name).toBe("string");
    });

    it("erlang integrates with EditorState", () => {
      const lang = StreamLanguage.define(erlang);
      const state = EditorState.create({
        doc: "-module(hello).\n-export([greet/1]).\ngreet(Name) -> io:format(\"Hello ~s!~n\", [Name]).",
        extensions: [new LanguageSupport(lang)],
      });
      expect(state.doc.toString()).toContain("-module");
    });

    it("lua integrates with EditorState", () => {
      const lang = StreamLanguage.define(lua);
      const state = EditorState.create({
        doc: "function factorial(n)\n  if n == 0 then return 1 end\n  return n * factorial(n-1)\nend",
        extensions: [new LanguageSupport(lang)],
      });
      expect(state.doc.toString()).toContain("factorial");
    });

    it("clojure integrates with EditorState", () => {
      const lang = StreamLanguage.define(clojure);
      const state = EditorState.create({
        doc: "(defn greet [name]\n  (str \"Hello, \" name \"!\"))\n(println (greet \"World\"))",
        extensions: [new LanguageSupport(lang)],
      });
      expect(state.doc.toString()).toContain("defn greet");
    });

    it("coffeeScript integrates with EditorState", () => {
      const lang = StreamLanguage.define(coffeeScript);
      const state = EditorState.create({
        doc: "square = (x) -> x * x\ncube = (x) -> x * square x\nconsole.log cube 3",
        extensions: [new LanguageSupport(lang)],
      });
      expect(state.doc.toString()).toContain("square");
    });

    it("shell doc line count is correct", () => {
      const lang = StreamLanguage.define(shell);
      const state = EditorState.create({
        doc: "#!/bin/bash\necho hello\necho world",
        extensions: [new LanguageSupport(lang)],
      });
      expect(state.doc.lines).toBe(3);
    });

    it("ruby doc mutation via transaction works", () => {
      const lang = StreamLanguage.define(ruby);
      let state = EditorState.create({
        doc: "puts 'hello'",
        extensions: [new LanguageSupport(lang)],
      });
      state = state.update({ changes: { from: 12, insert: "\nputs 'world'" } }).state;
      expect(state.doc.lines).toBe(2);
    });

    it("erlang syntaxTree is non-empty", () => {
      const lang = StreamLanguage.define(erlang);
      const state = EditorState.create({
        doc: "-module(counter).\ncounter(N) -> receive inc -> counter(N+1) end.",
        extensions: [new LanguageSupport(lang)],
      });
      expect(syntaxTree(state).length).toBeGreaterThan(0);
    });

    it("lua syntaxTree is non-empty", () => {
      const lang = StreamLanguage.define(lua);
      const state = EditorState.create({
        doc: "local t = {1, 2, 3}\nfor i, v in ipairs(t) do\n  print(i, v)\nend",
        extensions: [new LanguageSupport(lang)],
      });
      expect(syntaxTree(state).length).toBeGreaterThan(0);
    });

    it("clojure syntaxTree is non-empty", () => {
      const lang = StreamLanguage.define(clojure);
      const state = EditorState.create({
        doc: "(ns my.app)\n(defn square [x] (* x x))\n(map square [1 2 3 4 5])",
        extensions: [new LanguageSupport(lang)],
      });
      expect(syntaxTree(state).length).toBeGreaterThan(0);
    });

    it("coffeescript syntaxTree is non-empty", () => {
      const lang = StreamLanguage.define(coffeeScript);
      const state = EditorState.create({
        doc: "class Animal\n  constructor: (@name) ->\n  speak: -> \"#{@name} makes a sound\"",
        extensions: [new LanguageSupport(lang)],
      });
      expect(syntaxTree(state).length).toBeGreaterThan(0);
    });

    it("shell doc length is correct", () => {
      const lang = StreamLanguage.define(shell);
      const doc = "echo hello";
      const state = EditorState.create({
        doc,
        extensions: [new LanguageSupport(lang)],
      });
      expect(state.doc.length).toBe(doc.length);
    });
  });
});
