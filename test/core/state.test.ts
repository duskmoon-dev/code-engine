import { describe, it, expect } from "bun:test";
import {
  EditorState,
  Text,
  StateField,
  StateEffect,
  Facet,
  Compartment,
  EditorSelection,
  SelectionRange,
  ChangeSet,
  Transaction,
  Annotation,
  Prec,
  RangeSet,
  RangeSetBuilder,
  RangeValue,
  findClusterBreak,
  codePointAt,
  countColumn,
  findColumn,
  MapMode,
  CharCategory,
  codePointSize,
  fromCodePoint,
  combineConfig,
} from "../../src/core/state/index";

describe("EditorState", () => {
  it("creates an empty state", () => {
    const state = EditorState.create();
    expect(state.doc.length).toBe(0);
    expect(state.doc.toString()).toBe("");
  });

  it("creates a state with initial doc", () => {
    const state = EditorState.create({ doc: "hello world" });
    expect(state.doc.toString()).toBe("hello world");
    expect(state.doc.length).toBe(11);
  });

  it("applies transactions to modify doc", () => {
    const state = EditorState.create({ doc: "hello" });
    const tr = state.update({ changes: { from: 5, insert: " world" } });
    expect(tr.state.doc.toString()).toBe("hello world");
  });

  it("supports selections", () => {
    const state = EditorState.create({ doc: "hello", selection: { anchor: 3 } });
    expect(state.selection.main.anchor).toBe(3);
  });

  it("deletion transaction works", () => {
    const state = EditorState.create({ doc: "hello world" });
    const tr = state.update({ changes: { from: 5, to: 11 } });
    expect(tr.state.doc.toString()).toBe("hello");
  });

  it("replacement transaction works", () => {
    const state = EditorState.create({ doc: "hello world" });
    const tr = state.update({ changes: { from: 6, to: 11, insert: "there" } });
    expect(tr.state.doc.toString()).toBe("hello there");
  });

  it("isReadOnly is false by default", () => {
    const state = EditorState.create({ doc: "hello" });
    expect(state.readOnly).toBe(false);
  });
});

describe("Text", () => {
  it("creates text from string", () => {
    const text = Text.of(["hello\n", "world"]);
    expect(text.length).toBe(12);
    expect(text.lines).toBe(2);
  });

  it("slices text", () => {
    const text = Text.of(["hello world"]);
    expect(text.sliceString(0, 5)).toBe("hello");
  });

  it("Text.empty has length 0", () => {
    expect(Text.empty.length).toBe(0);
  });

  it("iterates lines", () => {
    const text = Text.of(["line1", "\n", "line2"]);
    expect(text.lines).toBeGreaterThanOrEqual(2);
  });
});

describe("StateField", () => {
  it("defines and reads a state field", () => {
    const increment = StateEffect.define<number>();
    const counter = StateField.define<number>({
      create: () => 0,
      update(value, tr) {
        for (const e of tr.effects) {
          if (e.is(increment)) value += e.value;
        }
        return value;
      },
    });

    let state = EditorState.create({ extensions: [counter] });
    expect(state.field(counter)).toBe(0);

    state = state.update({ effects: increment.of(5) }).state;
    expect(state.field(counter)).toBe(5);

    state = state.update({ effects: increment.of(3) }).state;
    expect(state.field(counter)).toBe(8);
  });
});

describe("Facet", () => {
  it("defines and reads a facet", () => {
    const myFacet = Facet.define<string, string[]>({
      combine: (values) => values,
    });
    const state = EditorState.create({
      extensions: [myFacet.of("hello"), myFacet.of("world")],
    });
    const value = state.facet(myFacet);
    expect(value).toContain("hello");
    expect(value).toContain("world");
  });
});

describe("Compartment", () => {
  it("reconfigures an extension", () => {
    const myFacet = Facet.define<number, number[]>({ combine: (vs) => vs });
    const compartment = new Compartment();

    let state = EditorState.create({
      extensions: [compartment.of(myFacet.of(1))],
    });
    expect(state.facet(myFacet)).toContain(1);

    const tr = state.update({ effects: compartment.reconfigure(myFacet.of(2)) });
    state = tr.state;
    expect(state.facet(myFacet)).toContain(2);
    expect(state.facet(myFacet)).not.toContain(1);
  });
});

describe("EditorSelection", () => {
  it("cursor() returns a SelectionRange at a position", () => {
    const range = EditorSelection.cursor(5);
    expect(range.anchor).toBe(5);
    expect(range.head).toBe(5);
    expect(range.from).toBe(5);
    expect(range.to).toBe(5);
  });

  it("range() returns a SelectionRange with anchor/head", () => {
    const range = EditorSelection.range(3, 8);
    expect(range.anchor).toBe(3);
    expect(range.head).toBe(8);
    expect(range.from).toBe(3);
    expect(range.to).toBe(8);
  });

  it("inverted range has from < to regardless of anchor/head order", () => {
    const range = EditorSelection.range(8, 3);
    expect(range.anchor).toBe(8);
    expect(range.head).toBe(3);
    expect(range.from).toBe(3);
    expect(range.to).toBe(8);
  });

  it("cursor has empty=true, range has empty=false", () => {
    expect(EditorSelection.cursor(5).empty).toBe(true);
    expect(EditorSelection.range(3, 8).empty).toBe(false);
  });
});

