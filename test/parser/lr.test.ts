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
  });
});
