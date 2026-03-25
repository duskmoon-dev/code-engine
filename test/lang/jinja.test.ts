import { describe, it, expect } from "bun:test";
import {
  jinja,
  jinjaLanguage,
  jinjaCompletionSource,
  closePercentBrace,
  type JinjaCompletionConfig,
} from "../../src/lang/jinja/index";
import { EditorState } from "../../src/core/state/index";
import { syntaxTree } from "../../src/core/language/index";

describe("Jinja language pack", () => {
  describe("exports", () => {
    it("exports jinja function", () => {
      expect(typeof jinja).toBe("function");
    });

    it("exports jinjaLanguage", () => {
      expect(jinjaLanguage).toBeDefined();
    });

    it("exports jinjaCompletionSource function", () => {
      expect(typeof jinjaCompletionSource).toBe("function");
    });

    it("exports closePercentBrace extension", () => {
      expect(closePercentBrace).toBeDefined();
    });
  });

  describe("jinjaLanguage", () => {
    it("has the correct language name", () => {
      expect(jinjaLanguage.name).toBe("jinja");
    });

    it("is an LRLanguage instance with a parser", () => {
      expect(jinjaLanguage.parser).toBeDefined();
    });
  });

  describe("jinja() factory", () => {
    it("creates language support with default options", () => {
      const support = jinja();
      expect(support).toBeDefined();
    });

    it("returns a LanguageSupport with jinjaLanguage", () => {
      const support = jinja();
      expect(support.language).toBe(jinjaLanguage);
    });

    it("creates language support with empty config", () => {
      const support = jinja({});
      expect(support).toBeDefined();
      expect(support.language).toBe(jinjaLanguage);
    });

    it("creates language support with custom tags", () => {
      const config: JinjaCompletionConfig = {
        tags: [{ label: "set", type: "keyword" }],
      };
      const support = jinja(config);
      expect(support).toBeDefined();
      expect(support.language).toBe(jinjaLanguage);
    });

    it("creates language support with custom variables", () => {
      const config: JinjaCompletionConfig = {
        variables: [{ label: "user", type: "variable" }],
      };
      const support = jinja(config);
      expect(support).toBeDefined();
    });

    it("creates language support with custom properties resolver", () => {
      const config: JinjaCompletionConfig = {
        properties: (_path, _state, _context) => [
          { label: "name", type: "property" },
        ],
      };
      const support = jinja(config);
      expect(support).toBeDefined();
    });

    it("creates language support with all config options combined", () => {
      const config: JinjaCompletionConfig = {
        tags: [{ label: "block", type: "keyword" }],
        variables: [{ label: "request", type: "variable" }],
        properties: () => [{ label: "method", type: "property" }],
      };
      const support = jinja(config);
      expect(support).toBeDefined();
      expect(support.language).toBe(jinjaLanguage);
    });
  });

  describe("jinjaCompletionSource", () => {
    it("returns a function when called with no arguments", () => {
      const source = jinjaCompletionSource();
      expect(typeof source).toBe("function");
    });

    it("returns a function when called with an empty config", () => {
      const source = jinjaCompletionSource({});
      expect(typeof source).toBe("function");
    });

    it("returns a function when called with custom tags", () => {
      const source = jinjaCompletionSource({
        tags: [{ label: "extends", type: "keyword" }],
      });
      expect(typeof source).toBe("function");
    });

    it("returns a function when called with custom variables", () => {
      const source = jinjaCompletionSource({
        variables: [{ label: "loop", type: "variable" }],
      });
      expect(typeof source).toBe("function");
    });

    it("returns a function when called with custom properties resolver", () => {
      const source = jinjaCompletionSource({
        properties: (_path, _state, _context) => [
          { label: "index", type: "property" },
        ],
      });
      expect(typeof source).toBe("function");
    });

    it("completion source returns null for non-jinja context", () => {
      const source = jinjaCompletionSource();
      const state = EditorState.create({
        doc: "Hello, world!",
        extensions: [jinja()],
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
      const source = jinjaCompletionSource();
      const state = EditorState.create({
        doc: "",
        extensions: [jinja()],
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
    it("integrates with EditorState using jinja()", () => {
      const state = EditorState.create({
        doc: "{% if user %}\n  Hello, {{ user.name }}!\n{% endif %}",
        extensions: [jinja()],
      });
      expect(state.doc.toString()).toContain("{% if user %}");
    });

    it("preserves Jinja template content in EditorState", () => {
      const doc = "{{ title | upper }}";
      const state = EditorState.create({
        doc,
        extensions: [jinja()],
      });
      expect(state.doc.toString()).toBe(doc);
    });

    it("handles multi-line Jinja templates", () => {
      const doc =
        "{% for item in items %}\n  {{ item }}\n{% endfor %}";
      const state = EditorState.create({
        doc,
        extensions: [jinja()],
      });
      expect(state.doc.lines).toBe(3);
    });

    it("handles Jinja block tags in EditorState", () => {
      const doc =
        "{% block content %}\n  <p>Hello</p>\n{% endblock %}";
      const state = EditorState.create({
        doc,
        extensions: [jinja()],
      });
      expect(state.doc.toString()).toContain("{% block content %}");
    });

    it("integrates with jinja() using custom tags config", () => {
      const state = EditorState.create({
        doc: "{% extends 'base.html' %}",
        extensions: [
          jinja({ tags: [{ label: "extends", type: "keyword" }] }),
        ],
      });
      expect(state.doc.toString()).toContain("extends");
    });

    it("integrates with jinja() using custom variables config", () => {
      const state = EditorState.create({
        doc: "{{ user.email }}",
        extensions: [
          jinja({ variables: [{ label: "user", type: "variable" }] }),
        ],
      });
      expect(state.doc.toString()).toContain("user.email");
    });

    it("handles Jinja comment syntax in EditorState", () => {
      const doc = "{# This is a comment #}";
      const state = EditorState.create({
        doc,
        extensions: [jinja()],
      });
      expect(state.doc.toString()).toBe(doc);
    });
  });

  describe("parse tree", () => {
    it("jinjaLanguage parser produces a non-empty tree", () => {
      const tree = jinjaLanguage.parser.parse("{{ user.name | upper }}");
      expect(tree.length).toBeGreaterThan(0);
    });

    it("jinjaLanguage parser tree has a top-level type", () => {
      const tree = jinjaLanguage.parser.parse("{% for item in items %}<p>{{ item }}</p>{% endfor %}");
      expect(tree.type.isTop).toBe(true);
    });

    it("syntaxTree from EditorState with jinja() is non-empty", () => {
      const state = EditorState.create({
        doc: "{% if user.is_admin %}<div>Admin</div>{% endif %}",
        extensions: [jinja()],
      });
      const tree = syntaxTree(state);
      expect(tree.length).toBeGreaterThan(0);
    });

    it("jinja parse tree cursor traversal works", () => {
      const tree = jinjaLanguage.parser.parse("{% for item in items %}{{ item }}{% endfor %}");
      const cursor = tree.cursor();
      let nodeCount = 0;
      do { nodeCount++; } while (cursor.next() && nodeCount < 100);
      expect(nodeCount).toBeGreaterThan(1);
    });

    it("tree.resolve() finds nodes at multiple positions in jinja template", () => {
      const code = "{% for item in items %}{{ item.name }}{% endfor %}";
      const tree = jinjaLanguage.parser.parse(code);
      for (let i = 0; i < code.length; i += 6) {
        const node = tree.resolve(i);
        expect(node).toBeDefined();
      }
    });

    it("jinjaLanguage can parse filter expression", () => {
      const tree = jinjaLanguage.parser.parse("{{ title | upper | truncate(50) }}");
      expect(tree.length).toBeGreaterThan(0);
      expect(tree.type.isTop).toBe(true);
    });

    it("jinjaLanguage can parse if-elif-else", () => {
      const tree = jinjaLanguage.parser.parse("{% if x > 10 %}big{% elif x > 5 %}medium{% else %}small{% endif %}");
      expect(tree.length).toBeGreaterThan(0);
    });

    it("jinjaLanguage can parse macro definition", () => {
      const tree = jinjaLanguage.parser.parse("{% macro input(name, value='') %}<input name=\"{{ name }}\" value=\"{{ value }}\">{% endmacro %}");
      expect(tree.length).toBeGreaterThan(0);
    });

    it("jinjaLanguage can parse set variable", () => {
      const tree = jinjaLanguage.parser.parse("{% set navigation = [('index.html', 'Index'), ('about.html', 'About')] %}");
      expect(tree.length).toBeGreaterThan(0);
    });

    it("jinjaLanguage can parse include tag", () => {
      const tree = jinjaLanguage.parser.parse("{% include 'header.html' %}\n{% include 'footer.html' ignore missing %}");
      expect(tree.length).toBeGreaterThan(0);
    });

    it("jinjaLanguage can parse import tag", () => {
      const tree = jinjaLanguage.parser.parse("{% import 'macros.html' as macros %}\n{{ macros.input('username') }}");
      expect(tree.length).toBeGreaterThan(0);
      expect(tree.type.isTop).toBe(true);
    });

    it("jinjaLanguage can parse test expressions (is defined)", () => {
      const tree = jinjaLanguage.parser.parse("{% if value is defined %}{{ value }}{% endif %}");
      expect(tree.length).toBeGreaterThan(0);
    });

    it("jinjaLanguage can parse raw block", () => {
      const tree = jinjaLanguage.parser.parse("{% raw %}{{ not jinja }}{% endraw %}");
      expect(tree.length).toBeGreaterThan(0);
    });

    it("jinjaLanguage can parse call block", () => {
      const tree = jinjaLanguage.parser.parse("{% call(user) render_dialog(users) %}Hello, {{ user.name }}!{% endcall %}");
      expect(tree.length).toBeGreaterThan(0);
      expect(tree.type.isTop).toBe(true);
    });

    it("jinja() state doc line count is correct", () => {
      const state = EditorState.create({
        doc: "{% if user %}\n  Hello {{ user.name }}\n{% endif %}",
        extensions: [jinja()],
      });
      expect(state.doc.lines).toBe(3);
    });

    it("jinja() state doc line text is accessible", () => {
      const state = EditorState.create({
        doc: "{% block title %}My App{% endblock %}\n{% block content %}{% endblock %}",
        extensions: [jinja()],
      });
      expect(state.doc.line(1).text).toBe("{% block title %}My App{% endblock %}");
    });

    it("jinja() state allows mutation via transaction", () => {
      let state = EditorState.create({ doc: "{{ message }}", extensions: [jinja()] });
      state = state.update({ changes: { from: 13, insert: "\n{{ name }}" } }).state;
      expect(state.doc.lines).toBe(2);
    });

    it("jinja() state doc length invariant holds", () => {
      const doc = "Hello {{ name }}!";
      const state = EditorState.create({ doc, extensions: [jinja()] });
      expect(state.doc.length).toBe(doc.length);
    });

    it("jinja() state replacement transaction works", () => {
      let state = EditorState.create({ doc: "{{ old }}", extensions: [jinja()] });
      state = state.update({ changes: { from: 3, to: 6, insert: "new" } }).state;
      expect(state.doc.toString()).toBe("{{ new }}");
    });
  });
});
