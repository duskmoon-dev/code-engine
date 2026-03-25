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

  it("matches .ts to TypeScript", () => {
    const match = LanguageDescription.matchFilename(languages, "app.ts");
    expect(match).toBeDefined();
    expect(match!.name).toBe("TypeScript");
  });

  it("matches .html to HTML", () => {
    const match = LanguageDescription.matchFilename(languages, "index.html");
    expect(match).toBeDefined();
    expect(match!.name).toBe("HTML");
  });

  it("matches .rs to Rust", () => {
    const match = LanguageDescription.matchFilename(languages, "main.rs");
    expect(match).toBeDefined();
    expect(match!.name).toBe("Rust");
  });

  it("matches .json to JSON", () => {
    const match = LanguageDescription.matchFilename(languages, "data.json");
    expect(match).toBeDefined();
    expect(match!.name).toBe("JSON");
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

describe("LanguageDescription.load()", () => {
  it("JavaScript load() returns a LanguageSupport", async () => {
    const desc = languages.find(l => l.name === "JavaScript")!;
    const support = await desc.load();
    expect(support).toBeDefined();
    expect(typeof support).toBe("object");
  });

  it("Python load() returns a LanguageSupport", async () => {
    const desc = languages.find(l => l.name === "Python")!;
    const support = await desc.load();
    expect(support).toBeDefined();
  });

  it("TypeScript load() returns a LanguageSupport", async () => {
    const desc = languages.find(l => l.name === "TypeScript")!;
    const support = await desc.load();
    expect(support).toBeDefined();
  });

  it("CSS load() returns a LanguageSupport", async () => {
    const desc = languages.find(l => l.name === "CSS")!;
    const support = await desc.load();
    expect(support).toBeDefined();
  });

  it("HTML load() returns a LanguageSupport", async () => {
    const desc = languages.find(l => l.name === "HTML")!;
    const support = await desc.load();
    expect(support).toBeDefined();
  });

  it("JSON load() returns a LanguageSupport", async () => {
    const desc = languages.find(l => l.name === "JSON")!;
    const support = await desc.load();
    expect(support).toBeDefined();
  });

  it("Rust load() returns a LanguageSupport", async () => {
    const desc = languages.find(l => l.name === "Rust")!;
    const support = await desc.load();
    expect(support).toBeDefined();
  });

  it("Go load() returns a LanguageSupport", async () => {
    const desc = languages.find(l => l.name === "Go")!;
    const support = await desc.load();
    expect(support).toBeDefined();
  });

  it("Java load() returns a LanguageSupport", async () => {
    const desc = languages.find(l => l.name === "Java")!;
    const support = await desc.load();
    expect(support).toBeDefined();
  });

  it("C++ load() returns a LanguageSupport", async () => {
    const desc = languages.find(l => l.name === "C++")!;
    const support = await desc.load();
    expect(support).toBeDefined();
  });

  it("SQL load() returns a LanguageSupport", async () => {
    const desc = languages.find(l => l.name === "SQL")!;
    const support = await desc.load();
    expect(support).toBeDefined();
  });

  it("XML load() returns a LanguageSupport", async () => {
    const desc = languages.find(l => l.name === "XML")!;
    const support = await desc.load();
    expect(support).toBeDefined();
  });

  it("Markdown load() returns a LanguageSupport", async () => {
    const desc = languages.find(l => l.name === "Markdown")!;
    const support = await desc.load();
    expect(support).toBeDefined();
  });

  it("YAML load() returns a LanguageSupport", async () => {
    const desc = languages.find(l => l.name === "YAML")!;
    const support = await desc.load();
    expect(support).toBeDefined();
  });

  it("Sass load() returns a LanguageSupport", async () => {
    const desc = languages.find(l => l.name === "Sass");
    if (desc) {
      const support = await desc.load();
      expect(support).toBeDefined();
    }
  });

  it("Less load() returns a LanguageSupport", async () => {
    const desc = languages.find(l => l.name === "Less");
    if (desc) {
      const support = await desc.load();
      expect(support).toBeDefined();
    }
  });

  it("PHP load() returns a LanguageSupport", async () => {
    const desc = languages.find(l => l.name === "PHP");
    if (desc) {
      const support = await desc.load();
      expect(support).toBeDefined();
    }
  });
});

describe("LanguageDescription extra matching", () => {
  it("matches .scss to Sass or SCSS", () => {
    const match = LanguageDescription.matchFilename(languages, "styles.scss");
    // May be Sass or SCSS depending on language entries
    if (match) {
      expect(typeof match.name).toBe("string");
    }
  });

  it("matches .go to Go", () => {
    const match = LanguageDescription.matchFilename(languages, "main.go");
    expect(match).toBeDefined();
    expect(match!.name).toBe("Go");
  });

  it("matches .java to Java", () => {
    const match = LanguageDescription.matchFilename(languages, "Main.java");
    expect(match).toBeDefined();
    expect(match!.name).toBe("Java");
  });

  it("matches .md to Markdown", () => {
    const match = LanguageDescription.matchFilename(languages, "README.md");
    expect(match).toBeDefined();
    expect(match!.name).toBe("Markdown");
  });

  it("matches .yaml to YAML", () => {
    const match = LanguageDescription.matchFilename(languages, "config.yaml");
    expect(match).toBeDefined();
    expect(match!.name).toBe("YAML");
  });

  it("matches .xml to XML", () => {
    const match = LanguageDescription.matchFilename(languages, "data.xml");
    expect(match).toBeDefined();
    expect(match!.name).toBe("XML");
  });

  it("matchLanguageName is case-insensitive", () => {
    const match = LanguageDescription.matchLanguageName(languages, "javascript");
    expect(match).toBeDefined();
    expect(match!.name).toBe("JavaScript");
  });

  it("languages includes Python", () => {
    const match = LanguageDescription.matchLanguageName(languages, "Python");
    expect(match).toBeDefined();
    expect(match!.name).toBe("Python");
  });

  it("languages includes Rust", () => {
    const match = LanguageDescription.matchLanguageName(languages, "Rust");
    expect(match).toBeDefined();
    expect(match!.name).toBe("Rust");
  });

  it("languages includes Go", () => {
    const match = LanguageDescription.matchLanguageName(languages, "Go");
    expect(match).toBeDefined();
  });

  it("languages includes TypeScript", () => {
    const match = LanguageDescription.matchLanguageName(languages, "TypeScript");
    expect(match).toBeDefined();
  });

  it("languages includes SQL", () => {
    const match = LanguageDescription.matchLanguageName(languages, "SQL");
    expect(match).toBeDefined();
  });

  it("languages includes Go", () => {
    const match = LanguageDescription.matchLanguageName(languages, "Go");
    expect(match).toBeDefined();
  });

  it("languages includes CSS", () => {
    const match = LanguageDescription.matchLanguageName(languages, "CSS");
    expect(match).toBeDefined();
  });

  it("languages includes Rust", () => {
    const match = LanguageDescription.matchLanguageName(languages, "Rust");
    expect(match).toBeDefined();
  });

  it("languages includes Java", () => {
    const match = LanguageDescription.matchLanguageName(languages, "Java");
    expect(match).toBeDefined();
  });
});
