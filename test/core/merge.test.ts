import { describe, it, expect } from "bun:test";
import {
  Change, diff, presentableDiff,
  MergeView, unifiedMergeView, acceptChunk, rejectChunk, getOriginalDoc,
  getChunks, goToNextChunk, goToPreviousChunk,
  Chunk, uncollapseUnchanged, mergeViewSiblings,
  originalDocChangeEffect, updateOriginalDoc,
} from "../../src/core/merge/index";
import { Text, EditorState, ChangeSet } from "../../src/core/state/index";

describe("Change", () => {
  it("stores fromA, toA, fromB, toB properties", () => {
    const c = new Change(0, 5, 0, 3);
    expect(c.fromA).toBe(0);
    expect(c.toA).toBe(5);
    expect(c.fromB).toBe(0);
    expect(c.toB).toBe(3);
  });
});

describe("diff", () => {
  it("returns empty array for identical strings", () => {
    expect(diff("hello", "hello")).toEqual([]);
  });

  it("detects a simple insertion", () => {
    const changes = diff("ac", "abc");
    expect(changes.length).toBe(1);
    const c = changes[0];
    expect(c.fromA).toBe(c.toA); // insertion: zero-length in A
    expect(c.toB - c.fromB).toBeGreaterThan(0);
  });

  it("detects a simple deletion", () => {
    const changes = diff("abc", "ac");
    expect(changes.length).toBe(1);
    const c = changes[0];
    expect(c.toA - c.fromA).toBeGreaterThan(0);
    expect(c.fromB).toBe(c.toB); // deletion: zero-length in B
  });

  it("detects a replacement", () => {
    const changes = diff("abc", "aXc");
    expect(changes.length).toBe(1);
    const c = changes[0];
    expect(c.toA - c.fromA).toBeGreaterThan(0);
    expect(c.toB - c.fromB).toBeGreaterThan(0);
  });

  it("detects multiple changes", () => {
    const changes = diff("abcdef", "aXcdYf");
    expect(changes.length).toBe(2);
  });

  it("handles empty string to non-empty", () => {
    const changes = diff("", "hello");
    expect(changes.length).toBe(1);
    expect(changes[0].fromA).toBe(0);
    expect(changes[0].toA).toBe(0);
    expect(changes[0].fromB).toBe(0);
    expect(changes[0].toB).toBe(5);
  });

  it("handles non-empty to empty string", () => {
    const changes = diff("hello", "");
    expect(changes.length).toBe(1);
    expect(changes[0].fromA).toBe(0);
    expect(changes[0].toA).toBe(5);
    expect(changes[0].fromB).toBe(0);
    expect(changes[0].toB).toBe(0);
  });

  it("handles both strings empty", () => {
    expect(diff("", "")).toEqual([]);
  });

  it("reconstructs B from A using changes", () => {
    const a = "the quick brown fox";
    const b = "the slow red fox jumps";
    const changes = diff(a, b);
    let result = "";
    let posA = 0;
    for (const c of changes) {
      result += a.slice(posA, c.fromA);
      result += b.slice(c.fromB, c.toB);
      posA = c.toA;
    }
    result += a.slice(posA);
    expect(result).toBe(b);
  });

  it("accepts a custom override function", () => {
    const custom = (_a: string, _b: string) => [new Change(0, 1, 0, 2)];
    const changes = diff("x", "yy", { override: custom });
    expect(changes.length).toBe(1);
    expect(changes[0].toB).toBe(2);
  });
});

describe("presentableDiff", () => {
  it("returns empty array for identical strings", () => {
    expect(presentableDiff("hello", "hello")).toEqual([]);
  });

  it("produces valid changes that reconstruct B from A", () => {
    const a = "one two three four five";
    const b = "one TWO three FOUR five";
    const changes = presentableDiff(a, b);
    expect(changes.length).toBeGreaterThan(0);
    let result = "";
    let posA = 0;
    for (const c of changes) {
      result += a.slice(posA, c.fromA);
      result += b.slice(c.fromB, c.toB);
      posA = c.toA;
    }
    result += a.slice(posA);
    expect(result).toBe(b);
  });

  it("aligns changes to word boundaries", () => {
    const a = "hello world";
    const b = "hello brave world";
    const changes = presentableDiff(a, b);
    expect(changes.length).toBe(1);
    // The change should cover at least the inserted word
    const inserted = b.slice(changes[0].fromB, changes[0].toB);
    expect(inserted).toContain("brave");
  });
});

