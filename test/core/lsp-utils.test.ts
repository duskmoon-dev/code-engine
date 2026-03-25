import { describe, it, expect } from "bun:test"
import { Text } from "../../src/core/state/index"
import { toPosition, fromPosition } from "../../src/core/lsp/pos"
import { escHTML, docToHTML } from "../../src/core/lsp/text"
import { Marked } from "../../src/core/lsp/marked"

describe("LSP pos utilities", () => {
  const doc = Text.of(["hello", "world", "foo bar"])

  describe("toPosition", () => {
    it("converts start of document", () => {
      const pos = toPosition(doc, 0)
      expect(pos).toEqual({ line: 0, character: 0 })
    })

    it("converts end of first line", () => {
      const pos = toPosition(doc, 5)
      expect(pos).toEqual({ line: 0, character: 5 })
    })

    it("converts start of second line", () => {
      const pos = toPosition(doc, 6)
      expect(pos).toEqual({ line: 1, character: 0 })
    })

    it("converts middle of third line", () => {
      const pos = toPosition(doc, 15)
      expect(pos).toEqual({ line: 2, character: 3 })
    })

    it("converts end of document", () => {
      const pos = toPosition(doc, doc.length)
      expect(pos).toEqual({ line: 2, character: 7 })
    })
  })

  describe("fromPosition", () => {
    it("converts start of document", () => {
      expect(fromPosition(doc, { line: 0, character: 0 })).toBe(0)
    })

    it("converts end of first line", () => {
      expect(fromPosition(doc, { line: 0, character: 5 })).toBe(5)
    })

    it("converts start of second line", () => {
      expect(fromPosition(doc, { line: 1, character: 0 })).toBe(6)
    })

    it("converts middle of third line", () => {
      expect(fromPosition(doc, { line: 2, character: 3 })).toBe(15)
    })

    it("roundtrips with toPosition", () => {
      for (const offset of [0, 3, 5, 6, 8, 11, 12, 15, 18]) {
        if (offset > doc.length) continue
        const lspPos = toPosition(doc, offset)
        expect(fromPosition(doc, lspPos)).toBe(offset)
      }
    })
  })

  describe("single-line document", () => {
    const singleLine = Text.of(["abc"])

    it("toPosition handles single-line doc", () => {
      expect(toPosition(singleLine, 0)).toEqual({ line: 0, character: 0 })
      expect(toPosition(singleLine, 2)).toEqual({ line: 0, character: 2 })
    })

    it("fromPosition handles single-line doc", () => {
      expect(fromPosition(singleLine, { line: 0, character: 0 })).toBe(0)
      expect(fromPosition(singleLine, { line: 0, character: 3 })).toBe(3)
    })
  })

  describe("empty document", () => {
    const emptyDoc = Text.of([""])

    it("toPosition at position 0", () => {
      expect(toPosition(emptyDoc, 0)).toEqual({ line: 0, character: 0 })
    })

    it("fromPosition at line 0 char 0", () => {
      expect(fromPosition(emptyDoc, { line: 0, character: 0 })).toBe(0)
    })
  })
})

describe("escHTML", () => {
  it("escapes angle brackets", () => {
    expect(escHTML("<div>")).toBe("&lt;div>")
  })

  it("escapes ampersands", () => {
    expect(escHTML("a & b")).toBe("a &amp; b")
  })

  it("converts newlines to <br>", () => {
    expect(escHTML("a\nb")).toBe("a<br>b")
  })

  it("handles multiple special chars", () => {
    expect(escHTML("<a & b\nc>")).toBe("&lt;a &amp; b<br>c>")
  })

  it("returns plain text unchanged", () => {
    expect(escHTML("hello world")).toBe("hello world")
  })

  it("handles empty string", () => {
    expect(escHTML("")).toBe("")
  })
})

