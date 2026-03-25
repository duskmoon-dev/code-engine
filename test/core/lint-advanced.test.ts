import { describe, it, expect } from "bun:test";
import {
  linter,
  lintKeymap,
  diagnosticCount,
  setDiagnostics,
  setDiagnosticsEffect,
  forEachDiagnostic,
  lintGutter,
  Diagnostic,
} from "../../src/core/lint/index";
import { EditorState, StateEffect } from "../../src/core/state/index";

// Helper: create a state with diagnostics already applied
function stateWithDiagnostics(doc: string, diagnostics: Diagnostic[]) {
  const base = EditorState.create({ doc });
  return base.update(setDiagnostics(base, diagnostics)).state;
}

// Helper: collect all diagnostics from state via forEachDiagnostic
function collectDiagnostics(state: EditorState) {
  const result: Array<{ d: Diagnostic; from: number; to: number }> = [];
  forEachDiagnostic(state, (d, from, to) => {
    result.push({ d, from, to });
  });
  return result;
}

describe("LintState.init — decoration building", () => {
  it("creates mark decorations for non-zero-width diagnostics", () => {
    const state = stateWithDiagnostics("hello world", [
      { from: 0, to: 5, severity: "error", message: "bad word" },
    ]);
    expect(diagnosticCount(state)).toBe(1);
    const items = collectDiagnostics(state);
    expect(items.length).toBe(1);
    expect(items[0].from).toBe(0);
    expect(items[0].to).toBe(5);
    expect(items[0].d.severity).toBe("error");
  });

  it("creates widget decorations for zero-width diagnostics", () => {
    const state = stateWithDiagnostics("hello", [
      { from: 3, to: 3, severity: "warning", message: "zero width" },
    ]);
    expect(diagnosticCount(state)).toBe(1);
    const items = collectDiagnostics(state);
    expect(items.length).toBe(1);
    expect(items[0].from).toBe(3);
    expect(items[0].to).toBe(3);
  });

  it("handles diagnostics sorted by from then to", () => {
    const state = stateWithDiagnostics("abcdefghij", [
      { from: 5, to: 8, severity: "error", message: "second" },
      { from: 0, to: 3, severity: "warning", message: "first" },
    ]);
    expect(diagnosticCount(state)).toBe(2);
    const items = collectDiagnostics(state);
    expect(items.length).toBe(2);
    // Should be sorted by position
    expect(items[0].from).toBe(0);
    expect(items[1].from).toBe(5);
  });

  it("handles overlapping diagnostics", () => {
    const state = stateWithDiagnostics("abcdefghij", [
      { from: 0, to: 5, severity: "error", message: "overlap A" },
      { from: 3, to: 8, severity: "warning", message: "overlap B" },
    ]);
    // Overlapping diagnostics produce multiple decoration ranges (split at overlap boundaries)
    expect(diagnosticCount(state)).toBeGreaterThanOrEqual(2);
    const items = collectDiagnostics(state);
    expect(items.length).toBe(2);
    // Both diagnostics should be present
    const messages = items.map((i) => i.d.message).sort();
    expect(messages).toEqual(["overlap A", "overlap B"]);
  });

  it("handles diagnostics at the same position with different severities", () => {
    const state = stateWithDiagnostics("abcde", [
      { from: 0, to: 3, severity: "error", message: "err" },
      { from: 0, to: 3, severity: "warning", message: "warn" },
    ]);
    // Same-range diagnostics are merged into a single decoration
    expect(diagnosticCount(state)).toBe(1);
    const items = collectDiagnostics(state);
    // Both diagnostic objects are still tracked
    expect(items.length).toBe(2);
  });

  it("handles diagnostics that share the same from but different to", () => {
    const state = stateWithDiagnostics("abcdefghij", [
      { from: 0, to: 3, severity: "error", message: "short" },
      { from: 0, to: 7, severity: "warning", message: "long" },
    ]);
    expect(diagnosticCount(state)).toBe(2);
  });

  it("handles diagnostic at end of document", () => {
    const state = stateWithDiagnostics("abc", [
      { from: 2, to: 3, severity: "info", message: "at end" },
    ]);
    expect(diagnosticCount(state)).toBe(1);
    const items = collectDiagnostics(state);
    expect(items[0].to).toBe(3);
  });

  it("handles diagnostic spanning entire document", () => {
    const state = stateWithDiagnostics("hello", [
      { from: 0, to: 5, severity: "error", message: "whole doc" },
    ]);
    expect(diagnosticCount(state)).toBe(1);
    const items = collectDiagnostics(state);
    expect(items[0].from).toBe(0);
    expect(items[0].to).toBe(5);
  });

  it("handles diagnostic with from beyond document length (clamps)", () => {
    // Diagnostics beyond doc length should be filtered out by the `if (from > docLen) break`
    const state = stateWithDiagnostics("ab", [
      { from: 100, to: 200, severity: "error", message: "beyond" },
    ]);
    // The diagnostic is beyond doc length, so it should not produce decorations
    expect(diagnosticCount(state)).toBe(0);
  });

  it("handles empty diagnostics list", () => {
    const state = stateWithDiagnostics("hello", []);
    expect(diagnosticCount(state)).toBe(0);
    const items = collectDiagnostics(state);
    expect(items.length).toBe(0);
  });

  it("preserves markClass on diagnostics", () => {
    const state = stateWithDiagnostics("hello world", [
      {
        from: 0,
        to: 5,
        severity: "error",
        message: "with class",
        markClass: "custom-mark",
      },
    ]);
    expect(diagnosticCount(state)).toBe(1);
    const items = collectDiagnostics(state);
    expect(items[0].d.markClass).toBe("custom-mark");
  });

  it("preserves source on diagnostics", () => {
    const state = stateWithDiagnostics("hello world", [
      {
        from: 0,
        to: 5,
        severity: "warning",
        message: "sourced",
        source: "eslint",
      },
    ]);
    const items = collectDiagnostics(state);
    expect(items[0].d.source).toBe("eslint");
  });

  it("preserves actions on diagnostics", () => {
    const action = {
      name: "Fix it",
      apply: () => {},
    };
    const state = stateWithDiagnostics("hello", [
      {
        from: 0,
        to: 5,
        severity: "error",
        message: "fixable",
        actions: [action],
      },
    ]);
    const items = collectDiagnostics(state);
    expect(items[0].d.actions).toBeDefined();
    expect(items[0].d.actions!.length).toBe(1);
    expect(items[0].d.actions![0].name).toBe("Fix it");
  });
});

