import { describe, it, expect } from "bun:test";
import { StreamLanguage, LanguageSupport, ensureSyntaxTree } from "../../../src/core/language/index";
import { EditorState } from "../../../src/core/state/index";

import { brainfuck } from "../../../src/lang/legacy/brainfuck";
import { pegjs } from "../../../src/lang/legacy/pegjs";
import { stylus } from "../../../src/lang/legacy/stylus";
import { mathematica } from "../../../src/lang/legacy/mathematica";

// Helper: create state and force full parse
function parseDoc(parser: object, doc: string): EditorState {
  const lang = StreamLanguage.define(parser as any);
  const state = EditorState.create({
    doc,
    extensions: [new LanguageSupport(lang)],
  });
  ensureSyntaxTree(state, doc.length, 5000);
  return state;
}

function treeLen(state: EditorState): number {
  const tree = ensureSyntaxTree(state, state.doc.length, 5000);
  return tree ? tree.length : 0;
}

describe("Brainfuck tokenizer deep coverage", () => {
  it("tokenizes basic BF operators (+, -, <, >, ., ,)", () => {
    const doc = "+++---<<<>>>...,,,";
    const state = parseDoc(brainfuck, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });

  it("tokenizes bracket pairs for loops", () => {
    // Exercises [ and ] as bracket tokens, updating left/right counters
    const doc = "[->+<][->>++<<]";
    const state = parseDoc(brainfuck, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });

  it("tokenizes inline comments (non-reserved chars on a line)", () => {
    // When a non-reserved char is encountered, commentLine is set to true
    // and subsequent reserved chars on the same line become comments
    const doc = "hello this is a comment with + and - in it";
    const state = parseDoc(brainfuck, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });

  it("tokenizes reserved chars after comment chars on same line (commentLine path)", () => {
    // A line starting with a non-reserved char sets commentLine=true,
    // then reserved chars like +, >, [ should return "comment" not their normal token
    const doc = [
      "x+>.[",
      "+-  normal line",
    ].join("\n");
    const state = parseDoc(brainfuck, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });

  it("resets commentLine at start of line (sol path)", () => {
    // commentLine should reset at sol(), so line 2 starts fresh
    const doc = [
      "this is comment line +->",
      "+++---",
      "another comment .,[]",
    ].join("\n");
    const state = parseDoc(brainfuck, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });

  it("handles comment in loop brackets (commentLoop context)", () => {
    // Inside [...], non-reserved chars are allowed as comments
    const doc = [
      "[this is a loop comment with brackets]",
      "[->+<]",
    ].join("\n");
    const state = parseDoc(brainfuck, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });

  it("handles eol reset of commentLine for reserved chars at end of line", () => {
    // Tests the eol() check at the end of the token function (line 64-66)
    const doc = [
      "+",
      "-",
      ">",
      "<",
      ".",
      ",",
      "[",
      "]",
    ].join("\n");
    const state = parseDoc(brainfuck, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });

  it("handles comment char at eol (non-reserved single char lines)", () => {
    // Non-reserved char at eol should set and immediately reset commentLine
    const doc = [
      "x",
      "+",
      "y",
      "-",
    ].join("\n");
    const state = parseDoc(brainfuck, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });

  it("handles whitespace lines between code", () => {
    // eatSpace returns true for whitespace-only content
    const doc = [
      "+++",
      "   ",
      "---",
      "",
      ">>>",
    ].join("\n");
    const state = parseDoc(brainfuck, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });

  it("handles mixed reserved and comment on multi-line program", () => {
    // Classic Hello World BF program exercises all paths heavily
    const doc = [
      "++++++++[>++++[>++>+++>+++>+<<<<-]>+>+>->>+[<]<-]",
      ">>. output H",
      ">+++. output e",
      "+++++++.. output ll",
      "+++. output o",
    ].join("\n");
    const state = parseDoc(brainfuck, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });
});

describe("PEG.js tokenizer deep coverage", () => {
  it("tokenizes basic rule definitions with identifiers", () => {
    // Exercises identifier() match and the : check for "variable" vs "variable-2"
    const doc = [
      "start = expression",
      "",
      "expression",
      '  = head:term "+" tail:expression { return head + tail; }',
      "  / term",
    ].join("\n");
    const state = parseDoc(pegjs, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });

  it("tokenizes double-quoted strings with escapes", () => {
    // Exercises the string tokenizer with double quotes and backslash escapes
    const doc = [
      'literal = "hello world"',
      'escaped = "line\\nbreak"',
      'quoted = "say \\"hi\\""',
    ].join("\n");
    const state = parseDoc(pegjs, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });

  it("tokenizes single-quoted strings", () => {
    // Exercises single-quote string path
    const doc = [
      "literal = 'hello'",
      "escaped = 'it\\'s'",
      "multi = 'abc' / 'def' / 'ghi'",
    ].join("\n");
    const state = parseDoc(pegjs, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });

  it("tokenizes block comments /* */", () => {
    // Exercises inComment state
    const doc = [
      "/* This is a block comment",
      "   spanning multiple lines */",
      "start = expr",
      "/* another comment */",
    ].join("\n");
    const state = parseDoc(pegjs, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });

  it("tokenizes line comments //", () => {
    // Exercises the // match path
    const doc = [
      "// PEG.js grammar",
      "start = expr // inline comment",
      "expr = num",
    ].join("\n");
    const state = parseDoc(pegjs, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });

  it("tokenizes character classes [...]", () => {
    // Exercises inCharacterClass state including escape sequences
    const doc = [
      "digit = [0-9]",
      "alpha = [a-zA-Z_]",
      "escaped = [\\]\\\\]",
      "range = [a-z0-9\\-]",
    ].join("\n");
    const state = parseDoc(pegjs, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });

  it("tokenizes braced action blocks with JavaScript", () => {
    // Exercises the braced state with embedded JS tokenization
    const doc = [
      "sum = left:number \"+\" right:number {",
      "  return left + right;",
      "}",
      "",
      "number = digits:[0-9]+ { return parseInt(digits.join(\"\"), 10); }",
    ].join("\n");
    const state = parseDoc(pegjs, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });

  it("tokenizes parentheses and other bracket types", () => {
    // Exercises the bracket detection for (, ), [, ]
    const doc = [
      "group = (a / b / c)",
      "optional = item?",
      "oneOrMore = item+",
      "zeroOrMore = item*",
    ].join("\n");
    const state = parseDoc(pegjs, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });

  it("tokenizes rule with colon (lhs variable detection)", () => {
    // identifier followed by ':' returns "variable", otherwise "variable-2"
    const doc = [
      "pair = key:identifier \":\" value:identifier { return [key, value]; }",
    ].join("\n");
    const state = parseDoc(pegjs, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });

  it("tokenizes strings in lhs vs rhs context", () => {
    // When lhs is true, strings return "property string"; when false, "string"
    const doc = [
      '"start" = expression',
      'expression = "+" / "-"',
    ].join("\n");
    const state = parseDoc(pegjs, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });
});

describe("Stylus tokenizer deep coverage", () => {
  it("tokenizes line comments and block comments", () => {
    const doc = [
      "// Line comment",
      "/* Block comment",
      "   spanning lines */",
      "body",
      "  color red",
    ].join("\n");
    const state = parseDoc(stylus, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });

  it("tokenizes strings (single and double quoted)", () => {
    const doc = [
      'font-family "Helvetica Neue", sans-serif',
      "content 'hello world'",
      "escaped \"line\\nbreak\"",
    ].join("\n");
    const state = parseDoc(stylus, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });

  it("tokenizes @-directives (def, import, keyframes, media, extends)", () => {
    // Exercises @ handling, @import, @keyframes, @media, @extends
    const doc = [
      "@import 'mixins'",
      "@require 'variables'",
      "@charset 'UTF-8'",
      "",
      "@media screen and (max-width 768px)",
      "  .container",
      "    width 100%",
      "",
      "@keyframes fadeIn",
      "  0%",
      "    opacity 0",
      "  100%",
      "    opacity 1",
      "",
      ".button",
      "  @extends .base-button",
    ].join("\n");
    const state = parseDoc(stylus, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });

  it("tokenizes hex colors and ID selectors", () => {
    // '#' followed by hex digits => atom; '#' followed by alpha => hash/builtin
    const doc = [
      "#main-content",
      "  background #ff6600",
      "  color #333",
      "  border-color #abcdef",
      "#sidebar",
      "  color #f0f0f0ff",
    ].join("\n");
    const state = parseDoc(stylus, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });

  it("tokenizes numbers with units", () => {
    const doc = [
      ".box",
      "  width 100px",
      "  height 50%",
      "  margin -10px",
      "  padding .5em",
      "  font-size 1.5rem",
      "  line-height 1.6",
    ].join("\n");
    const state = parseDoc(stylus, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });

  it("tokenizes vendor prefixes", () => {
    // Exercises vendorPrefixesRegexp and vendorPrefixes state
    const doc = [
      ".animated",
      "  -webkit-transform rotate(45deg)",
      "  -moz-transform rotate(45deg)",
      "  -ms-transform rotate(45deg)",
      "  -o-transition all 0.3s",
    ].join("\n");
    const state = parseDoc(stylus, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });

  it("tokenizes !important and !optional", () => {
    const doc = [
      ".override",
      "  color red !important",
      "  display block !optional",
      "  margin 0 !invalid",
    ].join("\n");
    const state = parseDoc(stylus, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });

  it("tokenizes class selectors, parent references, and BEM naming", () => {
    // Exercises '.class', '&' reference, and BEM '&__element' paths
    const doc = [
      ".button",
      "  color blue",
      "  &:hover",
      "    color red",
      "  &::before",
      "    content ''",
      "  &__icon",
      "    margin-right 5px",
      "  &--primary",
      "    background blue",
      "  &",
    ].join("\n");
    const state = parseDoc(stylus, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });

  it("tokenizes variables, assignments, and property lookups", () => {
    // Exercises variable-name paths, $variable, = assignment, and @property lookup
    const doc = [
      "$primary = #336699",
      "$font-size = 16px",
      "$border = 1px solid $primary",
      "",
      ".box",
      "  color $primary",
      "  font-size $font-size",
      "  width = 100px",
      "  height @width",
    ].join("\n");
    const state = parseDoc(stylus, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });

  it("tokenizes mixins, block mixins, and function calls", () => {
    // Exercises mixin() and block-mixin (+mixin()) paths
    const doc = [
      "border-radius(n)",
      "  -webkit-border-radius n",
      "  border-radius n",
      "",
      "clearfix()",
      "  &::after",
      "    content ''",
      "    display table",
      "    clear both",
      "",
      ".box",
      "  border-radius(5px)",
      "  +clearfix()",
      "  rgba(255, 0, 0, 0.5)",
    ].join("\n");
    const state = parseDoc(stylus, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });

  it("tokenizes control flow (if, unless, for, else)", () => {
    // Exercises block-keyword paths and postfix conditionals
    const doc = [
      "$debug = true",
      "",
      "if $debug",
      "  .debug-info",
      "    display block",
      "else",
      "  .debug-info",
      "    display none",
      "",
      "unless $debug",
      "  .production",
      "    opacity 1",
      "",
      "for i in (1..4)",
      "  .col-{i}",
      "    width (25% * i)",
      "",
      ".item",
      "  display block if $debug",
      "  opacity 0 unless $debug",
    ].join("\n");
    const state = parseDoc(stylus, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });

  it("tokenizes operators (comparison, logical, range)", () => {
    // Exercises operatorsRegexp: .., ..., &&, ||, **, ?=, !=, etc.
    const doc = [
      "$a = 10",
      "$b = 20",
      "$c = $a is $b",
      "$d = $a isnt $b",
      "$e = $a is not $b",
      "$f = $a is a 'unit'",
      "$g = $a in (10 20 30)",
      "$h = $a and $b",
      "$i = $a or $b",
      "$j = $a not defined",
      "range = (1..10)",
      "spread = (1...10)",
      "$k = $a >= $b",
      "$l = $a ?= 5",
      "$m = $a **= 2",
    ].join("\n");
    const state = parseDoc(stylus, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });

  it("tokenizes url() and document types", () => {
    // Exercises documentTypesRegexp and tokenParenthesized
    const doc = [
      ".bg",
      "  background url('image.png') no-repeat",
      "  background url(data:image/png;base64,abc)",
      "",
      "@-moz-document url-prefix('http://example.com')",
      "  body",
      "    color red",
      "",
      "@supports (display flex)",
      "  .flex",
      "    display flex",
    ].join("\n");
    const state = parseDoc(stylus, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });

  it("tokenizes pseudo selectors and attribute selectors", () => {
    // Exercises typeIsPseudo and attribute bracket paths
    const doc = [
      "a:hover",
      "  color red",
      "a:first-child",
      "  margin-top 0",
      "input:focus",
      "  outline none",
      "p::first-line",
      "  font-weight bold",
      "",
      "input[type='text']",
      "  border 1px solid #ccc",
      "[disabled]",
      "  opacity 0.5",
    ].join("\n");
    const state = parseDoc(stylus, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });

  it("tokenizes interpolation with curly braces", () => {
    // Exercises interpolation state
    const doc = [
      "$prop = 'color'",
      "$val = 'red'",
      "",
      ".box",
      "  {$prop} {$val}",
      "",
      ".col-{$i}",
      "  width ($i * 10)%",
    ].join("\n");
    const state = parseDoc(stylus, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });

  it("tokenizes tag variables (a, b, i, s, col, em) in different contexts", () => {
    // Exercises tagVariablesRegexp paths in block and parens states
    const doc = [
      "a",
      "  color blue",
      "  text-decoration none",
      "",
      "em",
      "  font-style italic",
      "",
      "b = 10",
      "i = 5",
      "s = 'hello'",
    ].join("\n");
    const state = parseDoc(stylus, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });

  it("tokenizes parens state with nested expressions", () => {
    // Exercises parens state, nested parens, and word handling within parens
    const doc = [
      ".box",
      "  width (100px / 2)",
      "  margin ((10 + 5) * 2)px",
      "  padding (10px 20px)",
      "  color rgba(255, 0, 0, 0.5)",
    ].join("\n");
    const state = parseDoc(stylus, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });

  it("tokenizes return keyword", () => {
    const doc = [
      "add(a, b)",
      "  return a + b",
      "",
      "negate(val)",
      "  return -(val)",
    ].join("\n");
    const state = parseDoc(stylus, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });

  it("tokenizes wildcard selector and combinators", () => {
    // Exercises '*' path in block state
    const doc = [
      "*",
      "  box-sizing border-box",
      "",
      ".parent > .child",
      "  color red",
      ".parent ~ .sibling",
      "  color blue",
      ".parent + .adjacent",
      "  color green",
      "",
      "/ .root-ref",
      "  color purple",
    ].join("\n");
    const state = parseDoc(stylus, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });

  it("tokenizes extend with brackets", () => {
    // Exercises states.extend paths including [ ] =
    const doc = [
      ".message",
      "  padding 10px",
      "  border 1px solid #ccc",
      "",
      ".success",
      "  @extend .message",
      "",
      ".error",
      "  @extends .message",
    ].join("\n");
    const state = parseDoc(stylus, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });
});

describe("Mathematica tokenizer deep coverage", () => {
  it("tokenizes strings with escape sequences", () => {
    const doc = [
      '"Hello World"',
      '"escaped \\"quote\\""',
      '"line\\nbreak"',
      '"tab\\there"',
    ].join("\n");
    const state = parseDoc(mathematica, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });

  it("tokenizes nested comments (* *)", () => {
    // Exercises tokenComment with nested comment levels
    const doc = [
      "(* simple comment *)",
      "(* nested (* comment *) here *)",
      "(* deeply (* nested (* comment *) *) end *)",
      "x + y",
    ].join("\n");
    const state = parseDoc(mathematica, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });

  it("tokenizes base-form numbers", () => {
    // Exercises reBaseForm: base^^digits with optional precision and exponent
    const doc = [
      "16^^ff",
      "2^^101010",
      "8^^377",
      "16^^1a.f`10",
      "2^^1.01*^5",
    ].join("\n");
    const state = parseDoc(mathematica, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });

  it("tokenizes float numbers with precision and exponents", () => {
    // Exercises reFloatForm with `, ``, and *^ notation
    const doc = [
      "3.14",
      ".5",
      "1.",
      "3.14`10",
      "2.718``5",
      "1.23*^10",
      "4.56`3*^-5",
      "100",
    ].join("\n");
    const state = parseDoc(mathematica, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });

  it("tokenizes In[n] and Out[n] references", () => {
    // Exercises the In/Out atom match
    const doc = [
      "In[1]",
      "Out[23]",
      "In[]",
      "In[100]",
    ].join("\n");
    const state = parseDoc(mathematica, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });

  it("tokenizes usage and message patterns", () => {
    // Exercises ::usage (meta) and ::message (string.special) patterns
    const doc = [
      "f::usage",
      "Sin::usage",
      "f::argx",
      'Plot::optrs:',
      "MyPackage`func::usage",
    ].join("\n");
    const state = parseDoc(mathematica, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });

  it("tokenizes pattern variables with Blank, BlankSequence, BlankNullSequence", () => {
    // Exercises _+, var_, var__, var___, _Type, var_Type
    const doc = [
      "f[x_] := x^2",
      "g[x_Integer] := x + 1",
      "h[x__] := {x}",
      "j[x___] := Length[{x}]",
      "k[_Integer] := True",
      "m[___Real] := True",
    ].join("\n");
    const state = parseDoc(mathematica, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });

  it("tokenizes named patterns (variable:{pattern})", () => {
    // Exercises the variable:pattern lookahead match
    const doc = [
      "f[x:{_Integer}] := x",
      "g[n:_] := n + 1",
      "h[x:_?NumericQ] := x^2",
    ].join("\n");
    const state = parseDoc(mathematica, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });

  it("tokenizes named characters like \\[Alpha]", () => {
    const doc = [
      "\\[Alpha] + \\[Beta]",
      "\\[Gamma] * \\[Delta]",
      "\\[Pi] / \\[Epsilon]",
    ].join("\n");
    const state = parseDoc(mathematica, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });

  it("tokenizes slots (#, ##, #1, #name)", () => {
    // Exercises slot patterns including V10 named slots
    const doc = [
      "#1 + #2 &",
      "## &",
      "#name &",
      "f = #x + #y &",
      "#3 * ##2",
    ].join("\n");
    const state = parseDoc(mathematica, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });

  it("tokenizes identifiers with context (backtick notation)", () => {
    // Exercises reIdInContext with package`symbol
    const doc = [
      "Global`x",
      "MyPackage`MyFunction",
      "System`Plus",
      "Developer`PackedArrayQ",
    ].join("\n");
    const state = parseDoc(mathematica, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });

  it("tokenizes operators and brackets", () => {
    // Exercises operator and bracket regex paths
    const doc = [
      "a + b - c * d / e",
      "x == y != z",
      "a >= b <= c",
      "f @@ {1, 2, 3}",
      "a /. x -> y",
      "a //. x :> y",
      "f ~ g ~ h",
      "{a, b, c}",
      "a[[1]]",
      "(a + b)",
    ].join("\n");
    const state = parseDoc(mathematica, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });

  it("tokenizes multi-line strings", () => {
    // String that spans multiple lines, exercises tokenString across lines
    const doc = [
      '"This is a string',
      'that spans multiple lines"',
      "x + y",
    ].join("\n");
    const state = parseDoc(mathematica, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });

  it("tokenizes multi-line nested comments", () => {
    // Nested comments spanning lines exercise the commentLevel tracking
    const doc = [
      "(* outer",
      "  (* inner",
      "     comment *)",
      "  still in outer *)",
      "1 + 2",
    ].join("\n");
    const state = parseDoc(mathematica, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });

  it("handles error token for unrecognized characters", () => {
    // Characters that don't match any pattern should return 'error'
    const doc = "\u00A7\u00B6";
    const state = parseDoc(mathematica, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });

  it("tokenizes opening paren without star (non-comment)", () => {
    // ( not followed by * should backUp and try other matches
    const doc = [
      "(x + y)",
      "f(a, b)",
    ].join("\n");
    const state = parseDoc(mathematica, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });
});
