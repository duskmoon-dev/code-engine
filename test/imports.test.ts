import { describe, it, expect } from "bun:test";

describe("Import verification", () => {
  it("imports from core/state", async () => {
    const mod = await import("../src/core/state/index");
    expect(mod.EditorState).toBeDefined();
    expect(mod.Text).toBeDefined();
    expect(mod.Facet).toBeDefined();
    expect(mod.StateField).toBeDefined();
    expect(mod.StateEffect).toBeDefined();
  });

  it("imports from core/language", async () => {
    const mod = await import("../src/core/language/index");
    expect(mod.LRLanguage).toBeDefined();
    expect(mod.LanguageSupport).toBeDefined();
    expect(mod.syntaxHighlighting).toBeDefined();
  });

  it("imports from core/commands", async () => {
    const mod = await import("../src/core/commands/index");
    expect(mod.defaultKeymap).toBeDefined();
  });

  it("imports from parser/common", async () => {
    const mod = await import("../src/parser/common/index");
    expect(mod.Tree).toBeDefined();
    expect(mod.NodeType).toBeDefined();
  });

  it("imports from parser/lr", async () => {
    const mod = await import("../src/parser/lr/index");
    expect(mod.LRParser).toBeDefined();
  });

  it("imports from parser/highlight", async () => {
    const mod = await import("../src/parser/highlight/index");
    expect(mod.tags).toBeDefined();
    expect(mod.styleTags).toBeDefined();
  });

  it("imports from lang/javascript", async () => {
    const mod = await import("../src/lang/javascript/index");
    expect(mod.javascript).toBeDefined();
    expect(mod.javascriptLanguage).toBeDefined();
  });

  it("imports from lang/python", async () => {
    const mod = await import("../src/lang/python/index");
    expect(mod.python).toBeDefined();
    expect(mod.pythonLanguage).toBeDefined();
  });

  it("imports from lang/json", async () => {
    const mod = await import("../src/lang/json/index");
    expect(mod.json).toBeDefined();
    expect(mod.jsonLanguage).toBeDefined();
  });

  it("imports from lang/css", async () => {
    const mod = await import("../src/lang/css/index");
    expect(mod.css).toBeDefined();
    expect(mod.cssLanguage).toBeDefined();
  });

  it("imports from lang/html", async () => {
    const mod = await import("../src/lang/html/index");
    expect(mod.html).toBeDefined();
    expect(mod.htmlLanguage).toBeDefined();
  });

  it("imports from theme/one-dark", async () => {
    const mod = await import("../src/theme/one-dark");
    expect(mod.oneDark).toBeDefined();
    expect(mod.oneDarkTheme).toBeDefined();
    expect(mod.oneDarkHighlightStyle).toBeDefined();
  });

  it("imports from setup", async () => {
    const mod = await import("../src/setup");
    expect(mod.basicSetup).toBeDefined();
    expect(mod.minimalSetup).toBeDefined();
  });

  it("imports from core/search", async () => {
    const mod = await import("../src/core/search/index");
    expect(mod.search).toBeDefined();
    expect(mod.searchKeymap).toBeDefined();
  });

  it("imports from core/autocomplete", async () => {
    const mod = await import("../src/core/autocomplete/index");
    expect(mod.autocompletion).toBeDefined();
    expect(mod.completionKeymap).toBeDefined();
  });

  it("imports from core/lint", async () => {
    const mod = await import("../src/core/lint/index");
    expect(mod.linter).toBeDefined();
    expect(mod.lintKeymap).toBeDefined();
  });

  it("imports from core/collab", async () => {
    const mod = await import("../src/core/collab/index");
    expect(mod.collab).toBeDefined();
  });

  it("imports from theme/duskmoon", async () => {
    const mod = await import("../src/theme/duskmoon");
    expect(mod.duskMoon).toBeDefined();
    expect(mod.duskMoonTheme).toBeDefined();
    expect(mod.duskMoonHighlightStyle).toBeDefined();
  });
});
