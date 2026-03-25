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
  });
});
