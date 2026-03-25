import { describe, it, expect } from "bun:test";
import { sass, sassLanguage, sassCompletionSource } from "../../src/lang/sass/index";
import { EditorState } from "../../src/core/state/index";
import { LanguageSupport, syntaxTree } from "../../src/core/language/index";

describe("Sass language pack", () => {
  describe("exports", () => {
    it("exports sass function", () => {
      expect(typeof sass).toBe("function");
    });

    it("exports sassLanguage", () => {
      expect(sassLanguage).toBeDefined();
      expect(sassLanguage.name).toBe("sass");
    });

    it("exports sassCompletionSource", () => {
      expect(typeof sassCompletionSource).toBe("function");
    });
  });

  describe("sass() factory", () => {
    it("creates LanguageSupport with default options (SCSS)", () => {
      const support = sass();
      expect(support).toBeInstanceOf(LanguageSupport);
    });

    it("default mode uses sassLanguage", () => {
      const support = sass();
      expect(support.language).toBe(sassLanguage);
    });

    it("creates LanguageSupport with indented mode", () => {
      const support = sass({ indented: true });
      expect(support).toBeInstanceOf(LanguageSupport);
    });

    it("indented mode language is defined", () => {
      const support = sass({ indented: true });
      expect(support.language).toBeDefined();
    });

    it("explicit indented:false returns SCSS mode", () => {
      const support = sass({ indented: false });
      expect(support.language).toBe(sassLanguage);
    });
  });

  describe("EditorState integration", () => {
    it("scss integrates with EditorState", () => {
      const state = EditorState.create({
        doc: `.container {\n  color: red;\n  $primary: #333;\n}`,
        extensions: [sass()],
      });
      expect(state.doc.toString()).toContain("$primary");
    });

    it("indented sass integrates with EditorState", () => {
      const state = EditorState.create({
        doc: `.container\n  color: red\n  $primary: #333`,
        extensions: [sass({ indented: true })],
      });
      expect(state.doc.toString()).toContain("$primary");
    });

    it("empty document is valid", () => {
      const state = EditorState.create({
        doc: "",
        extensions: [sass()],
      });
      expect(state.doc.length).toBe(0);
    });

    it("sassLanguage parser produces a non-empty tree", () => {
      const tree = sassLanguage.parser.parse("$color: red;\n.box { background: $color; }");
      expect(tree.length).toBeGreaterThan(0);
    });

    it("sassLanguage parser tree has a top-level type", () => {
      const tree = sassLanguage.parser.parse(".nav { a { color: #333; } }");
      expect(tree.type.isTop).toBe(true);
    });

    it("syntaxTree from EditorState with sass() is non-empty", () => {
      const state = EditorState.create({
        doc: "@mixin flex { display: flex; }\n.box { @include flex; }",
        extensions: [sass()],
      });
      const tree = syntaxTree(state);
      expect(tree.length).toBeGreaterThan(0);
    });

    it("sass parse tree cursor traversal works", () => {
      const tree = sassLanguage.parser.parse("$primary: blue;\n.btn { color: $primary; }");
      const cursor = tree.cursor();
      let nodeCount = 0;
      do { nodeCount++; } while (cursor.next() && nodeCount < 100);
      expect(nodeCount).toBeGreaterThan(1);
    });

    it("sassLanguage can parse @if directive", () => {
      const tree = sassLanguage.parser.parse("@if $theme == dark { .bg { background: black; } }");
      expect(tree.length).toBeGreaterThan(0);
    });

    it("sassLanguage can parse @each loop", () => {
      const tree = sassLanguage.parser.parse("@each $color in red, green, blue { .#{$color} { color: $color; } }");
      expect(tree.length).toBeGreaterThan(0);
    });

    it("sassLanguage can parse @function", () => {
      const tree = sassLanguage.parser.parse("@function px-to-rem($px) { @return #{$px / 16}rem; }");
      expect(tree.length).toBeGreaterThan(0);
    });

    it("sassLanguage can parse placeholder selector", () => {
      const tree = sassLanguage.parser.parse("%button-style { border-radius: 4px; }\n.btn { @extend %button-style; }");
      expect(tree.length).toBeGreaterThan(0);
      expect(tree.type.isTop).toBe(true);
    });

    it("tree.resolve() finds nodes in sass code", () => {
      const code = "$base: 10px;\n.box { margin: $base * 2; }";
      const tree = sassLanguage.parser.parse(code);
      for (let i = 0; i < code.length; i += 5) {
        const node = tree.resolve(i);
        expect(node).toBeDefined();
      }
    });

    it("sassLanguage can parse @while loop", () => {
      const tree = sassLanguage.parser.parse("$i: 6;\n@while $i > 0 { .item-#{$i} { width: 2em * $i; } $i: $i - 2; }");
      expect(tree.length).toBeGreaterThan(0);
    });

    it("sassLanguage can parse @for loop", () => {
      const tree = sassLanguage.parser.parse("@for $i from 1 through 3 { .item-#{$i} { width: 2em * $i; } }");
      expect(tree.length).toBeGreaterThan(0);
      expect(tree.type.isTop).toBe(true);
    });

    it("sassLanguage can parse @use and @forward", () => {
      const tree = sassLanguage.parser.parse("@use 'sass:math';\n@forward 'colors' with ($primary: blue);");
      expect(tree.length).toBeGreaterThan(0);
    });

    it("sassLanguage can parse list operations", () => {
      const tree = sassLanguage.parser.parse("$list: a, b, c, d;\n$len: length($list);\n$second: nth($list, 2);");
      expect(tree.length).toBeGreaterThan(0);
    });

    it("sassLanguage can parse complex nesting", () => {
      const tree = sassLanguage.parser.parse(".nav {\n  &__item {\n    &--active { color: blue; }\n    &:hover { opacity: 0.8; }\n  }\n}");
      expect(tree.length).toBeGreaterThan(0);
      expect(tree.type.isTop).toBe(true);
    });
  });
});