describe("Merge module exports", () => {
  it("exports MergeView as a class", () => {
    expect(typeof MergeView).toBe("function");
  });

  it("exports unifiedMergeView as a function", () => {
    expect(typeof unifiedMergeView).toBe("function");
  });

  it("exports acceptChunk as a function", () => {
    expect(typeof acceptChunk).toBe("function");
  });

  it("exports rejectChunk as a function", () => {
    expect(typeof rejectChunk).toBe("function");
  });

  it("exports getOriginalDoc as a function", () => {
    expect(typeof getOriginalDoc).toBe("function");
  });

  it("exports getChunks as a function", () => {
    expect(typeof getChunks).toBe("function");
  });

  it("exports goToNextChunk as a function", () => {
    expect(typeof goToNextChunk).toBe("function");
  });

  it("exports goToPreviousChunk as a function", () => {
    expect(typeof goToPreviousChunk).toBe("function");
  });

  it("exports Chunk as a class", () => {
    expect(typeof Chunk).toBe("function");
  });

  it("exports uncollapseUnchanged as defined", () => {
    expect(uncollapseUnchanged).toBeDefined();
  });

  it("exports mergeViewSiblings as a function", () => {
    expect(typeof mergeViewSiblings).toBe("function");
  });
});

describe("Additional merge exports", () => {
  it("exports originalDocChangeEffect as a StateEffectType constructor", () => {
    expect(originalDocChangeEffect).toBeDefined();
    expect(typeof originalDocChangeEffect).toBe("function");
  });

  it("exports updateOriginalDoc as a defined value", () => {
    expect(updateOriginalDoc).toBeDefined();
  });
});