describe("SelectionRange methods", () => {
  it("eq returns true for identical ranges", () => {
    const a = EditorSelection.range(0, 5);
    const b = EditorSelection.range(0, 5);
    expect(a.eq(b)).toBe(true);
  });

  it("eq returns false for different ranges", () => {
    const a = EditorSelection.range(0, 5);
    const b = EditorSelection.range(0, 6);
    expect(a.eq(b)).toBe(false);
  });

  it("toJSON returns anchor and head", () => {
    const range = EditorSelection.range(3, 8);
    const json = range.toJSON();
    expect(json.anchor).toBe(3);
    expect(json.head).toBe(8);
  });

  it("fromJSON restores a range", () => {
    const range = SelectionRange.fromJSON({ anchor: 3, head: 8 });
    expect(range.anchor).toBe(3);
    expect(range.head).toBe(8);
  });

  it("fromJSON throws on invalid input", () => {
    expect(() => SelectionRange.fromJSON(null)).toThrow();
    expect(() => SelectionRange.fromJSON({})).toThrow();
    expect(() => SelectionRange.fromJSON({ anchor: "x", head: 0 })).toThrow();
  });

  it("toJSON/fromJSON round-trips a range", () => {
    const original = EditorSelection.range(10, 20);
    const restored = SelectionRange.fromJSON(original.toJSON());
    expect(original.eq(restored)).toBe(true);
  });

  it("extend covers from/to when they span anchor", () => {
    const range = EditorSelection.cursor(5);
    const extended = range.extend(2, 8);
    expect(extended.from).toBe(2);
    expect(extended.to).toBe(8);
  });

  it("map through empty change returns same range", () => {
    const range = EditorSelection.range(3, 8);
    const change = ChangeSet.of([], 10);
    const mapped = range.map(change);
    expect(mapped.from).toBe(3);
    expect(mapped.to).toBe(8);
  });
});

describe("Transaction", () => {
  it("state.update() returns a transaction", () => {
    const state = EditorState.create({ doc: "hello" });
    const tr = state.update({ changes: { from: 5, insert: "!" } });
    expect(tr).toBeDefined();
    expect(tr.state.doc.toString()).toBe("hello!");
  });

  it("transaction has newDoc", () => {
    const state = EditorState.create({ doc: "hello" });
    const tr = state.update({ changes: { from: 0, to: 5, insert: "world" } });
    expect(tr.newDoc.toString()).toBe("world");
  });

  it("transaction docChanged is true after change", () => {
    const state = EditorState.create({ doc: "hello" });
    const tr = state.update({ changes: { from: 5, insert: "!" } });
    expect(tr.docChanged).toBe(true);
  });

  it("transaction docChanged is false without changes", () => {
    const state = EditorState.create({ doc: "hello" });
    const tr = state.update({});
    expect(tr.docChanged).toBe(false);
  });
});

describe("ChangeSet", () => {
  it("ChangeSet.of creates a change set", () => {
    const state = EditorState.create({ doc: "hello world" });
    const changes = ChangeSet.of([{ from: 6, to: 11, insert: "there" }], 11);
    expect(changes).toBeDefined();
    expect(changes.apply(state.doc).toString()).toBe("hello there");
  });

  it("ChangeSet.empty has no changes", () => {
    const empty = ChangeSet.empty(10);
    expect(empty).toBeDefined();
    expect(empty.length).toBe(10);
  });

  it("can compose changeSets", () => {
    const cs1 = ChangeSet.of([{ from: 0, to: 5, insert: "world" }], 11);
    const cs2 = ChangeSet.of([{ from: 5, insert: "!" }], cs1.newLength);
    const composed = cs1.compose(cs2);
    const state = EditorState.create({ doc: "hello world" });
    expect(composed.apply(state.doc).toString()).toBe("world! world");
  });
});

describe("Prec", () => {
  it("has highest/high/default/low/lowest levels", () => {
    expect(Prec.highest).toBeDefined();
    expect(Prec.high).toBeDefined();
    expect(Prec.default).toBeDefined();
    expect(Prec.low).toBeDefined();
    expect(Prec.lowest).toBeDefined();
  });

  it("Prec levels are functions that wrap extensions", () => {
    const myFacet = Facet.define<number>({ combine: (vs) => vs.reduce((a, b) => a + b, 0) });
    const ext = myFacet.of(1);
    const high = Prec.high(ext);
    expect(high).toBeDefined();
  });
});

