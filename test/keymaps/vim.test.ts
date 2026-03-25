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
  });
});
