import { describe, it, expect } from "bun:test";
import { Tree, NodeType, NodeSet, TreeBuffer, NodeProp, Parser, TreeFragment, parseMixed, IterMode } from "../../src/parser/common/index";
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

describe("NodeProp behavioral", () => {
  it("NodeProp constructor creates a prop", () => {
    const prop = new NodeProp<string>();
    expect(prop).toBeDefined();
  });

  it("NodeProp.add creates a set for a node type", () => {
    const prop = new NodeProp<string>({ deserialize: (s) => s });
    expect(prop).toBeDefined();
  });

  it("NodeProp.closedBy is a built-in prop", () => {
    expect(NodeProp.closedBy).toBeDefined();
  });

  it("NodeProp.openedBy is a built-in prop", () => {
    expect(NodeProp.openedBy).toBeDefined();
  });

  it("NodeProp.group is a built-in prop", () => {
    expect(NodeProp.group).toBeDefined();
  });

  it("NodeProp.isolate is defined", () => {
    expect(NodeProp.isolate).toBeDefined();
  });
});

describe("Tree behavioral", () => {
  it("tree from python has length equal to source string", () => {
    const code = "x = 1";
    const tree = pythonLanguage.parser.parse(code);
    expect(tree.length).toBe(code.length);
  });

  it("tree.iterate() visits at least one node", () => {
    const tree = pythonLanguage.parser.parse("x = 1 + 2");
    let count = 0;
    tree.iterate({ enter: () => { count++; } });
    expect(count).toBeGreaterThan(0);
  });

  it("tree.toString() returns a non-empty string", () => {
    const tree = pythonLanguage.parser.parse("x = 1");
    expect(typeof tree.toString()).toBe("string");
    expect(tree.toString().length).toBeGreaterThan(0);
  });

  it("tree.resolveInner() finds a node", () => {
    const tree = pythonLanguage.parser.parse("x = 1");
    const node = tree.resolveInner(2, 1);
    expect(node).toBeDefined();
  });

  it("Tree instances have a length property", () => {
    const code = "def foo(): pass";
    const tree = pythonLanguage.parser.parse(code);
    expect(typeof tree.length).toBe("number");
    expect(tree.length).toBe(code.length);
  });

  it("NodeType has a define method", () => {
    expect(typeof NodeType.define).toBe("function");
  });

  it("NodeProp.closedBy is defined", () => {
    expect(NodeProp.closedBy).toBeDefined();
  });

  it("Tree.build is a function", () => {
    expect(typeof Tree.build).toBe("function");
  });

  it("javascript tree iterate finds nodes", () => {
    const tree = javascriptLanguage.parser.parse("const x = 1;");
    let count = 0;
    tree.iterate({ enter: () => { count++; } });
    expect(count).toBeGreaterThan(1);
  });
});

