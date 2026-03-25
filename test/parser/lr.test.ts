import { describe, it, expect } from "bun:test";
import { LRParser, ExternalTokenizer, ContextTracker, Stack } from "../../src/parser/lr/index";
import { pythonLanguage } from "../../src/lang/python/index";

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
  });
});
