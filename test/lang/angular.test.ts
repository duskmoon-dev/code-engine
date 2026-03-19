import { describe, it, expect } from "bun:test";
import { angular, angularLanguage } from "../../src/lang/angular/index";

describe("Angular language pack", () => {
  it("exports angular function", () => {
    expect(typeof angular).toBe("function");
  });

  it("exports angularLanguage", () => {
    expect(angularLanguage).toBeDefined();
  });

  it("creates language support with default options", () => {
    const support = angular();
    expect(support).toBeDefined();
  });
});
