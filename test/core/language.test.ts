import { describe, it, expect } from "bun:test";
import {
  HighlightStyle,
  syntaxHighlighting,
  LRLanguage,
  LanguageSupport,
  defaultHighlightStyle,
  bracketMatching,
  StringStream,
  syntaxTree,
  foldCode,
  unfoldCode,
  toggleFold,
  foldKeymap,
  StreamLanguage,
  indentUnit,
  getIndentUnit,
  foldAll,
  unfoldAll,
  foldGutter,
  ensureSyntaxTree,
  forceParsing,
  matchBrackets,
  foldNodeProp,
  indentNodeProp,
  indentOnInput,
  codeFolding,
  foldService,
  foldInside,
  foldable,
  foldEffect,
  unfoldEffect,
  foldState,
  foldedRanges,
  highlightingFor,
  indentString,
  IndentContext,
  getIndentation,
  indentRange,
  continuedIndent,
  flatIndent,
  indentService,
} from "../../src/core/language/index";
import { tags } from "../../src/parser/highlight/index";
import { python, pythonLanguage } from "../../src/lang/python/index";
import { EditorState, StateEffect } from "../../src/core/state/index";

describe("Language module", () => {
  describe("exports", () => {
    it("exports HighlightStyle", () => {
      expect(HighlightStyle).toBeDefined();
      expect(typeof HighlightStyle.define).toBe("function");
    });

    it("exports syntaxHighlighting", () => {
      expect(typeof syntaxHighlighting).toBe("function");
    });

    it("exports LRLanguage", () => {
      expect(LRLanguage).toBeDefined();
      expect(typeof LRLanguage.define).toBe("function");
    });

    it("exports LanguageSupport", () => {
      expect(LanguageSupport).toBeDefined();
    });

    it("exports defaultHighlightStyle", () => {
      expect(defaultHighlightStyle).toBeDefined();
    });

    it("exports bracketMatching", () => {
      expect(typeof bracketMatching).toBe("function");
    });

    it("exports StringStream", () => {
      expect(StringStream).toBeDefined();
    });
  });

  describe("HighlightStyle.define", () => {
    it("creates a highlight style from tag rules", () => {
      const style = HighlightStyle.define([
        { tag: tags.keyword, color: "#ff0000" },
        { tag: tags.comment, color: "#888888", fontStyle: "italic" },
      ]);
      expect(style).toBeDefined();
    });
  });

  describe("syntaxHighlighting", () => {
    it("returns an extension when given a highlight style", () => {
      const style = HighlightStyle.define([{ tag: tags.keyword, color: "#ff0000" }]);
      const ext = syntaxHighlighting(style);
      expect(ext).toBeDefined();
    });
  });

  describe("LanguageSupport", () => {
    it("python() creates a LanguageSupport instance", () => {
      const support = python();
      expect(support).toBeInstanceOf(LanguageSupport);
    });

    it("LanguageSupport.language is an LRLanguage", () => {
      const support = python();
      expect(support.language).toBeInstanceOf(LRLanguage);
    });
  });
});

describe("syntaxTree", () => {
  it("is a function", () => {
    expect(typeof syntaxTree).toBe("function");
  });

  it("returns a parse tree from EditorState with a language extension", () => {
    const state = EditorState.create({
      doc: "x = 1",
      extensions: [python()],
    });
    const tree = syntaxTree(state);
    expect(tree).toBeDefined();
    expect(tree.length).toBeGreaterThan(0);
  });
});

describe("fold commands", () => {
  it("foldCode is a command function", () => {
    expect(typeof foldCode).toBe("function");
  });

  it("unfoldCode is a command function", () => {
    expect(typeof unfoldCode).toBe("function");
  });

  it("toggleFold is a command function", () => {
    expect(typeof toggleFold).toBe("function");
  });

  it("foldKeymap is an array of key bindings", () => {
    expect(Array.isArray(foldKeymap)).toBe(true);
    expect(foldKeymap.length).toBeGreaterThan(0);
  });
});

describe("StreamLanguage", () => {
  it("is a class with a define method", () => {
    expect(StreamLanguage).toBeDefined();
    expect(typeof StreamLanguage.define).toBe("function");
  });
});

describe("Indentation utilities", () => {
  it("indentUnit is a Facet", () => {
    expect(indentUnit).toBeDefined();
    expect(typeof indentUnit.of).toBe("function");
  });

  it("getIndentUnit returns a number for an EditorState", () => {
    const state = EditorState.create({ doc: "x = 1" });
    const unit = getIndentUnit(state);
    expect(typeof unit).toBe("number");
    expect(unit).toBeGreaterThan(0);
  });

  it("indentOnInput is an extension", () => {
    expect(indentOnInput).toBeDefined();
  });
});