describe("RangeSet", () => {
  class Mark extends RangeValue {
    constructor(readonly label: string) { super(); }
    eq(other: RangeValue) { return other instanceof Mark && this.label === other.label; }
  }

  function buildSet(...ranges: [number, number, string][]) {
    const builder = new RangeSetBuilder<Mark>();
    for (const [from, to, label] of ranges) builder.add(from, to, new Mark(label));
    return builder.finish();
  }

  it("RangeSet.empty is defined", () => {
    expect(RangeSet.empty).toBeDefined();
    expect(RangeSet.empty.size).toBe(0);
  });

  it("RangeSetBuilder can build a range set", () => {
    const set = buildSet([0, 5, "a"]);
    expect(set).toBeDefined();
    expect(set.size).toBe(1);
  });

  it("size counts all ranges", () => {
    const set = buildSet([0, 3, "a"], [5, 8, "b"], [10, 15, "c"]);
    expect(set.size).toBe(3);
  });

  it("iter walks ranges in order", () => {
    const set = buildSet([0, 3, "a"], [5, 8, "b"]);
    const iter = set.iter();
    expect(iter.from).toBe(0);
    expect(iter.to).toBe(3);
    iter.next();
    expect(iter.from).toBe(5);
    expect(iter.to).toBe(8);
    iter.next();
    expect(iter.value).toBe(null);
  });

  it("between calls function for ranges in a range", () => {
    const set = buildSet([0, 3, "a"], [5, 8, "b"], [10, 15, "c"]);
    const found: string[] = [];
    set.between(4, 12, (from, to, value) => { found.push(value.label); });
    expect(found).toContain("b");
    expect(found).toContain("c");
  });

  it("update adds new ranges", () => {
    const set = buildSet([0, 3, "a"]);
    const updated = set.update({
      add: [new Mark("b").range(5, 8)],
    });
    expect(updated.size).toBe(2);
  });

  it("update with filter removes ranges", () => {
    const set = buildSet([0, 3, "a"], [5, 8, "b"]);
    const updated = set.update({
      filter: (from) => from > 0,
    });
    expect(updated.size).toBe(1);
  });

  it("update with filter and add works together", () => {
    const set = buildSet([0, 3, "a"], [5, 8, "b"]);
    const updated = set.update({
      filter: (from) => from > 0,
      add: [new Mark("c").range(10, 15)],
    });
    expect(updated.size).toBe(2);
  });

  it("map through empty changes returns same set", () => {
    const set = buildSet([0, 3, "a"]);
    const changes = ChangeSet.of([], 10);
    expect(set.map(changes)).toBe(set);
  });

  it("map through insert shifts ranges", () => {
    const set = buildSet([5, 8, "a"]);
    const changes = ChangeSet.of([{ from: 0, insert: "xx" }], 10);
    const mapped = set.map(changes);
    const iter = mapped.iter();
    expect(iter.from).toBe(7);
    expect(iter.to).toBe(10);
  });

  it("RangeSet.of creates set from array", () => {
    const ranges = [
      new Mark("b").range(5, 8),
      new Mark("a").range(0, 3),
    ];
    const set = RangeSet.of(ranges, true);
    expect(set.size).toBe(2);
    const iter = set.iter();
    expect(iter.from).toBe(0);
  });

  it("empty set isEmpty returns true", () => {
    expect(RangeSet.empty.size).toBe(0);
  });
});

describe("Annotation", () => {
  it("defines an annotation type", () => {
    const myAnnotation = Annotation.define<string>();
    expect(myAnnotation).toBeDefined();
    expect(typeof myAnnotation.of).toBe("function");
  });

  it("annotates a transaction", () => {
    const myAnnotation = Annotation.define<string>();
    const state = EditorState.create({ doc: "hello" });
    const tr = state.update({
      annotations: myAnnotation.of("test-value"),
    });
    expect(tr.annotation(myAnnotation)).toBe("test-value");
  });
});

describe("Text utilities", () => {
  it("findClusterBreak finds grapheme cluster boundaries", () => {
    const str = "hello";
    const pos = findClusterBreak(str, 0, true);
    expect(pos).toBe(1); // ASCII: 1 char per cluster
  });

  it("codePointAt returns char code", () => {
    const code = codePointAt("A", 0);
    expect(code).toBe(65); // 'A' is 65
  });

  it("countColumn counts columns in a string", () => {
    const col = countColumn("  hello", 0, 4); // 2 spaces = 2 cols, then "hel" = 3 more
    expect(typeof col).toBe("number");
    expect(col).toBeGreaterThan(0);
  });

  it("findColumn finds position for a column offset", () => {
    const pos = findColumn("hello", 3, 4);
    expect(typeof pos).toBe("number");
    expect(pos).toBeGreaterThanOrEqual(0);
  });
});

