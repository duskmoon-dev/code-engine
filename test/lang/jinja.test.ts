import { describe, it, expect } from "bun:test";
import { jinja, jinjaLanguage, jinjaCompletionSource, closePercentBrace } from "../../src/lang/jinja/index";

describe("Jinja language pack", () => {
  it("exports jinja function", () => {
    expect(typeof jinja).toBe("function");
  });

  it("exports jinjaLanguage", () => {
    expect(jinjaLanguage).toBeDefined();
  });

  it("exports jinjaCompletionSource", () => {
    expect(jinjaCompletionSource).toBeDefined();
  });

  it("exports closePercentBrace", () => {
    expect(closePercentBrace).toBeDefined();
  });

  it("creates language support", () => {
    const support = jinja();
    expect(support).toBeDefined();
  });
});