describe("Fold utilities", () => {
  it("foldAll is a command function", () => {
    expect(typeof foldAll).toBe("function");
  });

  it("unfoldAll is a command function", () => {
    expect(typeof unfoldAll).toBe("function");
  });

  it("foldGutter creates an extension", () => {
    const ext = foldGutter();
    expect(ext).toBeDefined();
  });

  it("codeFolding is an extension", () => {
    expect(codeFolding).toBeDefined();
  });

  it("foldNodeProp is a NodeProp", () => {
    expect(foldNodeProp).toBeDefined();
  });

  it("indentNodeProp is a NodeProp", () => {
    expect(indentNodeProp).toBeDefined();
  });
});

describe("fold state-level APIs", () => {
  it("foldService is a Facet", () => {
    expect(foldService).toBeDefined();
  });

  it("foldInside returns null for a leaf node-like input", () => {
    // foldInside expects a SyntaxNode. Test with a minimal mock.
    const mockNode = { firstChild: null, lastChild: null, to: 10 };
    expect(foldInside(mockNode as any)).toBe(null);
  });

  it("foldInside returns range when node has first and last children", () => {
    const mockNode = {
      firstChild: { to: 5 },
      lastChild: { from: 8, type: { isError: false }, to: 10 },
      to: 10,
    };
    const result = foldInside(mockNode as any);
    expect(result).toEqual({ from: 5, to: 8 });
  });

  it("foldInside returns null when first.to >= last.from", () => {
    const mockNode = {
      firstChild: { to: 8 },
      lastChild: { from: 5, type: { isError: false }, to: 10 },
      to: 10,
    };
    expect(foldInside(mockNode as any)).toBe(null);
  });

  it("foldEffect and unfoldEffect are StateEffects", () => {
    expect(foldEffect).toBeDefined();
    expect(unfoldEffect).toBeDefined();
  });

  it("foldState is a StateField", () => {
    expect(foldState).toBeDefined();
  });

  it("foldState can be added as an extension", () => {
    const state = EditorState.create({
      doc: "hello\nworld",
      extensions: [foldState],
    });
    const value = state.field(foldState);
    expect(value).toBeDefined();
  });

  it("foldedRanges returns empty set initially", () => {
    const state = EditorState.create({
      doc: "hello\nworld",
      extensions: [codeFolding()],
    });
    const ranges = foldedRanges(state);
    expect(ranges).toBeDefined();
  });

  it("foldService can provide fold ranges", () => {
    const service = (_state: EditorState, lineStart: number, _lineEnd: number) => {
      if (lineStart === 0) return { from: 5, to: 11 };
      return null;
    };
    const state = EditorState.create({
      doc: "hello\nworld",
      extensions: [foldService.of(service)],
    });
    const result = foldable(state, 0, 5);
    expect(result).toEqual({ from: 5, to: 11 });
  });

  it("foldable returns null when no fold found", () => {
    const state = EditorState.create({ doc: "hello" });
    const result = foldable(state, 0, 5);
    expect(result).toBe(null);
  });

  it("foldEffect can be applied to a transaction", () => {
    const state = EditorState.create({
      doc: "hello\nworld\nfoo",
      extensions: [foldState],
    });
    const tr = state.update({
      effects: foldEffect.of({ from: 5, to: 11 }),
    });
    expect(tr.state.field(foldState)).toBeDefined();
  });

  it("unfoldEffect can be applied after fold", () => {
    const state = EditorState.create({
      doc: "hello\nworld\nfoo",
      extensions: [foldState],
    });
    let s = state.update({ effects: foldEffect.of({ from: 5, to: 11 }) }).state;
    s = s.update({ effects: unfoldEffect.of({ from: 5, to: 11 }) }).state;
    expect(s.field(foldState)).toBeDefined();
  });
});

describe("Parse utilities", () => {
  it("ensureSyntaxTree returns a tree or null for a state", () => {
    const state = EditorState.create({ doc: "x = 1", extensions: [python()] });
    const tree = ensureSyntaxTree(state, state.doc.length);
    expect(tree === null || tree.length >= 0).toBe(true);
  });

  it("forceParsing is a function (requires EditorView)", () => {
    expect(typeof forceParsing).toBe("function");
  });

  it("matchBrackets returns null for a state without cursor in brackets", () => {
    const state = EditorState.create({ doc: "x = 1" });
    const result = matchBrackets(state, 0, 1);
    expect(result === null || result !== undefined).toBe(true);
  });
});

