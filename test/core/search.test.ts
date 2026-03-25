import { describe, it, expect } from "bun:test";
import {
  search,
  searchKeymap,
  SearchCursor,
  RegExpCursor,
  gotoLine,
  selectNextOccurrence,
  highlightSelectionMatches,
  SearchQuery,
  setSearchQuery,
  getSearchQuery,
  searchPanelOpen,
  findNext,
  findPrevious,
  selectMatches,
  selectSelectionMatches,
  replaceNext,
  replaceAll,
  openSearchPanel,
  closeSearchPanel,
  validRegExp,
} from "../../src/core/search/index";
import { Text } from "../../src/core/state/index";

describe("search module exports", () => {
  it("exports search as a function", () => {
    expect(search).toBeDefined();
    expect(typeof search).toBe("function");
  });

  it("exports searchKeymap as an array", () => {
    expect(searchKeymap).toBeDefined();
    expect(Array.isArray(searchKeymap)).toBe(true);
    expect(searchKeymap.length).toBeGreaterThan(0);
  });

  it("exports SearchCursor as a class", () => {
    expect(SearchCursor).toBeDefined();
    expect(typeof SearchCursor).toBe("function");
  });

  it("exports RegExpCursor as a class", () => {
    expect(RegExpCursor).toBeDefined();
    expect(typeof RegExpCursor).toBe("function");
  });

  it("exports gotoLine as a function", () => {
    expect(gotoLine).toBeDefined();
    expect(typeof gotoLine).toBe("function");
  });

  it("exports selectNextOccurrence as a function", () => {
    expect(selectNextOccurrence).toBeDefined();
    expect(typeof selectNextOccurrence).toBe("function");
  });

  it("exports highlightSelectionMatches as a function", () => {
    expect(highlightSelectionMatches).toBeDefined();
    expect(typeof highlightSelectionMatches).toBe("function");
  });

  it("exports SearchQuery as a class", () => {
    expect(SearchQuery).toBeDefined();
    expect(typeof SearchQuery).toBe("function");
  });

  it("exports setSearchQuery as defined", () => {
    expect(setSearchQuery).toBeDefined();
  });

  it("exports getSearchQuery as a function", () => {
    expect(getSearchQuery).toBeDefined();
    expect(typeof getSearchQuery).toBe("function");
  });

  it("exports searchPanelOpen as a function", () => {
    expect(searchPanelOpen).toBeDefined();
    expect(typeof searchPanelOpen).toBe("function");
  });

  it("exports findNext as a function", () => {
    expect(findNext).toBeDefined();
    expect(typeof findNext).toBe("function");
  });

  it("exports findPrevious as a function", () => {
    expect(findPrevious).toBeDefined();
    expect(typeof findPrevious).toBe("function");
  });

  it("exports selectMatches as a function", () => {
    expect(selectMatches).toBeDefined();
    expect(typeof selectMatches).toBe("function");
  });

  it("exports selectSelectionMatches as a function", () => {
    expect(selectSelectionMatches).toBeDefined();
    expect(typeof selectSelectionMatches).toBe("function");
  });

  it("exports replaceNext as a function", () => {
    expect(replaceNext).toBeDefined();
    expect(typeof replaceNext).toBe("function");
  });

  it("exports replaceAll as a function", () => {
    expect(replaceAll).toBeDefined();
    expect(typeof replaceAll).toBe("function");
  });

  it("exports openSearchPanel as a function", () => {
    expect(openSearchPanel).toBeDefined();
    expect(typeof openSearchPanel).toBe("function");
  });

  it("exports closeSearchPanel as a function", () => {
    expect(closeSearchPanel).toBeDefined();
    expect(typeof closeSearchPanel).toBe("function");
  });

  it("exports validRegExp as a function", () => {
    expect(validRegExp).toBeDefined();
    expect(typeof validRegExp).toBe("function");
  });
});

describe("validRegExp", () => {
  it("returns true for a valid regular expression", () => {
    expect(validRegExp("abc")).toBe(true);
    expect(validRegExp("a.*b")).toBe(true);
  });

  it("returns false for an invalid regular expression", () => {
    expect(validRegExp("[")).toBe(false);
    expect(validRegExp("(")).toBe(false);
  });
});

