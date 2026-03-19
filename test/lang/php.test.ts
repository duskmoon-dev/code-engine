import { describe, it, expect } from "bun:test";
import { php, phpLanguage } from "../../src/lang/php/index";

describe("PHP language pack", () => {
  it("exports php function", () => {
    expect(typeof php).toBe("function");
  });

  it("exports phpLanguage", () => {
    expect(phpLanguage).toBeDefined();
    expect(phpLanguage.name).toBe("php");
  });

  it("creates language support with default options", () => {
    const support = php();
    expect(support).toBeDefined();
  });
});
