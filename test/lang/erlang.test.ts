import { describe, it, expect } from "bun:test"
import { erlang, erlangLanguage } from "../../src/lang/erlang/index"
import { EditorState } from "../../src/core/state/index"
import { LanguageSupport } from "../../src/core/language/index"

describe("Erlang language pack", () => {
  it("exports erlang function", () => {
    expect(typeof erlang).toBe("function")
  })

  it("exports erlangLanguage", () => {
    expect(erlangLanguage).toBeDefined()
    expect(erlangLanguage.name).toBe("erlang")
  })

  it("erlang() returns LanguageSupport", () => {
    expect(erlang()).toBeInstanceOf(LanguageSupport)
  })

  it("can be used as EditorState extension", () => {
    const state = EditorState.create({
      doc: "-module(hello).\n-export([greet/0]).\ngreet() -> world.",
      extensions: [erlang()]
    })
    expect(state.doc.toString()).toContain("-module")
  })

  it("EditorState doc has correct line count", () => {
    const state = EditorState.create({
      doc: "-module(hello).\ngreet() -> ok.",
      extensions: [erlang()]
    })
    expect(state.doc.lines).toBe(2)
  })
})
