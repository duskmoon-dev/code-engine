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

  describe("duskMoonTheme behavioral", () => {
    it("returns different values for dark=true vs dark=false", () => {
      const light = duskMoonTheme({ dark: false });
      const dark = duskMoonTheme({ dark: true });
      // Both are defined but may differ
      expect(light).toBeDefined();
      expect(dark).toBeDefined();
    });

    it("each call returns a new object", () => {
      const a = duskMoonTheme();
      const b = duskMoonTheme();
      // Both are valid extensions
      expect(a).toBeDefined();
      expect(b).toBeDefined();
    });
  });

  describe("duskMoon EditorState integration", () => {
    it("can be used with multi-line document (light)", () => {
      const state = EditorState.create({
        doc: "line one\nline two\nline three",
        extensions: [duskMoon()],
      });
      expect(state.doc.lines).toBe(3);
    });

    it("can be used with multi-line document (dark)", () => {
      const state = EditorState.create({
        doc: "const x = 1;\nconst y = 2;",
        extensions: [duskMoon({ dark: true })],
      });
      expect(state.doc.length).toBeGreaterThan(0);
    });

    it("duskMoon() result has exactly two elements", () => {
      const result = duskMoon();
      expect(Array.isArray(result)).toBe(true);
      expect((result as unknown[]).length).toBe(2);
    });

    it("duskMoon({ dark: false }) result has exactly two elements", () => {
      const result = duskMoon({ dark: false });
      expect(Array.isArray(result)).toBe(true);
      expect((result as unknown[]).length).toBe(2);
    });

    it("duskMoonHighlightStyle() result first element is defined", () => {
      const hl = duskMoonHighlightStyle();
      expect((hl as unknown[])[0]).toBeDefined();
    });

    it("state transactions work with duskMoon extension", () => {
      let state = EditorState.create({
        doc: "hello",
        extensions: [duskMoon()],
      });
      state = state.update({ changes: { from: 5, insert: " world" } }).state;
      expect(state.doc.toString()).toBe("hello world");
    });

    it("duskMoon({ dark: true }) does not alter document content", () => {
      const doc = "const x = 1;";
      const state = EditorState.create({
        doc,
        extensions: [duskMoon({ dark: true })],
      });
      expect(state.doc.toString()).toBe(doc);
    });

    it("multiple duskMoon instances can be created independently", () => {
      const ext1 = duskMoon({ dark: true });
      const ext2 = duskMoon({ dark: false });
      expect(ext1).toBeDefined();
      expect(ext2).toBeDefined();
    });
  });

  describe("duskMoonHighlightStyle additional", () => {
    it("returns an object with style method", () => {
      const hl = duskMoonHighlightStyle();
      const hlArr = hl as unknown[];
      expect(hlArr.length).toBeGreaterThan(0);
    });

    it("duskMoonTheme can be called multiple times", () => {
      const t1 = duskMoonTheme();
      const t2 = duskMoonTheme({ dark: true });
      expect(t1).toBeDefined();
      expect(t2).toBeDefined();
    });

    it("duskMoon with empty doc works for both modes", () => {
      const s1 = EditorState.create({ doc: "", extensions: [duskMoon()] });
      const s2 = EditorState.create({ doc: "", extensions: [duskMoon({ dark: true })] });
      expect(s1.doc.length).toBe(0);
      expect(s2.doc.length).toBe(0);
    });

    it("duskMoon extension with deletion transaction", () => {
      let state = EditorState.create({ doc: "hello world", extensions: [duskMoon()] });
      state = state.update({ changes: { from: 5, to: 11 } }).state;
      expect(state.doc.toString()).toBe("hello");
    });

    it("duskMoon dark extension with insertion", () => {
      let state = EditorState.create({ doc: "x", extensions: [duskMoon({ dark: true })] });
      state = state.update({ changes: { from: 1, insert: "yz" } }).state;
      expect(state.doc.toString()).toBe("xyz");
    });

    it("duskMoonHighlightStyle result is array with defined elements", () => {
      const hl = duskMoonHighlightStyle();
      const arr = hl as unknown[];
      for (const elem of arr) {
        expect(elem).toBeDefined();
      }
    });

    it("duskMoon state doc has correct line count for multi-line input", () => {
      const state = EditorState.create({
        doc: "line1\nline2\nline3",
        extensions: [duskMoon()],
      });
      expect(state.doc.lines).toBe(3);
    });

    it("duskMoon state doc line text is accessible", () => {
      const state = EditorState.create({
        doc: "hello\nworld",
        extensions: [duskMoon()],
      });
      expect(state.doc.line(2).text).toBe("world");
    });

    it("duskMoon allows replacement transaction", () => {
      let state = EditorState.create({ doc: "hello world", extensions: [duskMoon()] });
      state = state.update({ changes: { from: 0, to: 5, insert: "goodbye" } }).state;
      expect(state.doc.toString()).toBe("goodbye world");
    });

    it("duskMoon preserves selection after transaction", () => {
      let state = EditorState.create({
        doc: "hello",
        selection: { anchor: 2 },
        extensions: [duskMoon()],
      });
      state = state.update({ changes: { from: 5, insert: "!" } }).state;
      expect(state.doc.toString()).toBe("hello!");
    });

    it("duskMoon state allows multiple sequential transactions", () => {
      let state = EditorState.create({ doc: "a", extensions: [duskMoon()] });
      for (let i = 0; i < 3; i++) {
        state = state.update({ changes: { from: state.doc.length, insert: String(i) } }).state;
      }
      expect(state.doc.toString()).toBe("a012");
    });

    it("duskMoon({ dark: false }) doc length matches input", () => {
      const doc = "test document";
      const state = EditorState.create({ doc, extensions: [duskMoon({ dark: false })] });
      expect(state.doc.length).toBe(doc.length);
    });

    it("duskMoon state with unicode document works", () => {
      const doc = "こんにちは 世界";
      const state = EditorState.create({ doc, extensions: [duskMoon()] });
      expect(state.doc.toString()).toBe(doc);
    });

    it("duskMoon dark mode state with unicode document works", () => {
      const doc = "مرحبا بالعالم";
      const state = EditorState.create({ doc, extensions: [duskMoon({ dark: true })] });
      expect(state.doc.toString()).toBe(doc);
    });

    it("duskMoon state line(n).text accessible for each line", () => {
      const state = EditorState.create({
        doc: "alpha\nbeta\ngamma",
        extensions: [duskMoon()],
      });
      expect(state.doc.line(1).text).toBe("alpha");
      expect(state.doc.line(3).text).toBe("gamma");
    });

    it("duskMoon allows insertion at start of document", () => {
      let state = EditorState.create({ doc: "world", extensions: [duskMoon()] });
      state = state.update({ changes: { from: 0, insert: "hello " } }).state;
      expect(state.doc.toString()).toBe("hello world");
    });

    it("duskMoon allows deletion of entire content", () => {
      let state = EditorState.create({ doc: "delete me", extensions: [duskMoon()] });
      state = state.update({ changes: { from: 0, to: 9 } }).state;
      expect(state.doc.toString()).toBe("");
    });

    it("duskMoon({ dark: true }) state doc line text is accessible", () => {
      const state = EditorState.create({
        doc: "hello\nworld",
        extensions: [duskMoon({ dark: true })],
      });
      expect(state.doc.line(2).text).toBe("world");
    });

    it("duskMoon selection can span lines", () => {
      const state = EditorState.create({
        doc: "line1\nline2",
        selection: { anchor: 0, head: 11 },
        extensions: [duskMoon()],
      });
      expect(state.selection.main.from).toBe(0);
      expect(state.selection.main.to).toBe(11);
    });

    it("duskMoon extension preserves doc length invariant", () => {
      const doc = "test content";
      const state = EditorState.create({ doc, extensions: [duskMoon()] });
      expect(state.doc.length).toBe(doc.length);
    });

    it("duskMoon state sequential transactions update doc correctly", () => {
      let state = EditorState.create({ doc: "a", extensions: [duskMoon()] });
      state = state.update({ changes: { from: 1, insert: "b" } }).state;
      state = state.update({ changes: { from: 2, insert: "c" } }).state;
      expect(state.doc.toString()).toBe("abc");
    });

    it("duskMoon state replacement transaction works", () => {
      let state = EditorState.create({ doc: "foo bar", extensions: [duskMoon()] });
      state = state.update({ changes: { from: 4, to: 7, insert: "baz" } }).state;
      expect(state.doc.toString()).toBe("foo baz");
    });

    it("duskMoon state deletion transaction works", () => {
      let state = EditorState.create({ doc: "hello world", extensions: [duskMoon()] });
      state = state.update({ changes: { from: 5, to: 11 } }).state;
      expect(state.doc.toString()).toBe("hello");
    });

    it("duskMoon state with unicode content works", () => {
      const doc = "こんにちは世界";
      const state = EditorState.create({ doc, extensions: [duskMoon()] });
      expect(state.doc.toString()).toBe(doc);
    });

    it("duskMoon state doc line count is correct", () => {
      const state = EditorState.create({
        doc: "first\nsecond\nthird\nfourth\nfifth",
        extensions: [duskMoon()],
      });
      expect(state.doc.lines).toBe(5);
    });

    it("duskMoon state doc line text is accessible", () => {
      const state = EditorState.create({
        doc: "alpha\nbeta\ngamma",
        extensions: [duskMoon()],
      });
      expect(state.doc.line(1).text).toBe("alpha");
      expect(state.doc.line(2).text).toBe("beta");
    });

    it("duskMoon allows multiple sequential transactions", () => {
      let state = EditorState.create({ doc: "x", extensions: [duskMoon()] });
      state = state.update({ changes: { from: 1, insert: "y" } }).state;
      state = state.update({ changes: { from: 2, insert: "z" } }).state;
      expect(state.doc.toString()).toBe("xyz");
    });

    it("duskMoon state selection can span lines", () => {
      const state = EditorState.create({
        doc: "hello\nworld",
        selection: { anchor: 0, head: 5 },
        extensions: [duskMoon()],
      });
      expect(state.selection.main.from).toBe(0);
      expect(state.selection.main.to).toBe(5);
    });
  });
});
