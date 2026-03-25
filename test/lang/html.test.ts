import { describe, it, expect } from "bun:test";
import {
  html, htmlLanguage, autoCloseTags,
  htmlCompletionSource, htmlCompletionSourceWith,
  Schema, elementName, eventAttributes,
  type TagSpec
} from "../../src/lang/html/index";

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

  it("exports htmlCompletionSource", () => {
    expect(typeof htmlCompletionSource).toBe("function");
  });

  it("exports htmlCompletionSourceWith", () => {
    expect(typeof htmlCompletionSourceWith).toBe("function");
  });

  it("exports Schema", () => {
    expect(Schema).toBeDefined();
  });

  it("exports elementName", () => {
    expect(typeof elementName).toBe("function");
  });

  it("exports eventAttributes", () => {
    expect(Array.isArray(eventAttributes)).toBe(true);
    expect(eventAttributes.length).toBeGreaterThan(0);
  });

  it("creates language support with default options", () => {
    const support = html();
    expect(support).toBeDefined();
    expect(support.language).toBe(htmlLanguage);
  });

  it("creates language support with matchClosingTags disabled", () => {
    const support = html({ matchClosingTags: false });
    expect(support).toBeDefined();
  });

  it("creates language support with selfClosingTags enabled", () => {
    const support = html({ selfClosingTags: true });
    expect(support).toBeDefined();
  });

  it("creates language support with custom tags", () => {
    const extraTags: Record<string, TagSpec> = {
      "my-button": { attrs: { disabled: null, label: null } },
    };
    const support = html({ extraTags });
    expect(support).toBeDefined();
  });

  it("htmlCompletionSourceWith returns a completion source", () => {
    const source = htmlCompletionSourceWith({});
    expect(typeof source).toBe("function");
  });

  it("htmlCompletionSourceWith with extra tags", () => {
    const extraTags: Record<string, TagSpec> = {
      "x-button": { attrs: { type: ["button", "submit", "reset"] } },
    };
    const source = htmlCompletionSourceWith({ extraTags });
    expect(typeof source).toBe("function");
  });
});
