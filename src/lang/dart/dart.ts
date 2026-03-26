// [DUSKMOON] Dart language — no Lezer parser exists. Uses StreamLanguage.
import {StreamLanguage, LanguageSupport} from "../../core/language"
import type {StringStream} from "../../core/language"

const dartKeywords = new Set([
  "abstract", "as", "assert", "async", "await", "base", "break", "case",
  "catch", "class", "const", "continue", "covariant", "default", "deferred",
  "do", "dynamic", "else", "enum", "export", "extends", "extension", "external",
  "factory", "final", "finally", "for", "Function", "get", "hide", "if",
  "implements", "import", "in", "interface", "is", "late", "library", "mixin",
  "new", "null", "on", "operator", "part", "required", "rethrow", "return",
  "sealed", "set", "show", "static", "super", "switch", "sync", "this", "throw",
  "try", "typedef", "var", "void", "when", "while", "with", "yield"
])

const dartBuiltins = new Set([
  "bool", "double", "int", "num", "String", "List", "Map", "Set", "Iterable",
  "Future", "Stream", "Object", "Never", "Null", "Type", "Symbol"
])

interface DartState {
  inString: string | null
  blockComment: boolean
}

const dartStream = {
  name: "dart",

  startState(): DartState {
    return {inString: null, blockComment: false}
  },

  token(stream: StringStream, state: DartState): string | null {
    // Block comment continuation
    if (state.blockComment) {
      if (stream.match("*/")) { state.blockComment = false; return "comment" }
      stream.next()
      return "comment"
    }

    // Inside a string (handles only simple single-line strings; not multi-line)
    if (state.inString) {
      if (stream.match(state.inString)) { state.inString = null; return "string" }
      if (stream.eat("\\")) stream.next()
      else if (stream.match("${")) {
        // string interpolation start — we don't track depth here, just highlight as string
        stream.next()
      } else {
        stream.next()
      }
      return "string"
    }

    if (stream.eatSpace()) return null

    // Line comment
    if (stream.match("///")) { stream.skipToEnd(); return "comment.doc" }
    if (stream.match("//")) { stream.skipToEnd(); return "comment" }

    // Block comment
    if (stream.match("/*")) { state.blockComment = true; return "comment" }

    // Raw strings: r"..." or r'...'
    if (stream.match(/^r"[^"]*"/)) return "string"
    if (stream.match(/^r'[^']*'/)) return "string"

    // Multi-line strings: """...""" or '''...'''
    if (stream.match('"""')) { state.inString = '"""'; return "string" }
    if (stream.match("'''")) { state.inString = "'''"; return "string" }

    // Regular strings
    if (stream.eat('"')) { state.inString = '"'; return "string" }
    if (stream.eat("'")) { state.inString = "'"; return "string" }

    // Numbers
    if (stream.match(/^0x[0-9a-fA-F]+/)) return "number"
    if (stream.match(/^\d+(\.\d+)?([eE][+-]?\d+)?/)) return "number"

    // Annotations
    if (stream.match(/^@[a-zA-Z_][a-zA-Z0-9_]*/)) return "meta"

    // Identifiers / keywords / types
    if (stream.match(/^[a-zA-Z_$][a-zA-Z0-9_$]*/)) {
      const word = stream.current()
      if (dartKeywords.has(word)) return "keyword"
      if (dartBuiltins.has(word)) return "typeName"
      // PascalCase = type/class name
      if (/^[A-Z]/.test(word)) return "typeName"
      return "variableName"
    }

    stream.next()
    return null
  },

}

/// Dart language definition using StreamLanguage.
export const dartLanguage = StreamLanguage.define(dartStream)

/// Dart language support.
export function dart() {
  return new LanguageSupport(dartLanguage)
}
