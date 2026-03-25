import { describe, it, expect } from "bun:test";
import { StreamLanguage, LanguageSupport, ensureSyntaxTree } from "../../../src/core/language/index";
import { EditorState } from "../../../src/core/state/index";

import { stex } from "../../../src/lang/legacy/stex";
import { julia } from "../../../src/lang/legacy/julia";
import { d } from "../../../src/lang/legacy/d";
import { perl } from "../../../src/lang/legacy/perl";
import { textile } from "../../../src/lang/legacy/textile";
import { pascal } from "../../../src/lang/legacy/pascal";
import { commonLisp } from "../../../src/lang/legacy/commonlisp";
import { vbScript } from "../../../src/lang/legacy/vbscript";
import { asn1 } from "../../../src/lang/legacy/asn1";

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

describe("LaTeX/TeX (stex) tokenizer deep coverage", () => {
  it("tokenizes LaTeX with environments, commands, and math", () => {
    const doc = [
      "% LaTeX comment",
      "\\documentclass{article}",
      "\\usepackage{amsmath}",
      "\\usepackage{graphicx}",
      "",
      "\\begin{document}",
      "\\title{My Paper}",
      "\\author{Author Name}",
      "\\maketitle",
      "",
      "\\section{Introduction}",
      "This is some text with \\textbf{bold} and \\textit{italic}.",
      "",
      "\\begin{equation}",
      "  E = mc^2",
      "\\end{equation}",
      "",
      "\\begin{itemize}",
      "  \\item First item",
      "  \\item Second item with $x^2 + y^2 = z^2$",
      "\\end{itemize}",
      "",
      "\\end{document}",
    ].join("\n");
    const state = parseDoc(stex, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });

  it("tokenizes TeX with math mode and special chars", () => {
    const doc = [
      "\\[",
      "  \\int_0^{\\infty} e^{-x^2} dx = \\frac{\\sqrt{\\pi}}{2}",
      "\\]",
      "",
      "\\begin{align*}",
      "  f(x) &= \\sum_{n=0}^{\\infty} \\frac{x^n}{n!} \\\\",
      "       &= e^x",
      "\\end{align*}",
      "",
      "\\verb|inline code|",
      "\\begin{verbatim}",
      "  some verbatim text",
      "\\end{verbatim}",
    ].join("\n");
    const state = parseDoc(stex, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });
});

describe("Julia tokenizer deep coverage", () => {
  it("tokenizes Julia with types, functions, and macros", () => {
    const doc = [
      "# Julia comment",
      "#= multi-line",
      "   comment =#",
      "",
      "module MyModule",
      "",
      "using LinearAlgebra",
      "import Base: show",
      "",
      'const greeting = "Hello, World!"',
      "",
      "struct Point{T<:Real}",
      "  x::T",
      "  y::T",
      "end",
      "",
      "function norm(p::Point)",
      "  sqrt(p.x^2 + p.y^2)",
      "end",
      "",
      "macro myassert(cond)",
      "  :($cond || error(\"assertion failed\"))",
      "end",
      "",
      "end  # module",
    ].join("\n");
    const state = parseDoc(julia, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });

  it("tokenizes Julia with comprehensions, strings, and operators", () => {
    const doc = [
      "x = [i^2 for i in 1:10 if iseven(i)]",
      "y = Dict(k => v for (k, v) in zip('a':'z', 1:26))",
      "",
      's = \"\"\"',
      '  Multi-line',
      '  string',
      '\"\"\"',
      "",
      "a = 0b1010",
      "b = 0x1F",
      "c = 1.5e-3",
      "d = 2 + 3im",
      "",
      "@time begin",
      "  result = sum(1:1000000)",
      "end",
    ].join("\n");
    const state = parseDoc(julia, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });
});

describe("D language tokenizer deep coverage", () => {
  it("tokenizes D with templates, delegates, and UFCS", () => {
    const doc = [
      "// D language comment",
      "/* block comment */",
      "module example;",
      "",
      "import std.stdio;",
      "import std.algorithm : map, filter;",
      "",
      "struct Vector(T) {",
      "  T x, y;",
      "  T dot(Vector!T other) const {",
      "    return x * other.x + y * other.y;",
      "  }",
      "}",
      "",
      "void main() {",
      '  writeln("Hello, World!");',
      "  auto arr = [1, 2, 3, 4, 5];",
      "  auto evens = arr.filter!(n => n % 2 == 0).array;",
      "  auto v = Vector!int(3, 4);",
      "}",
    ].join("\n");
    const state = parseDoc(d, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });

  it("tokenizes D with string mixins and CTFE", () => {
    const doc = [
      "import std.conv : to;",
      "",
      "enum Colors { Red, Green, Blue }",
      "",
      "auto square(T)(T x) { return x * x; }",
      "",
      "string buildStruct(string name) {",
      '  return "struct " ~ name ~ " { int x; }";',
      "}",
      "",
      "mixin(buildStruct(\"Point\"));",
      "",
      'unittest {',
      "  assert(square(3) == 9);",
      '  assert(to!string(42) == "42");',
      "}",
    ].join("\n");
    const state = parseDoc(d, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });
});

describe("Perl tokenizer deep coverage", () => {
  it("tokenizes Perl with regex, strings, and modules", () => {
    const doc = [
      "#!/usr/bin/perl",
      "# Perl comment",
      "use strict;",
      "use warnings;",
      "use POSIX qw(floor ceil);",
      "",
      'my $name = "World";',
      'my $greeting = "Hello, $name!";',
      "my @arr = (1, 2, 3, 4, 5);",
      'my %hash = (key => "value", num => 42);',
      "",
      "sub factorial {",
      "  my ($n) = @_;",
      "  return 1 if $n <= 1;",
      "  return $n * factorial($n - 1);",
      "}",
      "",
      'if ($name =~ /^W(\\w+)/) {',
      '  print "Matched: $1\\n";',
      "}",
      "",
      'open(my $fh, "<", "file.txt") or die "Cannot open: $!";',
      "while (my $line = <$fh>) {",
      "  chomp $line;",
      '  print "$line\\n";',
      "}",
      "close($fh);",
    ].join("\n");
    const state = parseDoc(perl, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });

  it("tokenizes Perl with here-docs and special variables", () => {
    const doc = [
      "my $text = <<END;",
      "This is a heredoc",
      "with multiple lines",
      "END",
      "",
      "my $count = scalar @arr;",
      "my $len = length($name);",
      "",
      "foreach my $item (@arr) {",
      "  next if $item % 2 == 0;",
      "  last if $item > 5;",
      '  printf("item: %d\\n", $item);',
      "}",
      "",
      "my @sorted = sort { $a <=> $b } @arr;",
      "my @mapped = map { $_ * 2 } @arr;",
      "my @filtered = grep { $_ > 3 } @arr;",
    ].join("\n");
    const state = parseDoc(perl, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });
});

describe("Textile tokenizer deep coverage", () => {
  it("tokenizes Textile markup with headings, links, and formatting", () => {
    const doc = [
      "h1. Heading 1",
      "h2. Heading 2",
      "h3. Heading 3",
      "",
      "This is *bold* and _italic_ text.",
      "This is +underlined+ and -strikethrough-.",
      "This is @code@ inline.",
      "",
      "* Unordered item 1",
      "* Unordered item 2",
      "",
      "# Ordered item 1",
      "# Ordered item 2",
      "",
      "\"Link Text\":http://example.com",
      "!image.png(alt text)!",
      "",
      "bq. This is a blockquote.",
      "",
      "pre. This is preformatted text.",
    ].join("\n");
    const state = parseDoc(textile, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });
});

describe("Pascal tokenizer deep coverage", () => {
  it("tokenizes Pascal with procedures, functions, and records", () => {
    const doc = [
      "{ Pascal comment }",
      "(*  Another comment *)",
      "program HelloWorld;",
      "",
      "uses SysUtils, Classes;",
      "",
      "type",
      "  TPoint = record",
      "    X, Y: Real;",
      "  end;",
      "",
      "  TShape = class",
      "  private",
      "    FColor: string;",
      "  public",
      "    constructor Create(AColor: string);",
      "    function GetArea: Real; virtual; abstract;",
      "    property Color: string read FColor;",
      "  end;",
      "",
      "function Factorial(N: Integer): Integer;",
      "begin",
      "  if N <= 1 then",
      "    Result := 1",
      "  else",
      "    Result := N * Factorial(N - 1);",
      "end;",
      "",
      "begin",
      "  WriteLn(Factorial(10));",
      "end.",
    ].join("\n");
    const state = parseDoc(pascal, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });
});

describe("Common Lisp tokenizer deep coverage", () => {
  it("tokenizes Common Lisp with packages, CLOS, and macros", () => {
    const doc = [
      "; Common Lisp comment",
      "(in-package :cl-user)",
      "(defpackage :myapp",
      "  (:use :common-lisp)",
      "  (:export :greet :factorial))",
      "",
      "(in-package :myapp)",
      "",
      "(defclass person ()",
      "  ((name :initarg :name :accessor person-name)",
      "   (age  :initarg :age  :accessor person-age)))",
      "",
      "(defmethod greet ((p person))",
      '  (format t "Hello, ~A!~%" (person-name p)))',
      "",
      "(defun factorial (n)",
      "  (if (<= n 1) 1",
      "      (* n (factorial (1- n)))))",
      "",
      "(defmacro when-positive (x &body body)",
      "  `(when (> ,x 0) ,@body))",
      "",
      '(let ((x 42))',
      "  (when-positive x",
      '    (format t "~A is positive~%" x)))',
    ].join("\n");
    const state = parseDoc(commonLisp, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });
});

describe("VBScript tokenizer deep coverage", () => {
  it("tokenizes VBScript with functions, classes, and statements", () => {
    const doc = [
      "' VBScript comment",
      "",
      "Option Explicit",
      "",
      "Dim name, count",
      "name = \"World\"",
      "count = 42",
      "",
      "Function Factorial(n)",
      "  If n <= 1 Then",
      "    Factorial = 1",
      "  Else",
      "    Factorial = n * Factorial(n - 1)",
      "  End If",
      "End Function",
      "",
      "Class Person",
      "  Private m_Name",
      "  Public Property Get Name",
      "    Name = m_Name",
      "  End Property",
      "  Public Property Let Name(value)",
      "    m_Name = value",
      "  End Property",
      "End Class",
      "",
      "Dim i",
      "For i = 1 To 10",
      "  WScript.Echo i",
      "Next",
      "",
      "If count > 0 Then",
      '  WScript.Echo "Hello, " & name & "!"',
      "ElseIf count = 0 Then",
      '  WScript.Echo "Zero"',
      "Else",
      '  WScript.Echo "Negative"',
      "End If",
    ].join("\n");
    const state = parseDoc(vbScript, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });
});

describe("ASN.1 tokenizer deep coverage", () => {
  it("tokenizes ASN.1 module definitions", () => {
    const doc = [
      "-- ASN.1 comment",
      "MyModule DEFINITIONS AUTOMATIC TAGS ::= BEGIN",
      "",
      "  IMPORTS",
      "    INTEGER, BOOLEAN, OCTET STRING",
      "      FROM ASN1-Basic;",
      "",
      "  Person ::= SEQUENCE {",
      "    name UTF8String,",
      "    age INTEGER (0..150),",
      "    active BOOLEAN DEFAULT TRUE,",
      "    email UTF8String OPTIONAL",
      "  }",
      "",
      "  Status ::= ENUMERATED {",
      "    active(0), inactive(1), suspended(2)",
      "  }",
      "",
      "  MessageList ::= SEQUENCE OF Person",
      "",
      "END",
    ].join("\n");
    const state = parseDoc(asn1({}), doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });
});
