import { describe, it, expect } from "bun:test";
import { EditorState, Text, StateField, StateEffect } from "../../src/core/state/index";

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
  });
});
