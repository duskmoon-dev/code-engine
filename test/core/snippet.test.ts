import { describe, it, expect } from "bun:test";
import {
  snippet,
  snippetCompletion,
  completeFromList,
  insertCompletionText,
  CompletionContext,
  pickedCompletion,
} from "../../src/core/autocomplete/index";
import { EditorState } from "../../src/core/state/index";

// ── snippet() parsing ──────────────────────────────────────────────

describe("snippet() parsing", () => {
  it("parses plain text with no fields", () => {
    const apply = snippet("hello");
    expect(typeof apply).toBe("function");
  });

  it("returns a function with arity 4", () => {
    const apply = snippet("text");
    expect(apply.length).toBe(4);
  });

  it("parses a template with a single numbered field", () => {
    const apply = snippet("hello ${1:world}");
    expect(typeof apply).toBe("function");
  });

  it("parses a template with multiple numbered fields", () => {
    const apply = snippet("${1:foo} ${2:bar}");
    expect(typeof apply).toBe("function");
  });

  it("parses a template with a named field (no number)", () => {
    const apply = snippet("${name}");
    expect(typeof apply).toBe("function");
  });

  it("parses a template with an empty field (cursor placeholder)", () => {
    const apply = snippet("hello ${}");
    expect(typeof apply).toBe("function");
  });

  it("parses escaped braces in template", () => {
    const apply = snippet("\\{\\}");
    expect(typeof apply).toBe("function");
  });

  it("parses multi-line snippet templates", () => {
    const apply = snippet("if (${1:cond}) {\n\t${2:body}\n}");
    expect(typeof apply).toBe("function");
  });

  it("parses template using hash brace syntax #{}", () => {
    const apply = snippet("hello #{1:world}");
    expect(typeof apply).toBe("function");
  });

  it("parses template with repeated field references", () => {
    const apply = snippet("${1:index} + ${1:index}");
    expect(typeof apply).toBe("function");
  });
});

// ── snippetCompletion() ────────────────────────────────────────────

describe("snippetCompletion()", () => {
  it("returns a Completion object with an apply function", () => {
    const c = snippetCompletion("for (${}) {}", { label: "for" });
    expect(c.label).toBe("for");
    expect(typeof c.apply).toBe("function");
  });

  it("preserves extra completion properties", () => {
    const c = snippetCompletion("fn()", {
      label: "fn",
      type: "function",
      detail: "() => void",
    });
    expect(c.type).toBe("function");
    expect(c.detail).toBe("() => void");
  });

  it("preserves boost property", () => {
    const c = snippetCompletion("x", { label: "x", boost: 10 });
    expect(c.boost).toBe(10);
  });
});

// ── completeFromList() ─────────────────────────────────────────────

describe("completeFromList()", () => {
  it("returns a CompletionSource function from string array", () => {
    const source = completeFromList(["hello", "world"]);
    expect(typeof source).toBe("function");
  });

  it("returns a CompletionSource function from Completion objects", () => {
    const source = completeFromList([
      { label: "hello", type: "keyword" },
      { label: "world", type: "variable" },
    ]);
    expect(typeof source).toBe("function");
  });

  it("source returns null for empty implicit context", () => {
    const source = completeFromList(["alpha", "beta"]);
    const state = EditorState.create({ doc: "" });
    const ctx = new CompletionContext(state, 0, false);
    const result = source(ctx);
    expect(result).toBeNull();
  });

  it("source returns completions for explicit context at empty doc", () => {
    const source = completeFromList(["alpha", "beta"]);
    const state = EditorState.create({ doc: "" });
    const ctx = new CompletionContext(state, 0, true);
    const result = source(ctx);
    expect(result).not.toBeNull();
    expect(result!.options.length).toBe(2);
  });

  it("source returns completions when there is a matching prefix", () => {
    const source = completeFromList(["alpha", "beta"]);
    const state = EditorState.create({ doc: "al" });
    const ctx = new CompletionContext(state, 2, false);
    const result = source(ctx);
    expect(result).not.toBeNull();
    expect(result!.from).toBe(0);
    expect(result!.options.length).toBe(2); // filtering is done by the system, source returns all
  });

  it("returns result with validFor property", () => {
    const source = completeFromList(["foo", "bar"]);
    const state = EditorState.create({ doc: "f" });
    const ctx = new CompletionContext(state, 1, false);
    const result = source(ctx);
    expect(result).not.toBeNull();
    expect(result!.validFor).toBeDefined();
  });
});

