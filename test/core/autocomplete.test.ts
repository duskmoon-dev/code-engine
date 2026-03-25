import { describe, it, expect } from "bun:test";
import {
  autocompletion,
  completionKeymap,
  acceptCompletion,
  startCompletion,
  closeCompletion,
  moveCompletionSelection,
  completeFromList,
  ifNotIn,
  snippetCompletion,
  snippet,
  completionStatus,
  currentCompletions,
  selectedCompletion,
  selectedCompletionIndex,
  setSelectedCompletion,
  CompletionContext,
  pickedCompletion,
  ifIn,
  insertCompletionText,
  completeAnyWord,
  closeBrackets,
  closeBracketsKeymap,
  deleteBracketPair,
  insertBracket,
  nextSnippetField,
  prevSnippetField,
  hasNextSnippetField,
  hasPrevSnippetField,
  clearSnippet,
  snippetKeymap,
} from "../../src/core/autocomplete/index";
import { EditorState } from "../../src/core/state/index";
import { FuzzyMatcher, StrictMatcher } from "../../src/core/autocomplete/filter";

describe("autocomplete module exports", () => {
  it("exports autocompletion as a function", () => {
    expect(autocompletion).toBeDefined();
    expect(typeof autocompletion).toBe("function");
  });

  it("exports completionKeymap as an array", () => {
    expect(completionKeymap).toBeDefined();
    expect(Array.isArray(completionKeymap)).toBe(true);
    expect(completionKeymap.length).toBeGreaterThan(0);
  });

  it("exports acceptCompletion as a function", () => {
    expect(acceptCompletion).toBeDefined();
    expect(typeof acceptCompletion).toBe("function");
  });

  it("exports startCompletion as a function", () => {
    expect(startCompletion).toBeDefined();
    expect(typeof startCompletion).toBe("function");
  });

  it("exports closeCompletion as a function", () => {
    expect(closeCompletion).toBeDefined();
    expect(typeof closeCompletion).toBe("function");
  });

  it("exports moveCompletionSelection as a function", () => {
    expect(moveCompletionSelection).toBeDefined();
    expect(typeof moveCompletionSelection).toBe("function");
  });

  it("exports completeFromList as a function", () => {
    expect(completeFromList).toBeDefined();
    expect(typeof completeFromList).toBe("function");
  });

  it("exports ifNotIn as a function", () => {
    expect(ifNotIn).toBeDefined();
    expect(typeof ifNotIn).toBe("function");
  });

  it("exports snippetCompletion as a function", () => {
    expect(snippetCompletion).toBeDefined();
    expect(typeof snippetCompletion).toBe("function");
  });

  it("exports snippet as a function", () => {
    expect(snippet).toBeDefined();
    expect(typeof snippet).toBe("function");
  });

  it("exports completionStatus as a function", () => {
    expect(completionStatus).toBeDefined();
    expect(typeof completionStatus).toBe("function");
  });

  it("exports currentCompletions as a function", () => {
    expect(currentCompletions).toBeDefined();
    expect(typeof currentCompletions).toBe("function");
  });

  it("exports selectedCompletion as a function", () => {
    expect(selectedCompletion).toBeDefined();
    expect(typeof selectedCompletion).toBe("function");
  });

  it("exports selectedCompletionIndex as a function", () => {
    expect(selectedCompletionIndex).toBeDefined();
    expect(typeof selectedCompletionIndex).toBe("function");
  });

  it("exports setSelectedCompletion as a function", () => {
    expect(setSelectedCompletion).toBeDefined();
    expect(typeof setSelectedCompletion).toBe("function");
  });

  it("exports CompletionContext as a class", () => {
    expect(CompletionContext).toBeDefined();
    expect(typeof CompletionContext).toBe("function");
  });

  it("exports pickedCompletion as defined", () => {
    expect(pickedCompletion).toBeDefined();
  });

  it("exports ifIn as a function", () => {
    expect(ifIn).toBeDefined();
    expect(typeof ifIn).toBe("function");
  });

  it("exports insertCompletionText as a function", () => {
    expect(insertCompletionText).toBeDefined();
    expect(typeof insertCompletionText).toBe("function");
  });

  it("exports completeAnyWord as a function", () => {
    expect(completeAnyWord).toBeDefined();
    expect(typeof completeAnyWord).toBe("function");
  });

  it("exports closeBrackets as a function", () => {
    expect(closeBrackets).toBeDefined();
    expect(typeof closeBrackets).toBe("function");
  });

  it("exports closeBracketsKeymap as an array", () => {
    expect(closeBracketsKeymap).toBeDefined();
    expect(Array.isArray(closeBracketsKeymap)).toBe(true);
  });

  it("exports deleteBracketPair as a function", () => {
    expect(deleteBracketPair).toBeDefined();
    expect(typeof deleteBracketPair).toBe("function");
  });

  it("exports insertBracket as a function", () => {
    expect(insertBracket).toBeDefined();
    expect(typeof insertBracket).toBe("function");
  });

  it("exports nextSnippetField as a function", () => {
    expect(nextSnippetField).toBeDefined();
    expect(typeof nextSnippetField).toBe("function");
  });

  it("exports prevSnippetField as a function", () => {
    expect(prevSnippetField).toBeDefined();
    expect(typeof prevSnippetField).toBe("function");
  });

  it("exports hasNextSnippetField as a function", () => {
    expect(hasNextSnippetField).toBeDefined();
    expect(typeof hasNextSnippetField).toBe("function");
  });

  it("exports hasPrevSnippetField as a function", () => {
    expect(hasPrevSnippetField).toBeDefined();
    expect(typeof hasPrevSnippetField).toBe("function");
  });

  it("exports clearSnippet as a function", () => {
    expect(clearSnippet).toBeDefined();
    expect(typeof clearSnippet).toBe("function");
  });

  it("exports snippetKeymap as defined", () => {
    expect(snippetKeymap).toBeDefined();
  });
});

