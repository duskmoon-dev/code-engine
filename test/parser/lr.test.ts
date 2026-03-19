import { describe, it, expect } from "bun:test";
import { LRParser, ExternalTokenizer } from "../../src/parser/lr/index";

describe("LR Parser module", () => {
  it("exports LRParser", () => {
    expect(LRParser).toBeDefined();
  });

  it("exports ExternalTokenizer", () => {
    expect(ExternalTokenizer).toBeDefined();
  });
});
