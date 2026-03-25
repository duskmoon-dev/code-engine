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

  describe("basicSetup behavioral tests", () => {
    it("preserves multi-line document", () => {
      const state = EditorState.create({
        doc: "line 1\nline 2\nline 3",
        extensions: basicSetup,
      });
      expect(state.doc.lines).toBe(3);
    });

    it("document is mutable via transactions", () => {
      let state = EditorState.create({
        doc: "hello",
        extensions: basicSetup,
      });
      state = state.update({ changes: { from: 5, insert: " world" } }).state;
      expect(state.doc.toString()).toBe("hello world");
    });
  });

  describe("minimalSetup behavioral tests", () => {
    it("preserves multi-line document", () => {
      const state = EditorState.create({
        doc: "a\nb\nc",
        extensions: minimalSetup,
      });
      expect(state.doc.lines).toBe(3);
    });

    it("document is mutable via transactions", () => {
      let state = EditorState.create({
        doc: "abc",
        extensions: minimalSetup,
      });
      state = state.update({ changes: { from: 3, insert: "def" } }).state;
      expect(state.doc.toString()).toBe("abcdef");
    });
  });

  describe("basicSetup and minimalSetup relationship", () => {
    it("basicSetup contains more extensions than minimalSetup", () => {
      const basic = (basicSetup as unknown[]).length;
      const minimal = (minimalSetup as unknown[]).length;
      expect(basic).toBeGreaterThan(minimal);
    });

    it("both work with empty string document", () => {
      const s1 = EditorState.create({ doc: "", extensions: basicSetup });
      const s2 = EditorState.create({ doc: "", extensions: minimalSetup });
      expect(s1.doc.length).toBe(0);
      expect(s2.doc.length).toBe(0);
    });

    it("basicSetup allows deletion transactions", () => {
      let state = EditorState.create({ doc: "hello world", extensions: basicSetup });
      state = state.update({ changes: { from: 5, to: 11 } }).state;
      expect(state.doc.toString()).toBe("hello");
    });

    it("minimalSetup allows deletion transactions", () => {
      let state = EditorState.create({ doc: "hello world", extensions: minimalSetup });
      state = state.update({ changes: { from: 5, to: 11 } }).state;
      expect(state.doc.toString()).toBe("hello");
    });

    it("basicSetup preserves selection after transaction", () => {
      let state = EditorState.create({
        doc: "hello",
        selection: { anchor: 0 },
        extensions: basicSetup,
      });
      state = state.update({ changes: { from: 5, insert: "!" } }).state;
      expect(state.doc.toString()).toBe("hello!");
    });

    it("minimalSetup state doc has correct line count after insertion", () => {
      let state = EditorState.create({ doc: "one\ntwo", extensions: minimalSetup });
      state = state.update({ changes: { from: 7, insert: "\nthree" } }).state;
      expect(state.doc.lines).toBe(3);
    });
  });
});
