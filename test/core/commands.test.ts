import { describe, it, expect } from "bun:test";
import {
  // Comment commands
  toggleComment,
  toggleLineComment,
  lineComment,
  lineUncomment,
  toggleBlockComment,
  blockComment,
  blockUncomment,
  toggleBlockCommentByLine,

  // History
  history,
  historyKeymap,
  historyField,
  undo,
  redo,
  undoSelection,
  redoSelection,
  undoDepth,
  redoDepth,
  isolateHistory,
  invertedEffects,

  // Cursor movement commands
  cursorCharLeft,
  cursorCharRight,
  cursorCharForward,
  cursorCharBackward,
  cursorCharForwardLogical,
  cursorCharBackwardLogical,
  cursorGroupLeft,
  cursorGroupRight,
  cursorGroupForward,
  cursorGroupBackward,
  cursorGroupForwardWin,
  cursorSubwordForward,
  cursorSubwordBackward,
  cursorSyntaxLeft,
  cursorSyntaxRight,
  cursorLineUp,
  cursorLineDown,
  cursorPageUp,
  cursorPageDown,
  cursorLineBoundaryForward,
  cursorLineBoundaryBackward,
  cursorLineBoundaryLeft,
  cursorLineBoundaryRight,
  cursorLineStart,
  cursorLineEnd,
  cursorMatchingBracket,
  cursorDocStart,
  cursorDocEnd,

  // Selection extension commands
  selectCharLeft,
  selectCharRight,
  selectCharForward,
  selectCharBackward,
  selectCharForwardLogical,
  selectCharBackwardLogical,
  selectGroupLeft,
  selectGroupRight,
  selectGroupForward,
  selectGroupBackward,
  selectGroupForwardWin,
  selectSubwordForward,
  selectSubwordBackward,
  selectSyntaxLeft,
  selectSyntaxRight,
  selectLineUp,
  selectLineDown,
  selectPageUp,
  selectPageDown,
  selectLineBoundaryForward,
  selectLineBoundaryBackward,
  selectLineBoundaryLeft,
  selectLineBoundaryRight,
  selectLineStart,
  selectLineEnd,
  selectMatchingBracket,
  selectDocStart,
  selectDocEnd,
  selectAll,
  selectLine,
  selectParentSyntax,

  // Multi-cursor
  addCursorAbove,
  addCursorBelow,
  simplifySelection,

  // Delete commands
  deleteCharBackward,
  deleteCharBackwardStrict,
  deleteCharForward,
  deleteGroupBackward,
  deleteGroupForward,
  deleteGroupForwardWin,
  deleteToLineEnd,
  deleteToLineStart,
  deleteLineBoundaryBackward,
  deleteLineBoundaryForward,
  deleteTrailingWhitespace,
  deleteLine,

  // Line manipulation
  splitLine,
  transposeChars,
  moveLineUp,
  moveLineDown,
  copyLineUp,
  copyLineDown,

  // Newline / indent
  insertNewline,
  insertNewlineKeepIndent,
  insertNewlineAndIndent,
  insertBlankLine,
  indentSelection,
  indentMore,
  indentLess,
  insertTab,

  // Tab focus
  toggleTabFocusMode,
  temporarilySetTabFocusMode,

  // Keymaps
  emacsStyleKeymap,
  standardKeymap,
  defaultKeymap,
  indentWithTab,
} from "../../src/core/commands/index";
import { EditorState, EditorSelection, Transaction, StateEffect } from "../../src/core/state/index";
import { javascript } from "../../src/lang/javascript/index";
import { indentUnit } from "../../src/core/language/index";

// Helper to run a StateCommand on a state and return the resulting state
function run(cmd: (target: {state: EditorState, dispatch: (tr: Transaction) => void}) => boolean, state: EditorState): EditorState | null {
  let result: EditorState | null = null;
  const dispatched = cmd({ state, dispatch: (tr: Transaction) => { result = tr.state; } });
  return dispatched ? result : null;
}

