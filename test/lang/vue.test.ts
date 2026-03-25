import { describe, it, expect } from "bun:test";
import { vue, vueLanguage } from "../../src/lang/vue/index";
import { html } from "../../src/lang/html/index";
import { EditorState } from "../../src/core/state/index";
import { LanguageSupport, syntaxTree } from "../../src/core/language/index";

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

    it("vueLanguage parser produces a non-empty tree", () => {
      const tree = vueLanguage.parser.parse("<template><div>hello</div></template>");
      expect(tree.length).toBeGreaterThan(0);
    });

    it("vueLanguage parser tree has a top-level type", () => {
      const tree = vueLanguage.parser.parse("<template><p>{{ msg }}</p></template>");
      expect(tree.type.isTop).toBe(true);
    });

    it("syntaxTree from EditorState with vue() is non-empty", () => {
      const state = EditorState.create({
        doc: "<template><span>{{ value }}</span></template>",
        extensions: [vue()],
      });
      const tree = syntaxTree(state);
      expect(tree.length).toBeGreaterThan(0);
    });

    it("vue parse tree cursor traversal works", () => {
      const tree = vueLanguage.parser.parse("<template><div>hello</div></template>");
      const cursor = tree.cursor();
      let nodeCount = 0;
      do { nodeCount++; } while (cursor.next() && nodeCount < 100);
      expect(nodeCount).toBeGreaterThan(1);
    });

    it("tree.resolve() finds nodes at multiple positions in Vue SFC", () => {
      const code = "<template><div class=\"container\">{{ message }}</div></template>";
      const tree = vueLanguage.parser.parse(code);
      for (let i = 0; i < code.length; i += 8) {
        const node = tree.resolve(i);
        expect(node).toBeDefined();
      }
    });

    it("vueLanguage can parse v-bind directive", () => {
      const tree = vueLanguage.parser.parse("<template><img :src=\"imageUrl\" :alt=\"imageAlt\"></template>");
      expect(tree.length).toBeGreaterThan(0);
      expect(tree.type.isTop).toBe(true);
    });

    it("vueLanguage can parse v-on directive", () => {
      const tree = vueLanguage.parser.parse("<template><button @click=\"handleClick\" @mouseover=\"onHover\">Click</button></template>");
      expect(tree.length).toBeGreaterThan(0);
    });

    it("vueLanguage can parse v-if and v-for directives", () => {
      const tree = vueLanguage.parser.parse("<template><ul><li v-for=\"item in items\" v-if=\"item.active\" :key=\"item.id\">{{ item.name }}</li></ul></template>");
      expect(tree.length).toBeGreaterThan(0);
    });

    it("vueLanguage can parse script setup block", () => {
      const tree = vueLanguage.parser.parse("<script setup>\nimport { ref } from 'vue'\nconst count = ref(0)\n</script>");
      expect(tree.length).toBeGreaterThan(0);
    });

    it("vueLanguage can parse v-model directive", () => {
      const tree = vueLanguage.parser.parse("<template><input v-model=\"username\" type=\"text\"></template>");
      expect(tree.length).toBeGreaterThan(0);
      expect(tree.type.isTop).toBe(true);
    });

    it("vueLanguage can parse v-slot directive", () => {
      const tree = vueLanguage.parser.parse("<template><my-component><template v-slot:header>Header</template></my-component></template>");
      expect(tree.length).toBeGreaterThan(0);
    });

    it("vueLanguage can parse full SFC with template, script, and style", () => {
      const code = `<template>\n  <div class="app">{{ message }}</div>\n</template>\n<script>\nexport default {\n  data() { return { message: 'Hello' }; }\n}\n</script>\n<style>\n.app { color: red; }\n</style>`;
      const tree = vueLanguage.parser.parse(code);
      expect(tree.length).toBeGreaterThan(0);
      expect(tree.type.isTop).toBe(true);
    });

    it("vueLanguage can parse computed properties comment", () => {
      const tree = vueLanguage.parser.parse("<script>\nexport default {\n  computed: {\n    fullName() { return this.first + ' ' + this.last; }\n  }\n}\n</script>");
      expect(tree.length).toBeGreaterThan(0);
    });

    it("vueLanguage can parse custom directives", () => {
      const tree = vueLanguage.parser.parse("<template><div v-focus v-tooltip=\"'Click me'\">focus me</div></template>");
      expect(tree.length).toBeGreaterThan(0);
    });

    it("vueLanguage can parse slot content", () => {
      const tree = vueLanguage.parser.parse("<template><base-layout><template #header><h1>Title</h1></template></base-layout></template>");
      expect(tree.length).toBeGreaterThan(0);
      expect(tree.type.isTop).toBe(true);
    });

    it("vueLanguage can parse emits option", () => {
      const tree = vueLanguage.parser.parse("<script>\nexport default {\n  emits: ['update', 'submit'],\n  methods: { submit() { this.$emit('submit') } }\n}\n</script>");
      expect(tree.length).toBeGreaterThan(0);
    });

    it("vueLanguage can parse watch option", () => {
      const tree = vueLanguage.parser.parse("<script>\nexport default {\n  watch: {\n    count(newVal, oldVal) { console.log(newVal, oldVal); },\n    items: { handler(val) {}, deep: true, immediate: true }\n  }\n}\n</script>");
      expect(tree.length).toBeGreaterThan(0);
      expect(tree.type.isTop).toBe(true);
    });

    it("vueLanguage can parse Composition API with defineProps", () => {
      const tree = vueLanguage.parser.parse("<script setup>\nconst props = defineProps({ title: String, count: { type: Number, default: 0 } })\nconst emit = defineEmits(['update'])\n</script>");
      expect(tree.length).toBeGreaterThan(0);
    });

    it("vueLanguage tree.toString() returns non-empty string", () => {
      const tree = vueLanguage.parser.parse("<template><div>hello</div></template>");
      expect(typeof tree.toString()).toBe("string");
      expect(tree.toString().length).toBeGreaterThan(0);
    });

    it("tree.resolveInner() finds innermost node in Vue template", () => {
      const tree = vueLanguage.parser.parse("<template><p>text</p></template>");
      const node = tree.resolveInner(12);
      expect(node).toBeDefined();
      expect(node.from).toBeLessThanOrEqual(12);
      expect(node.to).toBeGreaterThanOrEqual(12);
    });

    it("vueLanguage can parse teleport component", () => {
      const tree = vueLanguage.parser.parse("<template><Teleport to=\"body\"><modal-dialog v-if=\"open\"/></Teleport></template>");
      expect(tree.length).toBeGreaterThan(0);
      expect(tree.type.isTop).toBe(true);
    });
  });
});
