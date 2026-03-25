import { describe, it, expect } from "bun:test";
import { StreamLanguage, LanguageSupport } from "../../../src/core/language/index";
import { EditorState } from "../../../src/core/state/index";

// Legacy language packs — StreamParser-based
import { shell } from "../../../src/lang/legacy/shell";
import { ruby } from "../../../src/lang/legacy/ruby";
import { lua } from "../../../src/lang/legacy/lua";
import { dockerFile as dockerfile } from "../../../src/lang/legacy/dockerfile";
import { toml } from "../../../src/lang/legacy/toml";
import { erlang } from "../../../src/lang/legacy/erlang";

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
  });
});
