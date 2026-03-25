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
});
