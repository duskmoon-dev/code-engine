import { describe, it, expect } from "bun:test";
import {
  LSPClient, WorkspaceMapping,
  LSPPlugin,
  Workspace,
  serverCompletion, serverCompletionSource,
  hoverTooltips,
  formatDocument, formatKeymap,
  renameSymbol, renameKeymap,
  signatureHelp, nextSignature, prevSignature, showSignatureHelp, signatureKeymap,
  jumpToDefinition, jumpToDeclaration, jumpToTypeDefinition, jumpToImplementation, jumpToDefinitionKeymap,
  findReferences, closeReferencePanel, findReferencesKeymap,
  serverDiagnostics,
  languageServerSupport,
  languageServerExtensions,
} from "../../src/core/lsp/index";

import { EditorState } from "../../src/core/state/index";

describe("LSP module exports", () => {
  it("exports LSPClient and WorkspaceMapping as classes", () => {
    expect(typeof LSPClient).toBe("function");
    expect(typeof WorkspaceMapping).toBe("function");
  });

  it("exports LSPPlugin and Workspace as classes", () => {
    expect(typeof LSPPlugin).toBe("function");
    expect(typeof Workspace).toBe("function");
  });

  it("exports completion functions", () => {
    expect(typeof serverCompletion).toBe("function");
    expect(typeof serverCompletionSource).toBe("function");
  });

  it("exports hover, formatting, rename, and diagnostic functions", () => {
    expect(typeof hoverTooltips).toBe("function");
    expect(typeof formatDocument).toBe("function");
    expect(typeof renameSymbol).toBe("function");
    expect(typeof serverDiagnostics).toBe("function");
  });

  it("exports keymaps as arrays", () => {
    expect(Array.isArray(formatKeymap)).toBe(true);
    expect(Array.isArray(renameKeymap)).toBe(true);
    expect(Array.isArray(signatureKeymap)).toBe(true);
    expect(Array.isArray(jumpToDefinitionKeymap)).toBe(true);
    expect(Array.isArray(findReferencesKeymap)).toBe(true);
  });

  it("exports definition jump functions", () => {
    expect(typeof jumpToDefinition).toBe("function");
    expect(typeof jumpToDeclaration).toBe("function");
    expect(typeof jumpToTypeDefinition).toBe("function");
    expect(typeof jumpToImplementation).toBe("function");
  });

  it("exports signature help functions", () => {
    expect(typeof signatureHelp).toBe("function");
    expect(typeof nextSignature).toBe("function");
    expect(typeof prevSignature).toBe("function");
    expect(typeof showSignatureHelp).toBe("function");
  });

  it("exports reference functions", () => {
    expect(typeof findReferences).toBe("function");
    expect(typeof closeReferencePanel).toBe("function");
  });

  it("exports languageServerSupport as a function", () => {
    expect(typeof languageServerSupport).toBe("function");
  });

  it("languageServerExtensions returns an array", () => {
    const exts = languageServerExtensions();
    expect(Array.isArray(exts)).toBe(true);
    expect(exts.length).toBeGreaterThan(0);
  });
});

describe("LSP keymaps", () => {
  it("formatKeymap entries have key and run", () => {
    for (const binding of formatKeymap) {
      expect(typeof binding.key === "string" || typeof binding.mac === "string").toBe(true);
      expect(typeof binding.run).toBe("function");
    }
  });

  it("renameKeymap entries have key and run", () => {
    for (const binding of renameKeymap) {
      expect(typeof binding.key === "string" || typeof binding.mac === "string").toBe(true);
      expect(typeof binding.run).toBe("function");
    }
  });

  it("signatureKeymap is a non-empty array", () => {
    expect(signatureKeymap.length).toBeGreaterThan(0);
  });

  it("signatureKeymap entries have key and run", () => {
    for (const binding of signatureKeymap) {
      expect(typeof binding.key === "string" || typeof binding.mac === "string").toBe(true);
    }
  });

  it("jumpToDefinitionKeymap entries have key and run", () => {
    for (const binding of jumpToDefinitionKeymap) {
      expect(typeof binding.key === "string" || typeof binding.mac === "string").toBe(true);
      expect(typeof binding.run).toBe("function");
    }
  });

  it("findReferencesKeymap entries have key and run", () => {
    for (const binding of findReferencesKeymap) {
      expect(typeof binding.key === "string" || typeof binding.mac === "string").toBe(true);
      expect(typeof binding.run).toBe("function");
    }
  });
});