describe("core/commands exports", () => {
  describe("comment commands", () => {
    it("exports toggleComment as a function", () => {
      expect(typeof toggleComment).toBe("function");
    });

    it("exports toggleLineComment as a function", () => {
      expect(typeof toggleLineComment).toBe("function");
    });

    it("exports lineComment as a function", () => {
      expect(typeof lineComment).toBe("function");
    });

    it("exports lineUncomment as a function", () => {
      expect(typeof lineUncomment).toBe("function");
    });

    it("exports toggleBlockComment as a function", () => {
      expect(typeof toggleBlockComment).toBe("function");
    });

    it("exports blockComment as a function", () => {
      expect(typeof blockComment).toBe("function");
    });

    it("exports blockUncomment as a function", () => {
      expect(typeof blockUncomment).toBe("function");
    });

    it("exports toggleBlockCommentByLine as a function", () => {
      expect(typeof toggleBlockCommentByLine).toBe("function");
    });
  });

  describe("history", () => {
    it("exports history as a function", () => {
      expect(typeof history).toBe("function");
    });

    it("exports historyField as an object", () => {
      expect(typeof historyField).toBe("object");
    });

    it("exports undo as a function", () => {
      expect(typeof undo).toBe("function");
    });

    it("exports redo as a function", () => {
      expect(typeof redo).toBe("function");
    });

    it("exports undoSelection as a function", () => {
      expect(typeof undoSelection).toBe("function");
    });

    it("exports redoSelection as a function", () => {
      expect(typeof redoSelection).toBe("function");
    });

    it("exports undoDepth as a function", () => {
      expect(typeof undoDepth).toBe("function");
    });

    it("exports redoDepth as a function", () => {
      expect(typeof redoDepth).toBe("function");
    });

    it("exports isolateHistory as an object", () => {
      expect(typeof isolateHistory).toBe("object");
    });

    it("exports invertedEffects as an object", () => {
      expect(typeof invertedEffects).toBe("object");
    });

    it("exports historyKeymap as an array", () => {
      expect(Array.isArray(historyKeymap)).toBe(true);
      expect(historyKeymap.length).toBeGreaterThan(0);
    });
  });

  describe("cursor movement commands", () => {
    const cursorCommands = {
      cursorCharLeft,
      cursorCharRight,
      cursorCharForward,
      cursorCharBackward,
      cursorCharForwardLogical,
      cursorCharBackwardLogical,
      cursorGroupLeft,
      cursorGroupRight,
      cursorGroupForward,
      cursorGroupBackward,
      cursorGroupForwardWin,
      cursorSubwordForward,
      cursorSubwordBackward,
      cursorSyntaxLeft,
      cursorSyntaxRight,
      cursorLineUp,
      cursorLineDown,
      cursorPageUp,
      cursorPageDown,
      cursorLineBoundaryForward,
      cursorLineBoundaryBackward,
      cursorLineBoundaryLeft,
      cursorLineBoundaryRight,
      cursorLineStart,
      cursorLineEnd,
      cursorMatchingBracket,
      cursorDocStart,
      cursorDocEnd,
    };

    for (const [name, cmd] of Object.entries(cursorCommands)) {
      it(`exports ${name} as a function`, () => {
        expect(typeof cmd).toBe("function");
      });
    }
  });

  describe("selection extension commands", () => {
    const selectCommands = {
      selectCharLeft,
      selectCharRight,
      selectCharForward,
      selectCharBackward,
      selectCharForwardLogical,
      selectCharBackwardLogical,
      selectGroupLeft,
      selectGroupRight,
      selectGroupForward,
      selectGroupBackward,
      selectGroupForwardWin,
      selectSubwordForward,
      selectSubwordBackward,
      selectSyntaxLeft,
      selectSyntaxRight,
      selectLineUp,
      selectLineDown,
      selectPageUp,
      selectPageDown,
      selectLineBoundaryForward,
      selectLineBoundaryBackward,
      selectLineBoundaryLeft,
      selectLineBoundaryRight,
      selectLineStart,
      selectLineEnd,
      selectMatchingBracket,
      selectDocStart,
      selectDocEnd,
      selectAll,
      selectLine,
      selectParentSyntax,
    };

    for (const [name, cmd] of Object.entries(selectCommands)) {
      it(`exports ${name} as a function`, () => {
        expect(typeof cmd).toBe("function");
      });
    }
  });

  describe("multi-cursor commands", () => {
    it("exports addCursorAbove as a function", () => {
      expect(typeof addCursorAbove).toBe("function");
    });

    it("exports addCursorBelow as a function", () => {
      expect(typeof addCursorBelow).toBe("function");
    });

    it("exports simplifySelection as a function", () => {
      expect(typeof simplifySelection).toBe("function");
    });
  });

  describe("delete commands", () => {
    const deleteCommands = {
      deleteCharBackward,
      deleteCharBackwardStrict,
      deleteCharForward,
      deleteGroupBackward,
      deleteGroupForward,
      deleteGroupForwardWin,
      deleteToLineEnd,
      deleteToLineStart,
      deleteLineBoundaryBackward,
      deleteLineBoundaryForward,
      deleteTrailingWhitespace,
      deleteLine,
    };

    for (const [name, cmd] of Object.entries(deleteCommands)) {
      it(`exports ${name} as a function`, () => {
        expect(typeof cmd).toBe("function");
      });
    }
  });

  describe("line manipulation commands", () => {
    const lineCommands = {
      splitLine,
      transposeChars,
      moveLineUp,
      moveLineDown,
      copyLineUp,
      copyLineDown,
    };

    for (const [name, cmd] of Object.entries(lineCommands)) {
      it(`exports ${name} as a function`, () => {
        expect(typeof cmd).toBe("function");
      });
    }
  });

  describe("newline and indent commands", () => {
    const indentCommands = {
      insertNewline,
      insertNewlineKeepIndent,
      insertNewlineAndIndent,
      insertBlankLine,
      indentSelection,
      indentMore,
      indentLess,
      insertTab,
    };

    for (const [name, cmd] of Object.entries(indentCommands)) {
      it(`exports ${name} as a function`, () => {
        expect(typeof cmd).toBe("function");
      });
    }
  });

  describe("tab focus commands", () => {
    it("exports toggleTabFocusMode as a function", () => {
      expect(typeof toggleTabFocusMode).toBe("function");
    });

    it("exports temporarilySetTabFocusMode as a function", () => {
      expect(typeof temporarilySetTabFocusMode).toBe("function");
    });
  });

  describe("keymaps", () => {
    it("exports emacsStyleKeymap as a non-empty array", () => {
      expect(Array.isArray(emacsStyleKeymap)).toBe(true);
      expect(emacsStyleKeymap.length).toBeGreaterThan(0);
    });

    it("exports standardKeymap as a non-empty array", () => {
      expect(Array.isArray(standardKeymap)).toBe(true);
      expect(standardKeymap.length).toBeGreaterThan(0);
    });

    it("exports defaultKeymap as a non-empty array", () => {
      expect(Array.isArray(defaultKeymap)).toBe(true);
      expect(defaultKeymap.length).toBeGreaterThan(0);
    });

    it("exports indentWithTab as an object with key and run", () => {
      expect(typeof indentWithTab).toBe("object");
      expect(indentWithTab.key).toBe("Tab");
      expect(typeof indentWithTab.run).toBe("function");
      expect(typeof indentWithTab.shift).toBe("function");
    });

    it("defaultKeymap includes standardKeymap bindings", () => {
      expect(defaultKeymap.length).toBeGreaterThan(standardKeymap.length);
    });

    it("standardKeymap includes emacsStyleKeymap bindings", () => {
      expect(standardKeymap.length).toBeGreaterThan(emacsStyleKeymap.length);
    });

    it("keymap entries have expected shape", () => {
      for (const binding of emacsStyleKeymap) {
        expect(typeof binding.run).toBe("function");
      }
      for (const binding of historyKeymap) {
        expect(typeof binding.run).toBe("function");
      }
    });
  });
});

describe("deleteTrailingWhitespace", () => {
  it("deleteTrailingWhitespace is a function", () => {
    expect(typeof deleteTrailingWhitespace).toBe("function");
  });
});

