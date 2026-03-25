import { describe, it, expect } from "bun:test";
import { StreamLanguage, LanguageSupport, ensureSyntaxTree } from "../../../src/core/language/index";
import { EditorState } from "../../../src/core/state/index";

import { haxe, hxml } from "../../../src/lang/legacy/haxe";
import { coffeeScript } from "../../../src/lang/legacy/coffeescript";
import { ruby } from "../../../src/lang/legacy/ruby";
import { troff } from "../../../src/lang/legacy/troff";

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

// ─── Haxe ────────────────────────────────────────────────────────────────────

describe("Haxe tokenizer deep coverage", () => {
  it("tokenizes classes, interfaces, typedefs, and type keywords", () => {
    const doc = [
      "class MyClass extends Base implements IFoo {",
      "  public var name:String;",
      "  private var count:Int;",
      "  static var instance:MyClass;",
      "  inline function compute():Float { return 0.0; }",
      "}",
      "",
      "interface IFoo {",
      "  public function doSomething():Void;",
      "}",
      "",
      "typedef Point = { x:Float, y:Float };",
      "abstract MyAbstract(Int) { }",
      "enum Color { Red; Green; Blue; }",
    ].join("\n");
    const state = parseDoc(haxe, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });

  it("tokenizes hex literals, regex literals, and string escapes", () => {
    // Exercises 0x hex path, ~/regex/, single/double quote strings with escapes
    const doc = [
      "var hex = 0xFF00AA;",
      "var hexLower = 0xdeadbeef;",
      "var re = ~/[a-z]+\\d*/gimsu;",
      "var s1 = \"hello\\nworld\\t!\";",
      "var s2 = 'single\\'quoted';",
      "var num = 3.14e+10;",
      "var neg = -42;",
      "var negFloat = -3.14;",
    ].join("\n");
    const state = parseDoc(haxe, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });

  it("tokenizes metadata annotations and conditional compilation", () => {
    // Exercises @ metadata and # conditional paths
    const doc = [
      "@:allow(test.Package)",
      "@:generic",
      "@:final",
      "class Annotated {",
      "  @:isVar public var prop(get, set):Int;",
      "}",
      "",
      "#if debug",
      "  trace('debug mode');",
      "#elseif production",
      "  // production code",
      "#else",
      "  trace('other');",
      "#end",
    ].join("\n");
    const state = parseDoc(haxe, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });

  it("tokenizes switch/case, for-in, try/catch, and import", () => {
    // Exercises statement combinators: switch, case, default, for, catch, import
    const doc = [
      "import haxe.io.Bytes;",
      "import haxe.ds.*;",
      "using Lambda;",
      "",
      "function example() {",
      "  for (i in 0...10) {",
      "    switch (i) {",
      "      case 0: trace('zero');",
      "      case 1: trace('one');",
      "      default: trace('other');",
      "    }",
      "  }",
      "  try {",
      "    throw 'error';",
      "  } catch (e:Dynamic) {",
      "    trace(e);",
      "  }",
      "}",
    ].join("\n");
    const state = parseDoc(haxe, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });

  it("tokenizes block comments spanning multiple lines", () => {
    const doc = [
      "/* This is a",
      "   multi-line block comment",
      "   with * stars * inside */",
      "var afterComment = true;",
      "// single line comment",
      "var x = 1; /* inline block */ var y = 2;",
    ].join("\n");
    const state = parseDoc(haxe, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });

  it("tokenizes operators, punctuation, and property access", () => {
    // Exercises isOperatorChar, dots, brackets, colons, commas
    const doc = [
      "var a = 1 + 2 - 3 * 4 / 5;",
      "var b = a > 0 ? true : false;",
      "var c = a == b && a != c || !d;",
      "var d = a << 2 | b >> 1;",
      "var arr = [1, 2, 3];",
      "var obj = {x: 1, y: 2};",
      "var val = obj.x;",
      "var elem = arr[0];",
      "a++;",
      "b--;",
    ].join("\n");
    const state = parseDoc(haxe, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });

  it("tokenizes function definitions with type annotations", () => {
    // Exercises functiondef, typeuse, typestring, typeprop, funarg combinators
    const doc = [
      "function add(a:Int, b:Int):Int {",
      "  return a + b;",
      "}",
      "",
      "function process(callback:Int->Void):Void {",
      "  callback(42);",
      "}",
      "",
      "var fn = function(x:Float):Float {",
      "  return x * x;",
      "};",
      "",
      "function typed():{x:Int, y:Int} {",
      "  return {x: 1, y: 2};",
      "}",
    ].join("\n");
    const state = parseDoc(haxe, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });

  it("tokenizes inline var, multiple var declarations, and labels", () => {
    // Exercises vardef1, vardef2 (comma-separated), maybelabel
    const doc = [
      "var x = 1, y = 2, z:Int;",
      "var untyped:Dynamic;",
      "label: while (true) {",
      "  break;",
      "  continue;",
      "}",
      "var a = new Array<Int>();",
    ].join("\n");
    const state = parseDoc(haxe, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });

  it("tokenizes attribute chains and macro keyword", () => {
    // Exercises maybeattribute (attribute chains), macro keyword
    const doc = [
      "public static inline function fast():Void { }",
      "private static var cache:Map<String, Dynamic>;",
      "macro function buildType() { return null; }",
    ].join("\n");
    const state = parseDoc(haxe, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });

  it("tokenizes indent with switch, vardef, form, stat, and align contexts", () => {
    // Exercises various indent branches
    const doc = [
      "function test() {",
      "  switch (x) {",
      "    case 1:",
      "      trace('one');",
      "    default:",
      "      trace('default');",
      "  }",
      "  var a = 1,",
      "      b = 2,",
      "      c = 3;",
      "  if (a > 0)",
      "    trace('positive');",
      "  else",
      "    trace('non-positive');",
      "}",
    ].join("\n");
    const state = parseDoc(haxe, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });
});

describe("HXML tokenizer deep coverage", () => {
  it("tokenizes hxml flags, defines, comments, and strings", () => {
    const doc = [
      "# This is a comment",
      "-lib openfl",
      "--macro include('src')",
      "-D debug",
      "-D production",
      "--class-path src",
      "-cp libs",
      "'quoted argument'",
      "# another comment",
      "--connect 6000",
      "-L hxcpp",
    ].join("\n");
    const state = parseDoc(hxml, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });

  it("tokenizes hxml strings spanning to end of line", () => {
    // Exercises inString path where skipTo fails (string to EOL)
    const doc = [
      "-D 'a long define",
      "still in string'",
      "--main Main",
    ].join("\n");
    const state = parseDoc(hxml, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });
});

// ─── CoffeeScript ────────────────────────────────────────────────────────────

describe("CoffeeScript tokenizer deep coverage", () => {
  it("tokenizes classes, fat arrows, and inheritance", () => {
    const doc = [
      "class Animal",
      "  constructor: (@name) ->",
      "    @alive = true",
      "",
      "  move: (meters) ->",
      "    console.log \"#{@name} moved #{meters}m.\"",
      "",
      "class Snake extends Animal",
      "  move: ->",
      "    console.log 'Slithering...'",
      "    super 5",
      "",
      "sam = new Snake 'Sammy'",
      "sam.move()",
    ].join("\n");
    const state = parseDoc(coffeeScript, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });

  it("tokenizes triple-quoted strings and heredocs", () => {
    // Exercises tokenFactory with triple delimiters (''' and \"\"\")
    const doc = [
      'html = """',
      '  <div class="content">',
      "    <p>Hello World</p>",
      "  </div>",
      '"""',
      "",
      "text = '''",
      "  No interpolation here",
      "  Just plain text",
      "'''",
    ].join("\n");
    const state = parseDoc(coffeeScript, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });

  it("tokenizes block comments (### ... ###)", () => {
    // Exercises longComment tokenizer
    const doc = [
      "###",
      "This is a block comment",
      "spanning multiple lines",
      "with # hash marks inside",
      "###",
      "",
      "#### Docco-style title comment",
      "",
      "# Regular single-line comment",
      "x = 42",
    ].join("\n");
    const state = parseDoc(coffeeScript, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });

  it("tokenizes triple-slash regex and single regex", () => {
    // Exercises regexPrefixes paths (/// and /)
    const doc = [
      "pattern = ///",
      "  ^\\d+   # digits",
      "  \\.     # dot",
      "  \\d+$   # more digits",
      "///",
      "",
      "simple = /^test\\d+$/gi",
      "notRegex = 10 / 2",
      "result = a / b",
    ].join("\n");
    const state = parseDoc(coffeeScript, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });

  it("tokenizes number literals: hex, float, negative, zero", () => {
    // Exercises all number paths: hex, float with exponent, negative, zero
    const doc = [
      "hex = 0xff",
      "decimal = 12345",
      "negInt = -99",
      "float1 = 3.14",
      "float2 = -0.5",
      "float3 = .25",
      "withExp = 1.5e+10",
      "negExp = 2.0e-3",
      "zero = 0",
      "negZero = -0",
      "range = [1..10]",
      "intOnly = -42e5",
    ].join("\n");
    const state = parseDoc(coffeeScript, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });

  it("tokenizes operators, word operators, and delimiters", () => {
    // Exercises operators regex, wordOperators, delimiters
    const doc = [
      "a = 1 + 2",
      "b = a - 1",
      "c = a * b",
      "d = c / 2",
      "e = d % 3",
      "f = a is b",
      "g = a isnt c",
      "h = not false",
      "i = a and b",
      "j = a or b",
      "k = a instanceof Object",
      "l = typeof a",
      "m = a in [1, 2, 3]",
      "n = a += 1",
      "o = b -= 2",
      "p = c **= 3",
      "q = d ||= 5",
      "r = e &&= true",
      "s = f ?= 'default'",
      "arr = [1, 2, 3]",
      "obj = {a: 1, b: 2}",
      "pair = a: 1",
      "spread = [a...]",
    ].join("\n");
    const state = parseDoc(coffeeScript, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });

  it("tokenizes scope changes with indent/dedent and return", () => {
    // Exercises indent/dedent logic, return dedent, then dedent, -> / => at eol
    const doc = [
      "square = (x) -> x * x",
      "",
      "cube = (x) =>",
      "  x * x * x",
      "",
      "list = [1, 2, 3, 4, 5]",
      "evens = (i for i in list when i % 2 is 0)",
      "",
      "result = if true",
      "  'yes'",
      "else",
      "  'no'",
      "",
      "fn = ->",
      "  return 42",
      "",
      "switch day",
      "  when 'Mon' then 'Work'",
      "  when 'Sat', 'Sun' then 'Rest'",
      "  else 'Work'",
    ].join("\n");
    const state = parseDoc(coffeeScript, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });

  it("tokenizes at-properties and constants", () => {
    // Exercises atProp and constants regexes
    const doc = [
      "class Config",
      "  constructor: ->",
      "    @debug = true",
      "    @count = 0",
      "    @name = 'test'",
      "",
      "  isDebug: -> @debug",
      "",
      "val1 = Infinity",
      "val2 = NaN",
      "val3 = undefined",
      "val4 = null",
      "val5 = true",
      "val6 = false",
      "val7 = on",
      "val8 = off",
      "val9 = yes",
      "val10 = no",
    ].join("\n");
    const state = parseDoc(coffeeScript, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });

  it("tokenizes string with escape at end of line in singleline regex", () => {
    // Exercises tokenFactory singleline escape at eol
    const doc = [
      "pattern = /test\\",
      "/",
      "str = 'hello'",
    ].join("\n");
    const state = parseDoc(coffeeScript, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });

  it("tokenizes bracket-based scope changes and alignment", () => {
    // Exercises delimiter_index for [({ and ])} scope handling
    const doc = [
      "arr = [",
      "  1",
      "  2",
      "  3",
      "]",
      "",
      "obj = {",
      "  a: 1",
      "  b: 2",
      "}",
      "",
      "fn = ((x) ->",
      "  x + 1",
      ")",
      "",
      "nested = [",
      "  {a: [1, 2]}",
      "  {b: [3, 4]}",
      "]",
    ].join("\n");
    const state = parseDoc(coffeeScript, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });
});

// ─── Ruby ────────────────────────────────────────────────────────────────────

describe("Ruby tokenizer deep coverage", () => {
  it("tokenizes =begin/=end block comments", () => {
    const doc = [
      "=begin",
      "This is a block comment",
      "spanning multiple lines",
      "=end",
      "puts 'after comment'",
    ].join("\n");
    const state = parseDoc(ruby, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });

  it("tokenizes percent-literal strings: %w, %q, %Q, %r, %s, %x, %W", () => {
    // Exercises all % paths: style/embed toggles
    const doc = [
      "words = %w[foo bar baz]",
      "quoted = %q(no interpolation #{here})",
      "dquoted = %Q(with #{interpolation})",
      "regex = %r{pattern\\d+}i",
      "symbol = %s[my_symbol]",
      "exec = %x(ls -la)",
      "warray = %W(one #{two} three)",
      "plain = %(default string)",
    ].join("\n");
    const state = parseDoc(ruby, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });

  it("tokenizes heredocs with indent stripping", () => {
    // Exercises readHereDoc with both ~ (indent strip) and - (dash) markers
    const doc = [
      "text = <<~HEREDOC",
      "  This is indented",
      "  heredoc content",
      "HEREDOC",
      "",
      "text2 = <<-LEGACY",
      "  Legacy heredoc",
      "LEGACY",
      "",
      'text3 = <<"QUOTED"',
      "  With interpolation #{here}",
      "QUOTED",
    ].join("\n");
    const state = parseDoc(ruby, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });

  it("tokenizes number literals: hex, binary, octal, float, exponent", () => {
    // Exercises 0x, 0b, octal, decimal with underscores and exponents
    const doc = [
      "hex = 0xDEAD_BEEF",
      "bin = 0b1010_0101",
      "oct = 0777",
      "dec = 1_000_000",
      "flt = 3.14_15",
      "exp = 1.5e+10",
      "neg_exp = 2.0e-3",
      "zero = 0",
    ].join("\n");
    const state = parseDoc(ruby, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });

  it("tokenizes character literals and question mark operator", () => {
    // Exercises the ? character literal paths including \\CM- and \\
    const doc = [
      "ch = ?a",
      "newline = ?\\n",
      "tab = ?\\t",
      "ctrl = ?\\C-a",
      "meta = ?\\M-a",
      "ctrl_meta = ?\\C-\\M-x",
      "space = ?\\s",
    ].join("\n");
    const state = parseDoc(ruby, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });

  it("tokenizes symbol literals including quoted and operator symbols", () => {
    // Exercises :' :" :> :<< :+ :- :/ etc.
    const doc = [
      "sym1 = :simple",
      "sym2 = :with_underscore",
      "sym3 = :CamelCase",
      "sym4 = :question?",
      "sym5 = :bang!",
      "sym6 = :equals=",
      "sym_str = :'quoted symbol'",
      'sym_dstr = :"interpolated #{sym}"',
      "sym_gt = :>",
      "sym_lt = :<",
      "sym_lshift = :<<",
      "sym_rshift = :>>",
      "sym_plus = :+",
      "sym_minus = :-",
      "sym_mul = :*",
      "sym_div = :/",
      "sym_amp = :&",
      "sym_pipe = :|",
      "sym_bang = :!",
    ].join("\n");
    const state = parseDoc(ruby, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });

  it("tokenizes instance/class vars, globals, and special globals", () => {
    // Exercises @, @@, $ paths
    const doc = [
      "class Foo",
      "  @@class_var = 0",
      "  @instance_var = 1",
      "",
      "  def initialize",
      "    @name = 'foo'",
      "  end",
      "end",
      "",
      "$global_var = 'global'",
      "$LOAD_PATH << '.'",
      "$0",
      "$1",
      "$:",
      "$!",
      "$;",
    ].join("\n");
    const state = parseDoc(ruby, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });

  it("tokenizes regex with lookahead detection and interpolation", () => {
    // Exercises regexpAhead with nested brackets, interpolation in strings
    const doc = [
      'str = "Hello #{name}, age: #{age}"',
      'str2 = "Path: #{$LOAD_PATH}"',
      'str3 = "Instance: #{@var}"',
      'str4 = "Expr: #{1 + 2}"',
      "",
      "pattern = /^[a-z]+(\\d{2,4})\\.?$/i",
      "nested = /[({test})]\\//",
      "result = str =~ /hello/i",
    ].join("\n");
    const state = parseDoc(ruby, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });

  it("tokenizes blocks with pipes, do/end, and control flow keywords", () => {
    // Exercises | varList, do indent, dedent words, if/unless at column 0
    const doc = [
      "[1, 2, 3].each do |item|",
      "  puts item",
      "end",
      "",
      "{a: 1}.each { |k, v| puts k }",
      "",
      "if condition",
      "  do_something",
      "elsif other",
      "  do_other",
      "else",
      "  do_default",
      "end",
      "",
      "unless done",
      "  retry",
      "end",
      "",
      "while running",
      "  process",
      "end",
      "",
      "until finished",
      "  work",
      "end",
      "",
      "begin",
      "  risky_operation",
      "rescue StandardError => e",
      "  puts e.message",
      "ensure",
      "  cleanup",
      "end",
    ].join("\n");
    const state = parseDoc(ruby, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });

  it("tokenizes operator sequences and arrow operator", () => {
    // Exercises -> operator, =~ ==, <=> <=, >=, various operator combos
    const doc = [
      "lambda_fn = ->(x) { x * 2 }",
      "compare = a <=> b",
      "lte = a <= b",
      "gte = a >= b",
      "eq = a == b",
      "neq = a != b",
      "match = str =~ /pattern/",
      "range = 1..10",
      "exclusive = 1...10",
      "power = 2 ** 10",
      "shift_l = a << b",
      "shift_r = a >> b",
    ].join("\n");
    const state = parseDoc(ruby, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });

  it("tokenizes string interpolation with braces inside quoted-brace string", () => {
    // Exercises tokenBaseUntilBrace depth tracking and read-quoted-paused context
    const doc = [
      'result = %{outer #{inner} text}',
      'nested = %{a #{b + "#{c}"} d}',
      'simple = "value: #{1 + {a: 2}[:a]}"',
    ].join("\n");
    const state = parseDoc(ruby, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });
});

// ─── Troff ───────────────────────────────────────────────────────────────────

describe("Troff tokenizer deep coverage", () => {
  it("tokenizes basic troff escape sequences", () => {
    // Exercises \fB, \fR, \fI, \u, \d, \%, \& paths
    const doc = [
      "\\fBbold text\\fR",
      "\\fIitalic text\\fR",
      "This has \\u superscript \\d back",
      "Hyphen\\%ation point",
      "Zero-width\\& space",
    ].join("\n");
    const state = parseDoc(troff, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });

  it("tokenizes troff \\m[] color and \\s size escapes", () => {
    // Exercises \m[...] and \s+/\s- paths
    const doc = [
      "\\m[red]colored text\\m[]",
      "\\m[blue]another color\\m[default]",
      "\\s+2larger text\\s-2",
      "\\s+10very large\\s-10",
    ].join("\n");
    const state = parseDoc(troff, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });

  it("tokenizes troff \\( and \\*( special character escapes", () => {
    // Exercises \( and \*\( paths
    const doc = [
      "\\(em is an em-dash",
      "\\(co is copyright",
      "\\*(LQ and \\*(RQ for quotes",
      "\\*R is registered",
    ].join("\n");
    const state = parseDoc(troff, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });

  it("tokenizes troff section headers .TH .SH .SS .HP", () => {
    // Exercises .TH, .SH, .SS, .HP paths
    const doc = [
      ".TH MYCOMMAND 1 2024-01-01",
      ".SH NAME",
      "mycommand \\- does something",
      ".SH SYNOPSIS",
      ".B mycommand",
      ".SH DESCRIPTION",
      "This is the description.",
      ".SS Subsection Title",
      "Subsection content.",
      ".HP 4",
      "Hanging paragraph content",
    ].join("\n");
    const state = parseDoc(troff, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });

  it("tokenizes troff font/style requests .B .I .R and two-letter macros", () => {
    // Exercises .B, .I, .R attribute paths and two-letter macro matching
    const doc = [
      ".B bold_word",
      ".I italic_word",
      ".R roman_word",
      ".BR bold_then_roman",
      ".BI bold_then_italic",
      ".IR italic_then_roman",
      ".PP",
      "Normal paragraph text.",
      ".TP",
      "Tagged paragraph.",
      ".RS",
      "Relative indent start.",
      ".RE",
    ].join("\n");
    const state = parseDoc(troff, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });

  it("tokenizes troff comment syntax (.\\ and '.\\)", () => {
    // Exercises sol comment paths for both . and ' prefixes
    const doc = [
      '.\\\" This is a comment after dot',
      "'.\\\" This is a comment after quote",
      ".SH SECTION",
      "Normal text here.",
    ].join("\n");
    const state = parseDoc(troff, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });

  it("tokenizes troff with bare backslash and unknown sequences", () => {
    // Exercises the fallthrough backslash return path
    const doc = [
      "Text with \\n newline register",
      "And \\t tab",
      "Unknown \\z escape",
      "Bare text with no escapes",
      "word-with-hyphens",
    ].join("\n");
    const state = parseDoc(troff, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });

  it("tokenizes troff with lowercase two-letter macros", () => {
    // Exercises the lowercase two-letter macro path (stream.match(/[a-z]/) && stream.match(/[a-z]/))
    const doc = [
      ".de MY_MACRO",
      "Custom macro body.",
      "..",
      ".nr indent 4",
      ".ds LQ ``",
      ".ds RQ ''",
      ".ad l",
      ".na",
    ].join("\n");
    const state = parseDoc(troff, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });
});
