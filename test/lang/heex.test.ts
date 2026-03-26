import { describe, it, expect } from "bun:test"
import { heex, heexLanguage } from "../../src/lang/heex/index"
import { EditorState } from "../../src/core/state/index"
import { LanguageSupport } from "../../src/core/language/index"

describe("HEEx language pack", () => {
  it("exports heex function", () => {
    expect(typeof heex).toBe("function")
  })

  it("exports heexLanguage", () => {
    expect(heexLanguage).toBeDefined()
    expect(heexLanguage.name).toBe("heex")
  })

  it("heex() returns LanguageSupport", () => {
    expect(heex()).toBeInstanceOf(LanguageSupport)
  })

  it("can be used as EditorState extension with HTML content", () => {
    const state = EditorState.create({
      doc: '<div class="foo"><%= @name %></div>',
      extensions: [heex()]
    })
    expect(state.doc.toString()).toContain("@name")
  })

  it("can be used as EditorState extension with component tags", () => {
    const state = EditorState.create({
      doc: '<.button phx-click="save">Save</.button>',
      extensions: [heex()]
    })
    expect(state.doc.toString()).toContain(".button")
  })
})