describe("diff behavioral tests", () => {
  it("produces correct fromA/toA/fromB/toB for a replacement", () => {
    const changes = diff("hello world", "hello there");
    expect(changes.length).toBeGreaterThan(0);
    let result = "";
    let pos = 0;
    for (const c of changes) {
      result += "hello world".slice(pos, c.fromA);
      result += "hello there".slice(c.fromB, c.toB);
      pos = c.toA;
    }
    result += "hello world".slice(pos);
    expect(result).toBe("hello there");
  });

  it("Change.fromA <= Change.toA always", () => {
    const changes = diff("aabbcc", "aXbbYcc");
    for (const c of changes) {
      expect(c.fromA).toBeLessThanOrEqual(c.toA);
      expect(c.fromB).toBeLessThanOrEqual(c.toB);
    }
  });

  it("changes are non-overlapping and in order", () => {
    const changes = diff("one two three four five", "ONE two THREE four FIVE");
    for (let i = 1; i < changes.length; i++) {
      expect(changes[i].fromA).toBeGreaterThanOrEqual(changes[i - 1].toA);
    }
  });

  it("diff handles multiline strings", () => {
    const a = "line1\nline2\nline3";
    const b = "line1\nLINE2\nline3";
    const changes = diff(a, b);
    expect(changes.length).toBeGreaterThan(0);
    let result = "";
    let pos = 0;
    for (const c of changes) {
      result += a.slice(pos, c.fromA);
      result += b.slice(c.fromB, c.toB);
      pos = c.toA;
    }
    result += a.slice(pos);
    expect(result).toBe(b);
  });

  it("diff with same prefix and suffix, changed middle", () => {
    const a = "prefix MIDDLE suffix";
    const b = "prefix changed suffix";
    const changes = diff(a, b);
    expect(changes.length).toBeGreaterThan(0);
  });

  it("presentableDiff with no changes returns empty array", () => {
    const result = presentableDiff("abc", "abc");
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBe(0);
  });

  it("Change constructor stores correct values", () => {
    const c = new Change(10, 20, 15, 25);
    expect(c.fromA).toBe(10);
    expect(c.toA).toBe(20);
    expect(c.fromB).toBe(15);
    expect(c.toB).toBe(25);
  });

  it("diff returns empty array for identical strings", () => {
    const changes = diff("hello world", "hello world");
    expect(changes.length).toBe(0);
  });

  it("diff detects single character change", () => {
    const changes = diff("abc", "axc");
    expect(changes.length).toBeGreaterThan(0);
    expect(changes[0].fromA).toBe(1);
    expect(changes[0].toA).toBe(2);
  });

  it("diff detects insertion at start", () => {
    const changes = diff("world", "hello world");
    expect(changes.length).toBeGreaterThan(0);
  });

  it("diff detects deletion at end", () => {
    const changes = diff("hello world", "hello");
    expect(changes.length).toBeGreaterThan(0);
  });

  it("presentableDiff returns array for different strings", () => {
    const result = presentableDiff("abc", "xyz");
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBeGreaterThan(0);
  });

  it("Change constructor with zero length range", () => {
    const c = new Change(5, 5, 5, 8);
    expect(c.fromA).toBe(5);
    expect(c.toA).toBe(5);
    expect(c.fromB).toBe(5);
    expect(c.toB).toBe(8);
  });

  it("diff handles empty string a", () => {
    const changes = diff("", "hello");
    expect(changes.length).toBeGreaterThan(0);
    expect(changes[0].fromA).toBe(0);
    expect(changes[0].toA).toBe(0);
  });

  it("diff handles empty string b", () => {
    const changes = diff("hello", "");
    expect(changes.length).toBeGreaterThan(0);
  });

  it("diff handles both empty strings", () => {
    const changes = diff("", "");
    expect(changes.length).toBe(0);
  });

  it("presentableDiff handles multiline", () => {
    const a = "line1\nline2\nline3";
    const b = "line1\nLINE2\nline3";
    const changes = presentableDiff(a, b);
    expect(Array.isArray(changes)).toBe(true);
    expect(changes.length).toBeGreaterThan(0);
  });

  it("diff changes can reconstruct target string", () => {
    const a = "one two three four";
    const b = "one TWO three FOUR";
    const changes = diff(a, b);
    let result = "";
    let pos = 0;
    for (const c of changes) {
      result += a.slice(pos, c.fromA);
      result += b.slice(c.fromB, c.toB);
      pos = c.toA;
    }
    result += a.slice(pos);
    expect(result).toBe(b);
  });

  it("Change fromA and toA are numbers", () => {
    const c = new Change(0, 5, 0, 7);
    expect(typeof c.fromA).toBe("number");
    expect(typeof c.toA).toBe("number");
    expect(typeof c.fromB).toBe("number");
    expect(typeof c.toB).toBe("number");
  });

  it("goToNextChunk is a function", () => {
    expect(typeof goToNextChunk).toBe("function");
  });

  it("goToPreviousChunk is a function", () => {
    expect(typeof goToPreviousChunk).toBe("function");
  });

  it("getChunks is a function", () => {
    expect(typeof getChunks).toBe("function");
  });

  it("acceptChunk is a function", () => {
    expect(typeof acceptChunk).toBe("function");
  });

  it("rejectChunk is a function", () => {
    expect(typeof rejectChunk).toBe("function");
  });

  it("presentableDiff is a function", () => {
    expect(typeof presentableDiff).toBe("function");
  });

  it("getOriginalDoc is a function", () => {
    expect(typeof getOriginalDoc).toBe("function");
  });

  it("uncollapseUnchanged is defined", () => {
    expect(uncollapseUnchanged).toBeDefined();
  });

  it("mergeViewSiblings is defined", () => {
    expect(mergeViewSiblings).toBeDefined();
  });
});

describe("Chunk.build", () => {
  it("returns empty array for identical documents", () => {
    const doc = Text.of(["hello", "world"]);
    const chunks = Chunk.build(doc, doc);
    expect(chunks.length).toBe(0);
  });

  it("detects a single changed line", () => {
    const a = Text.of(["line1", "line2", "line3"]);
    const b = Text.of(["line1", "CHANGED", "line3"]);
    const chunks = Chunk.build(a, b);
    expect(chunks.length).toBe(1);
    expect(chunks[0].fromA).toBeGreaterThanOrEqual(0);
    expect(chunks[0].toA).toBeGreaterThan(chunks[0].fromA);
    expect(chunks[0].fromB).toBeGreaterThanOrEqual(0);
    expect(chunks[0].toB).toBeGreaterThan(chunks[0].fromB);
  });

  it("detects an inserted line", () => {
    const a = Text.of(["line1", "line3"]);
    const b = Text.of(["line1", "line2", "line3"]);
    const chunks = Chunk.build(a, b);
    expect(chunks.length).toBe(1);
    // Insertion: A range may be empty
    const chunk = chunks[0];
    expect(chunk.toB - chunk.fromB).toBeGreaterThan(0);
  });

  it("detects a deleted line", () => {
    const a = Text.of(["line1", "line2", "line3"]);
    const b = Text.of(["line1", "line3"]);
    const chunks = Chunk.build(a, b);
    expect(chunks.length).toBe(1);
    const chunk = chunks[0];
    expect(chunk.toA - chunk.fromA).toBeGreaterThan(0);
  });

  it("detects multiple changed regions", () => {
    const a = Text.of(["aaa", "bbb", "ccc", "ddd", "eee"]);
    const b = Text.of(["AAA", "bbb", "ccc", "DDD", "eee"]);
    const chunks = Chunk.build(a, b);
    expect(chunks.length).toBe(2);
  });

  it("handles completely different documents", () => {
    const a = Text.of(["alpha", "beta"]);
    const b = Text.of(["gamma", "delta"]);
    const chunks = Chunk.build(a, b);
    expect(chunks.length).toBeGreaterThan(0);
  });

  it("handles empty document A", () => {
    const a = Text.of([""]);
    const b = Text.of(["hello", "world"]);
    const chunks = Chunk.build(a, b);
    expect(chunks.length).toBeGreaterThan(0);
  });

  it("handles empty document B", () => {
    const a = Text.of(["hello", "world"]);
    const b = Text.of([""]);
    const chunks = Chunk.build(a, b);
    expect(chunks.length).toBeGreaterThan(0);
  });

  it("handles both documents empty", () => {
    const a = Text.of([""]);
    const b = Text.of([""]);
    const chunks = Chunk.build(a, b);
    expect(chunks.length).toBe(0);
  });
});

