import { describe, it, expect } from "bun:test"
import { caddyfile, caddyfileLanguage } from "../../src/lang/caddyfile/index"
import { EditorState } from "../../src/core/state/index"
import { LanguageSupport } from "../../src/core/language/index"

describe("Caddyfile language pack", () => {
  it("exports caddyfile function", () => {
    expect(typeof caddyfile).toBe("function")
  })

  it("exports caddyfileLanguage", () => {
    expect(caddyfileLanguage).toBeDefined()
    expect(caddyfileLanguage.name).toBe("caddyfile")
  })

  it("caddyfile() returns LanguageSupport", () => {
    expect(caddyfile()).toBeInstanceOf(LanguageSupport)
  })

  it("can be used as EditorState extension with a site block", () => {
    const state = EditorState.create({
      doc: "example.com {\n  root * /var/www\n  file_server\n}",
      extensions: [caddyfile()]
    })
    expect(state.doc.toString()).toContain("file_server")
  })

  it("can be used with comments", () => {
    const state = EditorState.create({
      doc: "# Global options\n:80 {\n  respond \"Hello!\"\n}",
      extensions: [caddyfile()]
    })
    expect(state.doc.lines).toBe(4)
  })
})
