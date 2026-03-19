import { describe, it, expect } from "bun:test";
import { json, jsonLanguage } from "../../src/lang/json/index";

describe("JSON language pack", () => {
  it("exports json function", () => {
    expect(typeof json).toBe("function");
  });

  it("exports jsonLanguage", () => {
    expect(jsonLanguage).toBeDefined();
    expect(jsonLanguage.name).toBe("json");
  });

  it("creates language support", () => {
    const support = json();
    expect(support).toBeDefined();
  });
});