describe("EditorState multi-line document", () => {
  it("correctly counts lines in a multi-line document", () => {
    const state = EditorState.create({ doc: "line 1\nline 2\nline 3" });
    expect(state.doc.lines).toBe(3);
  });

  it("lineAt returns correct line info", () => {
    const state = EditorState.create({ doc: "line 1\nline 2\nline 3" });
    const line = state.doc.lineAt(0);
    expect(line.number).toBe(1);
    expect(line.text).toBe("line 1");
  });

  it("line(n) returns correct line by number", () => {
    const state = EditorState.create({ doc: "line 1\nline 2\nline 3" });
    const line = state.doc.line(2);
    expect(line.text).toBe("line 2");
  });
});

describe("ChangeSet.map", () => {
  it("maps a position through a changeset", () => {
    const state = EditorState.create({ doc: "hello world" });
    const changes = ChangeSet.of([{ from: 0, to: 5, insert: "goodbye" }], 11);
    const mapped = changes.mapPos(6);
    expect(typeof mapped).toBe("number");
    expect(mapped).toBeGreaterThan(0);
  });
});

describe("SelectionRange properties", () => {
  it("empty property is true for cursor", () => {
    const range = EditorSelection.cursor(5);
    expect(range.empty).toBe(true);
  });

  it("empty property is false for non-empty range", () => {
    const range = EditorSelection.range(3, 8);
    expect(range.empty).toBe(false);
  });
});

describe("MapMode", () => {
  it("has Simple, TrackDel, TrackBefore, TrackAfter values", () => {
    expect(MapMode.Simple).toBeDefined();
    expect(MapMode.TrackDel).toBeDefined();
    expect(MapMode.TrackBefore).toBeDefined();
    expect(MapMode.TrackAfter).toBeDefined();
  });

  it("MapMode values are numbers", () => {
    expect(typeof MapMode.Simple).toBe("number");
    expect(typeof MapMode.TrackDel).toBe("number");
  });
});

describe("CharCategory", () => {
  it("has Word, Space, Other values", () => {
    expect(CharCategory.Word).toBeDefined();
    expect(CharCategory.Space).toBeDefined();
    expect(CharCategory.Other).toBeDefined();
  });
});

describe("codePointSize and fromCodePoint", () => {
  it("codePointSize returns 1 for ASCII", () => {
    expect(codePointSize(65)).toBe(1); // 'A'
  });

  it("fromCodePoint converts code point to string", () => {
    expect(fromCodePoint(65)).toBe("A");
    expect(fromCodePoint(0x1f600)).toBe("\uD83D\uDE00");
  });
});

describe("EditorState.readOnly facet", () => {
  it("readOnly can be set via extension", () => {
    const state = EditorState.create({
      doc: "hello",
      extensions: [EditorState.readOnly.of(true)],
    });
    expect(state.readOnly).toBe(true);
  });
});

describe("EditorSelection multi-range", () => {
  it("create() builds a selection with multiple ranges", () => {
    const sel = EditorSelection.create([
      EditorSelection.range(0, 3),
      EditorSelection.cursor(7),
    ]);
    expect(sel.ranges.length).toBe(2);
  });

  it("main range is the primary selection", () => {
    const state = EditorState.create({
      doc: "hello world",
      selection: EditorSelection.range(0, 5),
    });
    expect(state.selection.main.from).toBe(0);
    expect(state.selection.main.to).toBe(5);
  });
});

describe("RangeSet iteration", () => {
  it("can iterate over ranges in a set", () => {
    class TestRange extends RangeValue {}
    const builder = new RangeSetBuilder<TestRange>();
    builder.add(0, 3, new TestRange());
    builder.add(5, 8, new TestRange());
    const set = builder.finish();
    const iter = set.iter();
    // iter starts at first range immediately
    expect(iter.from).toBe(0);
    expect(iter.to).toBe(3);
    iter.next();
    expect(iter.from).toBe(5);
    expect(iter.to).toBe(8);
  });
});

describe("AnnotationType", () => {
  it("Annotation.define() returns an AnnotationType-like object", () => {
    const type = Annotation.define<string>();
    expect(type).toBeDefined();
    expect(typeof type.of).toBe("function");
  });

  it("AnnotationType.of() creates an Annotation", () => {
    const type = Annotation.define<number>();
    const ann = type.of(42);
    expect(ann).toBeDefined();
  });
});

describe("ChangeDesc", () => {
  it("ChangeSet is a subtype of ChangeDesc", () => {
    const cs = ChangeSet.of([{ from: 0, to: 3, insert: "X" }], 5);
    expect(cs.length).toBe(5);
    expect(cs.newLength).toBe(3);
  });

  it("ChangeDesc.iterChanges iterates changes", () => {
    const cs = ChangeSet.of([{ from: 0, to: 3, insert: "hello" }], 5);
    const changes: Array<{fromA: number; toA: number}> = [];
    cs.iterChanges((fromA, toA) => { changes.push({ fromA, toA }); });
    expect(changes.length).toBe(1);
    expect(changes[0].fromA).toBe(0);
    expect(changes[0].toA).toBe(3);
  });
});