describe("searchKeymap entries", () => {
  it("each entry has a run or shift property that is a function", () => {
    for (const binding of searchKeymap) {
      const hasHandler = typeof binding.run === "function" ||
                         typeof binding.shift === "function";
      expect(hasHandler).toBe(true);
    }
  });
});

describe("search function", () => {
  it("returns an extension when called with no arguments", () => {
    const ext = search();
    expect(ext).toBeDefined();
  });

  it("returns an extension when called with config", () => {
    const ext = search({ top: true });
    expect(ext).toBeDefined();
  });
});

describe("SearchQuery", () => {
  it("constructs with search string", () => {
    const q = new SearchQuery({ search: "hello" });
    expect(q).toBeDefined();
    expect(q.search).toBe("hello");
  });

  it("caseSensitive defaults to false", () => {
    const q = new SearchQuery({ search: "hello" });
    expect(q.caseSensitive).toBe(false);
  });

  it("caseSensitive can be set to true", () => {
    const q = new SearchQuery({ search: "hello", caseSensitive: true });
    expect(q.caseSensitive).toBe(true);
  });

  it("regexp defaults to false", () => {
    const q = new SearchQuery({ search: "hello" });
    expect(q.regexp).toBe(false);
  });

  it("wholeWord defaults to false", () => {
    const q = new SearchQuery({ search: "hello" });
    expect(q.wholeWord).toBe(false);
  });

  it("replace defaults to empty string", () => {
    const q = new SearchQuery({ search: "hello" });
    expect(q.replace).toBe("");
  });

  it("accepts a replace string", () => {
    const q = new SearchQuery({ search: "hello", replace: "world" });
    expect(q.replace).toBe("world");
  });

  it("eq() returns true for identical queries", () => {
    const q1 = new SearchQuery({ search: "abc", caseSensitive: true });
    const q2 = new SearchQuery({ search: "abc", caseSensitive: true });
    expect(q1.eq(q2)).toBe(true);
  });

  it("eq() returns false for different queries", () => {
    const q1 = new SearchQuery({ search: "abc" });
    const q2 = new SearchQuery({ search: "xyz" });
    expect(q1.eq(q2)).toBe(false);
  });
});

describe("SearchCursor", () => {
  it("can iterate matches in a text", () => {
    const text = Text.of(["hello world hello"]);
    const cursor = new SearchCursor(text, "hello");
    const first = cursor.next();
    expect(first.value).toBeDefined();
    expect(first.value!.from).toBe(0);
    expect(first.value!.to).toBe(5);
  });

  it("returns done when no more matches", () => {
    const text = Text.of(["no match here"]);
    const cursor = new SearchCursor(text, "xyz");
    const result = cursor.next();
    expect(result.done).toBe(true);
  });

  it("finds all occurrences of a term", () => {
    const text = Text.of(["the cat sat on the mat"]);
    const cursor = new SearchCursor(text, "at");
    const matches: Array<{from: number; to: number}> = [];
    let r = cursor.next();
    while (!r.done) {
      matches.push({ from: r.value!.from, to: r.value!.to });
      r = cursor.next();
    }
    expect(matches.length).toBe(3); // "cat", "sat", "mat"
  });

  it("respects from/to range constraints", () => {
    const text = Text.of(["hello hello hello"]);
    const cursor = new SearchCursor(text, "hello", 6);
    const first = cursor.next();
    expect(first.value!.from).toBe(6);
  });

  it("is case-sensitive by default", () => {
    const text = Text.of(["Hello HELLO hello"]);
    const cursor = new SearchCursor(text, "hello");
    const first = cursor.next();
    expect(first.value!.from).toBe(12);
  });
});