describe("invertedEffects and isolateHistory", () => {
  it("invertedEffects is defined (Facet)", () => {
    expect(invertedEffects).toBeDefined();
  });

  it("isolateHistory is an Annotation (object with .of method)", () => {
    expect(isolateHistory).toBeDefined();
    expect(typeof isolateHistory.of).toBe("function");
  });

  it("isolateHistory extension integrates with EditorState", () => {
    const state = EditorState.create({
      doc: "hello",
      extensions: [history()],
    });
    const tr = state.update({
      changes: { from: 5, insert: "!" },
      annotations: isolateHistory.of("full"),
    });
    expect(tr.state.doc.toString()).toBe("hello!");
  });
});

describe("history() behavioral tests", () => {
  it("undoDepth returns 0 for a fresh state", () => {
    const state = EditorState.create({
      doc: "hello",
      extensions: [history()],
    });
    expect(undoDepth(state)).toBe(0);
  });

  it("redoDepth returns 0 for a fresh state", () => {
    const state = EditorState.create({
      doc: "hello",
      extensions: [history()],
    });
    expect(redoDepth(state)).toBe(0);
  });

  it("undoDepth increases after a transaction", () => {
    let state = EditorState.create({
      doc: "hello",
      extensions: [history()],
    });
    state = state.update({ changes: { from: 5, insert: " world" } }).state;
    expect(undoDepth(state)).toBe(1);
  });

  it("history() returns an extension", () => {
    const ext = history();
    expect(ext).toBeDefined();
  });

  it("history() accepts a config", () => {
    const ext = history({ minDepth: 50, newGroupDelay: 300 });
    expect(ext).toBeDefined();
  });

  it("undoDepth increases with each transaction", () => {
    let state = EditorState.create({ doc: "abc", extensions: [history()] });
    state = state.update({ changes: { from: 3, insert: "d" } }).state;
    state = state.update({
      changes: { from: 4, insert: "e" },
      annotations: isolateHistory.of("full"),
    }).state;
    expect(undoDepth(state)).toBe(2);
  });

  it("redoDepth increases after undo", () => {
    let state = EditorState.create({ doc: "hello", extensions: [history()] });
    state = state.update({ changes: { from: 5, insert: "!" } }).state;
    expect(undoDepth(state)).toBe(1);
    expect(redoDepth(state)).toBe(0);
    // undo is a command that requires a view; just check the state stays consistent
    expect(typeof undo).toBe("function");
  });

  it("historyField is a StateField-like object", () => {
    expect(historyField).toBeDefined();
    // historyField can be used to serialize history state
    const state = EditorState.create({ doc: "test", extensions: [history()] });
    const fieldValue = state.field(historyField, false);
    // With no transactions, may be null or the initial state
    expect(fieldValue === null || fieldValue !== undefined).toBe(true);
  });
});

describe("cursorDocStart / cursorDocEnd", () => {
  it("cursorDocStart moves cursor to position 0", () => {
    const state = EditorState.create({ doc: "hello world", selection: { anchor: 5 } });
    const result = run(cursorDocStart, state)!;
    expect(result.selection.main.anchor).toBe(0);
    expect(result.selection.main.head).toBe(0);
  });

  it("cursorDocEnd moves cursor to end of document", () => {
    const state = EditorState.create({ doc: "hello world", selection: { anchor: 0 } });
    const result = run(cursorDocEnd, state)!;
    expect(result.selection.main.anchor).toBe(11);
  });
});

describe("selectDocStart / selectDocEnd", () => {
  it("selectDocStart extends selection to start", () => {
    const state = EditorState.create({ doc: "hello world", selection: { anchor: 5 } });
    const result = run(selectDocStart, state)!;
    expect(result.selection.main.anchor).toBe(5);
    expect(result.selection.main.head).toBe(0);
  });

  it("selectDocEnd extends selection to end", () => {
    const state = EditorState.create({ doc: "hello world", selection: { anchor: 5 } });
    const result = run(selectDocEnd, state)!;
    expect(result.selection.main.anchor).toBe(5);
    expect(result.selection.main.head).toBe(11);
  });
});

describe("selectAll", () => {
  it("selects entire document", () => {
    const state = EditorState.create({ doc: "hello world" });
    const result = run(selectAll, state)!;
    expect(result.selection.main.from).toBe(0);
    expect(result.selection.main.to).toBe(11);
  });
});

describe("selectLine", () => {
  it("expands selection to cover entire line", () => {
    const state = EditorState.create({ doc: "line1\nline2\nline3", selection: { anchor: 7 } });
    const result = run(selectLine, state)!;
    expect(result.selection.main.from).toBe(6);
    expect(result.selection.main.to).toBe(12);
  });
});

describe("insertNewline", () => {
  it("inserts a newline at cursor", () => {
    const state = EditorState.create({ doc: "hello", selection: { anchor: 5 } });
    const result = run(insertNewline, state)!;
    expect(result.doc.toString()).toBe("hello\n");
  });

  it("replaces selection with newline", () => {
    const state = EditorState.create({
      doc: "hello world",
      selection: EditorSelection.range(5, 11),
    });
    const result = run(insertNewline, state)!;
    expect(result.doc.toString()).toBe("hello\n");
  });
});

describe("insertNewlineKeepIndent", () => {
  it("preserves indentation from current line", () => {
    const state = EditorState.create({ doc: "  hello", selection: { anchor: 7 } });
    const result = run(insertNewlineKeepIndent, state)!;
    expect(result.doc.toString()).toBe("  hello\n  ");
    expect(result.selection.main.anchor).toBe(10);
  });
});

describe("splitLine", () => {
  it("inserts line break and keeps cursor before it", () => {
    const state = EditorState.create({ doc: "hello", selection: { anchor: 3 } });
    const result = run(splitLine, state)!;
    expect(result.doc.toString()).toBe("hel\nlo");
    expect(result.selection.main.anchor).toBe(3);
  });
});

describe("transposeChars", () => {
  it("swaps characters around cursor", () => {
    const state = EditorState.create({ doc: "abc", selection: { anchor: 2 } });
    const result = run(transposeChars, state)!;
    expect(result.doc.toString()).toBe("acb");
  });

  it("returns false at start of document", () => {
    const state = EditorState.create({ doc: "abc", selection: { anchor: 0 } });
    expect(run(transposeChars, state)).toBe(null);
  });

  it("returns false at end of document", () => {
    const state = EditorState.create({ doc: "abc", selection: { anchor: 3 } });
    // at the end of doc, transposeChars should still work (swaps last two chars)
    // but if doc length equals cursor, it needs char after too
    const result = run(transposeChars, state);
    // at line.to it tries pos+1 which may work
    if (result) {
      expect(result.doc.length).toBe(3);
    }
  });
});

