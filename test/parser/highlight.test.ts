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
});
