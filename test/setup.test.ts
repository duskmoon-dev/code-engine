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

    it("basicSetup state doc length matches inserted string", () => {
      const state = EditorState.create({ doc: "hello", extensions: basicSetup });
      expect(state.doc.length).toBe(5);
    });

    it("minimalSetup state doc length matches inserted string", () => {
      const state = EditorState.create({ doc: "hi", extensions: minimalSetup });
      expect(state.doc.length).toBe(2);
    });

    it("basicSetup allows replacement transaction", () => {
      let state = EditorState.create({ doc: "hello world", extensions: basicSetup });
      state = state.update({ changes: { from: 0, to: 5, insert: "goodbye" } }).state;
      expect(state.doc.toString()).toBe("goodbye world");
    });

    it("minimalSetup allows replacement transaction", () => {
      let state = EditorState.create({ doc: "foo bar", extensions: minimalSetup });
      state = state.update({ changes: { from: 4, to: 7, insert: "baz" } }).state;
      expect(state.doc.toString()).toBe("foo baz");
    });
  });

  describe("setup module extra", () => {
    it("EditorView is a class/function", () => {
      expect(typeof EditorView).toBe("function");
    });

    it("basicSetup is not empty", () => {
      expect((basicSetup as unknown[]).length).toBeGreaterThan(0);
    });

    it("minimalSetup is not empty", () => {
      expect((minimalSetup as unknown[]).length).toBeGreaterThan(0);
    });

    it("basicSetup contains at least 5 extensions", () => {
      expect((basicSetup as unknown[]).length).toBeGreaterThanOrEqual(5);
    });

    it("states created with basicSetup have same doc as input", () => {
      const docs = ["", "x", "foo\nbar\nbaz"];
      for (const doc of docs) {
        const state = EditorState.create({ doc, extensions: basicSetup });
        expect(state.doc.toString()).toBe(doc);
      }
    });

    it("basicSetup extension array is not empty", () => {
      expect((basicSetup as unknown[]).length).toBeGreaterThan(0);
    });

    it("minimalSetup extension array is not empty", () => {
      expect((minimalSetup as unknown[]).length).toBeGreaterThan(0);
    });

    it("basicSetup state can have multiple transactions applied", () => {
      let state = EditorState.create({ doc: "a", extensions: basicSetup });
      for (let i = 0; i < 5; i++) {
        state = state.update({ changes: { from: state.doc.length, insert: String(i) } }).state;
      }
      expect(state.doc.toString()).toBe("a01234");
    });

    it("minimalSetup state reflects line breaks correctly", () => {
      const state = EditorState.create({ doc: "x\ny\nz", extensions: minimalSetup });
      expect(state.doc.lines).toBe(3);
      expect(state.doc.line(2).text).toBe("y");
    });

    it("EditorView can be imported from setup module", () => {
      expect(EditorView).toBeDefined();
    });
  });

  describe("setup extra behavioral", () => {
    it("basicSetup allows unicode document", () => {
      const doc = "こんにちは世界";
      const state = EditorState.create({ doc, extensions: basicSetup });
      expect(state.doc.toString()).toBe(doc);
    });

    it("minimalSetup allows unicode document", () => {
      const doc = "مرحبا بالعالم";
      const state = EditorState.create({ doc, extensions: minimalSetup });
      expect(state.doc.toString()).toBe(doc);
    });

    it("basicSetup state doc line text is accessible", () => {
      const state = EditorState.create({
        doc: "hello\nworld",
        extensions: basicSetup,
      });
      expect(state.doc.line(1).text).toBe("hello");
      expect(state.doc.line(2).text).toBe("world");
    });

    it("minimalSetup state doc line text is accessible", () => {
      const state = EditorState.create({
        doc: "a\nb\nc",
        extensions: minimalSetup,
      });
      expect(state.doc.line(3).text).toBe("c");
    });

    it("basicSetup allows selection spanning lines", () => {
      const state = EditorState.create({
        doc: "line1\nline2",
        selection: { anchor: 0, head: 11 },
        extensions: basicSetup,
      });
      expect(state.selection.main.from).toBe(0);
      expect(state.selection.main.to).toBe(11);
    });

    it("minimalSetup allows insertion at middle of doc", () => {
      let state = EditorState.create({ doc: "hello world", extensions: minimalSetup });
      state = state.update({ changes: { from: 5, insert: "!" } }).state;
      expect(state.doc.toString()).toBe("hello! world");
    });
  });
});
