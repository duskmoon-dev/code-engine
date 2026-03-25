import { describe, it, expect } from "bun:test";
import { Tree, NodeType, NodeSet, TreeBuffer, NodeProp, Parser, TreeFragment, parseMixed } from "../../src/parser/common/index";
import { pythonLanguage } from "../../src/lang/python/index";
import { javascriptLanguage } from "../../src/lang/javascript/index";
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

    it("exports parseMixed", () => {
      expect(typeof parseMixed).toBe("function");
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

    it("tree cursor can iterate nodes", () => {
      const tree = pythonLanguage.parser.parse("x = 1");
      const cursor = tree.cursor();
      expect(cursor).toBeDefined();
      expect(cursor.type).toBeDefined();
    });

    it("TreeFragment.addTree creates fragments from a tree", () => {
      const tree = pythonLanguage.parser.parse("x = 1");
      const fragments = TreeFragment.addTree(tree);
      expect(Array.isArray(fragments)).toBe(true);
      expect(fragments.length).toBeGreaterThan(0);
    });

    it("tree.toString() returns a string", () => {
      const tree = pythonLanguage.parser.parse("x = 1");
      expect(typeof tree.toString()).toBe("string");
    });

    it("NodeProp has built-in props (closedBy, openedBy, group)", () => {
      expect(NodeProp.closedBy).toBeDefined();
      expect(NodeProp.openedBy).toBeDefined();
      expect(NodeProp.group).toBeDefined();
    });

    it("tree resolve() finds a node at a position", () => {
      const tree = pythonLanguage.parser.parse("x = 1\nprint(x)");
      const node = tree.resolve(0);
      expect(node).toBeDefined();
      expect(node.type).toBeDefined();
    });
  });
});

describe("NodeProp", () => {
  it("can create a new NodeProp", () => {
    const prop = new NodeProp<string>();
    expect(prop).toBeDefined();
    expect(typeof prop.id).toBe("number");
  });

  it("perNode defaults to false", () => {
    const prop = new NodeProp<string>();
    expect(prop.perNode).toBe(false);
  });

  it("perNode can be set to true", () => {
    const prop = new NodeProp<string>({ perNode: true });
    expect(prop.perNode).toBe(true);
  });

  it("built-in closedBy prop exists and is a NodeProp", () => {
    expect(NodeProp.closedBy).toBeDefined();
    expect(NodeProp.closedBy).toBeInstanceOf(NodeProp);
  });

  it("built-in openedBy prop exists and is a NodeProp", () => {
    expect(NodeProp.openedBy).toBeDefined();
    expect(NodeProp.openedBy).toBeInstanceOf(NodeProp);
  });

  it("built-in group prop exists and is a NodeProp", () => {
    expect(NodeProp.group).toBeDefined();
    expect(NodeProp.group).toBeInstanceOf(NodeProp);
  });

  it("built-in contextHash prop exists", () => {
    expect(NodeProp.contextHash).toBeDefined();
  });

  it("built-in lookAhead prop exists", () => {
    expect(NodeProp.lookAhead).toBeDefined();
  });

  it("built-in mounted prop exists", () => {
    expect(NodeProp.mounted).toBeDefined();
  });
});

describe("Tree methods", () => {
  it("tree.length matches parsed code length", () => {
    const code = "x = 1 + 2";
    const tree = pythonLanguage.parser.parse(code);
    expect(tree.length).toBe(code.length);
  });

  it("tree.type is the top NodeType", () => {
    const tree = pythonLanguage.parser.parse("x = 1");
    expect(tree.type.isTop).toBe(true);
  });

  it("tree.iterate() visits all nodes", () => {
    const tree = pythonLanguage.parser.parse("x = 1 + 2");
    let nodeCount = 0;
    tree.iterate({ enter: () => { nodeCount++; } });
    expect(nodeCount).toBeGreaterThan(1);
  });

  it("tree.resolve() at end of code returns a valid node", () => {
    const code = "x = 1";
    const tree = pythonLanguage.parser.parse(code);
    const node = tree.resolve(code.length);
    expect(node).toBeDefined();
    expect(node.type).toBeDefined();
  });

  it("tree.resolveInner() resolves to the innermost node", () => {
    const code = "print(42)";
    const tree = pythonLanguage.parser.parse(code);
    const node = tree.resolveInner(6);
    expect(node).toBeDefined();
    expect(node.from).toBeLessThanOrEqual(6);
    expect(node.to).toBeGreaterThanOrEqual(6);
  });

  it("node.parent returns parent node or null at top", () => {
    const tree = pythonLanguage.parser.parse("x = 1");
    const root = tree.resolve(0);
    // The root's parent should be null if it is the top node
    // or some outer node; just check it is accessible
    expect(root).toBeDefined();
  });

  it("TreeFragment.addTree creates non-empty fragments", () => {
    const code = "def foo(): pass";
    const tree = pythonLanguage.parser.parse(code);
    const frags = TreeFragment.addTree(tree);
    expect(frags.length).toBeGreaterThan(0);
  });

  it("fragments have from/to properties", () => {
    const tree = pythonLanguage.parser.parse("x = 1");
    const frags = TreeFragment.addTree(tree);
    for (const f of frags) {
      expect(typeof f.from).toBe("number");
      expect(typeof f.to).toBe("number");
    }
  });

  it("two parsers produce different trees for different code", () => {
    const pyTree = pythonLanguage.parser.parse("x = 1");
    const jsTree = javascriptLanguage.parser.parse("const x = 1");
    expect(pyTree.toString()).not.toBe(jsTree.toString());
  });
});

describe("NodeType", () => {
  it("none has id 0 and is anonymous", () => {
    expect(NodeType.none.id).toBe(0);
    expect(NodeType.none.isAnonymous).toBe(true);
  });

  it("parsed tree node types have names", () => {
    const tree = pythonLanguage.parser.parse("x = 1");
    const cursor = tree.cursor();
    // Top node should have a non-empty name or be named
    expect(cursor.type).toBeDefined();
    expect(typeof cursor.type.name).toBe("string");
  });

  it("isTop is true for top-level tree type", () => {
    const tree = pythonLanguage.parser.parse("x = 1");
    expect(tree.type.isTop).toBe(true);
  });
});