describe("Marked", () => {
  const marked = new Marked()

  it("converts headers", () => {
    expect(marked.parse("# Hello")).toContain("<h1>Hello</h1>")
    expect(marked.parse("## Sub")).toContain("<h2>Sub</h2>")
    expect(marked.parse("### Third")).toContain("<h3>Third</h3>")
  })

  it("converts bold text", () => {
    expect(marked.parse("**bold**")).toContain("<strong>bold</strong>")
  })

  it("converts italic text", () => {
    expect(marked.parse("*italic*")).toContain("<em>italic</em>")
  })

  it("converts bold italic text", () => {
    expect(marked.parse("***both***")).toContain("<strong><em>both</em></strong>")
  })

  it("converts inline code", () => {
    expect(marked.parse("`code`")).toContain("<code>code</code>")
  })

  it("converts links", () => {
    const result = marked.parse("[text](https://example.com)")
    expect(result).toContain('<a href="https://example.com">text</a>')
  })

  it("converts code blocks", () => {
    const result = marked.parse("```js\nconst x = 1\n```")
    expect(result).toContain('<pre><code class="language-js">')
    expect(result).toContain("const x = 1")
  })

  it("escapes HTML in code blocks", () => {
    const result = marked.parse("```\n<div>&</div>\n```")
    expect(result).toContain("&lt;div>")
    expect(result).toContain("&amp;")
  })

  it("converts double newlines to paragraphs", () => {
    const result = marked.parse("first\n\nsecond")
    expect(result).toContain("</p><p>")
  })

  it("converts single newlines to <br>", () => {
    const result = marked.parse("line1\nline2")
    expect(result).toContain("<br>")
  })

  it("handles walkTokens for code blocks", () => {
    const tokens: any[] = []
    const custom = new Marked({
      walkTokens(token) {
        tokens.push({ ...token })
      }
    })
    custom.parse("```js\nconst x = 1\n```")
    expect(tokens.length).toBe(1)
    expect(tokens[0].type).toBe("code")
    expect(tokens[0].lang).toBe("js")
  })

  it("handles walkTokens that set escaped=true", () => {
    const custom = new Marked({
      walkTokens(token) {
        token.escaped = true
        token.text = "<span>highlighted</span>"
      }
    })
    const result = custom.parse("```js\ncode\n```")
    expect(result).toContain("<span>highlighted</span>")
  })

  it("handles empty input", () => {
    expect(marked.parse("")).toBe("")
  })

  it("converts unordered list-like lines", () => {
    const result = marked.parse("first\nsecond\nthird")
    expect(result).toContain("first<br>second<br>third")
  })

  it("converts code blocks without a language", () => {
    const result = marked.parse("```\nplain code\n```")
    expect(result).toContain("<pre><code")
    expect(result).toContain("plain code")
  })

  it("preserves inline code with special chars", () => {
    const result = marked.parse("`a < b & c`")
    expect(result).toContain("<code>")
    expect(result).toContain("&lt;")
    expect(result).toContain("&amp;")
  })

  it("handles multiple code blocks", () => {
    const result = marked.parse("```js\nfoo\n```\ntext\n```ts\nbar\n```")
    expect(result).toContain("foo")
    expect(result).toContain("bar")
    const codeBlocks = result.match(/<pre>/g)
    expect(codeBlocks?.length).toBe(2)
  })

  it("handles nested bold inside italic", () => {
    const result = marked.parse("*italic **bold** end*")
    expect(result).toContain("<em>")
    expect(result).toContain("<strong>")
  })

  it("handles links with special characters in URL", () => {
    const result = marked.parse("[docs](https://example.com/path?a=1&b=2)")
    expect(result).toContain('href="https://example.com/path?a=1&b=2"')
    expect(result).toContain(">docs</a>")
  })
})

