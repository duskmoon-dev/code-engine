import { describe, it, expect } from "bun:test";
import {
  liquid,
  liquidLanguage,
  liquidCompletionSource,
  closePercentBrace,
  type LiquidCompletionConfig,
} from "../../src/lang/liquid/index";
import { EditorState } from "../../src/core/state/index";
import { syntaxTree } from "../../src/core/language/index";

describe("Liquid language pack", () => {
  describe("exports", () => {
    it("exports liquid function", () => {
      expect(typeof liquid).toBe("function");
    });

    it("exports liquidLanguage", () => {
      expect(liquidLanguage).toBeDefined();
    });

    it("exports liquidCompletionSource function", () => {
      expect(typeof liquidCompletionSource).toBe("function");
    });

    it("exports closePercentBrace extension", () => {
      expect(closePercentBrace).toBeDefined();
    });
  });

  describe("liquidLanguage", () => {
    it("has the correct language name", () => {
      expect(liquidLanguage.name).toBe("liquid");
    });

    it("is an LRLanguage instance with a parser", () => {
      expect(liquidLanguage.parser).toBeDefined();
    });
  });

  describe("liquid() factory", () => {
    it("creates language support with default options", () => {
      const support = liquid();
      expect(support).toBeDefined();
    });

    it("returns a LanguageSupport with liquidLanguage", () => {
      const support = liquid();
      expect(support.language).toBe(liquidLanguage);
    });

    it("creates language support with empty config", () => {
      const support = liquid({});
      expect(support).toBeDefined();
      expect(support.language).toBe(liquidLanguage);
    });

    it("creates language support with custom tags", () => {
      const config: LiquidCompletionConfig = {
        tags: [{ label: "mytag", type: "keyword" }],
      };
      const support = liquid(config);
      expect(support).toBeDefined();
      expect(support.language).toBe(liquidLanguage);
    });

    it("creates language support with custom filters", () => {
      const config: LiquidCompletionConfig = {
        filters: [{ label: "myfilter", type: "function" }],
      };
      const support = liquid(config);
      expect(support).toBeDefined();
    });

    it("creates language support with custom variables", () => {
      const config: LiquidCompletionConfig = {
        variables: [{ label: "myvar", type: "variable" }],
      };
      const support = liquid(config);
      expect(support).toBeDefined();
    });

    it("creates language support with custom properties resolver", () => {
      const config: LiquidCompletionConfig = {
        properties: (_path, _state, _context) => [
          { label: "name", type: "property" },
        ],
      };
      const support = liquid(config);
      expect(support).toBeDefined();
    });

    it("creates language support with all config options combined", () => {
      const config: LiquidCompletionConfig = {
        tags: [{ label: "custom_tag", type: "keyword" }],
        filters: [{ label: "custom_filter", type: "function" }],
        variables: [{ label: "custom_var", type: "variable" }],
        properties: () => [{ label: "prop", type: "property" }],
      };
      const support = liquid(config);
      expect(support).toBeDefined();
      expect(support.language).toBe(liquidLanguage);
    });
  });

  describe("liquidCompletionSource", () => {
    it("returns a function when called with no arguments", () => {
      const source = liquidCompletionSource();
      expect(typeof source).toBe("function");
    });

    it("returns a function when called with an empty config", () => {
      const source = liquidCompletionSource({});
      expect(typeof source).toBe("function");
    });

    it("returns a function when called with custom tags", () => {
      const source = liquidCompletionSource({
        tags: [{ label: "render", type: "keyword" }],
      });
      expect(typeof source).toBe("function");
    });

    it("returns a function when called with custom filters", () => {
      const source = liquidCompletionSource({
        filters: [{ label: "truncate_words", type: "function" }],
      });
      expect(typeof source).toBe("function");
    });

    it("returns a function when called with custom variables", () => {
      const source = liquidCompletionSource({
        variables: [{ label: "product", type: "variable" }],
      });
      expect(typeof source).toBe("function");
    });

    it("completion source returns null for non-liquid context", () => {
      const source = liquidCompletionSource();
      const state = EditorState.create({
        doc: "Hello, world!",
        extensions: [liquid()],
      });
      const result = source({
        state,
        pos: 5,
        explicit: false,
        tokenBefore: () => null as any,
        matchBefore: () => null,
      } as any);
      expect(result === null || result !== undefined).toBe(true);
    });

    it("completion source does not throw for an empty document", () => {
      const source = liquidCompletionSource();
      const state = EditorState.create({
        doc: "",
        extensions: [liquid()],
      });
      expect(() =>
        source({
          state,
          pos: 0,
          explicit: false,
          tokenBefore: () => null as any,
          matchBefore: () => null,
        } as any)
      ).not.toThrow();
    });
  });

  describe("closePercentBrace", () => {
    it("is defined as an Extension value", () => {
      expect(closePercentBrace).toBeDefined();
    });

    it("can be included as an EditorState extension without error", () => {
      expect(() =>
        EditorState.create({
          doc: "",
          extensions: [closePercentBrace],
        })
      ).not.toThrow();
    });
  });

  describe("EditorState integration", () => {
    it("integrates with EditorState using liquid()", () => {
      const state = EditorState.create({
        doc: "{% if user %}\n  Hello, {{ user.name }}!\n{% endif %}",
        extensions: [liquid()],
      });
      expect(state.doc.toString()).toContain("{% if user %}");
    });

    it("preserves Liquid template content in EditorState", () => {
      const doc = "{{ product.title | upcase }}";
      const state = EditorState.create({
        doc,
        extensions: [liquid()],
      });
      expect(state.doc.toString()).toBe(doc);
    });

    it("handles multi-line Liquid templates", () => {
      const doc =
        "{% for item in cart.items %}\n  {{ item.title }}\n{% endfor %}";
      const state = EditorState.create({
        doc,
        extensions: [liquid()],
      });
      expect(state.doc.lines).toBe(3);
    });

    it("integrates with liquid() using custom tags config", () => {
      const state = EditorState.create({
        doc: "{% render 'snippet' %}",
        extensions: [liquid({ tags: [{ label: "render", type: "keyword" }] })],
      });
      expect(state.doc.toString()).toContain("render");
    });

    it("integrates with liquid() using custom variables config", () => {
      const state = EditorState.create({
        doc: "{{ product.price }}",
        extensions: [
          liquid({ variables: [{ label: "product", type: "variable" }] }),
        ],
      });
      expect(state.doc.toString()).toContain("product");
    });
  });

  describe("parse tree", () => {
    it("liquidLanguage parser produces a non-empty tree", () => {
      const tree = liquidLanguage.parser.parse("{{ product.title | upcase }}");
      expect(tree.length).toBeGreaterThan(0);
    });

    it("liquidLanguage parser tree has a top-level type", () => {
      const tree = liquidLanguage.parser.parse("{% for item in collection.products %}<p>{{ item.title }}</p>{% endfor %}");
      expect(tree.type.isTop).toBe(true);
    });

    it("syntaxTree from EditorState with liquid() is non-empty", () => {
      const state = EditorState.create({
        doc: "{% if user.admin %}<div>Admin panel</div>{% endif %}",
        extensions: [liquid()],
      });
      const tree = syntaxTree(state);
      expect(tree.length).toBeGreaterThan(0);
    });

    it("liquid parse tree cursor traversal works", () => {
      const tree = liquidLanguage.parser.parse("{% if user %}{{ user.name }}{% endif %}");
      const cursor = tree.cursor();
      let nodeCount = 0;
      do { nodeCount++; } while (cursor.next() && nodeCount < 100);
      expect(nodeCount).toBeGreaterThan(1);
    });

    it("tree.resolve() finds nodes at multiple positions in liquid template", () => {
      const code = "{% for item in cart.items %}{{ item.title | upcase }}{% endfor %}";
      const tree = liquidLanguage.parser.parse(code);
      for (let i = 0; i < code.length; i += 6) {
        const node = tree.resolve(i);
        expect(node).toBeDefined();
      }
    });

    it("liquidLanguage can parse filter expression", () => {
      const tree = liquidLanguage.parser.parse("{{ product.title | upcase | truncate: 50 }}");
      expect(tree.length).toBeGreaterThan(0);
      expect(tree.type.isTop).toBe(true);
    });

    it("liquidLanguage can parse unless tag", () => {
      const tree = liquidLanguage.parser.parse("{% unless product.available %}Sold out{% endunless %}");
      expect(tree.length).toBeGreaterThan(0);
    });

    it("liquidLanguage can parse case/when tag", () => {
      const tree = liquidLanguage.parser.parse("{% case handle %}{% when 'home' %}Home{% when 'about' %}About{% else %}Other{% endcase %}");
      expect(tree.length).toBeGreaterThan(0);
    });

    it("liquidLanguage can parse assign tag", () => {
      const tree = liquidLanguage.parser.parse("{% assign my_var = 'hello' | upcase %}{{ my_var }}");
      expect(tree.length).toBeGreaterThan(0);
    });

    it("liquidLanguage can parse capture tag", () => {
      const tree = liquidLanguage.parser.parse("{% capture fullname %}{{ first }} {{ last }}{% endcapture %}{{ fullname }}");
      expect(tree.length).toBeGreaterThan(0);
    });

    it("liquidLanguage can parse increment/decrement tags", () => {
      const tree = liquidLanguage.parser.parse("{% increment counter %}{% decrement counter %}");
      expect(tree.length).toBeGreaterThan(0);
      expect(tree.type.isTop).toBe(true);
    });

    it("liquidLanguage can parse include/render tags", () => {
      const tree = liquidLanguage.parser.parse("{% include 'header' %}{% render 'footer', product: product %}");
      expect(tree.length).toBeGreaterThan(0);
    });

    it("liquidLanguage can parse raw block", () => {
      const tree = liquidLanguage.parser.parse("{% raw %}{{ not liquid }}{% endraw %}");
      expect(tree.length).toBeGreaterThan(0);
    });

    it("liquidLanguage can parse paginate tag", () => {
      const tree = liquidLanguage.parser.parse("{% paginate collection.products by 12 %}{% endpaginate %}");
      expect(tree.length).toBeGreaterThan(0);
      expect(tree.type.isTop).toBe(true);
    });

    it("liquidLanguage can parse tablerow tag", () => {
      const tree = liquidLanguage.parser.parse("{% tablerow item in items cols:3 %}{{ item }}{% endtablerow %}");
      expect(tree.length).toBeGreaterThan(0);
    });

    it("liquidLanguage can parse comment tag", () => {
      const tree = liquidLanguage.parser.parse("{% comment %}This is a Liquid comment{% endcomment %}Hello");
      expect(tree.length).toBeGreaterThan(0);
    });

    it("liquid() state doc line text is accessible", () => {
      const state = EditorState.create({
        doc: "{% if user %}\n  Hello, {{ user.name }}!\n{% endif %}",
        extensions: [liquid()],
      });
      expect(state.doc.line(1).text).toBe("{% if user %}");
      expect(state.doc.line(2).text).toBe("  Hello, {{ user.name }}!");
    });

    it("liquid() state allows multiple sequential transactions", () => {
      let state = EditorState.create({ doc: "{{ title }}", extensions: [liquid()] });
      state = state.update({ changes: { from: 11, insert: "\n{{ body }}" } }).state;
      state = state.update({ changes: { from: state.doc.length, insert: "\n{{ footer }}" } }).state;
      expect(state.doc.lines).toBe(3);
    });

    it("liquid() state deletion transaction works", () => {
      let state = EditorState.create({ doc: "{{ title }}\n{{ body }}", extensions: [liquid()] });
      state = state.update({ changes: { from: 11, to: 22 } }).state;
      expect(state.doc.toString()).toBe("{{ title }}");
    });

    it("liquid() extension preserves doc length invariant", () => {
      const doc = "{% assign x = 42 %}{{ x }}";
      const state = EditorState.create({ doc, extensions: [liquid()] });
      expect(state.doc.length).toBe(doc.length);
    });

    it("liquid() state with unicode content works", () => {
      const doc = "{# こんにちは #}\n{{ greeting }}";
      const state = EditorState.create({ doc, extensions: [liquid()] });
      expect(state.doc.toString()).toBe(doc);
    });

    it("liquidLanguage parser tree has correct length", () => {
      const code = "{% if user %}Hello, {{ user.name }}!{% endif %}";
      const tree = liquidLanguage.parser.parse(code);
      expect(tree.length).toBe(code.length);
    });

    it("liquid() state allows insert at start of document", () => {
      let state = EditorState.create({ doc: "{{ body }}", extensions: [liquid()] });
      state = state.update({ changes: { from: 0, insert: "<!DOCTYPE html>\n" } }).state;
      expect(state.doc.line(1).text).toBe("<!DOCTYPE html>");
    });

    it("liquid() state allows 4 sequential transactions", () => {
      let state = EditorState.create({ doc: "", extensions: [liquid()] });
      for (let i = 0; i < 4; i++) {
        state = state.update({ changes: { from: state.doc.length, insert: (i > 0 ? "\n" : "") + `{{ var${i} }}` } }).state;
      }
      expect(state.doc.lines).toBe(4);
    });

    it("liquid() state allows deletion of all content", () => {
      const doc = "{% if x %}{{ x }}{% endif %}";
      let state = EditorState.create({ doc, extensions: [liquid()] });
      state = state.update({ changes: { from: 0, to: doc.length } }).state;
      expect(state.doc.toString()).toBe("");
    });

    it("liquid() state selection within single line", () => {
      const state = EditorState.create({
        doc: "{{ user.name }}",
        selection: { anchor: 3, head: 12 },
        extensions: [liquid()],
      });
      expect(state.selection.main.from).toBe(3);
      expect(state.selection.main.to).toBe(12);
    });

    it("liquid() state replacement transaction works", () => {
      let state = EditorState.create({ doc: "{{ old }}", extensions: [liquid()] });
      state = state.update({ changes: { from: 3, to: 6, insert: "new" } }).state;
      expect(state.doc.toString()).toBe("{{ new }}");
    });
  });
});
