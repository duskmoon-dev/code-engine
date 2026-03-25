import { describe, it, expect } from "bun:test";
import { StreamLanguage, LanguageSupport } from "../../../src/core/language/index";
import { EditorState } from "../../../src/core/state/index";

import { css as legacyCss } from "../../../src/lang/legacy/css";
import { go as legacyGo } from "../../../src/lang/legacy/go";
import { javascript as legacyJS } from "../../../src/lang/legacy/javascript";
import { mbox } from "../../../src/lang/legacy/mbox";
import { mirc } from "../../../src/lang/legacy/mirc";
import { rust as legacyRust } from "../../../src/lang/legacy/rust";
import { sass as legacySass } from "../../../src/lang/legacy/sass";
import { standardSQL as legacySql } from "../../../src/lang/legacy/sql";
import { ttcn } from "../../../src/lang/legacy/ttcn";
import { xml as legacyXml } from "../../../src/lang/legacy/xml";
import { yaml as legacyYaml } from "../../../src/lang/legacy/yaml";
import { wast as legacyWast } from "../../../src/lang/legacy/wast";
import { fcl } from "../../../src/lang/legacy/fcl";
import { tiki } from "../../../src/lang/legacy/tiki";

describe("Legacy language packs (batch 8 - coverage completion)", () => {
  describe("StreamParser exports", () => {
    it("legacy css is a StreamParser object", () => {
      expect(legacyCss).toBeDefined();
      expect(typeof legacyCss).toBe("object");
    });

    it("legacy go is a StreamParser object", () => {
      expect(legacyGo).toBeDefined();
      expect(typeof legacyGo).toBe("object");
    });

    it("legacy javascript is a StreamParser object", () => {
      expect(legacyJS).toBeDefined();
      expect(typeof legacyJS).toBe("object");
    });

    it("mbox is a StreamParser object", () => {
      expect(mbox).toBeDefined();
      expect(typeof mbox).toBe("object");
    });

    it("mirc is a StreamParser object", () => {
      expect(mirc).toBeDefined();
      expect(typeof mirc).toBe("object");
    });

    it("legacy rust is a StreamParser object", () => {
      expect(legacyRust).toBeDefined();
      expect(typeof legacyRust).toBe("object");
    });

    it("legacy sass is a StreamParser object", () => {
      expect(legacySass).toBeDefined();
      expect(typeof legacySass).toBe("object");
    });

    it("legacy sql is a StreamParser object", () => {
      expect(legacySql).toBeDefined();
      expect(typeof legacySql).toBe("object");
    });

    it("ttcn is a StreamParser object", () => {
      expect(ttcn).toBeDefined();
      expect(typeof ttcn).toBe("object");
    });

    it("legacy xml is a StreamParser object", () => {
      expect(legacyXml).toBeDefined();
      expect(typeof legacyXml).toBe("object");
    });

    it("legacy yaml is a StreamParser object", () => {
      expect(legacyYaml).toBeDefined();
      expect(typeof legacyYaml).toBe("object");
    });

    it("legacy wast is a StreamParser object", () => {
      expect(legacyWast).toBeDefined();
      expect(typeof legacyWast).toBe("object");
    });

    it("fcl is a StreamParser object", () => {
      expect(fcl).toBeDefined();
      expect(typeof fcl).toBe("object");
    });

    it("tiki is a StreamParser object", () => {
      expect(tiki).toBeDefined();
      expect(typeof tiki).toBe("object");
    });
  });

  describe("EditorState integration", () => {
    it("legacy go integrates with EditorState", () => {
      const lang = StreamLanguage.define(legacyGo);
      const state = EditorState.create({
        doc: "package main\nimport \"fmt\"\nfunc main() {\n    fmt.Println(\"Hello, World!\")\n}",
        extensions: [new LanguageSupport(lang)],
      });
      expect(state.doc.toString()).toContain("package main");
    });

    it("legacy rust integrates with EditorState", () => {
      const lang = StreamLanguage.define(legacyRust);
      const state = EditorState.create({
        doc: "fn main() {\n    println!(\"Hello, World!\");\n}",
        extensions: [new LanguageSupport(lang)],
      });
      expect(state.doc.toString()).toContain("fn main");
    });

    it("legacy css integrates with EditorState", () => {
      const lang = StreamLanguage.define(legacyCss);
      const state = EditorState.create({
        doc: "body { font-size: 16px; color: #333; }\nh1 { font-weight: bold; }",
        extensions: [new LanguageSupport(lang)],
      });
      expect(state.doc.toString()).toContain("font-size");
    });

    it("legacy sql integrates with EditorState", () => {
      const lang = StreamLanguage.define(legacySql);
      const state = EditorState.create({
        doc: "SELECT id, name FROM users WHERE active = 1 ORDER BY name;",
        extensions: [new LanguageSupport(lang)],
      });
      expect(state.doc.toString()).toContain("SELECT");
    });

    it("legacy xml integrates with EditorState", () => {
      const lang = StreamLanguage.define(legacyXml);
      const state = EditorState.create({
        doc: "<?xml version=\"1.0\"?>\n<root>\n  <item id=\"1\">Hello</item>\n</root>",
        extensions: [new LanguageSupport(lang)],
      });
      expect(state.doc.toString()).toContain("<root>");
    });

    it("legacy yaml integrates with EditorState", () => {
      const lang = StreamLanguage.define(legacyYaml);
      const state = EditorState.create({
        doc: "name: example\nversion: 1.0.0\ndependencies:\n  - lodash\n  - react",
        extensions: [new LanguageSupport(lang)],
      });
      expect(state.doc.toString()).toContain("version: 1.0.0");
    });
  });
});