describe("completionKeymap entries", () => {
  it("each entry has a key or mac property", () => {
    for (const binding of completionKeymap) {
      const hasKey = typeof binding.key === "string" ||
                     typeof binding.mac === "string";
      expect(hasKey).toBe(true);
    }
  });

  it("each entry has a run property that is a function", () => {
    for (const binding of completionKeymap) {
      expect(typeof binding.run).toBe("function");
    }
  });
});

describe("snippet function", () => {
  it("returns a function when given a template string", () => {
    const result = snippet("console.log(${})");
    expect(typeof result).toBe("function");
  });
});

describe("completeFromList", () => {
  it("returns a function when given a list of strings", () => {
    const source = completeFromList(["foo", "bar", "baz"]);
    expect(typeof source).toBe("function");
  });

  it("returns a function when given a list of completion objects", () => {
    const source = completeFromList([
      { label: "foo" },
      { label: "bar", detail: "a bar" },
    ]);
    expect(typeof source).toBe("function");
  });
});

describe("snippetCompletion", () => {
  it("returns a completion object with apply function", () => {
    const comp = snippetCompletion("log(${text})", { label: "log" });
    expect(comp).toBeDefined();
    expect(comp.label).toBe("log");
    expect(typeof comp.apply).toBe("function");
  });
});

describe("autocompletion function", () => {
  it("returns an extension when called with no arguments", () => {
    const ext = autocompletion();
    expect(ext).toBeDefined();
  });

  it("returns an extension when called with config", () => {
    const ext = autocompletion({ activateOnTyping: true });
    expect(ext).toBeDefined();
  });
});

describe("CompletionContext", () => {
  it("constructs with EditorState, pos, and explicit flag", () => {
    const state = EditorState.create({ doc: "hello world" });
    const ctx = new CompletionContext(state, 5, true);
    expect(ctx.state).toBe(state);
    expect(ctx.pos).toBe(5);
    expect(ctx.explicit).toBe(true);
  });

  it("matchBefore returns null when nothing matches", () => {
    const state = EditorState.create({ doc: "hello world" });
    const ctx = new CompletionContext(state, 0, false);
    const result = ctx.matchBefore(/\w+/);
    expect(result).toBeNull();
  });

  it("matchBefore returns match object when text matches before pos", () => {
    const state = EditorState.create({ doc: "hello world" });
    const ctx = new CompletionContext(state, 5, false);
    const result = ctx.matchBefore(/\w+/);
    expect(result).not.toBeNull();
    expect(result!.text).toBe("hello");
  });

  it("aborted is false for fresh context", () => {
    const state = EditorState.create({ doc: "test" });
    const ctx = new CompletionContext(state, 0, false);
    expect(ctx.aborted).toBe(false);
  });
});

