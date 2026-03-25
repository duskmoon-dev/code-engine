import { describe, it, expect } from "bun:test";
import { Change, diff, presentableDiff } from "../../src/core/merge/index";

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
