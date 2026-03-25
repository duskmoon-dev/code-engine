import { describe, it, expect } from "bun:test";
import { basicSetup, minimalSetup, EditorView } from "../src/setup";
import { EditorState } from "../src/core/state/index";

describe("Setup module re-exports", () => {
  it("re-exports EditorView from setup", () => {
    expect(EditorView).toBeDefined();
    expect(typeof EditorView).toBe("function");
  });
});

describe("Setup extensions", () => {
  describe("basicSetup", () => {
    it("exports basicSetup", () => {
      expect(basicSetup).toBeDefined();
    });

    it("is an array", () => {
      expect(Array.isArray(basicSetup)).toBe(true);
    });

    it("has multiple entries", () => {
      expect((basicSetup as unknown[]).length).toBeGreaterThan(0);
    });

    it("integrates with EditorState", () => {
      const state = EditorState.create({
        doc: "hello world",
        extensions: basicSetup,
      });
      expect(state.doc.toString()).toBe("hello world");
    });
  });

  describe("minimalSetup", () => {
    it("exports minimalSetup", () => {
      expect(minimalSetup).toBeDefined();
    });

    it("is an array", () => {
      expect(Array.isArray(minimalSetup)).toBe(true);
    });

    it("has at least one entry", () => {
      expect((minimalSetup as unknown[]).length).toBeGreaterThan(0);
    });

    it("has fewer entries than basicSetup", () => {
      expect((minimalSetup as unknown[]).length).toBeLessThan(
        (basicSetup as unknown[]).length,
      );
    });

    it("integrates with EditorState", () => {
      const state = EditorState.create({
        doc: "minimal editor",
        extensions: minimalSetup,
      });
      expect(state.doc.toString()).toBe("minimal editor");
    });
  });
});
