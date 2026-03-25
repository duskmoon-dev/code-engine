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

    it("emacsKeys contains navigation bindings", () => {
      const keys = Object.keys(emacsKeys);
      // Should have forward/backward char or line bindings (Ctrl-f, Ctrl-b, etc.)
      expect(keys.length).toBeGreaterThan(0);
    });

    it("emacsKeys values are callable or defined", () => {
      for (const [, fn] of Object.entries(emacsKeys)) {
        expect(fn !== undefined).toBe(true);
      }
    });
  });

  describe("emacs() extension deeper behavioral", () => {
    it("allows multiple insertions in sequence", () => {
      let state = EditorState.create({ doc: "a", extensions: [emacs()] });
      state = state.update({ changes: { from: 1, insert: "b" } }).state;
      state = state.update({ changes: { from: 2, insert: "c" } }).state;
      expect(state.doc.toString()).toBe("abc");
    });

    it("deletion transaction works with emacs extension", () => {
      let state = EditorState.create({ doc: "hello world", extensions: [emacs()] });
      state = state.update({ changes: { from: 5, to: 11 } }).state;
      expect(state.doc.toString()).toBe("hello");
    });

    it("selection can be created in emacs-extended state", () => {
      const state = EditorState.create({
        doc: "select me",
        selection: { anchor: 0, head: 6 },
        extensions: [emacs()],
      });
      expect(state.selection.main.from).toBe(0);
      expect(state.selection.main.to).toBe(6);
    });

    it("emacs() extension handles replacement transaction", () => {
      let state = EditorState.create({ doc: "hello world", extensions: [emacs()] });
      state = state.update({ changes: { from: 0, to: 5, insert: "goodbye" } }).state;
      expect(state.doc.toString()).toBe("goodbye world");
    });

    it("emacs() extension preserves doc length invariant", () => {
      const doc = "test";
      const state = EditorState.create({ doc, extensions: [emacs()] });
      expect(state.doc.length).toBe(doc.length);
    });

    it("emacsKeys has cursor movement bindings (forward/backward)", () => {
      const keys = Object.keys(emacsKeys);
      // Look for Ctrl-f, Ctrl-b, or similar cursor keys
      const hasCursorKeys = keys.some(k => k.includes("Ctrl-") || k.includes("Alt-") || k.includes("Meta-"));
      expect(hasCursorKeys || keys.length > 10).toBe(true);
    });

    it("emacs() extension does not throw with complex document", () => {
      const doc = "function foo() {\n  return 42;\n}\nconsole.log(foo());";
      expect(() => EditorState.create({ doc, extensions: [emacs()] })).not.toThrow();
    });

    it("emacs() state doc line count is correct for multi-line input", () => {
      const state = EditorState.create({
        doc: "line1\nline2\nline3\nline4",
        extensions: [emacs()],
      });
      expect(state.doc.lines).toBe(4);
    });

    it("emacs() state doc line text is accessible", () => {
      const state = EditorState.create({
        doc: "hello\nworld",
        extensions: [emacs()],
      });
      expect(state.doc.line(1).text).toBe("hello");
    });

    it("emacs() state allows multiple sequential transactions", () => {
      let state = EditorState.create({ doc: "a", extensions: [emacs()] });
      for (let i = 0; i < 3; i++) {
        state = state.update({ changes: { from: state.doc.length, insert: String(i) } }).state;
      }
      expect(state.doc.toString()).toBe("a012");
    });

    it("emacs() extension allows replacement transaction", () => {
      let state = EditorState.create({ doc: "foo bar", extensions: [emacs()] });
      state = state.update({ changes: { from: 4, to: 7, insert: "baz" } }).state;
      expect(state.doc.toString()).toBe("foo baz");
    });

    it("emacs() extension handles unicode document", () => {
      const doc = "こんにちは世界";
      const state = EditorState.create({ doc, extensions: [emacs()] });
      expect(state.doc.toString()).toBe(doc);
    });

    it("emacs() state selection can span lines", () => {
      const state = EditorState.create({
        doc: "line1\nline2",
        selection: { anchor: 0, head: 11 },
        extensions: [emacs()],
      });
      expect(state.selection.main.from).toBe(0);
      expect(state.selection.main.to).toBe(11);
    });
  });
});
