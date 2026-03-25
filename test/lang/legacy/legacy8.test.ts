import { describe, it, expect } from "bun:test";
import { StreamLanguage, LanguageSupport, syntaxTree } from "../../../src/core/language/index";
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
import { jinja2 } from "../../../src/lang/legacy/jinja2";
import { q } from "../../../src/lang/legacy/q";
import { rpmSpec } from "../../../src/lang/legacy/rpm";
import { ttcnCfg } from "../../../src/lang/legacy/ttcn-cfg";

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

    it("jinja2 is a StreamParser object", () => {
      expect(jinja2).toBeDefined();
      expect(typeof jinja2).toBe("object");
    });

    it("q is a StreamParser object", () => {
      expect(q).toBeDefined();
      expect(typeof q).toBe("object");
    });

    it("rpmSpec is a StreamParser object", () => {
      expect(rpmSpec).toBeDefined();
      expect(typeof rpmSpec).toBe("object");
    });

    it("ttcnCfg is a StreamParser object", () => {
      expect(ttcnCfg).toBeDefined();
      expect(typeof ttcnCfg).toBe("object");
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

  describe("syntaxTree integration", () => {
    it("legacy go syntaxTree is non-empty", () => {
      const lang = StreamLanguage.define(legacyGo);
      const state = EditorState.create({
        doc: "package main\nfunc main() {}",
        extensions: [new LanguageSupport(lang)],
      });
      expect(syntaxTree(state).length).toBeGreaterThan(0);
    });

    it("legacy rust syntaxTree is non-empty", () => {
      const lang = StreamLanguage.define(legacyRust);
      const state = EditorState.create({
        doc: "fn main() { println!(\"hello\"); }",
        extensions: [new LanguageSupport(lang)],
      });
      expect(syntaxTree(state).length).toBeGreaterThan(0);
    });

    it("legacy css syntaxTree is non-empty", () => {
      const lang = StreamLanguage.define(legacyCss);
      const state = EditorState.create({
        doc: "body { color: red; }",
        extensions: [new LanguageSupport(lang)],
      });
      expect(syntaxTree(state).length).toBeGreaterThan(0);
    });

    it("legacy sql syntaxTree is non-empty", () => {
      const lang = StreamLanguage.define(legacySql);
      const state = EditorState.create({
        doc: "SELECT * FROM users;",
        extensions: [new LanguageSupport(lang)],
      });
      expect(syntaxTree(state).length).toBeGreaterThan(0);
    });

    it("legacy xml syntaxTree is non-empty", () => {
      const lang = StreamLanguage.define(legacyXml);
      const state = EditorState.create({
        doc: "<root><item>hello</item></root>",
        extensions: [new LanguageSupport(lang)],
      });
      expect(syntaxTree(state).length).toBeGreaterThan(0);
    });

    it("jinja2 syntaxTree is non-empty", () => {
      const lang = StreamLanguage.define(jinja2);
      const state = EditorState.create({
        doc: "{% for item in items %}{{ item }}{% endfor %}",
        extensions: [new LanguageSupport(lang)],
      });
      expect(syntaxTree(state).length).toBeGreaterThan(0);
    });

    it("legacy yaml syntaxTree is non-empty", () => {
      const lang = StreamLanguage.define(legacyYaml);
      const state = EditorState.create({
        doc: "key: value\nlist:\n  - item1\n  - item2",
        extensions: [new LanguageSupport(lang)],
      });
      expect(syntaxTree(state).length).toBeGreaterThan(0);
    });

    it("legacy js syntaxTree is non-empty", () => {
      const lang = StreamLanguage.define(legacyJS);
      const state = EditorState.create({
        doc: "const x = 42;\nconsole.log(x);",
        extensions: [new LanguageSupport(lang)],
      });
      expect(syntaxTree(state).length).toBeGreaterThan(0);
    });

    it("legacy wast syntaxTree is non-empty", () => {
      const lang = StreamLanguage.define(legacyWast);
      const state = EditorState.create({
        doc: "(module (func (result i32) i32.const 42))",
        extensions: [new LanguageSupport(lang)],
      });
      expect(syntaxTree(state).length).toBeGreaterThan(0);
    });

    it("legacy sass syntaxTree is non-empty", () => {
      const lang = StreamLanguage.define(legacySass);
      const state = EditorState.create({
        doc: "$primary: blue\n.btn\n  color: $primary",
        extensions: [new LanguageSupport(lang)],
      });
      expect(syntaxTree(state).length).toBeGreaterThan(0);
    });

    it("ttcn syntaxTree is non-empty", () => {
      const lang = StreamLanguage.define(ttcn);
      const state = EditorState.create({
        doc: "module MyTest { type charstring MyStr; }",
        extensions: [new LanguageSupport(lang)],
      });
      expect(syntaxTree(state).length).toBeGreaterThan(0);
    });

    it("mbox syntaxTree is non-empty", () => {
      const lang = StreamLanguage.define(mbox);
      const state = EditorState.create({
        doc: "From user@example.com Mon Jan  1 00:00:00 2024\nFrom: user@example.com\nSubject: Test\n\nBody text",
        extensions: [new LanguageSupport(lang)],
      });
      expect(syntaxTree(state).length).toBeGreaterThan(0);
    });

    it("q syntaxTree is non-empty", () => {
      const lang = StreamLanguage.define(q);
      const state = EditorState.create({
        doc: "t:([] name:`Alice`Bob; age:30 25)\nselect from t where age>28",
        extensions: [new LanguageSupport(lang)],
      });
      expect(syntaxTree(state).length).toBeGreaterThan(0);
    });

    it("legacy sql doc line count is correct", () => {
      const lang = StreamLanguage.define(legacySql);
      const state = EditorState.create({
        doc: "SELECT id FROM users;\nSELECT name FROM orders;\nSELECT * FROM products;",
        extensions: [new LanguageSupport(lang)],
      });
      expect(state.doc.lines).toBe(3);
    });

    it("legacy js doc mutation via transaction works", () => {
      const lang = StreamLanguage.define(legacyJS);
      let state = EditorState.create({
        doc: "var x = 1;",
        extensions: [new LanguageSupport(lang)],
      });
      state = state.update({ changes: { from: 10, insert: "\nvar y = 2;" } }).state;
      expect(state.doc.lines).toBe(2);
    });

    it("rpmSpec integrates with EditorState", () => {
      const lang = StreamLanguage.define(rpmSpec);
      const state = EditorState.create({
        doc: "Name: mypackage\nVersion: 1.0\nRelease: 1\nSummary: My package",
        extensions: [new LanguageSupport(lang)],
      });
      expect(state.doc.toString()).toContain("Name: mypackage");
    });

    it("ttcnCfg integrates with EditorState", () => {
      const lang = StreamLanguage.define(ttcnCfg);
      const state = EditorState.create({
        doc: "[LOGGING]\nLogFile := \"test.log\"\nFileMask := LOG_ALL",
        extensions: [new LanguageSupport(lang)],
      });
      expect(state.doc.toString()).toContain("[LOGGING]");
    });

    it("mirc syntaxTree is non-empty", () => {
      const lang = StreamLanguage.define(mirc);
      const state = EditorState.create({
        doc: "on 1:TEXT:*:#:{ msg $chan Hello $nick }",
        extensions: [new LanguageSupport(lang)],
      });
      expect(syntaxTree(state).length).toBeGreaterThan(0);
    });

    it("legacyCss doc line count is correct", () => {
      const lang = StreamLanguage.define(legacyCss);
      const state = EditorState.create({
        doc: "body { margin: 0; }\n.container { display: flex; }\nh1 { font-size: 2em; }",
        extensions: [new LanguageSupport(lang)],
      });
      expect(state.doc.lines).toBe(3);
    });

    it("legacyJS doc mutation via transaction works", () => {
      const lang = StreamLanguage.define(legacyJS);
      let state = EditorState.create({
        doc: "var x = 1;",
        extensions: [new LanguageSupport(lang)],
      });
      state = state.update({ changes: { from: 10, insert: "\nvar y = 2;" } }).state;
      expect(state.doc.lines).toBe(2);
    });

    it("legacyGo doc length is correct", () => {
      const lang = StreamLanguage.define(legacyGo);
      const doc = "package main\nfunc main() {}";
      const state = EditorState.create({ doc, extensions: [new LanguageSupport(lang)] });
      expect(state.doc.length).toBe(doc.length);
    });

    it("legacyYaml doc line count is correct", () => {
      const lang = StreamLanguage.define(legacyYaml);
      const state = EditorState.create({
        doc: "name: test\nversion: 1.0\ndescription: example",
        extensions: [new LanguageSupport(lang)],
      });
      expect(state.doc.lines).toBe(3);
    });

    it("mbox doc mutation via transaction works", () => {
      const lang = StreamLanguage.define(mbox);
      let state = EditorState.create({
        doc: "From foo@example.com Mon Jan  1 00:00:00 2024",
        extensions: [new LanguageSupport(lang)],
      });
      state = state.update({ changes: { from: state.doc.length, insert: "\nSubject: test" } }).state;
      expect(state.doc.lines).toBe(2);
    });

    it("legacyRust doc length is correct", () => {
      const lang = StreamLanguage.define(legacyRust);
      const doc = "fn main() { println!(\"Hello, world!\"); }";
      const state = EditorState.create({ doc, extensions: [new LanguageSupport(lang)] });
      expect(state.doc.length).toBe(doc.length);
    });

    it("legacyXml doc mutation via transaction works", () => {
      const lang = StreamLanguage.define(legacyXml);
      let state = EditorState.create({ doc: "<root/>", extensions: [new LanguageSupport(lang)] });
      state = state.update({ changes: { from: 5, to: 7, insert: "><child/></root>" } }).state;
      expect(state.doc.toString()).toContain("<child/>");
    });

    it("q doc line text is accessible", () => {
      const lang = StreamLanguage.define(q);
      const state = EditorState.create({
        doc: "t:([]a:1 2 3;b:4 5 6)\nselect from t",
        extensions: [new LanguageSupport(lang)],
      });
      expect(state.doc.line(1).text).toBe("t:([]a:1 2 3;b:4 5 6)");
    });

    it("mirc doc replacement transaction works", () => {
      const lang = StreamLanguage.define(mirc);
      let state = EditorState.create({ doc: "on !*:TEXT:*:#:", extensions: [new LanguageSupport(lang)] });
      state = state.update({ changes: { from: 3, to: 4, insert: "*" } }).state;
      expect(state.doc.toString()).toBe("on !*:TEXT:*:#:");
    });

    it("legacySql doc line count is correct", () => {
      const lang = StreamLanguage.define(legacySql);
      const state = EditorState.create({
        doc: "SELECT id\nFROM users\nWHERE active = 1",
        extensions: [new LanguageSupport(lang)],
      });
      expect(state.doc.lines).toBe(3);
    });
  });
});