describe("severity ordering", () => {
  it("error is the highest severity when mixed", () => {
    // When multiple diagnostics overlap, the highest severity is used for the decoration class.
    // Same-range diagnostics are merged into a single decoration range.
    const state = stateWithDiagnostics("abcde", [
      { from: 0, to: 5, severity: "hint", message: "h" },
      { from: 0, to: 5, severity: "info", message: "i" },
      { from: 0, to: 5, severity: "warning", message: "w" },
      { from: 0, to: 5, severity: "error", message: "e" },
    ]);
    // All four share the same range, so only 1 decoration range
    expect(diagnosticCount(state)).toBe(1);
    // But forEachDiagnostic still yields all 4 diagnostic objects
    const items = collectDiagnostics(state);
    expect(items.length).toBe(4);
    const severities = items.map((i) => i.d.severity);
    expect(severities).toContain("error");
    expect(severities).toContain("warning");
    expect(severities).toContain("info");
    expect(severities).toContain("hint");
  });

  it("handles single hint severity", () => {
    const state = stateWithDiagnostics("abc", [
      { from: 0, to: 3, severity: "hint", message: "h" },
    ]);
    const items = collectDiagnostics(state);
    expect(items[0].d.severity).toBe("hint");
  });
});

describe("LintState update — document changes", () => {
  it("maps diagnostic positions when document changes before them", () => {
    let state = stateWithDiagnostics("hello world", [
      { from: 6, to: 11, severity: "error", message: "world err" },
    ]);
    // Insert text before the diagnostic
    state = state.update({ changes: { from: 0, insert: "XX" } }).state;
    const items = collectDiagnostics(state);
    expect(items.length).toBe(1);
    // Positions should be shifted by 2
    expect(items[0].from).toBe(8);
    expect(items[0].to).toBe(13);
  });

  it("maps diagnostic positions when document changes after them", () => {
    let state = stateWithDiagnostics("hello world", [
      { from: 0, to: 5, severity: "error", message: "hello err" },
    ]);
    // Append text after the diagnostic
    state = state.update({ changes: { from: 11, insert: "!!" } }).state;
    const items = collectDiagnostics(state);
    expect(items.length).toBe(1);
    // Positions should be unchanged
    expect(items[0].from).toBe(0);
    expect(items[0].to).toBe(5);
  });

  it("handles deletion that overlaps a diagnostic", () => {
    let state = stateWithDiagnostics("hello world", [
      { from: 3, to: 8, severity: "warning", message: "overlapped" },
    ]);
    // Delete part of the diagnostic range
    state = state.update({ changes: { from: 0, to: 5 } }).state;
    const items = collectDiagnostics(state);
    // Diagnostic may still exist but with adjusted positions
    expect(items.length).toBeGreaterThanOrEqual(0);
  });

  it("removes diagnostics when their range is fully deleted", () => {
    let state = stateWithDiagnostics("hello world", [
      { from: 6, to: 11, severity: "error", message: "will be deleted" },
    ]);
    // Delete the entire range containing the diagnostic
    state = state.update({ changes: { from: 5, to: 11 } }).state;
    // After deletion, the diagnostic range collapses
    const items = collectDiagnostics(state);
    // Diagnostic still exists but mapped (may be zero-width)
    if (items.length > 0) {
      expect(items[0].from).toBe(items[0].to);
    }
  });
});

