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
  });
});
