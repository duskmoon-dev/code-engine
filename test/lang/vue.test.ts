import { describe, it, expect } from "bun:test";
import { vue, vueLanguage } from "../../src/lang/vue/index";

describe("Vue language pack", () => {
  it("exports vue function", () => {
    expect(typeof vue).toBe("function");
  });

  it("exports vueLanguage", () => {
    expect(vueLanguage).toBeDefined();
  });

  it("creates language support", () => {
    const support = vue();
    expect(support).toBeDefined();
  });
});