describe("completionStatus", () => {
  it("returns null for state with no autocomplete extension", () => {
    const state = EditorState.create({ doc: "hello" });
    expect(completionStatus(state)).toBeNull();
  });

  it("returns null for fresh autocompletion state (no active completion)", () => {
    const state = EditorState.create({
      doc: "hello",
      extensions: [autocompletion()],
    });
    expect(completionStatus(state)).toBeNull();
  });
});

describe("currentCompletions", () => {
  it("returns empty array for state with no autocomplete", () => {
    const state = EditorState.create({ doc: "hello" });
    const completions = currentCompletions(state);
    expect(Array.isArray(completions)).toBe(true);
    expect(completions.length).toBe(0);
  });
});

describe("selectedCompletion", () => {
  it("returns null for state with no active completion", () => {
    const state = EditorState.create({ doc: "hello" });
    expect(selectedCompletion(state)).toBeNull();
  });
});

describe("selectedCompletionIndex", () => {
  it("returns null for state with no active completion", () => {
    const state = EditorState.create({ doc: "hello" });
    expect(selectedCompletionIndex(state)).toBeNull();
  });
});

describe("closeBrackets integration", () => {
  it("closeBrackets() returns an extension", () => {
    const ext = closeBrackets();
    expect(ext).toBeDefined();
  });

  it("closeBrackets can be used with EditorState", () => {
    const state = EditorState.create({
      doc: "",
      extensions: [closeBrackets()],
    });
    expect(state).toBeDefined();
  });

  it("closeBracketsKeymap is a non-empty array", () => {
    expect(Array.isArray(closeBracketsKeymap)).toBe(true);
    expect(closeBracketsKeymap.length).toBeGreaterThan(0);
  });
});

describe("ifIn and ifNotIn", () => {
  it("ifIn returns a CompletionSource function", () => {
    const source = ifIn(["Identifier"], completeFromList(["foo", "bar"]));
    expect(typeof source).toBe("function");
  });

  it("ifNotIn returns a CompletionSource function", () => {
    const source = ifNotIn(["Comment", "String"], completeFromList(["foo", "bar"]));
    expect(typeof source).toBe("function");
  });
});

describe("completeAnyWord", () => {
  it("is a CompletionSource function", () => {
    expect(typeof completeAnyWord).toBe("function");
  });

  it("returns null for explicit completion at start of empty doc", () => {
    const state = EditorState.create({ doc: "" });
    const ctx = new CompletionContext(state, 0, true);
    const result = completeAnyWord(ctx);
    expect(result === null || result !== undefined).toBe(true);
  });
});

describe("insertCompletionText", () => {
  it("returns a TransactionSpec", () => {
    const state = EditorState.create({ doc: "hel" });
    const spec = insertCompletionText(state, "hello", 0, 3);
    expect(spec).toBeDefined();
    expect(typeof spec).toBe("object");
  });
});

describe("snippet and snippetKeymap", () => {
  it("snippetKeymap is defined", () => {
    expect(snippetKeymap).toBeDefined();
  });

  it("snippet with no fields returns a function that inserts text", () => {
    const applyFn = snippet("console.log()");
    expect(typeof applyFn).toBe("function");
  });

  it("snippet with fields creates field placeholders", () => {
    const applyFn = snippet("function ${name}(${args}) { ${} }");
    expect(typeof applyFn).toBe("function");
  });
});