describe("StateEffectType", () => {
  it("StateEffect.define() returns a StateEffectType-like object", () => {
    const type = StateEffect.define<string>();
    expect(type).toBeDefined();
    expect(typeof type.of).toBe("function");
  });

  it("StateEffectType.of() creates a StateEffect", () => {
    const type = StateEffect.define<number>();
    const effect = type.of(99);
    expect(effect).toBeDefined();
    expect(effect.value).toBe(99);
  });

  it("StateEffect.is() correctly identifies effect type", () => {
    const myType = StateEffect.define<string>();
    const otherType = StateEffect.define<string>();
    const effect = myType.of("test");
    expect(effect.is(myType)).toBe(true);
    expect(effect.is(otherType)).toBe(false);
  });
});

describe("Range", () => {
  it("RangeValue.range() creates a Range", () => {
    class TestValue extends RangeValue {}
    const val = new TestValue();
    const range = val.range(0, 5);
    expect(range).toBeDefined();
    expect(range.from).toBe(0);
    expect(range.to).toBe(5);
  });
});

describe("combineConfig", () => {
  it("combineConfig merges non-conflicting config objects", () => {
    const result = combineConfig([{ a: 1 }, { b: 3, c: 4 }], { a: 0, b: 0, c: 0 });
    expect(result.a).toBe(1);
    expect(result.b).toBe(3);
    expect(result.c).toBe(4);
  });

  it("combineConfig uses default for missing keys", () => {
    const result = combineConfig([{ a: 5 }], { a: 0, b: 99 });
    expect(result.a).toBe(5);
    expect(result.b).toBe(99);
  });

  it("combineConfig throws on conflicting values", () => {
    expect(() => combineConfig([{ a: 1 }, { a: 2 }], { a: 0 })).toThrow();
  });
});

describe("Text advanced methods", () => {
  it("Text.of creates a multiline text", () => {
    const text = Text.of(["hello", "world", "foo"]);
    expect(text.lines).toBe(3);
  });

  it("toString() reconstructs the full string", () => {
    const text = Text.of(["hello", "world"]);
    expect(text.toString()).toBe("hello\nworld");
  });

  it("lineAt() returns the right line for offset", () => {
    const text = Text.of(["hello", "world"]);
    const line = text.lineAt(6); // 'w' in 'world'
    expect(line.number).toBe(2);
    expect(line.text).toBe("world");
  });

  it("sliceString handles multiline ranges", () => {
    const text = Text.of(["abc", "def", "ghi"]);
    const slice = text.sliceString(4, 7); // "def"
    expect(slice).toBe("def");
  });

  it("eq() returns true for same text", () => {
    const t1 = Text.of(["hello"]);
    const t2 = Text.of(["hello"]);
    expect(t1.eq(t2)).toBe(true);
  });

  it("eq() returns false for different text", () => {
    const t1 = Text.of(["hello"]);
    const t2 = Text.of(["world"]);
    expect(t1.eq(t2)).toBe(false);
  });

  it("Text.empty.eq(Text.empty) is true", () => {
    expect(Text.empty.eq(Text.empty)).toBe(true);
  });

  it("large text creates a tree structure", () => {
    const lines = Array.from({ length: 500 }, (_, i) => `line ${i}`);
    const text = Text.of(lines);
    expect(text.lines).toBe(500);
    expect(text.lineAt(1).text).toBe("line 0");
    expect(text.lineAt(text.length).text).toBe("line 499");
  });

  it("iter() walks through all content", () => {
    const text = Text.of(["abc", "def", "ghi"]);
    let result = "";
    for (const chunk of text) {
      result += chunk;
    }
    expect(result).toContain("abc");
    expect(result).toContain("def");
    expect(result).toContain("ghi");
  });

  it("iterRange covers a partial range", () => {
    const text = Text.of(["abc", "def", "ghi"]);
    const iter = text.iterRange(4, 7);
    let result = "";
    while (!iter.done) {
      iter.next();
      if (!iter.done) result += iter.value;
    }
    // "def" starts at pos 4
    expect(result).toContain("def");
  });

  it("iterLines iterates line by line", () => {
    const text = Text.of(["alpha", "beta", "gamma"]);
    const iter = text.iterLines();
    const lines: string[] = [];
    while (!iter.done) {
      iter.next();
      if (!iter.done) lines.push(iter.value);
    }
    expect(lines).toEqual(["alpha", "beta", "gamma"]);
  });

  it("replace() on large text works correctly", () => {
    const lines = Array.from({ length: 200 }, (_, i) => `line ${i}`);
    const text = Text.of(lines);
    const replaced = text.replace(0, 6, Text.of(["REPLACED"]));
    expect(replaced.lineAt(1).text).toBe("REPLACED");
    expect(replaced.lines).toBe(200);
  });

  it("append joins two texts", () => {
    const a = Text.of(["hello"]);
    const b = Text.of(["world"]);
    const joined = a.append(b);
    // append replaces at the end, so single-line texts are concatenated on the same line
    expect(joined.toString()).toBe("helloworld");
  });

  it("append with multiline preserves structure", () => {
    const a = Text.of(["hello", ""]);
    const b = Text.of(["world"]);
    const joined = a.append(b);
    expect(joined.toString()).toBe("hello\nworld");
  });

  it("slice returns a sub-document", () => {
    const text = Text.of(["abc", "def", "ghi"]);
    const sliced = text.slice(4, 7);
    expect(sliced.toString()).toBe("def");
  });

  it("line() retrieves by line number", () => {
    const text = Text.of(["one", "two", "three"]);
    expect(text.line(1).text).toBe("one");
    expect(text.line(2).text).toBe("two");
    expect(text.line(3).text).toBe("three");
  });
});

