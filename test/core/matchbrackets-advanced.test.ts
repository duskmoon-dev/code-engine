import { describe, it, expect } from "bun:test";
import { EditorState } from "../../src/core/state/index";
import { matchBrackets, bracketMatching } from "../../src/core/language/index";
import { javascript } from "../../src/lang/javascript/index";

describe("matchBrackets", () => {
  describe("plain bracket matching (no syntax tree)", () => {
    it("matches parentheses forward", () => {
      const state = EditorState.create({ doc: "(hello)" });
      const result = matchBrackets(state, 0, 1);
      expect(result).not.toBeNull();
      expect(result!.matched).toBe(true);
      expect(result!.start).toEqual({ from: 0, to: 1 });
      expect(result!.end).toEqual({ from: 6, to: 7 });
    });

    it("matches parentheses backward", () => {
      const state = EditorState.create({ doc: "(hello)" });
      const result = matchBrackets(state, 7, -1);
      expect(result).not.toBeNull();
      expect(result!.matched).toBe(true);
      expect(result!.start).toEqual({ from: 6, to: 7 });
      expect(result!.end).toEqual({ from: 0, to: 1 });
    });

    it("matches square brackets", () => {
      const state = EditorState.create({ doc: "[1, 2, 3]" });
      const result = matchBrackets(state, 0, 1);
      expect(result).not.toBeNull();
      expect(result!.matched).toBe(true);
      expect(result!.end).toEqual({ from: 8, to: 9 });
    });

    it("matches curly braces", () => {
      const state = EditorState.create({ doc: "{a: 1}" });
      const result = matchBrackets(state, 0, 1);
      expect(result).not.toBeNull();
      expect(result!.matched).toBe(true);
      expect(result!.end).toEqual({ from: 5, to: 6 });
    });

    it("handles nested brackets", () => {
      const state = EditorState.create({ doc: "((inner))" });
      const result = matchBrackets(state, 0, 1);
      expect(result).not.toBeNull();
      expect(result!.matched).toBe(true);
      expect(result!.end).toEqual({ from: 8, to: 9 });
    });

    it("handles nested different bracket types", () => {
      const state = EditorState.create({ doc: "([{}])" });
      const result = matchBrackets(state, 0, 1);
      expect(result).not.toBeNull();
      expect(result!.matched).toBe(true);
      expect(result!.end).toEqual({ from: 5, to: 6 });
    });

    it("detects mismatched brackets", () => {
      const state = EditorState.create({ doc: "(]" });
      const result = matchBrackets(state, 0, 1);
      expect(result).not.toBeNull();
      expect(result!.matched).toBe(false);
    });

    it("returns null when no bracket at position", () => {
      const state = EditorState.create({ doc: "hello" });
      const result = matchBrackets(state, 0, 1);
      expect(result).toBeNull();
    });

    it("returns unmatched when no closing bracket found", () => {
      const state = EditorState.create({ doc: "(" });
      const result = matchBrackets(state, 0, 1);
      // With a short doc, the iterator finishes and returns unmatched
      expect(result).not.toBeNull();
      expect(result!.matched).toBe(false);
      expect(result!.end).toBeUndefined();
    });

    it("returns null for closing bracket in forward direction", () => {
      const state = EditorState.create({ doc: ")" });
      // A closing bracket in forward direction is not a valid starting bracket
      const result = matchBrackets(state, 0, 1);
      expect(result).toBeNull();
    });

    it("returns null for opening bracket in backward direction", () => {
      const state = EditorState.create({ doc: "(" });
      const result = matchBrackets(state, 1, -1);
      expect(result).toBeNull();
    });
  });

  describe("with custom brackets config", () => {
    it("matches angle brackets when configured", () => {
      const state = EditorState.create({ doc: "<hello>" });
      const result = matchBrackets(state, 0, 1, { brackets: "<>" });
      expect(result).not.toBeNull();
      expect(result!.matched).toBe(true);
    });

    it("does not match angle brackets with default config", () => {
      const state = EditorState.create({ doc: "<hello>" });
      const result = matchBrackets(state, 0, 1);
      expect(result).toBeNull();
    });
  });

  describe("with maxScanDistance", () => {
    it("matches when bracket is within scan distance", () => {
      const doc = "(" + "a".repeat(5) + ")";
      const state = EditorState.create({ doc });
      const result = matchBrackets(state, 0, 1, { maxScanDistance: 100 });
      expect(result).not.toBeNull();
      expect(result!.matched).toBe(true);
    });

    it("accepts maxScanDistance as config without error", () => {
      const doc = "(hello)";
      const state = EditorState.create({ doc });
      const result = matchBrackets(state, 0, 1, { maxScanDistance: 5000 });
      expect(result).not.toBeNull();
      expect(result!.matched).toBe(true);
    });
  });

  describe("with syntax tree (JavaScript)", () => {
    function jsState(doc: string) {
      return EditorState.create({ doc, extensions: [javascript()] });
    }

    it("matches parentheses in JS code", () => {
      const state = jsState("function foo() {}");
      const result = matchBrackets(state, 12, 1);
      expect(result).not.toBeNull();
      expect(result!.matched).toBe(true);
    });

    it("matches curly braces in JS code", () => {
      const state = jsState("if (true) { x }");
      const result = matchBrackets(state, 10, 1);
      expect(result).not.toBeNull();
      expect(result!.matched).toBe(true);
    });

    it("matches brackets in array literal", () => {
      const state = jsState("let a = [1, 2, 3]");
      const result = matchBrackets(state, 8, 1);
      expect(result).not.toBeNull();
      expect(result!.matched).toBe(true);
    });
  });
});

describe("bracketMatching extension", () => {
  it("returns an extension array", () => {
    const ext = bracketMatching();
    expect(Array.isArray(ext)).toBe(true);
  });

  it("accepts empty config", () => {
    const ext = bracketMatching({});
    expect(Array.isArray(ext)).toBe(true);
  });

  it("accepts afterCursor config", () => {
    const ext = bracketMatching({ afterCursor: false });
    expect(Array.isArray(ext)).toBe(true);
  });

  it("accepts custom brackets config", () => {
    const ext = bracketMatching({ brackets: "()[]{}<>" });
    expect(Array.isArray(ext)).toBe(true);
  });

  it("accepts maxScanDistance config", () => {
    const ext = bracketMatching({ maxScanDistance: 5000 });
    expect(Array.isArray(ext)).toBe(true);
  });

  it("accepts custom renderMatch config", () => {
    const ext = bracketMatching({
      renderMatch: (match, _state) => {
        return [];
      },
    });
    expect(Array.isArray(ext)).toBe(true);
  });

  it("can be used as a state extension", () => {
    const state = EditorState.create({
      doc: "(hello)",
      extensions: [bracketMatching()],
    });
    expect(state.doc.toString()).toBe("(hello)");
  });

  it("works with afterCursor disabled", () => {
    const state = EditorState.create({
      doc: "()",
      extensions: [bracketMatching({ afterCursor: false })],
    });
    expect(state.doc.toString()).toBe("()");
  });

  it("works with custom brackets", () => {
    const state = EditorState.create({
      doc: "<>",
      extensions: [bracketMatching({ brackets: "<>" })],
    });
    expect(state.doc.toString()).toBe("<>");
  });
});