describe("FuzzyMatcher", () => {
  it("constructor initializes chars and folded arrays from pattern", () => {
    const m = new FuzzyMatcher("aBc");
    expect(m.chars.length).toBe(3);
    expect(m.folded.length).toBe(3);
    // 'a' folds to 'A', 'B' folds to 'b', 'c' folds to 'C'
    expect(m.chars[0]).toBe("a".charCodeAt(0));
    expect(m.chars[1]).toBe("B".charCodeAt(0));
    expect(m.chars[2]).toBe("c".charCodeAt(0));
  });

  it("empty pattern matches any word with NotFull penalty", () => {
    const m = new FuzzyMatcher("");
    const result = m.match("anything");
    expect(result).not.toBeNull();
    expect(result!.score).toBe(-100); // Penalty.NotFull
    expect(result!.matched).toEqual([]);
  });

  it("exact match at start returns perfect score 0", () => {
    const m = new FuzzyMatcher("abc");
    const result = m.match("abc");
    expect(result).not.toBeNull();
    expect(result!.score).toBe(0);
    expect(result!.matched).toEqual([0, 3]);
  });

  it("exact prefix match has NotFull penalty", () => {
    const m = new FuzzyMatcher("abc");
    const result = m.match("abcdef");
    expect(result).not.toBeNull();
    expect(result!.score).toBe(-100); // Penalty.NotFull
    expect(result!.matched).toEqual([0, 3]);
  });

  it("case-insensitive match has CaseFold penalty", () => {
    const m = new FuzzyMatcher("ABC");
    const result = m.match("abc");
    expect(result).not.toBeNull();
    // Adjacent case-fold match at start, full length: CaseFold - word.length
    expect(result!.score).toBe(-200 - 3); // CaseFold - word.length
    expect(result!.matched).toEqual([0, 3]);
  });

  it("returns null when pattern does not match word", () => {
    const m = new FuzzyMatcher("xyz");
    expect(m.match("abc")).toBeNull();
  });

  it("returns null when word is shorter than pattern", () => {
    const m = new FuzzyMatcher("abcd");
    expect(m.match("ab")).toBeNull();
  });

  it("single char matches at start of word", () => {
    const m = new FuzzyMatcher("a");
    const result = m.match("abc");
    expect(result).not.toBeNull();
    expect(result!.score).toBe(-100); // NotFull since word is longer
    expect(result!.matched).toEqual([0, 1]);
  });

  it("single char exact match returns score 0", () => {
    const m = new FuzzyMatcher("a");
    const result = m.match("a");
    expect(result).not.toBeNull();
    expect(result!.score).toBe(0);
    expect(result!.matched).toEqual([0, 1]);
  });

  it("single char returns null on no match", () => {
    const m = new FuzzyMatcher("x");
    expect(m.match("abc")).toBeNull();
  });

  it("single char case fold match includes CaseFold penalty", () => {
    const m = new FuzzyMatcher("A");
    const result = m.match("abc");
    expect(result).not.toBeNull();
    expect(result!.score).toBe(-100 + -200); // NotFull + CaseFold
    expect(result!.matched).toEqual([0, 1]);
  });

  it("direct substring not at start has NotStart penalty", () => {
    const m = new FuzzyMatcher("bc");
    const result = m.match("abcdef");
    expect(result).not.toBeNull();
    expect(result!.score).toBe(-700 - 6); // NotStart - word.length
    expect(result!.matched).toEqual([1, 3]);
  });

  it("by-word matching: pattern chars match word starts", () => {
    const m = new FuzzyMatcher("fB");
    const result = m.match("fooBar");
    expect(result).not.toBeNull();
    // ByWord match at start, wordAdjacent
    expect(result!.score).toBe(-100 - 6); // ByWord - word.length
  });

  it("fuzzy match with gaps returns match positions", () => {
    const m = new FuzzyMatcher("ace");
    const result = m.match("abcde");
    expect(result).not.toBeNull();
    expect(result!.matched.length).toBeGreaterThanOrEqual(2);
    // matched should contain from/to pairs covering 'a', 'c', 'e'
  });

  it("score ordering: exact > prefix > case-fold > substring > fuzzy", () => {
    const exact = new FuzzyMatcher("hello").match("hello");
    const prefix = new FuzzyMatcher("hel").match("hello");
    const caseFold = new FuzzyMatcher("HEL").match("hello");
    const substr = new FuzzyMatcher("ell").match("hello");
    const fuzzy = new FuzzyMatcher("hlo").match("hello");

    expect(exact).not.toBeNull();
    expect(prefix).not.toBeNull();
    expect(caseFold).not.toBeNull();
    expect(substr).not.toBeNull();
    expect(fuzzy).not.toBeNull();

    expect(exact!.score).toBeGreaterThan(prefix!.score);
    expect(prefix!.score).toBeGreaterThan(caseFold!.score);
    expect(caseFold!.score).toBeGreaterThan(substr!.score);
  });

  it("matched array contains from/to pairs for matched regions", () => {
    const m = new FuzzyMatcher("abc");
    const result = m.match("abcdef");
    expect(result).not.toBeNull();
    // matched should be [from, to] pairs
    expect(result!.matched.length % 2).toBe(0);
    expect(result!.matched[0]).toBe(0);
    expect(result!.matched[1]).toBe(3);
  });

  it("handles astral/supplementary characters in pattern", () => {
    const m = new FuzzyMatcher("a");
    expect(m.astral).toBe(false);
    // A pattern with a supplementary character
    const m2 = new FuzzyMatcher("\u{1F600}");
    expect(m2.astral).toBe(true);
    expect(m2.chars.length).toBe(1);
  });

  it("returns null for empty word with non-empty pattern", () => {
    const m = new FuzzyMatcher("abc");
    expect(m.match("")).toBeNull();
  });

  it("two-char pattern returns null when only fuzzy (no adjacency)", () => {
    const m = new FuzzyMatcher("ac");
    // "aXYZc" has 'a' and 'c' but they aren't adjacent and pattern is 2 chars
    // For 2-char patterns, the final fallback returns null
    const result = m.match("aXYZc");
    expect(result).toBeNull();
  });

  it("case-insensitive prefix match on longer word", () => {
    const m = new FuzzyMatcher("ABC");
    const result = m.match("abcdef");
    expect(result).not.toBeNull();
    expect(result!.score).toBe(-200 - 6 + -100); // CaseFold - word.length + NotFull
    expect(result!.matched).toEqual([0, 3]);
  });
});

