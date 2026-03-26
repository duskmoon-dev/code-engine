import { describe, it, expect } from "bun:test"
import { zig, zigLanguage } from "../../src/lang/zig/index"
import { EditorState } from "../../src/core/state/index"
import { LanguageSupport } from "../../src/core/language/index"

describe("Zig language pack", () => {
  it("exports zig function", () => {
    expect(typeof zig).toBe("function")
  })

  it("exports zigLanguage", () => {
    expect(zigLanguage).toBeDefined()
    expect(zigLanguage.name).toBe("zig")
  })

  it("zig() returns LanguageSupport", () => {
    expect(zig()).toBeInstanceOf(LanguageSupport)
  })

  it("zigLanguage parser produces a non-empty tree", () => {
    const tree = zigLanguage.parser.parse('const std = @import("std");')
    expect(tree.length).toBeGreaterThan(0)
  })

  it("zigLanguage parser tree has a top-level type", () => {
    const tree = zigLanguage.parser.parse("pub fn main() void {}")
    expect(tree.type.isTop).toBe(true)
  })

  it("can be used as EditorState extension", () => {
    const state = EditorState.create({
      doc: 'const std = @import("std");\npub fn main() void {}',
      extensions: [zig()]
    })
    expect(state.doc.lines).toBe(2)
  })
})
