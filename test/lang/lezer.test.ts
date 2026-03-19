import { describe, it, expect } from "bun:test";
import { lezer, lezerLanguage } from "../../src/lang/lezer/index";

describe("Lezer language pack", () => {
  it("exports lezer function", () => {
    expect(typeof lezer).toBe("function");
  });

  it("exports lezerLanguage", () => {
    expect(lezerLanguage).toBeDefined();
  });

  it("creates language support", () => {
    const support = lezer();
    expect(support).toBeDefined();
  });
});