describe("ChangeSet advanced", () => {
  it("empty ChangeSet has newLength equal to length", () => {
    const cs = ChangeSet.empty(100);
    expect(cs.newLength).toBe(100);
    expect(cs.length).toBe(100);
  });

  it("iterChanges with {A/B} positions", () => {
    const cs = ChangeSet.of([
      { from: 0, to: 2, insert: "X" },
      { from: 5, to: 7, insert: "YY" },
    ], 10);
    const spans: Array<{ fromA: number; toA: number; fromB: number; toB: number }> = [];
    cs.iterChanges((fromA, toA, fromB, toB) => {
      spans.push({ fromA, toA, fromB, toB });
    });
    expect(spans.length).toBe(2);
    expect(spans[0].fromA).toBe(0);
    expect(spans[0].toA).toBe(2);
  });

  it("toJSON/fromJSON round-trips correctly", () => {
    const cs = ChangeSet.of([{ from: 2, to: 4, insert: "hello" }], 10);
    const json = cs.toJSON();
    const restored = ChangeSet.fromJSON(json);
    expect(restored.length).toBe(cs.length);
    expect(restored.newLength).toBe(cs.newLength);
  });
});

describe("EditorSelection multi-range", () => {
  it("create() builds a selection with multiple ranges", () => {
    const sel = EditorSelection.create([
      EditorSelection.range(0, 5),
      EditorSelection.range(10, 15),
    ]);
    expect(sel.ranges.length).toBe(2);
  });

  it("mainIndex selects main range", () => {
    const sel = EditorSelection.create([
      EditorSelection.cursor(0),
      EditorSelection.cursor(5),
    ], 1);
    expect(sel.mainIndex).toBe(1);
    expect(sel.main.anchor).toBe(5);
  });

  it("ranges are sorted by from position", () => {
    const sel = EditorSelection.create([
      EditorSelection.cursor(10),
      EditorSelection.cursor(0),
    ]);
    expect(sel.ranges[0].from).toBeLessThanOrEqual(sel.ranges[1].from);
  });

  it("eq returns true for identical selections", () => {
    const a = EditorSelection.create([EditorSelection.range(0, 5), EditorSelection.range(10, 15)], 0);
    const b = EditorSelection.create([EditorSelection.range(0, 5), EditorSelection.range(10, 15)], 0);
    expect(a.eq(b)).toBe(true);
  });

  it("eq returns false for different ranges", () => {
    const a = EditorSelection.create([EditorSelection.range(0, 5)]);
    const b = EditorSelection.create([EditorSelection.range(0, 6)]);
    expect(a.eq(b)).toBe(false);
  });

  it("eq returns false for different mainIndex", () => {
    const ranges = [EditorSelection.range(0, 5), EditorSelection.range(10, 15)];
    const a = EditorSelection.create(ranges, 0);
    const b = EditorSelection.create(ranges, 1);
    expect(a.eq(b)).toBe(false);
  });

  it("eq returns false for different range count", () => {
    const a = EditorSelection.create([EditorSelection.cursor(0)]);
    const b = EditorSelection.create([EditorSelection.cursor(0), EditorSelection.cursor(5)]);
    expect(a.eq(b)).toBe(false);
  });

  it("asSingle returns single-range selection from multi-range", () => {
    const sel = EditorSelection.create([
      EditorSelection.cursor(0),
      EditorSelection.cursor(5),
      EditorSelection.cursor(10),
    ], 1);
    const single = sel.asSingle();
    expect(single.ranges.length).toBe(1);
    expect(single.main.anchor).toBe(5);
  });

  it("asSingle returns self when already single", () => {
    const sel = EditorSelection.single(3);
    expect(sel.asSingle()).toBe(sel);
  });

  it("addRange appends a range and sets it as main", () => {
    const sel = EditorSelection.single(0);
    const extended = sel.addRange(EditorSelection.cursor(10));
    expect(extended.ranges.length).toBe(2);
    expect(extended.main.anchor).toBe(10);
  });

  it("addRange with main=false preserves original main", () => {
    const sel = EditorSelection.single(0);
    const extended = sel.addRange(EditorSelection.cursor(10), false);
    expect(extended.ranges.length).toBe(2);
    expect(extended.main.anchor).toBe(0);
  });

  it("replaceRange replaces the main range", () => {
    const sel = EditorSelection.create([
      EditorSelection.range(0, 5),
      EditorSelection.range(10, 15),
    ], 0);
    const replaced = sel.replaceRange(EditorSelection.range(0, 3));
    expect(replaced.ranges.length).toBe(2);
    expect(replaced.main.to).toBe(3);
  });

  it("replaceRange replaces a specific range by index", () => {
    const sel = EditorSelection.create([
      EditorSelection.cursor(0),
      EditorSelection.cursor(10),
    ], 0);
    const replaced = sel.replaceRange(EditorSelection.cursor(20), 1);
    expect(replaced.ranges[1].anchor).toBe(20);
    expect(replaced.mainIndex).toBe(0);
  });

  it("toJSON serializes ranges and mainIndex", () => {
    const sel = EditorSelection.create([
      EditorSelection.range(0, 5),
      EditorSelection.range(10, 15),
    ], 1);
    const json = sel.toJSON();
    expect(json.main).toBe(1);
    expect(json.ranges.length).toBe(2);
    expect(json.ranges[0].anchor).toBe(0);
    expect(json.ranges[0].head).toBe(5);
    expect(json.ranges[1].anchor).toBe(10);
    expect(json.ranges[1].head).toBe(15);
  });

  it("fromJSON restores a selection from JSON", () => {
    const json = {
      ranges: [{ anchor: 0, head: 5 }, { anchor: 10, head: 15 }],
      main: 1,
    };
    const sel = EditorSelection.fromJSON(json);
    expect(sel.ranges.length).toBe(2);
    expect(sel.mainIndex).toBe(1);
    expect(sel.main.anchor).toBe(10);
    expect(sel.main.head).toBe(15);
  });

  it("toJSON/fromJSON round-trips correctly", () => {
    const original = EditorSelection.create([
      EditorSelection.range(3, 8),
      EditorSelection.cursor(20),
    ], 1);
    const restored = EditorSelection.fromJSON(original.toJSON());
    expect(original.eq(restored)).toBe(true);
  });

  it("fromJSON throws on invalid input", () => {
    expect(() => EditorSelection.fromJSON(null)).toThrow();
    expect(() => EditorSelection.fromJSON({})).toThrow();
    expect(() => EditorSelection.fromJSON({ ranges: [], main: 0 })).toThrow();
    expect(() => EditorSelection.fromJSON({ ranges: [{ anchor: 0, head: 5 }], main: 5 })).toThrow();
  });
});

