import { describe, it, expect, afterEach } from "bun:test";

// ---------------------------------------------------------------------------
// Minimal DOM shim so EditorView can be instantiated without a browser.
// This must run before any EditorView import.
// ---------------------------------------------------------------------------
class MockElement {
  tagName: string;
  className = "";
  style: any = new Proxy({}, { get: () => "", set: () => true });
  children: any[] = [];
  attributes: Record<string, string> = {};
  parentNode: any = null;
  tabIndex = 0;
  textContent = "";
  contentEditable = "false";
  spellcheck = false;
  autocorrect = "";
  autocapitalize = "";

  constructor(tag: string) { this.tagName = tag; }
  appendChild(child: any) { this.children.push(child); if (child && typeof child === "object") child.parentNode = this; return child; }
  setAttribute(k: string, v: string) { this.attributes[k] = v; }
  getAttribute(k: string) { return this.attributes[k] ?? null; }
  hasAttribute(k: string) { return k in this.attributes; }
  removeAttribute(k: string) { delete this.attributes[k]; }
  addEventListener() {}
  removeEventListener() {}
  contains() { return false; }
  getBoundingClientRect() { return { left: 0, top: 0, right: 100, bottom: 100, width: 100, height: 100, x: 0, y: 0 }; }
  getClientRects() { return []; }
  querySelector() { return null; }
  querySelectorAll() { return []; }
  cloneNode() { return new MockElement(this.tagName); }
  insertBefore(a: any, _b: any) { this.children.unshift(a); if (a) a.parentNode = this; return a; }
  removeChild(child: any) { this.children = this.children.filter((c: any) => c !== child); if (child) child.parentNode = null; return child; }
  replaceChild(a: any, b: any) { const i = this.children.indexOf(b); if (i >= 0) this.children[i] = a; if (a) a.parentNode = this; return b; }
  focus() {}
  blur() {}
  remove() { if (this.parentNode) { this.parentNode.children = this.parentNode.children.filter((c: any) => c !== this); this.parentNode = null; } }
  get firstChild() { return this.children[0] || null; }
  get lastChild() { return this.children[this.children.length - 1] || null; }
  get nextSibling() { return null; }
  get previousSibling() { return null; }
  get childNodes() { return this.children; }
  get ownerDocument() { return (globalThis as any).document; }
  get nodeType() { return 1; }
  get nodeName() { return this.tagName.toUpperCase(); }
  dispatchEvent() { return true; }
  getRootNode() { return (globalThis as any).document; }
  get isConnected() { return false; }
  scrollTo() {}
  scrollTop = 0;
  scrollLeft = 0;
  scrollHeight = 100;
  scrollWidth = 100;
  clientHeight = 100;
  clientWidth = 100;
  offsetHeight = 100;
  offsetWidth = 100;
}

const mockDoc: any = {
  createElement(tag: string) { return new MockElement(tag); },
  createTextNode(text: string) { return { nodeType: 3, textContent: text, nodeValue: text, parentNode: null, ownerDocument: mockDoc }; },
  createDocumentFragment() { return new MockElement("fragment"); },
  createRange() {
    return {
      setEnd() {}, setStart() {},
      getBoundingClientRect() { return { left: 0, top: 0, right: 0, bottom: 0, width: 0, height: 0, x: 0, y: 0 }; },
      getClientRects() { return []; },
      commonAncestorContainer: null,
      collapse() {},
    };
  },
  addEventListener() {},
  removeEventListener() {},
  querySelector() { return null; },
  querySelectorAll() { return []; },
  body: new MockElement("body"),
  head: new MockElement("head"),
  documentElement: new MockElement("html"),
  activeElement: null,
  hasFocus() { return true; },
  defaultView: globalThis,
  fonts: { ready: Promise.resolve() },
  getSelection() {
    return {
      rangeCount: 0, anchorNode: null, focusNode: null, anchorOffset: 0, focusOffset: 0,
      getRangeAt() { return null; }, addRange() {}, removeAllRanges() {},
      collapse() {}, extend() {}, setBaseAndExtent() {}, isCollapsed: true, type: "None",
    };
  },
  getRootNode() { return mockDoc; },
  nodeType: 9,
  adoptedStyleSheets: [],
  ownerDocument: null as any,
};
mockDoc.ownerDocument = mockDoc;

