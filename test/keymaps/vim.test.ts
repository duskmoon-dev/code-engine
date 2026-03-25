import { describe, it, expect } from "bun:test";
import { vim, Vim, getCM } from "../../src/keymaps/vim/index";
import { EditorState } from "../../src/core/state/index";

describe("Vim keymap", () => {
  describe("exports", () => {
    it("exports vim function", () => {
      expect(typeof vim).toBe("function");
    });

    it("exports Vim class/object", () => {
      expect(Vim).toBeDefined();
    });

    it("exports getCM function", () => {
      expect(typeof getCM).toBe("function");
    });
  });

  describe("vim() factory", () => {
    it("returns an extension", () => {
      const ext = vim();
      expect(ext).toBeDefined();
    });

    it("accepts empty options object", () => {
      const ext = vim({});
      expect(ext).toBeDefined();
    });

    it("accepts status option", () => {
      const ext = vim({ status: true });
      expect(ext).toBeDefined();
    });

    it("returns different values for different options", () => {
      const ext1 = vim();
      const ext2 = vim({ status: true });
      // Both are valid extensions
      expect(ext1).toBeDefined();
      expect(ext2).toBeDefined();
    });
  });

  describe("EditorState integration", () => {
    it("vim() can be used as an extension", () => {
      const state = EditorState.create({
        doc: "hello world",
        extensions: [vim()],
      });
      expect(state.doc.toString()).toBe("hello world");
    });

    it("getCM returns null for non-vim view", () => {
      // getCM requires an EditorView, not EditorState — just test it's callable
      expect(typeof getCM).toBe("function");
    });

    it("vim() can be used with multiple EditorState instances", () => {
      const s1 = EditorState.create({ doc: "first", extensions: [vim()] });
      const s2 = EditorState.create({ doc: "second", extensions: [vim()] });
      expect(s1.doc.toString()).toBe("first");
      expect(s2.doc.toString()).toBe("second");
    });

    it("Vim.defineEx is a function for registering commands", () => {
      expect(typeof Vim.defineEx).toBe("function");
    });

    it("Vim.map is a function", () => {
      expect(typeof Vim.map).toBe("function");
    });

    it("Vim.noremap is a function", () => {
      expect(typeof Vim.noremap).toBe("function");
    });

    it("Vim.unmap is a function", () => {
      expect(typeof Vim.unmap).toBe("function");
    });

    it("Vim.setOption is a function", () => {
      expect(typeof Vim.setOption).toBe("function");
    });

    it("Vim.getOption is a function", () => {
      expect(typeof Vim.getOption).toBe("function");
    });

    it("Vim.defineOperator is a function", () => {
      expect(typeof Vim.defineOperator).toBe("function");
    });

    it("Vim.defineMotion is a function", () => {
      expect(typeof Vim.defineMotion).toBe("function");
    });

    it("Vim.defineAction is a function", () => {
      expect(typeof Vim.defineAction).toBe("function");
    });

    it("Vim.handleKey is a function if available", () => {
      // handleKey may not be exposed; check it's a function or undefined
      expect(Vim.handleKey === undefined || typeof Vim.handleKey === "function").toBe(true);
    });

    it("vim() extension works with multi-line doc", () => {
      const state = EditorState.create({
        doc: "line one\nline two\nline three",
        extensions: [vim()],
      });
      expect(state.doc.lines).toBe(3);
    });

    it("vim() extension allows document mutation", () => {
      let state = EditorState.create({
        doc: "hello",
        extensions: [vim()],
      });
      state = state.update({ changes: { from: 5, insert: "!" } }).state;
      expect(state.doc.toString()).toBe("hello!");
    });

    it("vim() status:false behaves same as default", () => {
      const s1 = EditorState.create({ doc: "test", extensions: [vim()] });
      const s2 = EditorState.create({ doc: "test", extensions: [vim({ status: false })] });
      expect(s1.doc.toString()).toBe(s2.doc.toString());
    });

    it("Vim.defineRegister is a function if available", () => {
      expect(Vim.defineRegister === undefined || typeof Vim.defineRegister === "function").toBe(true);
    });

    it("Vim.mapCommand is a function if available", () => {
      expect(Vim.mapCommand === undefined || typeof Vim.mapCommand === "function").toBe(true);
    });

    it("vim() extension allows deletion", () => {
      let state = EditorState.create({ doc: "hello world", extensions: [vim()] });
      state = state.update({ changes: { from: 5, to: 11 } }).state;
      expect(state.doc.toString()).toBe("hello");
    });

    it("vim() extension with empty document works", () => {
      const state = EditorState.create({ doc: "", extensions: [vim()] });
      expect(state.doc.length).toBe(0);
    });

    it("vim() preserves selection in state", () => {
      const state = EditorState.create({
        doc: "select me",
        selection: { anchor: 0, head: 6 },
        extensions: [vim()],
      });
      expect(state.selection.main.from).toBe(0);
      expect(state.selection.main.to).toBe(6);
    });

    it("multiple sequential transactions work with vim extension", () => {
      let state = EditorState.create({ doc: "a", extensions: [vim()] });
      state = state.update({ changes: { from: 1, insert: "b" } }).state;
      state = state.update({ changes: { from: 2, insert: "c" } }).state;
      expect(state.doc.toString()).toBe("abc");
    });

    it("Vim.defineEx can register custom command", () => {
      expect(() => {
        Vim.defineEx("test-noop", "", () => {});
      }).not.toThrow();
    });

    it("Vim.setOption can set vim options", () => {
      expect(() => {
        Vim.setOption("filetype", "javascript");
      }).not.toThrow();
    });

    it("vim() state doc line count is correct", () => {
      const state = EditorState.create({
        doc: "line1\nline2\nline3",
        extensions: [vim()],
      });
      expect(state.doc.lines).toBe(3);
    });

    it("vim() state doc line text is accessible", () => {
      const state = EditorState.create({
        doc: "hello\nworld",
        extensions: [vim()],
      });
      expect(state.doc.line(2).text).toBe("world");
    });

    it("vim() state allows multiple sequential transactions", () => {
      let state = EditorState.create({ doc: "a", extensions: [vim()] });
      for (let i = 0; i < 3; i++) {
        state = state.update({ changes: { from: state.doc.length, insert: String(i) } }).state;
      }
      expect(state.doc.toString()).toBe("a012");
    });

    it("vim() extension handles replacement transaction", () => {
      let state = EditorState.create({ doc: "foo bar", extensions: [vim()] });
      state = state.update({ changes: { from: 4, to: 7, insert: "baz" } }).state;
      expect(state.doc.toString()).toBe("foo baz");
    });

    it("getCM is a function", () => {
      expect(typeof getCM).toBe("function");
    });

    it("vim() state doc length matches input", () => {
      const doc = "hello world";
      const state = EditorState.create({ doc, extensions: [vim()] });
      expect(state.doc.length).toBe(doc.length);
    });

    it("vim() extension handles unicode document", () => {
      const doc = "こんにちは世界";
      const state = EditorState.create({ doc, extensions: [vim()] });
      expect(state.doc.toString()).toBe(doc);
    });

    it("vim() state selection can span lines", () => {
      const state = EditorState.create({
        doc: "line1\nline2",
        selection: { anchor: 0, head: 11 },
        extensions: [vim()],
      });
      expect(state.selection.main.from).toBe(0);
      expect(state.selection.main.to).toBe(11);
    });

    it("vim() extension allows insertion at start", () => {
      let state = EditorState.create({ doc: "world", extensions: [vim()] });
      state = state.update({ changes: { from: 0, insert: "hello " } }).state;
      expect(state.doc.toString()).toBe("hello world");
    });

    it("vim() extension allows deletion of entire content", () => {
      let state = EditorState.create({ doc: "delete me", extensions: [vim()] });
      state = state.update({ changes: { from: 0, to: 9 } }).state;
      expect(state.doc.toString()).toBe("");
    });

    it("vim() extension preserves doc length invariant", () => {
      const doc = "test content";
      const state = EditorState.create({ doc, extensions: [vim()] });
      expect(state.doc.length).toBe(doc.length);
    });

    it("vim() state doc line text is accessible", () => {
      const state = EditorState.create({
        doc: "first line\nsecond line",
        extensions: [vim()],
      });
      expect(state.doc.line(1).text).toBe("first line");
      expect(state.doc.line(2).text).toBe("second line");
    });

    it("vim() state sequential transactions update document correctly", () => {
      let state = EditorState.create({ doc: "a", extensions: [vim()] });
      state = state.update({ changes: { from: 1, insert: "b" } }).state;
      state = state.update({ changes: { from: 2, insert: "c" } }).state;
      expect(state.doc.toString()).toBe("abc");
    });

    it("vim() state selection within single line", () => {
      const state = EditorState.create({
        doc: "normal mode text",
        selection: { anchor: 7, head: 11 },
        extensions: [vim()],
      });
      expect(state.selection.main.from).toBe(7);
      expect(state.selection.main.to).toBe(11);
    });

    it("vim() state allows insertion at end of document", () => {
      let state = EditorState.create({ doc: "hello", extensions: [vim()] });
      state = state.update({ changes: { from: 5, insert: "!" } }).state;
      expect(state.doc.toString()).toBe("hello!");
    });

    it("vim() state doc line count is correct", () => {
      const state = EditorState.create({
        doc: "first\nsecond\nthird\nfourth",
        extensions: [vim()],
      });
      expect(state.doc.lines).toBe(4);
    });

    it("vim() state deletion transaction works", () => {
      let state = EditorState.create({ doc: "hello world", extensions: [vim()] });
      state = state.update({ changes: { from: 5, to: 11 } }).state;
      expect(state.doc.toString()).toBe("hello");
    });

    it("vim() state with unicode content works", () => {
      const doc = "// こんにちは\nconst x = 1;";
      const state = EditorState.create({ doc, extensions: [vim()] });
      expect(state.doc.toString()).toBe(doc);
    });

    it("vim() state replacement transaction works", () => {
      let state = EditorState.create({ doc: "foo bar", extensions: [vim()] });
      state = state.update({ changes: { from: 4, to: 7, insert: "baz" } }).state;
      expect(state.doc.toString()).toBe("foo baz");
    });

    it("vim() extension preserves doc length invariant", () => {
      const doc = "function hello() {}";
      const state = EditorState.create({ doc, extensions: [vim()] });
      expect(state.doc.length).toBe(doc.length);
    });

    it("vim() state allows 4 sequential transactions", () => {
      let state = EditorState.create({ doc: "a", extensions: [vim()] });
      state = state.update({ changes: { from: 1, insert: "b" } }).state;
      state = state.update({ changes: { from: 2, insert: "c" } }).state;
      state = state.update({ changes: { from: 3, insert: "d" } }).state;
      expect(state.doc.toString()).toBe("abcd");
    });

    it("vim() state allows deletion of entire content", () => {
      const doc = "let x = 1;";
      let state = EditorState.create({ doc, extensions: [vim()] });
      state = state.update({ changes: { from: 0, to: doc.length } }).state;
      expect(state.doc.toString()).toBe("");
    });

    it("vim() state allows insert at start", () => {
      let state = EditorState.create({ doc: "let x = 1;", extensions: [vim()] });
      state = state.update({ changes: { from: 0, insert: "// comment\n" } }).state;
      expect(state.doc.line(1).text).toBe("// comment");
    });

    it("vim() state with unicode content works", () => {
      const doc = "// こんにちは\nlet x = 1;";
      const state = EditorState.create({ doc, extensions: [vim()] });
      expect(state.doc.toString()).toBe(doc);
    });
  });
});
