import { describe, it, expect } from "bun:test";
import { StreamLanguage, LanguageSupport } from "../../../src/core/language/index";
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
});
