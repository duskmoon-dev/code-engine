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
});
