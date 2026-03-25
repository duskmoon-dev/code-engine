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
});