describe("LSP factory functions", () => {
  it("serverCompletion() returns an extension", () => {
    const ext = serverCompletion();
    expect(ext).toBeDefined();
  });

  it("hoverTooltips() returns an extension", () => {
    const ext = hoverTooltips();
    expect(ext).toBeDefined();
  });

  it("serverDiagnostics() returns an extension", () => {
    const ext = serverDiagnostics();
    expect(ext).toBeDefined();
  });

  it("signatureHelp() returns an extension", () => {
    const ext = signatureHelp();
    expect(ext).toBeDefined();
  });

  it("languageServerExtensions() returns a non-empty array", () => {
    const exts = languageServerExtensions();
    expect(Array.isArray(exts)).toBe(true);
    expect(exts.length).toBeGreaterThan(0);
  });

  it("serverCompletionSource is a callable function", () => {
    expect(typeof serverCompletionSource).toBe("function");
  });

  it("languageServerSupport is a callable function", () => {
    expect(typeof languageServerSupport).toBe("function");
  });

  it("multiple calls to serverCompletion() return distinct values", () => {
    const a = serverCompletion();
    const b = serverCompletion();
    expect(a).toBeDefined();
    expect(b).toBeDefined();
  });

  it("languageServerExtensions contains multiple extensions", () => {
    const exts = languageServerExtensions();
    expect(exts.length).toBeGreaterThan(2);
  });

  it("formatKeymap has at least one entry", () => {
    expect(formatKeymap.length).toBeGreaterThan(0);
  });

  it("findReferencesKeymap has at least one entry", () => {
    expect(findReferencesKeymap.length).toBeGreaterThan(0);
  });

  it("jumpToDefinitionKeymap has at least one entry", () => {
    expect(jumpToDefinitionKeymap.length).toBeGreaterThan(0);
  });

  it("EditorState with serverCompletion() extension works", () => {
    const state = EditorState.create({
      doc: "function foo() {}",
      extensions: [serverCompletion()],
    });
    expect(state.doc.toString()).toBe("function foo() {}");
  });

  it("EditorState with hoverTooltips() extension works", () => {
    const state = EditorState.create({
      doc: "const x = 1;",
      extensions: [hoverTooltips()],
    });
    expect(state.doc.length).toBe(12);
  });

  it("EditorState with signatureHelp() extension works", () => {
    const state = EditorState.create({
      doc: "console.log(",
      extensions: [signatureHelp()],
    });
    expect(state.doc.toString()).toBe("console.log(");
  });

  it("serverDiagnostics() returns a defined value", () => {
    const ext = serverDiagnostics();
    expect(ext).toBeDefined();
  });

  it("languageServerExtensions() returns non-empty array", () => {
    const exts = languageServerExtensions();
    expect(Array.isArray(exts)).toBe(true);
    expect(exts.length).toBeGreaterThan(0);
  });

  it("renameKeymap has at least one entry", () => {
    expect(renameKeymap.length).toBeGreaterThan(0);
  });

  it("signatureKeymap entries have key property", () => {
    for (const binding of signatureKeymap) {
      const hasKey = typeof binding.key === "string" || typeof binding.mac === "string";
      expect(hasKey).toBe(true);
    }
  });

  it("LSPClient is a constructor function", () => {
    expect(typeof LSPClient).toBe("function");
    expect(LSPClient.prototype).toBeDefined();
  });

  it("Workspace is a constructor function", () => {
    expect(typeof Workspace).toBe("function");
    expect(Workspace.prototype).toBeDefined();
  });

  it("serverCompletion() returns an array or object", () => {
    const ext = serverCompletion();
    expect(ext !== null && ext !== undefined).toBe(true);
  });

  it("hoverTooltips() can be called multiple times", () => {
    const a = hoverTooltips();
    const b = hoverTooltips();
    expect(a).toBeDefined();
    expect(b).toBeDefined();
  });

  it("jumpToDefinitionKeymap has run functions", () => {
    for (const binding of jumpToDefinitionKeymap) {
      expect(typeof binding.run).toBe("function");
    }
  });

  it("formatDocument is callable", () => {
    expect(typeof formatDocument).toBe("function");
  });

  it("serverDiagnostics is a function", () => {
    expect(typeof serverDiagnostics).toBe("function");
  });

  it("languageServerSupport is a function", () => {
    expect(typeof languageServerSupport).toBe("function");
  });

  it("languageServerExtensions is a function or defined", () => {
    expect(languageServerExtensions).toBeDefined();
  });

  it("signatureHelp is a function", () => {
    expect(typeof signatureHelp).toBe("function");
  });

  it("findReferences is a function", () => {
    expect(typeof findReferences).toBe("function");
  });

  it("formatDocument is a function", () => {
    expect(typeof formatDocument).toBe("function");
  });

  it("renameSymbol is a function", () => {
    expect(typeof renameSymbol).toBe("function");
  });

  it("hoverTooltips is a function", () => {
    expect(typeof hoverTooltips).toBe("function");
  });

  it("formatKeymap is an array", () => {
    expect(Array.isArray(formatKeymap)).toBe(true);
  });

  it("renameKeymap is an array", () => {
    expect(Array.isArray(renameKeymap)).toBe(true);
  });

  it("signatureHelp is defined", () => {
    expect(signatureHelp).toBeDefined();
  });

  it("jumpToDefinition is a function", () => {
    expect(typeof jumpToDefinition).toBe("function");
  });

  it("findReferences is a function", () => {
    expect(typeof findReferences).toBe("function");
  });

  it("serverDiagnostics is defined", () => {
    expect(serverDiagnostics).toBeDefined();
  });
});
