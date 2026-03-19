import { describe, it, expect } from "bun:test";
import { duskMoon, duskMoonTheme, duskMoonHighlightStyle } from "../../src/theme/duskmoon";

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
  });
});
