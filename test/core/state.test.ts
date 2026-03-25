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
  it("RangeSet.empty is defined", () => {
    expect(RangeSet.empty).toBeDefined();
  });

  it("RangeSetBuilder can build a range set", () => {
    class TestRange extends RangeValue {}
    const builder = new RangeSetBuilder<TestRange>();
    builder.add(0, 5, new TestRange());
    const set = builder.finish();
    expect(set).toBeDefined();
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
