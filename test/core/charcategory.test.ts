import { describe, it, expect } from "bun:test";
import { EditorState, CharCategory } from "../../src/core/state/index";
import { makeCategorizer } from "../../src/core/state/charcategory";

describe("CharCategory enum", () => {
  it("has the expected numeric values", () => {
    expect(CharCategory.Word).toBe(0);
    expect(CharCategory.Space).toBe(1);
    expect(CharCategory.Other).toBe(2);
  });
});

describe("makeCategorizer", () => {
  const categorize = makeCategorizer("");

  describe("whitespace detection (CharCategory.Space)", () => {
    it("categorizes space as Space", () => {
      expect(categorize(" ")).toBe(CharCategory.Space);
    });

    it("categorizes tab as Space", () => {
      expect(categorize("\t")).toBe(CharCategory.Space);
    });

    it("categorizes newline as Space", () => {
      expect(categorize("\n")).toBe(CharCategory.Space);
    });

    it("categorizes carriage return as Space", () => {
      expect(categorize("\r")).toBe(CharCategory.Space);
    });

    it("categorizes non-breaking space as Space", () => {
      expect(categorize("\u00a0")).toBe(CharCategory.Space);
    });
  });

  describe("ASCII word characters (CharCategory.Word)", () => {
    it("categorizes lowercase letters as Word", () => {
      for (const ch of "abcxyz") {
        expect(categorize(ch)).toBe(CharCategory.Word);
      }
    });

    it("categorizes uppercase letters as Word", () => {
      for (const ch of "ABCXYZ") {
        expect(categorize(ch)).toBe(CharCategory.Word);
      }
    });

    it("categorizes digits as Word", () => {
      for (const ch of "0123456789") {
        expect(categorize(ch)).toBe(CharCategory.Word);
      }
    });

    it("categorizes underscore as Word", () => {
      expect(categorize("_")).toBe(CharCategory.Word);
    });
  });

  describe("non-ASCII word characters (CharCategory.Word)", () => {
    it("categorizes accented Latin characters as Word", () => {
      // Characters with distinct upper/lower case
      expect(categorize("\u00e9")).toBe(CharCategory.Word); // e-acute
      expect(categorize("\u00f1")).toBe(CharCategory.Word); // n-tilde
      expect(categorize("\u00fc")).toBe(CharCategory.Word); // u-diaeresis
    });

    it("categorizes German eszett as Word", () => {
      // \u00df is explicitly in nonASCIISingleCaseWordChar
      expect(categorize("\u00df")).toBe(CharCategory.Word);
    });

    it("categorizes Armenian ligature as Word", () => {
      // \u0587 is explicitly in nonASCIISingleCaseWordChar
      expect(categorize("\u0587")).toBe(CharCategory.Word);
    });

    it("categorizes Hebrew characters as Word", () => {
      // \u0590-\u05f4 range
      expect(categorize("\u05d0")).toBe(CharCategory.Word); // Alef
      expect(categorize("\u05e9")).toBe(CharCategory.Word); // Shin
    });

    it("categorizes Arabic characters as Word", () => {
      // \u0600-\u06ff range
      expect(categorize("\u0627")).toBe(CharCategory.Word); // Alef
      expect(categorize("\u0628")).toBe(CharCategory.Word); // Ba
    });

    it("categorizes CJK characters as Word", () => {
      // Hiragana \u3040-\u309f
      expect(categorize("\u3042")).toBe(CharCategory.Word); // Hiragana A
      // Katakana \u30a0-\u30ff
      expect(categorize("\u30a2")).toBe(CharCategory.Word); // Katakana A
      // CJK Unified \u4e00-\u9fcc
      expect(categorize("\u4e00")).toBe(CharCategory.Word); // CJK "one"
      expect(categorize("\u9fcc")).toBe(CharCategory.Word); // last in range
    });

    it("categorizes Korean characters as Word", () => {
      // \uac00-\ud7af range
      expect(categorize("\uac00")).toBe(CharCategory.Word); // Ga
      expect(categorize("\ud558")).toBe(CharCategory.Word); // Ha
    });
  });

  describe("punctuation and symbols (CharCategory.Other)", () => {
    it("categorizes ASCII punctuation as Other", () => {
      for (const ch of "!@#$%^&*()-+=[]{}|;:',.<>?/`~\"\\") {
        expect(categorize(ch)).toBe(CharCategory.Other);
      }
    });

    it("categorizes non-word non-space Unicode as Other", () => {
      // Box drawing character - not alphabetic, not whitespace
      expect(categorize("\u2500")).toBe(CharCategory.Other);
      // Bullet
      expect(categorize("\u2022")).toBe(CharCategory.Other);
    });
  });

  describe("custom wordChars", () => {
    it("treats extra wordChars as Word", () => {
      const cat = makeCategorizer("-.");
      // Normally these are Other
      expect(categorize("-")).toBe(CharCategory.Other);
      expect(categorize(".")).toBe(CharCategory.Other);
      // But with custom wordChars they become Word
      expect(cat("-")).toBe(CharCategory.Word);
      expect(cat(".")).toBe(CharCategory.Word);
    });

    it("still categorizes whitespace as Space with custom wordChars", () => {
      const cat = makeCategorizer("-");
      expect(cat(" ")).toBe(CharCategory.Space);
      expect(cat("\t")).toBe(CharCategory.Space);
    });

    it("still categorizes normal word chars as Word", () => {
      const cat = makeCategorizer("#");
      expect(cat("a")).toBe(CharCategory.Word);
      expect(cat("Z")).toBe(CharCategory.Word);
      expect(cat("5")).toBe(CharCategory.Word);
    });

    it("handles empty wordChars string", () => {
      const cat = makeCategorizer("");
      expect(cat("a")).toBe(CharCategory.Word);
      expect(cat(" ")).toBe(CharCategory.Space);
      expect(cat("!")).toBe(CharCategory.Other);
    });

    it("handles multi-character custom wordChars", () => {
      const cat = makeCategorizer("@#$");
      expect(cat("@")).toBe(CharCategory.Word);
      expect(cat("#")).toBe(CharCategory.Word);
      expect(cat("$")).toBe(CharCategory.Word);
      expect(cat("!")).toBe(CharCategory.Other);
    });
  });
});

