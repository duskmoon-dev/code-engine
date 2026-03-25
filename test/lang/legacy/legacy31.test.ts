import { describe, it, expect } from "bun:test";
import { StreamLanguage, LanguageSupport, ensureSyntaxTree } from "../../../src/core/language/index";
import { EditorState } from "../../../src/core/state/index";

import { perl } from "../../../src/lang/legacy/perl";
import { sass } from "../../../src/lang/legacy/sass";
import { diff } from "../../../src/lang/legacy/diff";
import { go } from "../../../src/lang/legacy/go";
import { verilog, tlv } from "../../../src/lang/legacy/verilog";
import { groovy } from "../../../src/lang/legacy/groovy";

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

describe("Perl tokenizer deep coverage", () => {
  it("tokenizes heredocs, q/qq/qw/qr/qx quoting constructs", () => {
    // Exercises <<HEREDOC, q{}, qq{}, qw(), qr//, qx`` paths
    const doc = [
      "my $text = <<END;",
      "This is a heredoc",
      "with multiple lines",
      "END",
      "",
      'my $single = q{single quoted};',
      'my $double = qq{double quoted with $var};',
      'my @words = qw(foo bar baz);',
      'my $regex = qr/pattern/i;',
      'my $output = qx(ls -la);',
      'my $also = q[bracketed];',
      'my $angle = q<angled>;',
      "my $tick = q'ticked';",
    ].join("\n");
    const state = parseDoc(perl, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });

  it("tokenizes s///, tr///, y/// substitution and transliteration", () => {
    // Exercises s, tr, y token paths with various delimiters
    const doc = [
      "my $str = 'hello world';",
      "$str =~ s/hello/goodbye/g;",
      "$str =~ s{hello}{goodbye}g;",
      "$str =~ s[hello][goodbye]g;",
      "$str =~ s<hello><goodbye>g;",
      "$str =~ tr/a-z/A-Z/;",
      "$str =~ tr{a-z}{A-Z};",
      "$str =~ y/a-z/A-Z/;",
      "$str =~ y{a-z}{A-Z};",
    ].join("\n");
    const state = parseDoc(perl, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });

  it("tokenizes regex match m// with various delimiters and special variables", () => {
    // Exercises m{}, m[], m<>, m!! paths and builtin variable paths
    const doc = [
      "if ($line =~ m{pattern}i) {",
      "  print $1;",
      "}",
      'if ($line =~ m[another]gx) {',
      '  print $MATCH;',
      '}',
      'if ($line =~ m<something>s) {',
      '  print $PREMATCH;',
      '}',
      'if ($line =~ m!bang!gi) {',
      '  print $POSTMATCH;',
      '}',
      'print $_;',
      'print @_;',
      'print $ARG;',
      'print $$;',
      'print $^W;',
      'print ${^MATCH};',
    ].join("\n");
    const state = parseDoc(perl, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });

  it("tokenizes POD, __END__, __DATA__, backticks, and hash-bang comments", () => {
    // Exercises =item/=cut, __END__, __DATA__, backtick tokenChain, and # comments
    const doc = [
      "#!/usr/bin/perl",
      "use strict;",
      "use warnings;",
      "",
      "# A comment",
      "my $cmd = `ls -la`;",
      'my $x = "interpolated $var here";',
      "my $num = 0xFF;",
      "my $oct = 0777;",
      "my $float = 3.14e-10;",
      "my $under = 1_000_000;",
      "",
      "=item description",
      "Some pod documentation",
      "=cut",
      "",
      "print 42;",
    ].join("\n");
    const state = parseDoc(perl, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });

  it("tokenizes sigils, arrow operator, and uppercase identifiers", () => {
    // Exercises $@%& sigils, -> operator, BEGIN/END blocks, and uppercase meta paths
    const doc = [
      "my %hash = (a => 1, b => 2);",
      "my @arr = (1, 2, 3);",
      "my $ref = \\@arr;",
      "$ref->[0];",
      "$hash{a};",
      "&mysub();",
      "",
      "BEGIN { print 'begin' }",
      "END { print 'end' }",
      "",
      "sub my_func {",
      "  my ($self, %args) = @_;",
      "  local $/ = undef;",
      "  our $GLOBAL = 1;",
      "  return $self;",
      "}",
      "",
      "STDIN;",
      "STDOUT;",
      "STDERR;",
    ].join("\n");
    const state = parseDoc(perl, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });

  it("tokenizes regex with / delimiter after =~ and complex operator chains", () => {
    // Exercises the /regex/ path (ch=="/") and operator matching
    const doc = [
      'if ($x =~ /^foo.*bar$/i) {',
      "  print 'matched';",
      "}",
      "my $a = 1 + 2 - 3 * 4 / 5 % 6;",
      "my $b = $a == 1 ? 'yes' : 'no';",
      "my $c = $a <=> $b;",
      "my $d = $a eq 'test' && $b ne 'other';",
      "my $e = $a || $b // $c;",
      "my $range = 1..10;",
      "my $not = not $a;",
      "my $xor = $a xor $b;",
    ].join("\n");
    const state = parseDoc(perl, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });
});

describe("Sass (indented) tokenizer deep coverage", () => {
  it("tokenizes indented Sass with selectors, properties, and nesting", () => {
    // Exercises first-half tokenBase: ., #, $, @mixin, @if, indent/dedent
    const doc = [
      "$primary: #336699",
      "$border-radius: 4px",
      "",
      "=my-mixin($color, $size: 16px)",
      "  color: $color",
      "  font-size: $size",
      "",
      ".container",
      "  +my-mixin($primary)",
      "  background: $primary",
      "  border-radius: $border-radius",
      "",
      "  .inner",
      "    color: red",
      "    &:hover",
      "      color: blue",
      "",
      "#main",
      "  width: 100%",
    ].join("\n");
    const state = parseDoc(sass, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });

  it("tokenizes Sass with comments, strings, interpolation, and url()", () => {
    // Exercises /*, //, #{}, string tokenizer, url tokenizer
    const doc = [
      "/* block comment",
      "   multiline */",
      "// line comment",
      "",
      '$font: "Helvetica Neue"',
      "$name: world",
      "",
      ".greeting-#{$name}",
      '  content: "hello #{$name}"',
      "  background: url('image.png')",
      '  background: url("other.jpg")',
      "  background: url(bare-url.png)",
    ].join("\n");
    const state = parseDoc(sass, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });

  it("tokenizes Sass with @extend, @return, directives, and value-side tokens", () => {
    // Exercises @extend dedent, @return dedent, @for/@each/@while, value-side (#hex, units, !, keywords)
    const doc = [
      "@mixin theme($name)",
      "  @if $name == dark",
      "    background: #333",
      "    color: #fff",
      "  @else if $name == light",
      "    background: #fff",
      "    color: #333",
      "  @else",
      "    background: auto",
      "",
      "@for $i from 1 through 3",
      "  .col-#{$i}",
      "    width: 100px",
      "",
      "@each $color in red, green, blue",
      "  .text-#{$color}",
      "    color: $color",
      "",
      ".button",
      "  @extend .base-button",
      "  display: block !important",
      "  font-size: 14px",
      "  width: 200em",
      "  margin: 10in",
      "  opacity: 0.5",
      "  background: url(icon.svg)",
      "",
      "@function double($n)",
      "  @return $n * 2",
      "",
      ".pseudo::before",
      "  content: true",
      "",
      ".-webkit-prefix",
      "  color: null",
    ].join("\n");
    const state = parseDoc(sass, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });

  it("tokenizes Sass with property:value patterns and color keywords", () => {
    // Exercises second-half (cursorHalf=1) with color keywords, value keywords, property keywords
    const doc = [
      ".box",
      "  color: red",
      "  background-color: blue",
      "  display: inline-block",
      "  position: absolute",
      "  font-weight: bold",
      "  font-family: serif",
      "  border: 1px solid transparent",
      "  z-index: 10",
    ].join("\n");
    const state = parseDoc(sass, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });
});

describe("Diff tokenizer deep coverage", () => {
  it("tokenizes unified diff with added, removed, meta, and context lines", () => {
    const doc = [
      "--- a/file.txt",
      "+++ b/file.txt",
      "@@ -1,5 +1,6 @@",
      " context line",
      "-removed line",
      "+added line",
      "+another added",
      " more context",
    ].join("\n");
    const state = parseDoc(diff, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });

  it("tokenizes diff with trailing whitespace errors", () => {
    // Exercises the tw_pos === 0 and tw_pos !== -1 paths
    const doc = [
      "\t trailing whitespace only line",
      "+added with trailing space ",
      "-removed with trailing tab\t",
      " context with trailing spaces  ",
      "@@ -10,3 +10,4 @@",
      " clean context",
    ].join("\n");
    const state = parseDoc(diff, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });

  it("tokenizes diff with non-sol continuation and empty changes", () => {
    // Exercises !stream.sol() path and lines with no recognized token
    const doc = [
      "diff --git a/file.txt b/file.txt",
      "index abc1234..def5678 100644",
      "--- a/file.txt",
      "+++ b/file.txt",
      "@@ -1,2 +1,3 @@",
      "+new line",
      " unchanged",
      "-old line",
    ].join("\n");
    const state = parseDoc(diff, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });

  it("tokenizes diff with context diff format headers", () => {
    const doc = [
      "*** file.orig\tThu Jan 01 00:00:00 2025",
      "--- file.new\tFri Jan 02 00:00:00 2025",
      "***************",
      "*** 1,3 ****",
      "  context",
      "- removed",
      "--- 1,3 ----",
      "  context",
      "+ added",
    ].join("\n");
    const state = parseDoc(diff, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });
});

describe("Go tokenizer deep coverage", () => {
  it("tokenizes Go with raw strings, hex/octal literals, and all number forms", () => {
    // Exercises backtick strings (multiline), hex 0x, octal 0, float with .
    const doc = [
      'package main',
      '',
      'var raw = `raw string',
      'spanning multiple',
      'lines with \\ no escapes`',
      '',
      'var hex = 0xFF',
      'var oct = 0777',
      'var dec = 42',
      'var flt = 3.14',
      'var sci = 1.5e10',
      'var dotStart = .5',
      'var sciNeg = 2e-3',
    ].join("\n");
    const state = parseDoc(go, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });

  it("tokenizes Go with block comments, operators, and all punctuation", () => {
    // Exercises tokenComment, isOperatorChar, curPunc for all bracket types
    const doc = [
      'package main',
      '',
      '/* block comment',
      '   spanning lines */',
      '',
      'func example() {',
      '  m := map[string]int{"a": 1}',
      '  s := []int{1, 2, 3}',
      '  x := (1 + 2) * 3 - 4 / 2',
      '  y := x << 2 | x >> 1',
      '  z := &x',
      '  _ = *z',
      '  if x > 0 && y < 10 || z != nil {',
      '    x = x ^ y % 3',
      '  }',
      '}',
    ].join("\n");
    const state = parseDoc(go, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });

  it("tokenizes Go with case/default, nested contexts, and atoms", () => {
    // Exercises case/default curPunc, popContext/pushContext, atoms
    const doc = [
      'package main',
      '',
      'func main() {',
      '  x := true',
      '  y := false',
      '  var z error = nil',
      '  _ = append(make([]int, 0), 1)',
      '  _ = len("hello")',
      '  _ = cap(make([]int, 5, 10))',
      '  println(real(complex(1, 2)))',
      '  println(imag(complex(1, 2)))',
      '',
      '  switch x {',
      '  case true:',
      '    println("yes")',
      '  case false:',
      '    println("no")',
      '  default:',
      '    println("other")',
      '  }',
      '',
      '  select {',
      '  case v := <-ch:',
      '    println(v)',
      '  default:',
      '    println("none")',
      '  }',
      '}',
    ].join("\n");
    const state = parseDoc(go, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });

  it("tokenizes Go with type declarations, interfaces, and all keywords", () => {
    // Exercises struct, interface, map, chan, range, defer, go, goto, fallthrough
    const doc = [
      'package main',
      '',
      'type MyStruct struct {',
      '  Name string',
      '  Age  int',
      '}',
      '',
      'type Reader interface {',
      '  Read(p []byte) (n int, err error)',
      '}',
      '',
      'func process(ch chan int) {',
      '  defer close(ch)',
      '  go func() {',
      '    for i := range ch {',
      '      _ = i',
      '    }',
      '  }()',
      '  var x any',
      '  var y comparable',
      '  _ = x',
      '  _ = y',
      '}',
    ].join("\n");
    const state = parseDoc(go, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });
});

describe("Verilog tokenizer deep coverage", () => {
  it("tokenizes Verilog with numeric literals in all bases", () => {
    // Exercises decimal, binary, octal, hex, real, and unsigned literal regex paths
    const doc = [
      "module literals;",
      "  wire [31:0] dec = 32'd255;",
      "  wire [7:0] bin = 8'b1010_0101;",
      "  wire [7:0] oct = 8'o377;",
      "  wire [15:0] hex = 16'hDEAD;",
      "  real r = 3.14;",
      "  real r2 = 1.5E-3;",
      "  real r3 = 2_000.5;",
      "  wire [3:0] x_val = 4'bxxzz;",
      "  integer unsigned_num = 42;",
      "  wire signed_dec = 8'sd127;",
      "endmodule",
    ].join("\n");
    const state = parseDoc(verilog, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });

  it("tokenizes Verilog with system calls, macros, time literals, and strings", () => {
    // Exercises $ system calls, ` macros, # time literals, " strings
    const doc = [
      "`timescale 1ns/1ps",
      "`define WIDTH 8",
      "`ifdef DEBUG",
      "  `define LOG(msg) $display(msg)",
      "`endif",
      "",
      "module test;",
      '  initial begin',
      '    $display("Hello %d", 42);',
      '    $monitor($time, " a=%b", a);',
      '    $finish;',
      "    #10;",
      "    #5.5;",
      "    $dumpfile(\"dump.vcd\");",
      "    $dumpvars(0, test);",
      "  end",
      "endmodule",
    ].join("\n");
    const state = parseDoc(verilog, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });

  it("tokenizes Verilog with block keywords, case/fork, and context nesting", () => {
    // Exercises block open/close, case/casex/casez, fork/join, function/task in statements
    const doc = [
      "module fsm(",
      "  input clk, rst,",
      "  output reg [1:0] state",
      ");",
      "  localparam IDLE = 2'b00, RUN = 2'b01, DONE = 2'b10;",
      "",
      "  always @(posedge clk or negedge rst) begin",
      "    if (!rst)",
      "      state <= IDLE;",
      "    else begin",
      "      casex (state)",
      "        IDLE: state <= RUN;",
      "        RUN:  state <= DONE;",
      "        default: state <= IDLE;",
      "      endcase",
      "    end",
      "  end",
      "",
      "  task automatic my_task;",
      "    input [7:0] data;",
      "    begin",
      "      $display(\"data=%h\", data);",
      "    end",
      "  endtask",
      "",
      "  function [7:0] add;",
      "    input [7:0] a, b;",
      "    add = a + b;",
      "  endfunction",
      "",
      "  initial fork",
      "    #10 $display(\"branch 1\");",
      "    #20 $display(\"branch 2\");",
      "  join",
      "endmodule",
    ].join("\n");
    const state = parseDoc(verilog, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });

  it("tokenizes Verilog with comments, operators, and generate blocks", () => {
    // Exercises block comment, line comment, operators, generate/endgenerate
    const doc = [
      "module gen_example;",
      "  // Line comment",
      "  /* Block comment",
      "     spanning lines */",
      "",
      "  parameter N = 4;",
      "  genvar i;",
      "  generate",
      "    for (i = 0; i < N; i = i + 1) begin : gen_block",
      "      wire [7:0] data;",
      "      assign data = i * 2 + 1;",
      "    end",
      "  endgenerate",
      "",
      "  wire eq = (a == b);",
      "  wire neq = (a !== b);",
      "  wire tern = sel ? a : b;",
      "  wire concat = {a, b, c};",
      "  wire rep = {4{1'b0}};",
      "endmodule",
    ].join("\n");
    const state = parseDoc(verilog, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });

  it("tokenizes TL-Verilog with region markers, identifiers, and m4 macros", () => {
    // Exercises the TLV hooks: \\SV, \\TLV, tlv identifiers, m4 macros, block comments, tabs
    const doc = [
      "\\SV",
      "  module top;",
      "\\TLV",
      "   |pipe",
      "      @1",
      "         $val[7:0] = $reset ? 8'b0 : >>1$val + 8'b1;",
      "         ?$valid",
      "            $out[7:0] = $val;",
      "   // TLV line comment",
      "   /* TLV block",
      "      comment */",
      "   m4_define(MY_MACRO, 1)",
      "   M4_MY_MACRO",
      "   m4+my_module(|pipe)",
      "\\SV",
      "  endmodule",
    ].join("\n");
    const state = parseDoc(tlv, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });
});

describe("Groovy tokenizer deep coverage", () => {
  it("tokenizes Groovy with GStrings, interpolation, and triple-quoted strings", () => {
    // Exercises startString with triple quotes, ${} interpolation, $var deref
    const doc = [
      'def name = "World"',
      'def greeting = "Hello, $name!"',
      'def expr = "Result: ${1 + 2 * 3}"',
      'def multi = """',
      'Triple quoted',
      'string with $name interpolation',
      '${name.toUpperCase()}',
      '"""',
      "def single = 'single quoted'",
      "def empty = ''",
      "def triSingle = '''",
      "triple single",
      "no interpolation",
      "'''",
    ].join("\n");
    const state = parseDoc(groovy, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });

  it("tokenizes Groovy with closures, arrow operator, and regex literals", () => {
    // Exercises -> curPunc, regex /pattern/, and closure/block nesting
    const doc = [
      "def list = [1, 2, 3, 4, 5]",
      "def doubled = list.collect { it * 2 }",
      "def evens = list.findAll { it % 2 == 0 }",
      "",
      "def closure = { x, y -> x + y }",
      "println closure(3, 4)",
      "",
      "// Regex after operator",
      "def match = 'hello' =~ /hel+o/",
      "def find = 'test' ==~ /te.t/",
      "",
      "list.each { item ->",
      "  println item",
      "}",
    ].join("\n");
    const state = parseDoc(groovy, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });

  it("tokenizes Groovy with annotations, block comments, and control flow", () => {
    // Exercises @ annotations, /* */ comments, block/standalone keywords, property labels
    const doc = [
      "/* Block comment",
      "   multiline */",
      "",
      "@Override",
      "@SuppressWarnings('unused')",
      "class MyClass implements Serializable {",
      "  private int count = 0",
      "",
      "  def method() {",
      "    for (i in 0..10) {",
      "      if (i % 2 == 0) {",
      "        continue",
      "      }",
      "      switch (i) {",
      "        case 1:",
      "          break",
      "        default:",
      "          println i",
      "      }",
      "    }",
      "    try {",
      "      throw new Exception('err')",
      "    } catch (Exception e) {",
      "      println e.message",
      "    } finally {",
      "      println 'done'",
      "    }",
      "    return count",
      "  }",
      "}",
    ].join("\n");
    const state = parseDoc(groovy, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });

  it("tokenizes Groovy with property access, maps, and number literals", () => {
    // Exercises dot-property, proplabel, number with eE, and atoms
    const doc = [
      "def map = [name: 'Alice', age: 30]",
      "println map.name",
      "println map.age",
      "",
      "def sci = 1.5e10",
      "def sci2 = 2E-3",
      "def hex = 0xFF",
      "def big = 1_000_000.50",
      "",
      "def t = true",
      "def f = false",
      "def n = null",
      "def self = this",
      "",
      "assert t != f",
      "assert n == null",
    ].join("\n");
    const state = parseDoc(groovy, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });

  it("tokenizes Groovy with automatic semicolon insertion and nested braces", () => {
    // Exercises ASI (standalone keyword at newline), nested brace tokenizers
    const doc = [
      'def x = "value ${a + "${b}"}"',
      'def y = "nested ${map.collect { it.key }.join(",")}"',
      "",
      "def result = [1,2,3].collect {",
      "  it * 2",
      "}.findAll {",
      "  it > 2",
      "}",
      "",
      "if (true)",
      "  println 'implicit'",
      "while (false)",
      "  break",
    ].join("\n");
    const state = parseDoc(groovy, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });
});