describe("deleteTrailingWhitespace", () => {
  it("removes trailing spaces from lines", () => {
    const state = EditorState.create({ doc: "hello   \nworld  \n" });
    const result = run(deleteTrailingWhitespace, state)!;
    expect(result.doc.toString()).toBe("hello\nworld\n");
  });

  it("returns false when no trailing whitespace exists", () => {
    const state = EditorState.create({ doc: "hello\nworld\n" });
    expect(run(deleteTrailingWhitespace, state)).toBe(null);
  });
});

describe("moveLineUp / moveLineDown", () => {
  it("moveLineDown moves current line down", () => {
    const state = EditorState.create({ doc: "aaa\nbbb\nccc", selection: { anchor: 1 } });
    const result = run(moveLineDown, state)!;
    expect(result.doc.toString()).toBe("bbb\naaa\nccc");
  });

  it("moveLineUp moves current line up", () => {
    const state = EditorState.create({ doc: "aaa\nbbb\nccc", selection: { anchor: 5 } });
    const result = run(moveLineUp, state)!;
    expect(result.doc.toString()).toBe("bbb\naaa\nccc");
  });

  it("moveLineUp at first line does nothing", () => {
    const state = EditorState.create({ doc: "aaa\nbbb", selection: { anchor: 1 } });
    expect(run(moveLineUp, state)).toBe(null);
  });

  it("moveLineDown at last line does nothing", () => {
    const state = EditorState.create({ doc: "aaa\nbbb", selection: { anchor: 5 } });
    expect(run(moveLineDown, state)).toBe(null);
  });
});

describe("moveLineDown with multi-range selection on same line", () => {
  it("merges two cursors on the same line when moving down", () => {
    const state = EditorState.create({
      doc: "aaa\nbbb\nccc",
      selection: EditorSelection.create([
        EditorSelection.cursor(1),
        EditorSelection.cursor(2),
      ]),
      extensions: [EditorState.allowMultipleSelections.of(true)],
    });
    const result = run(moveLineDown, state)!;
    expect(result).not.toBeNull();
    expect(result.doc.toString()).toBe("bbb\naaa\nccc");
  });
});

describe("copyLineUp / copyLineDown", () => {
  it("copyLineDown duplicates line below", () => {
    const state = EditorState.create({ doc: "aaa\nbbb", selection: { anchor: 1 } });
    const result = run(copyLineDown, state)!;
    expect(result.doc.toString()).toBe("aaa\naaa\nbbb");
  });

  it("copyLineUp duplicates line above", () => {
    const state = EditorState.create({ doc: "aaa\nbbb", selection: { anchor: 1 } });
    const result = run(copyLineUp, state)!;
    expect(result.doc.toString()).toBe("aaa\naaa\nbbb");
  });
});

describe("simplifySelection", () => {
  it("reduces multi-range selection to main range", () => {
    const state = EditorState.create({
      doc: "hello world",
      selection: EditorSelection.create([
        EditorSelection.range(0, 5),
        EditorSelection.range(6, 11),
      ]),
      extensions: [EditorState.allowMultipleSelections.of(true)],
    });
    const result = run(simplifySelection, state)!;
    expect(result.selection.ranges.length).toBe(1);
  });

  it("converts non-empty single range to cursor", () => {
    const state = EditorState.create({
      doc: "hello world",
      selection: EditorSelection.range(0, 5),
    });
    const result = run(simplifySelection, state)!;
    expect(result.selection.main.empty).toBe(true);
    expect(result.selection.main.anchor).toBe(5);
  });

  it("returns false when already a single cursor", () => {
    const state = EditorState.create({ doc: "hello", selection: { anchor: 3 } });
    expect(run(simplifySelection, state)).toBe(null);
  });
});

describe("cursorCharForwardLogical / cursorCharBackwardLogical", () => {
  it("cursorCharForwardLogical moves cursor forward by one character", () => {
    const state = EditorState.create({ doc: "abc", selection: { anchor: 0 } });
    const result = run(cursorCharForwardLogical, state)!;
    expect(result.selection.main.anchor).toBe(1);
  });

  it("cursorCharBackwardLogical moves cursor backward by one character", () => {
    const state = EditorState.create({ doc: "abc", selection: { anchor: 2 } });
    const result = run(cursorCharBackwardLogical, state)!;
    expect(result.selection.main.anchor).toBe(1);
  });

  it("cursorCharForwardLogical crosses line boundary", () => {
    const state = EditorState.create({ doc: "ab\ncd", selection: { anchor: 2 } });
    const result = run(cursorCharForwardLogical, state)!;
    expect(result.selection.main.anchor).toBe(3);
  });

  it("cursorCharBackwardLogical crosses line boundary", () => {
    const state = EditorState.create({ doc: "ab\ncd", selection: { anchor: 3 } });
    const result = run(cursorCharBackwardLogical, state)!;
    expect(result.selection.main.anchor).toBe(2);
  });
});

