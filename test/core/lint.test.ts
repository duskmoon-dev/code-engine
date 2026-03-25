import { describe, it, expect } from "bun:test";
import {
  linter,
  lintKeymap,
  diagnosticCount,
  setDiagnostics,
  openLintPanel,
  closeLintPanel,
  nextDiagnostic,
  previousDiagnostic,
  forceLinting,
  lintGutter,
  setDiagnosticsEffect,
  forEachDiagnostic,
} from "../../src/core/lint/index";
import { EditorState } from "../../src/core/state/index";

describe("lint module exports", () => {
  it("exports linter as a function", () => {
    expect(linter).toBeDefined();
    expect(typeof linter).toBe("function");
  });

  it("exports lintKeymap as an array", () => {
    expect(lintKeymap).toBeDefined();
    expect(Array.isArray(lintKeymap)).toBe(true);
    expect(lintKeymap.length).toBeGreaterThan(0);
  });

  it("exports diagnosticCount as a function", () => {
    expect(diagnosticCount).toBeDefined();
    expect(typeof diagnosticCount).toBe("function");
  });

  it("exports setDiagnostics as a function", () => {
    expect(setDiagnostics).toBeDefined();
    expect(typeof setDiagnostics).toBe("function");
  });

  it("exports openLintPanel as a function", () => {
    expect(openLintPanel).toBeDefined();
    expect(typeof openLintPanel).toBe("function");
  });

  it("exports closeLintPanel as a function", () => {
    expect(closeLintPanel).toBeDefined();
    expect(typeof closeLintPanel).toBe("function");
  });

  it("exports nextDiagnostic as a function", () => {
    expect(nextDiagnostic).toBeDefined();
    expect(typeof nextDiagnostic).toBe("function");
  });

  it("exports previousDiagnostic as a function", () => {
    expect(previousDiagnostic).toBeDefined();
    expect(typeof previousDiagnostic).toBe("function");
  });

  it("exports forceLinting as a function", () => {
    expect(forceLinting).toBeDefined();
    expect(typeof forceLinting).toBe("function");
  });

  it("exports lintGutter as a function", () => {
    expect(lintGutter).toBeDefined();
    expect(typeof lintGutter).toBe("function");
  });

  it("exports setDiagnosticsEffect as defined", () => {
    expect(setDiagnosticsEffect).toBeDefined();
  });

  it("exports forEachDiagnostic as a function", () => {
    expect(forEachDiagnostic).toBeDefined();
    expect(typeof forEachDiagnostic).toBe("function");
  });
});

describe("lintKeymap entries", () => {
  it("each entry has a key property that is a string", () => {
    for (const binding of lintKeymap) {
      expect(typeof binding.key).toBe("string");
    }
  });

  it("each entry has a run or shift handler", () => {
    for (const binding of lintKeymap) {
      const hasHandler = typeof binding.run === "function" ||
                         typeof binding.shift === "function";
      expect(hasHandler).toBe(true);
    }
  });
});

describe("linter function", () => {
  it("returns an extension when given a lint source", () => {
    const ext = linter(() => []);
    expect(ext).toBeDefined();
  });

  it("accepts a config object as second argument", () => {
    const ext = linter(() => [], { delay: 500 });
    expect(ext).toBeDefined();
  });
});

describe("diagnosticCount", () => {
  it("returns 0 for a state with no lint extension", () => {
    const state = EditorState.create({ doc: "hello" });
    expect(diagnosticCount(state)).toBe(0);
  });
});

describe("setDiagnostics", () => {
  it("returns a transaction spec", () => {
    const state = EditorState.create({ doc: "hello" });
    const spec = setDiagnostics(state, []);
    expect(spec).toBeDefined();
    expect(typeof spec).toBe("object");
  });

  it("returns a transaction spec with diagnostics", () => {
    const state = EditorState.create({ doc: "hello" });
    const spec = setDiagnostics(state, [
      { from: 0, to: 5, severity: "error", message: "test error" },
    ]);
    expect(spec).toBeDefined();
    expect(typeof spec).toBe("object");
  });
});

describe("lintGutter", () => {
  it("returns an extension when called with no arguments", () => {
    const ext = lintGutter();
    expect(ext).toBeDefined();
  });

  it("returns an extension when called with config", () => {
    const ext = lintGutter({});
    expect(ext).toBeDefined();
  });
});

