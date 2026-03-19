import { describe, it, expect } from "bun:test";
import { javascript, javascriptLanguage } from "../../src/lang/javascript/index";

describe("JavaScript language pack", () => {
  it("exports javascript function", () => {
    expect(typeof javascript).toBe("function");
  });

  it("exports javascriptLanguage", () => {
    expect(javascriptLanguage).toBeDefined();
    expect(javascriptLanguage.name).toBe("javascript");
  });

  it("creates language support with default options", () => {
    const support = javascript();
    expect(support).toBeDefined();
  });

  it("creates TypeScript language support", () => {
    const support = javascript({ typescript: true });
    expect(support).toBeDefined();
  });

  it("creates JSX language support", () => {
    const support = javascript({ jsx: true });
    expect(support).toBeDefined();
  });
});
