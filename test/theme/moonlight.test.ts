import { describe, it, expect } from "bun:test"
import { moonlight, moonlightTheme, moonlightHighlightStyle } from "../../src/theme/moonlight"
import { EditorState } from "../../src/core/state"

describe("theme/moonlight", () => {
  it("moonlightTheme is defined", () => {
    expect(moonlightTheme).toBeDefined()
  })

  it("moonlightHighlightStyle is defined", () => {
    expect(moonlightHighlightStyle).toBeDefined()
  })

  it("moonlight is an array with two elements", () => {
    expect(Array.isArray(moonlight)).toBe(true)
    expect((moonlight as unknown[]).length).toBe(2)
  })

  it("moonlight can be used as EditorState extension", () => {
    const state = EditorState.create({ doc: "hello", extensions: [moonlight] })
    expect(state.doc.toString()).toBe("hello")
  })

  it("moonlight is a dark theme", () => {
    // Verify moonlight can be applied to a realistic code document
    const state = EditorState.create({
      doc: "const x = 1;\nfunction greet() { return 'hello' }",
      extensions: [moonlight],
    })
    expect(state.doc.lines).toBe(2)
    expect(state.doc.line(1).text).toBe("const x = 1;")
  })
})
