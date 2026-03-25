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

    it("angular parse tree cursor traversal works", () => {
      const tree = angularLanguage.parser.parse("<div *ngIf=\"show\">{{ title }}</div>");
      const cursor = tree.cursor();
      let nodeCount = 0;
      do { nodeCount++; } while (cursor.next() && nodeCount < 100);
      expect(nodeCount).toBeGreaterThan(1);
    });

    it("tree.resolve() finds nodes at multiple positions in Angular template", () => {
      const code = "<div [class.active]=\"isActive\" (click)=\"toggle()\">{{ label }}</div>";
      const tree = angularLanguage.parser.parse(code);
      for (let i = 0; i < code.length; i += 8) {
        const node = tree.resolve(i);
        expect(node).toBeDefined();
      }
    });

    it("angularLanguage can parse ng-container with ngSwitch", () => {
      const tree = angularLanguage.parser.parse("<ng-container [ngSwitch]=\"role\"><span *ngSwitchCase=\"'admin'\">Admin</span><span *ngSwitchDefault>User</span></ng-container>");
      expect(tree.length).toBeGreaterThan(0);
    });

    it("angularLanguage can parse ng-template", () => {
      const tree = angularLanguage.parser.parse("<ng-template #loading><p>Loading...</p></ng-template>");
      expect(tree.length).toBeGreaterThan(0);
      expect(tree.type.isTop).toBe(true);
    });

    it("angularLanguage can parse attribute binding with class and style", () => {
      const tree = angularLanguage.parser.parse("<div [class]=\"myClasses\" [style.color]=\"color\" [style.fontSize.px]=\"size\">text</div>");
      expect(tree.length).toBeGreaterThan(0);
    });

    it("angularLanguage can parse event binding with $event", () => {
      const tree = angularLanguage.parser.parse("<input (input)=\"onChange($event.target.value)\" (blur)=\"onBlur()\">");
      expect(tree.length).toBeGreaterThan(0);
    });

    it("angularLanguage can parse router-outlet", () => {
      const tree = angularLanguage.parser.parse("<router-outlet></router-outlet>");
      expect(tree.length).toBeGreaterThan(0);
      expect(tree.type.isTop).toBe(true);
    });

    it("angularLanguage can parse async pipe", () => {
      const tree = angularLanguage.parser.parse("<div>{{ data$ | async }}</div>");
      expect(tree.length).toBeGreaterThan(0);
    });

    it("angularLanguage can parse template reference variable", () => {
      const tree = angularLanguage.parser.parse("<input #nameInput type=\"text\"><button (click)=\"greet(nameInput.value)\">Greet</button>");
      expect(tree.length).toBeGreaterThan(0);
    });

    it("angularLanguage can parse content projection with ng-content", () => {
      const tree = angularLanguage.parser.parse("<ng-content select=\"[header]\"></ng-content><ng-content></ng-content>");
      expect(tree.length).toBeGreaterThan(0);
      expect(tree.type.isTop).toBe(true);
    });

    it("angularLanguage can parse @for control flow", () => {
      const tree = angularLanguage.parser.parse("<div>@for (item of items; track item.id) { <span>{{ item.name }}</span> }</div>");
      expect(tree.length).toBeGreaterThan(0);
    });

    it("angularLanguage can parse @if control flow", () => {
      const tree = angularLanguage.parser.parse("<div>@if (show) { <p>Shown</p> } @else { <p>Hidden</p> }</div>");
      expect(tree.length).toBeGreaterThan(0);
    });

    it("angularLanguage can parse @switch control flow", () => {
      const tree = angularLanguage.parser.parse("<div>@switch (status) { @case ('active') { <span>Active</span> } @default { <span>Unknown</span> } }</div>");
      expect(tree.length).toBeGreaterThan(0);
      expect(tree.type.isTop).toBe(true);
    });

    it("angularLanguage can parse ng-template", () => {
      const tree = angularLanguage.parser.parse("<ng-template #loading><div class=\"spinner\">Loading...</div></ng-template>");
      expect(tree.length).toBeGreaterThan(0);
    });

    it("angularLanguage can parse two-way binding", () => {
      const tree = angularLanguage.parser.parse("<input [(ngModel)]=\"value\" (ngModelChange)=\"onChange($event)\"/>");
      expect(tree.length).toBeGreaterThan(0);
      expect(tree.type.isTop).toBe(true);
    });

    it("angularLanguage can parse structural directive with let", () => {
      const tree = angularLanguage.parser.parse("<ng-container *ngFor=\"let item of items; let i = index\">{{ i }}: {{ item }}</ng-container>");
      expect(tree.length).toBeGreaterThan(0);
    });

    it("angularLanguage tree.toString() returns non-empty string", () => {
      const tree = angularLanguage.parser.parse("<div class=\"app\">{{ title }}</div>");
      expect(typeof tree.toString()).toBe("string");
      expect(tree.toString().length).toBeGreaterThan(0);
    });

    it("tree.resolveInner() finds innermost node in Angular template", () => {
      const tree = angularLanguage.parser.parse("<div>{{ message }}</div>");
      const node = tree.resolveInner(5);
      expect(node).toBeDefined();
      expect(node.from).toBeLessThanOrEqual(5);
      expect(node.to).toBeGreaterThanOrEqual(5);
    });

    it("angularLanguage can parse multiple bindings on one element", () => {
      const tree = angularLanguage.parser.parse("<div [class.active]=\"isActive\" [style.color]=\"color\" (click)=\"toggle()\" [attr.aria-label]=\"label\">content</div>");
      expect(tree.length).toBeGreaterThan(0);
      expect(tree.type.isTop).toBe(true);
    });

    it("EditorState with angular() has correct doc line count", () => {
      const state = EditorState.create({
        doc: "<div>\n  <span>{{ title }}</span>\n  <p>{{ body }}</p>\n</div>",
        extensions: [angular()],
      });
      expect(state.doc.lines).toBe(4);
    });

    it("angular() state doc line text is accessible", () => {
      const state = EditorState.create({
        doc: "<app-root></app-root>\n<router-outlet></router-outlet>",
        extensions: [angular()],
      });
      expect(state.doc.line(1).text).toBe("<app-root></app-root>");
    });

    it("angular() state allows multiple sequential transactions", () => {
      let state = EditorState.create({ doc: "<div></div>", extensions: [angular()] });
      state = state.update({ changes: { from: 11, insert: "\n<span></span>" } }).state;
      state = state.update({ changes: { from: state.doc.length, insert: "\n<p></p>" } }).state;
      expect(state.doc.lines).toBe(3);
    });

    it("angular() extension preserves doc length invariant", () => {
      const doc = "<app-root></app-root>";
      const state = EditorState.create({ doc, extensions: [angular()] });
      expect(state.doc.length).toBe(doc.length);
    });
  });
});