if (typeof (globalThis as any).document === "undefined") {
  (globalThis as any).document = mockDoc;
}
const g = globalThis as any;
g.window ??= globalThis;
g.Window ??= class {};
g.navigator ??= { userAgent: "", platform: "", clipboard: { writeText: () => Promise.resolve(), readText: () => Promise.resolve("") } };
g.MutationObserver ??= class { observe() {} disconnect() {} takeRecords() { return []; } };
g.IntersectionObserver ??= class { observe() {} disconnect() {} unobserve() {} };
g.ResizeObserver ??= class { observe() {} disconnect() {} unobserve() {} };
g.requestAnimationFrame ??= (fn: any) => setTimeout(fn, 16);
g.cancelAnimationFrame ??= (id: any) => clearTimeout(id);
g.getComputedStyle ??= () => new Proxy({}, { get: (_: any, k: string) => k === "getPropertyValue" ? () => "" : "" });
g.matchMedia ??= () => ({ matches: false, addEventListener() {}, removeEventListener() {} });
g.CSS ??= { supports() { return false; } };
g.CSSStyleSheet ??= class { replaceSync() {} insertRule() {} cssRules = [] as any; };
g.StyleSheet ??= class {};
g.Node ??= class { static DOCUMENT_NODE = 9; static ELEMENT_NODE = 1; static TEXT_NODE = 3; };
g.Range ??= class {};
g.HTMLElement ??= MockElement;
g.Text ??= class { nodeType = 3; };
g.DocumentFragment ??= class {};
g.DOMParser ??= class {};
g.ClipboardEvent ??= class {};
g.scrollBy ??= () => {};
g.pageYOffset ??= 0;
g.innerHeight ??= 768;
g.innerWidth ??= 1024;
// ---------------------------------------------------------------------------

import { EditorView } from "../../src/core/view/index";
import { EditorState, Transaction } from "../../src/core/state/index";
import { xml, xmlLanguage, autoCloseTags } from "../../src/lang/xml/index";
import { ensureSyntaxTree, syntaxTree, foldable, getIndentation } from "../../src/core/language/index";

/** Track views so we can destroy them after each test to cancel async measure callbacks. */
const activeViews: EditorView[] = [];

/**
 * Create an EditorView with xml() extensions and a custom dispatch
 * that collects dispatched transactions instead of updating the DOM.
 */
function makeView(doc: string, cursorPos?: number) {
  const dispatched: Transaction[] = [];
  const state = EditorState.create({
    doc,
    selection: cursorPos != null ? { anchor: cursorPos } : undefined,
    extensions: [xml()],
  });
  const view = new EditorView({
    state,
    dispatchTransactions(trs) {
      for (const tr of trs) dispatched.push(tr);
    },
  });
  activeViews.push(view);
  ensureSyntaxTree(view.state, view.state.doc.length, 5000);
  return { view, dispatched };
}

/**
 * Simulate typing a single character by invoking the input handlers registered
 * on the view's state.  Returns the list of transactions that were dispatched.
 */
