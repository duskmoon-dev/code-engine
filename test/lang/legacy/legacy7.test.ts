import { describe, it, expect } from "bun:test";
import { StreamLanguage, LanguageSupport, syntaxTree } from "../../../src/core/language/index";
import { EditorState } from "../../../src/core/state/index";

import { asciiArmor } from "../../../src/lang/legacy/asciiarmor";
import { asn1 } from "../../../src/lang/legacy/asn1";
import { clike, csharp, kotlin, scala } from "../../../src/lang/legacy/clike";
import { d } from "../../../src/lang/legacy/d";
import { dtd } from "../../../src/lang/legacy/dtd";
import { haxe } from "../../../src/lang/legacy/haxe";
import { mscgen } from "../../../src/lang/legacy/mscgen";
import { stylus } from "../../../src/lang/legacy/stylus";
import { tiddlyWiki } from "../../../src/lang/legacy/tiddlywiki";
import { z80 } from "../../../src/lang/legacy/z80";
import { velocity } from "../../../src/lang/legacy/velocity";
import { vbScript } from "../../../src/lang/legacy/vbscript";

describe("Legacy language packs (batch 7)", () => {
  describe("StreamParser exports", () => {
    it("asciiArmor is a StreamParser object", () => {
      expect(asciiArmor).toBeDefined();
      expect(typeof asciiArmor).toBe("object");
    });

    it("asn1 is defined (factory function)", () => {
      expect(asn1).toBeDefined();
    });

    it("clike is defined (factory function)", () => {
      expect(clike).toBeDefined();
    });

    it("csharp (from clike) is a StreamParser object", () => {
      expect(csharp).toBeDefined();
      expect(typeof csharp).toBe("object");
    });

    it("kotlin (from clike) is a StreamParser object", () => {
      expect(kotlin).toBeDefined();
      expect(typeof kotlin).toBe("object");
    });

    it("scala (from clike) is a StreamParser object", () => {
      expect(scala).toBeDefined();
      expect(typeof scala).toBe("object");
    });

    it("d is a StreamParser object", () => {
      expect(d).toBeDefined();
      expect(typeof d).toBe("object");
    });

    it("dtd is a StreamParser object", () => {
      expect(dtd).toBeDefined();
      expect(typeof dtd).toBe("object");
    });

    it("haxe is a StreamParser object", () => {
      expect(haxe).toBeDefined();
      expect(typeof haxe).toBe("object");
    });

    it("mscgen is a StreamParser object", () => {
      expect(mscgen).toBeDefined();
      expect(typeof mscgen).toBe("object");
    });

    it("stylus is a StreamParser object", () => {
      expect(stylus).toBeDefined();
      expect(typeof stylus).toBe("object");
    });

    it("tiddlyWiki is a StreamParser object", () => {
      expect(tiddlyWiki).toBeDefined();
      expect(typeof tiddlyWiki).toBe("object");
    });

    it("z80 is a StreamParser object", () => {
      expect(z80).toBeDefined();
      expect(typeof z80).toBe("object");
    });

    it("velocity is a StreamParser object", () => {
      expect(velocity).toBeDefined();
      expect(typeof velocity).toBe("object");
    });

    it("vbScript is a StreamParser object", () => {
      expect(vbScript).toBeDefined();
      expect(typeof vbScript).toBe("object");
    });
  });

  describe("EditorState integration", () => {
    it("csharp integrates with EditorState", () => {
      const lang = StreamLanguage.define(csharp);
      const state = EditorState.create({
        doc: "using System;\nclass Program {\n  static void Main() {\n    Console.WriteLine(\"Hello, World!\");\n  }\n}",
        extensions: [new LanguageSupport(lang)],
      });
      expect(state.doc.toString()).toContain("class Program");
    });

    it("kotlin integrates with EditorState", () => {
      const lang = StreamLanguage.define(kotlin);
      const state = EditorState.create({
        doc: "fun main() {\n    println(\"Hello, World!\")\n}",
        extensions: [new LanguageSupport(lang)],
      });
      expect(state.doc.toString()).toContain("fun main");
    });

    it("scala integrates with EditorState", () => {
      const lang = StreamLanguage.define(scala);
      const state = EditorState.create({
        doc: "object Hello extends App {\n  println(\"Hello, World!\")\n}",
        extensions: [new LanguageSupport(lang)],
      });
      expect(state.doc.toString()).toContain("object Hello");
    });

    it("d integrates with EditorState", () => {
      const lang = StreamLanguage.define(d);
      const state = EditorState.create({
        doc: "import std.stdio;\nvoid main() {\n    writeln(\"Hello, World!\");\n}",
        extensions: [new LanguageSupport(lang)],
      });
      expect(state.doc.toString()).toContain("import std.stdio");
    });

    it("haxe integrates with EditorState", () => {
      const lang = StreamLanguage.define(haxe);
      const state = EditorState.create({
        doc: "class Main {\n  static function main() {\n    trace(\"Hello, World!\");\n  }\n}",
        extensions: [new LanguageSupport(lang)],
      });
      expect(state.doc.toString()).toContain("class Main");
    });

    it("stylus integrates with EditorState", () => {
      const lang = StreamLanguage.define(stylus);
      const state = EditorState.create({
        doc: "body\n  font-size 16px\n  color #333\n\nh1\n  font-weight bold",
        extensions: [new LanguageSupport(lang)],
      });
      expect(state.doc.toString()).toContain("font-size");
    });

    it("velocity integrates with EditorState", () => {
      const lang = StreamLanguage.define(velocity);
      const state = EditorState.create({
        doc: "#set( $name = \"World\" )\nHello, ${name}!\n#foreach( $item in $list )\n  $item\n#end",
        extensions: [new LanguageSupport(lang)],
      });
      expect(state.doc.toString()).toContain("#set");
    });
  });

  describe("syntaxTree integration", () => {
    it("csharp syntaxTree is non-empty", () => {
      const lang = StreamLanguage.define(csharp);
      const state = EditorState.create({
        doc: "class Foo { }",
        extensions: [new LanguageSupport(lang)],
      });
      expect(syntaxTree(state).length).toBeGreaterThan(0);
    });

    it("kotlin syntaxTree is non-empty", () => {
      const lang = StreamLanguage.define(kotlin);
      const state = EditorState.create({
        doc: "fun main() { println(\"Hello\") }",
        extensions: [new LanguageSupport(lang)],
      });
      expect(syntaxTree(state).length).toBeGreaterThan(0);
    });

    it("scala syntaxTree is non-empty", () => {
      const lang = StreamLanguage.define(scala);
      const state = EditorState.create({
        doc: "object Hello extends App { println(\"Hello\") }",
        extensions: [new LanguageSupport(lang)],
      });
      expect(syntaxTree(state).length).toBeGreaterThan(0);
    });

    it("haxe syntaxTree is non-empty", () => {
      const lang = StreamLanguage.define(haxe);
      const state = EditorState.create({
        doc: "class Main { static function main() { trace(\"Hello\"); } }",
        extensions: [new LanguageSupport(lang)],
      });
      expect(syntaxTree(state).length).toBeGreaterThan(0);
    });

    it("stylus syntaxTree is non-empty", () => {
      const lang = StreamLanguage.define(stylus);
      const state = EditorState.create({
        doc: "body\n  color red",
        extensions: [new LanguageSupport(lang)],
      });
      expect(syntaxTree(state).length).toBeGreaterThan(0);
    });

    it("asciiArmor syntaxTree is non-empty", () => {
      const lang = StreamLanguage.define(asciiArmor);
      const state = EditorState.create({
        doc: "-----BEGIN PGP MESSAGE-----\nVersion: GnuPG v2\n\nhQIMA\n-----END PGP MESSAGE-----",
        extensions: [new LanguageSupport(lang)],
      });
      expect(syntaxTree(state).length).toBeGreaterThan(0);
    });

    it("d syntaxTree is non-empty", () => {
      const lang = StreamLanguage.define(d);
      const state = EditorState.create({
        doc: "import std.stdio;\nvoid main() { writeln(\"Hello\"); }",
        extensions: [new LanguageSupport(lang)],
      });
      expect(syntaxTree(state).length).toBeGreaterThan(0);
    });

    it("mscgen syntaxTree is non-empty", () => {
      const lang = StreamLanguage.define(mscgen);
      const state = EditorState.create({
        doc: "msc { a, b; a->b [label=\"request\"]; b->a [label=\"response\"]; }",
        extensions: [new LanguageSupport(lang)],
      });
      expect(syntaxTree(state).length).toBeGreaterThan(0);
    });

    it("z80 syntaxTree is non-empty", () => {
      const lang = StreamLanguage.define(z80);
      const state = EditorState.create({
        doc: "LD A, 0\nLD B, 10\nLOOP: DJNZ LOOP\nRET",
        extensions: [new LanguageSupport(lang)],
      });
      expect(syntaxTree(state).length).toBeGreaterThan(0);
    });

    it("velocity syntaxTree is non-empty", () => {
      const lang = StreamLanguage.define(velocity);
      const state = EditorState.create({
        doc: "#set ($greeting = \"Hello\")\n$greeting, World!",
        extensions: [new LanguageSupport(lang)],
      });
      expect(syntaxTree(state).length).toBeGreaterThan(0);
    });

    it("vbScript syntaxTree is non-empty", () => {
      const lang = StreamLanguage.define(vbScript);
      const state = EditorState.create({
        doc: "Dim x\nx = 42\nMsgBox \"Value: \" & x",
        extensions: [new LanguageSupport(lang)],
      });
      expect(syntaxTree(state).length).toBeGreaterThan(0);
    });

    it("csharp integrates with EditorState", () => {
      const lang = StreamLanguage.define(csharp);
      const state = EditorState.create({
        doc: "using System;\nclass Hello {\n  static void Main() {\n    Console.WriteLine(\"Hello, World!\");\n  }\n}",
        extensions: [new LanguageSupport(lang)],
      });
      expect(state.doc.toString()).toContain("Console.WriteLine");
    });

    it("kotlin integrates with EditorState", () => {
      const lang = StreamLanguage.define(kotlin);
      const state = EditorState.create({
        doc: "fun main() {\n  val greeting = \"Hello, World!\"\n  println(greeting)\n}",
        extensions: [new LanguageSupport(lang)],
      });
      expect(state.doc.toString()).toContain("fun main");
    });

    it("scala integrates with EditorState", () => {
      const lang = StreamLanguage.define(scala);
      const state = EditorState.create({
        doc: "object Hello extends App {\n  println(\"Hello, World!\")\n}",
        extensions: [new LanguageSupport(lang)],
      });
      expect(state.doc.toString()).toContain("object Hello");
    });

    it("csharp doc line count is correct", () => {
      const lang = StreamLanguage.define(csharp);
      const state = EditorState.create({
        doc: "namespace App {\n  class Foo {}\n  class Bar {}\n}",
        extensions: [new LanguageSupport(lang)],
      });
      expect(state.doc.lines).toBe(4);
    });

    it("kotlin doc mutation via transaction works", () => {
      const lang = StreamLanguage.define(kotlin);
      let state = EditorState.create({
        doc: "val x = 1",
        extensions: [new LanguageSupport(lang)],
      });
      state = state.update({ changes: { from: 9, insert: "\nval y = 2" } }).state;
      expect(state.doc.lines).toBe(2);
    });

    it("csharp syntaxTree cursor traversal finds nodes", () => {
      const lang = StreamLanguage.define(csharp);
      const state = EditorState.create({
        doc: "class Foo { int x = 1; void Bar() { x++; } }",
        extensions: [new LanguageSupport(lang)],
      });
      const tree = syntaxTree(state);
      const cursor = tree.cursor();
      let count = 0;
      do { count++; } while (cursor.next() && count < 50);
      expect(count).toBeGreaterThan(0);
    });

    it("scala doc line count is correct", () => {
      const lang = StreamLanguage.define(scala);
      const state = EditorState.create({
        doc: "object App extends App {\n  val x = 1\n  println(x)\n}",
        extensions: [new LanguageSupport(lang)],
      });
      expect(state.doc.lines).toBe(4);
    });

    it("haxe integrates with EditorState", () => {
      const lang = StreamLanguage.define(haxe);
      const state = EditorState.create({
        doc: "class Main { static function main() { trace(\"Hello, World!\"); } }",
        extensions: [new LanguageSupport(lang)],
      });
      expect(state.doc.toString()).toContain("trace");
    });

    it("vbScript integrates with EditorState", () => {
      const lang = StreamLanguage.define(vbScript);
      const state = EditorState.create({
        doc: "Dim x\nx = 42\nMsgBox \"Value: \" & x",
        extensions: [new LanguageSupport(lang)],
      });
      expect(state.doc.toString()).toContain("MsgBox");
    });

    it("d integrates with EditorState", () => {
      const lang = StreamLanguage.define(d);
      const state = EditorState.create({
        doc: "import std.stdio;\nvoid main() {\n  writeln(\"Hello, World!\");\n}",
        extensions: [new LanguageSupport(lang)],
      });
      expect(state.doc.toString()).toContain("writeln");
    });

    it("stylus doc length is correct", () => {
      const lang = StreamLanguage.define(stylus);
      const doc = "body\n  color red\n  font-size 16px";
      const state = EditorState.create({ doc, extensions: [new LanguageSupport(lang)] });
      expect(state.doc.length).toBe(doc.length);
    });

    it("csharp doc line count is correct", () => {
      const lang = StreamLanguage.define(csharp);
      const state = EditorState.create({
        doc: "using System;\nnamespace Hello {\n  class Program {\n    static void Main() {}\n  }\n}",
        extensions: [new LanguageSupport(lang)],
      });
      expect(state.doc.lines).toBe(6);
    });

    it("kotlin doc mutation via transaction works", () => {
      const lang = StreamLanguage.define(kotlin);
      let state = EditorState.create({ doc: "fun main() {}", extensions: [new LanguageSupport(lang)] });
      state = state.update({ changes: { from: 13, insert: "\nfun helper() {}" } }).state;
      expect(state.doc.lines).toBe(2);
    });

    it("haxe doc line text is accessible", () => {
      const lang = StreamLanguage.define(haxe);
      const state = EditorState.create({
        doc: "class Main {\n  static public function main() {}\n}",
        extensions: [new LanguageSupport(lang)],
      });
      expect(state.doc.line(1).text).toBe("class Main {");
    });

    it("velocity doc replacement transaction works", () => {
      const lang = StreamLanguage.define(velocity);
      let state = EditorState.create({ doc: "#set( $name = 'World' )", extensions: [new LanguageSupport(lang)] });
      state = state.update({ changes: { from: 14, to: 21, insert: "'Claude'" } }).state;
      expect(state.doc.toString()).toBe("#set( $name = 'Claude' )");
    });

    it("dtd doc length is correct", () => {
      const lang = StreamLanguage.define(dtd);
      const doc = "<!ELEMENT note (to, from, body)>";
      const state = EditorState.create({ doc, extensions: [new LanguageSupport(lang)] });
      expect(state.doc.length).toBe(doc.length);
    });

    it("scala doc line count is correct", () => {
      const lang = StreamLanguage.define(scala);
      const state = EditorState.create({
        doc: "object Hello {\n  def main(args: Array[String]) {\n    println(\"Hello, World!\")\n  }\n}",
        extensions: [new LanguageSupport(lang)],
      });
      expect(state.doc.lines).toBe(5);
    });

    it("csharp doc mutation via transaction works", () => {
      const lang = StreamLanguage.define(csharp);
      let state = EditorState.create({ doc: "int x = 1;", extensions: [new LanguageSupport(lang)] });
      state = state.update({ changes: { from: 10, insert: "\nint y = 2;" } }).state;
      expect(state.doc.lines).toBe(2);
    });

    it("asn1 is defined and truthy", () => {
      expect(asn1).toBeDefined();
      expect(!!asn1).toBe(true);
    });

    it("vbScript doc replacement transaction works", () => {
      const lang = StreamLanguage.define(vbScript);
      let state = EditorState.create({ doc: "Dim x As Integer", extensions: [new LanguageSupport(lang)] });
      state = state.update({ changes: { from: 4, to: 5, insert: "y" } }).state;
      expect(state.doc.toString()).toBe("Dim y As Integer");
    });

    it("tiddlyWiki doc length is correct", () => {
      const lang = StreamLanguage.define(tiddlyWiki);
      const doc = "! Title\n\n''bold'' and //italic//";
      const state = EditorState.create({ doc, extensions: [new LanguageSupport(lang)] });
      expect(state.doc.length).toBe(doc.length);
    });

    it("haxe doc allows sequential transactions", () => {
      const lang = StreamLanguage.define(haxe);
      let state = EditorState.create({ doc: "class Main {", extensions: [new LanguageSupport(lang)] });
      state = state.update({ changes: { from: 12, insert: "\n  static function main() {}" } }).state;
      state = state.update({ changes: { from: state.doc.length, insert: "\n}" } }).state;
      expect(state.doc.lines).toBe(3);
    });
  });
});