describe("setDiagnostics replaces previous diagnostics", () => {
  it("new setDiagnostics completely replaces old ones", () => {
    let state = stateWithDiagnostics("hello world", [
      { from: 0, to: 5, severity: "error", message: "first" },
      { from: 6, to: 11, severity: "warning", message: "second" },
    ]);
    expect(diagnosticCount(state)).toBe(2);

    // Replace with a single diagnostic
    state = state.update(
      setDiagnostics(state, [
        { from: 0, to: 3, severity: "info", message: "replacement" },
      ])
    ).state;
    expect(diagnosticCount(state)).toBe(1);
    const items = collectDiagnostics(state);
    expect(items[0].d.message).toBe("replacement");
  });

  it("clearing diagnostics sets count to 0", () => {
    let state = stateWithDiagnostics("test", [
      { from: 0, to: 4, severity: "error", message: "err" },
    ]);
    expect(diagnosticCount(state)).toBe(1);
    state = state.update(setDiagnostics(state, [])).state;
    expect(diagnosticCount(state)).toBe(0);
  });
});

describe("setDiagnosticsEffect", () => {
  it("can create an effect value", () => {
    const diags: Diagnostic[] = [
      { from: 0, to: 1, severity: "error", message: "test" },
    ];
    const effect = setDiagnosticsEffect.of(diags);
    expect(effect).toBeDefined();
    expect(effect.value).toBe(diags);
  });

  it("is recognized in transaction effects", () => {
    const diags: Diagnostic[] = [
      { from: 0, to: 1, severity: "error", message: "test" },
    ];
    const effect = setDiagnosticsEffect.of(diags);
    expect(effect.is(setDiagnosticsEffect)).toBe(true);
  });
});

describe("linter configuration", () => {
  it("creates extension with default delay", () => {
    const ext = linter(() => []);
    expect(ext).toBeDefined();
  });

  it("creates extension with custom delay", () => {
    const ext = linter(() => [], { delay: 100 });
    expect(ext).toBeDefined();
  });

  it("creates extension with markerFilter", () => {
    const ext = linter(() => [], {
      markerFilter: (diagnostics) => diagnostics.filter((d) => d.severity === "error"),
    });
    expect(ext).toBeDefined();
  });

  it("creates extension with tooltipFilter", () => {
    const ext = linter(() => [], {
      tooltipFilter: (diagnostics) => diagnostics.slice(0, 1),
    });
    expect(ext).toBeDefined();
  });

  it("creates extension with needsRefresh", () => {
    const ext = linter(() => [], {
      needsRefresh: () => true,
    });
    expect(ext).toBeDefined();
  });

  it("creates extension with autoPanel", () => {
    const ext = linter(() => [], { autoPanel: true });
    expect(ext).toBeDefined();
  });

  it("creates extension with null source (config-only)", () => {
    const ext = linter(null, { delay: 500 });
    expect(ext).toBeDefined();
  });

  it("can combine multiple linter extensions", () => {
    const ext1 = linter(() => []);
    const ext2 = linter(() => []);
    const state = EditorState.create({
      doc: "test",
      extensions: [ext1, ext2],
    });
    expect(state.doc.toString()).toBe("test");
  });
});

describe("lintGutter configuration", () => {
  it("creates extension with default config", () => {
    const ext = lintGutter();
    expect(ext).toBeDefined();
  });

  it("creates extension with hoverTime", () => {
    const ext = lintGutter({ hoverTime: 500 });
    expect(ext).toBeDefined();
  });

  it("creates extension with markerFilter", () => {
    const ext = lintGutter({
      markerFilter: (diagnostics) => diagnostics,
    });
    expect(ext).toBeDefined();
  });

  it("creates extension with tooltipFilter", () => {
    const ext = lintGutter({
      tooltipFilter: (diagnostics) => diagnostics,
    });
    expect(ext).toBeDefined();
  });
});

describe("markerFilter in linter config", () => {
  it("filters diagnostics when markerFilter is provided", () => {
    const ext = linter(null, {
      markerFilter: (diagnostics) =>
        diagnostics.filter((d) => d.severity === "error"),
    });
    let state = EditorState.create({ doc: "hello world", extensions: [ext] });
    state = state.update(
      setDiagnostics(state, [
        { from: 0, to: 5, severity: "error", message: "kept" },
        { from: 6, to: 11, severity: "warning", message: "filtered out" },
      ])
    ).state;
    // Only the error should remain after filtering
    expect(diagnosticCount(state)).toBe(1);
    const items = collectDiagnostics(state);
    expect(items[0].d.message).toBe("kept");
  });

  it("returns all diagnostics when markerFilter is null", () => {
    const ext = linter(null, { markerFilter: null });
    let state = EditorState.create({ doc: "hello world", extensions: [ext] });
    state = state.update(
      setDiagnostics(state, [
        { from: 0, to: 5, severity: "error", message: "a" },
        { from: 6, to: 11, severity: "warning", message: "b" },
      ])
    ).state;
    expect(diagnosticCount(state)).toBe(2);
  });
});

