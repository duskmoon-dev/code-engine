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
  });
});
