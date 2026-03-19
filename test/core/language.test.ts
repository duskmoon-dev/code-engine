import { describe, it, expect } from "bun:test";
import { HighlightStyle, syntaxHighlighting } from "../../src/core/language/index";
import { tags } from "../../src/parser/highlight/index";

describe("Language module", () => {
  it("exports HighlightStyle", () => {
    expect(HighlightStyle).toBeDefined();
    expect(typeof HighlightStyle.define).toBe("function");
  });

  it("exports syntaxHighlighting", () => {
    expect(typeof syntaxHighlighting).toBe("function");
  });
});

describe("Highlight tags", () => {
  it("exports standard tags", () => {
    expect(tags.keyword).toBeDefined();
    expect(tags.comment).toBeDefined();
    expect(tags.string).toBeDefined();
    expect(tags.number).toBeDefined();
    expect(tags.operator).toBeDefined();
    expect(typeof tags.function).toBe("function");
  });
});
