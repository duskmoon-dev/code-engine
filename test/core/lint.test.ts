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