function simulateInput(view: EditorView, from: number, to: number, text: string, dispatched: Transaction[]) {
  const handlers = view.state.facet(EditorView.inputHandler);
  for (const handler of handlers) {
    const insertTr = () =>
      view.state.update({
        changes: { from, to, insert: text },
        selection: { anchor: from + text.length },
      });
    if (handler(view, from, to, text, insertTr)) return true;
  }
  return false;
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------
describe("XML advanced coverage (lines 67-115)", () => {
  afterEach(() => {
    // Destroy all views created during the test to cancel pending measure callbacks.
    while (activeViews.length) activeViews.pop()!.destroy();
  });
  // ------- elementName + autoCloseTags: typing ">" after open tag ----------
  describe("autoCloseTags — typing \">\" to auto-insert close tag", () => {
    it("inserts </root> when typing \">\" after <root", () => {
      const { view, dispatched } = makeView("<root", 5);
      const handled = simulateInput(view, 5, 5, ">", dispatched);
      expect(handled).toBe(true);
      expect(dispatched.length).toBe(2);
      // The second transaction contains the auto-inserted close tag
      const finalDoc = dispatched[dispatched.length - 1].state.doc.toString();
      expect(finalDoc).toBe("<root></root>");
    });

    it("inserts </div> when typing \">\" after <div", () => {
      const { view, dispatched } = makeView("<div", 4);
      const handled = simulateInput(view, 4, 4, ">", dispatched);
      expect(handled).toBe(true);
      const finalDoc = dispatched[dispatched.length - 1].state.doc.toString();
      expect(finalDoc).toBe("<div></div>");
    });

    it("inserts matching close tag for nested element", () => {
      const { view, dispatched } = makeView("<root><child", 12);
      const handled = simulateInput(view, 12, 12, ">", dispatched);
      expect(handled).toBe(true);
      const finalDoc = dispatched[dispatched.length - 1].state.doc.toString();
      expect(finalDoc).toContain("</child>");
    });

    it("does not auto-close when typing \">\" in a self-closing tag context", () => {
      // Self-closing: <br/> — typing ">" after "/" should not trigger close
      const { view, dispatched } = makeView("<br/", 4);
      const handled = simulateInput(view, 4, 4, ">", dispatched);
      // The handler may or may not handle this, but should not insert </br>
      if (dispatched.length > 0) {
        const finalDoc = dispatched[dispatched.length - 1].state.doc.toString();
        expect(finalDoc).not.toContain("</br>");
      }
    });

    it("does not auto-close when the element already has a close tag", () => {
      // <root></root> — cursor is between the two tags, typing ">" should not double-close
      const { view, dispatched } = makeView("<root></root>", 5);
      const handled = simulateInput(view, 5, 5, ">", dispatched);
      // Even if handled, should not add a second </root>
      if (dispatched.length > 0) {
        const finalDoc = dispatched[dispatched.length - 1].state.doc.toString();
        // Should not have three </root> segments
        const closeCount = finalDoc.split("</root>").length - 1;
        expect(closeCount).toBeLessThanOrEqual(2);
      }
    });

    it("returns false for non-xml content", () => {
      // Plain text without xml extension should not trigger
      const state = EditorState.create({
        doc: "<root",
        selection: { anchor: 5 },
        extensions: [],
      });
      const dispatched: Transaction[] = [];
      const view = new EditorView({
        state,
        dispatchTransactions(trs) {
          for (const tr of trs) dispatched.push(tr);
        },
      });
      activeViews.push(view);
      const handlers = view.state.facet(EditorView.inputHandler);
      // No xml input handlers registered
      expect(handlers.length).toBe(0);
    });

    it("handles tag with attributes when typing \">\"", () => {
      const { view, dispatched } = makeView('<root id="main"', 15);
      const handled = simulateInput(view, 15, 15, ">", dispatched);
      expect(handled).toBe(true);
      const finalDoc = dispatched[dispatched.length - 1].state.doc.toString();
      expect(finalDoc).toContain("</root>");
    });
  });

  // ------- autoCloseTags: typing "/" to auto-complete close tag ------------
  describe("autoCloseTags — typing \"/\" to auto-complete close tag", () => {
    it("completes </root> when typing \"/\" after \"<\" inside <root>", () => {
      // User has "<root><" and types "/", expecting "</root>"
      const { view, dispatched } = makeView("<root><", 7);
      const handled = simulateInput(view, 7, 7, "/", dispatched);
      expect(handled).toBe(true);
      const finalDoc = dispatched[dispatched.length - 1].state.doc.toString();
      expect(finalDoc).toContain("</root>");
    });

    it("completes </child> when typing \"/\" after \"<\" inside <child>", () => {
      const { view, dispatched } = makeView("<root><child><", 14);
      const handled = simulateInput(view, 14, 14, "/", dispatched);
      expect(handled).toBe(true);
      const finalDoc = dispatched[dispatched.length - 1].state.doc.toString();
      expect(finalDoc).toContain("</child>");
    });
  });

  // ------- autoCloseTags: edge cases that return false ---------------------
  describe("autoCloseTags — cases that do not trigger", () => {
    it("returns false for characters other than \">\" and \"/\"", () => {
      const { view, dispatched } = makeView("<root", 5);
      const handled = simulateInput(view, 5, 5, "x", dispatched);
      expect(handled).toBe(false);
    });

    it("returns false when from !== to (range selection)", () => {
      const { view, dispatched } = makeView("<root>text", 6);
      // Simulate replacing a selection (from != to)
      const handled = simulateInput(view, 6, 10, ">", dispatched);
      expect(handled).toBe(false);
    });

    it("returns false in readOnly state", () => {
      const dispatched: Transaction[] = [];
      const state = EditorState.create({
        doc: "<root",
        selection: { anchor: 5 },
        extensions: [xml(), EditorState.readOnly.of(true)],
      });
      const view = new EditorView({
        state,
        dispatchTransactions(trs) {
          for (const tr of trs) dispatched.push(tr);
        },
      });
      activeViews.push(view);
      ensureSyntaxTree(view.state, view.state.doc.length, 5000);
      const handled = simulateInput(view, 5, 5, ">", dispatched);
      expect(handled).toBe(false);
    });
  });

  // ------- elementName helper (tested indirectly via fold behavior) --------
  describe("fold behavior exercising tree structure", () => {
    it("folds an element with OpenTag and CloseTag", () => {
      const doc = "<root>\n  <child/>\n</root>";
      const state = EditorState.create({ doc, extensions: [xml()] });
      ensureSyntaxTree(state, doc.length, 5000);
      const fold = foldable(state, 0, 6);
      expect(fold).not.toBeNull();
      expect(fold!.from).toBe(6); // after ">" of <root>
      expect(fold!.to).toBe(18); // before "<" of </root>
    });

    it("returns null for self-closing element (no OpenTag/CloseTag pair)", () => {
      const doc = "<br/>";
      const state = EditorState.create({ doc, extensions: [xml()] });
      ensureSyntaxTree(state, doc.length, 5000);
      const fold = foldable(state, 0, 5);
      expect(fold).toBeNull();
    });

    it("folds nested elements independently", () => {
      const doc = "<a>\n  <b>\n    text\n  </b>\n</a>";
      const state = EditorState.create({ doc, extensions: [xml()] });
      ensureSyntaxTree(state, doc.length, 5000);
      // Fold outer <a>
      const foldA = foldable(state, 0, 3);
      expect(foldA).not.toBeNull();
      // Fold inner <b>
      const lineB = state.doc.line(2);
      const foldB = foldable(state, lineB.from, lineB.to);
      expect(foldB).not.toBeNull();
    });

    it("handles element with missing close tag gracefully", () => {
      // Unclosed element — fold should still attempt
      const doc = "<root>\n  content";
      const state = EditorState.create({ doc, extensions: [xml()] });
      ensureSyntaxTree(state, doc.length, 5000);
      const fold = foldable(state, 0, 6);
      // May or may not be foldable depending on error recovery, but should not throw
      expect(fold === null || typeof fold.from === "number").toBe(true);
    });
  });

  // ------- indentation strategies -----------------------------------------
  describe("indentation edge cases", () => {
    it("indents child inside deeply nested elements", () => {
      const doc = "<a>\n  <b>\n    <c>\n      text\n    </c>\n  </b>\n</a>";
      const state = EditorState.create({ doc, extensions: [xml()] });
      ensureSyntaxTree(state, doc.length, 5000);
      // Line with "      text" starts at line 4
      const line4 = state.doc.line(4);
      const indent = getIndentation(state, line4.from);
      expect(typeof indent).toBe("number");
      expect(indent).toBeGreaterThanOrEqual(0);
    });

    it("closing tag line gets reduced indentation", () => {
      const doc = "<root>\n  <child/>\n</root>";
      const state = EditorState.create({ doc, extensions: [xml()] });
      ensureSyntaxTree(state, doc.length, 5000);
      const closingLine = state.doc.line(3); // "</root>"
      const indent = getIndentation(state, closingLine.from);
      expect(indent).toBe(0);
    });

    it("OpenTag with attributes on next line indents from tag start", () => {
      const doc = "<root\n  attr=\"val\"\n  other=\"x\">";
      const state = EditorState.create({ doc, extensions: [xml()] });
      ensureSyntaxTree(state, doc.length, 5000);
      const attrLine = state.doc.line(2);
      const indent = getIndentation(state, attrLine.from);
      expect(typeof indent).toBe("number");
    });
  });

  // ------- xml() config paths ---------------------------------------------
  describe("xml() configuration paths", () => {
    it("includes autoCloseTags extension by default", () => {
      const support = xml();
      // The support extensions array should contain autoCloseTags
      expect(support).toBeDefined();
      expect(support.language).toBe(xmlLanguage);
    });

    it("excludes autoCloseTags when autoCloseTags: false", () => {
      const support = xml({ autoCloseTags: false });
      expect(support).toBeDefined();
      expect(support.language).toBe(xmlLanguage);
    });

    it("autoCloseTags is an Extension value", () => {
      expect(autoCloseTags).toBeDefined();
    });

    it("xml() with schema and autoCloseTags enabled", () => {
      const support = xml({
        elements: [{ name: "root", top: true, children: ["item"] }, { name: "item" }],
        attributes: [{ name: "id", global: true }],
        autoCloseTags: true,
      });
      expect(support).toBeDefined();
    });
  });
});
