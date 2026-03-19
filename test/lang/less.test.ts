import { describe, it, expect } from "bun:test";
import { less, lessLanguage, lessCompletionSource } from "../../src/lang/less/index";

describe("Less language pack", () => {
  it("exports less function", () => {
    expect(typeof less).toBe("function");
  });

  it("exports lessLanguage", () => {
    expect(lessLanguage).toBeDefined();
  });

  it("exports lessCompletionSource", () => {
    expect(lessCompletionSource).toBeDefined();
  });

  it("creates language support", () => {
    const support = less();
    expect(support).toBeDefined();
  });
});
