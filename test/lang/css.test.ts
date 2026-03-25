import { describe, it, expect } from "bun:test";
import {
  css, cssLanguage,
  cssCompletionSource, defineCSSCompletionSource
} from "../../src/lang/css/index";

describe("CSS language pack", () => {
  it("exports css function", () => {
    expect(typeof css).toBe("function");
  });

  it("exports cssLanguage", () => {
    expect(cssLanguage).toBeDefined();
    expect(cssLanguage.name).toBe("css");
  });

  it("exports cssCompletionSource", () => {
    expect(typeof cssCompletionSource).toBe("function");
  });

  it("exports defineCSSCompletionSource", () => {
    expect(typeof defineCSSCompletionSource).toBe("function");
  });

  it("creates language support", () => {
    const support = css();
    expect(support).toBeDefined();
    expect(support.language).toBe(cssLanguage);
  });

  it("defineCSSCompletionSource returns a CompletionSource", () => {
    const source = defineCSSCompletionSource(() => false);
    expect(typeof source).toBe("function");
  });

  it("defineCSSCompletionSource with variable checker", () => {
    const source = defineCSSCompletionSource(node => node.name === "VariableName");
    expect(typeof source).toBe("function");
  });

  it("css() returns LanguageSupport with cssLanguage", () => {
    const lang = css();
    expect(lang.language).toBe(cssLanguage);
    expect(lang.language.name).toBe("css");
  });
});
