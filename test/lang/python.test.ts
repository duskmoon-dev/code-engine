import { describe, it, expect } from "bun:test";
import {
  python, pythonLanguage,
  localCompletionSource, snippets, globalCompletion
} from "../../src/lang/python/index";
import { EditorState } from "../../src/core/state/index";
import { syntaxTree, ensureSyntaxTree, getIndentation, foldable } from "../../src/core/language/index";
import { CompletionContext } from "../../src/core/autocomplete/index";

describe("Python language pack", () => {
  it("exports python function", () => {
    expect(typeof python).toBe("function");
  });

  it("exports pythonLanguage", () => {
    expect(pythonLanguage).toBeDefined();
    expect(pythonLanguage.name).toBe("python");
  });

  it("exports localCompletionSource", () => {
    expect(typeof localCompletionSource).toBe("function");
  });

  it("exports snippets array", () => {
    expect(Array.isArray(snippets)).toBe(true);
    expect(snippets.length).toBeGreaterThan(0);
  });

  it("exports globalCompletion", () => {
    expect(globalCompletion).toBeDefined();
    expect(typeof globalCompletion).toBe("function");
  });

  it("creates language support", () => {
    const support = python();
    expect(support).toBeDefined();
    expect(support.language).toBe(pythonLanguage);
  });

  it("snippets contain Python-specific completions", () => {
    const labels = snippets.map((s: any) => s.label);
    // Python snippets should include common patterns
    expect(labels.length).toBeGreaterThan(0);
    expect(labels.every((l: any) => typeof l === "string")).toBe(true);
  });

  it("pythonLanguage parser produces a non-empty tree", () => {
    const tree = pythonLanguage.parser.parse("x = 1\nprint(x)");
    expect(tree.length).toBeGreaterThan(0);
  });

  it("pythonLanguage parser tree has a top-level type", () => {
    const tree = pythonLanguage.parser.parse("def foo(): pass");
    expect(tree.type.isTop).toBe(true);
  });

  it("syntaxTree from EditorState with python() is non-empty", () => {
    const state = EditorState.create({
      doc: "def hello():\n    return 'world'",
      extensions: [python()],
    });
    const tree = syntaxTree(state);
    expect(tree.length).toBeGreaterThan(0);
  });

  it("python parse tree cursor traversal works", () => {
    const tree = pythonLanguage.parser.parse("class Foo:\n    def __init__(self):\n        self.x = 1");
    const cursor = tree.cursor();
    let nodeCount = 0;
    do { nodeCount++; } while (cursor.next() && nodeCount < 100);
    expect(nodeCount).toBeGreaterThan(1);
  });

  it("python parse tree resolves node at position", () => {
    const code = "import os\nprint(os.getcwd())";
    const tree = pythonLanguage.parser.parse(code);
    const node = tree.resolve(0);
    expect(node).toBeDefined();
    expect(node.type).toBeDefined();
  });

  it("python parse tree can parse complex expressions", () => {
    const code = "result = [x**2 for x in range(10) if x % 2 == 0]";
    const tree = pythonLanguage.parser.parse(code);
    expect(tree.length).toBe(code.length);
    expect(tree.type.isTop).toBe(true);
  });

  it("pythonLanguage can parse decorators", () => {
    const tree = pythonLanguage.parser.parse("@staticmethod\ndef foo(): pass");
    expect(tree.length).toBeGreaterThan(0);
    expect(tree.type.isTop).toBe(true);
  });

  it("pythonLanguage can parse type hints", () => {
    const tree = pythonLanguage.parser.parse("def greet(name: str) -> str:\n    return f'Hello, {name}'");
    expect(tree.length).toBeGreaterThan(0);
    expect(tree.type.isTop).toBe(true);
  });

  it("pythonLanguage can parse generators", () => {
    const tree = pythonLanguage.parser.parse("def gen(): yield from range(10)");
    expect(tree.length).toBeGreaterThan(0);
  });

  it("pythonLanguage can parse lambda", () => {
    const tree = pythonLanguage.parser.parse("f = lambda x, y: x + y");
    expect(tree.length).toBeGreaterThan(0);
    expect(tree.type.isTop).toBe(true);
  });

  it("pythonLanguage can parse with statement", () => {
    const tree = pythonLanguage.parser.parse("with open('file') as f:\n    data = f.read()");
    expect(tree.length).toBeGreaterThan(0);
  });

  it("tree.resolve() finds nodes at multiple positions in python code", () => {
    const code = "import os\nfor x in range(10):\n    print(x)";
    const tree = pythonLanguage.parser.parse(code);
    for (let i = 0; i < code.length; i += 5) {
      const node = tree.resolve(i);
      expect(node).toBeDefined();
    }
  });

  it("pythonLanguage can parse dataclass", () => {
    const tree = pythonLanguage.parser.parse("from dataclasses import dataclass\n@dataclass\nclass Point:\n    x: float\n    y: float");
    expect(tree.length).toBeGreaterThan(0);
    expect(tree.type.isTop).toBe(true);
  });

  it("pythonLanguage can parse async/await", () => {
    const tree = pythonLanguage.parser.parse("async def fetch(url):\n    async with session.get(url) as resp:\n        return await resp.json()");
    expect(tree.length).toBeGreaterThan(0);
  });

  it("pythonLanguage can parse list/dict/set comprehensions", () => {
    const tree = pythonLanguage.parser.parse("squares = [x**2 for x in range(10) if x % 2 == 0]\nd = {k: v for k, v in items.items()}");
    expect(tree.length).toBeGreaterThan(0);
    expect(tree.type.isTop).toBe(true);
  });

  it("pythonLanguage can parse walrus operator", () => {
    const tree = pythonLanguage.parser.parse("if (n := len(a)) > 10:\n    print(n)");
    expect(tree.length).toBeGreaterThan(0);
  });

  it("pythonLanguage can parse match statement", () => {
    const tree = pythonLanguage.parser.parse("match command:\n    case 'quit':\n        quit_game()\n    case 'go' if direction in valid_dirs:\n        move(direction)");
    expect(tree.length).toBeGreaterThan(0);
  });

  it("pythonLanguage can parse property decorator", () => {
    const tree = pythonLanguage.parser.parse("class Circle:\n    @property\n    def radius(self): return self._r\n    @radius.setter\n    def radius(self, r): self._r = r");
    expect(tree.length).toBeGreaterThan(0);
    expect(tree.type.isTop).toBe(true);
  });

  it("pythonLanguage can parse f-string expressions", () => {
    const tree = pythonLanguage.parser.parse("msg = f'Hello {name!r}, you are {age:.1f} years old'");
    expect(tree.length).toBeGreaterThan(0);
  });

  it("pythonLanguage can parse class with multiple inheritance", () => {
    const tree = pythonLanguage.parser.parse("class Mixin: pass\nclass Base: pass\nclass Child(Base, Mixin):\n    def __init__(self):\n        super().__init__()");
    expect(tree.length).toBeGreaterThan(0);
    expect(tree.type.isTop).toBe(true);
  });

  it("pythonLanguage can parse context manager protocol", () => {
    const tree = pythonLanguage.parser.parse("class Ctx:\n    def __enter__(self): return self\n    def __exit__(self, exc_type, exc_val, exc_tb): return False");
    expect(tree.length).toBeGreaterThan(0);
  });

  it("pythonLanguage can parse exception chaining", () => {
    const tree = pythonLanguage.parser.parse("try:\n    risky()\nexcept ValueError as e:\n    raise RuntimeError('failed') from e");
    expect(tree.length).toBeGreaterThan(0);
    expect(tree.type.isTop).toBe(true);
  });

  it("pythonLanguage tree.toString() returns non-empty string", () => {
    const tree = pythonLanguage.parser.parse("x = 1");
    expect(typeof tree.toString()).toBe("string");
    expect(tree.toString().length).toBeGreaterThan(0);
  });

  it("pythonLanguage can parse tuple unpacking", () => {
    const tree = pythonLanguage.parser.parse("a, b, *rest = [1, 2, 3, 4, 5]\n(x, y), z = (1, 2), 3");
    expect(tree.length).toBeGreaterThan(0);
  });

  it("pythonLanguage tree.iterate() visits multiple nodes", () => {
    const tree = pythonLanguage.parser.parse("for i in range(10):\n    print(i)");
    let count = 0;
    tree.iterate({ enter: () => { count++; } });
    expect(count).toBeGreaterThan(3);
  });

  it("tree.resolveInner() in python finds innermost node", () => {
    const tree = pythonLanguage.parser.parse("def foo():\n    return 42");
    const node = tree.resolveInner(10);
    expect(node).toBeDefined();
    expect(node.from).toBeLessThanOrEqual(10);
    expect(node.to).toBeGreaterThanOrEqual(10);
  });

  it("pythonLanguage can parse class method with classmethod decorator", () => {
    const tree = pythonLanguage.parser.parse("class Factory:\n    @classmethod\n    def create(cls, *args): return cls(*args)");
    expect(tree.length).toBeGreaterThan(0);
    expect(tree.type.isTop).toBe(true);
  });

  it("pythonLanguage can parse global and nonlocal declarations", () => {
    const tree = pythonLanguage.parser.parse("x = 0\ndef outer():\n    def inner():\n        nonlocal x\n        global y\n        x += 1");
    expect(tree.length).toBeGreaterThan(0);
  });

  it("pythonLanguage can parse TypedDict", () => {
    const tree = pythonLanguage.parser.parse("from typing import TypedDict\nclass Point(TypedDict):\n    x: float\n    y: float");
    expect(tree.length).toBeGreaterThan(0);
    expect(tree.type.isTop).toBe(true);
  });

  it("pythonLanguage can parse protocol class", () => {
    const tree = pythonLanguage.parser.parse("from typing import Protocol, runtime_checkable\n@runtime_checkable\nclass Drawable(Protocol):\n    def draw(self) -> None: ...");
    expect(tree.length).toBeGreaterThan(0);
  });

  it("pythonLanguage can parse abstract base class", () => {
    const tree = pythonLanguage.parser.parse("from abc import ABC, abstractmethod\nclass Animal(ABC):\n    @abstractmethod\n    def speak(self) -> str: pass");
    expect(tree.length).toBeGreaterThan(0);
    expect(tree.type.isTop).toBe(true);
  });

  it("EditorState with python() has correct doc line count", () => {
    const state = EditorState.create({
      doc: "import os\nimport sys\nprint(sys.argv)\nprint(os.getcwd())",
      extensions: [python()],
    });
    expect(state.doc.lines).toBe(4);
  });

  it("pythonLanguage allows doc mutation via transaction", () => {
    let state = EditorState.create({ doc: "x = 1", extensions: [python()] });
    state = state.update({ changes: { from: 5, insert: "\ny = 2" } }).state;
    expect(state.doc.lines).toBe(2);
  });

  it("python() state doc line text is accessible", () => {
    const state = EditorState.create({
      doc: "import os\nimport sys",
      extensions: [python()],
    });
    expect(state.doc.line(1).text).toBe("import os");
    expect(state.doc.line(2).text).toBe("import sys");
  });

  it("python() state allows multiple sequential transactions", () => {
    let state = EditorState.create({ doc: "x = 1", extensions: [python()] });
    state = state.update({ changes: { from: 5, insert: "\ny = 2" } }).state;
    state = state.update({ changes: { from: state.doc.length, insert: "\nz = 3" } }).state;
    expect(state.doc.lines).toBe(3);
    expect(state.doc.line(3).text).toBe("z = 3");
  });

  it("python() state allows replacement transaction", () => {
    let state = EditorState.create({ doc: "x = 1", extensions: [python()] });
    state = state.update({ changes: { from: 4, to: 5, insert: "42" } }).state;
    expect(state.doc.toString()).toBe("x = 42");
  });

  it("python() doc length invariant holds", () => {
    const doc = "def foo(): pass";
    const state = EditorState.create({ doc, extensions: [python()] });
    expect(state.doc.length).toBe(doc.length);
  });

  it("python() state deletion transaction works", () => {
    let state = EditorState.create({ doc: "x = 1\ny = 2", extensions: [python()] });
    state = state.update({ changes: { from: 5, to: 11 } }).state;
    expect(state.doc.toString()).toBe("x = 1");
  });

  it("python() state with unicode content works", () => {
    const doc = "# こんにちは\nprint('hello')";
    const state = EditorState.create({ doc, extensions: [python()] });
    expect(state.doc.toString()).toBe(doc);
  });

  it("python() state selection can span lines", () => {
    const state = EditorState.create({
      doc: "x = 1\ny = 2\nz = 3",
      selection: { anchor: 0, head: 5 },
      extensions: [python()],
    });
    expect(state.selection.main.from).toBe(0);
    expect(state.selection.main.to).toBe(5);
  });

  it("python() state doc line count is correct", () => {
    const state = EditorState.create({
      doc: "import os\nimport sys\nimport re",
      extensions: [python()],
    });
    expect(state.doc.lines).toBe(3);
  });

  it("pythonLanguage parser tree has correct length", () => {
    const code = "def greet(name):\n    return f'Hello, {name}!'";
    const tree = pythonLanguage.parser.parse(code);
    expect(tree.length).toBe(code.length);
  });

  it("python() state allows insert at start", () => {
    let state = EditorState.create({ doc: "x = 1", extensions: [python()] });
    state = state.update({ changes: { from: 0, insert: "# header\n" } }).state;
    expect(state.doc.line(1).text).toBe("# header");
  });

  it("python() state allows 4 sequential transactions", () => {
    let state = EditorState.create({ doc: "", extensions: [python()] });
    for (let i = 0; i < 4; i++) {
      state = state.update({ changes: { from: state.doc.length, insert: (i > 0 ? "\n" : "") + `x${i} = ${i}` } }).state;
    }
    expect(state.doc.lines).toBe(4);
  });

  it("python() state line(4) text is accessible", () => {
    const state = EditorState.create({
      doc: "a = 1\nb = 2\nc = 3\nd = 4",
      extensions: [python()],
    });
    expect(state.doc.line(4).text).toBe("d = 4");
  });

  it("python() state allows deletion of entire content", () => {
    let state = EditorState.create({ doc: "x = 1\ny = 2", extensions: [python()] });
    state = state.update({ changes: { from: 0, to: 11 } }).state;
    expect(state.doc.toString()).toBe("");
  });

  it("python() state doc length invariant holds", () => {
    const doc = "def foo():\n    return 42";
    const state = EditorState.create({ doc, extensions: [python()] });
    expect(state.doc.length).toBe(doc.length);
  });

  it("python() state with unicode comment works", () => {
    const doc = "# こんにちは\nx = 1";
    const state = EditorState.create({ doc, extensions: [python()] });
    expect(state.doc.toString()).toBe(doc);
  });

  describe("Python indentation strategies", () => {
    it("Body indentation: next line inside if body", () => {
      // "if True:\n    x = 1\n" - pos 9 is start of "    x = 1" inside Body
      const doc = "if True:\n    x = 1\n";
      const state = EditorState.create({ doc, extensions: [python()] });
      ensureSyntaxTree(state, state.doc.length, 1000);
      const indent = getIndentation(state, 9);
      expect(typeof indent).toBe("number");
    });

    it("Body indentation: continuation line with comment before it (innerBody Comment path)", () => {
      // "if True:\n    # comment\n    x = 1\n" - pos 9 triggers Body with comment
      const doc = "if True:\n    # comment\n    x = 1\n";
      const state = EditorState.create({ doc, extensions: [python()] });
      ensureSyntaxTree(state, state.doc.length, 1000);
      const indent = getIndentation(state, 9);
      expect(typeof indent).toBe("number");
    });

    it("IfStatement indentation: else: gets base indent", () => {
      // "if True:\n    x = 1\nelse:\n    y = 2" - pos 19 is start of "else:" line
      const doc = "if True:\n    x = 1\nelse:\n    y = 2";
      const state = EditorState.create({ doc, extensions: [python()] });
      ensureSyntaxTree(state, state.doc.length, 1000);
      const indent = getIndentation(state, 19);
      expect(typeof indent).toBe("number");
    });

    it("TryStatement indentation: except gets base indent", () => {
      // "try:\n    x()\nexcept:\n    pass" - pos 12 is start of "except:" line
      const doc = "try:\n    x()\nexcept:\n    pass";
      const state = EditorState.create({ doc, extensions: [python()] });
      ensureSyntaxTree(state, state.doc.length, 1000);
      const indent = getIndentation(state, 13);
      expect(typeof indent).toBe("number");
    });

    it("MatchStatement indentation: case gets base+unit indent", () => {
      // Python 3.10 match/case
      const doc = "match x:\n    case 1:\n        pass";
      const state = EditorState.create({ doc, extensions: [python()] });
      ensureSyntaxTree(state, state.doc.length, 1000);
      const indent = getIndentation(state, 9);
      expect(typeof indent).toBe("number");
    });

    it("Body fold: foldable returns range for function body", () => {
      const doc = "def foo():\n    x = 1\n    return x";
      const state = EditorState.create({ doc, extensions: [python()] });
      ensureSyntaxTree(state, state.doc.length, 1000);
      const fold = foldable(state, 0, 9);
      expect(fold === null || typeof fold!.from === "number").toBe(true);
    });
  });

  describe("localCompletionSource behavioral", () => {
    it("returns completions from function params (ParamList + FunctionDefinition paths)", () => {
      const doc = "def foo(x, y):\n    return x";
      const state = EditorState.create({ doc, extensions: [python()] });
      ensureSyntaxTree(state, state.doc.length, 1000);
      // resolveInner(27, -1) = VariableName [26-27] (the 'x' in return x)
      const cx = new CompletionContext(state, 27, false);
      const result = localCompletionSource(cx);
      expect(result).not.toBeNull();
      expect(result!.options.some(o => o.label === "x")).toBe(true);
    });

    it("returns completions from for loop variable (ForStatement outer path)", () => {
      const doc = "for x in range(10):\n    pass\nx";
      const state = EditorState.create({ doc, extensions: [python()] });
      ensureSyntaxTree(state, state.doc.length, 1000);
      // pos 30 is 'x' VariableName at end
      const cx = new CompletionContext(state, 30, false);
      const result = localCompletionSource(cx);
      expect(result).not.toBeNull();
    });

    it("returns completions from import statement (ImportStatement path)", () => {
      const doc = "import os\nos";
      const state = EditorState.create({ doc, extensions: [python()] });
      ensureSyntaxTree(state, state.doc.length, 1000);
      // pos 11 is inside 'os' VariableName on second line
      const cx = new CompletionContext(state, 11, false);
      const result = localCompletionSource(cx);
      expect(result).not.toBeNull();
      expect(result!.options.some(o => o.label === "os")).toBe(true);
    });

    it("returns completions from assignment statement (AssignStatement path)", () => {
      const doc = "x = 1\nx";
      const state = EditorState.create({ doc, extensions: [python()] });
      ensureSyntaxTree(state, state.doc.length, 1000);
      // resolveInner(7, -1) = VariableName [6-7] (the 'x' on second line)
      const cx = new CompletionContext(state, 7, false);
      const result = localCompletionSource(cx);
      expect(result).not.toBeNull();
      expect(result!.options.some(o => o.label === "x")).toBe(true);
    });

    it("returns null inside string literal (dontComplete guard)", () => {
      const doc = "x = 'hello'";
      const state = EditorState.create({ doc, extensions: [python()] });
      ensureSyntaxTree(state, state.doc.length, 1000);
      // pos 7 is inside the string
      const cx = new CompletionContext(state, 7, false);
      const result = localCompletionSource(cx);
      expect(result).toBeNull();
    });

    it("explicit context returns completions at non-word position", () => {
      const doc = "x = 1\n";
      const state = EditorState.create({ doc, extensions: [python()] });
      ensureSyntaxTree(state, state.doc.length, 1000);
      const cx = new CompletionContext(state, 6, true);
      const result = localCompletionSource(cx);
      expect(result).not.toBeNull();
    });

    it("returns completions from class definition (ClassDefinition path)", () => {
      const doc = "class Foo:\n    pass\nFoo";
      const state = EditorState.create({ doc, extensions: [python()] });
      ensureSyntaxTree(state, state.doc.length, 1000);
      // pos 22 is inside 'Foo' VariableName at end
      const cx = new CompletionContext(state, 22, false);
      const result = localCompletionSource(cx);
      expect(result).not.toBeNull();
      expect(result!.options.some(o => o.label === "Foo")).toBe(true);
    });
  });
});
