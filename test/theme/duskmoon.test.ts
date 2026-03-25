import { describe, it, expect } from "bun:test";
import { duskMoon, duskMoonTheme, duskMoonHighlightStyle } from "../../src/theme/duskmoon";
import { EditorState } from "../../src/core/state/index";

describe("theme/duskmoon", () => {
  describe("duskMoonTheme", () => {
    it("is a function", () => {
      expect(typeof duskMoonTheme).toBe("function");
    });

    it("returns a defined value when called with no arguments", () => {
      const result = duskMoonTheme();
      expect(result).toBeDefined();
    });

    it("returns a defined value when called with dark: false", () => {
      const result = duskMoonTheme({ dark: false });
      expect(result).toBeDefined();
    });

    it("returns a defined value when called with dark: true", () => {
      const result = duskMoonTheme({ dark: true });
      expect(result).toBeDefined();
    });
  });

  describe("duskMoonHighlightStyle", () => {
    it("is a function", () => {
      expect(typeof duskMoonHighlightStyle).toBe("function");
    });

    it("returns a defined value when called", () => {
      const result = duskMoonHighlightStyle();
      expect(result).toBeDefined();
    });
  });

  describe("duskMoon", () => {
    it("is a function", () => {
      expect(typeof duskMoon).toBe("function");
    });

    it("returns a defined value when called with no arguments", () => {
      const result = duskMoon();
      expect(result).toBeDefined();
    });

    it("returns an array with two entries (theme + highlight)", () => {
      const result = duskMoon();
      expect(Array.isArray(result)).toBe(true);
      expect((result as unknown[]).length).toBe(2);
    });

    it("returns a defined value when called with dark: true", () => {
      const result = duskMoon({ dark: true });
      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
      expect((result as unknown[]).length).toBe(2);
    });

    it("can be used as an EditorState extension (light)", () => {
      const state = EditorState.create({
        doc: "hello",
        extensions: [duskMoon()],
      });
      expect(state.doc.toString()).toBe("hello");
    });

    it("can be used as an EditorState extension (dark)", () => {
      const state = EditorState.create({
        doc: "world",
        extensions: [duskMoon({ dark: true })],
      });
      expect(state.doc.toString()).toBe("world");
    });
  });

  describe("duskMoonHighlightStyle return type", () => {
    it("returns an array of extensions", () => {
      const hl = duskMoonHighlightStyle();
      expect(Array.isArray(hl)).toBe(true);
      expect((hl as unknown[]).length).toBeGreaterThan(0);
    });
  });
});