describe("Compartment.get", () => {
  it("get() returns the current extension value", () => {
    const myFacet = Facet.define<number, number[]>({ combine: (vs) => vs });
    const compartment = new Compartment();
    const state = EditorState.create({
      extensions: [compartment.of(myFacet.of(42))],
    });
    const current = compartment.get(state);
    expect(current).toBeDefined();
  });
});

describe("Transaction.effects", () => {
  it("effects contains applied state effects", () => {
    const myEffect = StateEffect.define<number>();
    const state = EditorState.create({ doc: "hello" });
    const tr = state.update({ effects: myEffect.of(99) });
    expect(tr.effects.length).toBe(1);
    expect(tr.effects[0].is(myEffect)).toBe(true);
    expect(tr.effects[0].value).toBe(99);
  });

  it("multiple effects are all present", () => {
    const e1 = StateEffect.define<string>();
    const e2 = StateEffect.define<number>();
    const state = EditorState.create({ doc: "hello" });
    const tr = state.update({ effects: [e1.of("a"), e2.of(1)] });
    expect(tr.effects.length).toBe(2);
  });
});

describe("Facet with combine function", () => {
  it("sum combiner aggregates values", () => {
    const sumFacet = Facet.define<number, number>({
      combine: (values) => values.reduce((a, b) => a + b, 0),
    });
    const state = EditorState.create({
      extensions: [sumFacet.of(3), sumFacet.of(7), sumFacet.of(10)],
    });
    expect(state.facet(sumFacet)).toBe(20);
  });

  it("facet without combine returns array of values", () => {
    const arrFacet = Facet.define<string>();
    const state = EditorState.create({
      extensions: [arrFacet.of("hello"), arrFacet.of("world")],
    });
    const value = state.facet(arrFacet);
    expect(Array.isArray(value)).toBe(true);
    expect(value).toContain("hello");
    expect(value).toContain("world");
  });
});

