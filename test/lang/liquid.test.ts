import { describe, it, expect } from "bun:test";
import { liquid, liquidLanguage, liquidCompletionSource, closePercentBrace } from "../../src/lang/liquid/index";

describe("Liquid language pack", () => {
  it("exports liquid function", () => {
    expect(typeof liquid).toBe("function");
  });

  it("exports liquidLanguage", () => {
    expect(liquidLanguage).toBeDefined();
  });

  it("exports liquidCompletionSource", () => {
    expect(liquidCompletionSource).toBeDefined();
  });

  it("exports closePercentBrace", () => {
    expect(closePercentBrace).toBeDefined();
  });

  it("creates language support", () => {
    const support = liquid();
    expect(support).toBeDefined();
  });
});
