import { describe, it, expect } from "bun:test";
import { php, phpLanguage } from "../../src/lang/php/index";
import { htmlLanguage } from "../../src/lang/html/index";

describe("PHP language pack", () => {
  it("exports php function", () => {
    expect(typeof php).toBe("function");
  });

  it("exports phpLanguage", () => {
    expect(phpLanguage).toBeDefined();
    expect(phpLanguage.name).toBe("php");
  });

  it("creates language support with default options (html base)", () => {
    const support = php();
    expect(support).toBeDefined();
  });

  it("creates language support with plain mode", () => {
    const support = php({ plain: true });
    expect(support).toBeDefined();
  });

  it("creates language support with null base (no html embedding)", () => {
    const support = php({ baseLanguage: null });
    expect(support).toBeDefined();
  });

  it("creates language support with custom base language", () => {
    const support = php({ baseLanguage: htmlLanguage });
    expect(support).toBeDefined();
  });

  it("php() returns LanguageSupport with a language", () => {
    const lang = php();
    expect(lang.language).toBeDefined();
  });
});