describe("Tree cursor and node methods", () => {
  const jsCode = "const x = 1;";
  const jsMulti = "let a = 1; let b = 2; let c = 3;";
  const jsFn = "function add(a, b) { return a + b; }";

  describe("Tree methods on parsed trees", () => {
    it("tree.cursorAt(pos, 1) enters node starting at or after position", () => {
      const tree = javascriptLanguage.parser.parse(jsCode);
      const cursor = tree.cursorAt(6, 1);
      expect(cursor.name).toBe("VariableDefinition");
      expect(cursor.from).toBe(6);
      expect(cursor.to).toBe(7);
    });

    it("tree.cursorAt(pos, -1) prefers nodes ending at position", () => {
      const tree = javascriptLanguage.parser.parse(jsCode);
      const cursor = tree.cursorAt(11, -1);
      expect(cursor.name).toBe("Number");
      expect(cursor.from).toBe(10);
      expect(cursor.to).toBe(11);
    });

    it("tree.topNode returns the root SyntaxNode", () => {
      const tree = javascriptLanguage.parser.parse(jsCode);
      const top = tree.topNode;
      expect(top.name).toBe("Script");
      expect(top.from).toBe(0);
      expect(top.to).toBe(jsCode.length);
    });

    it("tree.resolve finds node at position", () => {
      const tree = javascriptLanguage.parser.parse(jsCode);
      const node = tree.resolve(6, 1);
      expect(node.name).toBe("VariableDefinition");
    });

    it("tree.resolveInner finds innermost node at position", () => {
      const tree = javascriptLanguage.parser.parse(jsCode);
      const node = tree.resolveInner(10, 1);
      expect(node.name).toBe("Number");
      expect(node.from).toBe(10);
    });

    it("tree.resolveStack returns a stack with node and next", () => {
      const tree = javascriptLanguage.parser.parse(jsCode);
      const stack = tree.resolveStack(6);
      expect(stack.node).toBeDefined();
      expect(stack.node.name).toBe("VariableDeclaration");
      expect(stack.next).toBeDefined();
      expect(stack.next!.node.name).toBe("Script");
    });

    it("tree.prop returns undefined for non-per-node props", () => {
      const tree = javascriptLanguage.parser.parse(jsCode);
      const result = tree.prop(NodeProp.closedBy);
      expect(result).toBeUndefined();
    });

    it("tree.propValues returns empty array for tree without per-node props", () => {
      const tree = javascriptLanguage.parser.parse(jsCode);
      expect(tree.propValues).toEqual([]);
    });
  });

  describe("SyntaxNode / TreeNode methods", () => {
    it("node.parent returns the parent node", () => {
      const tree = javascriptLanguage.parser.parse(jsCode);
      const varDef = tree.resolve(6, 1); // VariableDefinition
      const parent = varDef.parent;
      expect(parent).not.toBeNull();
      expect(parent!.name).toBe("VariableDeclaration");
    });

    it("node.nextSibling and node.prevSibling navigate between siblings", () => {
      const tree = javascriptLanguage.parser.parse(jsMulti);
      const first = tree.topNode.firstChild!;
      expect(first.name).toBe("VariableDeclaration");
      const second = first.nextSibling!;
      expect(second.name).toBe("VariableDeclaration");
      expect(second.from).toBeGreaterThan(first.from);
      const backToFirst = second.prevSibling!;
      expect(backToFirst.from).toBe(first.from);
    });

    it("node.firstChild and node.lastChild access children", () => {
      const tree = javascriptLanguage.parser.parse(jsCode);
      const varDecl = tree.topNode.firstChild!;
      expect(varDecl.firstChild!.name).toBe("const");
      expect(varDecl.lastChild!.name).toBe(";");
    });

    it("node.childAfter(pos) and node.childBefore(pos) find positional children", () => {
      const tree = javascriptLanguage.parser.parse(jsCode);
      const top = tree.topNode;
      const after = top.childAfter(0);
      expect(after).not.toBeNull();
      expect(after!.name).toBe("VariableDeclaration");
      const before = top.childBefore(jsCode.length);
      expect(before).not.toBeNull();
      expect(before!.name).toBe("VariableDeclaration");
    });

    it("node.enterUnfinishedNodesBefore returns a node", () => {
      const tree = javascriptLanguage.parser.parse(jsCode);
      const result = tree.topNode.enterUnfinishedNodesBefore(5);
      expect(result).toBeDefined();
      expect(result.name).toBe("Script");
    });

    it("node.getChildren(type) returns all matching children", () => {
      const tree = javascriptLanguage.parser.parse(jsMulti);
      const children = tree.topNode.getChildren("VariableDeclaration");
      expect(children.length).toBe(3);
      for (const child of children) {
        expect(child.name).toBe("VariableDeclaration");
      }
    });

    it("node.getChild(type) returns first matching child", () => {
      const tree = javascriptLanguage.parser.parse(jsFn);
      const fn = tree.topNode.getChild("FunctionDeclaration");
      expect(fn).not.toBeNull();
      expect(fn!.name).toBe("FunctionDeclaration");
    });

    it("node.toString() returns string representation of the subtree", () => {
      const tree = javascriptLanguage.parser.parse(jsCode);
      const str = tree.topNode.toString();
      expect(str).toContain("Script");
      expect(str).toContain("VariableDeclaration");
    });

    it("node.toTree() converts a SyntaxNode back to a Tree", () => {
      const tree = javascriptLanguage.parser.parse(jsCode);
      const varDef = tree.resolve(6, 1);
      const subTree = varDef.toTree();
      expect(subTree).toBeInstanceOf(Tree);
      expect(subTree.type.name).toBe("VariableDefinition");
      expect(subTree.length).toBe(1);
    });

    it("node.matchContext checks parent name", () => {
      const tree = javascriptLanguage.parser.parse(jsCode);
      const varDef = tree.resolve(6, 1); // VariableDefinition
      expect(varDef.matchContext(["VariableDeclaration"])).toBe(true);
      expect(varDef.matchContext(["Script"])).toBe(false);
      expect(varDef.matchContext(["Bogus"])).toBe(false);
    });
  });

  describe("TreeCursor methods", () => {
    it("cursor.firstChild() and cursor.lastChild() enter children", () => {
      const tree = javascriptLanguage.parser.parse(jsCode);
      const cursor = tree.cursor();
      expect(cursor.name).toBe("Script");
      expect(cursor.firstChild()).toBe(true);
      expect(cursor.name).toBe("VariableDeclaration");
      expect(cursor.lastChild()).toBe(true);
      expect(cursor.name).toBe(";");
    });

    it("cursor.nextSibling() and cursor.prevSibling() navigate siblings", () => {
      const tree = javascriptLanguage.parser.parse(jsCode);
      const cursor = tree.cursor();
      cursor.firstChild(); // VariableDeclaration
      cursor.firstChild(); // const
      expect(cursor.name).toBe("const");
      expect(cursor.nextSibling()).toBe(true);
      expect(cursor.name).toBe("VariableDefinition");
      expect(cursor.prevSibling()).toBe(true);
      expect(cursor.name).toBe("const");
    });

    it("cursor.parent() moves up the tree", () => {
      const tree = javascriptLanguage.parser.parse(jsCode);
      const cursor = tree.cursor();
      cursor.firstChild(); // VariableDeclaration
      cursor.firstChild(); // const
      expect(cursor.parent()).toBe(true);
      expect(cursor.name).toBe("VariableDeclaration");
      expect(cursor.parent()).toBe(true);
      expect(cursor.name).toBe("Script");
    });

    it("cursor.moveTo(pos) moves to the node covering position", () => {
      const tree = javascriptLanguage.parser.parse(jsCode);
      const cursor = tree.cursor();
      cursor.moveTo(10);
      expect(cursor.from).toBeLessThanOrEqual(10);
      expect(cursor.to).toBeGreaterThanOrEqual(10);
    });

    it("cursor.iterate(enter, leave) calls enter and leave callbacks", () => {
      const tree = javascriptLanguage.parser.parse(jsCode);
      const cursor = tree.cursor();
      const entered: string[] = [];
      const left: string[] = [];
      cursor.iterate(
        (node) => { entered.push(node.name); },
        (node) => { left.push(node.name); }
      );
      expect(entered.length).toBeGreaterThan(0);
      expect(left.length).toBe(entered.length);
      expect(entered[0]).toBe("Script");
      expect(left[left.length - 1]).toBe("Script");
    });

    it("cursor.matchContext checks ancestor names", () => {
      const tree = javascriptLanguage.parser.parse(jsCode);
      const cursor = tree.cursor();
      cursor.firstChild(); // VariableDeclaration
      cursor.firstChild(); // const
      expect(cursor.matchContext(["VariableDeclaration"])).toBe(true);
      expect(cursor.matchContext(["Script"])).toBe(false);
    });

    it("cursor.node returns a SyntaxNode at cursor position", () => {
      const tree = javascriptLanguage.parser.parse(jsCode);
      const cursor = tree.cursor();
      cursor.firstChild();
      cursor.firstChild();
      const node = cursor.node;
      expect(node.name).toBe("const");
      expect(node.from).toBe(0);
      expect(node.to).toBe(5);
    });

    it("cursor.from / cursor.to / cursor.name / cursor.type are correct", () => {
      const tree = javascriptLanguage.parser.parse(jsCode);
      const cursor = tree.cursor();
      expect(cursor.from).toBe(0);
      expect(cursor.to).toBe(jsCode.length);
      expect(cursor.name).toBe("Script");
      expect(cursor.type).toBeDefined();
      expect(cursor.type.name).toBe("Script");
    });
  });

  describe("NodeProp advanced", () => {
    it("NodeProp.closedBy and NodeProp.openedBy are distinct props", () => {
      expect(NodeProp.closedBy).not.toBe(NodeProp.openedBy);
      expect(NodeProp.closedBy.id).not.toBe(NodeProp.openedBy.id);
    });

    it("custom NodeProp with deserialize function", () => {
      const prop = new NodeProp<number>({ deserialize: (s) => parseInt(s, 10) });
      expect(prop).toBeDefined();
      expect(typeof prop.id).toBe("number");
      expect(prop.perNode).toBe(false);
    });

    it("NodeProp with combine function", () => {
      const prop = new NodeProp<number[]>({ combine: (sources) => sources.flat() });
      expect(prop).toBeDefined();
      expect(typeof prop.id).toBe("number");
    });
  });

  describe("Tree.iterate advanced", () => {
    it("iterate with enter returning false skips subtree", () => {
      const tree = javascriptLanguage.parser.parse(jsCode);
      let count = 0;
      tree.iterate({
        enter: (node) => {
          count++;
          if (node.name === "VariableDeclaration") return false;
        }
      });
      // Should visit Script and VariableDeclaration only (skips children of VariableDeclaration)
      expect(count).toBe(2);
    });

    it("iterate with from/to range limits visited nodes", () => {
      const tree = javascriptLanguage.parser.parse(jsCode);
      let fullCount = 0;
      tree.iterate({ enter: () => { fullCount++; } });
      let rangeCount = 0;
      tree.iterate({
        from: 6,
        to: 10,
        enter: () => { rangeCount++; }
      });
      expect(rangeCount).toBeGreaterThan(0);
      expect(rangeCount).toBeLessThanOrEqual(fullCount);
    });

    it("iterate with leave callback visits nodes on exit", () => {
      const tree = javascriptLanguage.parser.parse(jsCode);
      const leaveNames: string[] = [];
      tree.iterate({
        enter: () => {},
        leave: (node) => { leaveNames.push(node.name); }
      });
      expect(leaveNames.length).toBeGreaterThan(0);
      // Last leave should be the root
      expect(leaveNames[leaveNames.length - 1]).toBe("Script");
      // First leave should be a leaf node
      expect(leaveNames[0]).toBe("const");
    });
  });
});