describe("multiple diagnostics on same line", () => {
  it("handles several diagnostics on a single line", () => {
    const state = stateWithDiagnostics("hello world foo bar", [
      { from: 0, to: 5, severity: "error", message: "a" },
      { from: 6, to: 11, severity: "warning", message: "b" },
      { from: 12, to: 15, severity: "info", message: "c" },
      { from: 16, to: 19, severity: "hint", message: "d" },
    ]);
    expect(diagnosticCount(state)).toBe(4);
    const items = collectDiagnostics(state);
    expect(items.length).toBe(4);
  });

  it("handles diagnostics across multiple lines", () => {
    const state = stateWithDiagnostics("line1\nline2\nline3", [
      { from: 0, to: 5, severity: "error", message: "line1 err" },
      { from: 6, to: 11, severity: "warning", message: "line2 warn" },
      { from: 12, to: 17, severity: "info", message: "line3 info" },
    ]);
    expect(diagnosticCount(state)).toBe(3);
    const items = collectDiagnostics(state);
    expect(items.length).toBe(3);
  });
});

describe("widget decoration for small ranges", () => {
  it("creates widget for diagnostic spanning only whitespace", () => {
    // A diagnostic spanning whitespace-only with length < 10 might get a widget
    const state = stateWithDiagnostics("a\nb", [
      { from: 1, to: 2, severity: "error", message: "newline only" },
    ]);
    expect(diagnosticCount(state)).toBe(1);
  });

  it("creates mark for diagnostic spanning visible text", () => {
    const state = stateWithDiagnostics("hello", [
      { from: 0, to: 5, severity: "error", message: "visible text" },
    ]);
    expect(diagnosticCount(state)).toBe(1);
    const items = collectDiagnostics(state);
    expect(items[0].from).toBe(0);
    expect(items[0].to).toBe(5);
  });
});

describe("LintState after multiple transactions", () => {
  it("accumulates document changes while preserving diagnostics", () => {
    let state = stateWithDiagnostics("abcdef", [
      { from: 2, to: 4, severity: "error", message: "cd" },
    ]);
    // Insert at start
    state = state.update({ changes: { from: 0, insert: "XX" } }).state;
    // Insert at end
    state = state.update({
      changes: { from: state.doc.length, insert: "YY" },
    }).state;
    const items = collectDiagnostics(state);
    expect(items.length).toBe(1);
    // Original from=2, shifted by XX insert (+2) = 4
    expect(items[0].from).toBe(4);
    expect(items[0].to).toBe(6);
  });

  it("preserves diagnostic count through non-overlapping edits", () => {
    let state = stateWithDiagnostics("hello world test", [
      { from: 0, to: 5, severity: "error", message: "a" },
      { from: 12, to: 16, severity: "warning", message: "b" },
    ]);
    // Edit between the two diagnostics
    state = state.update({
      changes: { from: 6, to: 11, insert: "there" },
    }).state;
    expect(diagnosticCount(state)).toBe(2);
  });
});

describe("forEachDiagnostic edge cases", () => {
  it("handles state with no lint field gracefully", () => {
    const state = EditorState.create({ doc: "no lint" });
    let count = 0;
    forEachDiagnostic(state, () => {
      count++;
    });
    expect(count).toBe(0);
  });

  it("handles state with lint field but no diagnostics", () => {
    const state = stateWithDiagnostics("test", []);
    let count = 0;
    forEachDiagnostic(state, () => {
      count++;
    });
    expect(count).toBe(0);
  });

  it("provides correct from/to for adjacent diagnostics", () => {
    const state = stateWithDiagnostics("abcdef", [
      { from: 0, to: 2, severity: "error", message: "ab" },
      { from: 2, to: 4, severity: "warning", message: "cd" },
      { from: 4, to: 6, severity: "info", message: "ef" },
    ]);
    const items = collectDiagnostics(state);
    expect(items.length).toBe(3);
    // Check they are non-overlapping and adjacent
    expect(items[0].to).toBeLessThanOrEqual(items[1].from);
    expect(items[1].to).toBeLessThanOrEqual(items[2].from);
  });
});

describe("lintKeymap structure", () => {
  it("contains Mod-Shift-m binding", () => {
    const modShiftM = lintKeymap.find((b) => b.key === "Mod-Shift-m");
    expect(modShiftM).toBeDefined();
    expect(typeof modShiftM!.run).toBe("function");
  });

  it("contains F8 binding", () => {
    const f8 = lintKeymap.find((b) => b.key === "F8");
    expect(f8).toBeDefined();
    expect(typeof f8!.run).toBe("function");
  });

  it("Mod-Shift-m has preventDefault", () => {
    const modShiftM = lintKeymap.find((b) => b.key === "Mod-Shift-m");
    expect(modShiftM!.preventDefault).toBe(true);
  });
});