describe("RegExpCursor", () => {
  it("matches a regex pattern", () => {
    const text = Text.of(["foo123bar456"]);
    const cursor = new RegExpCursor(text, "\\d+");
    const first = cursor.next();
    expect(first.value).toBeDefined();
    expect(first.value!.from).toBe(3);
    expect(first.value!.to).toBe(6);
  });

  it("returns done when no regex match", () => {
    const text = Text.of(["no numbers here"]);
    const cursor = new RegExpCursor(text, "\\d+");
    const result = cursor.next();
    expect(result.done).toBe(true);
  });

  it("finds all regex matches", () => {
    const text = Text.of(["cat bat mat"]);
    const cursor = new RegExpCursor(text, "[a-z]at");
    const matches: string[] = [];
    let r = cursor.next();
    while (!r.done) {
      matches.push(text.sliceString(r.value!.from, r.value!.to));
      r = cursor.next();
    }
    expect(matches).toEqual(["cat", "bat", "mat"]);
  });

  it("respects from constraint", () => {
    const text = Text.of(["abc123def456"]);
    const cursor = new RegExpCursor(text, "\\d+", {}, 6);
    const first = cursor.next();
    expect(first.value!.from).toBeGreaterThanOrEqual(6);
  });

  it("captures groups in match", () => {
    const text = Text.of(["2024-01-15"]);
    const cursor = new RegExpCursor(text, "(\\d{4})-(\\d{2})-(\\d{2})");
    const first = cursor.next();
    expect(first.value).toBeDefined();
    expect(first.value!.from).toBe(0);
    expect(first.value!.to).toBe(10);
  });
});

describe("SearchCursor multi-line", () => {
  it("finds a term across a multi-line Text", () => {
    const text = Text.of(["line one", "line two", "line three"]);
    const cursor = new SearchCursor(text, "two");
    const match = cursor.next();
    expect(match.done).toBe(false);
    expect(match.value).toBeDefined();
  });

  it("case-insensitive search with normalize option", () => {
    const text = Text.of(["Hello World"]);
    const cursor = new SearchCursor(text, "hello", 0, text.length, (s) => s.toLowerCase());
    const match = cursor.next();
    expect(match.done).toBe(false);
    expect(match.value!.from).toBe(0);
  });
});

describe("SearchQuery behavior", () => {
  it("SearchQuery with regexp=true", () => {
    const q = new SearchQuery({ search: "hel+o", regexp: true });
    expect(q.regexp).toBe(true);
    expect(q.search).toBe("hel+o");
  });

  it("SearchQuery with wholeWord=true", () => {
    const q = new SearchQuery({ search: "hello", wholeWord: true });
    expect(q.wholeWord).toBe(true);
  });

  it("SearchQuery.eq() returns false when caseSensitive differs", () => {
    const q1 = new SearchQuery({ search: "foo", caseSensitive: true });
    const q2 = new SearchQuery({ search: "foo", caseSensitive: false });
    expect(q1.eq(q2)).toBe(false);
  });

  it("SearchQuery.eq() returns false when replace differs", () => {
    const q1 = new SearchQuery({ search: "foo", replace: "bar" });
    const q2 = new SearchQuery({ search: "foo", replace: "baz" });
    expect(q1.eq(q2)).toBe(false);
  });

  it("empty search string constructs without error", () => {
    const q = new SearchQuery({ search: "" });
    expect(q.search).toBe("");
  });

  it("gotoLine is a function", () => {
    expect(typeof gotoLine).toBe("function");
  });

  it("selectNextOccurrence is a function", () => {
    expect(typeof selectNextOccurrence).toBe("function");
  });

  it("highlightSelectionMatches is a function", () => {
    expect(typeof highlightSelectionMatches).toBe("function");
  });

  it("validRegExp is a function", () => {
    expect(typeof validRegExp).toBe("function");
  });
});

