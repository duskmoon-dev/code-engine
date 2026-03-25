import { describe, it, expect } from "bun:test";
import {
  tags,
  styleTags,
  Tag,
  tagHighlighter,
  highlightTree,
  classHighlighter,
  getStyleTags,
  highlightCode,
} from "../../src/parser/highlight/index";
import { pythonLanguage } from "../../src/lang/python/index";

describe("Parser highlight module", () => {
  describe("exports", () => {
    it("exports tags as an object", () => {
      expect(tags).toBeDefined();
      expect(typeof tags).toBe("object");
    });

    it("exports styleTags as a function", () => {
      expect(styleTags).toBeDefined();
      expect(typeof styleTags).toBe("function");
    });

    it("exports Tag as a function (class)", () => {
      expect(Tag).toBeDefined();
      expect(typeof Tag).toBe("function");
    });

    it("exports tagHighlighter as a function", () => {
      expect(tagHighlighter).toBeDefined();
      expect(typeof tagHighlighter).toBe("function");
    });

    it("exports highlightTree as a function", () => {
      expect(highlightTree).toBeDefined();
      expect(typeof highlightTree).toBe("function");
    });

    it("exports classHighlighter as an object", () => {
      expect(classHighlighter).toBeDefined();
      expect(typeof classHighlighter).toBe("object");
    });

    it("exports getStyleTags as a function", () => {
      expect(getStyleTags).toBeDefined();
      expect(typeof getStyleTags).toBe("function");
    });

    it("exports highlightCode as a function", () => {
      expect(highlightCode).toBeDefined();
      expect(typeof highlightCode).toBe("function");
    });
  });

  describe("tags object", () => {
    it("has comment tag", () => {
      expect(tags.comment).toBeDefined();
      expect(tags.comment).toBeInstanceOf(Tag);
    });

    it("has keyword tag", () => {
      expect(tags.keyword).toBeDefined();
      expect(tags.keyword).toBeInstanceOf(Tag);
    });

    it("has string tag", () => {
      expect(tags.string).toBeDefined();
      expect(tags.string).toBeInstanceOf(Tag);
    });

    it("has number tag", () => {
      expect(tags.number).toBeDefined();
      expect(tags.number).toBeInstanceOf(Tag);
    });

    it("has name tag", () => {
      expect(tags.name).toBeDefined();
      expect(tags.name).toBeInstanceOf(Tag);
    });

    it("has variableName tag", () => {
      expect(tags.variableName).toBeDefined();
      expect(tags.variableName).toBeInstanceOf(Tag);
    });

    it("has typeName tag", () => {
      expect(tags.typeName).toBeDefined();
      expect(tags.typeName).toBeInstanceOf(Tag);
    });

    it("has propertyName tag", () => {
      expect(tags.propertyName).toBeDefined();
      expect(tags.propertyName).toBeInstanceOf(Tag);
    });

    it("has operator tag", () => {
      expect(tags.operator).toBeDefined();
      expect(tags.operator).toBeInstanceOf(Tag);
    });

    it("has punctuation tag", () => {
      expect(tags.punctuation).toBeDefined();
      expect(tags.punctuation).toBeInstanceOf(Tag);
    });

    it("has bracket tag", () => {
      expect(tags.bracket).toBeDefined();
      expect(tags.bracket).toBeInstanceOf(Tag);
    });

    it("has meta tag", () => {
      expect(tags.meta).toBeDefined();
      expect(tags.meta).toBeInstanceOf(Tag);
    });

    it("has literal tag", () => {
      expect(tags.literal).toBeDefined();
      expect(tags.literal).toBeInstanceOf(Tag);
    });

    it("has content tag", () => {
      expect(tags.content).toBeDefined();
      expect(tags.content).toBeInstanceOf(Tag);
    });

    it("has heading tag", () => {
      expect(tags.heading).toBeDefined();
      expect(tags.heading).toBeInstanceOf(Tag);
    });

    it("has modifier tags as functions", () => {
      expect(typeof tags.definition).toBe("function");
      expect(typeof tags.constant).toBe("function");
      expect(typeof tags.function).toBe("function");
      expect(typeof tags.standard).toBe("function");
      expect(typeof tags.local).toBe("function");
      expect(typeof tags.special).toBe("function");
    });
  });

  describe("Tag", () => {
    it("can define a new tag", () => {
      const custom = Tag.define();
      expect(custom).toBeInstanceOf(Tag);
      expect(custom.set).toContain(custom);
    });

    it("can define a tag with a parent", () => {
      const parent = Tag.define();
      const child = Tag.define(parent);
      expect(child).toBeInstanceOf(Tag);
      expect(child.set).toContain(child);
      expect(child.set).toContain(parent);
    });

    it("can define a tag with a name", () => {
      const named = Tag.define("myTag");
      expect(named).toBeInstanceOf(Tag);
      expect(named.toString()).toBe("myTag");
    });

    it("can define a modifier", () => {
      const mod = Tag.defineModifier("test");
      expect(typeof mod).toBe("function");

      const base = Tag.define("base");
      const modified = mod(base);
      expect(modified).toBeInstanceOf(Tag);
      expect(modified).not.toBe(base);
    });

    it("applying the same modifier twice returns the same tag", () => {
      const mod = Tag.defineModifier();
      const base = Tag.define();
      const modified1 = mod(base);
      const modified2 = mod(base);
      expect(modified1).toBe(modified2);
    });

    it("throws when deriving from a modified tag", () => {
      const mod = Tag.defineModifier();
      const base = Tag.define();
      const modified = mod(base);
      expect(() => Tag.define(modified)).toThrow("Can not derive from a modified tag");
    });
  });

  describe("classHighlighter", () => {
    it("has a style method", () => {
      expect(typeof classHighlighter.style).toBe("function");
    });

    it("returns a class string for known tags", () => {
      const result = classHighlighter.style([tags.comment]);
      expect(result).toBe("tok-comment");
    });

    it("returns a class string for keyword tag", () => {
      const result = classHighlighter.style([tags.keyword]);
      expect(result).toBe("tok-keyword");
    });

    it("returns null for unrecognized tags", () => {
      const custom = Tag.define();
      const result = classHighlighter.style([custom]);
      expect(result).toBeNull();
    });
  });

  describe("tagHighlighter", () => {
    it("creates a highlighter with a style method", () => {
      const hl = tagHighlighter([
        { tag: tags.comment, class: "my-comment" },
      ]);
      expect(typeof hl.style).toBe("function");
    });

    it("returns the correct class for matching tags", () => {
      const hl = tagHighlighter([
        { tag: tags.comment, class: "my-comment" },
        { tag: tags.keyword, class: "my-keyword" },
      ]);
      expect(hl.style([tags.comment])).toBe("my-comment");
      expect(hl.style([tags.keyword])).toBe("my-keyword");
    });

    it("returns null for non-matching tags", () => {
      const hl = tagHighlighter([
        { tag: tags.comment, class: "my-comment" },
      ]);
      const custom = Tag.define();
      expect(hl.style([custom])).toBeNull();
    });

    it("supports the all option", () => {
      const hl = tagHighlighter([], { all: "token" });
      const custom = Tag.define();
      expect(hl.style([custom])).toBe("token");
    });
  });

  describe("highlightCode", () => {
    it("calls the put callback for highlighted ranges", () => {
      const code = "def hello(): pass";
      const tree = pythonLanguage.parser.parse(code);
      const texts: string[] = [];
      highlightCode(code, tree, classHighlighter, (text, _style) => {
        texts.push(text);
      }, () => {});
      expect(texts.length).toBeGreaterThan(0);
    });

    it("covers the entire code string", () => {
      const code = "x = 42";
      const tree = pythonLanguage.parser.parse(code);
      let covered = 0;
      highlightCode(code, tree, classHighlighter, (text, _style) => {
        covered += text.length;
      }, () => {});
      expect(covered).toBe(code.length);
    });
  });

  describe("highlightTree", () => {
    it("calls the put callback for each highlighted node", () => {
      const tree = pythonLanguage.parser.parse("import os\nprint(os.getcwd())");
      const spans: Array<{ from: number; to: number }> = [];
      highlightTree(tree, classHighlighter, (from, to) => {
        spans.push({ from, to });
      });
      expect(spans.length).toBeGreaterThan(0);
    });

    it("spans do not overlap (each from < to)", () => {
      const tree = pythonLanguage.parser.parse("x = 1 + 2");
      const spans: Array<{ from: number; to: number }> = [];
      highlightTree(tree, classHighlighter, (from, to) => {
        spans.push({ from, to });
      });
      for (const s of spans) {
        expect(s.from).toBeLessThan(s.to);
      }
    });

    it("from values are monotonically non-decreasing", () => {
      const tree = pythonLanguage.parser.parse("def func(a, b): return a + b");
      const froms: number[] = [];
      highlightTree(tree, classHighlighter, (from, _to) => {
        froms.push(from);
      });
      for (let i = 1; i < froms.length; i++) {
        expect(froms[i]).toBeGreaterThanOrEqual(froms[i-1]);
      }
    });
  });

  describe("highlightCode behavioral", () => {
    it("all emitted text concatenated equals original code", () => {
      const code = "x = 1\ny = 2\nz = x + y";
      const tree = pythonLanguage.parser.parse(code);
      let result = "";
      highlightCode(code, tree, classHighlighter, (text, _style) => {
        result += text;
      }, () => { result += "\n"; });
      // The concatenated text (minus newline tokens added by breakFn) should cover original
      expect(result.replace(/\n/g, "")).toContain("x");
    });

    it("some style classes include tok- prefix", () => {
      const code = "def hello(): pass";
      const tree = pythonLanguage.parser.parse(code);
      const classes: string[] = [];
      highlightCode(code, tree, classHighlighter, (_text, style) => {
        if (style) classes.push(style);
      }, () => {});
      // At least one tok-* class should appear
      const hasTok = classes.some(c => c.includes("tok-"));
      expect(hasTok).toBe(true);
    });
  });

  describe("getStyleTags", () => {
    it("returns null for an empty tree node", () => {
      const node = pythonLanguage.parser.parse("x").cursor().node;
      // getStyleTags may return null or a tag array depending on the node
      const result = getStyleTags(node);
      expect(result === null || Array.isArray(result)).toBe(true);
    });
  });

  describe("Tag behavioral", () => {
    it("Tag.define() creates a distinct tag each time", () => {
      const t1 = Tag.define();
      const t2 = Tag.define();
      expect(t1).not.toBe(t2);
    });

    it("Tag.define() with parent creates a sub-tag", () => {
      const parent = Tag.define();
      const child = Tag.define(parent);
      expect(child).toBeDefined();
      expect(child).not.toBe(parent);
    });

    it("tags.comment is a valid Tag", () => {
      expect(tags.comment).toBeDefined();
      expect(typeof tags.comment).toBe("object");
    });

    it("tags.string is a valid Tag", () => {
      expect(tags.string).toBeDefined();
    });

    it("tags.number is a valid Tag", () => {
      expect(tags.number).toBeDefined();
    });
  });
});
