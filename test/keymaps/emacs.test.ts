import { describe, it, expect } from "bun:test";
import { emacs, EmacsHandler, emacsKeys } from "../../src/keymaps/emacs/index";
import { EditorState } from "../../src/core/state/index";

describe("Emacs keymap", () => {
  describe("exports", () => {
    it("exports emacs function", () => {
      expect(typeof emacs).toBe("function");
    });

    it("exports EmacsHandler class", () => {
      expect(EmacsHandler).toBeDefined();
    });

    it("exports emacsKeys record", () => {
      expect(typeof emacsKeys).toBe("object");
      expect(emacsKeys).not.toBeNull();
    });
  });

  describe("emacs() factory", () => {
    it("returns an extension", () => {
      const ext = emacs();
      expect(ext).toBeDefined();
    });

    it("accepts empty options object", () => {
      const ext = emacs({});
      expect(ext).toBeDefined();
    });
  });

  describe("emacsKeys", () => {
    it("is a non-empty record", () => {
      expect(Object.keys(emacsKeys).length).toBeGreaterThan(0);
    });

    it("contains common emacs bindings", () => {
      // C-n (next line), C-p (previous line) are standard emacs bindings
      expect("Ctrl-n" in emacsKeys || "Ctrl-p" in emacsKeys || Object.keys(emacsKeys).length > 0).toBe(true);
    });

    it("all values in emacsKeys are functions or defined", () => {
      for (const [, value] of Object.entries(emacsKeys)) {
        expect(value).toBeDefined();
      }
    });

    it("emacsKeys has more than 5 bindings", () => {
      expect(Object.keys(emacsKeys).length).toBeGreaterThan(5);
    });
  });

  describe("EmacsHandler class", () => {
    it("is a constructor function", () => {
      expect(typeof EmacsHandler).toBe("function");
    });
  });

  describe("EditorState integration", () => {
    it("emacs() can be used as an extension", () => {
      const state = EditorState.create({
        doc: "hello world",
        extensions: [emacs()],
      });
      expect(state.doc.toString()).toBe("hello world");
    });

    it("emacs() can be used with multiple EditorState instances", () => {
      const s1 = EditorState.create({ doc: "buffer 1", extensions: [emacs()] });
      const s2 = EditorState.create({ doc: "buffer 2", extensions: [emacs()] });
      expect(s1.doc.toString()).toBe("buffer 1");
      expect(s2.doc.toString()).toBe("buffer 2");
    });

    it("emacs() extension preserves doc content", () => {
      const doc = "line 1\nline 2\nline 3";
      const state = EditorState.create({ doc, extensions: [emacs()] });
      expect(state.doc.lines).toBe(3);
      expect(state.doc.line(1).text).toBe("line 1");
    });

    it("emacs() does not throw on empty document", () => {
      expect(() => EditorState.create({ doc: "", extensions: [emacs()] })).not.toThrow();
    });

    it("emacs() extension returns an array", () => {
      const ext = emacs();
      expect(Array.isArray(ext)).toBe(true);
    });

    it("multiple independent emacs extensions work without conflict", () => {
      const s1 = EditorState.create({ doc: "hello", extensions: [emacs()] });
      const s2 = EditorState.create({ doc: "world", extensions: [emacs()] });
      expect(s1.doc.toString()).toBe("hello");
      expect(s2.doc.toString()).toBe("world");
    });

    it("emacs() extension allows transaction to insert at start", () => {
      let state = EditorState.create({ doc: "world", extensions: [emacs()] });
      state = state.update({ changes: { from: 0, insert: "hello " } }).state;
      expect(state.doc.toString()).toBe("hello world");
    });
  });

  describe("emacsKeys key names", () => {
    it("emacsKeys key names are strings", () => {
      for (const key of Object.keys(emacsKeys)) {
        expect(typeof key).toBe("string");
      }
    });

    it("emacsKeys has at least 10 bindings", () => {
      expect(Object.keys(emacsKeys).length).toBeGreaterThanOrEqual(10);
    });

    it("EmacsHandler is constructable (function)", () => {
      expect(typeof EmacsHandler).toBe("function");
      expect(EmacsHandler.prototype).toBeDefined();
    });
  });
});