describe("RegExpCursor detailed", () => {
  it("finds two matches of 'hello' in 'hello world hello'", () => {
    const text = Text.of(["hello world hello"]);
    const cursor = new RegExpCursor(text, "hello");
    const matches: Array<{ from: number; to: number }> = [];
    while (!cursor.next().done) {
      matches.push({ from: cursor.value.from, to: cursor.value.to });
    }
    expect(matches.length).toBe(2);
    expect(matches[0]).toEqual({ from: 0, to: 5 });
    expect(matches[1]).toEqual({ from: 12, to: 17 });
  });

  it("iterates all matches with next() verifying from/to positions", () => {
    const text = Text.of(["ab ab ab"]);
    const cursor = new RegExpCursor(text, "ab");
    cursor.next();
    expect(cursor.done).toBe(false);
    expect(cursor.value.from).toBe(0);
    expect(cursor.value.to).toBe(2);
    cursor.next();
    expect(cursor.value.from).toBe(3);
    expect(cursor.value.to).toBe(5);
    cursor.next();
    expect(cursor.value.from).toBe(6);
    expect(cursor.value.to).toBe(8);
    cursor.next();
    expect(cursor.done).toBe(true);
  });

  it("supports case-insensitive search with ignoreCase option", () => {
    const text = Text.of(["Hello HELLO hello"]);
    const cursor = new RegExpCursor(text, "hello", { ignoreCase: true });
    const matches: number[] = [];
    while (!cursor.next().done) {
      matches.push(cursor.value.from);
    }
    expect(matches).toEqual([0, 6, 12]);
  });

  it("restricts search with from/to range", () => {
    const text = Text.of(["aaa bbb aaa bbb aaa"]);
    const cursor = new RegExpCursor(text, "aaa", {}, 4, 15);
    const matches: number[] = [];
    while (!cursor.next().done) {
      matches.push(cursor.value.from);
    }
    expect(matches).toEqual([8]);
  });

  it("done flag starts false and becomes true after exhausting matches", () => {
    const text = Text.of(["x"]);
    const cursor = new RegExpCursor(text, "x");
    expect(cursor.done).toBe(false);
    cursor.next();
    expect(cursor.done).toBe(false);
    cursor.next();
    expect(cursor.done).toBe(true);
  });

  it("no matches — done after first next()", () => {
    const text = Text.of(["abcdef"]);
    const cursor = new RegExpCursor(text, "z");
    cursor.next();
    expect(cursor.done).toBe(true);
  });

  it("match object contains capture groups", () => {
    const text = Text.of(["2024-01-15"]);
    const cursor = new RegExpCursor(text, "(\\d{4})-(\\d{2})-(\\d{2})");
    cursor.next();
    expect(cursor.done).toBe(false);
    expect(cursor.value.match[0]).toBe("2024-01-15");
    expect(cursor.value.match[1]).toBe("2024");
    expect(cursor.value.match[2]).toBe("01");
    expect(cursor.value.match[3]).toBe("15");
  });

  it("searches from middle of text", () => {
    const text = Text.of(["foo bar foo bar"]);
    const cursor = new RegExpCursor(text, "foo", {}, 4);
    cursor.next();
    expect(cursor.done).toBe(false);
    expect(cursor.value.from).toBe(8);
    cursor.next();
    expect(cursor.done).toBe(true);
  });

  it("test function filters matches", () => {
    const text = Text.of(["aa bb cc dd"]);
    // Only accept matches starting at even positions
    const cursor = new RegExpCursor(text, "[a-z]+", {
      test: (from, _to, _match) => from % 2 === 0,
    });
    const matches: string[] = [];
    while (!cursor.next().done) {
      matches.push(text.sliceString(cursor.value.from, cursor.value.to));
    }
    expect(matches).toEqual(["aa", "cc"]);
  });

  it("handles pattern that matches at end of text", () => {
    const text = Text.of(["hello world"]);
    const cursor = new RegExpCursor(text, "world$");
    cursor.next();
    expect(cursor.done).toBe(false);
    expect(cursor.value.from).toBe(6);
    expect(cursor.value.to).toBe(11);
  });
});