describe("EditorState.charCategorizer", () => {
  it("returns a categorizer function", () => {
    const state = EditorState.create({ doc: "hello world" });
    const cat = state.charCategorizer(0);
    expect(typeof cat).toBe("function");
  });

  it("categorizes characters correctly via state", () => {
    const state = EditorState.create({ doc: "hello world" });
    const cat = state.charCategorizer(0);
    expect(cat("h")).toBe(CharCategory.Word);
    expect(cat(" ")).toBe(CharCategory.Space);
    expect(cat("!")).toBe(CharCategory.Other);
  });
});

describe("EditorState.wordAt", () => {
  it("finds word at position within a word", () => {
    const state = EditorState.create({ doc: "hello world" });
    const word = state.wordAt(2);
    expect(word).not.toBeNull();
    expect(state.doc.sliceString(word!.from, word!.to)).toBe("hello");
  });

  it("finds word at start of doc", () => {
    const state = EditorState.create({ doc: "hello world" });
    const word = state.wordAt(0);
    expect(word).not.toBeNull();
    expect(state.doc.sliceString(word!.from, word!.to)).toBe("hello");
  });

  it("finds word at end of doc", () => {
    const state = EditorState.create({ doc: "hello world" });
    const word = state.wordAt(10);
    expect(word).not.toBeNull();
    expect(state.doc.sliceString(word!.from, word!.to)).toBe("world");
  });

  it("returns null when position is surrounded by non-word chars", () => {
    const state = EditorState.create({ doc: "  +  " });
    const word = state.wordAt(0);
    expect(word).toBeNull();
  });

  it("returns null when position is on punctuation", () => {
    const state = EditorState.create({ doc: "a + b" });
    const word = state.wordAt(2);
    expect(word).toBeNull();
  });

  it("finds word with digits", () => {
    const state = EditorState.create({ doc: "var1 = 42" });
    const word = state.wordAt(1);
    expect(word).not.toBeNull();
    expect(state.doc.sliceString(word!.from, word!.to)).toBe("var1");
  });
});
