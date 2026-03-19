import { describe, it, expect } from "bun:test";
import { wast, wastLanguage } from "../../src/lang/wast/index";

describe("WAST language pack", () => {
  it("exports wast function", () => {
    expect(typeof wast).toBe("function");
  });

  it("exports wastLanguage", () => {
    expect(wastLanguage).toBeDefined();
  });

  it("creates language support", () => {
    const support = wast();
    expect(support).toBeDefined();
  });
});
