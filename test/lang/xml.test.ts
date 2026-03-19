import { describe, it, expect } from "bun:test";
import { xml, xmlLanguage, completeFromSchema, autoCloseTags } from "../../src/lang/xml/index";

describe("XML language pack", () => {
  it("exports xml function", () => {
    expect(typeof xml).toBe("function");
  });

  it("exports xmlLanguage", () => {
    expect(xmlLanguage).toBeDefined();
    expect(xmlLanguage.name).toBe("xml");
  });

  it("exports completeFromSchema", () => {
    expect(typeof completeFromSchema).toBe("function");
  });

  it("exports autoCloseTags", () => {
    expect(autoCloseTags).toBeDefined();
  });

  it("creates language support with default options", () => {
    const support = xml();
    expect(support).toBeDefined();
  });
});