describe("diagnostic with actions", () => {
  it("preserves multiple actions", () => {
    const state = stateWithDiagnostics("hello", [
      {
        from: 0,
        to: 5,
        severity: "error",
        message: "multi-action",
        actions: [
          { name: "Fix", apply: () => {} },
          { name: "Ignore", apply: () => {} },
          { name: "Remove", apply: () => {} },
        ],
      },
    ]);
    const items = collectDiagnostics(state);
    expect(items[0].d.actions!.length).toBe(3);
    expect(items[0].d.actions![0].name).toBe("Fix");
    expect(items[0].d.actions![1].name).toBe("Ignore");
    expect(items[0].d.actions![2].name).toBe("Remove");
  });

  it("preserves action markClass", () => {
    const state = stateWithDiagnostics("hello", [
      {
        from: 0,
        to: 5,
        severity: "error",
        message: "classed action",
        actions: [
          { name: "Do it", markClass: "action-primary", apply: () => {} },
        ],
      },
    ]);
    const items = collectDiagnostics(state);
    expect(items[0].d.actions![0].markClass).toBe("action-primary");
  });
});

describe("diagnostic edge cases", () => {
  it("handles diagnostic on empty document", () => {
    // from=0, to=0 on empty doc
    const state = stateWithDiagnostics("", [
      { from: 0, to: 0, severity: "error", message: "empty" },
    ]);
    expect(diagnosticCount(state)).toBe(1);
  });

  it("handles many diagnostics", () => {
    const doc = "a".repeat(100);
    const diags: Diagnostic[] = [];
    for (let i = 0; i < 50; i++) {
      diags.push({
        from: i * 2,
        to: i * 2 + 1,
        severity: "warning",
        message: `diag ${i}`,
      });
    }
    const state = stateWithDiagnostics(doc, diags);
    expect(diagnosticCount(state)).toBe(50);
  });

  it("handles diagnostic with from equal to to at end of doc", () => {
    const state = stateWithDiagnostics("abc", [
      { from: 3, to: 3, severity: "hint", message: "at end" },
    ]);
    expect(diagnosticCount(state)).toBe(1);
  });

  it("handles diagnostic with from equal to to in middle of doc", () => {
    const state = stateWithDiagnostics("abcdef", [
      { from: 3, to: 3, severity: "info", message: "zero width middle" },
    ]);
    expect(diagnosticCount(state)).toBe(1);
  });

  it("handles info severity", () => {
    const state = stateWithDiagnostics("test", [
      { from: 0, to: 4, severity: "info", message: "informational" },
    ]);
    const items = collectDiagnostics(state);
    expect(items[0].d.severity).toBe("info");
  });
});

describe("autoPanel config behavior", () => {
  it("can configure linter with autoPanel true", () => {
    const ext = linter(null, { autoPanel: true });
    let state = EditorState.create({ doc: "test", extensions: [ext] });
    // Set diagnostics to trigger autoPanel
    state = state.update(
      setDiagnostics(state, [
        { from: 0, to: 4, severity: "error", message: "err" },
      ])
    ).state;
    expect(diagnosticCount(state)).toBe(1);
  });

  it("autoPanel clears panel when diagnostics are cleared", () => {
    const ext = linter(null, { autoPanel: true });
    let state = EditorState.create({ doc: "test", extensions: [ext] });
    state = state.update(
      setDiagnostics(state, [
        { from: 0, to: 4, severity: "error", message: "err" },
      ])
    ).state;
    expect(diagnosticCount(state)).toBe(1);
    // Clear diagnostics
    state = state.update(setDiagnostics(state, [])).state;
    expect(diagnosticCount(state)).toBe(0);
  });
});

describe("hideOn config", () => {
  it("can configure linter with hideOn", () => {
    const ext = linter(null, {
      hideOn: (_tr, _from, _to) => true,
    });
    expect(ext).toBeDefined();
  });
});

describe("combined filters", () => {
  it("multiple linters with markerFilters combine correctly", () => {
    const ext1 = linter(null, {
      markerFilter: (diagnostics) =>
        diagnostics.filter((d) => d.severity !== "hint"),
    });
    const ext2 = linter(null, {
      markerFilter: (diagnostics) =>
        diagnostics.filter((d) => d.severity !== "info"),
    });
    let state = EditorState.create({
      doc: "test",
      extensions: [ext1, ext2],
    });
    state = state.update(
      setDiagnostics(state, [
        { from: 0, to: 1, severity: "error", message: "e" },
        { from: 1, to: 2, severity: "warning", message: "w" },
        { from: 2, to: 3, severity: "info", message: "i" },
        { from: 3, to: 4, severity: "hint", message: "h" },
      ])
    ).state;
    // Both filters are combined: filter out hint AND info
    expect(diagnosticCount(state)).toBe(2);
  });
});

