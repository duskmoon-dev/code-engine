import { describe, it, expect } from "bun:test";
import { html, htmlLanguage, autoCloseTags } from "../../src/lang/html/index";

describe("HTML language pack", () => {
  it("exports html function", () => {
    expect(typeof html).toBe("function");
  });

  it("exports htmlLanguage", () => {
    expect(htmlLanguage).toBeDefined();
    expect(htmlLanguage.name).toBe("html");
  });

  it("exports autoCloseTags", () => {
    expect(autoCloseTags).toBeDefined();
  });

  it("creates language support with default options", () => {
    const support = html();
    expect(support).toBeDefined();
  });

  it("creates language support with matchClosingTags disabled", () => {
    const support = html({ matchClosingTags: false });
    expect(support).toBeDefined();
  });

  it("creates language support with selfClosingTags enabled", () => {
    const support = html({ selfClosingTags: true });
    expect(support).toBeDefined();
  });
});
