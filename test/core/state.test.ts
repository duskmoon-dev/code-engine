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
