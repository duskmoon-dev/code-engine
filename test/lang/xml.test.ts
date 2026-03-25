import { describe, it, expect } from "bun:test";
import {
  xml, xmlLanguage, completeFromSchema, autoCloseTags,
  type ElementSpec, type AttrSpec
} from "../../src/lang/xml/index";

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
    expect(support.language).toBe(xmlLanguage);
  });

  it("creates language support with autoCloseTags disabled", () => {
    const support = xml({ autoCloseTags: false });
    expect(support).toBeDefined();
  });

  it("creates language support with element schema", () => {
    const elements: ElementSpec[] = [
      { name: "root", top: true, children: ["child"] },
      { name: "child", attributes: ["id", "class"] },
    ];
    const support = xml({ elements });
    expect(support).toBeDefined();
  });

  it("creates language support with attribute schema", () => {
    const attributes: AttrSpec[] = [
      { name: "id", global: true },
      { name: "class", global: true, values: ["foo", "bar"] },
    ];
    const support = xml({ attributes });
    expect(support).toBeDefined();
  });

  it("creates language support with full schema", () => {
    const elements: ElementSpec[] = [
      { name: "catalog", top: true, children: ["book"] },
      { name: "book", attributes: ["id"], children: ["title", "author"] },
      { name: "title" },
      { name: "author" },
    ];
    const attributes: AttrSpec[] = [
      { name: "id", global: true },
    ];
    const support = xml({ elements, attributes });
    expect(support).toBeDefined();
  });

  it("completeFromSchema returns a completion source function", () => {
    const source = completeFromSchema(
      [{ name: "root", top: true }],
      []
    );
    expect(typeof source).toBe("function");
  });

  it("completeFromSchema with empty schema returns a function", () => {
    const source = completeFromSchema([], []);
    expect(typeof source).toBe("function");
  });

  it("xmlLanguage has correct language data", () => {
    const data = xmlLanguage.data.of({});
    expect(data).toBeDefined();
  });

  it("element spec supports textContent", () => {
    const elements: ElementSpec[] = [
      { name: "note", textContent: ["important", "critical"] },
    ];
    const support = xml({ elements });
    expect(support).toBeDefined();
  });

  it("element spec supports completion metadata", () => {
    const elements: ElementSpec[] = [
      {
        name: "button",
        completion: { boost: 10, info: "HTML button element" }
      },
    ];
    const support = xml({ elements });
    expect(support).toBeDefined();
  });
});
