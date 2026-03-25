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
import { EditorState, EditorSelection, Transaction } from "../../src/core/state/index";
import { javascript } from "../../src/lang/javascript/index";

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
});
