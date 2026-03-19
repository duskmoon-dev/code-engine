import { describe, it, expect } from "bun:test";
import { yaml, yamlLanguage, yamlFrontmatter } from "../../src/lang/yaml/index";

describe("YAML language pack", () => {
  it("exports yaml function", () => {
    expect(typeof yaml).toBe("function");
  });

  it("exports yamlLanguage", () => {
    expect(yamlLanguage).toBeDefined();
  });

  it("exports yamlFrontmatter", () => {
    expect(typeof yamlFrontmatter).toBe("function");
  });

  it("creates language support", () => {
    const support = yaml();
    expect(support).toBeDefined();
  });
});
