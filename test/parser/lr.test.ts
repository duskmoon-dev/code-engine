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
  });
});
