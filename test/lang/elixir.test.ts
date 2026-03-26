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
})
