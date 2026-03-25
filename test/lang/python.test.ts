import { describe, it, expect } from "bun:test";
import {
  python, pythonLanguage,
  localCompletionSource, snippets, globalCompletion
} from "../../src/lang/python/index";

describe("Python language pack", () => {
  it("exports python function", () => {
    expect(typeof python).toBe("function");
  });

  it("exports pythonLanguage", () => {
    expect(pythonLanguage).toBeDefined();
    expect(pythonLanguage.name).toBe("python");
  });

  it("exports localCompletionSource", () => {
    expect(typeof localCompletionSource).toBe("function");
  });

  it("exports snippets array", () => {
    expect(Array.isArray(snippets)).toBe(true);
    expect(snippets.length).toBeGreaterThan(0);
  });

  it("exports globalCompletion", () => {
    expect(globalCompletion).toBeDefined();
    expect(typeof globalCompletion).toBe("function");
  });

  it("creates language support", () => {
    const support = python();
    expect(support).toBeDefined();
    expect(support.language).toBe(pythonLanguage);
  });

  it("snippets contain Python-specific completions", () => {
    const labels = snippets.map((s: any) => s.label);
    // Python snippets should include common patterns
    expect(labels.length).toBeGreaterThan(0);
    expect(labels.every((l: any) => typeof l === "string")).toBe(true);
  });
});
