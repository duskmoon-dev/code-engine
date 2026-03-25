import { describe, it, expect } from "bun:test";
import { StreamLanguage, LanguageSupport, syntaxTree } from "../../../src/core/language/index";
import { EditorState } from "../../../src/core/state/index";

import { sparql } from "../../../src/lang/legacy/sparql";
import { turtle } from "../../../src/lang/legacy/turtle";
import { protobuf } from "../../../src/lang/legacy/protobuf";
import { puppet } from "../../../src/lang/legacy/puppet";
import { sas } from "../../../src/lang/legacy/sas";
import { octave } from "../../../src/lang/legacy/octave";
import { gherkin } from "../../../src/lang/legacy/gherkin";
import { diff } from "../../../src/lang/legacy/diff";
import { vhdl } from "../../../src/lang/legacy/vhdl";
import { cmake } from "../../../src/lang/legacy/cmake";
import { pug } from "../../../src/lang/legacy/pug";
import { properties } from "../../../src/lang/legacy/properties";

describe("Legacy language packs (batch 3)", () => {
  describe("StreamParser exports", () => {
    it("sparql is a StreamParser object", () => {
      expect(sparql).toBeDefined();
      expect(typeof sparql).toBe("object");
    });

    it("turtle is a StreamParser object", () => {
      expect(turtle).toBeDefined();
      expect(typeof turtle).toBe("object");
    });

    it("protobuf is a StreamParser object", () => {
      expect(protobuf).toBeDefined();
      expect(typeof protobuf).toBe("object");
    });

    it("puppet is a StreamParser object", () => {
      expect(puppet).toBeDefined();
      expect(typeof puppet).toBe("object");
    });

    it("sas is a StreamParser object", () => {
      expect(sas).toBeDefined();
      expect(typeof sas).toBe("object");
    });

    it("octave is a StreamParser object", () => {
      expect(octave).toBeDefined();
      expect(typeof octave).toBe("object");
    });

    it("gherkin is a StreamParser object", () => {
      expect(gherkin).toBeDefined();
      expect(typeof gherkin).toBe("object");
    });

    it("diff is a StreamParser object", () => {
      expect(diff).toBeDefined();
      expect(typeof diff).toBe("object");
    });

    it("vhdl is a StreamParser object", () => {
      expect(vhdl).toBeDefined();
      expect(typeof vhdl).toBe("object");
    });

    it("cmake is a StreamParser object", () => {
      expect(cmake).toBeDefined();
      expect(typeof cmake).toBe("object");
    });

    it("pug is a StreamParser object", () => {
      expect(pug).toBeDefined();
      expect(typeof pug).toBe("object");
    });

    it("properties is a StreamParser object", () => {
      expect(properties).toBeDefined();
      expect(typeof properties).toBe("object");
    });
  });

  describe("EditorState integration", () => {
    it("sparql integrates with EditorState", () => {
      const lang = StreamLanguage.define(sparql);
      const state = EditorState.create({
        doc: "SELECT ?s ?p ?o WHERE { ?s ?p ?o } LIMIT 10",
        extensions: [new LanguageSupport(lang)],
      });
      expect(state.doc.toString()).toContain("SELECT");
    });

    it("gherkin integrates with EditorState", () => {
      const lang = StreamLanguage.define(gherkin);
      const state = EditorState.create({
        doc: "Feature: Login\n  Scenario: Valid login\n    Given the user is on the login page\n    When they enter valid credentials\n    Then they are logged in",
        extensions: [new LanguageSupport(lang)],
      });
      expect(state.doc.toString()).toContain("Feature:");
    });

    it("diff integrates with EditorState", () => {
      const lang = StreamLanguage.define(diff);
      const state = EditorState.create({
        doc: "--- a/file.txt\n+++ b/file.txt\n@@ -1,3 +1,3 @@\n-old line\n+new line",
        extensions: [new LanguageSupport(lang)],
      });
      expect(state.doc.toString()).toContain("--- a/file.txt");
    });

    it("cmake integrates with EditorState", () => {
      const lang = StreamLanguage.define(cmake);
      const state = EditorState.create({
        doc: "cmake_minimum_required(VERSION 3.10)\nproject(MyProject)\nadd_executable(main main.cpp)",
        extensions: [new LanguageSupport(lang)],
      });
      expect(state.doc.toString()).toContain("cmake_minimum_required");
    });

    it("properties integrates with EditorState", () => {
      const lang = StreamLanguage.define(properties);
      const state = EditorState.create({
        doc: "# Application config\napp.name=MyApp\napp.version=1.0.0\ndebug=false",
        extensions: [new LanguageSupport(lang)],
      });
      expect(state.doc.toString()).toContain("app.name=MyApp");
    });

    it("octave integrates with EditorState", () => {
      const lang = StreamLanguage.define(octave);
      const state = EditorState.create({
        doc: "x = 1:10;\ny = x .^ 2;\nplot(x, y);",
        extensions: [new LanguageSupport(lang)],
      });
      expect(state.doc.toString()).toContain("plot(x, y)");
    });
  });

  describe("syntaxTree integration", () => {
    it("sparql syntaxTree is non-empty", () => {
      const lang = StreamLanguage.define(sparql);
      const state = EditorState.create({
        doc: "SELECT ?s ?p ?o WHERE { ?s ?p ?o }",
        extensions: [new LanguageSupport(lang)],
      });
      expect(syntaxTree(state).length).toBeGreaterThan(0);
    });

    it("diff syntaxTree is non-empty", () => {
      const lang = StreamLanguage.define(diff);
      const state = EditorState.create({
        doc: "--- a.txt\n+++ b.txt\n@@ -1 +1 @@\n-old\n+new",
        extensions: [new LanguageSupport(lang)],
      });
      expect(syntaxTree(state).length).toBeGreaterThan(0);
    });

    it("properties syntaxTree is non-empty", () => {
      const lang = StreamLanguage.define(properties);
      const state = EditorState.create({
        doc: "key=value\nother=123",
        extensions: [new LanguageSupport(lang)],
      });
      expect(syntaxTree(state).length).toBeGreaterThan(0);
    });

    it("gherkin syntaxTree is non-empty", () => {
      const lang = StreamLanguage.define(gherkin);
      const state = EditorState.create({
        doc: "Feature: Test\n  Scenario: Basic\n    Given something",
        extensions: [new LanguageSupport(lang)],
      });
      expect(syntaxTree(state).length).toBeGreaterThan(0);
    });

    it("cmake syntaxTree is non-empty", () => {
      const lang = StreamLanguage.define(cmake);
      const state = EditorState.create({
        doc: "cmake_minimum_required(VERSION 3.10)",
        extensions: [new LanguageSupport(lang)],
      });
      expect(syntaxTree(state).length).toBeGreaterThan(0);
    });

    it("turtle syntaxTree is non-empty", () => {
      const lang = StreamLanguage.define(turtle);
      const state = EditorState.create({
        doc: "@prefix ex: <http://example.org/> .\nex:subject ex:predicate ex:object .",
        extensions: [new LanguageSupport(lang)],
      });
      expect(syntaxTree(state).length).toBeGreaterThan(0);
    });

    it("octave syntaxTree is non-empty", () => {
      const lang = StreamLanguage.define(octave);
      const state = EditorState.create({
        doc: "x = 1:10; y = x .^ 2;",
        extensions: [new LanguageSupport(lang)],
      });
      expect(syntaxTree(state).length).toBeGreaterThan(0);
    });

    it("sparql syntaxTree cursor traversal finds nodes", () => {
      const lang = StreamLanguage.define(sparql);
      const state = EditorState.create({
        doc: "SELECT ?s ?p ?o WHERE { ?s ?p ?o }",
        extensions: [new LanguageSupport(lang)],
      });
      const tree = syntaxTree(state);
      const cursor = tree.cursor();
      let count = 0;
      do { count++; } while (cursor.next() && count < 50);
      expect(count).toBeGreaterThan(0);
    });

    it("pug syntaxTree is non-empty", () => {
      const lang = StreamLanguage.define(pug);
      const state = EditorState.create({
        doc: "html\n  head\n    title Hello\n  body\n    p World",
        extensions: [new LanguageSupport(lang)],
      });
      expect(syntaxTree(state).length).toBeGreaterThan(0);
    });

    it("vhdl syntaxTree is non-empty", () => {
      const lang = StreamLanguage.define(vhdl);
      const state = EditorState.create({
        doc: "entity test is end;\narchitecture rtl of test is begin end;",
        extensions: [new LanguageSupport(lang)],
      });
      expect(syntaxTree(state).length).toBeGreaterThan(0);
    });

    it("sas syntaxTree is non-empty", () => {
      const lang = StreamLanguage.define(sas);
      const state = EditorState.create({
        doc: "data work.test;\n  set sashelp.class;\nrun;",
        extensions: [new LanguageSupport(lang)],
      });
      expect(syntaxTree(state).length).toBeGreaterThan(0);
    });

    it("protobuf integrates with EditorState", () => {
      const lang = StreamLanguage.define(protobuf);
      const state = EditorState.create({
        doc: "syntax = \"proto3\";\nmessage User {\n  string name = 1;\n  int32 age = 2;\n}",
        extensions: [new LanguageSupport(lang)],
      });
      expect(state.doc.toString()).toContain("message User");
    });

    it("puppet integrates with EditorState", () => {
      const lang = StreamLanguage.define(puppet);
      const state = EditorState.create({
        doc: "class nginx {\n  package { 'nginx': ensure => installed }\n  service { 'nginx': ensure => running }\n}",
        extensions: [new LanguageSupport(lang)],
      });
      expect(state.doc.toString()).toContain("class nginx");
    });

    it("protobuf syntaxTree is non-empty", () => {
      const lang = StreamLanguage.define(protobuf);
      const state = EditorState.create({
        doc: "syntax = \"proto3\";\nmessage Hello { string text = 1; }",
        extensions: [new LanguageSupport(lang)],
      });
      expect(syntaxTree(state).length).toBeGreaterThan(0);
    });

    it("puppet syntaxTree is non-empty", () => {
      const lang = StreamLanguage.define(puppet);
      const state = EditorState.create({
        doc: "class myclass { package { 'vim': ensure => installed } }",
        extensions: [new LanguageSupport(lang)],
      });
      expect(syntaxTree(state).length).toBeGreaterThan(0);
    });

    it("diff doc line count is correct", () => {
      const lang = StreamLanguage.define(diff);
      const state = EditorState.create({
        doc: "--- a.txt\n+++ b.txt\n@@ -1 +1 @@\n-old\n+new",
        extensions: [new LanguageSupport(lang)],
      });
      expect(state.doc.lines).toBe(5);
    });

    it("cmake doc mutation via transaction works", () => {
      const lang = StreamLanguage.define(cmake);
      let state = EditorState.create({
        doc: "project(MyProject)",
        extensions: [new LanguageSupport(lang)],
      });
      state = state.update({ changes: { from: 18, insert: "\nadd_executable(main main.cpp)" } }).state;
      expect(state.doc.lines).toBe(2);
    });

    it("sparql integrates with complex query", () => {
      const lang = StreamLanguage.define(sparql);
      const state = EditorState.create({
        doc: "PREFIX ex: <http://example.org/>\nSELECT ?name WHERE { ?s a ex:Person; ex:name ?name } ORDER BY ?name",
        extensions: [new LanguageSupport(lang)],
      });
      expect(state.doc.toString()).toContain("PREFIX");
    });

    it("turtle doc line count is correct", () => {
      const lang = StreamLanguage.define(turtle);
      const state = EditorState.create({
        doc: "@prefix ex: <http://example.org/> .\nex:Alice a ex:Person .\nex:Bob ex:knows ex:Alice .",
        extensions: [new LanguageSupport(lang)],
      });
      expect(state.doc.lines).toBe(3);
    });

    it("protobuf doc mutation via transaction works", () => {
      const lang = StreamLanguage.define(protobuf);
      let state = EditorState.create({
        doc: "syntax = \"proto3\";",
        extensions: [new LanguageSupport(lang)],
      });
      state = state.update({ changes: { from: 18, insert: "\nmessage Empty {}" } }).state;
      expect(state.doc.lines).toBe(2);
    });

    it("octave doc length is correct", () => {
      const lang = StreamLanguage.define(octave);
      const doc = "x = linspace(0, 2*pi, 100);";
      const state = EditorState.create({
        doc,
        extensions: [new LanguageSupport(lang)],
      });
      expect(state.doc.length).toBe(doc.length);
    });
  });
});
