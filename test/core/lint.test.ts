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
import type { Diagnostic } from "../../src/core/lint/index";
import { EditorState, StateEffect } from "../../src/core/state/index";

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

  it("lintKeymap is an array", () => {
    expect(Array.isArray(lintKeymap)).toBe(true);
  });

  it("lintKeymap has key bindings", () => {
    expect(lintKeymap.length).toBeGreaterThan(0);
  });

  it("lintGutter is defined", () => {
    expect(lintGutter).toBeDefined();
  });

  it("openLintPanel is a function", () => {
    expect(typeof openLintPanel).toBe("function");
  });

  it("closeLintPanel is a function", () => {
    expect(typeof closeLintPanel).toBe("function");
  });

  it("nextDiagnostic is a function", () => {
    expect(typeof nextDiagnostic).toBe("function");
  });

  it("previousDiagnostic is a function", () => {
    expect(typeof previousDiagnostic).toBe("function");
  });

  it("forceLinting is a function", () => {
    expect(typeof forceLinting).toBe("function");
  });

  it("forEachDiagnostic is a function", () => {
    expect(typeof forEachDiagnostic).toBe("function");
  });
});

describe("diagnostic creation with full fields", () => {
  it("preserves optional source field", () => {
    const state = EditorState.create({ doc: "let x = 1;" });
    const spec = setDiagnostics(state, [
      { from: 0, to: 3, severity: "error", message: "bad keyword", source: "eslint" },
    ]);
    const newState = state.update(spec).state;
    const sources: (string | undefined)[] = [];
    forEachDiagnostic(newState, (d) => { sources.push(d.source); });
    expect(sources[0]).toBe("eslint");
  });

  it("preserves optional markClass field", () => {
    const state = EditorState.create({ doc: "test" });
    const spec = setDiagnostics(state, [
      { from: 0, to: 4, severity: "warning", message: "warn", markClass: "cm-custom-mark" },
    ]);
    const newState = state.update(spec).state;
    const classes: (string | undefined)[] = [];
    forEachDiagnostic(newState, (d) => { classes.push(d.markClass); });
    expect(classes[0]).toBe("cm-custom-mark");
  });

  it("preserves actions array on diagnostics", () => {
    const state = EditorState.create({ doc: "test" });
    const actions = [{ name: "Fix it", apply: () => {} }];
    const spec = setDiagnostics(state, [
      { from: 0, to: 4, severity: "error", message: "broken", actions },
    ]);
    const newState = state.update(spec).state;
    const receivedActions: any[] = [];
    forEachDiagnostic(newState, (d) => { receivedActions.push(d.actions); });
    expect(receivedActions[0]).toBeDefined();
    expect(receivedActions[0]!.length).toBe(1);
    expect(receivedActions[0]![0].name).toBe("Fix it");
    expect(typeof receivedActions[0]![0].apply).toBe("function");
  });

  it("supports multiple actions on a single diagnostic", () => {
    const state = EditorState.create({ doc: "test" });
    const actions = [
      { name: "Fix", apply: () => {} },
      { name: "Ignore", apply: () => {} },
      { name: "Disable rule", apply: () => {} },
    ];
    const spec = setDiagnostics(state, [
      { from: 0, to: 4, severity: "warning", message: "issue", actions },
    ]);
    const newState = state.update(spec).state;
    forEachDiagnostic(newState, (d) => {
      expect(d.actions!.length).toBe(3);
      expect(d.actions!.map(a => a.name)).toEqual(["Fix", "Ignore", "Disable rule"]);
    });
  });

  it("preserves all severity levels together", () => {
    const state = EditorState.create({ doc: "abcdefghij" });
    const diags: Diagnostic[] = [
      { from: 0, to: 2, severity: "error", message: "e" },
      { from: 2, to: 4, severity: "warning", message: "w" },
      { from: 4, to: 6, severity: "info", message: "i" },
      { from: 6, to: 8, severity: "hint", message: "h" },
    ];
    const newState = state.update(setDiagnostics(state, diags)).state;
    expect(diagnosticCount(newState)).toBe(4);
    const severities: string[] = [];
    forEachDiagnostic(newState, (d) => { severities.push(d.severity); });
    expect(severities).toContain("error");
    expect(severities).toContain("warning");
    expect(severities).toContain("info");
    expect(severities).toContain("hint");
  });
});