// ── insertCompletionText() ─────────────────────────────────────────

describe("insertCompletionText()", () => {
  it("returns a TransactionSpec with changes", () => {
    const state = EditorState.create({ doc: "hel" });
    const spec = insertCompletionText(state, "hello", 0, 3);
    expect(spec).toBeDefined();
    expect(spec.scrollIntoView).toBe(true);
    expect(spec.userEvent).toBe("input.complete");
  });

  it("replaces a range in the document", () => {
    const state = EditorState.create({ doc: "hel world" });
    const spec = insertCompletionText(state, "hello", 0, 3);
    // Apply the spec and check the resulting doc
    const newState = state.update(spec).state;
    expect(newState.doc.toString()).toBe("hello world");
  });

  it("inserts at cursor position when from equals to", () => {
    const state = EditorState.create({ doc: "ab" });
    const spec = insertCompletionText(state, "X", 1, 1);
    const newState = state.update(spec).state;
    expect(newState.doc.toString()).toBe("aXb");
  });

  it("places cursor after inserted text", () => {
    const state = EditorState.create({ doc: "hel" });
    const spec = insertCompletionText(state, "hello", 0, 3);
    const newState = state.update(spec).state;
    expect(newState.selection.main.from).toBe(5);
  });

  it("handles empty replacement text", () => {
    const state = EditorState.create({ doc: "abc" });
    const spec = insertCompletionText(state, "", 0, 3);
    const newState = state.update(spec).state;
    expect(newState.doc.toString()).toBe("");
  });
});

// ── CompletionContext ──────────────────────────────────────────────

describe("CompletionContext", () => {
  it("stores pos and explicit properties", () => {
    const state = EditorState.create({ doc: "hello" });
    const ctx = new CompletionContext(state, 3, true);
    expect(ctx.pos).toBe(3);
    expect(ctx.explicit).toBe(true);
    expect(ctx.state).toBe(state);
  });

  it("is not aborted initially", () => {
    const state = EditorState.create({ doc: "" });
    const ctx = new CompletionContext(state, 0, false);
    expect(ctx.aborted).toBe(false);
  });

  it("matchBefore returns null when no match", () => {
    const state = EditorState.create({ doc: "   " });
    const ctx = new CompletionContext(state, 3, false);
    const match = ctx.matchBefore(/\w+/);
    expect(match).toBeNull();
  });

  it("matchBefore returns match object for word before cursor", () => {
    const state = EditorState.create({ doc: "hello world" });
    const ctx = new CompletionContext(state, 5, false);
    const match = ctx.matchBefore(/\w+/);
    expect(match).not.toBeNull();
    expect(match!.text).toBe("hello");
    expect(match!.from).toBe(0);
    expect(match!.to).toBe(5);
  });

  it("matchBefore only matches on current line", () => {
    const state = EditorState.create({ doc: "first\nsecond" });
    const ctx = new CompletionContext(state, 12, false);
    const match = ctx.matchBefore(/\w+/);
    expect(match).not.toBeNull();
    expect(match!.text).toBe("second");
  });

  it("addEventListener registers abort listener", () => {
    const state = EditorState.create({ doc: "" });
    const ctx = new CompletionContext(state, 0, false);
    let called = false;
    ctx.addEventListener("abort", () => { called = true; });
    expect(ctx.abortListeners!.length).toBe(1);
  });

  it("addEventListener with onDocChange sets abortOnDocChange", () => {
    const state = EditorState.create({ doc: "" });
    const ctx = new CompletionContext(state, 0, false);
    ctx.addEventListener("abort", () => {}, { onDocChange: true });
    expect(ctx.abortOnDocChange).toBe(true);
  });
});
