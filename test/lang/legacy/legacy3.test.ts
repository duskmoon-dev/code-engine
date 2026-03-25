import { describe, it, expect } from "bun:test";
import { StreamLanguage, LanguageSupport } from "../../../src/core/language/index";
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
});
