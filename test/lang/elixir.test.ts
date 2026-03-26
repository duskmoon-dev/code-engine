import { describe, it, expect } from "bun:test"
import { elixir, elixirLanguage } from "../../src/lang/elixir/index"
import { EditorState } from "../../src/core/state"
import { LanguageSupport } from "../../src/core/language"

describe("Elixir language pack", () => {
  it("exports elixir function", () => {
    expect(typeof elixir).toBe("function")
  })

  it("exports elixirLanguage", () => {
    expect(elixirLanguage).toBeDefined()
    expect(elixirLanguage.name).toBe("elixir")
  })

  it("elixir() returns LanguageSupport", () => {
    expect(elixir()).toBeInstanceOf(LanguageSupport)
  })

  it("elixirLanguage parser produces a non-empty tree", () => {
    const tree = elixirLanguage.parser.parse("defmodule Hello do\n  def greet, do: :world\nend")
    expect(tree.length).toBeGreaterThan(0)
  })

  it("elixirLanguage parser tree has a top-level type", () => {
    const tree = elixirLanguage.parser.parse(":atom")
    expect(tree.type.isTop).toBe(true)
  })

  it("can be used as EditorState extension", () => {
    const state = EditorState.create({
      doc: "defmodule Hello, do: :world",
      extensions: [elixir()]
    })
    expect(state.doc.toString()).toContain("defmodule")
  })

  it("parses a defmodule correctly", () => {
    const tree = elixirLanguage.parser.parse("defmodule Hello do\n  def greet, do: :world\nend")
    expect(tree.length).toBe("defmodule Hello do\n  def greet, do: :world\nend".length)
  })

  it("tree cursor traverses more than one node", () => {
    const tree = elixirLanguage.parser.parse("x = 1 + 2")
    const cursor = tree.cursor()
    let count = 0
    while (cursor.next()) count++
    expect(count).toBeGreaterThan(1)
  })

  it("tree.resolve returns a defined node", () => {
    const tree = elixirLanguage.parser.parse(":atom")
    const node = tree.resolve(1)
    expect(node).toBeDefined()
  })

  it("EditorState handles a transaction", () => {
    const state = EditorState.create({
      doc: "x = 1",
      extensions: [elixir()]
    })
    const next = state.update({ changes: { from: 4, insert: "2 + " } }).state
    expect(next.doc.toString()).toBe("x = 2 + 1")
  })
})