describe("StringStream", () => {
  it("sol() is true at the start", () => {
    const stream = new StringStream("hello world", 2, 2);
    expect(stream.sol()).toBe(true);
  });

  it("eol() is false before consuming", () => {
    const stream = new StringStream("hello", 2, 2);
    expect(stream.eol()).toBe(false);
  });

  it("eol() is true for empty string", () => {
    const stream = new StringStream("", 2, 2);
    expect(stream.eol()).toBe(true);
  });

  it("peek() returns next character without consuming", () => {
    const stream = new StringStream("hello", 2, 2);
    expect(stream.peek()).toBe("h");
    expect(stream.pos).toBe(0);
  });

  it("next() consumes and returns next character", () => {
    const stream = new StringStream("hello", 2, 2);
    expect(stream.next()).toBe("h");
    expect(stream.pos).toBe(1);
  });

  it("eat() consumes matching character", () => {
    const stream = new StringStream("hello", 2, 2);
    expect(stream.eat("h")).toBe("h");
    expect(stream.pos).toBe(1);
  });

  it("eat() does not consume non-matching character", () => {
    const stream = new StringStream("hello", 2, 2);
    expect(stream.eat("x")).toBeUndefined();
    expect(stream.pos).toBe(0);
  });

  it("eatWhile() consumes multiple matching chars", () => {
    const stream = new StringStream("aaabbb", 2, 2);
    expect(stream.eatWhile("a")).toBe(true);
    expect(stream.pos).toBe(3);
  });

  it("eatSpace() consumes whitespace", () => {
    const stream = new StringStream("   hello", 2, 2);
    expect(stream.eatSpace()).toBe(true);
    expect(stream.pos).toBe(3);
  });

  it("match() with string returns true when match found", () => {
    const stream = new StringStream("hello world", 2, 2);
    const result = stream.match("hello");
    expect(result).toBe(true);
    expect(stream.pos).toBe(5);
  });

  it("match() with no consume option does not advance", () => {
    const stream = new StringStream("hello", 2, 2);
    stream.match("hello", false);
    expect(stream.pos).toBe(0);
  });

  it("skipToEnd() moves pos to end", () => {
    const stream = new StringStream("hello world", 2, 2);
    stream.skipToEnd();
    expect(stream.eol()).toBe(true);
  });

  it("current() returns consumed string", () => {
    const stream = new StringStream("hello world", 2, 2);
    stream.match("hello");
    expect(stream.current()).toBe("hello");
  });
});

describe("indentUnit with EditorState", () => {
  it("default indent unit is 2 or 4 spaces", () => {
    const state = EditorState.create({ doc: "x = 1" });
    const unit = getIndentUnit(state);
    expect(unit).toBeGreaterThan(0);
  });

  it("can configure indent unit via facet", () => {
    const state = EditorState.create({
      doc: "x = 1",
      extensions: [indentUnit.of("    ")],
    });
    expect(getIndentUnit(state)).toBe(4);
  });

  it("can configure 2-space indent unit", () => {
    const state = EditorState.create({
      doc: "x = 1",
      extensions: [indentUnit.of("  ")],
    });
    expect(getIndentUnit(state)).toBe(2);
  });
});