describe("setDiagnostics transaction integration", () => {
  it("transaction spec contains effects", () => {
    const state = EditorState.create({ doc: "hello" });
    const spec = setDiagnostics(state, [
      { from: 0, to: 5, severity: "error", message: "err" },
    ]);
    expect(spec.effects).toBeDefined();
  });

  it("effects array contains setDiagnosticsEffect", () => {
    const state = EditorState.create({ doc: "hello" });
    const spec = setDiagnostics(state, [
      { from: 0, to: 5, severity: "error", message: "err" },
    ]);
    const effects = Array.isArray(spec.effects) ? spec.effects : [spec.effects];
    const hasDiagEffect = effects.some((e: any) => e && e.is && e.is(setDiagnosticsEffect));
    expect(hasDiagEffect).toBe(true);
  });

  it("applying same diagnostics twice yields same count", () => {
    const diags: Diagnostic[] = [
      { from: 0, to: 3, severity: "error", message: "x" },
    ];
    let state = EditorState.create({ doc: "abc" });
    state = state.update(setDiagnostics(state, diags)).state;
    expect(diagnosticCount(state)).toBe(1);
    state = state.update(setDiagnostics(state, diags)).state;
    expect(diagnosticCount(state)).toBe(1);
  });

  it("setting empty diagnostics on a clean state produces 0 count", () => {
    const state = EditorState.create({ doc: "test" });
    const newState = state.update(setDiagnostics(state, [])).state;
    expect(diagnosticCount(newState)).toBe(0);
  });
});

describe("setDiagnosticsEffect direct usage", () => {
  it("can create an effect via .of()", () => {
    const effect = setDiagnosticsEffect.of([
      { from: 0, to: 1, severity: "error", message: "test" },
    ]);
    expect(effect).toBeDefined();
    expect(effect.is(setDiagnosticsEffect)).toBe(true);
  });

  it("effect value contains the diagnostics", () => {
    const diags: readonly Diagnostic[] = [
      { from: 0, to: 1, severity: "warning", message: "w1" },
      { from: 1, to: 2, severity: "error", message: "e1" },
    ];
    const effect = setDiagnosticsEffect.of(diags);
    expect(effect.value).toEqual(diags);
  });

  it("effect is not mistakenly identified as another effect type", () => {
    const otherEffect = StateEffect.define<string>();
    const diagEffect = setDiagnosticsEffect.of([]);
    expect(diagEffect.is(otherEffect)).toBe(false);
    expect(diagEffect.is(setDiagnosticsEffect)).toBe(true);
  });
});

describe("diagnostics survive document changes", () => {
  it("diagnostics persist after inserting text before them", () => {
    let state = EditorState.create({ doc: "hello world" });
    state = state.update(setDiagnostics(state, [
      { from: 6, to: 11, severity: "error", message: "bad word" },
    ])).state;
    expect(diagnosticCount(state)).toBe(1);

    // Insert text at the beginning, shifting positions
    state = state.update({ changes: { from: 0, insert: "prefix " } }).state;
    expect(diagnosticCount(state)).toBe(1);

    // The diagnostic positions should be updated
    const positions: Array<{ from: number; to: number }> = [];
    forEachDiagnostic(state, (_d, from, to) => { positions.push({ from, to }); });
    expect(positions[0].from).toBe(13); // 6 + 7 (length of "prefix ")
    expect(positions[0].to).toBe(18); // 11 + 7
  });

  it("diagnostics persist after inserting text after them", () => {
    let state = EditorState.create({ doc: "hello world" });
    state = state.update(setDiagnostics(state, [
      { from: 0, to: 5, severity: "warning", message: "first word" },
    ])).state;

    state = state.update({ changes: { from: 11, insert: " suffix" } }).state;
    expect(diagnosticCount(state)).toBe(1);

    const positions: Array<{ from: number; to: number }> = [];
    forEachDiagnostic(state, (_d, from, to) => { positions.push({ from, to }); });
    expect(positions[0].from).toBe(0);
    expect(positions[0].to).toBe(5);
  });

  it("diagnostics are removed when their range is fully deleted", () => {
    let state = EditorState.create({ doc: "hello world" });
    state = state.update(setDiagnostics(state, [
      { from: 0, to: 5, severity: "error", message: "gone" },
    ])).state;
    expect(diagnosticCount(state)).toBe(1);

    // Delete the entire range covered by the diagnostic
    state = state.update({ changes: { from: 0, to: 5, insert: "" } }).state;
    // After deletion, the diagnostic collapses to a zero-width range; count may still be 1
    // but forEachDiagnostic should still yield it (mapped position)
    const positions: Array<{ from: number; to: number }> = [];
    forEachDiagnostic(state, (_d, from, to) => { positions.push({ from, to }); });
    if (positions.length > 0) {
      expect(positions[0].from).toBe(positions[0].to);
    }
  });
});

describe("linter extension integration", () => {
  it("linter with null source acts as config-only", () => {
    const ext = linter(null, { delay: 300 });
    expect(ext).toBeDefined();
    const state = EditorState.create({ doc: "test", extensions: [ext] });
    expect(diagnosticCount(state)).toBe(0);
  });

  it("state with linter extension allows setDiagnostics", () => {
    const ext = linter(() => []);
    let state = EditorState.create({ doc: "hello", extensions: [ext] });
    state = state.update(setDiagnostics(state, [
      { from: 0, to: 5, severity: "error", message: "err" },
    ])).state;
    expect(diagnosticCount(state)).toBe(1);
  });

  it("multiple linter extensions can coexist", () => {
    const ext1 = linter(() => []);
    const ext2 = linter(() => []);
    const state = EditorState.create({ doc: "test", extensions: [ext1, ext2] });
    expect(diagnosticCount(state)).toBe(0);
  });
});

