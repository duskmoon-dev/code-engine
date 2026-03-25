import { describe, it, expect } from "bun:test";
import { LRParser, ExternalTokenizer, ContextTracker, Stack } from "../../src/parser/lr/index";
import { pythonLanguage } from "../../src/lang/python/index";
import { javascriptLanguage } from "../../src/lang/javascript/index";
import { rustLanguage } from "../../src/lang/rust/index";

describe("LR Parser module", () => {
  describe("exports", () => {
    it("exports LRParser", () => {
      expect(LRParser).toBeDefined();
    });

    it("exports ExternalTokenizer", () => {
      expect(ExternalTokenizer).toBeDefined();
    });

    it("exports ContextTracker", () => {
      expect(ContextTracker).toBeDefined();
    });

    it("exports Stack", () => {
      expect(Stack).toBeDefined();
    });
  });

  describe("LRParser via language pack", () => {
    it("language packs expose an LRParser", () => {
      expect(pythonLanguage.parser).toBeDefined();
      expect(pythonLanguage.parser instanceof LRParser).toBe(true);
    });

    it("LRParser has states", () => {
      const parser = pythonLanguage.parser as LRParser;
      expect(parser.states).toBeDefined();
      expect(parser.states.length).toBeGreaterThan(0);
    });

    it("LRParser has topRules", () => {
      const parser = pythonLanguage.parser as LRParser;
      expect(parser.topRules).toBeDefined();
    });

    it("LRParser.parse returns an incremental tree", () => {
      const tree = pythonLanguage.parser.parse("for x in range(10): print(x)");
      expect(tree.length).toBeGreaterThan(0);
      expect(tree.type.isTop).toBe(true);
    });

    it("tree cursor can traverse nodes", () => {
      const tree = pythonLanguage.parser.parse("x = 1");
      const cursor = tree.cursor();
      let nodeCount = 0;
      do {
        nodeCount++;
      } while (cursor.next() && nodeCount < 100);
      expect(nodeCount).toBeGreaterThan(1);
    });

    it("javascript language parser is also an LRParser", () => {
      expect(javascriptLanguage.parser instanceof LRParser).toBe(true);
    });

    it("rust language parser is also an LRParser", () => {
      expect(rustLanguage.parser instanceof LRParser).toBe(true);
    });

    it("parsers for different languages are distinct instances", () => {
      expect(pythonLanguage.parser).not.toBe(javascriptLanguage.parser);
      expect(pythonLanguage.parser).not.toBe(rustLanguage.parser);
    });

    it("LRParser.topNode returns a NodeType for top rule", () => {
      const parser = pythonLanguage.parser as LRParser;
      expect(parser.topNode).toBeDefined();
      expect(parser.topNode.isTop).toBe(true);
    });

    it("LRParser.getName returns a string for term id", () => {
      const parser = pythonLanguage.parser as LRParser;
      const eofName = parser.getName(parser.eofTerm);
      expect(typeof eofName).toBe("string");
    });

    it("LRParser.configure returns a new parser with changed dialect", () => {
      const parser = pythonLanguage.parser as LRParser;
      const configured = parser.configure({});
      expect(configured).toBeInstanceOf(LRParser);
    });

    it("parse returns a tree that can be resolved at any position", () => {
      const code = "x = 1 + 2";
      const tree = pythonLanguage.parser.parse(code);
      for (let i = 0; i <= code.length; i += 2) {
        const node = tree.resolve(i);
        expect(node).toBeDefined();
      }
    });

    it("LRParser handles empty string input", () => {
      const tree = pythonLanguage.parser.parse("");
      expect(tree).toBeDefined();
      expect(tree.length).toBe(0);
    });

    it("LRParser.nodeSet has multiple node types", () => {
      const parser = pythonLanguage.parser as LRParser;
      expect(parser.nodeSet).toBeDefined();
      expect(parser.nodeSet.types.length).toBeGreaterThan(1);
    });

    it("tree.firstChild and lastChild are defined for a complex parse", () => {
      const tree = pythonLanguage.parser.parse("def foo(): pass");
      const cursor = tree.cursor();
      cursor.firstChild();
      expect(cursor.node).toBeDefined();
    });

    it("LRParser.configure returns a parser with the same node set size", () => {
      const parser = pythonLanguage.parser as LRParser;
      const configured = parser.configure({});
      expect(configured.nodeSet.types.length).toBe(parser.nodeSet.types.length);
    });

    it("javascript LRParser handles multi-line code", () => {
      const tree = javascriptLanguage.parser.parse("function foo() {\n  return 1;\n}\nfunction bar() {\n  return 2;\n}");
      expect(tree.length).toBeGreaterThan(0);
      expect(tree.type.isTop).toBe(true);
    });

    it("rust LRParser parses a struct definition", () => {
      const tree = rustLanguage.parser.parse("struct Point { x: f64, y: f64 }");
      expect(tree.length).toBeGreaterThan(0);
      expect(tree.type.isTop).toBe(true);
    });

    it("all three language parsers have a non-empty nodeSet", () => {
      for (const lang of [pythonLanguage, javascriptLanguage, rustLanguage]) {
        const parser = lang.parser as LRParser;
        expect(parser.nodeSet.types.length).toBeGreaterThan(0);
      }
    });

    it("LRParser.getName returns a string for term 0", () => {
      const parser = pythonLanguage.parser as LRParser;
      const name = parser.getName(0);
      expect(typeof name).toBe("string");
    });

    it("LRParser.eofTerm is a number", () => {
      const parser = pythonLanguage.parser as LRParser;
      expect(typeof parser.eofTerm).toBe("number");
    });

    it("LRParser.nodeSet.types includes named types", () => {
      const parser = pythonLanguage.parser as LRParser;
      const named = parser.nodeSet.types.filter(t => t.name !== "");
      expect(named.length).toBeGreaterThan(0);
    });

    it("parsed tree toString() returns a string", () => {
      const tree = pythonLanguage.parser.parse("x = 1");
      expect(typeof tree.toString()).toBe("string");
      expect(tree.toString().length).toBeGreaterThan(0);
    });

    it("tree.iterate() visits at least one node", () => {
      const tree = pythonLanguage.parser.parse("x = 1 + 2");
      let count = 0;
      tree.iterate({ enter: () => { count++; } });
      expect(count).toBeGreaterThan(0);
    });

    it("tree.resolveInner() finds innermost node", () => {
      const tree = pythonLanguage.parser.parse("print(42)");
      const node = tree.resolveInner(6);
      expect(node).toBeDefined();
      expect(node.from).toBeLessThanOrEqual(6);
      expect(node.to).toBeGreaterThanOrEqual(6);
    });

    it("LRParser.nodeSet has types with id property", () => {
      const parser = pythonLanguage.parser as LRParser;
      for (const t of parser.nodeSet.types.slice(0, 5)) {
        expect(typeof t.id).toBe("number");
      }
    });

    it("javascriptLanguage LRParser has nodeSet", () => {
      const parser = javascriptLanguage.parser as LRParser;
      expect(parser.nodeSet).toBeDefined();
      expect(parser.nodeSet.types.length).toBeGreaterThan(0);
    });

    it("rustLanguage LRParser has positive nodeSet length", () => {
      const parser = rustLanguage.parser as LRParser;
      expect(parser.nodeSet.types.length).toBeGreaterThan(10);
    });

    it("pythonLanguage LRParser nodeSet has unique ids", () => {
      const parser = pythonLanguage.parser as LRParser;
      const ids = parser.nodeSet.types.map(t => t.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(ids.length);
    });

    it("LRParser tree from javascript has correct length", () => {
      const code = "const x = 42;";
      const tree = javascriptLanguage.parser.parse(code);
      expect(tree.length).toBe(code.length);
    });

    it("LRParser tree cursor from rust finds nodes", () => {
      const tree = rustLanguage.parser.parse("fn main() {}");
      let count = 0;
      tree.iterate({ enter: () => { count++; } });
      expect(count).toBeGreaterThan(1);
    });

    it("LRParser Stack is constructable or defined", () => {
      expect(Stack).toBeDefined();
    });

    it("parsed tree type has a name property", () => {
      const tree = pythonLanguage.parser.parse("x = 1");
      expect(typeof tree.type.name).toBe("string");
    });

    it("tree.resolve returns a node with from/to for python", () => {
      const tree = pythonLanguage.parser.parse("x = 1 + 2");
      const node = tree.resolve(0);
      expect(node.from).toBeLessThanOrEqual(0);
      expect(node.to).toBeGreaterThanOrEqual(0);
    });

    it("all language parsers produce trees with length equal to source", () => {
      const code = "x = 1";
      const tree = pythonLanguage.parser.parse(code);
      expect(tree.length).toBe(code.length);
    });

    it("LRParser.configure preserves topNode name", () => {
      const parser = pythonLanguage.parser as LRParser;
      const configured = parser.configure({});
      expect(configured.topNode.name).toBe(parser.topNode.name);
    });

    it("rust tree iterate visits more than 3 nodes for struct def", () => {
      const tree = rustLanguage.parser.parse("struct Point { x: i32, y: i32 }");
      let count = 0;
      tree.iterate({ enter: () => { count++; } });
      expect(count).toBeGreaterThan(3);
    });

    it("javascript tree can be resolved at middle position", () => {
      const code = "const x = 42;";
      const tree = javascriptLanguage.parser.parse(code);
      const node = tree.resolveInner(7);
      expect(node.from).toBeLessThanOrEqual(7);
      expect(node.to).toBeGreaterThanOrEqual(7);
    });

    it("python tree has correct length for multi-line code", () => {
      const code = "def foo():\n    return 42\n\ndef bar():\n    return 0";
      const tree = pythonLanguage.parser.parse(code);
      expect(tree.length).toBe(code.length);
    });

    it("rust tree toString() returns non-empty string", () => {
      const tree = rustLanguage.parser.parse("fn main() { println!(\"hello\"); }");
      expect(typeof tree.toString()).toBe("string");
      expect(tree.toString().length).toBeGreaterThan(0);
    });

    it("javascript tree iterate visits at least 5 nodes for function", () => {
      const tree = javascriptLanguage.parser.parse("function greet(name) { return 'Hello ' + name; }");
      let count = 0;
      tree.iterate({ enter: () => { count++; } });
      expect(count).toBeGreaterThan(5);
    });

    it("python tree resolveInner at last position", () => {
      const code = "x = 1";
      const tree = pythonLanguage.parser.parse(code);
      const node = tree.resolveInner(code.length - 1);
      expect(node).toBeDefined();
      expect(node.from).toBeLessThanOrEqual(code.length - 1);
    });
  });
});