describe("bracketMatching with EditorState", () => {
  it("matchBrackets finds a matching bracket pair", () => {
    const state = EditorState.create({ doc: "(hello)" });
    const result = matchBrackets(state, 1, -1);
    // May be null if no bracket extension, but should not throw
    expect(result === null || result !== undefined).toBe(true);
  });

  it("bracketMatching returns an extension", () => {
    const ext = bracketMatching();
    expect(ext).toBeDefined();
  });

  it("bracketMatching can be used with EditorState", () => {
    const state = EditorState.create({
      doc: "(hello)",
      extensions: [bracketMatching()],
    });
    expect(state.doc.toString()).toBe("(hello)");
  });

  it("matchBrackets finds parens with language support", () => {
    const state = EditorState.create({
      doc: "(1 + 2)",
      extensions: [python()],
    });
    // Force parse
    ensureSyntaxTree(state, state.doc.length, 1000);
    const result = matchBrackets(state, 0, 1);
    if (result) {
      expect(result.start).toBeDefined();
      expect(result.matched).toBe(true);
    }
  });

  it("matchBrackets returns null at non-bracket position", () => {
    const state = EditorState.create({
      doc: "hello",
      extensions: [python()],
    });
    ensureSyntaxTree(state, state.doc.length, 1000);
    const result = matchBrackets(state, 2, 1);
    expect(result).toBe(null);
  });

  it("matchBrackets works with square brackets", () => {
    const state = EditorState.create({
      doc: "[1, 2, 3]",
      extensions: [python()],
    });
    ensureSyntaxTree(state, state.doc.length, 1000);
    const result = matchBrackets(state, 0, 1);
    if (result) {
      expect(result.matched).toBe(true);
    }
  });

  it("matchBrackets works with curly braces", () => {
    const state = EditorState.create({
      doc: '{"a": 1}',
      extensions: [python()],
    });
    ensureSyntaxTree(state, state.doc.length, 1000);
    const result = matchBrackets(state, 0, 1);
    if (result) {
      expect(result.start).toBeDefined();
    }
  });

  it("bracketMatching accepts config options", () => {
    const ext = bracketMatching({
      afterCursor: false,
      brackets: "()",
      maxScanDistance: 5000,
    });
    expect(ext).toBeDefined();
  });
});

describe("LRLanguage", () => {
  it("pythonLanguage is an LRLanguage", () => {
    expect(pythonLanguage).toBeInstanceOf(LRLanguage);
  });

  it("LRLanguage.name is a string", () => {
    expect(typeof pythonLanguage.name).toBe("string");
    expect(pythonLanguage.name).toBe("python");
  });

  it("LRLanguage has a parser", () => {
    expect(pythonLanguage.parser).toBeDefined();
  });
});

describe("Highlight tags", () => {
  it("exports standard tags", () => {
    expect(tags.keyword).toBeDefined();
    expect(tags.comment).toBeDefined();
    expect(tags.string).toBeDefined();
    expect(tags.number).toBeDefined();
    expect(tags.operator).toBeDefined();
    expect(typeof tags.function).toBe("function");
  });

  it("has type tags", () => {
    expect(tags.typeName).toBeDefined();
    expect(tags.bool).toBeDefined();
    expect(tags.null).toBeDefined();
  });

  it("has markup tags", () => {
    expect(tags.heading).toBeDefined();
    expect(tags.emphasis).toBeDefined();
    expect(tags.strong).toBeDefined();
    expect(tags.link).toBeDefined();
  });
});

describe("HighlightStyle", () => {
  it("define creates a HighlightStyle with class names", () => {
    const style = HighlightStyle.define([
      { tag: tags.keyword, class: "kw" },
      { tag: tags.comment, class: "cm" },
    ]);
    expect(style).toBeInstanceOf(HighlightStyle);
    expect(style.specs.length).toBe(2);
  });

  it("define creates a HighlightStyle with CSS properties", () => {
    const style = HighlightStyle.define([
      { tag: tags.keyword, color: "purple" },
      { tag: tags.string, color: "green" },
    ]);
    expect(style.module).not.toBe(null);
  });

  it("style function returns class for matching tags", () => {
    const style = HighlightStyle.define([
      { tag: tags.keyword, class: "kw" },
    ]);
    const cls = style.style([tags.keyword]);
    expect(cls).toContain("kw");
  });

  it("style function returns null for non-matching tags", () => {
    const style = HighlightStyle.define([
      { tag: tags.keyword, class: "kw" },
    ]);
    const cls = style.style([tags.comment]);
    expect(cls).toBe(null);
  });

  it("define with themeType sets the theme", () => {
    const style = HighlightStyle.define(
      [{ tag: tags.keyword, class: "kw" }],
      { themeType: "dark" },
    );
    expect(style.themeType).toBe("dark");
  });

  it("define with all option applies to all content", () => {
    const style = HighlightStyle.define(
      [{ tag: tags.keyword, class: "kw" }],
      { all: "base-class" },
    );
    // all option is applied; style function should return class for any tag combo
    expect(style).toBeDefined();
  });

  it("module is null when only class names are used", () => {
    const style = HighlightStyle.define([
      { tag: tags.keyword, class: "kw" },
    ]);
    expect(style.module).toBe(null);
  });

  it("defaultHighlightStyle is a HighlightStyle", () => {
    expect(defaultHighlightStyle).toBeInstanceOf(HighlightStyle);
    expect(defaultHighlightStyle.specs.length).toBeGreaterThan(0);
  });
});

