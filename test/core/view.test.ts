import { describe, it, expect } from "bun:test";
import {
  EditorView,
  ViewPlugin,
  ViewUpdate,
  logException,
  Decoration,
  WidgetType,
  BlockType,
  BlockWrapper,
  BlockInfo,
  BidiSpan,
  Direction,
  keymap,
  runScopeHandlers,
  drawSelection,
  getDrawSelectionConfig,
  dropCursor,
  highlightSpecialChars,
  scrollPastEnd,
  highlightActiveLine,
  placeholder,
  layer,
  RectangleMarker,
  MatchDecorator,
  rectangularSelection,
  crosshairCursor,
  showTooltip,
  tooltips,
  getTooltip,
  hoverTooltip,
  hasHoverTooltips,
  closeHoverTooltips,
  repositionTooltips,
  showPanel,
  getPanel,
  panels,
  showDialog,
  getDialog,
  lineNumbers,
  highlightActiveLineGutter,
  gutter,
  gutters,
  GutterMarker,
  gutterLineClass,
  gutterWidgetClass,
  lineNumberMarkers,
  lineNumberWidgetMarker,
  highlightWhitespace,
  highlightTrailingWhitespace,
  shadowDOMTooltipSpace,
  __test,
} from "../../src/core/view/index";
import { EditorState } from "../../src/core/state/index";

