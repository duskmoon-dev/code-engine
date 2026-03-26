// [DUSKMOON] HEEx (Phoenix HTML+EEx template) language — no Lezer parser exists.
// Uses StreamLanguage for basic syntax highlighting.
import {StreamLanguage, LanguageSupport} from "../../core/language"
import type {StringStream} from "../../core/language"

interface HeexState {
  inString: string | null
  inTag: boolean
  inExpr: number  // depth of { } expression nesting
  inEex: boolean  // inside <% ... %>
}

const heexStream = {
  name: "heex",

  startState(): HeexState {
    return {inString: null, inTag: false, inExpr: 0, inEex: false}
  },

  token(stream: StringStream, state: HeexState): string | null {
    // Inside EEx expression block: read until %>
    if (state.inEex) {
      if (stream.match("%>")) { state.inEex = false; return "meta" }
      stream.next()
      return "meta"
    }

    // Inside a quoted attribute value
    if (state.inString) {
      if (stream.eat(state.inString as string)) { state.inString = null; return "string" }
      if (stream.eat("\\")) stream.next()
      else stream.next()
      return "string"
    }

    if (stream.eatSpace()) return null

    // HTML comment <!-- ... -->
    if (stream.match("<!--")) {
      while (!stream.eol()) {
        if (stream.match("-->")) return "comment"
        stream.next()
      }
      return "comment"
    }

    // EEx blocks: <%# comment %>, <%! raw %>, <%= expr %>, <% expr %>
    if (stream.match(/^<%[=#!]?/)) { state.inEex = true; return "meta" }

    // Elixir dynamic expression: { ... }
    if (stream.eat("{")) { state.inExpr++; return "bracket" }
    if (stream.eat("}")) { if (state.inExpr > 0) state.inExpr--; return "bracket" }

    // HEEx component closing tag: </.component>
    if (stream.match(/^<\/\.[a-z_][a-zA-Z0-9_.]*>/)) return "tag"

    // HEEx component opening tag: <.component
    if (stream.match(/^<\.[a-z_][a-zA-Z0-9_.]*/)) { state.inTag = true; return "tag" }

    // HTML closing tag: </tag>
    if (stream.match(/^<\/[a-zA-Z][a-zA-Z0-9.]*/)) { state.inTag = true; return "tag" }

    // HTML opening tag: <tag or <!DOCTYPE
    if (stream.match(/^<[a-zA-Z!][a-zA-Z0-9.]*/)) { state.inTag = true; return "tag" }

    // Tag close markers
    if (stream.eat(">") || stream.match("/>")) { state.inTag = false; return "tag" }

    // Attribute values inside a tag
    if (state.inTag) {
      if (stream.eat('"')) { state.inString = '"'; return "string" }
      if (stream.eat("'")) { state.inString = "'"; return "string" }
      // Attribute names
      if (stream.match(/^[a-zA-Z_:@][a-zA-Z0-9_:@-]*/)) return "keyword"
      if (stream.eat("=")) return "operator"
    }

    stream.next()
    return null
  },

  blankLine(_state: HeexState) {},
}

/// HEEx (Phoenix HTML+EEx) language definition using StreamLanguage.
export const heexLanguage = StreamLanguage.define(heexStream)

/// HEEx language support.
export function heex() {
  return new LanguageSupport(heexLanguage)
}
