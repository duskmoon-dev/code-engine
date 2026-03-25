import { describe, it, expect } from "bun:test";
import {
  HighlightStyle,
  syntaxHighlighting,
  LRLanguage,
  LanguageSupport,
  defaultHighlightStyle,
  bracketMatching,
  StringStream,
  syntaxTree,
  foldCode,
  unfoldCode,
  toggleFold,
  foldKeymap,
  StreamLanguage,
} from "../../src/core/language/index";
import { tags } from "../../src/parser/highlight/index";
import { python, pythonLanguage } from "../../src/lang/python/index";
import { EditorState } from "../../src/core/state/index";

describe("Language module", () => {
  describe("exports", () => {
    it("exports HighlightStyle", () => {
      expect(HighlightStyle).toBeDefined();
      expect(typeof HighlightStyle.define).toBe("function");
    });

    it("exports syntaxHighlighting", () => {
      expect(typeof syntaxHighlighting).toBe("function");
    });

    it("exports LRLanguage", () => {
      expect(LRLanguage).toBeDefined();
      expect(typeof LRLanguage.define).toBe("function");
    });

    it("exports LanguageSupport", () => {
      expect(LanguageSupport).toBeDefined();
    });

    it("exports defaultHighlightStyle", () => {
      expect(defaultHighlightStyle).toBeDefined();
    });

    it("exports bracketMatching", () => {
      expect(typeof bracketMatching).toBe("function");
    });

    it("exports StringStream", () => {
      expect(StringStream).toBeDefined();
    });
  });

  describe("HighlightStyle.define", () => {
    it("creates a highlight style from tag rules", () => {
      const style = HighlightStyle.define([
        { tag: tags.keyword, color: "#ff0000" },
        { tag: tags.comment, color: "#888888", fontStyle: "italic" },
      ]);
      expect(style).toBeDefined();
    });
  });

  describe("syntaxHighlighting", () => {
    it("returns an extension when given a highlight style", () => {
      const style = HighlightStyle.define([{ tag: tags.keyword, color: "#ff0000" }]);
      const ext = syntaxHighlighting(style);
      expect(ext).toBeDefined();
    });
  });

  describe("LanguageSupport", () => {
    it("python() creates a LanguageSupport instance", () => {
      const support = python();
      expect(support).toBeInstanceOf(LanguageSupport);
    });

    it("LanguageSupport.language is an LRLanguage", () => {
      const support = python();
      expect(support.language).toBeInstanceOf(LRLanguage);
    });
  });
});

describe("syntaxTree", () => {
  it("is a function", () => {
    expect(typeof syntaxTree).toBe("function");
  });

  it("returns a parse tree from EditorState with a language extension", () => {
    const state = EditorState.create({
      doc: "x = 1",
      extensions: [python()],
    });
    const tree = syntaxTree(state);
    expect(tree).toBeDefined();
    expect(tree.length).toBeGreaterThan(0);
  });
});

describe("fold commands", () => {
  it("foldCode is a command function", () => {
    expect(typeof foldCode).toBe("function");
  });

  it("unfoldCode is a command function", () => {
    expect(typeof unfoldCode).toBe("function");
  });

  it("toggleFold is a command function", () => {
    expect(typeof toggleFold).toBe("function");
  });

  it("foldKeymap is an array of key bindings", () => {
    expect(Array.isArray(foldKeymap)).toBe(true);
    expect(foldKeymap.length).toBeGreaterThan(0);
  });
});

describe("StreamLanguage", () => {
  it("is a class with a define method", () => {
    expect(StreamLanguage).toBeDefined();
    expect(typeof StreamLanguage.define).toBe("function");
  });
});

describe("Highlight tags", () => {
  it("exports standard tags", () => {
    expect(tags.keyword).toBeDefined();
    expect(tags.comment).toBeDefined();
    expect(tags.string).toBeDefined();
    expect(tags.number).toBeDefined();
    expect(tags.operator).toBeDefined();
    expect(typeof tags.function).toBe("function");
  });

  it("has type tags", () => {
    expect(tags.typeName).toBeDefined();
    expect(tags.bool).toBeDefined();
    expect(tags.null).toBeDefined();
  });

  it("has markup tags", () => {
    expect(tags.heading).toBeDefined();
    expect(tags.emphasis).toBeDefined();
    expect(tags.strong).toBeDefined();
    expect(tags.link).toBeDefined();
  });
});
