// [DUSKMOON] Caddyfile language — no Lezer parser exists. Uses StreamLanguage.
import {StreamLanguage, LanguageSupport} from "../../core/language"
import type {StringStream} from "../../core/language"

interface CaddyState {
  inString: string | null
}

const caddyfileStream = {
  name: "caddyfile",

  startState(): CaddyState {
    return {inString: null}
  },

  token(stream: StringStream, state: CaddyState): string | null {
    // Inside a quoted string
    if (state.inString) {
      if (state.inString === "`") {
        if (stream.eat("`")) { state.inString = null; return "string" }
      } else {
        if (stream.eat('"')) { state.inString = null; return "string" }
        if (stream.eat("\\")) stream.next()
      }
      stream.next()
      return "string"
    }

    if (stream.eatSpace()) return null

    // Line comments
    if (stream.eat("#")) { stream.skipToEnd(); return "comment" }

    // Raw strings (backtick)
    if (stream.eat("`")) { state.inString = "`"; return "string" }

    // Double-quoted strings
    if (stream.eat('"')) { state.inString = '"'; return "string" }

    // Matchers: @name
    if (stream.match(/^@[a-zA-Z_][a-zA-Z0-9_]*/)) return "variableName"

    // Placeholders: {placeholder.name} — must come before block-delimiter check
    if (stream.match(/^\{[a-zA-Z_$.][a-zA-Z0-9_.]*\}/)) return "string.special"

    // Block delimiters
    if (stream.eat("{") || stream.eat("}")) return "brace"

    // Parentheses (Caddy snippets)
    if (stream.eat("(") || stream.eat(")")) return "bracket"

    // Numbers (ports, sizes)
    if (stream.match(/^\d+[a-zA-Z]*/)) return "number"

    // Identifiers: directives, site addresses, options
    if (stream.match(/^[a-zA-Z_][a-zA-Z0-9_.:/-]*/)) return "keyword"

    // Bare symbols
    stream.next()
    return null
  },
}

/// Caddyfile language definition using StreamLanguage.
export const caddyfileLanguage = StreamLanguage.define(caddyfileStream)

/// Caddyfile language support.
export function caddyfile() {
  return new LanguageSupport(caddyfileLanguage)
}