describe("Chunk properties", () => {
  it("has changes array with relative positions", () => {
    const a = Text.of(["line1", "line2", "line3"]);
    const b = Text.of(["line1", "CHANGED", "line3"]);
    const chunks = Chunk.build(a, b);
    expect(chunks.length).toBe(1);
    const chunk = chunks[0];
    expect(Array.isArray(chunk.changes)).toBe(true);
    expect(chunk.changes.length).toBeGreaterThan(0);
    // Changes are relative to chunk start
    for (const change of chunk.changes) {
      expect(change.fromA).toBeGreaterThanOrEqual(0);
      expect(change.toA).toBeGreaterThanOrEqual(change.fromA);
      expect(change.fromB).toBeGreaterThanOrEqual(0);
      expect(change.toB).toBeGreaterThanOrEqual(change.fromB);
    }
  });

  it("has precise flag set to true by default", () => {
    const a = Text.of(["hello"]);
    const b = Text.of(["world"]);
    const chunks = Chunk.build(a, b);
    expect(chunks.length).toBeGreaterThan(0);
    expect(chunks[0].precise).toBe(true);
  });

  it("endA returns fromA when chunk is empty in A", () => {
    const a = Text.of(["line1", "line3"]);
    const b = Text.of(["line1", "inserted", "line3"]);
    const chunks = Chunk.build(a, b);
    const insertChunk = chunks.find(c => c.fromA === c.toA);
    if (insertChunk) {
      expect(insertChunk.endA).toBe(insertChunk.fromA);
    }
  });

  it("endB returns fromB when chunk is empty in B", () => {
    const a = Text.of(["line1", "deleted", "line3"]);
    const b = Text.of(["line1", "line3"]);
    const chunks = Chunk.build(a, b);
    const deleteChunk = chunks.find(c => c.fromB === c.toB);
    if (deleteChunk) {
      expect(deleteChunk.endB).toBe(deleteChunk.fromB);
    }
  });

  it("endA returns toA - 1 for non-empty chunks", () => {
    const a = Text.of(["line1", "line2", "line3"]);
    const b = Text.of(["line1", "CHANGED", "line3"]);
    const chunks = Chunk.build(a, b);
    expect(chunks.length).toBe(1);
    const chunk = chunks[0];
    if (chunk.fromA < chunk.toA) {
      expect(chunk.endA).toBe(chunk.toA - 1);
    }
  });

  it("endB returns toB - 1 for non-empty chunks", () => {
    const a = Text.of(["line1", "line2", "line3"]);
    const b = Text.of(["line1", "CHANGED", "line3"]);
    const chunks = Chunk.build(a, b);
    expect(chunks.length).toBe(1);
    const chunk = chunks[0];
    if (chunk.fromB < chunk.toB) {
      expect(chunk.endB).toBe(chunk.toB - 1);
    }
  });

  it("Chunk constructor stores all properties correctly", () => {
    const changes = [new Change(0, 3, 0, 5)];
    const chunk = new Chunk(changes, 10, 20, 15, 30, false);
    expect(chunk.fromA).toBe(10);
    expect(chunk.toA).toBe(20);
    expect(chunk.fromB).toBe(15);
    expect(chunk.toB).toBe(30);
    expect(chunk.precise).toBe(false);
    expect(chunk.changes).toBe(changes);
  });
});