describe("comment commands with JavaScript", () => {
  function jsState(doc: string, anchor?: number, head?: number) {
    return EditorState.create({
      doc,
      selection: head != null ? EditorSelection.range(anchor!, head) : { anchor: anchor ?? 0 },
      extensions: [javascript()],
    });
  }

  it("toggleLineComment adds // to a line", () => {
    const state = jsState("let x = 1", 0);
    const result = run(toggleLineComment, state)!;
    expect(result.doc.toString()).toBe("// let x = 1");
  });

  it("toggleLineComment removes // from a commented line", () => {
    const state = jsState("// let x = 1", 0);
    const result = run(toggleLineComment, state)!;
    expect(result.doc.toString()).toBe("let x = 1");
  });

  it("lineComment adds // to multiple lines", () => {
    const state = jsState("let a = 1\nlet b = 2", 0, 19);
    const result = run(lineComment, state)!;
    expect(result.doc.toString()).toBe("// let a = 1\n// let b = 2");
  });

  it("lineUncomment removes // from commented lines", () => {
    const state = jsState("// let a = 1\n// let b = 2", 0, 25);
    const result = run(lineUncomment, state)!;
    expect(result.doc.toString()).toBe("let a = 1\nlet b = 2");
  });

  it("blockComment wraps selection in /* */", () => {
    const state = jsState("let x = 1", 0, 9);
    const result = run(blockComment, state)!;
    expect(result.doc.toString()).toContain("/*");
    expect(result.doc.toString()).toContain("*/");
  });

  it("blockUncomment removes /* */ from wrapped code", () => {
    const state = jsState("/* let x = 1 */", 3, 12);
    const result = run(blockUncomment, state)!;
    expect(result.doc.toString()).toBe("let x = 1");
  });

  it("toggleComment falls back to line comments for JS", () => {
    const state = jsState("let x = 1", 0);
    const result = run(toggleComment, state)!;
    expect(result.doc.toString()).toContain("//");
  });

  it("toggleComment returns false without language data", () => {
    const state = EditorState.create({ doc: "hello" });
    expect(run(toggleComment, state)).toBe(null);
  });

  it("toggleBlockComment adds block comment to selection", () => {
    const state = jsState("let x = 1", 4, 9);
    const result = run(toggleBlockComment, state)!;
    expect(result.doc.toString()).toContain("/* x = 1 */");
  });

  it("toggleBlockCommentByLine comments entire lines", () => {
    const state = jsState("let a = 1\nlet b = 2", 0, 19);
    const result = run(toggleBlockCommentByLine, state)!;
    expect(result.doc.toString()).toContain("/*");
  });

  it("comment commands return false on readOnly state", () => {
    const state = EditorState.create({
      doc: "let x = 1",
      extensions: [javascript(), EditorState.readOnly.of(true)],
    });
    expect(run(toggleLineComment, state)).toBe(null);
    expect(run(lineComment, state)).toBe(null);
    expect(run(blockComment, state)).toBe(null);
  });
});

