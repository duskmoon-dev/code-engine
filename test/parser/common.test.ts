import { describe, it, expect } from "bun:test";
import { Tree, NodeType, NodeSet, TreeBuffer, NodeProp, Parser, TreeFragment } from "../../src/parser/common/index";
import { pythonLanguage } from "../../src/lang/python/index";
import { EditorState } from "../../src/core/state/index";

describe("Parser common module", () => {
  describe("exports", () => {
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

    it("exports NodeSet", () => {
      expect(NodeSet).toBeDefined();
    });

    it("exports TreeBuffer", () => {
      expect(TreeBuffer).toBeDefined();
    });

    it("exports Parser", () => {
      expect(Parser).toBeDefined();
    });

    it("exports TreeFragment", () => {
      expect(TreeFragment).toBeDefined();
    });
  });

  describe("Tree.empty", () => {
    it("has length 0", () => {
      expect(Tree.empty.length).toBe(0);
    });

    it("type is NodeType.none", () => {
      expect(Tree.empty.type).toBe(NodeType.none);
    });
  });

  describe("NodeType.none", () => {
    it("has id 0", () => {
      expect(NodeType.none.id).toBe(0);
    });

    it("is anonymous", () => {
      expect(NodeType.none.isAnonymous).toBe(true);
    });
  });

  describe("live parse tree via language", () => {
    it("parsed tree has non-zero length", () => {
      const state = EditorState.create({
        doc: "x = 1\nprint(x)",
        extensions: [],
      });
      // Python language parses trees
      const tree = pythonLanguage.parser.parse("x = 1\nprint(x)");
      expect(tree.length).toBeGreaterThan(0);
    });

    it("parsed tree has a top-level type", () => {
      const tree = pythonLanguage.parser.parse("x = 1");
      expect(tree.type).toBeDefined();
      expect(tree.type.isTop).toBe(true);
    });
  });
});