describe("charCategorizer and wordAt", () => {
  it("charCategorizer classifies letters as Word", () => {
    const state = EditorState.create({ doc: "hello" });
    const cat = state.charCategorizer(0);
    expect(cat("a")).toBe(CharCategory.Word);
    expect(cat("Z")).toBe(CharCategory.Word);
    expect(cat("0")).toBe(CharCategory.Word);
  });

  it("charCategorizer classifies whitespace as Space", () => {
    const state = EditorState.create({ doc: "hello" });
    const cat = state.charCategorizer(0);
    expect(cat(" ")).toBe(CharCategory.Space);
    expect(cat("\t")).toBe(CharCategory.Space);
  });

  it("charCategorizer classifies punctuation as Other", () => {
    const state = EditorState.create({ doc: "hello" });
    const cat = state.charCategorizer(0);
    expect(cat("!")).toBe(CharCategory.Other);
    expect(cat(",")).toBe(CharCategory.Other);
  });

  it("wordAt returns the word range at a position", () => {
    const state = EditorState.create({ doc: "hello world" });
    const range = state.wordAt(3);
    expect(range).not.toBe(null);
    expect(range!.from).toBe(0);
    expect(range!.to).toBe(5);
  });

  it("wordAt at space adjacent to word returns that word", () => {
    const state = EditorState.create({ doc: "hello world" });
    // position 5 is space, but backward scan finds "hello"
    const range = state.wordAt(5);
    expect(range).not.toBe(null);
    expect(range!.from).toBe(0);
    expect(range!.to).toBe(5);
  });

  it("wordAt returns null in pure whitespace", () => {
    const state = EditorState.create({ doc: "   " });
    const range = state.wordAt(1);
    expect(range).toBe(null);
  });

  it("wordAt works at second word", () => {
    const state = EditorState.create({ doc: "hello world" });
    const range = state.wordAt(8);
    expect(range).not.toBe(null);
    expect(range!.from).toBe(6);
    expect(range!.to).toBe(11);
  });
});

describe("EditorState.toJSON / fromJSON", () => {
  it("toJSON serializes doc and selection", () => {
    const state = EditorState.create({ doc: "hello", selection: { anchor: 3 } });
    const json = state.toJSON();
    expect(json.doc).toBe("hello");
    expect(json.selection).toBeDefined();
    expect(json.selection.ranges[0].anchor).toBe(3);
  });

  it("fromJSON restores state", () => {
    const original = EditorState.create({ doc: "hello world", selection: { anchor: 5 } });
    const json = original.toJSON();
    const restored = EditorState.fromJSON(json);
    expect(restored.doc.toString()).toBe("hello world");
    expect(restored.selection.main.anchor).toBe(5);
  });

  it("toJSON/fromJSON round-trips correctly", () => {
    const original = EditorState.create({
      doc: "line1\nline2\nline3",
      selection: EditorSelection.range(3, 8),
    });
    const restored = EditorState.fromJSON(original.toJSON());
    expect(restored.doc.toString()).toBe(original.doc.toString());
    expect(restored.selection.main.from).toBe(3);
    expect(restored.selection.main.to).toBe(8);
  });

  it("fromJSON throws on invalid input", () => {
    expect(() => EditorState.fromJSON(null)).toThrow();
    expect(() => EditorState.fromJSON({})).toThrow();
    expect(() => EditorState.fromJSON({ doc: 42 })).toThrow();
  });

  it("toJSON with custom StateField", () => {
    const counter = StateField.define<number>({
      create: () => 0,
      update: (val, tr) => tr.docChanged ? val + 1 : val,
      toJSON: (val) => val,
      fromJSON: (json) => json as number,
    });
    let state = EditorState.create({ doc: "hi", extensions: [counter] });
    state = state.update({ changes: { from: 2, insert: "!" } }).state;
    const json = state.toJSON({ counter });
    expect(json.counter).toBe(1);
    const restored = EditorState.fromJSON(json, { extensions: [counter] }, { counter });
    expect(restored.field(counter)).toBe(1);
  });
});

describe("EditorState.phrase", () => {
  it("returns the phrase when no translation is registered", () => {
    const state = EditorState.create({ doc: "" });
    expect(state.phrase("Hello")).toBe("Hello");
  });

  it("translates using phrases facet", () => {
    const state = EditorState.create({
      doc: "",
      extensions: [EditorState.phrases.of({ "Hello": "Hola" })],
    });
    expect(state.phrase("Hello")).toBe("Hola");
  });

  it("supports $1 substitution", () => {
    const state = EditorState.create({ doc: "" });
    expect(state.phrase("Hello $1", "World")).toBe("Hello World");
  });

  it("supports $$ for literal dollar sign with args", () => {
    const state = EditorState.create({ doc: "" });
    // $$ is replaced with $ only when insert args are passed
    expect(state.phrase("Price: $$", "unused")).toBe("Price: $");
  });

  it("supports multiple substitutions", () => {
    const state = EditorState.create({ doc: "" });
    expect(state.phrase("$1 and $2", "A", "B")).toBe("A and B");
  });
});
