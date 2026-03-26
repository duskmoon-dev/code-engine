import { describe, it, expect } from "bun:test"
import { dart, dartLanguage } from "../../src/lang/dart/index"
import { EditorState } from "../../src/core/state/index"
import { LanguageSupport } from "../../src/core/language/index"

describe("Dart language pack", () => {
  it("exports dart function", () => {
    expect(typeof dart).toBe("function")
  })

  it("exports dartLanguage", () => {
    expect(dartLanguage).toBeDefined()
    expect(dartLanguage.name).toBe("dart")
  })

  it("dart() returns LanguageSupport", () => {
    expect(dart()).toBeInstanceOf(LanguageSupport)
  })

  it("can be used as EditorState extension with Dart code", () => {
    const state = EditorState.create({
      doc: "void main() {\n  print('Hello, World!');\n}",
      extensions: [dart()]
    })
    expect(state.doc.toString()).toContain("main")
  })

  it("can be used with class declarations", () => {
    const state = EditorState.create({
      doc: "class Greeter {\n  final String name;\n  Greeter(this.name);\n}",
      extensions: [dart()]
    })
    expect(state.doc.lines).toBe(4)
  })
})