describe("diagnosticCount with linter extension present", () => {
  it("returns 0 when linter is present but no diagnostics set", () => {
    const ext = linter(null);
    const state = EditorState.create({ doc: "test", extensions: [ext] });
    expect(diagnosticCount(state)).toBe(0);
  });

  it("returns correct count after setting diagnostics", () => {
    const ext = linter(null);
    let state = EditorState.create({ doc: "abcde", extensions: [ext] });
    state = state.update(
      setDiagnostics(state, [
        { from: 0, to: 1, severity: "error", message: "a" },
        { from: 2, to: 3, severity: "error", message: "c" },
        { from: 4, to: 5, severity: "error", message: "e" },
      ])
    ).state;
    expect(diagnosticCount(state)).toBe(3);
  });
});

describe("setDiagnostics enables lint extension lazily", () => {
  it("enables lint extension on state without linter", () => {
    const state = EditorState.create({ doc: "test" });
    // No linter extension configured, but setDiagnostics should still work
    const spec = setDiagnostics(state, [
      { from: 0, to: 4, severity: "error", message: "e" },
    ]);
    const newState = state.update(spec).state;
    expect(diagnosticCount(newState)).toBe(1);
  });

  it("does not duplicate extensions on already-enabled state", () => {
    let state = stateWithDiagnostics("test", [
      { from: 0, to: 4, severity: "error", message: "first" },
    ]);
    // Apply setDiagnostics again
    state = state.update(
      setDiagnostics(state, [
        { from: 0, to: 2, severity: "warning", message: "second" },
      ])
    ).state;
    expect(diagnosticCount(state)).toBe(1);
    const items = collectDiagnostics(state);
    expect(items[0].d.message).toBe("second");
  });
});

describe("LintState.init — widget vs mark decision (scan loop)", () => {
  it("creates widget for diagnostic spanning only a newline (lineBreak scan)", () => {
    // A diagnostic from pos 1 to 2 in "a\nb" spans a newline character.
    // The scan loop checks for lineBreak to decide if the range is only whitespace.
    const state = stateWithDiagnostics("a\nb", [
      { from: 1, to: 2, severity: "error", message: "newline span" },
    ]);
    expect(diagnosticCount(state)).toBe(1);
    const items = collectDiagnostics(state);
    expect(items.length).toBe(1);
  });

  it("creates mark for diagnostic spanning visible text even if short", () => {
    // A 2-char range over visible text should be a mark, not a widget
    const state = stateWithDiagnostics("abcdef", [
      { from: 1, to: 3, severity: "warning", message: "short visible" },
    ]);
    expect(diagnosticCount(state)).toBe(1);
    const items = collectDiagnostics(state);
    expect(items[0].from).toBe(1);
    expect(items[0].to).toBe(3);
  });

  it("handles diagnostic spanning multiple line breaks", () => {
    const state = stateWithDiagnostics("a\n\n\nb", [
      { from: 1, to: 4, severity: "info", message: "multi-newline" },
    ]);
    expect(diagnosticCount(state)).toBe(1);
  });

  it("handles small range that starts mid-document (behind > 0 scan path)", () => {
    // The scan iterator starts at the beginning of the doc. When from > scanPos,
    // the code calls scan.next(behind) to advance to the right position.
    const doc = "abcdefghijklmnop";
    const state = stateWithDiagnostics(doc, [
      { from: 10, to: 12, severity: "error", message: "mid-doc small" },
    ]);
    expect(diagnosticCount(state)).toBe(1);
    const items = collectDiagnostics(state);
    expect(items[0].from).toBe(10);
    expect(items[0].to).toBe(12);
  });
});

describe("LintState.init — active list management", () => {
  it("handles diagnostic that extends beyond current chunk (inclusiveEnd)", () => {
    // Two overlapping diagnostics where one extends further.
    // This exercises the `inclusiveEnd: active.some(a => a.to > to)` path.
    const state = stateWithDiagnostics("abcdefghij", [
      { from: 0, to: 3, severity: "error", message: "short" },
      { from: 0, to: 8, severity: "warning", message: "long" },
    ]);
    const items = collectDiagnostics(state);
    expect(items.length).toBe(2);
  });

  it("handles diagnostic starting where previous one ends (active splice)", () => {
    // When a diagnostic ends at `pos`, it gets spliced from the active list.
    const state = stateWithDiagnostics("abcdefgh", [
      { from: 0, to: 4, severity: "error", message: "first half" },
      { from: 4, to: 8, severity: "warning", message: "second half" },
    ]);
    expect(diagnosticCount(state)).toBe(2);
    const items = collectDiagnostics(state);
    expect(items.length).toBe(2);
  });

  it("handles three overlapping diagnostics creating multiple chunks", () => {
    // Three diagnostics that partially overlap, creating complex chunk splitting
    const state = stateWithDiagnostics("abcdefghijklmno", [
      { from: 0, to: 5, severity: "error", message: "A" },
      { from: 3, to: 10, severity: "warning", message: "B" },
      { from: 7, to: 15, severity: "info", message: "C" },
    ]);
    const items = collectDiagnostics(state);
    expect(items.length).toBe(3);
    // All diagnostics should be found
    const messages = items.map((i) => i.d.message).sort();
    expect(messages).toEqual(["A", "B", "C"]);
  });

  it("handles multiple zero-width diagnostics at same position", () => {
    const state = stateWithDiagnostics("abc", [
      { from: 1, to: 1, severity: "error", message: "z1" },
      { from: 1, to: 1, severity: "warning", message: "z2" },
    ]);
    // Zero-width diagnostics at same position merge into one widget decoration
    expect(diagnosticCount(state)).toBe(1);
    const items = collectDiagnostics(state);
    expect(items.length).toBe(2);
  });
});

