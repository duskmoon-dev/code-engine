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
