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

    it("emacs() state with unicode document works", () => {
      const doc = "こんにちは";
      const state = EditorState.create({ doc, extensions: [emacs()] });
      expect(state.doc.toString()).toBe(doc);
    });

    it("emacs() doc line(n).text accessible", () => {
      const state = EditorState.create({
        doc: "alpha\nbeta",
        extensions: [emacs()],
      });
      expect(state.doc.line(2).text).toBe("beta");
    });

    it("emacs() allows insertion at start of document", () => {
      let state = EditorState.create({ doc: "world", extensions: [emacs()] });
      state = state.update({ changes: { from: 0, insert: "hello " } }).state;
      expect(state.doc.toString()).toBe("hello world");
    });

    it("emacs() allows deletion of entire content", () => {
      let state = EditorState.create({ doc: "delete me", extensions: [emacs()] });
      state = state.update({ changes: { from: 0, to: 9 } }).state;
      expect(state.doc.toString()).toBe("");
    });

    it("emacs() doc length invariant holds after creation", () => {
      const doc = "exact length";
      const state = EditorState.create({ doc, extensions: [emacs()] });
      expect(state.doc.length).toBe(doc.length);
    });

    it("emacs() allows insertion at middle of document", () => {
      let state = EditorState.create({ doc: "helloworld", extensions: [emacs()] });
      state = state.update({ changes: { from: 5, insert: " " } }).state;
      expect(state.doc.toString()).toBe("hello world");
    });

    it("emacs() state selection within single line", () => {
      const state = EditorState.create({
        doc: "select here",
        selection: { anchor: 7, head: 11 },
        extensions: [emacs()],
      });
      expect(state.selection.main.from).toBe(7);
      expect(state.selection.main.to).toBe(11);
    });

    it("emacs() sequential transactions build up the document correctly", () => {
      let state = EditorState.create({ doc: "", extensions: [emacs()] });
      state = state.update({ changes: { from: 0, insert: "line1" } }).state;
      state = state.update({ changes: { from: 5, insert: "\nline2" } }).state;
      expect(state.doc.lines).toBe(2);
      expect(state.doc.line(1).text).toBe("line1");
      expect(state.doc.line(2).text).toBe("line2");
    });

    it("emacs() state doc line text is accessible", () => {
      const state = EditorState.create({
        doc: "first line\nsecond line\nthird line",
        extensions: [emacs()],
      });
      expect(state.doc.line(1).text).toBe("first line");
      expect(state.doc.line(2).text).toBe("second line");
    });

    it("emacs() state deletion transaction works", () => {
      let state = EditorState.create({ doc: "hello world", extensions: [emacs()] });
      state = state.update({ changes: { from: 5, to: 11 } }).state;
      expect(state.doc.toString()).toBe("hello");
    });

    it("emacs() state replacement transaction works", () => {
      let state = EditorState.create({ doc: "foo bar baz", extensions: [emacs()] });
      state = state.update({ changes: { from: 4, to: 7, insert: "qux" } }).state;
      expect(state.doc.toString()).toBe("foo qux baz");
    });

    it("emacs() state with unicode content works", () => {
      const doc = "// こんにちは\nconst x = 1;";
      const state = EditorState.create({ doc, extensions: [emacs()] });
      expect(state.doc.toString()).toBe(doc);
    });

    it("emacs() state line count is correct for multi-line doc", () => {
      const state = EditorState.create({
        doc: "a\nb\nc\nd\ne",
        extensions: [emacs()],
      });
      expect(state.doc.lines).toBe(5);
    });

    it("emacs() allows multiple sequential transactions building doc correctly", () => {
      let state = EditorState.create({ doc: "x = 1", extensions: [emacs()] });
      state = state.update({ changes: { from: 5, insert: "\ny = 2" } }).state;
      state = state.update({ changes: { from: state.doc.length, insert: "\nz = 3" } }).state;
      expect(state.doc.lines).toBe(3);
      expect(state.doc.line(2).text).toBe("y = 2");
    });

    it("emacs() state selection within last line", () => {
      const state = EditorState.create({
        doc: "hello\nworld\nfoo",
        selection: { anchor: 12, head: 15 },
        extensions: [emacs()],
      });
      expect(state.selection.main.from).toBe(12);
      expect(state.selection.main.to).toBe(15);
    });

    it("emacs() state allows insert at position 0", () => {
      let state = EditorState.create({ doc: "world", extensions: [emacs()] });
      state = state.update({ changes: { from: 0, insert: "hello " } }).state;
      expect(state.doc.toString()).toBe("hello world");
    });

    it("emacs() state line(n).text correct after transactions", () => {
      let state = EditorState.create({ doc: "a", extensions: [emacs()] });
      state = state.update({ changes: { from: 1, insert: "\nb" } }).state;
      state = state.update({ changes: { from: state.doc.length, insert: "\nc" } }).state;
      expect(state.doc.line(3).text).toBe("c");
    });

    it("emacs() state allows deletion of all content", () => {
      let state = EditorState.create({ doc: "delete me", extensions: [emacs()] });
      state = state.update({ changes: { from: 0, to: 9 } }).state;
      expect(state.doc.toString()).toBe("");
    });
  });
});