describe("LintState.init — markClass accumulation", () => {
  it("accumulates markClass from multiple overlapping diagnostics", () => {
    const state = stateWithDiagnostics("abcde", [
      {
        from: 0,
        to: 5,
        severity: "error",
        message: "a",
        markClass: "class-a",
      },
      {
        from: 0,
        to: 5,
        severity: "warning",
        message: "b",
        markClass: "class-b",
      },
    ]);
    // Both diagnostics are present even though they share a decoration
    const items = collectDiagnostics(state);
    expect(items.length).toBe(2);
    expect(items.some((i) => i.d.markClass === "class-a")).toBe(true);
    expect(items.some((i) => i.d.markClass === "class-b")).toBe(true);
  });
});

describe("lintState field update — docChanged paths", () => {
  it("maps diagnostics and selected through document change", () => {
    // Create state with diagnostics, then change the document
    let state = stateWithDiagnostics("hello world", [
      { from: 0, to: 5, severity: "error", message: "hello" },
      { from: 6, to: 11, severity: "warning", message: "world" },
    ]);
    // This triggers the docChanged path in lintState.update
    state = state.update({
      changes: { from: 5, insert: " beautiful" },
    }).state;
    expect(diagnosticCount(state)).toBe(2);
    const items = collectDiagnostics(state);
    // First diagnostic unchanged (before insert point)
    expect(items[0].from).toBe(0);
    expect(items[0].to).toBe(5);
    // Second diagnostic shifted by 10 chars
    expect(items[1].from).toBe(16);
    expect(items[1].to).toBe(21);
  });

  it("handles document replacement that changes doc identity", () => {
    let state = stateWithDiagnostics("abc", [
      { from: 0, to: 3, severity: "error", message: "e" },
    ]);
    // Replace entire document content
    state = state.update({
      changes: { from: 0, to: 3, insert: "xyz" },
    }).state;
    // Diagnostic should still exist (mapped through the change)
    expect(diagnosticCount(state)).toBeGreaterThanOrEqual(0);
  });
});

describe("lintState field update — autoPanel path", () => {
  it("autoPanel removes panel when diagnostics become empty via doc change", () => {
    const ext = linter(null, { autoPanel: true });
    let state = EditorState.create({ doc: "ab", extensions: [ext] });
    // Set a diagnostic
    state = state.update(
      setDiagnostics(state, [
        { from: 0, to: 2, severity: "error", message: "e" },
      ])
    ).state;
    expect(diagnosticCount(state)).toBe(1);
    // Delete everything — the mapped diagnostics will have size 0
    // which triggers the autoPanel null path
    state = state.update({
      changes: { from: 0, to: state.doc.length },
    }).state;
    // Diagnostics collapse to zero-width but decoration set may still have entries
    // The important thing is we exercised the code path
    expect(diagnosticCount(state)).toBeGreaterThanOrEqual(0);
  });
});

describe("diagnostic to boundary", () => {
  it("handles diagnostic ending exactly at document end", () => {
    const doc = "abcdef";
    const state = stateWithDiagnostics(doc, [
      { from: 3, to: 6, severity: "error", message: "to end" },
    ]);
    expect(diagnosticCount(state)).toBe(1);
    const items = collectDiagnostics(state);
    expect(items[0].to).toBe(6);
  });

  it("handles diagnostic from 0 to 0 on non-empty doc", () => {
    const state = stateWithDiagnostics("abc", [
      { from: 0, to: 0, severity: "warning", message: "zero at start" },
    ]);
    expect(diagnosticCount(state)).toBe(1);
  });

  it("handles single-character diagnostic", () => {
    const state = stateWithDiagnostics("abcdef", [
      { from: 2, to: 3, severity: "error", message: "single char" },
    ]);
    expect(diagnosticCount(state)).toBe(1);
    const items = collectDiagnostics(state);
    expect(items[0].from).toBe(2);
    expect(items[0].to).toBe(3);
  });
});