describe("LSP pos edge cases", () => {
  describe("fromPosition edge cases", () => {
    const doc = Text.of(["hello", "world", "foo bar"])

    it("character at line boundary (newline position)", () => {
      // Position at the very end of a line's content
      expect(fromPosition(doc, { line: 0, character: 5 })).toBe(5)
      expect(fromPosition(doc, { line: 1, character: 5 })).toBe(11)
    })

    it("character 0 for every line", () => {
      expect(fromPosition(doc, { line: 0, character: 0 })).toBe(0)
      expect(fromPosition(doc, { line: 1, character: 0 })).toBe(6)
      expect(fromPosition(doc, { line: 2, character: 0 })).toBe(12)
    })

    it("last character of last line", () => {
      expect(fromPosition(doc, { line: 2, character: 7 })).toBe(19)
    })
  })

  describe("toPosition edge cases", () => {
    const doc = Text.of(["hello", "world", "foo bar"])

    it("offset at each line start", () => {
      expect(toPosition(doc, 0)).toEqual({ line: 0, character: 0 })
      expect(toPosition(doc, 6)).toEqual({ line: 1, character: 0 })
      expect(toPosition(doc, 12)).toEqual({ line: 2, character: 0 })
    })

    it("offset at each line end", () => {
      expect(toPosition(doc, 5)).toEqual({ line: 0, character: 5 })
      expect(toPosition(doc, 11)).toEqual({ line: 1, character: 5 })
      expect(toPosition(doc, 19)).toEqual({ line: 2, character: 7 })
    })

    it("offset one past line start", () => {
      expect(toPosition(doc, 1)).toEqual({ line: 0, character: 1 })
      expect(toPosition(doc, 7)).toEqual({ line: 1, character: 1 })
      expect(toPosition(doc, 13)).toEqual({ line: 2, character: 1 })
    })
  })

  describe("multi-line document with empty lines", () => {
    const doc = Text.of(["first", "", "third", ""])

    it("toPosition handles empty lines", () => {
      // "first" = 0..5, newline at 5, "" = 6..6, newline at 6, "third" = 7..12, newline at 12, "" = 13..13
      expect(toPosition(doc, 6)).toEqual({ line: 1, character: 0 })
      expect(toPosition(doc, 7)).toEqual({ line: 2, character: 0 })
    })

    it("fromPosition handles empty lines", () => {
      expect(fromPosition(doc, { line: 1, character: 0 })).toBe(6)
      expect(fromPosition(doc, { line: 3, character: 0 })).toBe(13)
    })

    it("roundtrip through all positions", () => {
      for (let i = 0; i <= doc.length; i++) {
        const pos = toPosition(doc, i)
        expect(fromPosition(doc, pos)).toBe(i)
      }
    })
  })

  describe("document with long lines", () => {
    const longLine = "a".repeat(1000)
    const doc = Text.of([longLine, "b"])

    it("toPosition at end of long line", () => {
      expect(toPosition(doc, 1000)).toEqual({ line: 0, character: 1000 })
    })

    it("toPosition at start of second line after long line", () => {
      expect(toPosition(doc, 1001)).toEqual({ line: 1, character: 0 })
    })

    it("fromPosition at end of long line", () => {
      expect(fromPosition(doc, { line: 0, character: 1000 })).toBe(1000)
    })
  })

  describe("document with many lines", () => {
    const lines = Array.from({ length: 100 }, (_, i) => `line ${i}`)
    const doc = Text.of(lines)

    it("roundtrips for sampled offsets", () => {
      const offsets = [0, 1, 50, doc.length - 1, doc.length]
      for (const offset of offsets) {
        const pos = toPosition(doc, offset)
        expect(fromPosition(doc, pos)).toBe(offset)
      }
    })

    it("correctly identifies line 50", () => {
      // Each line is "line X\n" — compute offset for line 50
      let offset = 0
      for (let i = 0; i < 50; i++) {
        offset += lines[i].length + 1 // +1 for newline
      }
      expect(toPosition(doc, offset)).toEqual({ line: 50, character: 0 })
    })
  })
})

