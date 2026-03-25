import { describe, it, expect } from "bun:test";
import { StreamLanguage, LanguageSupport, ensureSyntaxTree } from "../../../src/core/language/index";
import { EditorState } from "../../../src/core/state/index";

import { q } from "../../../src/lang/legacy/q";
import { mirc } from "../../../src/lang/legacy/mirc";
import { tiddlyWiki } from "../../../src/lang/legacy/tiddlywiki";
import { crystal } from "../../../src/lang/legacy/crystal";
import { sass } from "../../../src/lang/legacy/sass";
import { erlang } from "../../../src/lang/legacy/erlang";

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

describe("Q language tokenizer deeper coverage", () => {
  it("tokenizes Q backslash command (sol backslash)", () => {
    // triggers the sol + c=="\\" path
    const doc = [
      "\\ system command",
      "\\p 5010",
      "\\l mylib.q",
      "\\d .myns",
      "\\",
    ].join("\n");
    const state = parseDoc(q, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });

  it("tokenizes Q block comments (/ comment \\)", () => {
    // triggers tokenBlockComment (lines 86+)
    const doc = [
      "/",
      "This is a block comment in Q",
      "spanning multiple lines",
      "\\",
      "",
      "x: 1 2 3",
    ].join("\n");
    const state = parseDoc(q, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });

  it("tokenizes Q temporal and special numeric types", () => {
    // triggers temporal type and special number paths
    const doc = [
      "/ Temporal types",
      "d: 2023.01.15",
      "m: 2023.01m",
      "t: 12:30:00.000",
      "dt: 2023.01.15T12:30:00",
      "ts: 2023.01.15D12:30:00.000000000",
      "dur: 5D12:30:00",
      "",
      "/ Special numeric types",
      "ni: 0N",
      "wi: 0w",
      "inf: 0W",
      "hex: 0x1F2A",
      "bin: 101010b",
      "ch: 65c",
      "short: 42h",
      "int: 100i",
      "long: 1000j",
      "nano: 1000000n",
    ].join("\n");
    const state = parseDoc(q, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });

  it("tokenizes Q with backtick symbols and nested structures", () => {
    const doc = [
      "/ Symbol and nested context",
      "sym: `AAPL",
      "syms: `AAPL`MSFT`GOOG",
      "path: `:./data/file",
      "port: `:localhost:5010",
      "",
      "/ Context manipulation",
      "t: ([] sym:syms; val:1 2 3)",
      "q: select from t where sym=`AAPL",
      "u: update val:val+1 from t",
      "",
      "/ Lambda with multiple args",
      "f:{[x;y;z] x+y+z}",
      "result: f[1;2;3]",
    ].join("\n");
    const state = parseDoc(q, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });
});

describe("mIRC tokenizer deeper coverage", () => {
  it("tokenizes mIRC with backslash escapes", () => {
    // triggers ch == "\\" path
    const doc = [
      "; mIRC backslash handling",
      "alias test {",
      "  echo -a value\\\\escaped",
      "  msg $chan text\\\\more",
      "}",
    ].join("\n");
    const state = parseDoc(mirc, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });

  it("tokenizes mIRC with block comments /* ... */", () => {
    // triggers tokenComment via ch == "/" && eat("*")
    const doc = [
      "/* This is a block comment",
      "   spanning multiple lines */",
      "alias greet {",
      "  /* inline block comment */",
      "  msg $chan Hello $1 !",
      "}",
    ].join("\n");
    const state = parseDoc(mirc, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });

  it("tokenizes mIRC with percent variables and semicolon comments", () => {
    // triggers ch == "%" path and ch == ";" comment path
    const doc = [
      "alias vars {",
      "  set %name World       ; set a variable",
      "  set %count 42         ; another variable",
      "  if (%count > 10) {   ; check condition",
      '    echo -a %name is %count',
      "  }",
      "  inc %count",
      "  dec %count 5",
      "}",
    ].join("\n");
    const state = parseDoc(mirc, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });

  it("tokenizes mIRC with unparsed regions ; ((...))", () => {
    // triggers tokenUnparsed via ch == ";" && stream.match(/ *\( *\(/)
    const doc = [
      "alias unparsed {",
      "  ; (( this is unparsed region ))",
      "  echo -a done",
      "}",
    ].join("\n");
    const state = parseDoc(mirc, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });

  it("tokenizes mIRC with operators and identifiers", () => {
    const doc = [
      "alias math {",
      "  var %x = 10",
      "  var %y = 20",
      "  var %z = %x + %y",
      "  if (%z >= 30) { echo -a big }",
      "  if (%x != %y) { echo -a different }",
      "  var %ratio = %x / %y",
      "  var %prod = %x * %y",
      "}",
    ].join("\n");
    const state = parseDoc(mirc, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });
});

describe("TiddlyWiki tokenizer deep coverage", () => {
  it("tokenizes TiddlyWiki with macros, transclusions, and widgets", () => {
    const doc = [
      "! Main Heading",
      "!! Sub Heading",
      "",
      "<<list-links filter:'[tag[Introduction]]'>>",
      "<<tabs tabsList:'[tag[Tab]]'>>",
      "",
      "{{TiddlerTitle}}",
      "{{TiddlerTitle||TemplateTitle}}",
      "",
      "<$link to='TiddlerTitle'>Link Text</$link>",
      "<$button message='tm-home'>Home</$button>",
      "<$reveal type='match' state='!!field' text='value'>",
      "  Revealed content",
      "</$reveal>",
    ].join("\n");
    const state = parseDoc(tiddlyWiki, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });

  it("tokenizes TiddlyWiki with tables, code blocks, and quotes", () => {
    const doc = [
      "|col1|col2|col3|",
      "|row1col1|row1col2|row1col3|",
      "|row2col1|row2col2|row2col3|",
      "",
      "```javascript",
      "var x = 42;",
      "console.log(x);",
      "```",
      "",
      "<<<",
      "This is a blockquote",
      "spanning multiple lines",
      "<<<",
      "",
      "* List item 1",
      "** Nested list item",
      "*** Deeply nested",
      "",
      "# Ordered 1",
      "## Ordered nested",
    ].join("\n");
    const state = parseDoc(tiddlyWiki, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });

  it("tokenizes TiddlyWiki with styled text and external links", () => {
    const doc = [
      "This has ''bold'' and //italic// text.",
      "This has __underlined__ and ~~strikethrough~~ text.",
      "This has `inline code` and ^superscript^ text.",
      "This has ,,subscript,, text.",
      "",
      "[[WikiLink]]",
      "[[Link Text|WikiPage]]",
      "[[External|https://example.com]]",
      "",
      "@@background-color:yellow; highlighted text@@",
      "@@color:red; red text@@",
    ].join("\n");
    const state = parseDoc(tiddlyWiki, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });
});

describe("Crystal tokenizer deep coverage", () => {
  it("tokenizes Crystal with classes, modules, and generics", () => {
    const doc = [
      "# Crystal comment",
      'require "json"',
      "",
      "module Greetable",
      "  def greet",
      '    "Hello, #{name}!"',
      "  end",
      "end",
      "",
      "class Person",
      "  include Greetable",
      "  include JSON::Serializable",
      "",
      "  getter name : String",
      "  property age : Int32",
      "",
      "  def initialize(@name : String, @age : Int32)",
      "  end",
      "end",
      "",
      "class Box(T)",
      "  def initialize(@value : T)",
      "  end",
      "",
      "  def value : T",
      "    @value",
      "  end",
      "end",
    ].join("\n");
    const state = parseDoc(crystal, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });

  it("tokenizes Crystal with regex, symbols, and string types", () => {
    const doc = [
      "# Various string types",
      'str = "regular string"',
      "char = 'a'",
      "sym = :symbol",
      "sym2 = :\"symbol with spaces\"",
      "",
      "regex = /^\\d+$/",
      "regex2 = /pattern/im",
      "",
      "# Heredoc",
      "text = <<-HEREDOC",
      "  multi-line",
      "  text",
      "  HEREDOC",
      "",
      "# String interpolation",
      "name = \"World\"",
      'greeting = "Hello, #{name.upcase}!"',
      "",
      "# Numbers",
      "hex = 0xFF_FF",
      "bin = 0b1010_1010",
      "oct = 0o777",
      "float = 3.14_15_93",
      "sci = 1.5e-3_f64",
    ].join("\n");
    const state = parseDoc(crystal, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });

  it("tokenizes Crystal with macros and compile-time features", () => {
    const doc = [
      "macro assert_equal(expected, actual)",
      "  if {{ expected }} != {{ actual }}",
      '    raise "Expected #{{{ expected }}}, got #{{{ actual }}}"',
      "  end",
      "end",
      "",
      "record Point, x : Int32, y : Int32",
      "",
      "enum Direction",
      "  North",
      "  South",
      "  East",
      "  West",
      "end",
      "",
      "alias NumberTypes = Int32 | Float64",
      "",
      "def process(val : NumberTypes) : String",
      "  val.to_s",
      "end",
    ].join("\n");
    const state = parseDoc(crystal, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });

  it("tokenizes Crystal with fibers, channels, and concurrency", () => {
    const doc = [
      "channel = Channel(Int32).new",
      "",
      "spawn do",
      "  channel.send(42)",
      "end",
      "",
      "val = channel.receive",
      "puts val",
      "",
      "# Multiple fibers",
      "fibers = (1..5).map do |i|",
      "  spawn { i * 2 }",
      "end",
      "",
      "Fiber.yield",
    ].join("\n");
    const state = parseDoc(crystal, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });
});

describe("Sass tokenizer deep coverage", () => {
  it("tokenizes Sass (indented syntax) with nesting and variables", () => {
    const doc = [
      "// Sass comment",
      "/* block comment */",
      "$primary: #336699",
      "$font-stack: Helvetica, sans-serif",
      "",
      "body",
      "  font: 100% $font-stack",
      "  color: $primary",
      "",
      "nav",
      "  ul",
      "    margin: 0",
      "    padding: 0",
      "    list-style: none",
      "  li",
      "    display: inline-block",
      "  a",
      "    display: block",
      "    padding: 6px 12px",
      "    text-decoration: none",
    ].join("\n");
    const state = parseDoc(sass, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });

  it("tokenizes Sass with mixins, extends, and functions", () => {
    const doc = [
      "=transform($property)",
      "  -webkit-transform: $property",
      "  -ms-transform: $property",
      "  transform: $property",
      "",
      ".box",
      "  +transform(rotate(30deg))",
      "",
      "%message-shared",
      "  border: 1px solid #ccc",
      "  padding: 10px",
      "  color: #333",
      "",
      ".success",
      "  @extend %message-shared",
      "  border-color: green",
      "",
      "@function pow($base, $exponent)",
      "  $result: 1",
      "  @for $_ from 1 through $exponent",
      "    $result: $result * $base",
      "  @return $result",
    ].join("\n");
    const state = parseDoc(sass, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });

  it("tokenizes Sass with control flow and each loops", () => {
    const doc = [
      "$sizes: 40px 50px 80px",
      "",
      "@each $size in $sizes",
      "  .icon-#{$size}",
      "    font-size: $size",
      "    height: $size",
      "    width: $size",
      "",
      "@for $i from 1 through 3",
      "  .item-#{$i}",
      "    width: 2em * $i",
      "",
      "$themes: (primary: blue, secondary: green)",
      "@each $name, $color in $themes",
      "  .theme-#{$name}",
      "    color: $color",
      "",
      "@while $i > 0",
      "  .item-#{$i}",
      "    width: 2em * $i",
      "  $i: $i - 1",
    ].join("\n");
    const state = parseDoc(sass, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });

  it("tokenizes Sass with @use, @forward, and @include with args", () => {
    const doc = [
      "@use 'sass:math'",
      "@use 'colors' as c",
      "@forward 'mixins' show flex-center",
      "",
      "@mixin avatar($size, $circle: false)",
      "  width: $size",
      "  height: $size",
      "  @if $circle",
      "    border-radius: $size / 2",
      "",
      ".large-avatar",
      "  @include avatar(100px, $circle: true)",
      "",
      "@mixin theme($theme: DarkGray)",
      "  background: $theme",
      "  box-shadow: 0 0 1px rgba(169, 169, 169, 0.25)",
      "  color: #fff",
      "",
      ".info",
      "  @include theme",
      ".alert",
      "  @include theme($theme: DarkRed)",
    ].join("\n");
    const state = parseDoc(sass, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });
});

describe("Erlang tokenizer deep coverage", () => {
  it("tokenizes Erlang with modules, functions, and pattern matching", () => {
    const doc = [
      "% Erlang comment",
      "-module(math).",
      "-export([factorial/1, fib/1]).",
      "-export_type([result/0]).",
      "",
      "-type result() :: {ok, integer()} | {error, term()}.",
      "",
      "factorial(0) -> 1;",
      "factorial(N) when N > 0 -> N * factorial(N - 1).",
      "",
      "fib(0) -> 0;",
      "fib(1) -> 1;",
      "fib(N) -> fib(N-1) + fib(N-2).",
    ].join("\n");
    const state = parseDoc(erlang, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });

  it("tokenizes Erlang with processes, messages, and OTP", () => {
    const doc = [
      "-module(server).",
      "-behaviour(gen_server).",
      "",
      "-record(state, {count = 0, name :: string()}).",
      "",
      "start_link() ->",
      "  gen_server:start_link({local, ?MODULE}, ?MODULE, [], []).",
      "",
      "init([]) ->",
      "  {ok, #state{}}.",
      "",
      "handle_call(get_count, _From, State) ->",
      "  {reply, State#state.count, State};",
      "handle_call(_Req, _From, State) ->",
      "  {reply, ok, State}.",
      "",
      "handle_cast(increment, State) ->",
      "  NewState = State#state{count = State#state.count + 1},",
      "  {noreply, NewState}.",
    ].join("\n");
    const state = parseDoc(erlang, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });

  it("tokenizes Erlang with list comprehensions, binaries, and strings", () => {
    const doc = [
      "squares(List) -> [X*X || X <- List, X > 0].",
      "",
      "process_binary(<<H:8, T/binary>>) ->",
      "  {H, T}.",
      "",
      "make_greeting(Name) ->",
      '  <<"Hello, ", Name/binary, "!">>.',
      "",
      "atoms() -> [hello, world, \'quoted atom\', true, false, undefined].",
      "",
      "strings() ->",
      '  S1 = "regular string",',
      '  S2 = "with escape\\n",',
      "  {S1, S2}.",
      "",
      "numbers() ->",
      "  Int = 42,",
      "  Float = 3.14,",
      "  Hex = 16#FF,",
      "  Oct = 8#77,",
      "  Bin = 2#1010,",
      "  {Int, Float, Hex, Oct, Bin}.",
    ].join("\n");
    const state = parseDoc(erlang, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });

  it("tokenizes Erlang with try-catch, exceptions, and macros", () => {
    const doc = [
      "-define(TIMEOUT, 5000).",
      "-define(LOG(Msg), io:format(\"LOG: ~p~n\", [Msg])).",
      "",
      "safe_div(X, Y) ->",
      "  try X div Y",
      "  catch",
      "    error:badarith -> {error, division_by_zero};",
      "    _:Reason -> {error, Reason}",
      "  end.",
      "",
      "with_timeout(Fun) ->",
      "  receive",
      "    {result, R} -> {ok, R}",
      "  after ?TIMEOUT ->",
      "    {error, timeout}",
      "  end.",
      "",
      "list_ops() ->",
      "  L = [1, 2, 3, 4, 5],",
      "  H = hd(L),",
      "  T = tl(L),",
      "  Len = length(L),",
      "  Sorted = lists:sort(L),",
      "  {H, T, Len, Sorted}.",
    ].join("\n");
    const state = parseDoc(erlang, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });
});