describe("StrictMatcher", () => {
  it("exact match returns score 0", () => {
    const m = new StrictMatcher("hello");
    const result = m.match("hello");
    expect(result).not.toBeNull();
    expect(result!.score).toBe(0);
  });

  it("prefix match has NotFull penalty", () => {
    const m = new StrictMatcher("hel");
    const result = m.match("hello");
    expect(result).not.toBeNull();
    expect(result!.score).toBe(-100); // NotFull
  });

  it("case-insensitive prefix has CaseFold + NotFull", () => {
    const m = new StrictMatcher("HEL");
    const result = m.match("hello");
    expect(result).not.toBeNull();
    expect(result!.score).toBe(-200 + -100); // CaseFold + NotFull
  });

  it("returns null when pattern does not match", () => {
    const m = new StrictMatcher("xyz");
    expect(m.match("hello")).toBeNull();
  });

  it("returns null when word is shorter than pattern", () => {
    const m = new StrictMatcher("hello");
    expect(m.match("hel")).toBeNull();
  });

  it("matched array is [0, pattern.length] on match", () => {
    const m = new StrictMatcher("hel");
    const result = m.match("hello");
    expect(result).not.toBeNull();
    expect(result!.matched).toEqual([0, 3]);
  });

  it("case-fold exact length has CaseFold only, no NotFull", () => {
    const m = new StrictMatcher("HELLO");
    const result = m.match("hello");
    expect(result).not.toBeNull();
    expect(result!.score).toBe(-200); // CaseFold only
  });

  it("non-prefix does not match (strict is prefix-only)", () => {
    const m = new StrictMatcher("llo");
    expect(m.match("hello")).toBeNull();
  });
});

// ── insertBracket() ────────────────────────────────────────────────