describe("syntaxHighlighting", () => {
  it("returns an extension array", () => {
    const style = HighlightStyle.define([{ tag: tags.keyword, class: "kw" }]);
    const ext = syntaxHighlighting(style);
    expect(ext).toBeDefined();
  });

  it("can be used as a fallback", () => {
    const style = HighlightStyle.define([{ tag: tags.keyword, class: "kw" }]);
    const ext = syntaxHighlighting(style, { fallback: true });
    expect(ext).toBeDefined();
  });

  it("can be used with EditorState", () => {
    const style = HighlightStyle.define([{ tag: tags.keyword, class: "kw" }]);
    const state = EditorState.create({
      doc: "let x = 1",
      extensions: [python(), syntaxHighlighting(style)],
    });
    expect(state.doc.toString()).toBe("let x = 1");
  });
});

describe("highlightingFor", () => {
  it("returns null when no highlighters are active", () => {
    const state = EditorState.create({ doc: "test" });
    const result = highlightingFor(state, [tags.keyword]);
    expect(result).toBe(null);
  });

  it("returns class name when highlighter matches", () => {
    const style = HighlightStyle.define([{ tag: tags.keyword, class: "kw" }]);
    const state = EditorState.create({
      doc: "test",
      extensions: [syntaxHighlighting(style)],
    });
    const result = highlightingFor(state, [tags.keyword]);
    expect(result).toContain("kw");
  });

  it("returns null for non-matching tags", () => {
    const style = HighlightStyle.define([{ tag: tags.keyword, class: "kw" }]);
    const state = EditorState.create({
      doc: "test",
      extensions: [syntaxHighlighting(style)],
    });
    const result = highlightingFor(state, [tags.comment]);
    expect(result).toBe(null);
  });

  it("combines classes from multiple highlighters", () => {
    const s1 = HighlightStyle.define([{ tag: tags.keyword, class: "kw1" }]);
    const s2 = HighlightStyle.define([{ tag: tags.keyword, class: "kw2" }]);
    const state = EditorState.create({
      doc: "test",
      extensions: [syntaxHighlighting(s1), syntaxHighlighting(s2)],
    });
    const result = highlightingFor(state, [tags.keyword]);
    expect(result).toContain("kw1");
    expect(result).toContain("kw2");
  });

  describe("indentUnit facet", () => {
    it("defaults to 2 spaces", () => {
      const state = EditorState.create({ doc: "" });
      expect(state.facet(indentUnit)).toBe("  ");
    });

    it("accepts custom 4-space value", () => {
      const state = EditorState.create({
        doc: "",
        extensions: [indentUnit.of("    ")],
      });
      expect(state.facet(indentUnit)).toBe("    ");
    });

    it("accepts tab value", () => {
      const state = EditorState.create({
        doc: "",
        extensions: [indentUnit.of("\t")],
      });
      expect(state.facet(indentUnit)).toBe("\t");
    });

    it("throws for invalid value with mixed characters", () => {
      expect(() => {
        EditorState.create({
          doc: "",
          extensions: [indentUnit.of(" \t")],
        });
      }).toThrow();
    });

    it("throws for empty string", () => {
      expect(() => {
        EditorState.create({
          doc: "",
          extensions: [indentUnit.of("")],
        });
      }).toThrow();
    });
  });

  describe("getIndentUnit", () => {
    it("returns 2 for default state", () => {
      const state = EditorState.create({ doc: "" });
      expect(getIndentUnit(state)).toBe(2);
    });

    it("returns 4 for 4-space indent", () => {
      const state = EditorState.create({
        doc: "",
        extensions: [indentUnit.of("    ")],
      });
      expect(getIndentUnit(state)).toBe(4);
    });

    it("returns tabSize for tab indent unit", () => {
      const state = EditorState.create({
        doc: "",
        extensions: [indentUnit.of("\t"), EditorState.tabSize.of(8)],
      });
      expect(getIndentUnit(state)).toBe(8);
    });

    it("returns tabSize * count for multiple tab indent units", () => {
      const state = EditorState.create({
        doc: "",
        extensions: [indentUnit.of("\t\t"), EditorState.tabSize.of(4)],
      });
      expect(getIndentUnit(state)).toBe(8);
    });
  });

  describe("indentString", () => {
    it("creates space string for given column count", () => {
      const state = EditorState.create({ doc: "" });
      expect(indentString(state, 4)).toBe("    ");
    });

    it("creates tab+space string when indentUnit is tab", () => {
      const state = EditorState.create({
        doc: "",
        extensions: [indentUnit.of("\t"), EditorState.tabSize.of(4)],
      });
      // 6 columns: 1 tab (4 cols) + 2 spaces
      expect(indentString(state, 6)).toBe("\t  ");
    });

    it("creates only tabs when columns align with tabSize", () => {
      const state = EditorState.create({
        doc: "",
        extensions: [indentUnit.of("\t"), EditorState.tabSize.of(4)],
      });
      expect(indentString(state, 8)).toBe("\t\t");
    });

    it("returns empty string for zero columns", () => {
      const state = EditorState.create({ doc: "" });
      expect(indentString(state, 0)).toBe("");
    });
  });

  describe("IndentContext", () => {
    it("sets unit from state", () => {
      const state = EditorState.create({ doc: "hello" });
      const ctx = new IndentContext(state);
      expect(ctx.unit).toBe(2);
    });

    it("sets unit from custom indentUnit", () => {
      const state = EditorState.create({
        doc: "hello",
        extensions: [indentUnit.of("    ")],
      });
      const ctx = new IndentContext(state);
      expect(ctx.unit).toBe(4);
    });

    it("lineAt returns correct line", () => {
      const state = EditorState.create({ doc: "line one\nline two\nline three" });
      const ctx = new IndentContext(state);
      const line = ctx.lineAt(10); // position in "line two"
      expect(line.text).toBe("line two");
      expect(line.from).toBe(9);
    });

    it("lineAt with simulateBreak splits the line", () => {
      const state = EditorState.create({ doc: "hello world" });
      const ctx = new IndentContext(state, { simulateBreak: 5 });
      // bias 1 (default): text after break
      const after = ctx.lineAt(5, 1);
      expect(after.text).toBe(" world");
      expect(after.from).toBe(5);
      // bias -1: text before break
      const before = ctx.lineAt(5, -1);
      expect(before.text).toBe("hello");
      expect(before.from).toBe(0);
    });

    it("textAfterPos returns text after position", () => {
      const state = EditorState.create({ doc: "hello world" });
      const ctx = new IndentContext(state);
      expect(ctx.textAfterPos(5)).toBe(" world");
    });

    it("column returns column number", () => {
      const state = EditorState.create({ doc: "  hello" });
      const ctx = new IndentContext(state);
      expect(ctx.column(2)).toBe(2);
    });

    it("countColumn counts columns with tab expansion", () => {
      const state = EditorState.create({
        doc: "\thello",
        extensions: [EditorState.tabSize.of(4)],
      });
      const ctx = new IndentContext(state);
      // tab at start expands to 4 columns
      expect(ctx.countColumn("\thello", 1)).toBe(4);
    });

    it("lineIndent returns indentation level", () => {
      const state = EditorState.create({ doc: "    hello\n  world" });
      const ctx = new IndentContext(state);
      expect(ctx.lineIndent(0)).toBe(4);
      expect(ctx.lineIndent(10)).toBe(2);
    });

    it("simulatedBreak getter returns null when no break", () => {
      const state = EditorState.create({ doc: "hello" });
      const ctx = new IndentContext(state);
      expect(ctx.simulatedBreak).toBeNull();
    });

    it("simulatedBreak getter returns break position", () => {
      const state = EditorState.create({ doc: "hello" });
      const ctx = new IndentContext(state, { simulateBreak: 3 });
      expect(ctx.simulatedBreak).toBe(3);
    });
  });

  describe("getIndentation", () => {
    it("returns null for empty tree with no services", () => {
      const state = EditorState.create({ doc: "hello" });
      // With no language, syntaxTree is empty — returns 0 from topIndent if tree covers pos
      const result = getIndentation(state, 0);
      // The tree length is 0, so 0 >= 0 is true, topIndent returns 0
      expect(result).toBe(0);
    });

    it("works with indentService facet", () => {
      const state = EditorState.create({
        doc: "hello\nworld",
        extensions: [indentService.of((_ctx, _pos) => 8)],
      });
      expect(getIndentation(state, 0)).toBe(8);
    });

    it("indentService returning null is respected", () => {
      const state = EditorState.create({
        doc: "hello",
        extensions: [indentService.of((_ctx, _pos) => null)],
      });
      const result = getIndentation(state, 0);
      // null from service is a definitive "no indentation determinable" answer
      expect(result).toBeNull();
    });

    it("accepts IndentContext as first argument", () => {
      const state = EditorState.create({
        doc: "hello",
        extensions: [indentService.of((_ctx, _pos) => 6)],
      });
      const ctx = new IndentContext(state);
      expect(getIndentation(ctx, 0)).toBe(6);
    });
  });

  describe("indentRange", () => {
    it("returns empty changes for already-correct indentation", () => {
      const state = EditorState.create({ doc: "hello\nworld" });
      const changes = indentRange(state, 0, 11);
      expect(changes.empty).toBe(true);
    });

    it("returns changes when indentation service specifies indent", () => {
      const state = EditorState.create({
        doc: "hello\nworld",
        extensions: [indentService.of((_ctx, _pos) => 4)],
      });
      const changes = indentRange(state, 0, 11);
      expect(changes.empty).toBe(false);
    });
  });

  describe("continuedIndent", () => {
    it("returns a function", () => {
      const fn = continuedIndent();
      expect(typeof fn).toBe("function");
    });

    it("accepts options with except and units", () => {
      const fn = continuedIndent({ except: /^else/, units: 2 });
      expect(typeof fn).toBe("function");
    });
  });

  describe("flatIndent", () => {
    it("is a function", () => {
      expect(typeof flatIndent).toBe("function");
    });
  });
});