describe("MultilineRegExpCursor", () => {
  it("pattern with \\n searches across lines", () => {
    const text = Text.of(["line1", "line2", "line3"]);
    const cursor = new RegExpCursor(text, "line1\\nline2");
    cursor.next();
    expect(cursor.done).toBe(false);
    expect(cursor.value.from).toBe(0);
    expect(cursor.value.to).toBe(11);
  });

  it("pattern with \\s matches across lines", () => {
    const text = Text.of(["hello", "world"]);
    const cursor = new RegExpCursor(text, "hello\\sworld");
    cursor.next();
    expect(cursor.done).toBe(false);
    expect(cursor.value.from).toBe(0);
    expect(cursor.value.to).toBe(11);
  });

  it("pattern with \\r triggers multiline mode", () => {
    const text = Text.of(["abc", "def"]);
    // \r in pattern triggers MultilineRegExpCursor; it should still work
    const cursor = new RegExpCursor(text, "abc[\\r\\n]+def");
    cursor.next();
    expect(cursor.done).toBe(false);
    expect(text.sliceString(cursor.value.from, cursor.value.to)).toBe("abc\ndef");
  });

  it("multiline search with Text.of for multiple lines", () => {
    const text = Text.of(["alpha", "beta", "gamma"]);
    const cursor = new RegExpCursor(text, "beta\\ngamma");
    cursor.next();
    expect(cursor.done).toBe(false);
    expect(cursor.value.from).toBe(6);
    // "beta\ngamma" = 10 chars, starting at 6 => to = 16
    expect(cursor.value.to).toBe(16);
  });
});

describe("SearchCursor detailed", () => {
  it("basic string search finds match at correct position", () => {
    const text = Text.of(["hello world"]);
    const cursor = new SearchCursor(text, "world");
    cursor.next();
    expect(cursor.done).toBe(false);
    expect(cursor.value.from).toBe(6);
    expect(cursor.value.to).toBe(11);
  });

  it("case-insensitive search via normalize function", () => {
    const text = Text.of(["Hello World HELLO"]);
    const cursor = new SearchCursor(text, "hello", 0, text.length, s => s.toLowerCase());
    const matches: number[] = [];
    while (!cursor.next().done) {
      matches.push(cursor.value.from);
    }
    expect(matches).toEqual([0, 12]);
  });

  it("search from a given position", () => {
    const text = Text.of(["aaa bbb aaa"]);
    const cursor = new SearchCursor(text, "aaa", 4);
    cursor.next();
    expect(cursor.done).toBe(false);
    expect(cursor.value.from).toBe(8);
  });

  it("no match returns done=true", () => {
    const text = Text.of(["some text"]);
    const cursor = new SearchCursor(text, "xyz");
    cursor.next();
    expect(cursor.done).toBe(true);
  });

  it("multiple matches iteration returns all occurrences", () => {
    const text = Text.of(["abcabcabc"]);
    const cursor = new SearchCursor(text, "abc");
    const positions: number[] = [];
    while (!cursor.next().done) {
      positions.push(cursor.value.from);
    }
    expect(positions).toEqual([0, 3, 6]);
  });
});

describe("SearchQuery extended", () => {
  it("valid is true for non-empty search string", () => {
    const q = new SearchQuery({ search: "test" });
    expect(q.valid).toBe(true);
  });

  it("valid is false for empty search string", () => {
    const q = new SearchQuery({ search: "" });
    expect(q.valid).toBe(false);
  });

  it("valid is false for invalid regexp", () => {
    const q = new SearchQuery({ search: "[", regexp: true });
    expect(q.valid).toBe(false);
  });

  it("valid is true for valid regexp", () => {
    const q = new SearchQuery({ search: "a.*b", regexp: true });
    expect(q.valid).toBe(true);
  });

  it("getCursor returns an iterator over a Text", () => {
    const text = Text.of(["foo bar foo"]);
    const q = new SearchQuery({ search: "foo" });
    const cursor = q.getCursor(text);
    const result = cursor.next();
    expect(result.done).toBe(false);
    expect(result.value!.from).toBe(0);
    expect(result.value!.to).toBe(3);
  });
});

describe("validRegExp extended", () => {
  it("returns true for valid patterns", () => {
    expect(validRegExp("a+b*")).toBe(true);
    expect(validRegExp("^\\d{3}$")).toBe(true);
    expect(validRegExp("[a-z]")).toBe(true);
  });

  it("returns false for invalid patterns", () => {
    expect(validRegExp("*")).toBe(false);
    expect(validRegExp("(?P<name>a)")).toBe(false);
  });
});