describe("docToHTML", () => {
  it("renders plain string with plaintext kind as escaped HTML", () => {
    const result = docToHTML("hello <world>", "plaintext")
    expect(result).toBe("hello &lt;world>")
  })

  it("renders plain string with markdown kind as markdown HTML", () => {
    const result = docToHTML("**bold**", "markdown")
    expect(result).toContain("<strong>bold</strong>")
  })

  it("renders MarkupContent object with plaintext kind", () => {
    const result = docToHTML({ kind: "plaintext", value: "a & b" }, "markdown")
    // The object's kind should override the default
    expect(result).toBe("a &amp; b")
  })

  it("renders MarkupContent object with markdown kind", () => {
    const result = docToHTML({ kind: "markdown", value: "# Title" }, "plaintext")
    // The object's kind should override the default
    expect(result).toContain("<h1>Title</h1>")
  })

  it("renders MarkupContent overriding defaultKind", () => {
    // defaultKind is plaintext but MarkupContent says markdown
    const result = docToHTML({ kind: "markdown", value: "*italic*" }, "plaintext")
    expect(result).toContain("<em>italic</em>")
  })

  it("escapes special chars in plaintext mode", () => {
    const result = docToHTML("line1\nline2 & <tag>", "plaintext")
    expect(result).toContain("<br>")
    expect(result).toContain("&amp;")
    expect(result).toContain("&lt;")
  })

  it("handles empty string", () => {
    expect(docToHTML("", "plaintext")).toBe("")
    expect(docToHTML("", "markdown")).toBe("")
  })

  it("handles MarkupContent with empty value", () => {
    expect(docToHTML({ kind: "markdown", value: "" }, "plaintext")).toBe("")
    expect(docToHTML({ kind: "plaintext", value: "" }, "markdown")).toBe("")
  })

  it("handles markdown with code blocks", () => {
    const result = docToHTML("```ts\nconst x = 1\n```", "markdown")
    expect(result).toContain("<pre>")
    expect(result).toContain("const x = 1")
  })

  it("handles markdown with links", () => {
    const result = docToHTML("[click](https://example.com)", "markdown")
    expect(result).toContain('<a href="https://example.com">click</a>')
  })
})

describe("Marked advanced", () => {
  const marked = new Marked()

  it("handles h4-h6 as plain text (only h1-h3 supported)", () => {
    // The minimal stub only handles h1-h3
    const result = marked.parse("#### h4 text")
    expect(result).not.toContain("<h4>")
    expect(result).toContain("####")
  })

  it("handles multiple paragraphs", () => {
    const result = marked.parse("para one\n\npara two\n\npara three")
    const splits = result.split("</p><p>")
    expect(splits.length).toBe(3)
  })

  it("handles code block then paragraph", () => {
    const result = marked.parse("```\ncode\n```\n\ntext after")
    expect(result).toContain("<pre>")
    expect(result).toContain("text after")
  })

  it("handles bold at start and end of line", () => {
    expect(marked.parse("**start**")).toContain("<strong>start</strong>")
    expect(marked.parse("end **here**")).toContain("<strong>here</strong>")
  })

  it("handles multiple inline codes", () => {
    const result = marked.parse("`a` and `b` and `c`")
    const codes = result.match(/<code>/g)
    expect(codes?.length).toBe(3)
  })

  it("handles multiple links in one line", () => {
    const result = marked.parse("[a](url1) [b](url2)")
    expect(result).toContain('href="url1"')
    expect(result).toContain('href="url2"')
  })

  it("walkTokens receives all code blocks", () => {
    const tokens: any[] = []
    const custom = new Marked({
      walkTokens(token) {
        tokens.push({ type: token.type, lang: token.lang })
      }
    })
    custom.parse("```js\na\n```\n\n```py\nb\n```")
    expect(tokens.length).toBe(2)
    expect(tokens[0].lang).toBe("js")
    expect(tokens[1].lang).toBe("py")
  })

  it("walkTokens that does not set escaped leaves normal escaping", () => {
    const custom = new Marked({
      walkTokens(_token) {
        // intentionally do nothing
      }
    })
    const result = custom.parse("```js\n<div>\n```")
    expect(result).toContain("&lt;div>")
  })
})
