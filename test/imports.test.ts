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

  it("imports from core/merge", async () => {
    const mod = await import("../src/core/merge/index");
    expect(mod.MergeView).toBeDefined();
  });

  it("imports from core/lsp", async () => {
    const mod = await import("../src/core/lsp/index");
    expect(Object.keys(mod).length).toBeGreaterThan(0);
  });

  it("imports from core/language-data", async () => {
    const mod = await import("../src/core/language-data/index");
    expect(Object.keys(mod).length).toBeGreaterThan(0);
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

  it("imports from lang/html", async () => {
    const mod = await import("../src/lang/html/index");
    expect(mod.html).toBeDefined();
    expect(mod.htmlLanguage).toBeDefined();
  });

  it("imports from lang/css", async () => {
    const mod = await import("../src/lang/css/index");
    expect(mod.css).toBeDefined();
    expect(mod.cssLanguage).toBeDefined();
  });

  it("imports from lang/json", async () => {
    const mod = await import("../src/lang/json/index");
    expect(mod.json).toBeDefined();
    expect(mod.jsonLanguage).toBeDefined();
  });

  it("imports from lang/markdown", async () => {
    const mod = await import("../src/lang/markdown/index");
    expect(mod.markdown).toBeDefined();
    expect(mod.markdownLanguage).toBeDefined();
  });

  it("imports from lang/xml", async () => {
    const mod = await import("../src/lang/xml/index");
    expect(mod.xml).toBeDefined();
    expect(mod.xmlLanguage).toBeDefined();
  });

  it("imports from lang/sql", async () => {
    const mod = await import("../src/lang/sql/index");
    expect(mod.sql).toBeDefined();
    expect(mod.StandardSQL).toBeDefined();
  });

  it("imports from lang/rust", async () => {
    const mod = await import("../src/lang/rust/index");
    expect(mod.rust).toBeDefined();
    expect(mod.rustLanguage).toBeDefined();
  });

  it("imports from lang/go", async () => {
    const mod = await import("../src/lang/go/index");
    expect(mod.go).toBeDefined();
    expect(mod.goLanguage).toBeDefined();
  });

  it("imports from lang/java", async () => {
    const mod = await import("../src/lang/java/index");
    expect(mod.java).toBeDefined();
    expect(mod.javaLanguage).toBeDefined();
  });

  it("imports from lang/cpp", async () => {
    const mod = await import("../src/lang/cpp/index");
    expect(mod.cpp).toBeDefined();
    expect(mod.cppLanguage).toBeDefined();
  });

  it("imports from lang/php", async () => {
    const mod = await import("../src/lang/php/index");
    expect(mod.php).toBeDefined();
    expect(mod.phpLanguage).toBeDefined();
  });

  it("imports from lang/sass", async () => {
    const mod = await import("../src/lang/sass/index");
    expect(mod.sass).toBeDefined();
  });

  it("imports from lang/less", async () => {
    const mod = await import("../src/lang/less/index");
    expect(mod.less).toBeDefined();
  });

  it("imports from lang/yaml", async () => {
    const mod = await import("../src/lang/yaml/index");
    expect(mod.yaml).toBeDefined();
    expect(mod.yamlLanguage).toBeDefined();
  });

  it("imports from lang/angular", async () => {
    const mod = await import("../src/lang/angular/index");
    expect(mod.angular).toBeDefined();
  });

  it("imports from lang/vue", async () => {
    const mod = await import("../src/lang/vue/index");
    expect(mod.vue).toBeDefined();
  });

  it("imports from lang/liquid", async () => {
    const mod = await import("../src/lang/liquid/index");
    expect(mod.liquid).toBeDefined();
  });

  it("imports from lang/wast", async () => {
    const mod = await import("../src/lang/wast/index");
    expect(mod.wast).toBeDefined();
  });

  it("imports from lang/jinja", async () => {
    const mod = await import("../src/lang/jinja/index");
    expect(mod.jinja).toBeDefined();
  });

  it("imports from lang/lezer", async () => {
    const mod = await import("../src/lang/lezer/index");
    expect(mod.lezer).toBeDefined();
  });

  it("imports from theme/one-dark", async () => {
    const mod = await import("../src/theme/one-dark");
    expect(mod.oneDark).toBeDefined();
    expect(mod.oneDarkTheme).toBeDefined();
    expect(mod.oneDarkHighlightStyle).toBeDefined();
  });

  it("imports from theme/duskmoon", async () => {
    const mod = await import("../src/theme/duskmoon");
    expect(mod.duskMoon).toBeDefined();
    expect(mod.duskMoonTheme).toBeDefined();
    expect(mod.duskMoonHighlightStyle).toBeDefined();
  });

  it("imports from keymaps/vim", async () => {
    const mod = await import("../src/keymaps/vim/index");
    expect(mod.vim).toBeDefined();
  });

  it("imports from keymaps/emacs", async () => {
    const mod = await import("../src/keymaps/emacs/index");
    expect(mod.emacs).toBeDefined();
  });

  it("imports from setup", async () => {
    const mod = await import("../src/setup");
    expect(mod.basicSetup).toBeDefined();
    expect(mod.minimalSetup).toBeDefined();
  });

  it("imports from root barrel (src/index.ts)", async () => {
    const mod = await import("../src/index");
    // Root barrel re-exports core modules
    expect(mod.EditorState).toBeDefined();
    expect(mod.EditorView).toBeDefined();
    expect(mod.LRLanguage).toBeDefined();
    expect(mod.defaultKeymap).toBeDefined();
  });

  it("imports from core/view", async () => {
    const mod = await import("../src/core/view/index");
    expect(mod.EditorView).toBeDefined();
  });

  it("imports from lang/legacy barrel", async () => {
    const mod = await import("../src/lang/legacy/index");
    expect(Object.keys(mod).length).toBeGreaterThan(0);
  });

  it("core/state exports Compartment", async () => {
    const mod = await import("../src/core/state/index");
    expect(mod.Compartment).toBeDefined();
  });

  it("core/state exports EditorSelection", async () => {
    const mod = await import("../src/core/state/index");
    expect(mod.EditorSelection).toBeDefined();
  });

  it("core/state exports ChangeSet", async () => {
    const mod = await import("../src/core/state/index");
    expect(mod.ChangeSet).toBeDefined();
  });

  it("core/language exports syntaxTree function", async () => {
    const mod = await import("../src/core/language/index");
    expect(typeof mod.syntaxTree).toBe("function");
  });

  it("parser/common exports NodeProp", async () => {
    const mod = await import("../src/parser/common/index");
    expect(mod.NodeProp).toBeDefined();
  });

  it("parser/highlight exports tags object", async () => {
    const mod = await import("../src/parser/highlight/index");
    expect(typeof mod.tags).toBe("object");
    expect(mod.tags).not.toBeNull();
  });

  it("imports from lang/lezer have expected exports", async () => {
    const mod = await import("../src/lang/lezer/index");
    expect(mod.lezerLanguage).toBeDefined();
  });
});