describe("core/view exports", () => {
  describe("EditorView", () => {
    it("is exported as a function (class)", () => {
      expect(typeof EditorView).toBe("function");
    });
  });

  describe("ViewPlugin", () => {
    it("is exported as a function (class)", () => {
      expect(typeof ViewPlugin).toBe("function");
    });

    it("has a define static method", () => {
      expect(typeof ViewPlugin.define).toBe("function");
    });

    it("has a fromClass static method", () => {
      expect(typeof ViewPlugin.fromClass).toBe("function");
    });
  });

  describe("ViewUpdate", () => {
    it("is exported as a function (class)", () => {
      expect(typeof ViewUpdate).toBe("function");
    });
  });

  describe("logException", () => {
    it("is exported as a function", () => {
      expect(typeof logException).toBe("function");
    });
  });

  describe("Decoration", () => {
    it("is exported as a function (class)", () => {
      expect(typeof Decoration).toBe("function");
    });

    it("has static mark method", () => {
      expect(typeof Decoration.mark).toBe("function");
    });

    it("has static widget method", () => {
      expect(typeof Decoration.widget).toBe("function");
    });

    it("has static replace method", () => {
      expect(typeof Decoration.replace).toBe("function");
    });

    it("has static line method", () => {
      expect(typeof Decoration.line).toBe("function");
    });

    it("has static set method", () => {
      expect(typeof Decoration.set).toBe("function");
    });

    it("has static none property (empty decoration set)", () => {
      expect(Decoration.none).toBeDefined();
    });

    it("Decoration.none has size 0", () => {
      expect(Decoration.none.size).toBe(0);
    });
  });

  describe("WidgetType", () => {
    it("is exported as a function (class)", () => {
      expect(typeof WidgetType).toBe("function");
    });
  });

  describe("BlockType", () => {
    it("is exported as an enum with expected values", () => {
      expect(BlockType).toBeDefined();
      expect(typeof BlockType.Text).toBe("number");
      expect(typeof BlockType.WidgetBefore).toBe("number");
      expect(typeof BlockType.WidgetAfter).toBe("number");
      expect(typeof BlockType.WidgetRange).toBe("number");
    });
  });

  describe("BlockWrapper", () => {
    it("is exported as a function (class)", () => {
      expect(typeof BlockWrapper).toBe("function");
    });
  });

  describe("BlockInfo", () => {
    it("is exported as a function (class)", () => {
      expect(typeof BlockInfo).toBe("function");
    });
  });

  describe("BidiSpan", () => {
    it("is exported as a function (class)", () => {
      expect(typeof BidiSpan).toBe("function");
    });
  });

  describe("Direction", () => {
    it("is exported as an enum with LTR and RTL", () => {
      expect(Direction).toBeDefined();
      expect(Direction.LTR).toBe(0);
      expect(Direction.RTL).toBe(1);
    });

    it("supports reverse lookup", () => {
      expect(Direction[0]).toBe("LTR");
      expect(Direction[1]).toBe("RTL");
    });
  });

  describe("keymap", () => {
    it("is exported and defined", () => {
      expect(keymap).toBeDefined();
    });
  });

  describe("runScopeHandlers", () => {
    it("is exported as a function", () => {
      expect(typeof runScopeHandlers).toBe("function");
    });
  });

  describe("drawSelection", () => {
    it("is exported as a function", () => {
      expect(typeof drawSelection).toBe("function");
    });

    it("returns an extension when called with no arguments", () => {
      const ext = drawSelection();
      expect(ext).toBeDefined();
    });
  });

  describe("getDrawSelectionConfig", () => {
    it("is exported as a function", () => {
      expect(typeof getDrawSelectionConfig).toBe("function");
    });

    it("returns default config when no drawSelection extension is present", () => {
      const state = EditorState.create({ doc: "hello" });
      const config = getDrawSelectionConfig(state);
      expect(config.cursorBlinkRate).toBe(1200);
      expect(config.drawRangeCursor).toBe(true);
    });

    it("returns custom cursorBlinkRate when drawSelection is configured", () => {
      const state = EditorState.create({
        doc: "hello",
        extensions: [drawSelection({ cursorBlinkRate: 0 })],
      });
      const config = getDrawSelectionConfig(state);
      expect(config.cursorBlinkRate).toBe(0);
    });

    it("combines two drawSelection configs with min cursorBlinkRate", () => {
      const state = EditorState.create({
        doc: "hello",
        extensions: [drawSelection({ cursorBlinkRate: 800 }), drawSelection({ cursorBlinkRate: 600 })],
      });
      const config = getDrawSelectionConfig(state);
      expect(config.cursorBlinkRate).toBe(600);
    });
  });

  describe("dropCursor", () => {
    it("is exported as a function", () => {
      expect(typeof dropCursor).toBe("function");
    });

    it("returns an extension when called", () => {
      const ext = dropCursor();
      expect(ext).toBeDefined();
    });
  });

  describe("highlightSpecialChars", () => {
    it("is exported as a function", () => {
      expect(typeof highlightSpecialChars).toBe("function");
    });

    it("returns an extension when called with no arguments", () => {
      const ext = highlightSpecialChars();
      expect(ext).toBeDefined();
    });
  });

  describe("scrollPastEnd", () => {
    it("is exported as a function", () => {
      expect(typeof scrollPastEnd).toBe("function");
    });

    it("returns an extension when called", () => {
      const ext = scrollPastEnd();
      expect(ext).toBeDefined();
    });
  });

  describe("highlightActiveLine", () => {
    it("is exported as a function", () => {
      expect(typeof highlightActiveLine).toBe("function");
    });

    it("returns an extension when called", () => {
      const ext = highlightActiveLine();
      expect(ext).toBeDefined();
    });
  });

  describe("placeholder", () => {
    it("is exported as a function", () => {
      expect(typeof placeholder).toBe("function");
    });

    it("returns an extension when called with a string", () => {
      const ext = placeholder("Type here...");
      expect(ext).toBeDefined();
    });
  });

  describe("layer", () => {
    it("is exported as a function", () => {
      expect(typeof layer).toBe("function");
    });
  });

  describe("RectangleMarker", () => {
    it("is exported as a function (class)", () => {
      expect(typeof RectangleMarker).toBe("function");
    });

    it("can be instantiated with coordinates", () => {
      const marker = new RectangleMarker("test-class", 10, 20, 100, 50);
      expect(marker).toBeDefined();
      expect(marker.left).toBe(10);
      expect(marker.top).toBe(20);
      expect(marker.width).toBe(100);
      expect(marker.height).toBe(50);
    });

    it("supports null width", () => {
      const marker = new RectangleMarker("test-class", 0, 0, null, 30);
      expect(marker.width).toBeNull();
      expect(marker.height).toBe(30);
    });

    it("eq compares two markers", () => {
      const a = new RectangleMarker("cls", 10, 20, 100, 50);
      const b = new RectangleMarker("cls", 10, 20, 100, 50);
      const c = new RectangleMarker("cls", 10, 20, 200, 50);
      expect(a.eq(b)).toBe(true);
      expect(a.eq(c)).toBe(false);
    });
  });

  describe("MatchDecorator", () => {
    it("is exported as a function (class)", () => {
      expect(typeof MatchDecorator).toBe("function");
    });
  });

  describe("rectangularSelection", () => {
    it("is exported as a function", () => {
      expect(typeof rectangularSelection).toBe("function");
    });
  });

  describe("crosshairCursor", () => {
    it("is exported as a function", () => {
      expect(typeof crosshairCursor).toBe("function");
    });
  });

  describe("tooltip exports", () => {
    it("showTooltip is a defined facet", () => {
      expect(showTooltip).toBeDefined();
    });

    it("tooltips is exported as a function", () => {
      expect(typeof tooltips).toBe("function");
    });

    it("getTooltip is exported as a function", () => {
      expect(typeof getTooltip).toBe("function");
    });

    it("hoverTooltip is exported as a function", () => {
      expect(typeof hoverTooltip).toBe("function");
    });

    it("hasHoverTooltips is exported as a function", () => {
      expect(typeof hasHoverTooltips).toBe("function");
    });

    it("closeHoverTooltips is a defined state effect", () => {
      expect(closeHoverTooltips).toBeDefined();
    });

    it("repositionTooltips is exported as a function", () => {
      expect(typeof repositionTooltips).toBe("function");
    });
  });

  describe("panel exports", () => {
    it("showPanel is a defined facet", () => {
      expect(showPanel).toBeDefined();
    });

    it("getPanel is exported as a function", () => {
      expect(typeof getPanel).toBe("function");
    });

    it("panels is exported as a function", () => {
      expect(typeof panels).toBe("function");
    });

    it("panels returns an extension for empty config", () => {
      const ext = panels();
      expect(ext).toBeDefined();
      expect(Array.isArray(ext)).toBe(true);
    });
  });

  describe("dialog exports", () => {
    it("showDialog is exported as a function", () => {
      expect(typeof showDialog).toBe("function");
    });

    it("getDialog is exported as a function", () => {
      expect(typeof getDialog).toBe("function");
    });
  });

  describe("gutter exports", () => {
    it("lineNumbers is exported as a function", () => {
      expect(typeof lineNumbers).toBe("function");
    });

    it("highlightActiveLineGutter is exported as a function", () => {
      expect(typeof highlightActiveLineGutter).toBe("function");
    });

    it("gutter is exported as a function", () => {
      expect(typeof gutter).toBe("function");
    });

    it("gutters is exported as a function", () => {
      expect(typeof gutters).toBe("function");
    });

    it("GutterMarker is exported as a function (class)", () => {
      expect(typeof GutterMarker).toBe("function");
    });

    it("gutterLineClass is a defined facet", () => {
      expect(gutterLineClass).toBeDefined();
    });

    it("gutterWidgetClass is a defined facet", () => {
      expect(gutterWidgetClass).toBeDefined();
    });

    it("lineNumberMarkers is a defined facet", () => {
      expect(lineNumberMarkers).toBeDefined();
    });

    it("lineNumberWidgetMarker is a defined facet", () => {
      expect(lineNumberWidgetMarker).toBeDefined();
    });

    it("lineNumbers returns an extension", () => {
      const ext = lineNumbers();
      expect(ext).toBeDefined();
    });

    it("highlightActiveLineGutter returns an extension", () => {
      const ext = highlightActiveLineGutter();
      expect(ext).toBeDefined();
    });

    it("gutters returns an extension", () => {
      const ext = gutters();
      expect(ext).toBeDefined();
    });
  });

  describe("whitespace highlight exports", () => {
    it("highlightWhitespace is exported as a function", () => {
      expect(typeof highlightWhitespace).toBe("function");
    });

    it("highlightTrailingWhitespace is exported as a function", () => {
      expect(typeof highlightTrailingWhitespace).toBe("function");
    });

    it("highlightWhitespace returns an extension", () => {
      const ext = highlightWhitespace();
      expect(ext).toBeDefined();
    });

    it("highlightTrailingWhitespace returns an extension", () => {
      const ext = highlightTrailingWhitespace();
      expect(ext).toBeDefined();
    });
  });

  describe("__test internal exports", () => {
    it("is exported as an object", () => {
      expect(typeof __test).toBe("object");
      expect(__test).toBeDefined();
    });

    it("contains HeightMap", () => {
      expect(__test.HeightMap).toBeDefined();
    });

    it("contains HeightOracle", () => {
      expect(typeof __test.HeightOracle).toBe("function");
    });

    it("contains MeasuredHeights", () => {
      expect(typeof __test.MeasuredHeights).toBe("function");
    });

    it("contains QueryType enum", () => {
      expect(__test.QueryType).toBeDefined();
    });

    it("contains ChangedRange", () => {
      expect(__test.ChangedRange).toBeDefined();
    });

    it("contains computeOrder function", () => {
      expect(typeof __test.computeOrder).toBe("function");
    });

    it("contains moveVisually function", () => {
      expect(typeof __test.moveVisually).toBe("function");
    });

    it("contains clearHeightChangeFlag function", () => {
      expect(typeof __test.clearHeightChangeFlag).toBe("function");
    });

    it("contains getHeightChangeFlag function", () => {
      expect(typeof __test.getHeightChangeFlag).toBe("function");
    });
  });

  describe("__test.HeightOracle", () => {
    it("can be instantiated", () => {
      const oracle = new __test.HeightOracle(false);
      expect(oracle).toBeDefined();
      expect(oracle.lineHeight).toBe(14);
      expect(oracle.charWidth).toBe(7);
      expect(oracle.textHeight).toBe(14);
      expect(oracle.lineLength).toBe(30);
    });

    it("computes heightForLine without wrapping", () => {
      const oracle = new __test.HeightOracle(false);
      expect(oracle.heightForLine(10)).toBe(14);
      expect(oracle.heightForLine(100)).toBe(14);
    });

    it("computes heightForLine with wrapping", () => {
      const oracle = new __test.HeightOracle(true);
      // Short line - single line height
      expect(oracle.heightForLine(10)).toBe(14);
      // Long line - multiple lines
      const height = oracle.heightForLine(100);
      expect(height).toBeGreaterThan(14);
    });

    it("mustRefreshForWrapping detects wrapping change", () => {
      const oracle = new __test.HeightOracle(false);
      expect(oracle.mustRefreshForWrapping("pre-wrap")).toBe(true);
      expect(oracle.mustRefreshForWrapping("normal")).toBe(true);
      expect(oracle.mustRefreshForWrapping("pre")).toBe(false);
      expect(oracle.mustRefreshForWrapping("nowrap")).toBe(false);
    });

    it("mustRefreshForHeights tracks new height samples", () => {
      const oracle = new __test.HeightOracle(false);
      // First time seeing this height should return true
      expect(oracle.mustRefreshForHeights([20])).toBe(true);
      // Same height again should return false
      expect(oracle.mustRefreshForHeights([20])).toBe(false);
      // New height should return true
      expect(oracle.mustRefreshForHeights([25])).toBe(true);
    });
  });

  describe("__test.clearHeightChangeFlag", () => {
    it("resets the height change flag", () => {
      __test.clearHeightChangeFlag();
      expect(__test.getHeightChangeFlag()).toBe(false);
    });
  });

  describe("Direction enum values", () => {
    it("LTR is 0 and RTL is 1 matching bidi base levels", () => {
      expect(Direction.LTR).toBe(0);
      expect(Direction.RTL).toBe(1);
    });

    it("only has two values", () => {
      // Enum has both numeric and string keys
      const numericKeys = Object.keys(Direction).filter(k => !isNaN(Number(k)));
      expect(numericKeys.length).toBe(2);
    });
  });

  describe("Decoration.mark", () => {
    it("creates a mark decoration", () => {
      const deco = Decoration.mark({ class: "highlight" });
      expect(deco).toBeDefined();
      expect(deco.spec.class).toBe("highlight");
    });

    it("creates a mark decoration with attributes", () => {
      const deco = Decoration.mark({ attributes: { "data-type": "error" } });
      expect(deco).toBeDefined();
      expect(deco.spec.attributes["data-type"]).toBe("error");
    });

    it("creates a mark decoration with tagName", () => {
      const deco = Decoration.mark({ tagName: "strong" });
      expect(deco.spec.tagName).toBe("strong");
    });
  });

  describe("Decoration.replace", () => {
    it("creates a replace decoration", () => {
      const deco = Decoration.replace({});
      expect(deco).toBeDefined();
    });
  });

  describe("Decoration.line", () => {
    it("creates a line decoration with class", () => {
      const deco = Decoration.line({ class: "active-line" });
      expect(deco).toBeDefined();
      expect(deco.spec.class).toBe("active-line");
    });
  });

  describe("Decoration.set", () => {
    it("creates an empty decoration set from empty array", () => {
      const set = Decoration.set([]);
      expect(set).toBeDefined();
      expect(set.size).toBe(0);
    });

    it("creates a decoration set from decorations", () => {
      const mark = Decoration.mark({ class: "test" });
      const set = Decoration.set([mark.range(0, 5)]);
      expect(set.size).toBe(1);
    });

    it("creates a sorted decoration set", () => {
      const m1 = Decoration.mark({ class: "a" });
      const m2 = Decoration.mark({ class: "b" });
      const set = Decoration.set([m2.range(5, 10), m1.range(0, 3)], true);
      expect(set.size).toBe(2);
    });
  });

  describe("RectangleMarker.eq edge cases", () => {
    it("returns false for different classes", () => {
      const a = new RectangleMarker("cls-a", 10, 20, 100, 50);
      const b = new RectangleMarker("cls-b", 10, 20, 100, 50);
      expect(a.eq(b)).toBe(false);
    });

    it("returns false for different positions", () => {
      const a = new RectangleMarker("cls", 0, 0, 100, 50);
      const b = new RectangleMarker("cls", 1, 0, 100, 50);
      expect(a.eq(b)).toBe(false);
    });

    it("returns true for identical markers", () => {
      const a = new RectangleMarker("cls", 0, 0, null, 50);
      const b = new RectangleMarker("cls", 0, 0, null, 50);
      expect(a.eq(b)).toBe(true);
    });
  });

  // [DUSKMOON] Shadow DOM improvements
  describe("Shadow DOM improvements", () => {
    describe("EditorView.shadowHostOverflow", () => {
      it("is a facet on EditorView", () => {
        expect(EditorView.shadowHostOverflow).toBeDefined();
      });

      it("can be used as an extension", () => {
        const ext = EditorView.shadowHostOverflow.of(true);
        expect(ext).toBeDefined();
      });
    });

    describe("shadowDOMTooltipSpace", () => {
      it("is exported as a function", () => {
        expect(typeof shadowDOMTooltipSpace).toBe("function");
      });
    });
  });
});
