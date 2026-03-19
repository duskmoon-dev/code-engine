import { describe, it, expect } from "bun:test";
import { Tree, NodeType, NodeSet, TreeBuffer, NodeProp } from "../../src/parser/common/index";

describe("Parser common module", () => {
  it("exports Tree", () => {
    expect(Tree).toBeDefined();
    expect(Tree.empty).toBeDefined();
  });

  it("exports NodeType", () => {
    expect(NodeType).toBeDefined();
    expect(NodeType.none).toBeDefined();
  });

  it("exports NodeProp", () => {
    expect(NodeProp).toBeDefined();
  });

  it("Tree.empty has expected properties", () => {
    const empty = Tree.empty;
    expect(empty.length).toBe(0);
  });
});