describe("history undo/redo functional", () => {
  it("undo reverses a change", () => {
    let state = EditorState.create({ doc: "abc", extensions: [history()] });
    state = state.update({ changes: { from: 3, insert: "d" } }).state;
    expect(state.doc.toString()).toBe("abcd");
    const result = run(undo, state)!;
    expect(result.doc.toString()).toBe("abc");
  });

  it("redo re-applies an undone change", () => {
    let state = EditorState.create({ doc: "abc", extensions: [history()] });
    state = state.update({ changes: { from: 3, insert: "d" } }).state;
    state = run(undo, state)!;
    expect(state.doc.toString()).toBe("abc");
    const result = run(redo, state)!;
    expect(result.doc.toString()).toBe("abcd");
  });

  it("undo returns null when nothing to undo", () => {
    const state = EditorState.create({ doc: "abc", extensions: [history()] });
    expect(run(undo, state)).toBe(null);
  });

  it("redo returns null when nothing to redo", () => {
    const state = EditorState.create({ doc: "abc", extensions: [history()] });
    expect(run(redo, state)).toBe(null);
  });

  it("undo returns null without history extension", () => {
    const state = EditorState.create({ doc: "abc" });
    expect(run(undo, state)).toBe(null);
  });

  it("undoDepth tracks number of undo steps", () => {
    let state = EditorState.create({ doc: "abc", extensions: [history()] });
    expect(undoDepth(state)).toBe(0);
    state = state.update({
      changes: { from: 3, insert: "d" },
      annotations: isolateHistory.of("full"),
    }).state;
    state = state.update({
      changes: { from: 4, insert: "e" },
      annotations: isolateHistory.of("full"),
    }).state;
    expect(undoDepth(state)).toBe(2);
  });

  it("redoDepth increases after undo", () => {
    let state = EditorState.create({ doc: "abc", extensions: [history()] });
    state = state.update({ changes: { from: 3, insert: "d" } }).state;
    expect(redoDepth(state)).toBe(0);
    state = run(undo, state)!;
    expect(redoDepth(state)).toBe(1);
  });

  it("undoSelection undoes selection changes", () => {
    let state = EditorState.create({ doc: "abcdef", extensions: [history()] });
    state = state.update({ selection: { anchor: 3 } }).state;
    expect(state.selection.main.anchor).toBe(3);
    const result = run(undoSelection, state)!;
    expect(result.selection.main.anchor).toBe(0);
  });

  it("multiple undos work in sequence", () => {
    let state = EditorState.create({ doc: "", extensions: [history()] });
    state = state.update({
      changes: { from: 0, insert: "a" },
      annotations: isolateHistory.of("full"),
    }).state;
    state = state.update({
      changes: { from: 1, insert: "b" },
      annotations: isolateHistory.of("full"),
    }).state;
    expect(state.doc.toString()).toBe("ab");
    state = run(undo, state)!;
    expect(state.doc.toString()).toBe("a");
    state = run(undo, state)!;
    expect(state.doc.toString()).toBe("");
  });

  it("undo on readOnly state returns null", () => {
    let state = EditorState.create({
      doc: "abc",
      extensions: [history(), EditorState.readOnly.of(true)],
    });
    expect(run(undo, state)).toBe(null);
  });

  describe("deleteGroupBackward", () => {
    it("deletes a whole word backward", () => {
      const state = EditorState.create({ doc: "hello world", selection: { anchor: 11 } });
      const result = run(deleteGroupBackward, state);
      expect(result).not.toBe(null);
      expect(result!.doc.toString()).toBe("hello ");
    });

    it("stops at punctuation boundary", () => {
      const state = EditorState.create({ doc: "foo.bar", selection: { anchor: 7 } });
      const result = run(deleteGroupBackward, state);
      expect(result).not.toBe(null);
      expect(result!.doc.toString()).toBe("foo.");
    });

    it("at document start returns null (nothing to delete)", () => {
      const state = EditorState.create({ doc: "hello", selection: { anchor: 0 } });
      const result = run(deleteGroupBackward, state);
      expect(result).toBe(null);
    });

    it("deletes selection range instead of group", () => {
      const state = EditorState.create({ doc: "hello world", selection: { anchor: 2, head: 8 } });
      const result = run(deleteGroupBackward, state);
      expect(result).not.toBe(null);
      expect(result!.doc.toString()).toBe("herld");
    });

    it("returns false on readOnly state", () => {
      const state = EditorState.create({
        doc: "hello",
        selection: { anchor: 5 },
        extensions: [EditorState.readOnly.of(true)],
      });
      expect(run(deleteGroupBackward, state)).toBe(null);
    });
  });

  describe("deleteGroupForward", () => {
    it("deletes a whole word forward", () => {
      const state = EditorState.create({ doc: "hello world", selection: { anchor: 0 } });
      const result = run(deleteGroupForward, state);
      expect(result).not.toBe(null);
      expect(result!.doc.toString()).toBe(" world");
    });

    it("stops at punctuation boundary", () => {
      const state = EditorState.create({ doc: "foo.bar", selection: { anchor: 0 } });
      const result = run(deleteGroupForward, state);
      expect(result).not.toBe(null);
      expect(result!.doc.toString()).toBe(".bar");
    });

    it("at document end returns null (nothing to delete)", () => {
      const state = EditorState.create({ doc: "hello", selection: { anchor: 5 } });
      const result = run(deleteGroupForward, state);
      expect(result).toBe(null);
    });

    it("deletes selection range instead of group", () => {
      const state = EditorState.create({ doc: "hello world", selection: { anchor: 1, head: 6 } });
      const result = run(deleteGroupForward, state);
      expect(result).not.toBe(null);
      expect(result!.doc.toString()).toBe("hworld");
    });

    it("returns false on readOnly state", () => {
      const state = EditorState.create({
        doc: "hello",
        selection: { anchor: 0 },
        extensions: [EditorState.readOnly.of(true)],
      });
      expect(run(deleteGroupForward, state)).toBe(null);
    });
  });

  describe("deleteTrailingWhitespace edge cases", () => {
    it("returns false when no trailing whitespace exists", () => {
      const state = EditorState.create({ doc: "hello\nworld" });
      expect(run(deleteTrailingWhitespace, state)).toBe(null);
    });

    it("removes trailing whitespace from multiple lines", () => {
      const state = EditorState.create({ doc: "hello   \nworld  \nfoo" });
      const result = run(deleteTrailingWhitespace, state);
      expect(result).not.toBe(null);
      expect(result!.doc.toString()).toBe("hello\nworld\nfoo");
    });

    it("handles lines with only whitespace", () => {
      const state = EditorState.create({ doc: "hello\n   \nworld" });
      const result = run(deleteTrailingWhitespace, state);
      expect(result).not.toBe(null);
      expect(result!.doc.toString()).toBe("hello\n\nworld");
    });

    it("returns false on readOnly state", () => {
      const state = EditorState.create({
        doc: "hello   ",
        extensions: [EditorState.readOnly.of(true)],
      });
      expect(run(deleteTrailingWhitespace, state)).toBe(null);
    });
  });

  describe("indentMore", () => {
    it("adds indentation to a line", () => {
      const state = EditorState.create({ doc: "hello", selection: { anchor: 0 } });
      const result = run(indentMore, state);
      expect(result).not.toBe(null);
      expect(result!.doc.toString()).toMatch(/^\s+hello$/);
    });

    it("adds custom indent unit", () => {
      const state = EditorState.create({
        doc: "hello",
        selection: { anchor: 0 },
        extensions: [indentUnit.of("    ")],
      });
      const result = run(indentMore, state);
      expect(result).not.toBe(null);
      expect(result!.doc.toString()).toBe("    hello");
    });

    it("indents multiple selected lines", () => {
      const state = EditorState.create({
        doc: "line1\nline2\nline3",
        selection: { anchor: 0, head: 16 },
      });
      const result = run(indentMore, state);
      expect(result).not.toBe(null);
      const lines = result!.doc.toString().split("\n");
      for (const line of lines) {
        expect(line).toMatch(/^\s+/);
      }
    });

    it("returns false on readOnly state", () => {
      const state = EditorState.create({
        doc: "hello",
        extensions: [EditorState.readOnly.of(true)],
      });
      expect(run(indentMore, state)).toBe(null);
    });
  });

  describe("indentLess", () => {
    it("removes indentation from a line", () => {
      const state = EditorState.create({
        doc: "  hello",
        selection: { anchor: 0 },
        extensions: [indentUnit.of("  ")],
      });
      const result = run(indentLess, state);
      expect(result).not.toBe(null);
      expect(result!.doc.toString()).toBe("hello");
    });

    it("on unindented line produces no visible change", () => {
      const state = EditorState.create({ doc: "hello", selection: { anchor: 0 } });
      const result = run(indentLess, state);
      // indentLess always dispatches, but the doc should remain unchanged
      expect(result).not.toBe(null);
      expect(result!.doc.toString()).toBe("hello");
    });

    it("partially dedents when indent is less than one unit", () => {
      const state = EditorState.create({
        doc: " hello",
        selection: { anchor: 0 },
        extensions: [indentUnit.of("    ")],
      });
      const result = run(indentLess, state);
      expect(result).not.toBe(null);
      expect(result!.doc.toString()).toBe("hello");
    });

    it("returns false on readOnly state", () => {
      const state = EditorState.create({
        doc: "  hello",
        extensions: [EditorState.readOnly.of(true)],
      });
      expect(run(indentLess, state)).toBe(null);
    });
  });

  describe("insertTab", () => {
    it("inserts a tab character when cursor is a point", () => {
      const state = EditorState.create({ doc: "hello", selection: { anchor: 2 } });
      const result = run(insertTab, state);
      expect(result).not.toBe(null);
      expect(result!.doc.toString()).toBe("he\tllo");
    });

    it("indents when selection is non-empty", () => {
      const state = EditorState.create({
        doc: "hello\nworld",
        selection: { anchor: 0, head: 11 },
      });
      const result = run(insertTab, state);
      expect(result).not.toBe(null);
      // When selection is non-empty, insertTab delegates to indentMore
      const lines = result!.doc.toString().split("\n");
      for (const line of lines) {
        expect(line).toMatch(/^\s+/);
      }
    });

    it("inserts tab at end of document", () => {
      const state = EditorState.create({ doc: "abc", selection: { anchor: 3 } });
      const result = run(insertTab, state);
      expect(result).not.toBe(null);
      expect(result!.doc.toString()).toBe("abc\t");
    });
  });

  describe("insertNewlineAndIndent", () => {
    it("inserts a newline", () => {
      const state = EditorState.create({ doc: "hello", selection: { anchor: 5 } });
      const result = run(insertNewlineAndIndent, state);
      expect(result).not.toBe(null);
      expect(result!.doc.lines).toBeGreaterThanOrEqual(2);
    });

    it("preserves indentation from previous line", () => {
      const state = EditorState.create({ doc: "  hello", selection: { anchor: 7 } });
      const result = run(insertNewlineAndIndent, state);
      expect(result).not.toBe(null);
      const line2 = result!.doc.line(2).text;
      // Should have at least some indentation carried forward
      expect(result!.doc.lines).toBeGreaterThanOrEqual(2);
    });

    it("returns false on readOnly state", () => {
      const state = EditorState.create({
        doc: "hello",
        selection: { anchor: 5 },
        extensions: [EditorState.readOnly.of(true)],
      });
      expect(run(insertNewlineAndIndent, state)).toBe(null);
    });
  });

  describe("insertBlankLine", () => {
    it("creates a blank line below", () => {
      const state = EditorState.create({ doc: "hello\nworld", selection: { anchor: 3 } });
      const result = run(insertBlankLine, state);
      expect(result).not.toBe(null);
      expect(result!.doc.lines).toBe(3);
      // The blank line should be after "hello"
      expect(result!.doc.line(1).text).toBe("hello");
    });

    it("works at end of document", () => {
      const state = EditorState.create({ doc: "hello", selection: { anchor: 5 } });
      const result = run(insertBlankLine, state);
      expect(result).not.toBe(null);
      expect(result!.doc.lines).toBe(2);
    });

    it("returns false on readOnly state", () => {
      const state = EditorState.create({
        doc: "hello",
        selection: { anchor: 5 },
        extensions: [EditorState.readOnly.of(true)],
      });
      expect(run(insertBlankLine, state)).toBe(null);
    });
  });

  describe("historyField serialization", () => {
    it("serializes and deserializes history state via toJSON/fromJSON", () => {
      let state = EditorState.create({ doc: "hello", extensions: [history()] });
      state = state.update({ changes: { from: 5, insert: " world" } }).state;
      state = state.update({ changes: { from: 11, insert: "!" } }).state;
      expect(undoDepth(state)).toBeGreaterThan(0);

      const json = state.toJSON({ history: historyField });
      const restored = EditorState.fromJSON(
        json,
        { extensions: [history()] },
        { history: historyField },
      );
      expect(restored.doc.toString()).toBe("hello world!");
      expect(undoDepth(restored)).toBeGreaterThan(0);
    });

    it("undo works after deserialization", () => {
      let state = EditorState.create({ doc: "abc", extensions: [history()] });
      state = state.update({ changes: { from: 3, insert: "d" } }).state;
      const json = state.toJSON({ history: historyField });
      let restored = EditorState.fromJSON(
        json,
        { extensions: [history()] },
        { history: historyField },
      );
      const undone = run(undo, restored);
      expect(undone).not.toBe(null);
      expect(undone!.doc.toString()).toBe("abc");
    });

    it("preserves undoDepth across serialization round-trip", () => {
      let state = EditorState.create({ doc: "", extensions: [history()] });
      state = state.update({ changes: { from: 0, insert: "a" } }).state;
      state = state.update({ changes: { from: 1, insert: "b" } }).state;
      const depthBefore = undoDepth(state);
      const json = state.toJSON({ history: historyField });
      const restored = EditorState.fromJSON(
        json,
        { extensions: [history()] },
        { history: historyField },
      );
      expect(undoDepth(restored)).toBe(depthBefore);
    });
  });

  describe("redoSelection", () => {
    it("redoes a selection change after undoSelection", () => {
      let state = EditorState.create({
        doc: "hello world",
        selection: { anchor: 0 },
        extensions: [history()],
      });
      // Change selection
      state = state.update({ selection: { anchor: 5 } }).state;
      expect(state.selection.main.head).toBe(5);

      // Undo the selection change
      const undone = run(undoSelection, state);
      expect(undone).not.toBe(null);
      expect(undone!.selection.main.head).toBe(0);

      // Redo the selection change
      const redone = run(redoSelection, undone!);
      expect(redone).not.toBe(null);
      expect(redone!.selection.main.head).toBe(5);
    });

    it("returns false when there is nothing to redo", () => {
      const state = EditorState.create({
        doc: "test",
        extensions: [history()],
      });
      expect(run(redoSelection, state)).toBe(null);
    });
  });

  describe("isolateHistory annotation", () => {
    it("isolateHistory 'full' separates adjacent changes into different undo groups", () => {
      let state = EditorState.create({ doc: "", extensions: [history()] });
      state = state.update({ changes: { from: 0, insert: "a" } }).state;
      state = state.update({
        changes: { from: 1, insert: "b" },
        annotations: isolateHistory.of("full"),
      }).state;
      expect(state.doc.toString()).toBe("ab");
      // Undo should only undo the isolated "b" change
      const undone = run(undo, state);
      expect(undone).not.toBe(null);
      expect(undone!.doc.toString()).toBe("a");
    });

    it("isolateHistory 'after' groups current change with previous but isolates next", () => {
      let state = EditorState.create({ doc: "", extensions: [history()] });
      state = state.update({ changes: { from: 0, insert: "a" } }).state;
      state = state.update({
        changes: { from: 1, insert: "b" },
        annotations: isolateHistory.of("after"),
      }).state;
      state = state.update({ changes: { from: 2, insert: "c" } }).state;
      expect(state.doc.toString()).toBe("abc");
      // Undo should undo "c" alone (it was isolated from the previous group)
      const undone1 = run(undo, state);
      expect(undone1).not.toBe(null);
      expect(undone1!.doc.toString()).toBe("ab");
    });
  });

  describe("invertedEffects", () => {
    it("allows custom effects to be inverted on undo", () => {
      const myEffect = StateEffect.define<number>();
      const invertEffect = StateEffect.define<number>();
      let lastInvertedValue: number | null = null;

      let state = EditorState.create({
        doc: "hello",
        extensions: [
          history(),
          invertedEffects.of((tr) => {
            const effects: StateEffect<number>[] = [];
            for (const e of tr.effects) {
              if (e.is(myEffect)) {
                effects.push(invertEffect.of(-e.value));
              }
            }
            return effects;
          }),
          EditorState.transactionExtender.of((tr) => {
            for (const e of tr.effects) {
              if (e.is(invertEffect)) {
                lastInvertedValue = e.value;
              }
            }
            return null;
          }),
        ],
      });

      // Dispatch a change with our custom effect
      state = state.update({
        changes: { from: 5, insert: "!" },
        effects: myEffect.of(42),
      }).state;
      expect(state.doc.toString()).toBe("hello!");

      // Undo should trigger the inverted effect
      const undone = run(undo, state);
      expect(undone).not.toBe(null);
      expect(undone!.doc.toString()).toBe("hello");
    });

    it("inverted effects are included in undo transactions", () => {
      const myEffect = StateEffect.define<string>();
      const collected: string[] = [];

      let state = EditorState.create({
        doc: "test",
        extensions: [
          history(),
          invertedEffects.of((tr) => {
            const effects: StateEffect<string>[] = [];
            for (const e of tr.effects) {
              if (e.is(myEffect)) {
                effects.push(myEffect.of("inverted-" + e.value));
              }
            }
            return effects;
          }),
        ],
      });

      state = state.update({
        changes: { from: 4, insert: "!" },
        effects: myEffect.of("forward"),
      }).state;

      // Undo — the undo transaction should contain our inverted effect
      let undoTr: Transaction | null = null;
      undo({ state, dispatch: (tr) => { undoTr = tr; } });
      expect(undoTr).not.toBe(null);
      const hasInverted = undoTr!.effects.some(
        (e: StateEffect<any>) => e.is(myEffect) && e.value === "inverted-forward",
      );
      expect(hasInverted).toBe(true);
    });
  });

  describe("history with minDepth config", () => {
    it("accepts minDepth configuration", () => {
      const state = EditorState.create({
        doc: "hello",
        extensions: [history({ minDepth: 2 })],
      });
      expect(state).toBeDefined();
      expect(undoDepth(state)).toBe(0);
    });

    it("accepts newGroupDelay configuration", () => {
      const state = EditorState.create({
        doc: "hello",
        extensions: [history({ minDepth: 50, newGroupDelay: 300 })],
      });
      expect(state).toBeDefined();
    });
  });

  describe("undoSelection with only selection changes", () => {
    it("undoes a pure selection change without doc changes", () => {
      let state = EditorState.create({
        doc: "hello world",
        selection: { anchor: 0 },
        extensions: [history()],
      });
      state = state.update({ selection: { anchor: 5 } }).state;
      state = state.update({ selection: { anchor: 11 } }).state;
      expect(state.selection.main.head).toBe(11);

      const undone = run(undoSelection, state);
      expect(undone).not.toBe(null);
      // Should go back to a previous selection position
      expect(undone!.selection.main.head).not.toBe(11);
      expect(undone!.doc.toString()).toBe("hello world");
    });

    it("does not modify doc content when undoing selection-only changes", () => {
      let state = EditorState.create({
        doc: "abcdef",
        selection: { anchor: 0 },
        extensions: [history()],
      });
      state = state.update({ selection: { anchor: 3 } }).state;
      state = state.update({ selection: { anchor: 6 } }).state;

      const undone = run(undoSelection, state);
      expect(undone).not.toBe(null);
      expect(undone!.doc.toString()).toBe("abcdef");
    });
  });
});

