import { describe, it, expect } from "bun:test";
import { vue, vueLanguage } from "../../src/lang/vue/index";
import { html } from "../../src/lang/html/index";
import { EditorState } from "../../src/core/state/index";
import { LanguageSupport } from "../../src/core/language/index";

describe("Vue language pack", () => {
  describe("exports", () => {
    it("exports vue function", () => {
      expect(typeof vue).toBe("function");
    });

    it("exports vueLanguage as an LRLanguage", () => {
      expect(vueLanguage).toBeDefined();
      expect(typeof vueLanguage.parser).toBe("object");
    });

    it("vueLanguage has correct name", () => {
      expect(vueLanguage.name).toBe("vue");
    });
  });

  describe("vue() factory", () => {
    it("creates a LanguageSupport instance with no arguments", () => {
      const support = vue();
      expect(support).toBeInstanceOf(LanguageSupport);
    });

    it("returns LanguageSupport whose language is vueLanguage", () => {
      const support = vue();
      expect(support.language).toBe(vueLanguage);
    });

    it("creates language support with explicit empty config", () => {
      const support = vue({});
      expect(support).toBeInstanceOf(LanguageSupport);
      expect(support.language).toBe(vueLanguage);
    });

    it("creates language support with an html base", () => {
      const base = html();
      const support = vue({ base });
      expect(support).toBeInstanceOf(LanguageSupport);
      expect(support.language).toBe(vueLanguage);
    });

    it("creates language support with html base that has options", () => {
      const base = html({ matchClosingTags: false, selfClosingTags: true });
      const support = vue({ base });
      expect(support).toBeInstanceOf(LanguageSupport);
    });
  });

  describe("EditorState integration", () => {
    it("can be used as an EditorState extension", () => {
      const support = vue();
      const state = EditorState.create({
        doc: "<template>\n  <div>Hello</div>\n</template>",
        extensions: [support],
      });
      expect(state).toBeDefined();
      expect(state.doc.toString()).toContain("<template>");
    });

    it("EditorState language resolves to vueLanguage", () => {
      const support = vue();
      const state = EditorState.create({
        doc: "<template><p>{{ msg }}</p></template>",
        extensions: [support],
      });
      const lang = state.facet(support.language.data);
      expect(lang).toBeDefined();
    });

    it("works with html base in EditorState", () => {
      const base = html();
      const support = vue({ base });
      const state = EditorState.create({
        doc: "<template>\n  <span>{{ value }}</span>\n</template>\n<script>\nexport default {}\n</script>",
        extensions: [support],
      });
      expect(state).toBeDefined();
    });

    it("empty document is valid", () => {
      const support = vue();
      const state = EditorState.create({
        doc: "",
        extensions: [support],
      });
      expect(state.doc.length).toBe(0);
    });

    it("parses a script block without error", () => {
      const support = vue();
      const state = EditorState.create({
        doc: "<script>\nimport Foo from './Foo.vue'\nexport default { name: 'Bar' }\n</script>",
        extensions: [support],
      });
      expect(state).toBeDefined();
    });

    it("parses a style block without error", () => {
      const support = vue();
      const state = EditorState.create({
        doc: "<style scoped>\n.foo { color: red; }\n</style>",
        extensions: [support],
      });
      expect(state).toBeDefined();
    });
  });
});
