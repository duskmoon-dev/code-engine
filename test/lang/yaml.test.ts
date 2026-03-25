import { describe, it, expect } from "bun:test";
import { yaml, yamlLanguage, yamlFrontmatter } from "../../src/lang/yaml/index";
import { javascript } from "../../src/lang/javascript/index";

describe("YAML language pack", () => {
  it("exports yaml function", () => {
    expect(typeof yaml).toBe("function");
  });

  it("exports yamlLanguage", () => {
    expect(yamlLanguage).toBeDefined();
    expect(yamlLanguage.name).toBe("yaml");
  });

  it("exports yamlFrontmatter", () => {
    expect(typeof yamlFrontmatter).toBe("function");
  });

  it("creates language support", () => {
    const support = yaml();
    expect(support).toBeDefined();
    expect(support.language).toBe(yamlLanguage);
  });

  it("creates yamlFrontmatter with Language", () => {
    const jsLang = javascript().language;
    const support = yamlFrontmatter({ content: jsLang });
    expect(support).toBeDefined();
  });

  it("creates yamlFrontmatter with LanguageSupport", () => {
    const jsSupport = javascript();
    const support = yamlFrontmatter({ content: jsSupport });
    expect(support).toBeDefined();
  });

  it("yamlLanguage has correct name", () => {
    expect(yamlLanguage.name).toBe("yaml");
  });

  it("yaml() returns LanguageSupport with yamlLanguage", () => {
    const support = yaml();
    expect(support.language).toBe(yamlLanguage);
  });
});