describe("diagnosticCount behavioral tests", () => {
  it("returns 0 for state with no diagnostics", () => {
    const state = EditorState.create({ doc: "hello" });
    // State without linter extension has no diagnostics
    expect(diagnosticCount(state)).toBe(0);
  });

  it("returns count after setDiagnostics", () => {
    const state = EditorState.create({ doc: "hello world" });
    const spec = setDiagnostics(state, [
      { from: 0, to: 5, severity: "error", message: "error 1" },
      { from: 6, to: 11, severity: "warning", message: "warning 1" },
    ]);
    const newState = state.update(spec).state;
    expect(diagnosticCount(newState)).toBe(2);
  });
});

describe("forEachDiagnostic behavioral tests", () => {
  it("does not call callback when no diagnostics", () => {
    const state = EditorState.create({ doc: "hello" });
    let called = 0;
    forEachDiagnostic(state, () => { called++; });
    expect(called).toBe(0);
  });

  it("calls callback for each diagnostic after setDiagnostics", () => {
    const state = EditorState.create({ doc: "hello world" });
    const spec = setDiagnostics(state, [
      { from: 0, to: 5, severity: "error", message: "err" },
      { from: 6, to: 11, severity: "info", message: "info" },
    ]);
    const newState = state.update(spec).state;
    const diags: string[] = [];
    forEachDiagnostic(newState, (d) => { diags.push(d.message); });
    expect(diags).toEqual(["err", "info"]);
  });
});

describe("setDiagnostics severity types", () => {
  it("accepts error severity", () => {
    const state = EditorState.create({ doc: "x" });
    const spec = setDiagnostics(state, [
      { from: 0, to: 1, severity: "error", message: "syntax error" },
    ]);
    const newState = state.update(spec).state;
    expect(diagnosticCount(newState)).toBe(1);
    const msgs: string[] = [];
    forEachDiagnostic(newState, d => msgs.push(d.severity));
    expect(msgs[0]).toBe("error");
  });

  it("accepts warning severity", () => {
    const state = EditorState.create({ doc: "x" });
    const spec = setDiagnostics(state, [
      { from: 0, to: 1, severity: "warning", message: "unused variable" },
    ]);
    const newState = state.update(spec).state;
    const msgs: string[] = [];
    forEachDiagnostic(newState, d => msgs.push(d.severity));
    expect(msgs[0]).toBe("warning");
  });

  it("accepts hint severity", () => {
    const state = EditorState.create({ doc: "x" });
    const spec = setDiagnostics(state, [
      { from: 0, to: 1, severity: "hint", message: "consider refactoring" },
    ]);
    const newState = state.update(spec).state;
    const msgs: string[] = [];
    forEachDiagnostic(newState, d => msgs.push(d.severity));
    expect(msgs[0]).toBe("hint");
  });

  it("replaces diagnostics when setDiagnostics is called again", () => {
    let state = EditorState.create({ doc: "hello world" });
    const spec1 = setDiagnostics(state, [
      { from: 0, to: 5, severity: "error", message: "first" },
      { from: 6, to: 11, severity: "error", message: "second" },
    ]);
    state = state.update(spec1).state;
    expect(diagnosticCount(state)).toBe(2);

    const spec2 = setDiagnostics(state, [
      { from: 0, to: 5, severity: "warning", message: "only one now" },
    ]);
    state = state.update(spec2).state;
    expect(diagnosticCount(state)).toBe(1);
  });
});

describe("setDiagnosticsEffect", () => {
  it("is a StateEffect instance", () => {
    expect(setDiagnosticsEffect).toBeDefined();
    // StateEffect has 'of' method
    expect(typeof setDiagnosticsEffect.of).toBe("function");
  });
});

describe("lintKeymap depth", () => {
  it("lintKeymap has at least 2 bindings", () => {
    expect(lintKeymap.length).toBeGreaterThanOrEqual(2);
  });

  it("all lintKeymap keys are non-empty strings", () => {
    for (const binding of lintKeymap) {
      expect(binding.key.length).toBeGreaterThan(0);
    }
  });
});

