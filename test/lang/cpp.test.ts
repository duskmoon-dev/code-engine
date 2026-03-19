import { describe, it, expect } from "bun:test";
import { cpp, cppLanguage } from "../../src/lang/cpp/index";

describe("C++ language pack", () => {
  it("exports cpp function", () => {
    expect(typeof cpp).toBe("function");
  });

  it("exports cppLanguage", () => {
    expect(cppLanguage).toBeDefined();
    expect(cppLanguage.name).toBe("cpp");
  });

  it("creates language support", () => {
    const support = cpp();
    expect(support).toBeDefined();
  });
});
