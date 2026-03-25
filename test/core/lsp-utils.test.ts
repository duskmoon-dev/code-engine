import { describe, it, expect } from "bun:test"
import { Text } from "../../src/core/state/index"
import { toPosition, fromPosition } from "../../src/core/lsp/pos"
import { escHTML } from "../../src/core/lsp/text"
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
})