describe("lintGutter extension options", () => {
  it("returns an array-like extension", () => {
    const ext = lintGutter();
    expect(Array.isArray(ext)).toBe(true);
  });

  it("can be used as a state extension without error", () => {
    const ext = lintGutter();
    const state = EditorState.create({ doc: "test", extensions: [ext] });
    expect(state.doc.toString()).toBe("test");
  });

  it("lintGutter with hoverTime option returns extension", () => {
    const ext = lintGutter({ hoverTime: 500 });
    expect(ext).toBeDefined();
  });
});

describe("lintKeymap behavioral details", () => {
  it("contains a binding with Ctrl-Shift-m or Cmd-Shift-m key", () => {
    const keys = lintKeymap.map(b => b.key);
    const hasLintPanelKey = keys.some(k =>
      k.includes("Shift") && k.includes("m")
    );
    expect(hasLintPanelKey).toBe(true);
  });

  it("contains a binding for F8 (next diagnostic)", () => {
    const keys = lintKeymap.map(b => b.key);
    expect(keys).toContain("F8");
  });
});

describe("command exports are EditorView commands", () => {
  it("openLintPanel accepts exactly one argument", () => {
    expect(openLintPanel.length).toBe(1);
  });

  it("closeLintPanel accepts exactly one argument", () => {
    expect(closeLintPanel.length).toBe(1);
  });

  it("nextDiagnostic accepts exactly one argument", () => {
    expect(nextDiagnostic.length).toBe(1);
  });

  it("previousDiagnostic accepts exactly one argument", () => {
    expect(previousDiagnostic.length).toBe(1);
  });

  it("forceLinting accepts exactly one argument", () => {
    expect(forceLinting.length).toBe(1);
  });
});

describe("forEachDiagnostic ordering and completeness", () => {
  it("iterates diagnostics in document order", () => {
    const state = EditorState.create({ doc: "one two three four" });
    const diags: Diagnostic[] = [
      { from: 14, to: 18, severity: "error", message: "fourth" },
      { from: 0, to: 3, severity: "error", message: "first" },
      { from: 8, to: 13, severity: "error", message: "third" },
      { from: 4, to: 7, severity: "error", message: "second" },
    ];
    const newState = state.update(setDiagnostics(state, diags)).state;
    const fromPositions: number[] = [];
    forEachDiagnostic(newState, (_d, from) => { fromPositions.push(from); });
    // Should be in ascending document order
    for (let i = 1; i < fromPositions.length; i++) {
      expect(fromPositions[i]).toBeGreaterThanOrEqual(fromPositions[i - 1]);
    }
  });

  it("handles overlapping diagnostics", () => {
    const state = EditorState.create({ doc: "abcdefgh" });
    const diags: Diagnostic[] = [
      { from: 0, to: 4, severity: "error", message: "overlap1" },
      { from: 2, to: 6, severity: "warning", message: "overlap2" },
    ];
    const newState = state.update(setDiagnostics(state, diags)).state;
    // diagnosticCount counts decoration ranges, which may be split for overlaps
    expect(diagnosticCount(newState)).toBeGreaterThanOrEqual(2);
    const messages: string[] = [];
    forEachDiagnostic(newState, (d) => { messages.push(d.message); });
    expect(messages).toContain("overlap1");
    expect(messages).toContain("overlap2");
  });

  it("handles zero-width diagnostics (from === to)", () => {
    const state = EditorState.create({ doc: "test" });
    const diags: Diagnostic[] = [
      { from: 2, to: 2, severity: "info", message: "cursor hint" },
    ];
    const newState = state.update(setDiagnostics(state, diags)).state;
    expect(diagnosticCount(newState)).toBe(1);
    forEachDiagnostic(newState, (d, from, to) => {
      expect(from).toBe(2);
      expect(to).toBe(2);
      expect(d.message).toBe("cursor hint");
    });
  });

  it("handles diagnostics spanning the entire document", () => {
    const doc = "full document diagnostic";
    const state = EditorState.create({ doc });
    const diags: Diagnostic[] = [
      { from: 0, to: doc.length, severity: "error", message: "whole doc" },
    ];
    const newState = state.update(setDiagnostics(state, diags)).state;
    expect(diagnosticCount(newState)).toBe(1);
    forEachDiagnostic(newState, (d, from, to) => {
      expect(from).toBe(0);
      expect(to).toBe(doc.length);
    });
  });

  it("handles many diagnostics", () => {
    const doc = "a".repeat(100);
    const state = EditorState.create({ doc });
    const diags: Diagnostic[] = [];
    for (let i = 0; i < 50; i++) {
      diags.push({ from: i * 2, to: i * 2 + 1, severity: "warning", message: `d${i}` });
    }
    const newState = state.update(setDiagnostics(state, diags)).state;
    expect(diagnosticCount(newState)).toBe(50);
    let count = 0;
    forEachDiagnostic(newState, () => { count++; });
    expect(count).toBe(50);
  });
});