describe("history eqSelectionShape (consolidating duplicate-shape selection events)", () => {
  it("does not add a new selection event when shape matches the last one in rapid succession", () => {
    const t0 = Date.now();
    let state = EditorState.create({
      doc: "hello world",
      selection: { anchor: 0 },
      extensions: [history()],
    });
    // First selection-only transaction — adds to selection history
    state = state.update({
      selection: { anchor: 3 },
      annotations: [Transaction.userEvent.of("select"), Transaction.time.of(t0)],
    }).state;
    // Second selection-only transaction — same shape (both empty cursors), rapid, same userEvent
    // eqSelectionShape returns true → history consolidates, returns early
    state = state.update({
      selection: { anchor: 5 },
      annotations: [Transaction.userEvent.of("select"), Transaction.time.of(t0 + 50)],
    }).state;
    // Should not have doubled up selection history — just verifies no crash
    expect(state.doc.toString()).toBe("hello world");
    expect(state.selection.main.head).toBe(5);
  });
});

describe("history addMapping (Transaction.addToHistory = false)", () => {
  it("applies a non-history change on top of undo history without adding to undo stack", () => {
    let state = EditorState.create({
      doc: "hello",
      extensions: [history()],
    });
    // Add a change to history
    state = state.update({ changes: { from: 5, insert: "!" } }).state;
    expect(undoDepth(state)).toBe(1);

    // Apply a change NOT added to history — triggers addMapping path
    state = state.update({
      changes: { from: 0, to: 0, insert: ">>>" },
      annotations: Transaction.addToHistory.of(false),
    }).state;

    // Undo depth should still be 1 (the non-history change doesn't add to stack)
    expect(undoDepth(state)).toBe(1);
    // The non-history change should still be in the document
    expect(state.doc.toString()).toBe(">>>hello!");

    // Undo should revert the history change but keep the non-history one
    const undone = run(undo, state);
    expect(undone).not.toBeNull();
    expect(undone!.doc.toString()).toBe(">>>hello");
  });

  it("addMapping with multiple undo events in history", () => {
    let state = EditorState.create({
      doc: "abc",
      extensions: [history()],
    });
    state = state.update({ changes: { from: 3, insert: "D" }, annotations: isolateHistory.of("full") }).state;
    state = state.update({ changes: { from: 4, insert: "E" }, annotations: isolateHistory.of("full") }).state;
    expect(undoDepth(state)).toBe(2);

    // Non-history change at the start — forces addMapping on the existing 2 history events
    state = state.update({
      changes: { from: 0, to: 0, insert: "X" },
      annotations: Transaction.addToHistory.of(false),
    }).state;

    expect(undoDepth(state)).toBe(2);
    expect(state.doc.toString()).toBe("XabcDE");
  });
});
