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

    it("sassLanguage can parse media queries", () => {
      const tree = sassLanguage.parser.parse("@media (min-width: 768px) {\n  .container { max-width: 960px; }\n}");
      expect(tree.length).toBeGreaterThan(0);
    });

    it("sassLanguage can parse @mixin with arguments", () => {
      const tree = sassLanguage.parser.parse("@mixin respond-to($breakpoint) { @media (min-width: $breakpoint) { @content; } }\n.hero { @include respond-to(768px) { font-size: 2rem; } }");
      expect(tree.length).toBeGreaterThan(0);
      expect(tree.type.isTop).toBe(true);
    });

    it("sassLanguage can parse map data type", () => {
      const tree = sassLanguage.parser.parse("$colors: ('primary': blue, 'secondary': red, 'accent': green);\n$primary: map-get($colors, 'primary');");
      expect(tree.length).toBeGreaterThan(0);
    });

    it("sassLanguage can parse @debug and @warn", () => {
      const tree = sassLanguage.parser.parse("$x: 5;\n@debug \"value: #{$x}\";\n@warn \"deprecated: use new-fn() instead\";");
      expect(tree.length).toBeGreaterThan(0);
      expect(tree.type.isTop).toBe(true);
    });

    it("sassLanguage can parse pseudo-selectors and attribute selectors", () => {
      const tree = sassLanguage.parser.parse("input[type='text'] { border: 1px solid; }\na:not(.active):hover { opacity: 0.7; }");
      expect(tree.length).toBeGreaterThan(0);
    });

    it("sassLanguage tree.toString() returns non-empty string", () => {
      const tree = sassLanguage.parser.parse("$color: blue;\n.box { color: $color; }");
      expect(typeof tree.toString()).toBe("string");
      expect(tree.toString().length).toBeGreaterThan(0);
    });

    it("tree.resolveInner() finds innermost node in SCSS", () => {
      const tree = sassLanguage.parser.parse("$base: 16px;\n.box { font-size: $base; }");
      const node = tree.resolveInner(8);
      expect(node).toBeDefined();
      expect(node.from).toBeLessThanOrEqual(8);
      expect(node.to).toBeGreaterThanOrEqual(8);
    });

    it("sassLanguage can parse @use and @forward", () => {
      const tree = sassLanguage.parser.parse("@use 'sass:math';\n@use 'colors' as c;\n.box { border-radius: math.div(10px, 2); }");
      expect(tree.length).toBeGreaterThan(0);
    });

    it("sassLanguage can parse each loop", () => {
      const tree = sassLanguage.parser.parse("$list: 10px 20px 30px;\n@each $size in $list { .size-#{$size} { padding: $size; } }");
      expect(tree.length).toBeGreaterThan(0);
      expect(tree.type.isTop).toBe(true);
    });

    it("sassLanguage can parse @while loop", () => {
      const tree = sassLanguage.parser.parse("$i: 1;\n@while $i <= 3 { .col-#{$i} { width: 100% / $i; } $i: $i + 1; }");
      expect(tree.length).toBeGreaterThan(0);
    });

    it("EditorState with sass() has correct doc line count", () => {
      const state = EditorState.create({
        doc: "$color: red;\n.btn { color: $color; }\n.link { color: blue; }",
        extensions: [sass()],
      });
      expect(state.doc.lines).toBe(3);
    });

    it("sassLanguage allows doc mutation via transaction", () => {
      let state = EditorState.create({ doc: "$x: 1;", extensions: [sass()] });
      state = state.update({ changes: { from: 6, insert: "\n$y: 2;" } }).state;
      expect(state.doc.lines).toBe(2);
    });

    it("sass() extension handles replacement transaction", () => {
      let state = EditorState.create({ doc: "body { color: red; }", extensions: [sass()] });
      state = state.update({ changes: { from: 14, to: 17, insert: "blue" } }).state;
      expect(state.doc.toString()).toBe("body { color: blue; }");
    });

    it("sass() state doc line text is accessible", () => {
      const state = EditorState.create({
        doc: "$primary: blue;\n.btn { color: $primary; }",
        extensions: [sass()],
      });
      expect(state.doc.line(1).text).toBe("$primary: blue;");
    });

    it("sass() state allows multiple sequential transactions", () => {
      let state = EditorState.create({ doc: "$a: 1;", extensions: [sass()] });
      state = state.update({ changes: { from: 6, insert: "\n$b: 2;" } }).state;
      state = state.update({ changes: { from: state.doc.length, insert: "\n$c: 3;" } }).state;
      expect(state.doc.lines).toBe(3);
    });

    it("sass() extension preserves doc length invariant", () => {
      const doc = "$color: red;";
      const state = EditorState.create({ doc, extensions: [sass()] });
      expect(state.doc.length).toBe(doc.length);
    });

    it("indented sass state doc line count is correct", () => {
      const state = EditorState.create({
        doc: ".nav\n  color: red\n  &:hover\n    color: blue",
        extensions: [sass({ indented: true })],
      });
      expect(state.doc.lines).toBe(4);
    });

    it("sass() state doc line text is accessible", () => {
      const state = EditorState.create({
        doc: "$primary: red;\n$secondary: blue;",
        extensions: [sass()],
      });
      expect(state.doc.line(1).text).toBe("$primary: red;");
      expect(state.doc.line(2).text).toBe("$secondary: blue;");
    });

    it("sass() state deletion transaction works", () => {
      let state = EditorState.create({ doc: "$a: 1;\n$b: 2;\n$c: 3;", extensions: [sass()] });
      state = state.update({ changes: { from: 13, to: 20 } }).state;
      expect(state.doc.lines).toBe(2);
    });

    it("sassLanguage parser tree has correct length", () => {
      const code = ".container { display: flex; flex-wrap: wrap; }";
      const tree = sassLanguage.parser.parse(code);
      expect(tree.length).toBe(code.length);
    });

    it("sass() state with unicode content works", () => {
      const doc = "/* こんにちは */\n$color: red;";
      const state = EditorState.create({ doc, extensions: [sass()] });
      expect(state.doc.toString()).toBe(doc);
    });

    it("sass() state doc line count is correct", () => {
      const state = EditorState.create({
        doc: "$primary: blue;\n$secondary: red;\n.btn { color: $primary; }",
        extensions: [sass()],
      });
      expect(state.doc.lines).toBe(3);
    });

    it("sass() state allows multiple sequential transactions", () => {
      let state = EditorState.create({ doc: "$x: 1;", extensions: [sass()] });
      state = state.update({ changes: { from: 6, insert: "\n$y: 2;" } }).state;
      state = state.update({ changes: { from: state.doc.length, insert: "\n$z: 3;" } }).state;
      expect(state.doc.lines).toBe(3);
    });

    it("sass() state deletion transaction works", () => {
      let state = EditorState.create({ doc: "$primary: blue;\n$secondary: red;", extensions: [sass()] });
      state = state.update({ changes: { from: 15, to: 32 } }).state;
      expect(state.doc.toString()).toBe("$primary: blue;");
    });

    it("sass() state doc line text is accessible", () => {
      const state = EditorState.create({
        doc: "$font-size: 16px;\n$line-height: 1.5;",
        extensions: [sass()],
      });
      expect(state.doc.line(1).text).toBe("$font-size: 16px;");
      expect(state.doc.line(2).text).toBe("$line-height: 1.5;");
    });
  });
});
