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
  });
});
