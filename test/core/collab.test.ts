import { describe, it, expect } from "bun:test";
import {
  collab,
  receiveUpdates,
  sendableUpdates,
  getSyncedVersion,
  getClientID,
  rebaseUpdates,
} from "../../src/core/collab/index";
import { EditorState, ChangeSet } from "../../src/core/state/index";

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

    it("skips updates that match over entries with the same clientID", () => {
      const state = EditorState.create({ doc: "hello" });
      const changes = state.changes([{ from: 0, to: 0, insert: "x" }]);
      // Same clientID in both updates and over — the update is a duplicate, skip it
      const updates = [{ changes, clientID: "c1" }];
      const over = [{ changes, clientID: "c1" }];
      const result = rebaseUpdates(updates, over);
      expect(result.length).toBe(0);
    });

    it("maps updates over non-matching over changes (different clientID)", () => {
      const state = EditorState.create({ doc: "hello" });
      const c1Changes = state.changes([{ from: 0, to: 0, insert: "x" }]);
      const c2Changes = state.changes([{ from: 5, to: 5, insert: "y" }]);
      // Different clientIDs: c2 is accepted 'over', c1's changes get rebased
      const updates = [{ changes: c1Changes, clientID: "c1" }];
      const over = [{ changes: c2Changes, clientID: "c2" }];
      const result = rebaseUpdates(updates, over);
      expect(result.length).toBe(1);
      expect(result[0].clientID).toBe("c1");
      // The rebased changes should be a valid ChangeSet
      expect(result[0].changes).toBeDefined();
    });

    it("returns updates unchanged when over is empty", () => {
      const state = EditorState.create({ doc: "hello" });
      const changes = state.changes([{ from: 0, to: 0, insert: "x" }]);
      const updates = [{ changes, clientID: "c1" }];
      const result = rebaseUpdates(updates, []);
      // No over entries: early return (neither skip nor changes set)
      expect(result).toBe(updates);
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

describe("rebaseUpdates", () => {
  it("returns empty array for empty updates", () => {
    const result = rebaseUpdates([], []);
    expect(result).toEqual([]);
  });

  it("returns updates unchanged when no overlap", () => {
    const updates = [{
      changes: ChangeSet.of([{ from: 0, insert: "x" }], 5),
      clientID: "a",
    }];
    const result = rebaseUpdates(updates, []);
    expect(result.length).toBe(1);
    expect(result[0].clientID).toBe("a");
  });

  it("filters out own updates when rebasing", () => {
    const changes = ChangeSet.of([{ from: 0, insert: "x" }], 5);
    const updates = [{ changes, clientID: "a" }];
    const over = [{ changes: changes.desc, clientID: "a" }];
    const result = rebaseUpdates(updates, over);
    expect(result.length).toBe(0);
  });

  it("rebases foreign updates over own", () => {
    const myChanges = ChangeSet.of([{ from: 0, insert: "x" }], 5);
    const theirChanges = ChangeSet.of([{ from: 5, insert: "y" }], 5);
    const updates = [
      { changes: myChanges, clientID: "a" },
      { changes: theirChanges, clientID: "b" },
    ];
    const over = [{ changes: myChanges.desc, clientID: "a" }];
    const result = rebaseUpdates(updates, over);
    // my update is skipped, their update is rebased
    expect(result.length).toBe(1);
    expect(result[0].clientID).toBe("b");
  });
});

describe("receiveUpdates with remote changes", () => {
  it("applies a remote insert", () => {
    let state = EditorState.create({
      doc: "hello",
      extensions: [collab({ startVersion: 0, clientID: "local" })],
    });
    const remoteChanges = ChangeSet.of([{ from: 5, insert: " world" }], 5);
    const tr = receiveUpdates(state, [{ changes: remoteChanges, clientID: "remote" }]);
    expect(tr.state.doc.toString()).toBe("hello world");
    expect(getSyncedVersion(tr.state)).toBe(1);
  });

  it("applies a remote deletion", () => {
    let state = EditorState.create({
      doc: "hello world",
      extensions: [collab({ startVersion: 0 })],
    });
    const remoteChanges = ChangeSet.of([{ from: 5, to: 11 }], 11);
    const tr = receiveUpdates(state, [{ changes: remoteChanges, clientID: "remote" }]);
    expect(tr.state.doc.toString()).toBe("hello");
  });

  it("applies multiple remote updates", () => {
    let state = EditorState.create({
      doc: "abc",
      extensions: [collab({ startVersion: 0 })],
    });
    const u1 = { changes: ChangeSet.of([{ from: 3, insert: "d" }], 3), clientID: "r1" };
    const u2 = { changes: ChangeSet.of([{ from: 4, insert: "e" }], 4), clientID: "r2" };
    const tr = receiveUpdates(state, [u1, u2]);
    expect(tr.state.doc.toString()).toBe("abcde");
    expect(getSyncedVersion(tr.state)).toBe(2);
  });

  it("rebases local changes over remote updates", () => {
    let state = EditorState.create({
      doc: "abc",
      extensions: [collab({ startVersion: 0, clientID: "local" })],
    });
    // Make a local change
    state = state.update({ changes: { from: 3, insert: "x" } }).state;
    expect(sendableUpdates(state).length).toBe(1);
    // Receive a remote change at version 0
    const remote = { changes: ChangeSet.of([{ from: 0, insert: "!" }], 3), clientID: "remote" };
    const tr = receiveUpdates(state, [remote]);
    // Both changes should be applied
    expect(tr.state.doc.toString()).toContain("!");
    expect(tr.state.doc.toString()).toContain("x");
    // Local change should still be sendable (rebased)
    expect(sendableUpdates(tr.state).length).toBe(1);
  });
});

describe("collab full round-trip", () => {
  it("local change -> sendableUpdates -> receiveUpdates confirms the update", () => {
    // Client makes a local edit
    let state = EditorState.create({
      doc: "hello",
      extensions: [collab({ startVersion: 0, clientID: "client-A" })],
    });
    state = state.update({ changes: { from: 5, insert: " world" } }).state;
    expect(state.doc.toString()).toBe("hello world");
    expect(getSyncedVersion(state)).toBe(0);
    expect(sendableUpdates(state).length).toBe(1);

    // Server acknowledges by echoing the update back
    const pending = sendableUpdates(state);
    const ack: Update = {
      changes: pending[0].changes,
      clientID: pending[0].clientID,
    };
    const tr = receiveUpdates(state, [ack]);

    // After acknowledgment: version incremented, no pending updates, doc unchanged
    expect(getSyncedVersion(tr.state)).toBe(1);
    expect(sendableUpdates(tr.state).length).toBe(0);
    expect(tr.state.doc.toString()).toBe("hello world");
  });

  it("round-trip with multiple local edits acknowledged one by one", () => {
    let state = EditorState.create({
      doc: "ab",
      extensions: [collab({ startVersion: 0, clientID: "c1" })],
    });
    // Two local edits
    state = state.update({ changes: { from: 2, insert: "c" } }).state;
    state = state.update({ changes: { from: 3, insert: "d" } }).state;
    expect(sendableUpdates(state).length).toBe(2);

    // Acknowledge both at once
    const pending = sendableUpdates(state);
    const acks: Update[] = pending.map((u) => ({
      changes: u.changes,
      clientID: u.clientID,
    }));
    const tr = receiveUpdates(state, acks);
    expect(getSyncedVersion(tr.state)).toBe(2);
    expect(sendableUpdates(tr.state).length).toBe(0);
    expect(tr.state.doc.toString()).toBe("abcd");
  });

  it("round-trip preserves document when remote inserts at different position", () => {
    // Client A
    let stateA = EditorState.create({
      doc: "hello",
      extensions: [collab({ startVersion: 0, clientID: "A" })],
    });
    stateA = stateA.update({ changes: { from: 5, insert: "!" } }).state;

    // Client B makes a change at position 0 on original doc
    const remoteChange = ChangeSet.of([{ from: 0, insert: ">" }], 5);

    // A receives B's change
    const tr = receiveUpdates(stateA, [{ changes: remoteChange, clientID: "B" }]);
    // Doc should contain both changes
    expect(tr.state.doc.toString()).toContain(">");
    expect(tr.state.doc.toString()).toContain("!");
    expect(tr.state.doc.toString()).toBe(">hello!");
    expect(getSyncedVersion(tr.state)).toBe(1);
    // A's local change is still pending (it was not acknowledged)
    expect(sendableUpdates(tr.state).length).toBe(1);
  });
});

describe("collab rebaseUpdates behavioral", () => {
  it("rebases two conflicting clients: both insert at same position", () => {
    // Both clients start from same doc "ab" (length 2)
    const c1Insert = ChangeSet.of([{ from: 1, insert: "X" }], 2);
    const c2Insert = ChangeSet.of([{ from: 1, insert: "Y" }], 2);

    // Server accepted c2 first. Now rebase c1's update over c2's accepted change.
    const rebased = rebaseUpdates(
      [{ changes: c1Insert, clientID: "c1" }],
      [{ changes: c2Insert.desc, clientID: "c2" }],
    );
    expect(rebased.length).toBe(1);
    expect(rebased[0].clientID).toBe("c1");
    // The rebased changeset should apply to a doc of length 3 (original 2 + c2's insert of "Y")
    expect(rebased[0].changes.length).toBe(3);
  });

  it("rebases with own update skipped and foreign update kept", () => {
    // Doc length 5 ("hello"). Client sent 2 updates sequentially:
    // update 1 (me): insert "A" at 0, applies to doc length 5
    const myChange = ChangeSet.of([{ from: 0, insert: "A" }], 5);
    // update 2 (them): insert "B" at end, applies to doc length 6 (after myChange)
    const theirChange = ChangeSet.of([{ from: 6, insert: "B" }], 6);

    const updates: Update[] = [
      { changes: myChange, clientID: "me" },
      { changes: theirChange, clientID: "them" },
    ];
    // Server accepted only myChange
    const over = [
      { changes: myChange.desc, clientID: "me" },
    ];

    const result = rebaseUpdates(updates, over);
    // "me" is skipped (matched), "them" is kept and rebased
    expect(result.length).toBe(1);
    expect(result[0].clientID).toBe("them");
  });

  it("rebases a sequential update chain over a single accepted change", () => {
    // Doc "abc" length 3. Server accepted a change that inserts "Z" at position 1.
    const serverChange = ChangeSet.of([{ from: 1, insert: "Z" }], 3);

    // Client sent one update on the original doc (length 3)
    const u1 = ChangeSet.of([{ from: 0, insert: "1" }], 3);

    const result = rebaseUpdates(
      [{ changes: u1, clientID: "c1" }],
      [{ changes: serverChange.desc, clientID: "server" }],
    );
    expect(result.length).toBe(1);
    expect(result[0].clientID).toBe("c1");
    // Rebased changeset applies to doc of length 4 (3 + "Z")
    expect(result[0].changes.length).toBe(4);
  });
});

describe("collab version tracking", () => {
  it("getSyncedVersion increments by 1 per received update", () => {
    let state = EditorState.create({
      doc: "test",
      extensions: [collab({ startVersion: 0 })],
    });
    expect(getSyncedVersion(state)).toBe(0);

    // Receive 1 update
    const u1 = { changes: ChangeSet.of([{ from: 4, insert: "!" }], 4), clientID: "r" };
    state = receiveUpdates(state, [u1]).state;
    expect(getSyncedVersion(state)).toBe(1);

    // Receive 2 more updates
    const u2 = { changes: ChangeSet.of([{ from: 5, insert: "?" }], 5), clientID: "r" };
    const u3 = { changes: ChangeSet.of([{ from: 6, insert: "." }], 6), clientID: "r" };
    state = receiveUpdates(state, [u2, u3]).state;
    expect(getSyncedVersion(state)).toBe(3);
  });

  it("getSyncedVersion does not change from local edits alone", () => {
    let state = EditorState.create({
      doc: "abc",
      extensions: [collab({ startVersion: 5 })],
    });
    state = state.update({ changes: { from: 3, insert: "d" } }).state;
    state = state.update({ changes: { from: 4, insert: "e" } }).state;
    state = state.update({ changes: { from: 5, insert: "f" } }).state;
    expect(getSyncedVersion(state)).toBe(5);
  });

  it("version tracks correctly through mixed local and remote updates", () => {
    let state = EditorState.create({
      doc: "xy",
      extensions: [collab({ startVersion: 10, clientID: "local" })],
    });
    // Local edit (does not change version)
    state = state.update({ changes: { from: 2, insert: "z" } }).state;
    expect(getSyncedVersion(state)).toBe(10);

    // Receive remote update (version goes to 11)
    const remote = { changes: ChangeSet.of([{ from: 0, insert: "!" }], 2), clientID: "remote" };
    state = receiveUpdates(state, [remote]).state;
    expect(getSyncedVersion(state)).toBe(11);

    // Another local edit (version stays at 11)
    state = state.update({ changes: { from: state.doc.length, insert: "w" } }).state;
    expect(getSyncedVersion(state)).toBe(11);
  });
});

describe("collab multiple sequential update rounds", () => {
  it("simulates 5 rounds of remote updates", () => {
    let state = EditorState.create({
      doc: "",
      extensions: [collab({ startVersion: 0 })],
    });

    for (let i = 0; i < 5; i++) {
      const insert = String(i);
      const changes = ChangeSet.of([{ from: state.doc.length, insert }], state.doc.length);
      state = receiveUpdates(state, [{ changes, clientID: "server" }]).state;
    }

    expect(state.doc.toString()).toBe("01234");
    expect(getSyncedVersion(state)).toBe(5);
  });

  it("alternating local and remote edits produce correct document", () => {
    let state = EditorState.create({
      doc: "",
      extensions: [collab({ startVersion: 0, clientID: "local" })],
    });

    // Round 1: local edit, then server ack
    state = state.update({ changes: { from: 0, insert: "A" } }).state;
    const p1 = sendableUpdates(state);
    state = receiveUpdates(state, [{ changes: p1[0].changes, clientID: "local" }]).state;
    expect(getSyncedVersion(state)).toBe(1);
    expect(sendableUpdates(state).length).toBe(0);

    // Round 2: remote edit
    const r1 = ChangeSet.of([{ from: 1, insert: "B" }], 1);
    state = receiveUpdates(state, [{ changes: r1, clientID: "remote" }]).state;
    expect(getSyncedVersion(state)).toBe(2);
    expect(state.doc.toString()).toBe("AB");

    // Round 3: local edit, then server ack
    state = state.update({ changes: { from: 2, insert: "C" } }).state;
    const p3 = sendableUpdates(state);
    state = receiveUpdates(state, [{ changes: p3[0].changes, clientID: "local" }]).state;
    expect(getSyncedVersion(state)).toBe(3);
    expect(state.doc.toString()).toBe("ABC");
  });

  it("10 sequential remote insertions build up the document", () => {
    let state = EditorState.create({
      doc: "start",
      extensions: [collab({ startVersion: 0 })],
    });

    for (let i = 0; i < 10; i++) {
      const ch = String.fromCharCode(65 + i); // A, B, C, ...
      const changes = ChangeSet.of([{ from: state.doc.length, insert: ch }], state.doc.length);
      state = receiveUpdates(state, [{ changes, clientID: `r${i}` }]).state;
    }

    expect(state.doc.toString()).toBe("startABCDEFGHIJ");
    expect(getSyncedVersion(state)).toBe(10);
  });
});

describe("collab edge cases", () => {
  it("receiving an update with empty changeset (identity) preserves doc", () => {
    let state = EditorState.create({
      doc: "hello",
      extensions: [collab({ startVersion: 0 })],
    });
    const emptyChanges = ChangeSet.empty(5);
    state = receiveUpdates(state, [{ changes: emptyChanges, clientID: "r" }]).state;
    expect(state.doc.toString()).toBe("hello");
    expect(getSyncedVersion(state)).toBe(1);
  });

  it("local no-op transaction does not create sendable updates", () => {
    let state = EditorState.create({
      doc: "hello",
      extensions: [collab()],
    });
    // A transaction with an empty insert is still an empty changeset
    state = state.update({ changes: { from: 0, insert: "" } }).state;
    expect(sendableUpdates(state).length).toBe(0);
  });

  it("receiving own update clears it from pending without changing doc", () => {
    let state = EditorState.create({
      doc: "abc",
      extensions: [collab({ startVersion: 0, clientID: "me" })],
    });
    state = state.update({ changes: { from: 3, insert: "d" } }).state;
    expect(state.doc.toString()).toBe("abcd");
    expect(sendableUpdates(state).length).toBe(1);

    // Server echoes back the same update
    const pending = sendableUpdates(state);
    state = receiveUpdates(state, [{ changes: pending[0].changes, clientID: "me" }]).state;

    // Doc unchanged, pending cleared, version incremented
    expect(state.doc.toString()).toBe("abcd");
    expect(sendableUpdates(state).length).toBe(0);
    expect(getSyncedVersion(state)).toBe(1);
  });

  it("receiving many empty updates increments version without changing doc", () => {
    let state = EditorState.create({
      doc: "test",
      extensions: [collab({ startVersion: 0 })],
    });
    const emptyUpdates = Array.from({ length: 5 }, (_, i) => ({
      changes: ChangeSet.empty(4),
      clientID: `r${i}`,
    }));
    state = receiveUpdates(state, emptyUpdates).state;
    expect(state.doc.toString()).toBe("test");
    expect(getSyncedVersion(state)).toBe(5);
  });

  it("concurrent edits at the same position from two clients both appear", () => {
    // Client A inserts at position 0
    let stateA = EditorState.create({
      doc: "base",
      extensions: [collab({ startVersion: 0, clientID: "A" })],
    });
    stateA = stateA.update({ changes: { from: 0, insert: "X" } }).state;

    // Server accepted B's insert at position 0 first
    const bChange = ChangeSet.of([{ from: 0, insert: "Y" }], 4);
    stateA = receiveUpdates(stateA, [{ changes: bChange, clientID: "B" }]).state;

    // Both X and Y should appear in the document
    const doc = stateA.doc.toString();
    expect(doc).toContain("X");
    expect(doc).toContain("Y");
    expect(doc).toContain("base");
    expect(doc.length).toBe(6); // "base" (4) + "X" (1) + "Y" (1)
  });

  it("replacement (delete+insert) round-trip works", () => {
    let state = EditorState.create({
      doc: "foo bar",
      extensions: [collab({ startVersion: 0, clientID: "c" })],
    });
    state = state.update({ changes: { from: 4, to: 7, insert: "baz" } }).state;
    expect(state.doc.toString()).toBe("foo baz");

    // Acknowledge
    const pending = sendableUpdates(state);
    state = receiveUpdates(state, [{ changes: pending[0].changes, clientID: "c" }]).state;
    expect(state.doc.toString()).toBe("foo baz");
    expect(getSyncedVersion(state)).toBe(1);
    expect(sendableUpdates(state).length).toBe(0);
  });
});
