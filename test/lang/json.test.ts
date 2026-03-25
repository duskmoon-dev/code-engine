import { describe, it, expect } from "bun:test";
import { json, jsonLanguage, jsonParseLinter } from "../../src/lang/json/index";
import { EditorState } from "../../src/core/state/index";
import { LanguageSupport, syntaxTree } from "../../src/core/language/index";

describe("JSON language pack", () => {
  describe("exports", () => {
    it("exports json function", () => {
      expect(typeof json).toBe("function");
    });

    it("exports jsonLanguage", () => {
      expect(jsonLanguage).toBeDefined();
      expect(jsonLanguage.name).toBe("json");
    });

    it("exports jsonParseLinter", () => {
      expect(typeof jsonParseLinter).toBe("function");
    });
  });

  describe("json() factory", () => {
    it("creates a LanguageSupport instance", () => {
      const support = json();
      expect(support).toBeInstanceOf(LanguageSupport);
    });

    it("uses jsonLanguage", () => {
      const support = json();
      expect(support.language).toBe(jsonLanguage);
    });
  });

  describe("jsonParseLinter", () => {
    it("returns a linter function", () => {
      const linter = jsonParseLinter();
      expect(typeof linter).toBe("function");
    });
  });

  describe("EditorState integration", () => {
    it("json() integrates with EditorState", () => {
      const state = EditorState.create({
        doc: `{"name": "test", "version": "1.0.0", "dependencies": {}}`,
        extensions: [json()],
      });
      expect(state.doc.toString()).toContain('"name"');
    });

    it("parses arrays", () => {
      const state = EditorState.create({
        doc: `[1, 2, 3, "four", true, null]`,
        extensions: [json()],
      });
      expect(state.doc.toString()).toContain("true");
    });

    it("parses nested objects", () => {
      const state = EditorState.create({
        doc: `{"outer": {"inner": [1, 2, 3]}}`,
        extensions: [json()],
      });
      expect(state.doc.toString()).toContain('"inner"');
    });

    it("empty document is valid", () => {
      const state = EditorState.create({
        doc: "",
        extensions: [json()],
      });
      expect(state.doc.length).toBe(0);
    });
  });

  describe("parse tree", () => {
    it("jsonLanguage parser produces a non-empty tree", () => {
      const tree = jsonLanguage.parser.parse('{"key": "value"}');
      expect(tree.length).toBeGreaterThan(0);
    });

    it("jsonLanguage parser tree has a top-level type", () => {
      const tree = jsonLanguage.parser.parse('[1, 2, 3]');
      expect(tree.type.isTop).toBe(true);
    });

    it("syntaxTree from EditorState with json() is non-empty", () => {
      const state = EditorState.create({
        doc: '{"hello": "world"}',
        extensions: [json()],
      });
      const tree = syntaxTree(state);
      expect(tree.length).toBeGreaterThan(0);
    });

    it("json parse tree cursor traversal works", () => {
      const tree = jsonLanguage.parser.parse('{"a": 1, "b": [1, 2, 3]}');
      const cursor = tree.cursor();
      let nodeCount = 0;
      do { nodeCount++; } while (cursor.next() && nodeCount < 100);
      expect(nodeCount).toBeGreaterThan(1);
    });

    it("tree.resolve() finds nodes at various positions", () => {
      const code = '{"key": "value", "num": 42}';
      const tree = jsonLanguage.parser.parse(code);
      for (let i = 0; i < code.length; i += 4) {
        const node = tree.resolve(i);
        expect(node).toBeDefined();
        expect(node.type).toBeDefined();
      }
    });

    it("jsonLanguage can parse deeply nested JSON", () => {
      const code = '{"a": {"b": {"c": {"d": [1, 2, 3]}}}}';
      const tree = jsonLanguage.parser.parse(code);
      expect(tree.length).toBe(code.length);
      expect(tree.type.isTop).toBe(true);
    });

    it("jsonLanguage can parse JSON with all primitive types", () => {
      const code = '{"str": "hello", "num": 3.14, "bool": true, "null": null, "int": -42}';
      const tree = jsonLanguage.parser.parse(code);
      expect(tree.length).toBe(code.length);
    });
  });

  describe("jsonParseLinter behavioral", () => {
    it("jsonParseLinter returns a function (requires EditorView at runtime)", () => {
      const lint = jsonParseLinter();
      expect(typeof lint).toBe("function");
    });
  });

  describe("additional parse tree tests", () => {
    it("jsonLanguage can parse empty array", () => {
      const tree = jsonLanguage.parser.parse("[]");
      expect(tree.length).toBeGreaterThan(0);
      expect(tree.type.isTop).toBe(true);
    });

    it("jsonLanguage can parse empty object", () => {
      const tree = jsonLanguage.parser.parse("{}");
      expect(tree.length).toBeGreaterThan(0);
    });

    it("jsonLanguage can parse array of objects", () => {
      const tree = jsonLanguage.parser.parse('[{"id": 1, "name": "Alice"}, {"id": 2, "name": "Bob"}]');
      expect(tree.length).toBeGreaterThan(0);
      expect(tree.type.isTop).toBe(true);
    });

    it("jsonLanguage can parse unicode string", () => {
      const tree = jsonLanguage.parser.parse('{"greeting": "こんにちは", "emoji": "🎉"}');
      expect(tree.length).toBeGreaterThan(0);
    });

    it("jsonLanguage can parse scientific notation", () => {
      const tree = jsonLanguage.parser.parse('{"val": 1.5e10, "neg": -2.5e-3}');
      expect(tree.length).toBeGreaterThan(0);
    });

    it("jsonLanguage cursor traversal counts nodes", () => {
      const tree = jsonLanguage.parser.parse('{"a": 1, "b": [1, 2, 3], "c": {"d": true}}');
      const cursor = tree.cursor();
      let nodeCount = 0;
      do { nodeCount++; } while (cursor.next() && nodeCount < 100);
      expect(nodeCount).toBeGreaterThan(5);
    });

    it("tree.resolve() in JSON at multiple positions", () => {
      const code = '{"name": "Alice", "age": 30, "tags": ["dev", "ops"]}';
      const tree = jsonLanguage.parser.parse(code);
      for (let i = 0; i < code.length; i += 6) {
        const node = tree.resolve(i);
        expect(node).toBeDefined();
      }
    });

    it("jsonLanguage can parse nested array of arrays", () => {
      const tree = jsonLanguage.parser.parse("[[1,2],[3,4],[5,6]]");
      expect(tree.length).toBeGreaterThan(0);
      expect(tree.type.isTop).toBe(true);
    });

    it("jsonLanguage can parse string escape sequences", () => {
      const tree = jsonLanguage.parser.parse('{"text": "line1\\nline2\\ttab\\\"quote\\\\backslash"}');
      expect(tree.length).toBeGreaterThan(0);
    });

    it("jsonLanguage can parse large integer values", () => {
      const tree = jsonLanguage.parser.parse('{"big": 9007199254740992, "neg": -9007199254740992}');
      expect(tree.length).toBeGreaterThan(0);
      expect(tree.type.isTop).toBe(true);
    });

    it("jsonLanguage tree.toString() is non-empty", () => {
      const tree = jsonLanguage.parser.parse('{"key": "value"}');
      expect(typeof tree.toString()).toBe("string");
      expect(tree.toString().length).toBeGreaterThan(0);
    });

    it("jsonLanguage can parse complex package.json-like structure", () => {
      const code = '{"name":"pkg","version":"1.0.0","scripts":{"build":"tsc","test":"jest"},"dependencies":{"react":"^18.0.0"},"devDependencies":{"typescript":"^5.0.0"}}';
      const tree = jsonLanguage.parser.parse(code);
      expect(tree.length).toBe(code.length);
      expect(tree.type.isTop).toBe(true);
    });

    it("jsonLanguage cursor counts reasonable node count for complex JSON", () => {
      const tree = jsonLanguage.parser.parse('[{"id":1,"name":"Alice"},{"id":2,"name":"Bob"},{"id":3,"name":"Charlie"}]');
      let nodeCount = 0;
      tree.iterate({ enter: () => { nodeCount++; } });
      expect(nodeCount).toBeGreaterThan(10);
    });

    it("jsonLanguage tree.resolveInner() finds innermost node", () => {
      const tree = jsonLanguage.parser.parse('{"key": "value"}');
      const node = tree.resolveInner(3);
      expect(node).toBeDefined();
      expect(node.from).toBeLessThanOrEqual(3);
      expect(node.to).toBeGreaterThanOrEqual(3);
    });

    it("jsonLanguage can parse null and boolean values", () => {
      const tree = jsonLanguage.parser.parse('{"active": true, "deleted": false, "value": null}');
      expect(tree.length).toBeGreaterThan(0);
      expect(tree.type.isTop).toBe(true);
    });

    it("jsonParseLinter is a function", () => {
      expect(typeof jsonParseLinter).toBe("function");
    });

    it("EditorState with json() allows doc mutation", () => {
      let state = EditorState.create({ doc: '{"a":1}', extensions: [json()] });
      state = state.update({ changes: { from: 6, to: 6, insert: ',"b":2' } }).state;
      expect(state.doc.toString()).toBe('{"a":1,"b":2}');
    });

    it("jsonLanguage can parse unicode strings", () => {
      const tree = jsonLanguage.parser.parse('{"emoji": "\\u2764\\uFE0F", "cjk": "\\u4e2d\\u6587"}');
      expect(tree.length).toBeGreaterThan(0);
    });

    it("json() state doc line count is correct", () => {
      const state = EditorState.create({
        doc: '{\n  "name": "Alice",\n  "age": 30\n}',
        extensions: [json()],
      });
      expect(state.doc.lines).toBe(4);
    });

    it("json() state doc line text is accessible", () => {
      const state = EditorState.create({
        doc: '{"name": "Alice"}',
        extensions: [json()],
      });
      expect(state.doc.line(1).text).toBe('{"name": "Alice"}');
    });

    it("json() state allows multiple sequential transactions", () => {
      let state = EditorState.create({ doc: '{"a":1}', extensions: [json()] });
      state = state.update({ changes: { from: 6, insert: ',"b":2' } }).state;
      state = state.update({ changes: { from: state.doc.length - 1, insert: ',"c":3' } }).state;
      expect(state.doc.toString()).toContain('"c":3');
    });

    it("json() extension preserves doc length invariant", () => {
      const doc = '{"key": "value"}';
      const state = EditorState.create({ doc, extensions: [json()] });
      expect(state.doc.length).toBe(doc.length);
    });

    it("json() state selection can span content", () => {
      const state = EditorState.create({
        doc: '{"name": "Alice"}',
        selection: { anchor: 1, head: 7 },
        extensions: [json()],
      });
      expect(state.selection.main.from).toBe(1);
      expect(state.selection.main.to).toBe(7);
    });

    it("json() state deletion transaction works", () => {
      let state = EditorState.create({ doc: '{"a":1,"b":2}', extensions: [json()] });
      state = state.update({ changes: { from: 6, to: 12 } }).state;
      expect(state.doc.toString()).toBe('{"a":1}');
    });

    it("json() state doc line text is correct", () => {
      const state = EditorState.create({
        doc: '{\n  "x": 1\n}',
        extensions: [json()],
      });
      expect(state.doc.line(1).text).toBe("{");
      expect(state.doc.line(3).text).toBe("}");
    });

    it("jsonLanguage parser tree has correct length", () => {
      const code = '{"nested": {"a": 1, "b": [1, 2, 3]}}';
      const tree = jsonLanguage.parser.parse(code);
      expect(tree.length).toBe(code.length);
    });

    it("jsonParseLinter is a function", () => {
      expect(typeof jsonParseLinter).toBe("function");
    });

    it("jsonParseLinter returns a linting extension when called", () => {
      const linter = jsonParseLinter();
      expect(linter).toBeDefined();
      expect(typeof linter).toBe("function");
    });

    it("json() state doc line count is correct", () => {
      const state = EditorState.create({
        doc: "{\n  \"a\": 1,\n  \"b\": 2\n}",
        extensions: [json()],
      });
      expect(state.doc.lines).toBe(4);
    });

    it("json() state allows multiple sequential transactions", () => {
      let state = EditorState.create({ doc: "{}", extensions: [json()] });
      state = state.update({ changes: { from: 1, insert: "\"x\": 1" } }).state;
      state = state.update({ changes: { from: state.doc.length - 1, insert: ", \"y\": 2" } }).state;
      expect(state.doc.toString()).toContain("\"y\": 2");
    });

    it("json() extension preserves doc length invariant", () => {
      const doc = "{\"key\": \"value\"}";
      const state = EditorState.create({ doc, extensions: [json()] });
      expect(state.doc.length).toBe(doc.length);
    });

    it("json() state doc line text is accessible", () => {
      const state = EditorState.create({
        doc: "{\n  \"name\": \"Alice\"\n}",
        extensions: [json()],
      });
      expect(state.doc.line(1).text).toBe("{");
      expect(state.doc.line(3).text).toBe("}");
    });

    it("json() state with unicode content works", () => {
      const doc = "{\"greeting\": \"こんにちは\"}";
      const state = EditorState.create({ doc, extensions: [json()] });
      expect(state.doc.toString()).toBe(doc);
    });

    it("json() state deletion transaction works", () => {
      let state = EditorState.create({ doc: "{\"a\": 1}\n{\"b\": 2}", extensions: [json()] });
      state = state.update({ changes: { from: 8, to: 17 } }).state;
      expect(state.doc.toString()).toBe("{\"a\": 1}");
    });

    it("json() state allows 4 sequential transactions", () => {
      let state = EditorState.create({ doc: "{}", extensions: [json()] });
      state = state.update({ changes: { from: 1, insert: "\"a\": 1" } }).state;
      state = state.update({ changes: { from: state.doc.length, insert: "\n{}" } }).state;
      state = state.update({ changes: { from: state.doc.length, insert: "\n{}" } }).state;
      expect(state.doc.lines).toBe(3);
    });

    it("jsonLanguage parser tree has correct length", () => {
      const code = "{\"name\": \"Alice\", \"age\": 30}";
      const tree = jsonLanguage.parser.parse(code);
      expect(tree.length).toBe(code.length);
    });

    it("json() state allows insert at start", () => {
      let state = EditorState.create({ doc: "\"value\"", extensions: [json()] });
      state = state.update({ changes: { from: 0, insert: "[" } }).state;
      expect(state.doc.line(1).text.startsWith("[")).toBe(true);
    });
  });
});
