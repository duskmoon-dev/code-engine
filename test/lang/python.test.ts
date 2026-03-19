import { describe, it, expect } from "bun:test";
import { python, pythonLanguage } from "../../src/lang/python/index";

describe("Python language pack", () => {
  it("exports python function", () => {
    expect(typeof python).toBe("function");
  });

  it("exports pythonLanguage", () => {
    expect(pythonLanguage).toBeDefined();
    expect(pythonLanguage.name).toBe("python");
  });

  it("creates language support", () => {
    const support = python();
    expect(support).toBeDefined();
  });
});
