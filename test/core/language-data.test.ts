import { describe, it, expect } from "bun:test";
import { languages } from "../../src/core/language-data/index";
import { LanguageDescription } from "../../src/core/language/index";

describe("languages", () => {
  it("is a non-empty array", () => {
    expect(Array.isArray(languages)).toBe(true);
    expect(languages.length).toBeGreaterThan(0);
  });

  it("every entry has a name string", () => {
    for (const lang of languages) {
      expect(typeof lang.name).toBe("string");
      expect(lang.name.length).toBeGreaterThan(0);
    }
  });

  it("every entry has a load function", () => {
    for (const lang of languages) {
      expect(typeof lang.load).toBe("function");
    }
  });

  const expected = ["JavaScript", "TypeScript", "Python", "HTML", "CSS", "Go", "Rust", "Java", "JSON", "Markdown"];
  for (const name of expected) {
    it(`includes ${name}`, () => {
      const found = languages.find((l) => l.name === name);
      expect(found).toBeDefined();
    });
  }
});

describe("LanguageDescription.matchFilename", () => {
  it("matches .js to JavaScript", () => {
    const match = LanguageDescription.matchFilename(languages, "app.js");
    expect(match).toBeDefined();
    expect(match!.name).toBe("JavaScript");
  });

  it("matches .py to Python", () => {
    const match = LanguageDescription.matchFilename(languages, "script.py");
    expect(match).toBeDefined();
    expect(match!.name).toBe("Python");
  });

  it("returns null for unknown extensions", () => {
    const match = LanguageDescription.matchFilename(languages, "file.zzzzz");
    expect(match).toBeNull();
  });
});

describe("LanguageDescription.matchLanguageName", () => {
  it("matches exact name", () => {
    const match = LanguageDescription.matchLanguageName(languages, "JavaScript");
    expect(match).toBeDefined();
    expect(match!.name).toBe("JavaScript");
  });

  it("matches alias", () => {
    const match = LanguageDescription.matchLanguageName(languages, "ts");
    expect(match).toBeDefined();
    expect(match!.name).toBe("TypeScript");
  });
});
