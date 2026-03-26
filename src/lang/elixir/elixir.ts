import {parser} from "./parser"
import {
  LRLanguage, LanguageSupport,
  continuedIndent, indentNodeProp, foldNodeProp, foldInside,
  delimitedIndent, flatIndent,
} from "../../core/language"
import type {TreeIndentContext} from "../../core/language"
import type {SyntaxNode} from "../../parser/common"

function withContinuedStabClause(baseStrategy: (context: TreeIndentContext) => number | null) {
  return (context: TreeIndentContext): number | null => {
    const before = context.node.childBefore(context.pos)
    // If end is being introduced, use the top-level node indentation
    if (context.node.lastChild?.type?.name === "end" && context.textAfter.endsWith("end")) {
      return context.baseIndentFor(context.node)
    }
    // If a new stab clause is introduced, give it the same indentation as the previous one
    if (before?.type?.name === "StabClause" && context.textAfter.endsWith("->")) {
      return context.baseIndentFor(before as SyntaxNode)
    }
    // If positioned right after a child stab clause, keep that stab clause's indentation
    if (before?.type?.name === "StabClause") {
      return context.baseIndentFor(before as SyntaxNode) + context.unit
    }
    return baseStrategy(context)
  }
}

/// Elixir language definition (vendored from livebook-dev/lezer-elixir v1.1.3).
export const elixirLanguage = LRLanguage.define({
  name: "elixir",
  parser: parser.configure({
    props: [
      indentNodeProp.add({
        "DoBlock AfterBlock ElseBlock CatchBlock RescueBlock": withContinuedStabClause(continuedIndent({
          except: /^\s*(after|else|catch|rescue|end)\b/,
        })),
        AnonymousFunction: withContinuedStabClause(delimitedIndent({closing: "end", align: false})),
        Block: withContinuedStabClause(delimitedIndent({closing: ")", align: false})),
        StabClause: continuedIndent(),
        List: delimitedIndent({closing: "]", align: false}),
        Tuple: delimitedIndent({closing: "}", align: false}),
        Bitstring: delimitedIndent({closing: ">>", align: false}),
        Arguments: delimitedIndent({closing: ")", align: false}),
        Map: delimitedIndent({closing: "}", align: false}),
        "String Charlist Sigil": flatIndent,
        BinaryOperator: continuedIndent(),
        Pair: continuedIndent(),
      }),
      foldNodeProp.add({
        "DoBlock Block List Tuple Bitstring AnonymousFunction Map": foldInside,
      })
    ]
  }),
  languageData: {
    commentTokens: {line: "#"},
    closeBrackets: {
      brackets: ["(", "[", "{", "'", '"', "'''", '"""'],
      stringPrefixes: ["~s", "~S", "~r", "~R", "~c", "~C", "~D", "~N"],
    },
    indentOnInput: /^\s*([\}\]\)]|>>|after|else|catch|rescue|end)|.*->$/,
  }
})

/// Elixir language support.
export function elixir() {
  return new LanguageSupport(elixirLanguage)
}
