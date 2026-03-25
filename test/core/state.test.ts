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
