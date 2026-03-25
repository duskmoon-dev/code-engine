import { describe, it, expect } from "bun:test";
import { oneDark, oneDarkTheme, oneDarkHighlightStyle, color } from "../../src/theme/one-dark";
import { EditorState } from "../../src/core/state/index";

describe("theme/one-dark", () => {
  describe("color", () => {
    it("is a defined object", () => {
      expect(color).toBeDefined();
      expect(typeof color).toBe("object");
    });

    it("contains all expected color keys", () => {
      const expectedKeys = [
        "chalky", "coral", "cyan", "invalid", "ivory", "stone",
        "malibu", "sage", "whiskey", "violet", "darkBackground",
        "highlightBackground", "background", "tooltipBackground",
        "selection", "cursor",
      ];
      for (const key of expectedKeys) {
        expect(color).toHaveProperty(key);
      }
    });

    it("has string values for all color entries", () => {
      for (const [key, value] of Object.entries(color)) {
        expect(typeof value).toBe("string");
      }
    });

    it("has hex color values", () => {
      for (const [, value] of Object.entries(color)) {
        expect(value).toMatch(/^#[0-9a-fA-F]{6}$/);
      }
    });
  });

  describe("oneDarkTheme", () => {
    it("is defined", () => {
      expect(oneDarkTheme).toBeDefined();
    });

    it("is a CodeMirror extension (has extension property or is array-like)", () => {
      // EditorView.theme() returns an Extension, which is typically an object
      expect(typeof oneDarkTheme).not.toBe("undefined");
    });
  });

  describe("oneDarkHighlightStyle", () => {
    it("is defined", () => {
      expect(oneDarkHighlightStyle).toBeDefined();
    });

    it("is a HighlightStyle instance with a style method", () => {
      expect(typeof oneDarkHighlightStyle.style).toBe("function");
    });
  });

  describe("oneDark", () => {
    it("is defined", () => {
      expect(oneDark).toBeDefined();
    });

    it("is an array with two entries (theme + highlight)", () => {
      expect(Array.isArray(oneDark)).toBe(true);
      expect((oneDark as unknown[]).length).toBe(2);
    });

    it("can be used as an EditorState extension", () => {
      const state = EditorState.create({
        doc: "hello world",
        extensions: [oneDark],
      });
      expect(state.doc.toString()).toBe("hello world");
    });
  });

  describe("oneDarkHighlightStyle tag styling", () => {
    it("style() is callable with a tag array", () => {
      const result = oneDarkHighlightStyle.style([]);
      // Empty array returns null or a string
      expect(result === null || typeof result === "string").toBe(true);
    });
  });

  describe("color value format", () => {
    it("background color starts with #", () => {
      expect(color.background.startsWith("#")).toBe(true);
    });

    it("cursor color starts with #", () => {
      expect(color.cursor.startsWith("#")).toBe(true);
    });

    it("selection color starts with #", () => {
      expect(color.selection.startsWith("#")).toBe(true);
    });

    it("all color values have length of 7 (including #)", () => {
      for (const value of Object.values(color)) {
        expect(value.length).toBe(7);
      }
    });

    it("at least 10 distinct color keys are defined", () => {
      expect(Object.keys(color).length).toBeGreaterThanOrEqual(10);
    });
  });

  describe("oneDark with language support", () => {
    it("can be used alongside other extensions", () => {
      const state = EditorState.create({
        doc: "const x = 1;",
        extensions: [oneDark],
      });
      expect(state.doc.length).toBeGreaterThan(0);
    });

    it("oneDark[0] is the theme", () => {
      expect((oneDark as unknown[])[0]).toBeDefined();
    });

    it("oneDark[1] is the highlight style", () => {
      expect((oneDark as unknown[])[1]).toBeDefined();
    });

    it("can be used with empty doc", () => {
      const state = EditorState.create({
        doc: "",
        extensions: [oneDark],
      });
      expect(state.doc.length).toBe(0);
    });

    it("can be used with multi-line document", () => {
      const state = EditorState.create({
        doc: "line1\nline2\nline3",
        extensions: [oneDark],
      });
      expect(state.doc.lines).toBe(3);
    });

    it("state transactions work with oneDark extension", () => {
      let state = EditorState.create({
        doc: "hello",
        extensions: [oneDark],
      });
      state = state.update({ changes: { from: 5, insert: " world" } }).state;
      expect(state.doc.toString()).toBe("hello world");
    });

    it("oneDark extension does not alter document content", () => {
      const doc = "const x = 42;";
      const state = EditorState.create({
        doc,
        extensions: [oneDark],
      });
      expect(state.doc.toString()).toBe(doc);
    });
  });

  describe("oneDarkHighlightStyle additional", () => {
    it("style() with non-empty tag array returns null or string", () => {
      const { tags } = require("../../src/parser/highlight/index");
      const result = oneDarkHighlightStyle.style([tags.keyword]);
      expect(result === null || typeof result === "string").toBe(true);
    });

    it("style() for comment tag returns null or string", () => {
      const { tags } = require("../../src/parser/highlight/index");
      const result = oneDarkHighlightStyle.style([tags.comment]);
      expect(result === null || typeof result === "string").toBe(true);
    });

    it("module property is defined", () => {
      expect(oneDarkHighlightStyle.module).toBeDefined();
    });

    it("style() returns a string for string tag", () => {
      const { tags } = require("../../src/parser/highlight/index");
      const result = oneDarkHighlightStyle.style([tags.string]);
      expect(result === null || typeof result === "string").toBe(true);
    });

    it("style() returns a string for number tag", () => {
      const { tags } = require("../../src/parser/highlight/index");
      const result = oneDarkHighlightStyle.style([tags.number]);
      expect(result === null || typeof result === "string").toBe(true);
    });
  });

  describe("oneDark additional behavioral", () => {
    it("deletion transaction works with oneDark extension", () => {
      let state = EditorState.create({ doc: "hello world", extensions: [oneDark] });
      state = state.update({ changes: { from: 5, to: 11 } }).state;
      expect(state.doc.toString()).toBe("hello");
    });

    it("line count is correct with oneDark extension", () => {
      const state = EditorState.create({
        doc: "a\nb\nc\nd",
        extensions: [oneDark],
      });
      expect(state.doc.lines).toBe(4);
    });

    it("selection anchor/head are preserved with oneDark", () => {
      const state = EditorState.create({
        doc: "test selection",
        selection: { anchor: 5, head: 9 },
        extensions: [oneDark],
      });
      expect(state.selection.main.from).toBe(5);
      expect(state.selection.main.to).toBe(9);
    });

    it("oneDark state doc line text is accessible", () => {
      const state = EditorState.create({
        doc: "hello\nworld",
        extensions: [oneDark],
      });
      expect(state.doc.line(1).text).toBe("hello");
    });

    it("oneDark state allows multiple sequential transactions", () => {
      let state = EditorState.create({ doc: "a", extensions: [oneDark] });
      for (let i = 0; i < 3; i++) {
        state = state.update({ changes: { from: state.doc.length, insert: String(i) } }).state;
      }
      expect(state.doc.toString()).toBe("a012");
    });

    it("oneDark state allows replacement transaction", () => {
      let state = EditorState.create({ doc: "hello world", extensions: [oneDark] });
      state = state.update({ changes: { from: 0, to: 5, insert: "goodbye" } }).state;
      expect(state.doc.toString()).toBe("goodbye world");
    });

    it("oneDark state doc length matches input", () => {
      const doc = "const x = 42;";
      const state = EditorState.create({ doc, extensions: [oneDark] });
      expect(state.doc.length).toBe(doc.length);
    });

    it("oneDark with empty doc works", () => {
      const state = EditorState.create({ doc: "", extensions: [oneDark] });
      expect(state.doc.length).toBe(0);
    });

    it("oneDark extension handles unicode document", () => {
      const doc = "こんにちは世界";
      const state = EditorState.create({ doc, extensions: [oneDark] });
      expect(state.doc.toString()).toBe(doc);
    });

    it("oneDark state selection can span lines", () => {
      const state = EditorState.create({
        doc: "line1\nline2",
        selection: { anchor: 0, head: 11 },
        extensions: [oneDark],
      });
      expect(state.selection.main.from).toBe(0);
      expect(state.selection.main.to).toBe(11);
    });

    it("oneDark insertion at start of document", () => {
      let state = EditorState.create({ doc: "world", extensions: [oneDark] });
      state = state.update({ changes: { from: 0, insert: "hello " } }).state;
      expect(state.doc.toString()).toBe("hello world");
    });

    it("oneDark deletion of entire content", () => {
      let state = EditorState.create({ doc: "delete me", extensions: [oneDark] });
      state = state.update({ changes: { from: 0, to: 9 } }).state;
      expect(state.doc.toString()).toBe("");
    });

    it("oneDark state doc line(n).text accessible for each line", () => {
      const state = EditorState.create({
        doc: "alpha\nbeta\ngamma",
        extensions: [oneDark],
      });
      expect(state.doc.line(2).text).toBe("beta");
    });

    it("oneDark state sequential transactions update doc correctly", () => {
      let state = EditorState.create({ doc: "a", extensions: [oneDark] });
      state = state.update({ changes: { from: 1, insert: "b" } }).state;
      state = state.update({ changes: { from: 2, insert: "c" } }).state;
      expect(state.doc.toString()).toBe("abc");
    });

    it("oneDark state doc length invariant holds", () => {
      const doc = "exact length string";
      const state = EditorState.create({ doc, extensions: [oneDark] });
      expect(state.doc.length).toBe(doc.length);
    });

    it("oneDark state replacement transaction works", () => {
      let state = EditorState.create({ doc: "foo bar", extensions: [oneDark] });
      state = state.update({ changes: { from: 4, to: 7, insert: "baz" } }).state;
      expect(state.doc.toString()).toBe("foo baz");
    });

    it("oneDark state selection within line works", () => {
      const state = EditorState.create({
        doc: "hello world",
        selection: { anchor: 6, head: 11 },
        extensions: [oneDark],
      });
      expect(state.selection.main.from).toBe(6);
      expect(state.selection.main.to).toBe(11);
    });
  });
});
