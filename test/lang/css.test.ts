import { describe, it, expect } from "bun:test";
import { css, cssLanguage } from "../../src/lang/css/index";

describe("CSS language pack", () => {
  it("exports css function", () => {
    expect(typeof css).toBe("function");
  });

  it("exports cssLanguage", () => {
    expect(cssLanguage).toBeDefined();
    expect(cssLanguage.name).toBe("css");
  });

  it("creates language support", () => {
    const support = css();
    expect(support).toBeDefined();
  });
});
