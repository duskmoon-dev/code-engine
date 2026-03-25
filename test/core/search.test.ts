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
});
