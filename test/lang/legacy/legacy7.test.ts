import { describe, it, expect } from "bun:test";
import { StreamLanguage, LanguageSupport } from "../../../src/core/language/index";
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
});
