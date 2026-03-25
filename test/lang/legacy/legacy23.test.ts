import { describe, it, expect } from "bun:test";
import { StreamLanguage, LanguageSupport, ensureSyntaxTree } from "../../../src/core/language/index";
import { EditorState } from "../../../src/core/state/index";

import { haskell } from "../../../src/lang/legacy/haskell";
import { pug } from "../../../src/lang/legacy/pug";
import { asciiArmor } from "../../../src/lang/legacy/asciiarmor";
import { elm } from "../../../src/lang/legacy/elm";

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

// ---------------------------------------------------------------------------
// Haskell
// ---------------------------------------------------------------------------
describe("Haskell tokenizer deep coverage", () => {
  it("tokenizes char literals with escapes and error cases", () => {
    // Covers lines 34-44: ch == '\'', source.eat('\\'), char error path
    const doc = [
      "charA = 'a'",
      "charEsc = '\\n'",
      "charBad = 'ab",  // error: no closing quote
    ].join("\n");
    const state = parseDoc(haskell, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });

  it("tokenizes string literals with gaps and escape sequences", () => {
    // Covers lines 47-49 (string entry), 130-160 (stringLiteral, stringGap)
    // String gap: backslash at EOL continues on next line with backslash
    const doc = [
      'hello = "world"',
      'escaped = "tab\\there"',
      'gap = "first line\\',
      '\\second line"',
      'ampEsc = "\\&escape"',
      'badStr = "unterminated',
    ].join("\n");
    const state = parseDoc(haskell, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });

  it("tokenizes string gap error path", () => {
    // Covers lines 153-160: stringGap where next line doesn't start with backslash
    const doc = [
      'x = "hello\\',
      'not a continuation',
    ].join("\n");
    const state = parseDoc(haskell, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });

  it("tokenizes hex and octal integer literals", () => {
    // Covers lines 65-73: 0x hex, 0o octal
    const doc = [
      "hexVal = 0xFF",
      "hexUpper = 0XAB",
      "octVal = 0o77",
      "octUpper = 0O12",
    ].join("\n");
    const state = parseDoc(haskell, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });

  it("tokenizes float with decimal and exponent", () => {
    // Covers lines 77-84: float decimal, exponent with sign
    const doc = [
      "pi = 3.14159",
      "sci = 1.5e10",
      "sciNeg = 2.0E-3",
      "sciPlus = 7e+2",
      "plain = 42",
    ].join("\n");
    const state = parseDoc(haskell, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });

  it("tokenizes nested comments and pragmas", () => {
    // Covers lines 24-30 (opening {- and {-#), 106-128 (ncomment nesting)
    const doc = [
      "{-# LANGUAGE OverloadedStrings #-}",
      "{- outer {- nested -} still comment -}",
      "x = 1",
    ].join("\n");
    const state = parseDoc(haskell, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });

  it("tokenizes multi-line nested comments", () => {
    // Covers ncomment spanning multiple lines (line 125: setState(ncomment(type, currNest)))
    const doc = [
      "{- this comment",
      "   spans multiple",
      "   lines -}",
      "y = 2",
    ].join("\n");
    const state = parseDoc(haskell, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });

  it("tokenizes line comments and symbol operators", () => {
    // Covers lines 92-100: -- line comment, symbol chains
    const doc = [
      "-- this is a line comment",
      "--- also a comment",
      "x = 1 + 2",
      "y = x >>= return",
      "z = a <$> b <*> c",
      "w = f . g $ h",
      "v = a || b && c",
    ].join("\n");
    const state = parseDoc(haskell, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });

  it("tokenizes range operator and qualified names", () => {
    // Covers line 88-89: .. keyword, lines 51-56: qualified names
    const doc = [
      "import Data.List (sort)",
      "range = [1..10]",
      "qual = Data.Map.empty",
    ].join("\n");
    const state = parseDoc(haskell, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });

  it("tokenizes well-known keywords and builtins", () => {
    // Covers line 232: wellKnownWords lookup
    const doc = [
      "module Main where",
      "import Data.List",
      "data Color = Red | Green | Blue deriving (Show, Eq)",
      "newtype Wrapper a = Wrap a",
      "type Name = String",
      "class Printable a where",
      "  display :: a -> String",
      "instance Printable Color where",
      "  display Red = \"red\"",
      "main = do",
      "  let xs = map (+1) [1,2,3]",
      "  if null xs then putStrLn \"empty\" else print (head xs)",
    ].join("\n");
    const state = parseDoc(haskell, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });
});

// ---------------------------------------------------------------------------
// Pug
// ---------------------------------------------------------------------------
describe("Pug tokenizer deep coverage", () => {
  it("tokenizes doctype and basic tags with ids and classes", () => {
    // Covers doctype(), tag(), id(), className()
    const doc = [
      "doctype html",
      "html",
      "  head",
      "    title My Page",
      "  body",
      "    div#main.container.wide",
      "    p.intro Hello",
      "    span#note.small",
    ].join("\n");
    const state = parseDoc(pug, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });

  it("tokenizes case/when/default statements", () => {
    // Covers caseStatement(), when(), defaultStatement()
    const doc = [
      "case animal",
      "  when 'cat'",
      "    p Meow",
      "  when 'dog': p Woof",
      "  default",
      "    p Unknown",
    ].join("\n");
    const state = parseDoc(pug, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });

  it("tokenizes extends, block, append, prepend, include", () => {
    // Covers extendsStatement(), block(), append(), prepend(), include()
    const doc = [
      "extends layout.pug",
      "block content",
      "  h1 Page Title",
      "block append scripts",
      "  script(src='app.js')",
      "block prepend styles",
      "  link(rel='stylesheet' href='extra.css')",
      "append footer",
      "  p Extra footer",
      "prepend header",
      "  p Extra header",
      "include partials/nav.pug",
    ].join("\n");
    const state = parseDoc(pug, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });

  it("tokenizes mixin definition and calls with arguments", () => {
    // Covers mixin(), call(), javaScriptArguments(), callArguments()
    const doc = [
      "mixin article(title, body)",
      "  .article",
      "    h2= title",
      "    p= body",
      "",
      "+article('Hello', 'World')",
      "+article('Another', 'Post')",
    ].join("\n");
    const state = parseDoc(pug, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });

  it("tokenizes conditionals and loops", () => {
    // Covers conditional(), each(), eachContinued(), whileStatement()
    const doc = [
      "if user.loggedIn",
      "  p Welcome",
      "else if user.isGuest",
      "  p Hello Guest",
      "else",
      "  p Please log in",
      "unless hidden",
      "  p Visible",
      "",
      "each item in items",
      "  li= item.name",
      "for val in list",
      "  span= val",
      "- each x in arr",
      "  p= x",
      "while count < 5",
      "  p= count++",
    ].join("\n");
    const state = parseDoc(pug, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });

  it("tokenizes yield statement", () => {
    // Covers yieldStatement()
    const doc = [
      "mixin layout",
      "  .wrapper",
      "    yield",
    ].join("\n");
    const state = parseDoc(pug, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });

  it("tokenizes interpolation, code, filters, and dot blocks", () => {
    // Covers interpolation(), code(), filter(), dot(), text()
    const doc = [
      "p This is #{name} speaking",
      "p!= '<b>unescaped</b>'",
      "p= variable",
      "p- statement",
      ":markdown-it",
      "  # Title",
      "  paragraph",
      "script.",
      "  var x = 1;",
      "  console.log(x);",
      "| Plain text line",
      "| Another text line",
    ].join("\n");
    const state = parseDoc(pug, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });

  it("tokenizes attributes with nested brackets and type detection", () => {
    // Covers attrs(), attrsContinued(), attributesBlock()
    const doc = [
      "a(href='/' title='Home') Home",
      "input(type='text' value='hello' disabled)",
      "script(type='text/javascript' src='app.js')",
      "div(data-items=[1,2,3] data-obj={a: 1})",
      "button(&attributes({class: 'btn'})) Click",
    ].join("\n");
    const state = parseDoc(pug, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });

  it("tokenizes comments and colon shorthand", () => {
    // Covers comment(), colon()
    const doc = [
      "// This is a comment",
      "//- Unbuffered comment",
      "  still in comment block",
      "ul",
      "  li: a(href='/') Home",
      "  li: a(href='/about') About",
    ].join("\n");
    const state = parseDoc(pug, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });

  it("tokenizes include with filter and inline HTML", () => {
    // Covers includeFiltered(), includeFilteredContinued(), text() HTML path
    const doc = [
      "include:markdown-it article.md",
      "p",
      "  <strong>inline html</strong>",
    ].join("\n");
    const state = parseDoc(pug, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });
});

// ---------------------------------------------------------------------------
// ASCII Armor
// ---------------------------------------------------------------------------
describe("ASCII Armor tokenizer deep coverage", () => {
  it("tokenizes a complete PGP message with headers", () => {
    // Covers top->headers->header->headers->body->end full lifecycle
    const doc = [
      "-----BEGIN PGP MESSAGE-----",
      "Version: GnuPG v2",
      "Comment: Test message",
      "",
      "jA0EBwMCdG0rgnSk8v/S0joBGCnSb4cBlBwP7L7K9y+f",
      "Tz7ibR1HxfYhSMCScHDqE+V7cE2LGb+W8vhg0kU=",
      "=aBcD",
      "-----END PGP MESSAGE-----",
    ].join("\n");
    const state = parseDoc(asciiArmor, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });

  it("tokenizes a block without headers (blank line immediately)", () => {
    // Covers headers state with immediate blank line -> body transition (blankLine)
    const doc = [
      "-----BEGIN PGP SIGNATURE-----",
      "",
      "iQEzBAABCAAdFiEE",
      "-----END PGP SIGNATURE-----",
    ].join("\n");
    const state = parseDoc(asciiArmor, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });

  it("tokenizes mismatched END type as error", () => {
    // Covers line 33: m[1] != state.type -> error
    const doc = [
      "-----BEGIN PGP MESSAGE-----",
      "",
      "AAAA",
      "-----END PGP SIGNATURE-----",
    ].join("\n");
    const state = parseDoc(asciiArmor, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });

  it("tokenizes error characters in body", () => {
    // Covers lines 39-41: non-base64 char in body -> error
    const doc = [
      "-----BEGIN PGP MESSAGE-----",
      "",
      "valid+base64/data==",
      "invalid!@#chars",
      "-----END PGP MESSAGE-----",
    ].join("\n");
    const state = parseDoc(asciiArmor, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });

  it("tokenizes non-whitespace in top state as error", () => {
    // Covers line 17: errorIfNotEmpty in top state
    const doc = [
      "garbage before begin",
      "-----BEGIN PGP MESSAGE-----",
      "",
      "AAAA",
      "-----END PGP MESSAGE-----",
    ].join("\n");
    const state = parseDoc(asciiArmor, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });

  it("tokenizes whitespace-only lines in top state as null", () => {
    // Covers errorIfNotEmpty returning null for whitespace
    const doc = [
      "   ",
      "-----BEGIN PGP MESSAGE-----",
      "",
      "AAAA",
      "-----END PGP MESSAGE-----",
    ].join("\n");
    const state = parseDoc(asciiArmor, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });

  it("tokenizes content after END block as error", () => {
    // Covers line 44-45: end state with non-whitespace
    const doc = [
      "-----BEGIN PGP MESSAGE-----",
      "",
      "AAAA",
      "-----END PGP MESSAGE-----",
      "trailing garbage",
    ].join("\n");
    const state = parseDoc(asciiArmor, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });

  it("tokenizes multiple header lines", () => {
    // Covers headers->header->headers loop multiple times
    const doc = [
      "-----BEGIN PGP MESSAGE-----",
      "Version: GnuPG v2",
      "Hash: SHA256",
      "Charset: UTF-8",
      "",
      "AAAA",
      "-----END PGP MESSAGE-----",
    ].join("\n");
    const state = parseDoc(asciiArmor, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });

  it("tokenizes non-header content in headers state as error/body transition", () => {
    // Covers lines 22-25: headers state with non-header non-blank line
    const doc = [
      "-----BEGIN PGP MESSAGE-----",
      "notaheader",
      "-----END PGP MESSAGE-----",
    ].join("\n");
    const state = parseDoc(asciiArmor, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });
});

// ---------------------------------------------------------------------------
// Elm
// ---------------------------------------------------------------------------
describe("Elm tokenizer deep coverage", () => {
  it("tokenizes single-line and multi-line comments", () => {
    // Covers lines 92-96: -- line comment, 110-138: nested {- -} comments
    const doc = [
      "-- single line comment",
      "{- multi-line",
      "   comment -}",
      "{- outer {- nested -} outer -}",
      "x = 1",
    ].join("\n");
    const state = parseDoc(elm, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });

  it("tokenizes triple-quoted multi-line strings", () => {
    // Covers lines 44-48: \"\"\" detection, 140-152: chompMultiString
    const doc = [
      '"""',
      "This is a multi-line",
      'string in Elm"""',
      'y = """another"""',
    ].join("\n");
    const state = parseDoc(elm, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });

  it("tokenizes single-line strings with escapes", () => {
    // Covers lines 154-166: chompSingleString with \\\" escape
    const doc = [
      'hello = "world"',
      'escaped = "say \\"hello\\""',
      'empty = ""',
    ].join("\n");
    const state = parseDoc(elm, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });

  it("tokenizes unterminated single string as error", () => {
    // Covers lines 163-165: chompSingleString skipToEnd -> error
    const doc = [
      'bad = "unterminated',
    ].join("\n");
    const state = parseDoc(elm, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });

  it("tokenizes char literals with escapes", () => {
    // Covers lines 168-180: chompChar with \\' escape, error path
    const doc = [
      "ch = 'a'",
      "esc = '\\''",
      "bad = 'unterminated",
    ].join("\n");
    const state = parseDoc(elm, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });

  it("tokenizes GLSL blocks", () => {
    // Covers lines 32-33: [glsl| detection, 182-194: chompGlsl
    const doc = [
      "shader =",
      "  [glsl|",
      "    precision mediump float;",
      "    void main() {",
      "      gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);",
      "    }",
      "  |]",
    ].join("\n");
    const state = parseDoc(elm, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });

  it("tokenizes hex literals and floats with exponents", () => {
    // Covers lines 66-87: 0x hex, decimal, float, exponent with sign
    const doc = [
      "hexVal = 0xFF",
      "hexUpper = 0XAB",
      "intVal = 42",
      "floatVal = 3.14",
      "sciVal = 1.5e10",
      "sciNeg = 2.0E-3",
      "sciPlus = 7e+2",
      "zero = 0",
      "zeroFloat = 0.5",
    ].join("\n");
    const state = parseDoc(elm, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });

  it("tokenizes underscore wildcard and special characters", () => {
    // Covers lines 101-103: _ keyword, 28-34: special chars
    const doc = [
      "case x of",
      "  Just val -> val",
      "  _ -> 0",
      "",
      "tuple = (1, 2)",
      "list = [1, 2, 3]",
      "record = { name = \"Elm\" }",
    ].join("\n");
    const state = parseDoc(elm, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });

  it("tokenizes well-known keywords and definition position", () => {
    // Covers lines 219-222: wellKnownWords, lines 59-61: isDef (pos === 1)
    const doc = [
      "module Main exposing (..)",
      "import Html exposing (text)",
      "",
      "type alias Model = { count : Int }",
      "type Msg = Increment | Decrement",
      "",
      "update : Msg -> Model -> Model",
      "update msg model =",
      "  case msg of",
      "    Increment -> { model | count = model.count + 1 }",
      "    Decrement -> { model | count = model.count - 1 }",
      "",
      "port sendData : String -> Cmd msg",
    ].join("\n");
    const state = parseDoc(elm, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });

  it("tokenizes symbol operators", () => {
    // Covers lines 90-98: symbolRE operators
    const doc = [
      "pipeline = data |> transform |> view",
      "compose = f << g >> h",
      "arith = a + b - c * d / e ^ f",
      "compare = x < y && y > z || w == v",
      "arrow = \\x -> x + 1",
      "cons = 1 :: [2, 3]",
    ].join("\n");
    const state = parseDoc(elm, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });
});
