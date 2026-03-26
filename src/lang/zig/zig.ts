import {parser} from "./parser"
import {
  LRLanguage, LanguageSupport,
  continuedIndent, indentNodeProp, foldNodeProp, foldInside,
  delimitedIndent,
} from "../../core/language"

/// Zig language definition (vendored from nDimensional/lezer-zig v0.1.0).
export const zigLanguage = LRLanguage.define({
  name: "zig",
  parser: parser.configure({
    props: [
      indentNodeProp.add({
        Block: delimitedIndent({closing: "}"}),
        ContainerBlock: delimitedIndent({closing: "}"}),
        "SwitchBlock": context => {
          const after = context.textAfter
          const closed = /^\s*\}/.test(after)
          const isCase = /^\s*(else)\b/.test(after)
          return context.baseIndent + (closed || isCase ? 0 : context.unit)
        },
        Statement: continuedIndent(),
      }),
      foldNodeProp.add({
        "Block ContainerBlock SwitchBlock": foldInside,
      })
    ]
  }),
  languageData: {
    commentTokens: {line: "//"},
    indentOnInput: /^\s*\}$/,
    closeBrackets: {brackets: ["(", "[", "{", '"']},
  }
})

/// Zig language support.
export function zig() {
  return new LanguageSupport(zigLanguage)
}