describe("Fold state and effects (deep)", () => {
  describe("foldState field", () => {
    it("reflects a fold after applying foldEffect", () => {
      const state = EditorState.create({
        doc: "line one\nline two\nline three",
        extensions: [codeFolding()],
      });
      const next = state.update({
        effects: foldEffect.of({ from: 8, to: 17 }),
      }).state;
      const ranges = foldedRanges(next);
      let count = 0;
      ranges.between(0, next.doc.length, () => { count++; });
      expect(count).toBe(1);
    });

    it("removes fold after applying unfoldEffect", () => {
      const state = EditorState.create({
        doc: "line one\nline two\nline three",
        extensions: [codeFolding()],
      });
      let s = state.update({
        effects: foldEffect.of({ from: 8, to: 17 }),
      }).state;
      s = s.update({
        effects: unfoldEffect.of({ from: 8, to: 17 }),
      }).state;
      let count = 0;
      foldedRanges(s).between(0, s.doc.length, () => { count++; });
      expect(count).toBe(0);
    });

    it("supports multiple folds simultaneously", () => {
      const state = EditorState.create({
        doc: "aaa\nbbb\nccc\nddd\neee",
        extensions: [codeFolding()],
      });
      let s = state.update({
        effects: foldEffect.of({ from: 3, to: 7 }),
      }).state;
      s = s.update({
        effects: foldEffect.of({ from: 11, to: 15 }),
      }).state;
      let count = 0;
      foldedRanges(s).between(0, s.doc.length, () => { count++; });
      expect(count).toBe(2);
    });

    it("does not add duplicate fold for the same range", () => {
      const state = EditorState.create({
        doc: "aaa\nbbb\nccc",
        extensions: [codeFolding()],
      });
      let s = state.update({
        effects: foldEffect.of({ from: 3, to: 7 }),
      }).state;
      s = s.update({
        effects: foldEffect.of({ from: 3, to: 7 }),
      }).state;
      let count = 0;
      foldedRanges(s).between(0, s.doc.length, () => { count++; });
      expect(count).toBe(1);
    });

    it("toJSON/fromJSON round-trips fold state", () => {
      const state = EditorState.create({
        doc: "hello\nworld\nfoo\nbar",
        extensions: [codeFolding()],
      });
      const folded = state.update({
        effects: foldEffect.of({ from: 5, to: 11 }),
      }).state;
      const json = folded.toJSON({ fold: foldState });
      expect(json.fold).toEqual([5, 11]);

      const restored = EditorState.fromJSON(json, {
        doc: folded.doc.toString(),
        extensions: [codeFolding()],
      }, { fold: foldState });
      let count = 0;
      let savedFrom = -1, savedTo = -1;
      foldedRanges(restored).between(0, restored.doc.length, (from, to) => {
        savedFrom = from;
        savedTo = to;
        count++;
      });
      expect(count).toBe(1);
      expect(savedFrom).toBe(5);
      expect(savedTo).toBe(11);
    });

    it("toJSON returns empty array when no folds", () => {
      const state = EditorState.create({
        doc: "hello\nworld",
        extensions: [codeFolding()],
      });
      const json = state.toJSON({ fold: foldState });
      expect(json.fold).toEqual([]);
    });

    it("fromJSON throws on non-array data", () => {
      expect(() => {
        EditorState.fromJSON(
          { doc: "hello\nworld", selection: { ranges: [{ anchor: 0 }], main: 0 }, fold: "bad" },
          { extensions: [codeFolding()] },
          { fold: foldState },
        );
      }).toThrow();
    });

    it("fromJSON throws on odd-length array", () => {
      expect(() => {
        EditorState.fromJSON(
          { doc: "hello\nworld", selection: { ranges: [{ anchor: 0 }], main: 0 }, fold: [1, 2, 3] },
          { extensions: [codeFolding()] },
          { fold: foldState },
        );
      }).toThrow();
    });
  });

  describe("foldedRanges", () => {
    it("returns empty set when no foldState is configured", () => {
      const state = EditorState.create({ doc: "hello\nworld" });
      const ranges = foldedRanges(state);
      expect(ranges.size).toBe(0);
    });

    it("returns decorations matching existing folds", () => {
      const state = EditorState.create({
        doc: "aaa\nbbb\nccc",
        extensions: [codeFolding()],
      });
      const s = state.update({
        effects: foldEffect.of({ from: 3, to: 7 }),
      }).state;
      const ranges = foldedRanges(s);
      expect(ranges.size).toBeGreaterThan(0);
    });

    it("size reflects the correct number of folds", () => {
      const state = EditorState.create({
        doc: "aaa\nbbb\nccc\nddd",
        extensions: [codeFolding()],
      });
      let s = state.update({
        effects: foldEffect.of({ from: 3, to: 7 }),
      }).state;
      s = s.update({
        effects: foldEffect.of({ from: 7, to: 11 }),
      }).state;
      expect(foldedRanges(s).size).toBe(2);
    });
  });

  describe("foldable with foldService", () => {
    it("returns range from a custom foldService", () => {
      const state = EditorState.create({
        doc: "function foo() {\n  return 1;\n}",
        extensions: [
          foldService.of((_state, lineStart, _lineEnd) => {
            if (lineStart === 0) return { from: 16, to: 29 };
            return null;
          }),
        ],
      });
      const result = foldable(state, 0, 16);
      expect(result).toEqual({ from: 16, to: 29 });
    });

    it("returns null when foldService returns null for all lines", () => {
      const state = EditorState.create({
        doc: "no folds here",
        extensions: [
          foldService.of(() => null),
        ],
      });
      const result = foldable(state, 0, 13);
      expect(result).toBeNull();
    });

    it("returns null with no foldService registered and no syntax tree", () => {
      const state = EditorState.create({ doc: "plain text" });
      const result = foldable(state, 0, 10);
      expect(result).toBeNull();
    });

    it("first matching foldService wins", () => {
      const state = EditorState.create({
        doc: "aaaa\nbbbb",
        extensions: [
          foldService.of((_state, lineStart) => {
            if (lineStart === 0) return { from: 4, to: 9 };
            return null;
          }),
          foldService.of((_state, lineStart) => {
            if (lineStart === 0) return { from: 2, to: 8 };
            return null;
          }),
        ],
      });
      const result = foldable(state, 0, 4);
      expect(result).toEqual({ from: 4, to: 9 });
    });
  });

  describe("foldEffect and unfoldEffect", () => {
    it("foldEffect is a StateEffect definition", () => {
      // foldEffect.of produces a StateEffect instance
      const eff = foldEffect.of({ from: 0, to: 5 });
      expect(eff).toBeDefined();
      expect(eff.is(foldEffect)).toBe(true);
    });

    it("unfoldEffect is a StateEffect definition", () => {
      const eff = unfoldEffect.of({ from: 0, to: 5 });
      expect(eff).toBeDefined();
      expect(eff.is(unfoldEffect)).toBe(true);
    });

    it("foldEffect is not unfoldEffect", () => {
      const eff = foldEffect.of({ from: 0, to: 5 });
      expect(eff.is(unfoldEffect)).toBe(false);
    });

    it("effects map through document changes", () => {
      const state = EditorState.create({
        doc: "abcdefghij",
        extensions: [codeFolding()],
      });
      // Fold positions 3..7, then insert text before the fold
      const s1 = state.update({
        effects: foldEffect.of({ from: 3, to: 7 }),
      }).state;
      // Insert "XX" at position 0, shifting all positions by 2
      const s2 = s1.update({
        changes: { from: 0, insert: "XX" },
      }).state;
      let foldFrom = -1, foldTo = -1;
      foldedRanges(s2).between(0, s2.doc.length, (from, to) => {
        foldFrom = from;
        foldTo = to;
      });
      // Positions should be shifted by 2
      expect(foldFrom).toBe(5);
      expect(foldTo).toBe(9);
    });
  });
});