describe("Chunk.updateA", () => {
  it("updates chunks when document A changes", () => {
    const a = Text.of(["line1", "line2", "line3"]);
    const b = Text.of(["line1", "CHANGED", "line3"]);
    const chunks = Chunk.build(a, b);
    expect(chunks.length).toBe(1);

    // Simulate changing "line1" to "LINE1" in document A
    const changes = ChangeSet.of({from: 0, to: 5, insert: "LINE1"}, a.length);
    const newA = changes.apply(a);
    const updated = Chunk.updateA(chunks, newA, b, changes);
    expect(Array.isArray(updated)).toBe(true);
    // Should still have changes since docs differ
    expect(updated.length).toBeGreaterThan(0);
  });
});

describe("Chunk.updateB", () => {
  it("updates chunks when document B changes", () => {
    const a = Text.of(["line1", "line2", "line3"]);
    const b = Text.of(["line1", "CHANGED", "line3"]);
    const chunks = Chunk.build(a, b);
    expect(chunks.length).toBe(1);

    // Simulate changing "CHANGED" back to "line2" in document B
    const changeStart = "line1\n".length;
    const changeEnd = changeStart + "CHANGED".length;
    const changes = ChangeSet.of({from: changeStart, to: changeEnd, insert: "line2"}, b.length);
    const newB = changes.apply(b);
    const updated = Chunk.updateB(chunks, a, newB, changes);
    expect(Array.isArray(updated)).toBe(true);
    // After reverting the change, documents should be identical
    expect(updated.length).toBe(0);
  });
});

describe("getChunks with EditorState", () => {
  it("returns null when no merge extension is active", () => {
    const state = EditorState.create({ doc: "hello" });
    const result = getChunks(state);
    expect(result).toBeNull();
  });
});

describe("goToNextChunk / goToPreviousChunk as StateCommands", () => {
  it("goToNextChunk returns false when no chunks field is present", () => {
    const state = EditorState.create({ doc: "hello" });
    let dispatched = false;
    const result = goToNextChunk({
      state,
      dispatch: () => { dispatched = true; },
    });
    expect(result).toBe(false);
    expect(dispatched).toBe(false);
  });

  it("goToPreviousChunk returns false when no chunks field is present", () => {
    const state = EditorState.create({ doc: "hello" });
    let dispatched = false;
    const result = goToPreviousChunk({
      state,
      dispatch: () => { dispatched = true; },
    });
    expect(result).toBe(false);
    expect(dispatched).toBe(false);
  });
});

