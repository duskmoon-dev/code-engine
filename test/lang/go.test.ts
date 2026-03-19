import { describe, it, expect } from "bun:test";
import { go, goLanguage, snippets, localCompletionSource } from "../../src/lang/go/index";

describe("Go language pack", () => {
  it("exports go function", () => {
    expect(typeof go).toBe("function");
  });

  it("exports goLanguage", () => {
    expect(goLanguage).toBeDefined();
    expect(goLanguage.name).toBe("go");
  });

  it("exports snippets", () => {
    expect(snippets).toBeDefined();
    expect(Array.isArray(snippets)).toBe(true);
  });

  it("exports localCompletionSource", () => {
    expect(typeof localCompletionSource).toBe("function");
  });

  it("creates language support", () => {
    const support = go();
    expect(support).toBeDefined();
  });
});
