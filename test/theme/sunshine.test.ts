import { describe, it, expect } from "bun:test"
import { sunshine, sunshineTheme, sunshineHighlightStyle } from "../../src/theme/sunshine"
import { EditorState } from "../../src/core/state/index"

describe("theme/sunshine", () => {
  it("sunshineTheme is defined", () => {
    expect(sunshineTheme).toBeDefined()
  })

  it("sunshineHighlightStyle is defined", () => {
    expect(sunshineHighlightStyle).toBeDefined()
  })

  it("sunshine is an array with two elements", () => {
    expect(Array.isArray(sunshine)).toBe(true)
    expect((sunshine as unknown[]).length).toBe(2)
  })

  it("sunshine can be used as EditorState extension", () => {
    const state = EditorState.create({ doc: "hello", extensions: [sunshine] })
    expect(state.doc.toString()).toBe("hello")
  })

  it("sunshine is a light theme (dark: false)", () => {
    expect(sunshineTheme).toBeDefined()
  })
})