describe("unifiedMergeView configuration", () => {
  it("returns an array of extensions", () => {
    const extensions = unifiedMergeView({
      original: "hello\nworld",
    });
    expect(Array.isArray(extensions)).toBe(true);
    expect(extensions.length).toBeGreaterThan(0);
  });

  it("accepts Text object as original", () => {
    const orig = Text.of(["hello", "world"]);
    const extensions = unifiedMergeView({ original: orig });
    expect(Array.isArray(extensions)).toBe(true);
    expect(extensions.length).toBeGreaterThan(0);
  });

  it("accepts highlightChanges option", () => {
    const ext1 = unifiedMergeView({ original: "hello", highlightChanges: true });
    const ext2 = unifiedMergeView({ original: "hello", highlightChanges: false });
    expect(Array.isArray(ext1)).toBe(true);
    expect(Array.isArray(ext2)).toBe(true);
  });

  it("accepts gutter option", () => {
    const ext1 = unifiedMergeView({ original: "hello", gutter: true });
    const ext2 = unifiedMergeView({ original: "hello", gutter: false });
    expect(Array.isArray(ext1)).toBe(true);
    expect(Array.isArray(ext2)).toBe(true);
  });

  it("accepts collapseUnchanged option", () => {
    const ext = unifiedMergeView({
      original: "hello",
      collapseUnchanged: { margin: 5, minSize: 8 },
    });
    expect(Array.isArray(ext)).toBe(true);
  });

  it("accepts mergeControls option set to false", () => {
    const ext = unifiedMergeView({
      original: "hello",
      mergeControls: false,
    });
    expect(Array.isArray(ext)).toBe(true);
  });

  it("accepts syntaxHighlightDeletions option", () => {
    const ext = unifiedMergeView({
      original: "hello",
      syntaxHighlightDeletions: false,
    });
    expect(Array.isArray(ext)).toBe(true);
  });

  it("accepts diffConfig option", () => {
    const ext = unifiedMergeView({
      original: "hello",
      diffConfig: { scanLimit: 1000 },
    });
    expect(Array.isArray(ext)).toBe(true);
  });

  it("creates a working EditorState with unifiedMergeView extensions", () => {
    const original = "line1\nline2\nline3";
    const modified = "line1\nCHANGED\nline3";
    const state = EditorState.create({
      doc: modified,
      extensions: [unifiedMergeView({ original })],
    });
    expect(state.doc.toString()).toBe(modified);
    // The ChunkField should be initialized
    const result = getChunks(state);
    expect(result).not.toBeNull();
    expect(result!.chunks.length).toBe(1);
    expect(result!.side).toBe("b");
  });

  it("getOriginalDoc retrieves the original document from unified state", () => {
    const original = "line1\nline2\nline3";
    const modified = "line1\nCHANGED\nline3";
    const state = EditorState.create({
      doc: modified,
      extensions: [unifiedMergeView({ original })],
    });
    const origDoc = getOriginalDoc(state);
    expect(origDoc.toString()).toBe(original);
  });

  it("detects multiple chunks in unified merge state", () => {
    const original = "aaa\nbbb\nccc\nddd\neee";
    const modified = "AAA\nbbb\nccc\nDDD\neee";
    const state = EditorState.create({
      doc: modified,
      extensions: [unifiedMergeView({ original })],
    });
    const result = getChunks(state);
    expect(result).not.toBeNull();
    expect(result!.chunks.length).toBe(2);
  });

  it("reports no chunks when original and modified are identical", () => {
    const text = "same\ncontent\nhere";
    const state = EditorState.create({
      doc: text,
      extensions: [unifiedMergeView({ original: text })],
    });
    const result = getChunks(state);
    expect(result).not.toBeNull();
    expect(result!.chunks.length).toBe(0);
  });
});

describe("originalDocChangeEffect", () => {
  it("creates a state effect for updating original doc", () => {
    const original = "line1\nline2";
    const modified = "line1\nCHANGED";
    const state = EditorState.create({
      doc: modified,
      extensions: [unifiedMergeView({ original })],
    });
    const origDoc = getOriginalDoc(state);
    const changes = ChangeSet.of(
      { from: 0, to: 5, insert: "LINE1" },
      origDoc.length
    );
    const effect = originalDocChangeEffect(state, changes);
    expect(effect).toBeDefined();
    expect(effect.value.doc.toString()).toBe("LINE1\nline2");
    expect(effect.value.changes).toBe(changes);
  });
});

describe("Chunk.build with diffConfig", () => {
  it("accepts a custom scanLimit", () => {
    const a = Text.of(["line1", "line2"]);
    const b = Text.of(["line1", "CHANGED"]);
    const chunks = Chunk.build(a, b, { scanLimit: 100 });
    expect(chunks.length).toBe(1);
  });

  it("produces the same result for identical docs regardless of config", () => {
    const doc = Text.of(["hello", "world"]);
    const c1 = Chunk.build(doc, doc);
    const c2 = Chunk.build(doc, doc, { scanLimit: 10 });
    expect(c1.length).toBe(0);
    expect(c2.length).toBe(0);
  });
});

describe("Chunk ranges cover changed content", () => {
  it("chunk fromA/toA spans the changed line in A", () => {
    const a = Text.of(["aaa", "bbb", "ccc"]);
    const b = Text.of(["aaa", "BBB", "ccc"]);
    const chunks = Chunk.build(a, b);
    expect(chunks.length).toBe(1);
    const chunk = chunks[0];
    // The changed line "bbb" starts at position 4 (after "aaa\n")
    const lineStart = 4;
    const lineEnd = 4 + 3; // "bbb" length
    expect(chunk.fromA).toBeLessThanOrEqual(lineStart);
    expect(chunk.endA).toBeGreaterThanOrEqual(lineEnd);
  });

  it("chunk fromB/toB spans the changed line in B", () => {
    const a = Text.of(["aaa", "bbb", "ccc"]);
    const b = Text.of(["aaa", "BBB", "ccc"]);
    const chunks = Chunk.build(a, b);
    expect(chunks.length).toBe(1);
    const chunk = chunks[0];
    const lineStart = 4;
    const lineEnd = 4 + 3;
    expect(chunk.fromB).toBeLessThanOrEqual(lineStart);
    expect(chunk.endB).toBeGreaterThanOrEqual(lineEnd);
  });
});
