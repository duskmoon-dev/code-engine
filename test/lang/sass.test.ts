import { describe, it, expect } from "bun:test";
import { sass, sassLanguage, sassCompletionSource } from "../../src/lang/sass/index";

describe("Sass language pack", () => {
  it("exports sass function", () => {
    expect(typeof sass).toBe("function");
  });

  it("exports sassLanguage", () => {
    expect(sassLanguage).toBeDefined();
    expect(sassLanguage.name).toBe("sass");
  });

  it("exports sassCompletionSource", () => {
    expect(sassCompletionSource).toBeDefined();
  });

  it("creates language support with default options", () => {
    const support = sass();
    expect(support).toBeDefined();
  });
});