describe("lint module additional", () => {
  it("diagnosticCount starts at 0 for fresh state", () => {
    const state = EditorState.create({ doc: "hello" });
    expect(diagnosticCount(state)).toBe(0);
  });

  it("linter() returns a defined extension", () => {
    const ext = linter(() => []);
    expect(ext).toBeDefined();
  });

  it("setDiagnostics with multiple diagnostics sets count correctly", () => {
    let state = EditorState.create({ doc: "one two three" });
    const spec = setDiagnostics(state, [
      { from: 0, to: 3, severity: "error", message: "error1" },
      { from: 4, to: 7, severity: "warning", message: "warn1" },
      { from: 8, to: 13, severity: "info", message: "info1" },
    ]);
    state = state.update(spec).state;
    expect(diagnosticCount(state)).toBe(3);
  });

  it("forEachDiagnostic iterates all severities", () => {
    let state = EditorState.create({ doc: "abc" });
    const spec = setDiagnostics(state, [
      { from: 0, to: 1, severity: "error", message: "e" },
      { from: 1, to: 2, severity: "warning", message: "w" },
      { from: 2, to: 3, severity: "info", message: "i" },
    ]);
    state = state.update(spec).state;
    const messages: string[] = [];
    forEachDiagnostic(state, (d) => { messages.push(d.message); });
    expect(messages).toContain("e");
    expect(messages).toContain("w");
    expect(messages).toContain("i");
  });

  it("setDiagnosticsEffect is a StateEffect type", () => {
    expect(setDiagnosticsEffect).toBeDefined();
    expect(typeof setDiagnosticsEffect.of).toBe("function");
  });

  it("lintKeymap entries have run property", () => {
    for (const binding of lintKeymap) {
      expect(typeof binding.run).toBe("function");
    }
  });
});

describe("diagnosticCount after clearing", () => {
  it("returns 0 after clearing diagnostics", () => {
    let state = EditorState.create({ doc: "test" });
    const setSpec = setDiagnostics(state, [
      { from: 0, to: 4, severity: "error", message: "oops" },
    ]);
    state = state.update(setSpec).state;
    expect(diagnosticCount(state)).toBe(1);

    const clearSpec = setDiagnostics(state, []);
    state = state.update(clearSpec).state;
    expect(diagnosticCount(state)).toBe(0);
  });
});

describe("forEachDiagnostic provides correct position info", () => {
  it("diagnostic has correct from/to positions", () => {
    const state = EditorState.create({ doc: "hello world" });
    const spec = setDiagnostics(state, [
      { from: 0, to: 5, severity: "error", message: "first word" },
      { from: 6, to: 11, severity: "warning", message: "second word" },
    ]);
    const newState = state.update(spec).state;
    const positions: Array<{from: number, to: number}> = [];
    forEachDiagnostic(newState, (d, from, to) => {
      positions.push({ from, to });
    });
    expect(positions[0].from).toBe(0);
    expect(positions[0].to).toBe(5);
    expect(positions[1].from).toBe(6);
    expect(positions[1].to).toBe(11);
  });
});

describe("lint additional coverage", () => {
  it("forEachDiagnostic count matches diagnosticCount", () => {
    const state = EditorState.create({ doc: "abc" });
    const spec = setDiagnostics(state, [
      { from: 0, to: 1, severity: "error", message: "a" },
      { from: 1, to: 2, severity: "warning", message: "b" },
    ]);
    const newState = state.update(spec).state;
    let count = 0;
    forEachDiagnostic(newState, () => { count++; });
    expect(count).toBe(diagnosticCount(newState));
  });

  it("setDiagnostics with zero diagnostics clears all", () => {
    let state = EditorState.create({ doc: "test" });
    const setSpec = setDiagnostics(state, [
      { from: 0, to: 4, severity: "error", message: "error" },
    ]);
    state = state.update(setSpec).state;
    const clearSpec = setDiagnostics(state, []);
    state = state.update(clearSpec).state;
    expect(diagnosticCount(state)).toBe(0);
  });

  it("diagnostic message is preserved in forEachDiagnostic", () => {
    const state = EditorState.create({ doc: "test" });
    const spec = setDiagnostics(state, [
      { from: 0, to: 4, severity: "error", message: "my-error-message" },
    ]);
    const newState = state.update(spec).state;
    const messages: string[] = [];
    forEachDiagnostic(newState, (d) => { messages.push(d.message); });
    expect(messages[0]).toBe("my-error-message");
  });

  it("linter() extension is defined and usable", () => {
    const ext = linter(() => []);
    const state = EditorState.create({ doc: "test", extensions: [ext] });
    expect(state.doc.toString()).toBe("test");
  });

  it("diagnosticCount on a state with doc mutation is 0 initially", () => {
    const state = EditorState.create({ doc: "new content" });
    expect(diagnosticCount(state)).toBe(0);
  });

  it("forEachDiagnostic callback receives diagnostic object", () => {
    const state = EditorState.create({ doc: "hello" });
    const spec = setDiagnostics(state, [
      { from: 0, to: 5, severity: "info", message: "info-msg" },
    ]);
    const newState = state.update(spec).state;
    let received: any = null;
    forEachDiagnostic(newState, (d) => { received = d; });
    expect(received).toBeDefined();
    expect(received.message).toBe("info-msg");
    expect(received.severity).toBe("info");
  });
});