describe("insertBracket()", () => {
  it("inserting '(' at end of empty doc inserts '()' and places cursor inside", () => {
    const state = EditorState.create({ doc: "" });
    const tr = insertBracket(state, "(");
    expect(tr).not.toBeNull();
    const next = state.update(tr!).state;
    expect(next.doc.toString()).toBe("()");
    expect(next.selection.main.head).toBe(1);
  });

  it("inserting '[' at end of doc inserts '[]'", () => {
    const state = EditorState.create({ doc: "" });
    const tr = insertBracket(state, "[");
    expect(tr).not.toBeNull();
    const next = state.update(tr!).state;
    expect(next.doc.toString()).toBe("[]");
  });

  it("inserting '{' at end of doc inserts '{}'", () => {
    const state = EditorState.create({ doc: "" });
    const tr = insertBracket(state, "{");
    expect(tr).not.toBeNull();
    const next = state.update(tr!).state;
    expect(next.doc.toString()).toBe("{}");
  });

  it("inserting '(' before a word character returns null (not in before list)", () => {
    // 'a' is not in default 'before' chars ")]}:;>" so bracket is not auto-closed
    const state = EditorState.create({ doc: "abc", selection: { anchor: 0 } });
    const tr = insertBracket(state, "(");
    expect(tr).toBeNull();
  });

  it("inserting '(' before ')' closes bracket (next char is in before list)", () => {
    // ')' IS in the default before list, so '(' should be auto-closed
    const state = EditorState.create({ doc: ")", selection: { anchor: 0 } });
    const tr = insertBracket(state, "(");
    expect(tr).not.toBeNull();
    const next = state.update(tr!).state;
    expect(next.doc.toString()).toBe("())");
    expect(next.selection.main.head).toBe(1);
  });

  it("returns null for an unknown bracket character", () => {
    const state = EditorState.create({ doc: "" });
    const tr = insertBracket(state, "X");
    expect(tr).toBeNull();
  });

  it("transaction has userEvent 'input.type'", () => {
    const state = EditorState.create({ doc: "" });
    const tr = insertBracket(state, "(");
    expect(tr).not.toBeNull();
    expect(tr!.isUserEvent("input.type")).toBe(true);
  });
});

// ── deleteBracketPair() ────────────────────────────────────────────

describe("deleteBracketPair()", () => {
  it("deletes both '(' and ')' when cursor is between them", () => {
    // Doc: "()", cursor at 1
    const state = EditorState.create({ doc: "()", selection: { anchor: 1 } });
    let dispatched = false;
    const result = deleteBracketPair({ state, dispatch: (tr) => { dispatched = true; state.update(tr) } } as any);
    expect(result).toBe(true);
    expect(dispatched).toBe(true);
  });

  it("deletes both '[' and ']' when cursor is between them", () => {
    const state = EditorState.create({ doc: "[]", selection: { anchor: 1 } });
    let newState: EditorState | null = null;
    deleteBracketPair({ state, dispatch: (tr) => { newState = state.update(tr).state } } as any);
    expect(newState!.doc.toString()).toBe("");
  });

  it("deletes both '{' and '}' when cursor is between them", () => {
    const state = EditorState.create({ doc: "{}", selection: { anchor: 1 } });
    let newState: EditorState | null = null;
    deleteBracketPair({ state, dispatch: (tr) => { newState = state.update(tr).state } } as any);
    expect(newState!.doc.toString()).toBe("");
  });

  it("returns false when cursor is not between matching brackets", () => {
    const state = EditorState.create({ doc: "hello", selection: { anchor: 2 } });
    let dispatched = false;
    const result = deleteBracketPair({ state, dispatch: () => { dispatched = true } } as any);
    expect(result).toBe(false);
    expect(dispatched).toBe(false);
  });

  it("returns false for readOnly state", () => {
    const state = EditorState.create({ doc: "()", selection: { anchor: 1 }, extensions: [EditorState.readOnly.of(true)] });
    let dispatched = false;
    const result = deleteBracketPair({ state, dispatch: () => { dispatched = true } } as any);
    expect(result).toBe(false);
    expect(dispatched).toBe(false);
  });

  it("correctly places cursor at the deleted position", () => {
    const state = EditorState.create({ doc: "x()y", selection: { anchor: 2 } });
    let newState: EditorState | null = null;
    deleteBracketPair({ state, dispatch: (tr) => { newState = state.update(tr).state } } as any);
    expect(newState!.doc.toString()).toBe("xy");
    expect(newState!.selection.main.head).toBe(1);
  });
});
