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
