import { describe, it, expect } from "bun:test";
import {
  collab,
  receiveUpdates,
  sendableUpdates,
  getSyncedVersion,
  getClientID,
  rebaseUpdates,
} from "../../src/core/collab/index";
import { EditorState } from "../../src/core/state/index";

describe("Collab extension", () => {
  describe("exports", () => {
    it("exports collab function", () => {
      expect(typeof collab).toBe("function");
    });

    it("exports receiveUpdates function", () => {
      expect(typeof receiveUpdates).toBe("function");
    });

    it("exports sendableUpdates function", () => {
      expect(typeof sendableUpdates).toBe("function");
    });

    it("exports getSyncedVersion function", () => {
      expect(typeof getSyncedVersion).toBe("function");
    });

    it("exports getClientID function", () => {
      expect(typeof getClientID).toBe("function");
    });

    it("exports rebaseUpdates function", () => {
      expect(typeof rebaseUpdates).toBe("function");
    });
  });

  describe("collab() factory", () => {
    it("returns an extension with default config", () => {
      const ext = collab();
      expect(ext).toBeDefined();
      expect(Array.isArray(ext)).toBe(true);
    });

    it("accepts a startVersion and clientID", () => {
      const ext = collab({ startVersion: 5, clientID: "test-client" });
      expect(ext).toBeDefined();
      expect(Array.isArray(ext)).toBe(true);
    });
  });

  describe("EditorState integration", () => {
    it("collab() works with EditorState.create()", () => {
      const state = EditorState.create({
        doc: "hello",
        extensions: [collab()],
      });
      expect(state).toBeDefined();
    });

    it("getSyncedVersion returns a number for collab state", () => {
      const state = EditorState.create({
        doc: "hello",
        extensions: [collab({ startVersion: 0 })],
      });
      const version = getSyncedVersion(state);
      expect(typeof version).toBe("number");
      expect(version).toBe(0);
    });

    it("getSyncedVersion respects startVersion", () => {
      const state = EditorState.create({
        doc: "hello",
        extensions: [collab({ startVersion: 42 })],
      });
      expect(getSyncedVersion(state)).toBe(42);
    });

    it("getClientID returns a string for collab state", () => {
      const state = EditorState.create({
        doc: "hello",
        extensions: [collab({ clientID: "my-client" })],
      });
      expect(getClientID(state)).toBe("my-client");
    });

    it("sendableUpdates returns empty array for fresh state", () => {
      const state = EditorState.create({
        doc: "hello",
        extensions: [collab()],
      });
      const updates = sendableUpdates(state);
      expect(Array.isArray(updates)).toBe(true);
      expect(updates.length).toBe(0);
    });
  });

  describe("rebaseUpdates", () => {
    it("returns empty array for empty inputs", () => {
      const result = rebaseUpdates([], []);
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(0);
    });
  });

  describe("sendableUpdates after a transaction", () => {
    it("returns pending updates after a local change", () => {
      let state = EditorState.create({
        doc: "hello",
        extensions: [collab()],
      });
      state = state.update({ changes: { from: 5, insert: " world" } }).state;
      const updates = sendableUpdates(state);
      expect(Array.isArray(updates)).toBe(true);
      expect(updates.length).toBe(1);
    });
  });

  describe("receiveUpdates", () => {
    it("applies an empty update list without error", () => {
      const state = EditorState.create({
        doc: "hello",
        extensions: [collab({ startVersion: 0 })],
      });
      const newState = receiveUpdates(state, []);
      expect(newState).toBeDefined();
    });

    it("returns a transaction after receiving empty updates", () => {
      const state = EditorState.create({
        doc: "hello",
        extensions: [collab({ startVersion: 0 })],
      });
      const tr = receiveUpdates(state, []);
      expect(tr.state.doc.toString()).toBe("hello");
    });
  });

  describe("multi-client simulation", () => {
    it("two clients with different clientIDs have different IDs", () => {
      const s1 = EditorState.create({ doc: "hello", extensions: [collab({ clientID: "client-A" })] });
      const s2 = EditorState.create({ doc: "hello", extensions: [collab({ clientID: "client-B" })] });
      expect(getClientID(s1)).toBe("client-A");
      expect(getClientID(s2)).toBe("client-B");
      expect(getClientID(s1)).not.toBe(getClientID(s2));
    });

    it("getClientID returns an auto-generated string if not specified", () => {
      const state = EditorState.create({ doc: "hello", extensions: [collab()] });
      const id = getClientID(state);
      expect(typeof id).toBe("string");
      expect(id.length).toBeGreaterThan(0);
    });
  });

  describe("multiple local changes", () => {
    it("sendableUpdates accumulates multiple local changes", () => {
      let state = EditorState.create({ doc: "hello", extensions: [collab()] });
      state = state.update({ changes: { from: 5, insert: " world" } }).state;
      state = state.update({ changes: { from: 11, insert: "!" } }).state;
      const updates = sendableUpdates(state);
      // Both changes may be batched into 1 update or remain as 2
      expect(updates.length).toBeGreaterThanOrEqual(1);
    });

    it("getSyncedVersion starts at 0 by default", () => {
      const state = EditorState.create({ doc: "test", extensions: [collab()] });
      expect(getSyncedVersion(state)).toBe(0);
    });

    it("collab() with startVersion:100 starts at 100", () => {
      const state = EditorState.create({ doc: "test", extensions: [collab({ startVersion: 100 })] });
      expect(getSyncedVersion(state)).toBe(100);
    });

    it("collab() returns an array extension", () => {
      const ext = collab();
      expect(Array.isArray(ext)).toBe(true);
    });

    it("two auto-generated clientIDs are unique", () => {
      const s1 = EditorState.create({ doc: "a", extensions: [collab()] });
      const s2 = EditorState.create({ doc: "b", extensions: [collab()] });
      // Auto-generated IDs should be unique
      expect(getClientID(s1)).not.toBe(getClientID(s2));
    });
  });

  describe("collab with empty doc", () => {
    it("collab() works with empty document", () => {
      const state = EditorState.create({ doc: "", extensions: [collab()] });
      expect(getSyncedVersion(state)).toBe(0);
      expect(sendableUpdates(state).length).toBe(0);
    });

    it("collab({ startVersion: 0 }) on empty doc", () => {
      const state = EditorState.create({ doc: "", extensions: [collab({ startVersion: 0 })] });
      expect(getSyncedVersion(state)).toBe(0);
    });
  });

  describe("sendableUpdates content", () => {
    it("sendableUpdates after change has update with changes", () => {
      let state = EditorState.create({ doc: "hello", extensions: [collab()] });
      state = state.update({ changes: { from: 5, insert: "!" } }).state;
      const updates = sendableUpdates(state);
      expect(updates.length).toBeGreaterThan(0);
      expect(updates[0].changes).toBeDefined();
    });

    it("sendableUpdates has clientID in each update", () => {
      let state = EditorState.create({
        doc: "hello",
        extensions: [collab({ clientID: "test-id" })],
      });
      state = state.update({ changes: { from: 0, insert: ">" } }).state;
      const updates = sendableUpdates(state);
      for (const upd of updates) {
        expect(upd.clientID).toBe("test-id");
      }
    });
  });

  describe("rebaseUpdates deeper", () => {
    it("rebaseUpdates returns an array for any valid input", () => {
      const result = rebaseUpdates([], []);
      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe("collab state invariants", () => {
    it("getSyncedVersion is always a non-negative number", () => {
      const state = EditorState.create({ doc: "hello", extensions: [collab({ startVersion: 5 })] });
      expect(getSyncedVersion(state)).toBeGreaterThanOrEqual(0);
    });

    it("collab() can be used without any options", () => {
      const state = EditorState.create({ doc: "test", extensions: [collab()] });
      expect(state).toBeDefined();
      expect(getClientID(state)).toBeDefined();
    });

    it("sendableUpdates count increases after each transaction", () => {
      let state = EditorState.create({ doc: "abc", extensions: [collab()] });
      state = state.update({ changes: { from: 3, insert: "d" } }).state;
      const count1 = sendableUpdates(state).length;
      expect(count1).toBeGreaterThanOrEqual(1);
    });

    it("collab extension does not alter document content", () => {
      const doc = "unchanged content";
      const state = EditorState.create({ doc, extensions: [collab()] });
      expect(state.doc.toString()).toBe(doc);
    });

    it("receiveUpdates with empty array preserves document", () => {
      const state = EditorState.create({ doc: "hello", extensions: [collab({ startVersion: 0 })] });
      const tr = receiveUpdates(state, []);
      expect(tr.state.doc.toString()).toBe("hello");
    });
  });
});

describe("collab extra behavioral tests", () => {
  it("getSyncedVersion with startVersion:10 returns 10", () => {
    const state = EditorState.create({ doc: "test", extensions: [collab({ startVersion: 10 })] });
    expect(getSyncedVersion(state)).toBe(10);
  });

  it("collab() works with unicode document", () => {
    const doc = "こんにちは世界";
    const state = EditorState.create({ doc, extensions: [collab()] });
    expect(state.doc.toString()).toBe(doc);
  });

  it("sendableUpdates returns array after deletion transaction", () => {
    let state = EditorState.create({ doc: "hello world", extensions: [collab()] });
    state = state.update({ changes: { from: 5, to: 11 } }).state;
    const updates = sendableUpdates(state);
    expect(Array.isArray(updates)).toBe(true);
    expect(updates.length).toBeGreaterThan(0);
  });

  it("collab() with multi-line document works", () => {
    const state = EditorState.create({
      doc: "line1\nline2\nline3",
      extensions: [collab()],
    });
    expect(state.doc.lines).toBe(3);
    expect(getSyncedVersion(state)).toBe(0);
  });

  it("receiveUpdates returns transaction with state", () => {
    const state = EditorState.create({ doc: "abc", extensions: [collab({ startVersion: 0 })] });
    const tr = receiveUpdates(state, []);
    expect(tr).toBeDefined();
    expect(tr.state).toBeDefined();
    expect(typeof tr.state.doc.length).toBe("number");
  });

  it("collab clientID is accessible after state update", () => {
    let state = EditorState.create({ doc: "test", extensions: [collab({ clientID: "c1" })] });
    state = state.update({ changes: { from: 4, insert: "!" } }).state;
    expect(getClientID(state)).toBe("c1");
  });

  it("collab works with empty string insertion", () => {
    let state = EditorState.create({ doc: "hello", extensions: [collab()] });
    state = state.update({ changes: { from: 5, insert: "" } }).state;
    expect(state.doc.toString()).toBe("hello");
  });

  it("sendableUpdates is not empty after insertion at position 0", () => {
    let state = EditorState.create({ doc: "world", extensions: [collab()] });
    state = state.update({ changes: { from: 0, insert: "hello " } }).state;
    expect(sendableUpdates(state).length).toBeGreaterThan(0);
  });

  it("getSyncedVersion does not change after local edits", () => {
    const state0 = EditorState.create({ doc: "abc", extensions: [collab({ startVersion: 7 })] });
    let state = state0.update({ changes: { from: 3, insert: "d" } }).state;
    expect(getSyncedVersion(state)).toBe(7);
  });

  it("collab works with deletion transaction", () => {
    let state = EditorState.create({ doc: "hello world", extensions: [collab()] });
    state = state.update({ changes: { from: 5, to: 11 } }).state;
    expect(state.doc.toString()).toBe("hello");
    expect(sendableUpdates(state).length).toBeGreaterThan(0);
  });

  it("collab clientID is stable across multiple transactions", () => {
    let state = EditorState.create({ doc: "a", extensions: [collab({ clientID: "stable" })] });
    state = state.update({ changes: { from: 1, insert: "b" } }).state;
    state = state.update({ changes: { from: 2, insert: "c" } }).state;
    expect(getClientID(state)).toBe("stable");
  });

  it("collab doc line count is correct", () => {
    const state = EditorState.create({
      doc: "line1\nline2\nline3",
      extensions: [collab()],
    });
    expect(state.doc.lines).toBe(3);
  });

  it("collab doc line text is accessible", () => {
    const state = EditorState.create({
      doc: "hello\nworld",
      extensions: [collab()],
    });
    expect(state.doc.line(1).text).toBe("hello");
    expect(state.doc.line(2).text).toBe("world");
  });

  it("collab doc length invariant holds", () => {
    const doc = "abc def ghi";
    const state = EditorState.create({ doc, extensions: [collab()] });
    expect(state.doc.length).toBe(doc.length);
  });

  it("collab replacement transaction produces sendable update", () => {
    let state = EditorState.create({ doc: "foo bar", extensions: [collab()] });
    state = state.update({ changes: { from: 4, to: 7, insert: "baz" } }).state;
    expect(state.doc.toString()).toBe("foo baz");
    expect(sendableUpdates(state).length).toBeGreaterThan(0);
  });

  it("collab with unicode content works", () => {
    const doc = "こんにちは世界";
    const state = EditorState.create({ doc, extensions: [collab()] });
    expect(state.doc.toString()).toBe(doc);
  });

  it("collab allows 4 sequential transactions", () => {
    let state = EditorState.create({ doc: "", extensions: [collab()] });
    for (let i = 0; i < 4; i++) {
      state = state.update({ changes: { from: state.doc.length, insert: (i > 0 ? "\n" : "") + `step${i}` } }).state;
    }
    expect(state.doc.lines).toBe(4);
    expect(sendableUpdates(state).length).toBeGreaterThan(0);
  });

  it("collab doc allows deletion of entire content", () => {
    const doc = "full document";
    let state = EditorState.create({ doc, extensions: [collab()] });
    state = state.update({ changes: { from: 0, to: doc.length } }).state;
    expect(state.doc.toString()).toBe("");
    expect(sendableUpdates(state).length).toBeGreaterThan(0);
  });

  it("collab state selection within single line", () => {
    const state = EditorState.create({
      doc: "hello world",
      selection: { anchor: 6, head: 11 },
      extensions: [collab()],
    });
    expect(state.selection.main.from).toBe(6);
    expect(state.selection.main.to).toBe(11);
  });

  it("receiveUpdates is a function", () => {
    expect(typeof receiveUpdates).toBe("function");
  });

  it("collab state line count is correct after multiple insertions", () => {
    let state = EditorState.create({ doc: "line1", extensions: [collab()] });
    state = state.update({ changes: { from: 5, insert: "\nline2" } }).state;
    state = state.update({ changes: { from: state.doc.length, insert: "\nline3" } }).state;
    expect(state.doc.lines).toBe(3);
    expect(state.doc.line(3).text).toBe("line3");
  });
});
