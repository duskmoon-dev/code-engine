import { describe, it, expect } from "bun:test";
import { java, javaLanguage } from "../../src/lang/java/index";

describe("Java language pack", () => {
  it("exports java function", () => {
    expect(typeof java).toBe("function");
  });

  it("exports javaLanguage", () => {
    expect(javaLanguage).toBeDefined();
    expect(javaLanguage.name).toBe("java");
  });

  it("creates language support", () => {
    const support = java();
    expect(support).toBeDefined();
  });
});
