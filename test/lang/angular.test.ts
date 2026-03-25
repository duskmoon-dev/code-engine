import { describe, it, expect } from "bun:test";
import { angular, angularLanguage } from "../../src/lang/angular/index";
import { html } from "../../src/lang/html/index";
import { EditorState } from "../../src/core/state/index";
import { LanguageSupport, syntaxTree } from "../../src/core/language/index";

describe("Angular language pack", () => {
  describe("exports", () => {
    it("exports angular function", () => {
      expect(typeof angular).toBe("function");
    });

    it("exports angularLanguage as an LRLanguage", () => {
      expect(angularLanguage).toBeDefined();
      expect(typeof angularLanguage.parser).toBe("object");
    });

    it("angularLanguage has correct name", () => {
      expect(angularLanguage.name).toBe("angular");
    });
  });

  describe("angular() factory", () => {
    it("creates a LanguageSupport instance with no arguments", () => {
      const support = angular();
      expect(support).toBeInstanceOf(LanguageSupport);
    });

    it("returns LanguageSupport whose language is angularLanguage", () => {
      const support = angular();
      expect(support.language).toBe(angularLanguage);
    });

    it("creates language support with explicit empty config", () => {
      const support = angular({});
      expect(support).toBeInstanceOf(LanguageSupport);
      expect(support.language).toBe(angularLanguage);
    });

    it("creates language support with an html base", () => {
      const base = html();
      const support = angular({ base });
      expect(support).toBeInstanceOf(LanguageSupport);
      expect(support.language).toBeDefined();
    });

    it("creates language support with html base that has options", () => {
      const base = html({ matchClosingTags: false, selfClosingTags: true });
      const support = angular({ base });
      expect(support).toBeInstanceOf(LanguageSupport);
    });
  });

  describe("EditorState integration", () => {
    it("can be used as an EditorState extension", () => {
      const support = angular();
      const state = EditorState.create({
        doc: "<div>{{ title }}</div>",
        extensions: [support],
      });
      expect(state).toBeDefined();
      expect(state.doc.toString()).toContain("{{ title }}");
    });

    it("EditorState language data resolves correctly", () => {
      const support = angular();
      const state = EditorState.create({
        doc: "<p>{{ name }}</p>",
        extensions: [support],
      });
      const lang = state.facet(support.language.data);
      expect(lang).toBeDefined();
    });

    it("works with html base in EditorState", () => {
      const base = html();
      const support = angular({ base });
      const state = EditorState.create({
        doc: "<div *ngIf=\"show\">{{ message }}</div>",
        extensions: [support],
      });
      expect(state).toBeDefined();
    });

    it("empty document is valid", () => {
      const support = angular();
      const state = EditorState.create({
        doc: "",
        extensions: [support],
      });
      expect(state.doc.length).toBe(0);
    });

    it("parses structural directives without error", () => {
      const support = angular();
      const state = EditorState.create({
        doc: "<ul>\n  <li *ngFor=\"let item of items\">{{ item.name }}</li>\n</ul>",
        extensions: [support],
      });
      expect(state).toBeDefined();
    });

    it("parses property binding without error", () => {
      const support = angular();
      const state = EditorState.create({
        doc: "<input [value]=\"username\" (input)=\"onInput($event)\">",
        extensions: [support],
      });
      expect(state).toBeDefined();
    });

    it("parses two-way binding without error", () => {
      const support = angular();
      const state = EditorState.create({
        doc: "<input [(ngModel)]=\"email\">",
        extensions: [support],
      });
      expect(state).toBeDefined();
    });

    it("parses pipe expressions without error", () => {
      const support = angular();
      const state = EditorState.create({
        doc: "<p>{{ date | date:'short' }}</p>",
        extensions: [support],
      });
      expect(state).toBeDefined();
    });

    it("angularLanguage parser produces a non-empty tree", () => {
      const tree = angularLanguage.parser.parse("<div *ngFor=\"let item of items\">{{ item }}</div>");
      expect(tree.length).toBeGreaterThan(0);
    });

    it("angularLanguage parser tree has a top-level type", () => {
      const tree = angularLanguage.parser.parse("<app-root [title]=\"title\"></app-root>");
      expect(tree.type.isTop).toBe(true);
    });

    it("syntaxTree from EditorState with angular() is non-empty", () => {
      const state = EditorState.create({
        doc: "<button (click)=\"onClick()\">Click me</button>",
        extensions: [angular()],
      });
      const tree = syntaxTree(state);
      expect(tree.length).toBeGreaterThan(0);
    });
  });
});