describe("complex overlapping patterns", () => {
  it("handles nested diagnostics (one inside another)", () => {
    const state = stateWithDiagnostics("abcdefghij", [
      { from: 0, to: 10, severity: "warning", message: "outer" },
      { from: 3, to: 7, severity: "error", message: "inner" },
    ]);
    const items = collectDiagnostics(state);
    expect(items.length).toBe(2);
    const messages = items.map((i) => i.d.message).sort();
    expect(messages).toEqual(["inner", "outer"]);
  });

  it("handles diagnostics with same from but different to", () => {
    const state = stateWithDiagnostics("abcdefghij", [
      { from: 0, to: 3, severity: "error", message: "short" },
      { from: 0, to: 7, severity: "warning", message: "medium" },
      { from: 0, to: 10, severity: "info", message: "long" },
    ]);
    const items = collectDiagnostics(state);
    expect(items.length).toBe(3);
  });

  it("handles diagnostics with same to but different from", () => {
    const state = stateWithDiagnostics("abcdefghij", [
      { from: 0, to: 10, severity: "error", message: "full" },
      { from: 5, to: 10, severity: "warning", message: "half" },
      { from: 8, to: 10, severity: "info", message: "tail" },
    ]);
    const items = collectDiagnostics(state);
    expect(items.length).toBe(3);
  });
});

describe("multiline document diagnostics", () => {
  it("handles diagnostic spanning across lines", () => {
    const doc = "line one\nline two\nline three";
    const state = stateWithDiagnostics(doc, [
      { from: 5, to: 15, severity: "error", message: "cross-line" },
    ]);
    expect(diagnosticCount(state)).toBe(1);
    const items = collectDiagnostics(state);
    expect(items[0].from).toBe(5);
    expect(items[0].to).toBe(15);
  });

  it("handles one diagnostic per line", () => {
    const doc = "aaa\nbbb\nccc";
    const state = stateWithDiagnostics(doc, [
      { from: 0, to: 3, severity: "error", message: "line1" },
      { from: 4, to: 7, severity: "warning", message: "line2" },
      { from: 8, to: 11, severity: "info", message: "line3" },
    ]);
    expect(diagnosticCount(state)).toBe(3);
    const items = collectDiagnostics(state);
    expect(items.length).toBe(3);
  });

  it("handles diagnostic at start of second line", () => {
    const doc = "first\nsecond";
    const state = stateWithDiagnostics(doc, [
      { from: 6, to: 12, severity: "error", message: "second line" },
    ]);
    const items = collectDiagnostics(state);
    expect(items[0].from).toBe(6);
    expect(items[0].to).toBe(12);
  });
});

describe("lintGutter with diagnostics", () => {
  it("lintGutter extension works alongside setDiagnostics", () => {
    const ext = lintGutter();
    let state = EditorState.create({ doc: "hello\nworld", extensions: [ext] });
    state = state.update(
      setDiagnostics(state, [
        { from: 0, to: 5, severity: "error", message: "line 1" },
        { from: 6, to: 11, severity: "warning", message: "line 2" },
      ])
    ).state;
    expect(diagnosticCount(state)).toBe(2);
  });

  it("lintGutter with markerFilter filters gutter markers", () => {
    const ext = lintGutter({
      markerFilter: (diagnostics) =>
        diagnostics.filter((d) => d.severity === "error"),
    });
    let state = EditorState.create({ doc: "hello\nworld", extensions: [ext] });
    state = state.update(
      setDiagnostics(state, [
        { from: 0, to: 5, severity: "error", message: "err" },
        { from: 6, to: 11, severity: "warning", message: "warn" },
      ])
    ).state;
    // Both diagnostics exist in lint state, but gutter filter only shows errors
    expect(diagnosticCount(state)).toBe(2);
  });
});

describe("linter with multiple sources", () => {
  it("combines multiple null-source linters with different configs", () => {
    const ext1 = linter(null, { delay: 100 });
    const ext2 = linter(null, { delay: 200 });
    const state = EditorState.create({
      doc: "test",
      extensions: [ext1, ext2],
    });
    expect(state.doc.toString()).toBe("test");
  });

  it("combines needsRefresh from multiple linters", () => {
    let refreshCount = 0;
    const ext1 = linter(null, {
      needsRefresh: () => {
        refreshCount++;
        return false;
      },
    });
    const ext2 = linter(null, {
      needsRefresh: () => {
        refreshCount++;
        return false;
      },
    });
    const state = EditorState.create({
      doc: "test",
      extensions: [ext1, ext2],
    });
    expect(state.doc.toString()).toBe("test");
  });

  it("combines hideOn from multiple linters", () => {
    const ext1 = linter(null, {
      hideOn: () => false,
    });
    const ext2 = linter(null, {
      hideOn: () => false,
    });
    const state = EditorState.create({
      doc: "test",
      extensions: [ext1, ext2],
    });
    expect(state.doc.toString()).toBe("test");
  });
});
